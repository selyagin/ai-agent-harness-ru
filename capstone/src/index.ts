import { parseArgs } from 'node:util';

const { values } = parseArgs({
  options: {
    task: { type: 'string' },
    sandbox: { type: 'string', default: 'local' },
  },
});

if (!values.task) {
  console.error('Ошибка: передайте задачу. Пример: npm run dev -- --task "Найди обработчик формы"');
  process.exit(1);
}

if (!['local', 'memory'].includes(values.sandbox ?? 'local')) {
  console.error('Ошибка: --sandbox должен быть local или memory');
  process.exit(1);
}

console.log(`Задача: ${values.task}`);
console.log(`Sandbox: ${values.sandbox}`);
console.log('План: 1) поиск 2) чтение релевантных файлов 3) предложение действия 4) проверка');
console.log('В этом учебном каркасе действия с побочным эффектом требуют approval.');
