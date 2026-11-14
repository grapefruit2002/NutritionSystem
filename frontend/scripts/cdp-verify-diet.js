// 通过 CDP 验证：1) 重复添加累加克数  2) 拖拽排序
const WebSocket = require('ws');
const http = require('http');

function getTargets() {
  return new Promise((res, rej) => {
    http.get('http://127.0.0.1:9333/json/list', (r) => {
      let d = '';
      r.on('data', (c) => (d += c));
      r.on('end', () => res(JSON.parse(d)));
    }).on('error', rej);
  });
}

(async () => {
  const targets = await getTargets();
  const page = targets.find((t) => t.url.includes('#/tools'));
  if (!page) { console.log('NO TOOLS PAGE', targets.map(t=>t.url)); process.exit(1); }
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  let id = 0;
  const pending = new Map();
  const send = (method, params = {}) => new Promise((res, rej) => {
    const msgId = ++id;
    pending.set(msgId, { res, rej });
    ws.send(JSON.stringify({ id: msgId, method, params }));
  });
  ws.on('message', (raw) => {
    const m = JSON.parse(raw);
    if (m.id && pending.has(m.id)) {
      const { res, rej } = pending.get(m.id);
      pending.delete(m.id);
      m.error ? rej(new Error(JSON.stringify(m.error))) : res(m.result);
    }
  });
  await new Promise((r) => ws.on('open', r));

  const evalJs = async (expr) => {
    const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
    if (r.exceptionDetails) throw new Error(JSON.stringify(r.exceptionDetails));
    return r.result.value;
  };

  await send('Runtime.enable');
  await evalJs(`location.hash = '#/tools'; void 0`);
  await new Promise((r) => setTimeout(r, 900));

  // ---------- 测试 1：重复添加累加 ----------
  const t1 = await evalJs(`(async () => {
    const vm = document.querySelector('.diet-calculator').__vue__;
    const food = vm.foods.find(f => f.id === 'rice-cooked');
    vm.grams = 100;
    vm.addFood(food);
    vm.grams = 250;
    vm.addFood(food);
    await new Promise(r => setTimeout(r, 60));
    const rows = vm.items.filter(i => i.foodId === 'rice-cooked');
    return {
      riceRowCount: rows.length,
      riceGrams: rows.length ? rows[0].grams : null,
      totalItems: vm.items.length,
      totalGrams: vm.totalGrams,
    };
  })()`);
  console.log('TEST1 重复添加累加 =>', JSON.stringify(t1));
  console.log('  期望: riceRowCount=1, riceGrams=350, totalItems=1');
  console.log('  结果:', (t1.riceRowCount === 1 && t1.riceGrams === 350) ? 'PASS' : 'FAIL');

  // ---------- 测试 2：拖拽排序 ----------
  const t2 = await evalJs(`(async () => {
    const vm = document.querySelector('.diet-calculator').__vue__;
    // 准备 4 个不同食物
    vm.items = [
      { uid: 101, foodId: 'rice-cooked', grams: 100 },
      { uid: 102, foodId: 'pork-lean-cooked', grams: 100 },
      { uid: 103, foodId: 'egg-boiled', grams: 100 },
      { uid: 104, foodId: 'apple', grams: 100 },
    ];
    vm.nextUid = 105;
    await new Promise(r => setTimeout(r, 80));
    const before = vm.items.map(i => i.foodId);
    // 把第 1 行拖到第 3 行位置
    vm.onDragStart(0, { dataTransfer: { effectAllowed:'', setData(){}, dropEffect:'' } });
    vm.onDragOver(2, { preventDefault(){}, dataTransfer: {} });
    vm.onDrop(2);
    await new Promise(r => setTimeout(r, 80));
    const after = vm.items.map(i => i.foodId);
    return { before, after, dragIndex: vm.dragIndex, domOrder: Array.from(document.querySelectorAll('.diet-item-main strong')).map(e=>e.textContent.trim()) };
  })()`);
  console.log('TEST2 拖拽排序 =>', JSON.stringify(t2));
  const expected = ['pork-lean-cooked', 'egg-boiled', 'rice-cooked', 'apple'];
  console.log('  期望 after =', JSON.stringify(expected));
  console.log('  结果:', (JSON.stringify(t2.after) === JSON.stringify(expected)) ? 'PASS' : 'FAIL');

  // ---------- 测试 3：DOM 拖拽事件绑定 ----------
  const t3 = await evalJs(`(() => {
    const rows = document.querySelectorAll('.diet-item');
    const handle = document.querySelector('.diet-item-handle');
    return {
      rowCount: rows.length,
      handleExists: !!handle,
      handleDraggable: handle ? handle.getAttribute('draggable') : null,
      rowHasDraggable: rows.length ? rows[0].getAttribute('draggable') : null,
    };
  })()`);
  console.log('TEST3 DOM 绑定 =>', JSON.stringify(t3));
  console.log('  结果:', (t3.handleExists && t3.handleDraggable === 'true' && t3.rowHasDraggable === null) ? 'PASS' : 'FAIL');

  ws.close();
  process.exit(0);
})().catch((e) => { console.error('ERR', e.message); process.exit(1); });
