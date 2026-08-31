import { promises as fs } from 'node:fs';
import path from 'node:path';

const MAX_CHARS = 12_000;

function inside(workspace: string, requested: string) {
  const root = path.resolve(workspace);
  const target = path.resolve(root, requested);
  if (target !== root && !target.startsWith(root + path.sep)) {
    throw new Error('Путь находится за пределами рабочей папки');
  }
  return target;
}

export async function readFile(workspace: string, requested: string) {
  const text = await fs.readFile(inside(workspace, requested), 'utf8');
  return text.length > MAX_CHARS ? text.slice(0, MAX_CHARS) + '\n[обрезано]' : text;
}

export async function searchText(workspace: string, query: string) {
  const results: string[] = [];
  async function visit(folder: string): Promise<void> {
    for (const item of await fs.readdir(folder, { withFileTypes: true })) {
      if (item.name === '.git' || item.name === 'node_modules') continue;
      const full = path.join(folder, item.name);
      if (item.isDirectory()) await visit(full);
      if (item.isFile()) {
        const text = await fs.readFile(full, 'utf8').catch(() => '');
        text.split(/\r?\n/).forEach((line, n) => {
          if (line.toLowerCase().includes(query.toLowerCase()) && results.length < 50) results.push(`${path.relative(workspace, full)}:${n + 1}: ${line.trim()}`);
        });
      }
    }
  }
  await visit(workspace);
  return results.length ? results.join('\n') : 'Совпадений не найдено';
}
