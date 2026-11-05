import { config as loadEnv } from "dotenv";
import { z } from "zod";

loadEnv();

const schema = z.object({
  PORT: z.coerce.number().default(3978),
  CLIENT_TENANT_ID: z.string().min(1).optional(),
  ENVIRONMENT_ID: z.string().min(1).optional(),
  SCHEMA_NAME: z.string().min(1).optional(),
  APP_CLIENT_ID: z.string().min(1).optional(),
  DIRECT_CONNECT_URL: z.string().url().optional(),
  BRIDGE_API_KEY: z.string().min(8).optional(),
  /**
   * When true (default if credentials incomplete), the bridge answers locally
   * without calling Copilot Studio — useful for IDE bring-up.
   */
  MOCK_MODE: z
    .string()
    .optional()
    .transform((v) => v === "1" || v === "true"),
});

const parsed = schema.parse(process.env);

const hasDirect = Boolean(parsed.DIRECT_CONNECT_URL);
const hasIds = Boolean(
  parsed.ENVIRONMENT_ID && parsed.SCHEMA_NAME && parsed.CLIENT_TENANT_ID && parsed.APP_CLIENT_ID,
);

export const appConfig = {
  port: parsed.PORT,
  clientTenantId: parsed.CLIENT_TENANT_ID,
  environmentId: parsed.ENVIRONMENT_ID,
  schemaName: parsed.SCHEMA_NAME,
  appClientId: parsed.APP_CLIENT_ID,
  directConnectUrl: parsed.DIRECT_CONNECT_URL,
  bridgeApiKey: parsed.BRIDGE_API_KEY,
  mockMode: parsed.MOCK_MODE ?? !(hasDirect || hasIds),
  canCallCopilotStudio: hasDirect || hasIds,
};
