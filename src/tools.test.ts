import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { listNotes, readNote, searchNotes } from './tools.js';

let dir: string;

beforeAll(async () => {
  dir = await mkdtemp(join(tmpdir(), 'toolbelt-'));
  await writeFile(join(dir, 'a.md'), '# A\nhello world\nthe secret marker here\n');
  await writeFile(join(dir, 'b.md'), '# B\nnothing special\n');
  await writeFile(join(dir, 'ignore.png'), 'binary');
});

afterAll(async () => {
  await rm(dir, { recursive: true, force: true });
});

describe('notes tools', () => {
  it('lists only note files', async () => {
    expect(await listNotes(dir)).toEqual(['a.md', 'b.md']);
  });

  it('reads a note', async () => {
    expect(await readNote(dir, 'a.md')).toContain('hello world');
  });

  it('searches across notes', async () => {
    const matches = await searchNotes(dir, 'secret marker');
    expect(matches).toHaveLength(1);
    expect(matches[0].file).toBe('a.md');
    expect(matches[0].line).toBe(3);
  });

  it('prevents path traversal', async () => {
    await expect(readNote(dir, '../../etc/passwd')).rejects.toBeTruthy();
  });
});
