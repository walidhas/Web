import { exec } from "node:child_process";
import { promisify } from "node:util";
import {
  ConfidentialClientApplication,
  PublicClientApplication,
  type AccountInfo,
  type Configuration,
  type DeviceCodeRequest,
} from "@azure/msal-node";
import { appConfig } from "./config.js";

const execAsync = promisify(exec);
const delegatedScopes = ["https://api.powerplatform.com/CopilotStudio.Copilots.Invoke"];

let cachedAccount: AccountInfo | undefined;
let publicClient: PublicClientApplication | undefined;

/**
 * Acquires a Power Platform token for Copilot Studio invoke.
 * Modes: client_credentials (secret) | interactive (browser) | device_code.
 */
export async function acquireCopilotStudioToken(): Promise<string> {
  if (!appConfig.appClientId || !appConfig.clientTenantId) {
    throw new Error("APP_CLIENT_ID and CLIENT_TENANT_ID are required outside MOCK_MODE");
  }

  switch (appConfig.authMode) {
    case "client_credentials":
      return acquireClientCredentialToken();
    case "device_code":
      return acquireDeviceCodeToken();
    case "interactive":
    default:
      return acquireInteractiveToken();
  }
}

function getPublicClient(): PublicClientApplication {
  if (publicClient) return publicClient;
  const msalConfig: Configuration = {
    auth: {
      clientId: appConfig.appClientId!,
      authority: `https://login.microsoftonline.com/${appConfig.clientTenantId}`,
    },
  };
  publicClient = new PublicClientApplication(msalConfig);
  return publicClient;
}

async function openSystemBrowser(url: string): Promise<void> {
  console.log(`[bridge] Opening browser for login:\n${url}`);
  if (process.platform === "win32") {
    await execAsync(`cmd /c start "" "${url.replace(/"/g, "")}"`);
    return;
  }
  if (process.platform === "darwin") {
    await execAsync(`open "${url.replace(/"/g, "")}"`);
    return;
  }
  await execAsync(`xdg-open "${url.replace(/"/g, "")}"`);
}

async function acquireInteractiveToken(): Promise<string> {
  const pca = getPublicClient();

  if (cachedAccount) {
    try {
      const silent = await pca.acquireTokenSilent({
        account: cachedAccount,
        scopes: delegatedScopes,
      });
      if (silent?.accessToken) {
        console.log("[bridge] auth mode=interactive (silent cache)");
        return silent.accessToken;
      }
    } catch {
      // fall through to interactive
    }
  }

  console.log("[bridge] auth mode=interactive (browser) — complete login in the opened window");
  const result = await pca.acquireTokenInteractive({
    scopes: delegatedScopes,
    openBrowser: openSystemBrowser,
    successTemplate:
      "<html><body style='font-family:sans-serif;padding:2rem'><h2>HSO bridge — login OK</h2><p>You can close this tab and return to the IDE.</p></body></html>",
    errorTemplate:
      "<html><body style='font-family:sans-serif;padding:2rem'><h2>HSO bridge — login failed</h2><p>{{error}}</p></body></html>",
  });

  if (!result?.accessToken) {
    throw new Error("Failed to acquire Copilot Studio access token (interactive)");
  }
  cachedAccount = result.account ?? undefined;
  return result.accessToken;
}

async function acquireClientCredentialToken(): Promise<string> {
  if (!appConfig.appClientSecret) {
    throw new Error("APP_CLIENT_SECRET is required for client_credentials auth");
  }

  const msalConfig: Configuration = {
    auth: {
      clientId: appConfig.appClientId!,
      authority: `https://login.microsoftonline.com/${appConfig.clientTenantId}`,
      clientSecret: appConfig.appClientSecret,
    },
  };

  const cca = new ConfidentialClientApplication(msalConfig);
  const result = await cca.acquireTokenByClientCredential({
    scopes: ["https://api.powerplatform.com/.default"],
  });

  if (!result?.accessToken) {
    throw new Error("Failed to acquire Copilot Studio access token (client credentials)");
  }

  console.log("[bridge] auth mode=client_credentials");
  return result.accessToken;
}

async function acquireDeviceCodeToken(): Promise<string> {
  const pca = getPublicClient();
  const deviceCodeRequest: DeviceCodeRequest = {
    scopes: delegatedScopes,
    deviceCodeCallback: (response) => {
      console.log(response.message);
    },
  };

  console.log("[bridge] auth mode=device_code");
  const result = await pca.acquireTokenByDeviceCode(deviceCodeRequest);
  if (!result?.accessToken) {
    throw new Error("Failed to acquire Copilot Studio access token (device code)");
  }
  cachedAccount = result.account ?? undefined;
  return result.accessToken;
}
