#!/usr/bin/env node
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { fetchUrl, githubRepos, listNotes, readNote, searchNotes } from './tools.js';

const NOTES_DIR = process.env.TOOLBELT_NOTES_DIR ?? process.cwd();

function text(value: string) {
  return { content: [{ type: 'text' as const, text: value || '(empty)' }] };
}

const server = new McpServer({ name: 'toolbelt', version: '0.1.0' });

server.registerTool(
  'github_repos',
  { title: 'GitHub repos', description: "List a GitHub user's repositories, newest push first.", inputSchema: { user: z.string() } },
  async ({ user }) => text(await githubRepos(user)),
);

server.registerTool(
  'fetch_url',
  { title: 'Fetch URL', description: 'Fetch the text content of a URL (first 10k chars).', inputSchema: { url: z.string() } },
  async ({ url }) => text(await fetchUrl(url)),
);

server.registerTool(
  'list_notes',
  { title: 'List notes', description: 'List note files in the configured notes directory.', inputSchema: {} },
  async () => text((await listNotes(NOTES_DIR)).join('\n')),
);

server.registerTool(
  'read_note',
  { title: 'Read note', description: 'Read one note by file name from the notes directory.', inputSchema: { name: z.string() } },
  async ({ name }) => text(await readNote(NOTES_DIR, name)),
);

server.registerTool(
  'search_notes',
  { title: 'Search notes', description: 'Full-text search across notes; returns file:line matches.', inputSchema: { query: z.string() } },
  async ({ query }) =>
    text((await searchNotes(NOTES_DIR, query)).map((m) => `${m.file}:${m.line}: ${m.text}`).join('\n')),
);

await server.connect(new StdioServerTransport());
