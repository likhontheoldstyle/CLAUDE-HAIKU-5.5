<div align="center">

<img src="https://capsule-render.vercel.app/api?type=rect&color=141E30,243B55&height=160&section=header&text=CLAUDE-AI-API&fontSize=42&fontColor=ffffff&fontAlignY=42&desc=Chat%2C%20image%20generation%20and%20image%20editing%20%E2%80%94%20no%20API%20key%2C%20no%20account&descAlignY=62&descSize=16" width="100%"/>

<a href="https://git.io/typing-svg"><img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=600&size=22&pause=1000&color=6366F1&center=true&vCenter=true&width=560&lines=Welcome+to+CLAUDE-AI-API;Claude+Haiku+5.5+Only;OpenAI-Compatible+%7C+No+API+Key+Needed;Built+with+Node.js" alt="Typing SVG" /></a>

<br/>

![Node.js](https://img.shields.io/badge/Node.js-20.x-339933?style=for-the-badge&logo=node.js&logoColor=white)
![npm](https://img.shields.io/badge/npm-10.x-CB3837?style=for-the-badge&logo=npm&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES2022-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

</div>

---

## About

**CLAUDE-AI-API** is a local API server for Claude Haiku 5.5 — text chat, image generation, and image editing — with no API key and no account required.

**Base URL (default):** `http://localhost:3000`

---

## Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/likhontheoldstyle/CLAUDE-HAIKU-5.5.git
cd CLAUDE-HAIKU-5.5
```

### 2. Install dependencies

```bash
npm install
```

### 3. Run the project

```bash
npm start
```

```bash
curl "http://localhost:3000/chat?message=Hello&model=Claude%20Haiku%205.5"
```

---

## Models

| Name (use this in requests) | Model ID | Notes |
|---|---|---|
| `Claude Haiku 5.5` | `claude-haiku-5-5` | Free |

You can pass either the friendly name (`"Claude Haiku 5.5"`) or the raw model ID (`"claude-haiku-5-5"`). Unknown model names are rejected with a `400` error that lists the available models.

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | API info (name, version, mode, endpoint list) |
| GET | `/health` | Server status |
| GET | `/models` | Available models |

### Simple GET API (browser-friendly)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/chat?message=Hello&model=Claude%20Haiku%205.5` | Chat with a model (`message` can also be `msg` or `q`) |
| GET | `/image?prompt=...&model=Claude%20Haiku%205.5` | Generate an image from a text prompt |
| GET | `/last-image` | Serves the most recently generated/edited image as a raw JPEG |

### POST API

| Method | Endpoint | Description |
|---|---|---|
| POST | `/chat` | Chat — `{ "message": "...", "model": "Claude Haiku 5.5" }`, or a `messages` array for multi-turn |
| POST | `/image` | Image generation — `{ "prompt": "...", "model": "Claude Haiku 5.5" }`; add `"fresh": true` to bypass the 10-minute response cache |
| POST | `/image-edit` | Image editing — `{ "image": "<data URI \| base64 \| image URL>", "prompt": "...", "model": "Claude Haiku 5.5" }` |
| POST | `/api/admin/update` | Self-update (needs `x-admin-key` header; key from `ADMIN_KEY` env or a server-side `.admin-key` file) |
| POST | `/agent` | Agent mode — `{ "task": "...", "model": "Claude Haiku 5.5" }`; responds with an SSE stream (`step` / `result` / `image` / `final` / `error` events) |

### Agent mode

The API exposes Agent mode as `POST /agent`. The agent plans and works step by step with tools, streaming its progress live:

- `web_search` — DuckDuckGo search (titles, links, snippets)
- `fetch_url` — read a web page as text (public URLs only; local/private addresses are blocked)
- `run_js` / `run_python` — run code in the `agent-workspace/` folder (12s timeout) and use its output
- `write_file` / `read_file` — save and read files inside `agent-workspace/` only
- `generate_image` — generate an image mid-task; it appears in the chat

One tool call per step, up to `AGENT_MAX_STEPS` steps (default 8). The final answer arrives as a normal chat reply.

### OpenAI-compatible API

| Method | Endpoint | Description |
|---|---|---|
| POST | `/v1/chat/completions` | Chat completions; `"stream": true` for SSE streaming. Send a top-level `"image": true` field to generate an image instead of text |
| GET | `/v1/models` | Lists all models |
| POST | `/v1/images/generations` | Image generation; returns OpenAI-style `b64_json` |

Point any OpenAI client at this server — any API key value is accepted:

```python
from openai import OpenAI

client = OpenAI(base_url="http://localhost:3000/v1", api_key="duck")

reply = client.chat.completions.create(
    model="Claude Haiku 5.5",
    messages=[{"role": "user", "content": "Hello!"}],
)
print(reply.choices[0].message.content)
```

### Utility endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/health` | Server status, mode, and model list |
| GET | `/models` | Friendly name → model ID map |
| GET | `/debug-last` | The raw stream of the most recent request (for debugging empty replies) |

Image endpoints return `images` (an array of `data:image/jpeg;base64,...` URLs), plus `title` and `revised_prompt`.

---

## Configuration

| Variable | Default | Meaning |
|---|---|---|
| `PORT` | `3000` | Port the server listens on |
| `DUCK_MODE` | `direct` | `direct` (default), `mock` (offline test replies), `browser`, or `upstream` |
| `DUCK_MODEL` | `Claude Haiku` | Default model when a request doesn't specify one |
| `DUCK_RETRIES` | `2` | Retries per request variant on rejection |
| `DUCK_MIN_INTERVAL_MS` | `3000` | Minimum gap between requests (requests are queued serially) |
| `DUCK_CACHE_TTL_MS` | `600000` | How long identical requests are served from cache (10 min) |
| `DUCK_429_WAIT_MS` | `60000` | On a rate limit, wait this long and retry once automatically |
| `DUCK_UA` | auto | Override the user agent / device profile |

```bash
PORT=8080 DUCK_MODEL="Claude Haiku" npm start
```

---

## Project Structure

```
CLAUDE-AI-API/
├── server.js            # HTTP server
├── src/
│   ├── client.js
│   ├── duckClient.js
│   ├── browserClient.js
│   └── agent.js
├── examples/
├── package.json
└── README.md
```

---

## Author

**LIKHON AHMED**

- GitHub: [@likhontheoldstyle](https://github.com/likhontheoldstyle)

---

## License

This project is licensed under the **MIT License**.

<div align="center">

<img src="https://capsule-render.vercel.app/api?type=rect&color=141E30,243B55&height=80&section=footer" width="100%"/>

**⭐ Star this repository if you find it useful!**

</div>
