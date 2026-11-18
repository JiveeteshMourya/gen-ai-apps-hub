import type {
  VaultApiResponse,
  VaultContextRequest,
  VaultContextResponseData,
} from "../validators/vault-context.validator";
import type {
  WriteMemoryRequest,
  WriteMemoryResponseData,
} from "../validators/vault-write.validator";
import type { VaultPermissionsData } from "../validators/vault-permissions.validator";
import type { ConsentRequestResponseData } from "../validators/vault-consent.validator";
import type { RetractMemoryResponseData } from "../validators/vault-retract.validator";

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

export interface VaultPermissionsResult {
  ok: boolean;
  data?: VaultPermissionsData;
  error?: string;
  code?: string;
}

export interface VaultHealthResult {
  online: boolean;
  statusCode: number;
  message: string;
  db?: string;
}

export interface VaultConsentResult {
  ok: boolean;
  data?: ConsentRequestResponseData;
  error?: string;
  code?: string;
}

export interface VaultRetractResult {
  ok: boolean;
  deleted?: number;
  error?: string;
  code?: string;
}

// 60-second in-memory cache for app permissions
const permissionsCache = new Map<string, { data: VaultPermissionsData; expiresAt: number }>();

export const vaultClient = {
  /**
   * Checks whether the Personal Memory Vault and its database on :3000 are up (GET /api/v1/health).
   * Does not require authentication.
   */
  checkHealth: async (): Promise<VaultHealthResult> => {
    const vaultUrl = (process.env.VAULT_URL || "http://localhost:3000").replace(/\/+$/, "");

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);

      const res = await fetch(`${vaultUrl}/api/v1/health`, {
        method: "GET",
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      const json = await res.json().catch(() => null);

      if (res.ok && json?.success) {
        return {
          online: true,
          statusCode: res.status,
          message: json.message || "Vault is up",
          db: json.data?.db || "ok",
        };
      }

      return {
        online: false,
        statusCode: res.status,
        message: json?.message || `Vault returned HTTP ${res.status}`,
        db: json?.data?.db || "error",
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return {
        online: false,
        statusCode: 0,
        message: `Could not connect to Personal Memory Vault at ${vaultUrl} (${msg})`,
      };
    }
  },

  /**
   * Fetches what the calling app is permitted to read and write (GET /api/v1/permissions).
   * Caches response for 60 seconds.
   */
  fetchPermissions: async (appId: string, forceFresh = false): Promise<VaultPermissionsResult> => {
    const now = Date.now();
    if (!forceFresh) {
      const cached = permissionsCache.get(appId);
      if (cached && now < cached.expiresAt) {
        return { ok: true, data: cached.data };
      }
    }

    const vaultUrl = (process.env.VAULT_URL || "http://localhost:3000").replace(/\/+$/, "");
    const apiKey = getAppVaultKey(appId);

    if (!apiKey) {
      return {
        ok: false,
        error: `No vault API key found for app "${appId}".`,
        code: "missing_api_key",
      };
    }

    try {
      const endpoint = `${vaultUrl}/api/v1/permissions`;
      const res = await fetch(endpoint, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      });

      const body = (await res.json()) as VaultApiResponse<VaultPermissionsData>;

      if (!res.ok || !body.success) {
        return {
          ok: false,
          error: body.message || `Permissions check returned HTTP ${res.status}`,
          code: body.code,
        };
      }

      permissionsCache.set(appId, { data: body.data, expiresAt: now + 60_000 });

      return {
        ok: true,
        data: body.data,
      };
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      return {
        ok: false,
        error: `Permissions connection error: ${errMsg}`,
        code: "connection_error",
      };
    }
  },

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
      return {
        ok: false,
        error: `Vault connection error: ${errMsg}`,
        code: "connection_error",
      };
    }
  },

  /**
   * Requests new access / permissions from the vault owner (POST /api/v1/consent-requests).
   * Appears on the owner's vault dashboard for approval.
   */
  createConsentRequest: async (
    appId: string,
    payload: {
      operation: "read" | "write";
      categories: string[];
      maxSensitivity?: "shareable" | "personal" | "private" | "protected";
      reason: string;
    }
  ): Promise<VaultConsentResult> => {
    const vaultUrl = (process.env.VAULT_URL || "http://localhost:3000").replace(/\/+$/, "");
    const apiKey = getAppVaultKey(appId);

    if (!apiKey) {
      return {
        ok: false,
        error: `No vault API key found for app "${appId}".`,
        code: "missing_api_key",
      };
    }

    try {
      const endpoint = `${vaultUrl}/api/v1/consent-requests`;
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          operation: payload.operation,
          categories: payload.categories,
          maxSensitivity: payload.maxSensitivity ?? "personal",
          reason: payload.reason,
        }),
      });

      const body = (await res.json()) as VaultApiResponse<ConsentRequestResponseData>;

      if (!res.ok || !body.success) {
        return {
          ok: false,
          error: body.message || `Consent request returned HTTP ${res.status}`,
          code: body.code,
        };
      }

      return {
        ok: true,
        data: body.data,
      };
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      return {
        ok: false,
        error: `Consent request connection error: ${errMsg}`,
        code: "connection_error",
      };
    }
  },

  /**
   * Permanently retracts memories written by this app from the vault (DELETE /api/v1/memories).
   */
  retractMemories: async (
    appId: string,
    payload: { ids?: string[]; externalIds?: string[]; sessionId?: string }
  ): Promise<VaultRetractResult> => {
    const vaultUrl = (process.env.VAULT_URL || "http://localhost:3000").replace(/\/+$/, "");
    const apiKey = getAppVaultKey(appId);

    if (!apiKey) {
      return {
        ok: false,
        error: `No vault API key found for app "${appId}".`,
        code: "missing_api_key",
      };
    }

    try {
      const endpoint = `${vaultUrl}/api/v1/memories`;
      const res = await fetch(endpoint, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(payload),
      });

      const body = (await res.json()) as VaultApiResponse<RetractMemoryResponseData>;

      if (!res.ok || !body.success) {
        return {
          ok: false,
          error: body.message || `Retract memories returned HTTP ${res.status}`,
          code: body.code,
        };
      }

      return {
        ok: true,
        deleted: body.data?.deleted ?? 0,
      };
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      return {
        ok: false,
        error: `Retract memories connection error: ${errMsg}`,
        code: "connection_error",
      };
    }
  },
};
