import type {
  VaultApiResponse,
  VaultContextRequest,
  VaultContextResponseData,
} from "../validators/vault-context.validator";
import type {
  WriteMemoryRequest,
  WriteMemoryResponseData,
} from "../validators/vault-write.validator";

/**
 * Hardcoded API keys for each Hub app connecting to the Personal Memory Vault.
 */
export const HARDCODED_VAULT_KEYS: Record<string, string> = {
  "study-mentor": "pmv_3TY96-2s-RJwAXW1vDr6flYTawfz5MY-o1XjbEZ5H20",
  "fitness-coach": "pmv_Bco8jAc_MKjZwtdvRx47lDse_kjgPxaReRhM6hohxUo",
  "wearable-health": "pmv_w9ijoKYM-gqqjFoxl1YCbPW7UE1WchgByhUpwmqNHFE",
  "medical-assistant": "pmv_bthhONTBHjxq4-QS_fIgEDJgzpyKJyGXWKdVOed7yS8",
  "youtube-companion": "pmv_stYW4jROsjGCVb-opuSLZfVWMqUHs4E7kA2IC481ums",
};

export function getAppVaultKey(appId: string): string | undefined {
  if (HARDCODED_VAULT_KEYS[appId]) {
    return HARDCODED_VAULT_KEYS[appId];
  }

  const normalized = appId.toUpperCase().replace(/-/g, "_");
  const parts = normalized.split("_");

  const candidates = [
    process.env[`VAULT_KEY_${normalized}`],
    parts[0] ? process.env[`VAULT_KEY_${parts[0]}`] : undefined,
    parts[1] ? process.env[`VAULT_KEY_${parts[1]}`] : undefined,
    process.env.VAULT_API_KEY,
    process.env.VAULT_KEY,
  ];

  return candidates.find(k => typeof k === "string" && k.trim().length > 0)?.trim();
}

export interface VaultFetchResult {
  ok: boolean;
  context: string;
  data?: VaultContextResponseData;
  error?: string;
  code?: string;
}

export interface VaultWriteResult {
  ok: boolean;
  data?: WriteMemoryResponseData;
  error?: string;
  code?: string;
}

export const vaultClient = {
  /**
   * Queries the Personal Memory Vault for context using the app's Bearer API key.
   * Following docs/public-api.md: POST ${VAULT_URL}/api/v1/context
   */
  fetchContext: async (
    appId: string,
    requestPayload: VaultContextRequest
  ): Promise<VaultFetchResult> => {
    const vaultUrl = (process.env.VAULT_URL || "http://localhost:3000").replace(/\/+$/, "");
    const apiKey = getAppVaultKey(appId);

    if (!apiKey) {
      console.warn(`[VaultClient] No vault API key configured for app "${appId}".`);
      return {
        ok: false,
        context: "",
        error: `No vault API key found for app "${appId}".`,
        code: "missing_api_key",
      };
    }

    try {
      const endpoint = `${vaultUrl}/api/v1/context`;
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(requestPayload),
      });

      const body = (await res.json()) as VaultApiResponse<VaultContextResponseData>;

      if (!res.ok || !body.success) {
        console.warn(
          `[VaultClient] Memory vault returned ${res.status} (${body.code || "error"}): ${body.message}`
        );
        return {
          ok: false,
          context: "",
          error: body.message || `Vault returned HTTP ${res.status}`,
          code: body.code,
        };
      }

      return {
        ok: true,
        context: body.data.context || "",
        data: body.data,
      };
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      console.warn(`[VaultClient] Could not reach memory vault at ${vaultUrl}: ${errMsg}`);
      return {
        ok: false,
        context: "",
        error: `Vault connection error: ${errMsg}`,
        code: "connection_error",
      };
    }
  },

  /**
   * Stores memories in the Personal Memory Vault using the app's Bearer API key.
   * Following docs/public-api.md: POST ${VAULT_URL}/api/v1/memories
   */
  storeMemory: async (
    appId: string,
    requestPayload: WriteMemoryRequest
  ): Promise<VaultWriteResult> => {
    const vaultUrl = (process.env.VAULT_URL || "http://localhost:3000").replace(/\/+$/, "");
    const apiKey = getAppVaultKey(appId);

    if (!apiKey) {
      console.warn(`[VaultClient] No vault API key configured for storing memory in "${appId}".`);
      return {
        ok: false,
        error: `No vault API key found for app "${appId}".`,
        code: "missing_api_key",
      };
    }

    try {
      const endpoint = `${vaultUrl}/api/v1/memories`;
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(requestPayload),
      });

      const body = (await res.json()) as VaultApiResponse<WriteMemoryResponseData>;

      if (!res.ok || !body.success) {
        console.warn(
          `[VaultClient] Memory vault write returned ${res.status} (${body.code || "error"}): ${body.message}`
        );
        return {
          ok: false,
          error: body.message || `Vault write returned HTTP ${res.status}`,
          code: body.code,
        };
      }

      return {
        ok: true,
        data: body.data,
      };
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      console.warn(`[VaultClient] Could not reach memory vault write at ${vaultUrl}: ${errMsg}`);
      return {
        ok: false,
        error: `Vault connection error: ${errMsg}`,
        code: "connection_error",
      };
    }
  },
};
