import { CopilotStudioClient } from "@microsoft/agents-copilotstudio-client";
import { acquireCopilotStudioToken } from "./auth.js";
import { appConfig } from "./config.js";

type ConversationMap = Map<string, string>;

const conversationIds: ConversationMap = new Map();

function buildSettings() {
  if (appConfig.directConnectUrl) {
    return { directConnectUrl: appConfig.directConnectUrl };
  }
  return {
    environmentId: appConfig.environmentId!,
    agentIdentifier: appConfig.schemaName!,
  };
}

/**
 * Forwards a user utterance to the Symbio Copilot Studio agent and returns reply texts.
 */
export async function askSymbioAgent(
  facadeConversationId: string,
  userText: string,
): Promise<string[]> {
  if (appConfig.mockMode || !appConfig.canCallCopilotStudio) {
    return [
      `[MOCK] Bridge OK. Message reçu: "${userText}". ` +
        `Renseigne ENVIRONMENT_ID / SCHEMA_NAME / CLIENT_TENANT_ID / APP_CLIENT_ID ` +
        `(ou DIRECT_CONNECT_URL) et MOCK_MODE=false pour appeler Symbio D365 UAT MCP.`,
    ];
  }

  const token = await acquireCopilotStudioToken();
  const client = new CopilotStudioClient(buildSettings(), token);

  let conversationId = conversationIds.get(facadeConversationId);
  if (!conversationId) {
    const start = await client.startConversationAsync(true);
    const startedId =
      start.find((a) => a.conversation?.id)?.conversation?.id ??
      start[0]?.conversation?.id;
    if (!startedId) {
      throw new Error("Copilot Studio did not return a conversation id");
    }
    conversationId = startedId;
    conversationIds.set(facadeConversationId, conversationId);
  }

  const activities = await client.askQuestionAsync(userText, conversationId);
  const texts = activities
    .map((a) => (typeof a.text === "string" ? a.text.trim() : ""))
    .filter(Boolean);

  return texts.length > 0 ? texts : ["(réponse vide de l’agent Symbio)"];
}
