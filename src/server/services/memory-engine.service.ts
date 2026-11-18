import { openai } from "@/server/lib/ai";
import {
  vaultClient,
  type VaultFetchResult,
  type VaultWriteResult,
} from "@/server/lib/vault-client";
import { memoryChatRepository } from "@/server/repository/memory-chat.repository";
import { getAppConfig, type AppConfig } from "@/shared/constants/apps.constants";
import { SYSTEM_PROMPT } from "@/shared/constants/chat.constants";
import {
  MEMORY_CATEGORIES,
  vaultContextRequestSchema,
  type MemoryCategory,
  type VaultContextRequest,
} from "../validators/vault-context.validator";
import {
  MEMORY_CONTENT_TYPES,
  writeMemorySchema,
  type MemoryContentType,
  type WriteMemoryRequest,
} from "../validators/vault-write.validator";

const VAULT_QUERY_BUILDER_PROMPT = `You are an expert query generator for a Personal Memory Vault (docs/public-api.md).
The vault stores personal facts, history, preferences, goals, and constraints across various apps.
When given a user's current message, recent conversation history, and the host app's persona, generate a strictly valid JSON object to query the vault context endpoint (POST /api/v1/context).

Valid JSON structure to output:
{
  "query": "A clear, specific natural language query asking what we need to know about the user (max 2000 chars, required)",
  "purpose": "A concise description of why this context is needed (max 200 chars)",
  "task": "One of: 'personalize' | 'answer' | 'recommend' | 'plan' | 'summarize_profile' | 'check_constraints'",
  "categories": ["optional array of 1 to 16 valid categories from: 'identity', 'preferences', 'goals', 'interests', 'activity', 'sleep', 'diet', 'health', 'mood', 'work', 'education', 'social', 'relationships', 'finance', 'travel', 'other'. If unsure, omit this field"],
  "origin": "One of: 'any' | 'other_apps' | 'this_app' (default 'other_apps' to discover cross-app memory)",
  "recency": "One of: 'recent' | 'balanced' | 'all_time'",
  "maxChars": 100,
  "perspective": "third_person",
  "includeSources": true
}

Rules:
1. "query" MUST be a direct question asking for relevant user facts/history (e.g. "What are the user's workout preferences, recent routines, or physical constraints?").
2. Only use valid categories from the list above. Never make up new categories. If unsure, omit "categories" so all granted categories are searched.
3. Keep maxChars at 100.
4. Output ONLY valid JSON matching this schema.`;

const MEMORY_EXTRACTION_PROMPT = `You are a personal memory extractor for a Personal Memory Vault (docs/public-api.md).
Analyze the user's input and extract any personal facts, statements, habits, routines, physical conditions, goals, background, or life experiences stated by the user that should be remembered across apps.

Output a strictly valid JSON object:
{
  "hasFacts": true, // false if message contains NO personal facts (e.g. greetings, generic queries like "What is Python?", chit-chat)
  "content": "Clear, concise declarative factual statement(s) describing what the user stated about themselves (max 8000 chars)",
  "contentType": "observation", // one of: "note", "conversation", "journal", "event", "observation", "summary", "profile"
  "importance": 3, // integer 1 to 5
  "categoryHints": ["activity", "health"] // optional array of valid categories: "identity", "preferences", "goals", "interests", "activity", "sleep", "diet", "health", "mood", "work", "education", "social", "relationships", "finance", "travel", "other"
}

Rules:
1. If the user message contains NO personal facts about themselves, set "hasFacts": false.
2. Only extract information directly stated or clearly implied by the user about their life, body, schedule, preferences, or goals.
3. "categoryHints" must only use valid categories from the list above.
4. Return ONLY valid JSON.`;

function getAppDomain(appId: string): string {
  switch (appId) {
    case "fitness-coach":
      return "fitness";
    case "wearable-health":
    case "medical-assistant":
      return "healthcare";
    case "study-mentor":
      return "education";
    case "youtube-companion":
      return "interests";
    default:
      return "general";
  }
}

