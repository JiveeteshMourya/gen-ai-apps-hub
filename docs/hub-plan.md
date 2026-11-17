# GenAI Apps Hub — Plan

A few small, independent GenAI apps that each connect to the user's **Personal Memory Vault** (`../personal-memory-vault`) like any third-party developer would: with their own API key, over HTTP. They work on their own, but get noticeably better with the extra context the vault provides.

- **The only contract** is the vault's `personal-memory-vault/docs/public-api.md`. Read it, and its `classification-model.md`, before building. Never import vault code.
- **Build after** vault Phase 08 (the write and context endpoints). The "Request access" button needs vault Phase 09.
- **Demo:** 2026-11-17, local only. The vault runs on `:3000`, the hub on `:3001`.

## Stack (decided)

- The existing Next.js 16 + Bun app. Read `node_modules/next/dist/docs/` before coding, as the hub's `AGENTS.md` says.
- **shadcn/ui, default style** (fresh `shadcn init`), with one accent colour per app, so the apps look clearly separate from the vault.
- **`openai`** (the official SDK), for each app's own light LLM call.
- **zod**, for env and for parsing vault responses.
- `next dev -p 3001`. **No database and no auth:** one local user. Chat history lives in client state.

## One generic pattern, many apps

Every app is the same chat-style assistant, driven by a config object (`src/apps/config.ts`):

```ts
type HubApp = {
  slug: string; // route /apps/[slug]
  name: string;
  accent: string; // tailwind colour
  persona: string; // the app's own system prompt
  vaultKeyEnv: string; // e.g. "VAULT_KEY_FITNESS"; read on the server only
  write?: Partial<WriteDefaults>; // default fields for POST /memories (domain, contentType, sensitivityFloor …)
  read?: Partial<ContextDefaults>; // default fields for POST /context (task, origin, categories, maxWords …)
};
```

Each user message runs one Server Action (`src/app/apps/[slug]/actions.ts`):

1. **Write** (if `write` is set): `POST /api/v1/memories` with `messages` (the latest turn or two), `sessionId`, `provenance: "user_stated"`, `occurredAt`, `timezone` and the app's write defaults.
2. **Read** (if `read` is set): `POST /api/v1/context` with:
   - `query`: the user's message
   - `conversation`: recent turns
   - `purpose`, `task` and `origin: "other_apps"`
   - `perspective: "third_person"`, `timezone`, `includeSources: true`
   - the app's read defaults
3. **Reply:** a light OpenAI call with the system prompt `persona` plus `"What you know about the user from their memory vault: <context>"`. An empty context means no vault section.
4. Return the reply, plus the vault's response metadata for the UI.

Vault calls go through one small client (`src/lib/vault.ts`): base URL, Bearer key, a typed request, and errors parsed from `{ error: { code, message } }`. Keys stay server-side, so nothing vault-related runs in the browser.

## UI

- `/` lists the apps as cards: name, what the app does, and whether it's connected (its key env var is set).
- `/apps/[slug]` is a chat in the app's accent, with a collapsible **"Context from vault"** panel showing the context, `coverage`, `sources` and `withheldCategories` for the last turn, and a **write receipt** (stored vs withheld counts).
  - The panel makes the privacy story visible during the demo.
  - On `403` (`read_denied` / `write_denied`), the panel says so and offers **"Request access"**, which calls `POST /api/v1/consent-requests` with a reason.

## Default apps (edit freely: the vault doesn't care which apps exist)

| App                    | Writes                                                                         | Reads                                               | Shows in the demo                                                                        |
| ---------------------- | ------------------------------------------------------------------------------ | --------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| **Fitness Coach**      | workouts, sleep (`domain: "fitness"`)                                          | `task: "plan"`; activity, sleep, mood, diet, health | Plans around the poor sleep and low mood the Journal heard about                         |
| **Journal Companion**  | journal entries (`contentType: "journal"`)                                     | `task: "personalize"`; activity, sleep, mood        | Reflects on mood using the Fitness data, which it was never told                         |
| **Health Assistant**   | symptoms, medication (`domain: "healthcare"`, `sensitivityFloor: "protected"`) | `task: "answer"`; health                            | Its `protected` data stays inside the vault: no other app sees it                        |
| **Shopping Assistant** | preferences                                                                    | `task: "recommend"`; preferences, interests, diet   | Gets the diet preferences but never the diagnosis; asks for access via a consent request |

The owner registers each app on the vault's `/dashboard/apps`, pastes its key into `.env.local`, and sets its grants and sources on `/dashboard/permissions`. That setup is part of the live demo.

## Env (`.env.local`, git-ignored; `.env.example` committed)

```
VAULT_URL=http://localhost:3000
OPENAI_API_KEY=
OPENAI_MODEL=
VAULT_KEY_FITNESS=
VAULT_KEY_JOURNAL=
VAULT_KEY_HEALTH=
VAULT_KEY_SHOPPING=
```

## Acceptance

- [ ] Each app chats with its persona even with no vault key set (vault steps are skipped).
- [ ] With keys and grants, a fact told to one app shows up in another app's "Context from vault" panel, and changes its reply.
- [ ] Unticking a source on the vault's Permissions page removes that data from the next reply.
- [ ] A 403 shows "Request access", and the request appears in the vault dashboard.
- [ ] Lint, typecheck and build pass. No vault key appears in client bundles.
