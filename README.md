# Deploy and Host Hocuspocus on Railway

Hocuspocus is a WebSocket backend for Y.js, the CRDT library behind many collaborative editors. It syncs shared documents between clients in real time, merges offline edits without conflicts and stores the result. It is made by the Tiptap team and works with Tiptap, BlockNote, Lexical, CodeMirror and any other Y.js binding.

## About Hosting Hocuspocus

This template deploys Hocuspocus 4.7.0 from a small public wrapper repository, because the official command-line server accepts every client. The wrapper verifies an HS256 JWT on every connection. Your backend signs it with `HOCUSPOCUS_JWT_SECRET`, and an optional `docs` claim limits which documents it opens. Documents are stored in SQLite on a Railway volume and survive redeploys. Clients connect over WSS to the public domain. If you set `WEBHOOK_URL`, the server posts document changes to your backend, signed with `WEBHOOK_SECRET`. The server runs as the unprivileged `node` user and fits the Hobby plan.

## Common Use Cases

- Real-time collaborative editing in a Tiptap or BlockNote editor
- Multiplayer whiteboards, forms and to-do lists built on Y.js
- Offline-first documents that merge when clients reconnect

## Dependencies for Hocuspocus Hosting

- [aalfath/hocuspocus-railway-template](https://github.com/aalfath/hocuspocus-railway-template) (`@hocuspocus/server` 4.7.0)
- A Railway volume at `/data` for the SQLite database

### Deployment Dependencies

- [Hocuspocus documentation](https://tiptap.dev/docs/hocuspocus/introduction)
- [Hocuspocus 4.7.0 release](https://github.com/ueberdosis/hocuspocus/releases/tag/v4.7.0)
- [Wrapper repository](https://github.com/aalfath/hocuspocus-railway-template)

### Implementation Details

| Service | Source | Networking | Storage |
| --- | --- | --- | --- |
| hocuspocus | `aalfath/hocuspocus-railway-template` | public WSS | volume at `/data` |

| Variable | Purpose |
| --- | --- |
| `HOCUSPOCUS_JWT_SECRET` | Shared secret your backend signs client tokens with |
| `HOCUSPOCUS_JWT_ISSUER` | Optional; when set, tokens must carry this `iss` |
| `WEBHOOK_URL`, `WEBHOOK_SECRET` | Optional change notifications to your backend |
| `HOCUSPOCUS_URL` | `wss://<domain>` for your clients |

Issue a token in your backend and connect:

```js
const token = await new SignJWT({ docs: ["notes/*"] }).setProtectedHeader({ alg: "HS256" })
  .setSubject(user.id).setExpirationTime("1h").sign(new TextEncoder().encode(HOCUSPOCUS_JWT_SECRET))
new HocuspocusProvider({ url: HOCUSPOCUS_URL, name: "notes/42", token })
```

Add `readOnly: true` to a token for view-only access. Keep the secret on your server only.

This is a community-maintained deployment package and does not imply affiliation with or endorsement by Tiptap (ueberdosis).

## Why Deploy Hocuspocus on Railway?

Railway is a singular platform to deploy your infrastructure stack. Railway will host your infrastructure so you don't have to deal with configuration, while allowing you to vertically and horizontally scale it.

By deploying Hocuspocus on Railway, you are one step closer to supporting a complete full-stack application with minimal burden. Host your servers, databases, AI agents, and more on Railway.
