# Подготовка на macOS

## 1. Проверьте Node.js

В Терминале выполните:

```bash
node --version
npm --version
```

Если команды не найдены, установите актуальную LTS-версию Node.js с nodejs.org, затем закройте и заново откройте Терминал.

## 2. Создайте учебный проект

```bash
mkdir -p ~/Developer/ai-agent-harness
cd ~/Developer/ai-agent-harness
npm init -y
npm install -D typescript tsx @types/node
npx tsc --init
```

`tsx` запускает TypeScript без отдельной ручной компиляции.

## 3. Добавьте команды запуска

В `package.json` замените или добавьте `scripts`:

```json
{
  "scripts": {
    "dev": "tsx src/index.ts",
    "check": "tsc --noEmit"
  }
}
```

Создайте `src/index.ts`:

```ts
console.log('Учебный проект запущен');
```

Проверьте:

```bash
npm run dev
npm run check
```

## 4. Не публикуйте секреты

Создайте `.gitignore`:

```gitignore
node_modules/
dist/
.env
.DS_Store
```

Когда понадобится ключ провайдера модели, сохраните его только в `.env`, например:

```text
AI_GATEWAY_API_KEY=вставьте_ваш_ключ
```

Не вставляйте настоящий ключ в код, скриншоты, issue и Git-коммиты.

## Результат

У вас есть минимальный TypeScript-проект, который запускается и проходит статическую проверку. В следующем модуле в нём появятся безопасные файловые инструменты.
