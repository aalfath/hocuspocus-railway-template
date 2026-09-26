// Hocuspocus server for Railway: JWT auth, SQLite persistence, optional webhook.
import { Logger } from "@hocuspocus/extension-logger";
import { SQLite } from "@hocuspocus/extension-sqlite";
import { Events, Webhook } from "@hocuspocus/extension-webhook";
import { Server } from "@hocuspocus/server";
import { jwtVerify } from "jose";

const secret = process.env.HOCUSPOCUS_JWT_SECRET;
if (!secret || secret.length < 32) {
  console.error("HOCUSPOCUS_JWT_SECRET must be set (at least 32 characters)");
  process.exit(1);
}
const key = new TextEncoder().encode(secret);

// A token may limit access with a "docs" claim: exact names, or prefixes ending in "*".
const allowed = (patterns, name) =>
  patterns.some((p) => (p.endsWith("*") ? name.startsWith(p.slice(0, -1)) : p === name));

const extensions = [
  new Logger(),
  new SQLite({ database: process.env.SQLITE_PATH || "/data/hocuspocus.sqlite" }),
];
if (process.env.WEBHOOK_URL) {
  extensions.push(
    new Webhook({
      url: process.env.WEBHOOK_URL,
      secret: process.env.WEBHOOK_SECRET || "",
      events: [Events.onChange],
      debounce: Number(process.env.WEBHOOK_DEBOUNCE_MS || 2000),
    }),
  );
}

const server = new Server({
  name: process.env.RAILWAY_SERVICE_NAME || "hocuspocus",
  port: Number(process.env.PORT || 1234),
  address: process.env.HOST || "::",
  timeout: 30000,
  extensions,
  async onAuthenticate({ token, documentName, connectionConfig }) {
    const { payload } = await jwtVerify(token || "", key, {
      algorithms: ["HS256"],
      issuer: process.env.HOCUSPOCUS_JWT_ISSUER || undefined,
    });
    if (Array.isArray(payload.docs) && !allowed(payload.docs, documentName)) {
      throw new Error(`token does not grant access to ${documentName}`);
    }
    if (payload.readOnly === true) connectionConfig.readOnly = true;
    return { user: { id: payload.sub, name: payload.name } };
  },
});

server.listen();

const stop = async () => {
  await server.destroy();
  process.exit(0);
};
process.on("SIGTERM", stop);
process.on("SIGINT", stop);
