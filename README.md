# Hocuspocus on Railway

A small server built on [Hocuspocus](https://github.com/ueberdosis/hocuspocus) 4.7.0, the Y.js collaboration backend, for the Railway template. The official CLI accepts any client, so this wrapper adds:

- **JWT auth:** clients send an HS256 token signed with `HOCUSPOCUS_JWT_SECRET`. An optional `docs` claim limits which documents a token opens (exact names, or prefixes ending in `*`), and `readOnly: true` makes the connection read-only.
- **Storage:** documents are saved to SQLite at `/data/hocuspocus.sqlite`.
- **Webhook:** when `WEBHOOK_URL` is set, document changes are posted there (signed with `WEBHOOK_SECRET`).

The template overview will be added here once the template is published.
