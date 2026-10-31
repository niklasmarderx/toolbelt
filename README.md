# toolbelt

**A personal [MCP](https://modelcontextprotocol.io) server that hands your everyday tools
to any AI coding agent.** Point Claude Code, Cursor, or Codex at toolbelt and it can read
and search your notes, look up GitHub activity, and fetch URLs — in any session, without
you pasting context.

[![CI](https://github.com/niklasmarderx/toolbelt/actions/workflows/ci.yml/badge.svg)](https://github.com/niklasmarderx/toolbelt/actions/workflows/ci.yml)
[![License: MIT OR Apache-2.0](https://img.shields.io/badge/license-MIT%20OR%20Apache--2.0-blue.svg)](#license)

## Tools

| Tool | What it does |
|------|--------------|
| `github_repos` | List a GitHub user's repositories, newest push first |
| `fetch_url` | Fetch the text content of a URL |
| `list_notes` | List note files in your notes directory |
| `read_note` | Read one note by file name |
| `search_notes` | Full-text search across your notes (returns `file:line` matches) |

## Install

```sh
npm install -g toolbelt-mcp     # or: git clone … && npm install && npm run build
```

## Register with your agent

For **Claude Code**, add to your MCP config:

```json
{
  "mcpServers": {
    "toolbelt": {
      "command": "toolbelt",
      "env": {
        "TOOLBELT_NOTES_DIR": "/Users/you/notes",
        "GITHUB_TOKEN": "ghp_… (optional, raises rate limits)"
      }
    }
  }
}
```

The agent then sees the five tools above and can call them during any conversation.

## Configuration

- `TOOLBELT_NOTES_DIR` — directory the note tools read (default: current directory).
- `GITHUB_TOKEN` — optional, for higher GitHub API rate limits.

Note reads are restricted to the configured directory (path traversal is stripped).

## Develop

```sh
npm install
npm run build
npm test        # unit tests for the tool logic
npm run dev     # run the server over stdio
```

## Roadmap

- More tools: calendar, email (IMAP), filesystem writes behind confirmation, HTTP POST.
- Resources (expose notes as MCP resources, not just tools).
- Per-tool allow/deny configuration.

## License

Licensed under either of [Apache License, Version 2.0](LICENSE-APACHE) or
[MIT license](LICENSE-MIT) at your option.
