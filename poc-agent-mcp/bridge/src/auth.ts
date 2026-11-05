import {
  PublicClientApplication,
  type Configuration,
  type DeviceCodeRequest,
} from "@azure/msal-node";
import { appConfig } from "./config.js";

/**
 * Interactive device-code token for Power Platform Copilot Studio invoke.
 * For production, prefer a confidential client + managed identity / certificate
 * once application permissions are granted on the client tenant.
 */
export async function acquireCopilotStudioToken(): Promise<string> {
  if (!appConfig.appClientId || !appConfig.clientTenantId) {
    throw new Error("APP_CLIENT_ID and CLIENT_TENANT_ID are required outside MOCK_MODE");
  }

  const msalConfig: Configuration = {
    auth: {
      clientId: appConfig.appClientId,
      authority: `https://login.microsoftonline.com/${appConfig.clientTenantId}`,
    },
  };

  const pca = new PublicClientApplication(msalConfig);

  // Audience for Power Platform / Copilot Studio invoke (public cloud).
  const scopes = ["https://api.powerplatform.com/.default"];

  const deviceCodeRequest: DeviceCodeRequest = {
    scopes,
    deviceCodeCallback: (response) => {
      console.log(response.message);
    },
  };

  const result = await pca.acquireTokenByDeviceCode(deviceCodeRequest);
  if (!result?.accessToken) {
    throw new Error("Failed to acquire Copilot Studio access token");
  }
  return result.accessToken;
}