export const memoryEngineService = {
  /**
   * Step 1 (Read): Use a small GPT model to transform the user message into a strictly valid Zod object
   * for the Personal Memory Vault's POST /api/v1/context endpoint.
   */
  buildContextRequest: async (
    appConfig: AppConfig | undefined,
    userMessage: string,
    recentMessages: Array<{ role: string; content: string }>
  ): Promise<VaultContextRequest> => {
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: VAULT_QUERY_BUILDER_PROMPT },
          {
            role: "user",
            content: JSON.stringify({
              app: appConfig
                ? {
                    id: appConfig.id,
                    name: appConfig.name,
                    tagline: appConfig.tagline,
                    description: appConfig.description,
                  }
                : { name: "Assistant" },
              recentTurns: recentMessages.slice(-4).map(m => ({
                role: m.role,
                content: m.content,
              })),
              userMessage,
            }),
          },
        ],
      });

      const rawContent = completion.choices[0].message.content ?? "{}";
      const parsed = JSON.parse(rawContent) as Record<string, unknown>;

      // Clean and sanitize the object before validating with Zod
      const cleaned: Record<string, unknown> = {
        query:
          typeof parsed.query === "string" && parsed.query.trim().length > 0
            ? parsed.query.trim().slice(0, 2000)
            : userMessage.slice(0, 2000),
        perspective: "third_person",
        includeSources: true,
        maxChars: 100,
        origin: parsed.origin === "this_app" ? "this_app" : "other_apps",
      };

      if (typeof parsed.purpose === "string" && parsed.purpose.trim()) {
        cleaned.purpose = parsed.purpose.trim().slice(0, 200);
      } else if (appConfig) {
        cleaned.purpose = `${appConfig.shortName} personalization`.slice(0, 200);
      }

      if (
        typeof parsed.task === "string" &&
        [
          "personalize",
          "answer",
          "recommend",
          "plan",
          "summarize_profile",
          "check_constraints",
        ].includes(parsed.task)
      ) {
        cleaned.task = parsed.task;
      } else {
        cleaned.task = "personalize";
      }

      if (Array.isArray(parsed.categories)) {
        const validCats = parsed.categories.filter((c: unknown): c is MemoryCategory =>
          MEMORY_CATEGORIES.includes(c as MemoryCategory)
        );
        if (validCats.length > 0) {
          cleaned.categories = validCats.slice(0, 16);
        }
      }

      if (
        typeof parsed.recency === "string" &&
        ["recent", "balanced", "all_time"].includes(parsed.recency)
      ) {
        cleaned.recency = parsed.recency;
      }

      // Strict validation through Zod
      return vaultContextRequestSchema.parse(cleaned);
    } catch (err) {
      console.warn(
        "[MemoryEngineService] Failed to generate structured context query with small GPT model:",
        err
      );
      // Resilient fallback strictly matching the Zod schema
      return vaultContextRequestSchema.parse({
        query: userMessage.slice(0, 2000),
        purpose: appConfig ? `${appConfig.shortName} context` : "App context",
        task: "personalize",
        origin: "other_apps",
        perspective: "third_person",
        includeSources: true,
        maxChars: 100,
      });
    }
  },

  /**
   * Step 2 (Write): Use a very small OpenAI call to extract personal info/memories from user input,
   * validate strictly with Zod, and store into the Personal Memory Vault via POST /api/v1/memories.
   */
  extractAndStoreMemory: async (
    appId: string,
    appConfig: AppConfig | undefined,
    userMessage: string
  ): Promise<VaultWriteResult | null> => {
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: MEMORY_EXTRACTION_PROMPT },
          {
            role: "user",
            content: JSON.stringify({
              appDomain: appConfig ? getAppDomain(appConfig.id) : "general",
              userMessage,
            }),
          },
        ],
      });

      const rawContent = completion.choices[0].message.content ?? "{}";
      const parsed = JSON.parse(rawContent) as Record<string, unknown>;

      // If no personal facts were stated, do not write empty memory
      if (!parsed.hasFacts || typeof parsed.content !== "string" || !parsed.content.trim()) {
        return null;
      }

      // Filter categoryHints against valid memory taxonomy
      let validHints: MemoryCategory[] | undefined = undefined;
      if (Array.isArray(parsed.categoryHints)) {
        const filtered = parsed.categoryHints.filter((c: unknown): c is MemoryCategory =>
          MEMORY_CATEGORIES.includes(c as MemoryCategory)
        );
        if (filtered.length > 0) {
          validHints = filtered.slice(0, 16);
        }
      }

      const contentType: MemoryContentType =
        typeof parsed.contentType === "string" &&
        MEMORY_CONTENT_TYPES.includes(parsed.contentType as MemoryContentType)
          ? (parsed.contentType as MemoryContentType)
          : "observation";

      const importance =
        typeof parsed.importance === "number" && parsed.importance >= 1 && parsed.importance <= 5
          ? Math.round(parsed.importance)
          : 3;

      // Construct and strictly validate write payload with Zod
      const writePayload: WriteMemoryRequest = writeMemorySchema.parse({
        content: parsed.content.trim().slice(0, 8000),
        contentType,
        mode: "extract",
        provenance: "user_stated",
        importance,
        domain: appConfig ? getAppDomain(appConfig.id) : undefined,
        categoryHints: validHints,
        visibility: "shared",
        dryRun: false,
      });

      // Send to Memory Engine POST /api/v1/memories
      const writeResult = await vaultClient.storeMemory(appId, writePayload);
      if (writeResult.ok) {
        console.log(
          `[MemoryEngineService] Successfully stored memory for "${appId}": ${writeResult.data?.stored.length ?? 0} facts saved.`
        );
      }
      return writeResult;
    } catch (err) {
      console.warn("[MemoryEngineService] Failed to extract or store memory in vault:", err);
      return null;
    }
  },

  /**
   * Complete pipeline for the Memory Engine chat widget:
   * 1. Save user input into memory_messages.
   * 2. In parallel:
   *    a) Extract facts with small OpenAI model -> validate with Zod -> call POST /api/v1/memories.
   *    b) Build context request with small GPT model -> validate with Zod -> call POST /api/v1/context.
   * 3. Inject memory engine response + last 5 messages + user input into second OpenAI call.
   * 4. Save assistant reply in memory_messages and return response for the UI.
   */
  processChat: async (
    appId: string,
    message: string
  ): Promise<{
    reply: string;
    context: string | null;
    metadata: Record<string, unknown> | null;
  }> => {
    // 1. Insert user message in memory_messages DB model
    await memoryChatRepository.insertUser(appId, message);

    // Fetch the recent turns for context window (last 5 messages)
    const recent = await memoryChatRepository.getRecentByApp(appId);
    const appConfig = getAppConfig(appId);
    const baseSystemPrompt = appConfig ? appConfig.systemPrompt : SYSTEM_PROMPT;

    // 2. FIRST: Query the Memory Engine for prior context.
    // Build context request with small GPT model and retrieve context from the vault.
    const contextRequest = await memoryEngineService.buildContextRequest(
      appConfig,
      message,
      recent
    );
    const vaultResult: VaultFetchResult = await vaultClient.fetchContext(appId, contextRequest);
    const vaultContext = vaultResult.ok && vaultResult.context ? vaultResult.context.trim() : "";

    // 3. AFTER the context query has ended, extract and store new facts into the Memory Engine.
    // This guarantees the Memory Engine never returns back information that the user just provided in this current turn.
    const writeResultPromise = memoryEngineService.extractAndStoreMemory(appId, appConfig, message);

    // 4. Inject retrieved memory context + last 5 messages + user input into second OpenAI call
    let injectedSystemPrompt = baseSystemPrompt;
    if (vaultContext) {
      injectedSystemPrompt += `\n\nWhat you know about the user from their Personal Memory Vault:\n${vaultContext}\n\nUse this personal context naturally to deliver a tailored response.`;
    }

    const [writeResult, completion] = await Promise.all([
      writeResultPromise,
      openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: injectedSystemPrompt },
          ...recent.map(m => ({
            role: m.role as "user" | "assistant",
            content: m.content,
          })),
        ],
      }),
    ]);

    const reply = completion.choices[0].message.content ?? "";

    // 6. Aggregate metadata (sources, coverage, write receipt)
    const combinedMetadata: Record<string, unknown> = {};
    if (vaultResult.data) {
      combinedMetadata.sources = vaultResult.data.sources;
      combinedMetadata.coverage = vaultResult.data.coverage;
      combinedMetadata.withheldCategories = vaultResult.data.withheldCategories;
    }
    if (writeResult?.data) {
      combinedMetadata.storedMemoriesCount = writeResult.data.stored.length;
      combinedMetadata.withheldMemories = writeResult.data.withheld;
    }

    // Save assistant reply and memory context in memory_messages DB model
    await memoryChatRepository.insertAssistant(
      appId,
      reply,
      vaultContext || null,
      Object.keys(combinedMetadata).length > 0 ? combinedMetadata : null
    );

    return {
      reply,
      context: vaultContext || null,
      metadata: Object.keys(combinedMetadata).length > 0 ? combinedMetadata : null,
    };
  },
};
