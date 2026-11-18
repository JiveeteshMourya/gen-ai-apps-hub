import { z } from "zod";
import { MEMORY_CATEGORIES } from "./vault-context.validator";
import { SENSITIVITY_TIERS } from "./vault-write.validator";

export const vaultGrantSchema = z.object({
  category: z.enum(MEMORY_CATEGORIES),
  maxSensitivity: z.enum(SENSITIVITY_TIERS),
});

export type VaultGrant = z.infer<typeof vaultGrantSchema>;

export const vaultPermissionsDataSchema = z.object({
  app: z.object({
    id: z.string(),
    name: z.string(),
  }),
  write: z.array(vaultGrantSchema),
  read: z.array(vaultGrantSchema),
  sources: z.object({
    ownEntries: z.boolean(),
    thisApp: z.boolean(),
    otherAppsCount: z.number(),
  }),
  taxonomy: z.object({
    categories: z.array(
      z.object({
        id: z.string(),
        label: z.string(),
        description: z.string(),
      })
    ),
    sensitivities: z.array(
      z.object({
        id: z.string(),
        label: z.string(),
        description: z.string(),
      })
    ),
  }),
});

export type VaultPermissionsData = z.infer<typeof vaultPermissionsDataSchema>;
