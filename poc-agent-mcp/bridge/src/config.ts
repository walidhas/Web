import { config as loadEnv } from "dotenv";
import { z } from "zod";

loadEnv();

/**
 * Copilot Studio "Microsoft 365 Agents SDK" connection string is either:
 * - a DirectConnect HTTPS URL, or
 * - a semicolon-separated bag (DirectConnectUrl=...;EnvironmentId=...;SchemaName=...;TenantId=...)
 */
function parseConnectionBag(raw: string | undefined): {
  directConnectUrl?: string;
  environmentId?: string;
  schemaName?: string;
  tenantId?: string;
} {
  if (!raw?.trim()) return {};
  const value = raw.trim();

  if (value.startsWith("https://") && !value.includes(";")) {
    return { directConnectUrl: value };
  }

  const map: Record<string, string> = {};
  for (const part of value.split(";")) {
    const idx = part.indexOf("=");
    if (idx <= 0) continue;
    const key = part.slice(0, idx).trim().toLowerCase();
    const val = part.slice(idx + 1).trim();
    if (key && val) map[key] = val;
  }

  return {
    directConnectUrl: map.directconnecturl ?? map.directconnect ?? undefined,
    environmentId: map.environmentid ?? map.environment ?? undefined,
    schemaName: map.schemaname ?? map.agentidentifier ?? map.schema ?? undefined,
    tenantId: map.tenantid ?? map.tenant ?? undefined,
  };
}

const schema = z.object({
  PORT: z.coerce.number().default(3978),
  CLIENT_TENANT_ID: z.string().min(1).optional(),
  ENVIRONMENT_ID: z.string().min(1).optional(),
  SCHEMA_NAME: z.string().min(1).optional(),
  APP_CLIENT_ID: z.string().min(1).optional(),
  /** When set with AUTH_MODE=client_credentials, uses app-only token */
  APP_CLIENT_SECRET: z.string().min(1).optional(),
  /**
   * interactive = browser (piste 2, Delegated) — default when no secret
   * device_code = device code (Delegated)
   * client_credentials = app secret (needs Application permission)
   */
  AUTH_MODE: z.enum(["interactive", "device_code", "client_credentials"]).optional(),
  DIRECT_CONNECT_URL: z.string().min(1).optional(),
  CONNECTION_STRING: z.string().min(1).optional(),
  BRIDGE_API_KEY: z.string().min(8).optional(),
  MOCK_MODE: z
    .string()
    .optional()
    .transform((v) => v === "1" || v === "true"),
});

const parsed = schema.parse(process.env);
const fromConn = parseConnectionBag(parsed.CONNECTION_STRING ?? parsed.DIRECT_CONNECT_URL);

const clientTenantId = parsed.CLIENT_TENANT_ID ?? fromConn.tenantId;
const environmentId = parsed.ENVIRONMENT_ID ?? fromConn.environmentId;
const schemaName = parsed.SCHEMA_NAME ?? fromConn.schemaName;
const directConnectUrl = fromConn.directConnectUrl;

const hasDirect = Boolean(directConnectUrl);
const hasIds = Boolean(
  environmentId &&
    schemaName &&
    clientTenantId &&
    parsed.APP_CLIENT_ID &&
    !environmentId.includes("REPLACE") &&
    !schemaName.includes("REPLACE") &&
    clientTenantId !== "00000000-0000-0000-0000-000000000000" &&
    parsed.APP_CLIENT_ID !== "00000000-0000-0000-0000-000000000000",
);

const authMode =
  parsed.AUTH_MODE ??
  (parsed.APP_CLIENT_SECRET ? ("client_credentials" as const) : ("interactive" as const));

export const appConfig = {
  port: parsed.PORT,
  clientTenantId,
  environmentId,
  schemaName,
  appClientId: parsed.APP_CLIENT_ID,
  appClientSecret: parsed.APP_CLIENT_SECRET,
  directConnectUrl,
  bridgeApiKey: parsed.BRIDGE_API_KEY,
  mockMode: parsed.MOCK_MODE ?? !(hasDirect || hasIds),
  canCallCopilotStudio: hasDirect || hasIds,
  authMode,
};
