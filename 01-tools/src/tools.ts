import { promises as fs } from 'node:fs';
import path from 'node:path';

const LIMIT = 12_000;

function safePath(workspace: string, requested: string) {
  const root = path.resolve(workspace);
  const target = path.resolve(root, requested);
  if (!target.startsWith(root + path.sep)) throw new Error('Путь находится за пределами рабочей папки');
  return target;
}

export async function readFile(workspace: string, requested: string) {
  const text = await fs.readFile(safePath(workspace, requested), 'utf8');
  return text.length > LIMIT ? text.slice(0, LIMIT) + '\n[обрезано]' : text;
}

export async function searchText(workspace: string, query: string) {
  const result: string[] = [];
  async function visit(folder: string): Promise<void> {
    for (const entry of await fs.readdir(folder, { withFileTypes: true })) {
      if (entry.name === '.git' || entry.name === 'node_modules') continue;
      const full = path.join(folder, entry.name);
      if (entry.isDirectory()) await visit(full);
      if (entry.isFile()) {
        const lines = (await fs.readFile(full, 'utf8').catch(() => '')).split(/\r?\n/);
        lines.forEach((line, i) => { if (line.toLowerCase().includes(query.toLowerCase()) && result.length < 50) result.push(`${path.relative(workspace, full)}:${i + 1}: ${line.trim()}`); });
      }
    }
  }
  await visit(workspace);
  return result.length ? result.join('\n') : 'Совпадений не найдено';
}
