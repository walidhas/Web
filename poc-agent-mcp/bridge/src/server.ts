import express, { type Request, type Response, type NextFunction } from "express";
import { appConfig } from "./config.js";
import { askSymbioAgent } from "./copilotClient.js";

type Activity = {
  type?: string;
  id?: string;
  timestamp?: string;
  text?: string;
  conversation?: { id?: string };
  from?: { id?: string; name?: string };
  recipient?: { id?: string; name?: string };
  channelId?: string;
  serviceUrl?: string;
};

const app = express();
app.use(express.json({ limit: "1mb" }));

function requireApiKey(req: Request, res: Response, next: NextFunction): void {
  if (!appConfig.bridgeApiKey) {
    next();
    return;
  }
  const key = req.header("x-api-key") ?? req.header("authorization")?.replace(/^Bearer\s+/i, "");
  if (key !== appConfig.bridgeApiKey) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
}

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    mockMode: appConfig.mockMode,
    canCallCopilotStudio: appConfig.canCallCopilotStudio,
    environmentId: appConfig.environmentId ?? null,
    schemaName: appConfig.schemaName ?? null,
  });
});

/**
 * Minimal Activity Protocol endpoint for Copilot Studio "Connected agents"
 * (Microsoft 365 Agents SDK agent).
 */
app.post("/api/messages", requireApiKey, async (req: Request, res: Response) => {
  const activity = req.body as Activity;

  if (activity.type === "conversationUpdate" || activity.type === "invoke") {
    res.status(200).send();
    return;
  }

  if (activity.type && activity.type !== "message") {
    res.status(200).send();
    return;
  }

  const text = (activity.text ?? "").trim();
  const conversationId = activity.conversation?.id ?? activity.id ?? "anonymous";

  if (!text) {
    res.status(200).send();
    return;
  }

  try {
    const replies = await askSymbioAgent(conversationId, text);
    const now = new Date().toISOString();
    const responseActivities = replies.map((reply, index) => ({
      type: "message",
      id: `${activity.id ?? "msg"}-reply-${index}`,
      timestamp: now,
      text: reply,
      conversation: { id: conversationId },
      from: { id: "symbio-bridge", name: "Symbio D365 Bridge" },
      recipient: activity.from,
      replyToId: activity.id,
      channelId: activity.channelId ?? "directline",
    }));

    // Connected-agent clients typically accept a single activity or an array.
    res.status(200).json(responseActivities.length === 1 ? responseActivities[0] : responseActivities);
  } catch (error) {
    console.error("[bridge] /api/messages failed", error);
    res.status(500).json({
      type: "message",
      text: `Erreur bridge HSO: ${error instanceof Error ? error.message : String(error)}`,
      conversation: { id: conversationId },
    });
  }
});

app.listen(appConfig.port, () => {
  console.log(`HSO Symbio MCP bridge listening on http://localhost:${appConfig.port}`);
  console.log(`mockMode=${appConfig.mockMode} canCallCopilotStudio=${appConfig.canCallCopilotStudio}`);
});
