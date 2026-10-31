import { readdir, readFile } from 'node:fs/promises';
import { join, extname } from 'node:path';

const NOTE_EXTS = ['.md', '.txt', '.markdown'];

export async function listNotes(dir: string): Promise<string[]> {
  const entries = await readdir(dir);
  return entries.filter((f) => NOTE_EXTS.includes(extname(f).toLowerCase())).sort();
}

export async function readNote(dir: string, name: string): Promise<string> {
  const safe = name.replace(/[/\\]/g, ''); // no path traversal
  return readFile(join(dir, safe), 'utf8');
}

export interface NoteMatch {
  file: string;
  line: number;
  text: string;
}

export async function searchNotes(dir: string, query: string, limit = 50): Promise<NoteMatch[]> {
  const needle = query.toLowerCase();
  const matches: NoteMatch[] = [];
  for (const file of await listNotes(dir)) {
    const lines = (await readFile(join(dir, file), 'utf8')).split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].toLowerCase().includes(needle)) {
        matches.push({ file, line: i + 1, text: lines[i].trim() });
        if (matches.length >= limit) return matches;
      }
    }
  }
  return matches;
}

export async function fetchUrl(url: string): Promise<string> {
  const res = await fetch(url, { headers: { 'User-Agent': 'toolbelt' } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.text()).slice(0, 10000);
}

export async function githubRepos(user: string): Promise<string> {
  const headers: Record<string, string> = {
    'User-Agent': 'toolbelt',
    Accept: 'application/vnd.github+json',
  };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  const res = await fetch(`https://api.github.com/users/${user}/repos?sort=pushed&per_page=20`, { headers });
  if (!res.ok) throw new Error(`GitHub HTTP ${res.status}`);
  const repos = (await res.json()) as Array<{
    name: string;
    description: string | null;
    pushed_at: string;
    open_issues_count: number;
    stargazers_count: number;
  }>;
  return repos
    .map((r) => `- ${r.name} (★${r.stargazers_count}, ${r.open_issues_count} issues, pushed ${r.pushed_at.slice(0, 10)}): ${r.description ?? ''}`)
    .join('\n');
}
