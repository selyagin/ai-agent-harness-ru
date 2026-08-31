import { parseArgs } from 'node:util';
import { searchText } from './tools.js';

const { values } = parseArgs({ options: { task: { type: 'string' }, sandbox: { type: 'string', default: 'local' }, query: { type: 'string' } } });
if (!values.task) { console.error('Ошибка: передайте --task'); process.exit(1); }
if (!['local', 'memory'].includes(values.sandbox ?? 'local')) { console.error('Ошибка: --sandbox должен быть local или memory'); process.exit(1); }
console.log(`Задача: ${values.task}`);
console.log(`Sandbox: ${values.sandbox}`);
console.log('План: поиск → чтение → предложение действия → проверка');
if (values.query) console.log(await searchText(process.cwd(), values.query));
