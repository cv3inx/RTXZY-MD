# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

RTXZY-ZAP — a WhatsApp bot built on `zapo-js`. [README.md](README.md) is the full manual (Indonesian): CLI arguments, plugin property tables, `m`/`extra` field lists, `conn` helpers, deployment. Read it before writing a plugin. This file covers what the README does not: the invariants that break silently.

## Commands

```bash
npm start            # index.js supervisor (health server + auto-restart child)
node main.js         # bot without the supervisor — crashes stay crashed, no restart loop
npm test             # syntax-check every .js in root/lib/plugins (node -c). NOT lint.
npm run lint         # eslint (cached); lint:fix to autofix
npm run format       # prettier --write .
npm run mcp          # @zapo-js/mcp-server over stdio
node lib/simple.js   # run one module's self-check
```

Unit tests live at the bottom of the module they test, guarded by `if (process.argv[1] === import.meta.filename)`, using `node:assert`. There is no test framework and no `test/` dir. Runnable self-checks: `lib/simple.js`, `lib/database/adapter.js`, `lib/system/{connection,print,log,api,userDefaults}.js`. New non-trivial logic in `lib/` gets a self-check in the same file.

`--test` skips periodic DB writes and tmp cleanup; `--nyimak` logs without replying; `--reset-session` deletes `sessions/state.sqlite`. Positional arg (`node index.js bot2`) prefixes both session dir and database filename, so multiple bots share one checkout.

## Architecture

**Three layers, three files.** [index.js](index.js) is a supervisor: HTTP health endpoint, spawns `main.js` over IPC, restarts it with exponential backoff on crash-loops, and waits `SHUTDOWN_GRACE_MS` on SIGINT/SIGTERM so the child can flush the database. [main.js](main.js) wires everything (config, lowdb, plugin loader, watchers) and owns `reloadHandler()`. [handler.js](handler.js) is the message router: prefix match → permission gates → plugin `run`.

**zapo-js is hidden behind a Baileys-shaped facade.** Plugins are written Baileys-style; `zapo-js` is not Baileys. Two layers bridge it: [lib/system/connection.js](lib/system/connection.js) wraps `WaClient` into an object with `conn.ev` / `conn.user` / `conn.authState` / `conn.ws` and renames every zapo event to its Baileys dot-name (`messages.upsert`, `group-participants.update`, `message.delete`, …); [lib/simple.js](lib/simple.js) `attach()` bolts ~90 helpers onto it. New WhatsApp capability is exposed by translating it in `connection.js` and/or adding a helper in `simple.js` — never by calling `conn._client` from a plugin.

**Globals are the API.** `global.conn`, `global.db`, `global.plugins`, `global.opts`, `global.config`, `global.support` (media-binary availability), plus the legacy short aliases (`wm`, `owner`, `wait`, `eror`, `btc`, `APIKeys`, …) installed by [config.js](config.js) as `defineProperty` getters so hot-reloading config.js keeps them live. Two consequences:

- ESM is always strict mode, so a global that is not defined is a `ReferenceError`, not `undefined`. Any new global must be added to the `globals` block in [eslint.config.js](eslint.config.js) or `no-undef` fails the lint.
- Bare `conn` inside `main.js` deliberately resolves to `global.conn` so it survives the swap in `reloadHandler()` — see [main.js:92](main.js#L92). Don't "fix" it into a local binding.

**Database is one lowdb document.** Mutate `global.db.data.users[jid]` / `.chats[jid]` and stop; a 30s interval writes, and `flushAndClose()` writes again on shutdown. Never touch database files directly. The backing store is chosen by [lib/database/adapter.js](lib/database/adapter.js) from the URL scheme in `config.database.url` (`postgres://`, `mongodb://`, `https://`), falling back to `config.database.type` — `sqlite` — when it is empty; `--db` beats both and accepts either a type name or a full URL. Remote adapters (postgres, mongo, cloud) rewrite the whole document on every flush; only sqlite stores one row per entry. Default shapes for user/chat entries live in [lib/system/userDefaults.js](lib/system/userDefaults.js) — add a new field there, not by writing it ad hoc in a plugin.

**Plugins.** One file per feature under `plugins/<category>/`, default-exporting an object with `command` + `run` (older files export a callable directly; both are supported). `plugins/_events/` holds passive features using `before`/`all` instead of a command. Handler iteration stops at the first matching command, and `global.plugins` is re-sorted alphabetically by path on reload — two plugins claiming the same command is a real bug, not a tie.

**Hot reload, and the trap in it.** `fs.watch` on `plugins/` re-imports a changed plugin (syntax errors are logged and the old version is kept); `fs.watchFile` at the bottom of `config.js`/`handler.js` re-imports those; changing `main.js` triggers a full restart by the supervisor. Because a re-import re-runs module top-level code, anything registered there is registered _again_: guard timers and watchers with the existing pattern — `clearInterval(global.__someTimer)` before `setInterval`, `fs.unwatchFile(file)` before `fs.watchFile` (see [plugins/group/remindersholat.js](plugins/group/remindersholat.js#L96)).

## Conventions

- **Indonesian** for comments, log lines, and user-facing strings. Match it.
- **`throw 'string'`** is a user-visible validation message, replied verbatim. A real `Error` never reaches the chat: the user gets `config.messages.error` while the stack goes to the server log with API keys replaced by `#HIDDEN#`. Preserve that split — stacks leak server paths.
- **Prettier `printWidth: 100000`.** Very long single lines are the formatter's output, not sloppiness. Run `npm run format` instead of hand-wrapping.
- **LIDs.** JIDs arrive as `@lid` as often as `@s.whatsapp.net`. Compare and mention through `conn.getJid()` / `resolveLidJid()` / digit-stripping (see the `isROwner` and `participantsUpdate` code in `handler.js`), never by raw string equality. Mentioning an unresolved `@lid` renders wrong.
- **Media needs external binaries** — ffmpeg (with libwebp), imagemagick. `_quickTest()` in `main.js` probes them into `global.support`; guard on it rather than assuming.
- Node >= 22 is enforced by a `preinstall` script and again at the top of `index.js`.
- The `@zapo-js/mcp-server` is registered project-scoped in [.mcp.json](.mcp.json) as `zapo`, with `MCP_AUTH_PATH=sessions/mcp.sqlite` — a different SQLite file from the bot's `sessions/state.sqlite`, because sharing one store gives `SQLITE_BUSY`. Its WhatsApp session is therefore separate: it needs its own pairing (`call({ path: 'connect', noAwait: true })`, then watch `events`), and it never touches the bot's credentials.
