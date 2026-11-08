const PAGE_HTML = __PAGE_HTML__;
const FOOD_CATALOG_JS = __FOOD_CATALOG_JS__;
const CHINESE_DISHES_JS = __CHINESE_DISHES_JS__;
const FOOD_ALL_JS = __FOOD_ALL_JS__;
const STATE_KEY = 'owner/health-state-v1.json';
const TZ = 'Asia/Shanghai';
const REPORT_VERSION = 'chinese-meals-v1';

const CHINESE_DAILY_MENUS = [
  ['早餐：小米粥、白煮蛋、无糖豆浆，配一份苹果。', '午餐：杂粮米饭、清蒸鱼、蒜蓉西兰花，配番茄豆腐汤。', '晚餐：米饭、香菇炖鸡、清炒菠菜。', '可选加餐：原味酸奶或一小把坚果。'],
  ['早餐：玉米、鸡蛋、牛奶，配一份橙子。', '午餐：米饭、青椒肉丝、清炒小白菜，配紫菜蛋花汤。', '晚餐：红薯、清蒸豆腐、凉拌黄瓜，配一份绿叶菜。', '可选加餐：一份梨或无糖酸奶。'],
  ['早餐：杂粮馒头、白煮蛋、无糖豆浆，配小番茄。', '午餐：米饭、少油版宫保鸡丁、蒜蓉油麦菜。', '晚餐：荞麦面、香菇豆腐、小白菜，搭配少量瘦肉。', '可选加餐：一份当季水果。'],
  ['早餐：南瓜小米粥、鸡蛋、牛奶，配一份水果。', '午餐：杂粮饭、番茄炖牛肉、清炒上海青。', '晚餐：米饭、虾仁豆腐、清炒西兰花。', '可选加餐：原味酸奶。'],
  ['早餐：全麦馒头、鸡蛋、无糖豆浆，配一份苹果。', '午餐：米饭、家常豆腐、芹菜炒瘦肉，搭配绿叶菜；炒菜少油。', '晚餐：杂粮饭、清蒸鲈鱼、清炒菜花。', '可选加餐：一份橙子或梨。'],
  ['早餐：红薯、白煮蛋、牛奶，配一份当季水果。', '午餐：杂粮饭、番茄炖鸡肉、清炒小白菜。', '晚餐：小米粥、香菇豆腐、凉拌黄瓜，搭配少量主食。', '可选加餐：无糖酸奶或一小把坚果。'],
  ['早餐：玉米、鸡蛋羹、无糖豆浆，配一份水果。', '午餐：米饭、清蒸鱼、木耳炒山药、清炒青菜。', '晚餐：杂粮饭、西红柿炒蛋、蒜蓉生菜，配一份豆腐。', '可选加餐：牛奶或一份当季水果。']
];

function chineseMealIdeas(date, goal) {
  const day = Math.floor(Date.parse(`${date}T00:00:00Z`) / 86400000);
  const menu = CHINESE_DAILY_MENUS[day % CHINESE_DAILY_MENUS.length];
  return [...menu, goal
    ? `份量提示：按你设置的每日 ${Math.round(goal)} 千卡参考值调整主食、烹调油和加餐，并记录实际食用量；菜肴热量会随做法变化。`
    : '份量提示：按食欲和活动量调整主食、烹调油和加餐，并记录实际食用量；菜肴热量会随做法变化。'];
}

function chinaDate(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-US', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(now);
  const get = type => parts.find(part => part.type === type).value;
  return `${get('year')}-${get('month')}-${get('day')}`;
}
function previousDate(date) {
  const day = new Date(`${date}T00:00:00Z`);
  day.setUTCDate(day.getUTCDate() - 1);
  return day.toISOString().slice(0, 10);
}
function responseJson(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } });
}
function reportKey(date) { return `owner/reports/${date}.json`; }
async function readJson(bucket, key) {
  const object = await bucket.get(key);
  return object ? object.json() : null;
}
function number(value) {
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : null;
}
function foodGroups(meal) {
  const s = String(meal.name || '').toLowerCase();
  const category = String(meal.category || '');
  return {
    produce: /蔬菜|水果|火锅麻辣烫/.test(category) || /苹果|香蕉|橙|柑|橘|梨|草莓|蓝莓|葡萄|猕猴桃|芒果|菠萝|西瓜|桃|樱桃|李子|木瓜|石榴|西兰花|菜花|花菜|包菜|白菜|生菜|菠菜|番茄|西红柿|黄瓜|胡萝卜|芹菜|茄子|南瓜|青椒|甜椒|洋葱|蘑菇|蔬菜|沙拉|apple|banana|orange|pear|berry|grape|kiwi|mango|pineapple|watermelon|peach|cherry|plum|papaya|pomegranate|broccoli|lettuce|spinach|tomato|cucumber|carrot|celery|eggplant|pepper|vegetable|salad/.test(s),
    protein: /蛋白质|火锅麻辣烫/.test(category) || /鸡蛋|鸭蛋|炒蛋|蛋花|蛋羹|鸡肉|鸡胸|鸡腿|火鸡|鸭肉|猪肉|牛肉|肉丝|肉末|汉堡|鸡块|鸡翅|鱼|虾|豆腐|豆类|扁豆|芸豆|egg|chicken|turkey|duck|pork|beef|fish|salmon|shrimp|tofu|bean|lentil/.test(s)
  };
}
function makeReport(date, state) {
  const yesterday = previousDate(date);
  const plan = state?.plan && typeof state.plan === 'object' ? state.plan : {};
  const day = state?.days?.[yesterday] || {};
  const meals = Array.isArray(day.meals) ? day.meals : [];
  const total = Math.round(meals.reduce((sum, meal) => sum + (number(meal.kcal) || 0), 0));
  const goal = number(plan.calories);
  const waterGoal = number(plan.water);
  const water = number(day.water);
  const observations = [];
  if (!meals.length) {
    observations.push('昨天没有餐食记录，暂时无法判断实际摄入情况。今天可以从第一餐开始记录。');
  } else {
    observations.push(`昨天记录了 ${meals.length} 项餐食，共 ${total} 千卡${goal ? `；与你设置的每日参考值 ${Math.round(goal)} 千卡相比，差额为 ${Math.round(total - goal)} 千卡` : ''}。`);
    if (goal && total > goal * 1.2) observations.push('记录的热量高于你设定的参考值。可以检查份量、饮料和额外调味是否都已计入，并关注长期趋势。');
    if (goal && total < goal * 0.7) observations.push('记录的热量明显低于你设定的参考值；也可能有漏记。先核对记录是否完整，再考虑今天的安排。');
    if (meals.length < 2) observations.push('昨天记录的餐食较少，回顾可能不完整。');
    const groups = meals.map(foodGroups);
    if (!groups.some(group => group.produce)) observations.push('记录中未看到蔬菜或水果；今天可在正餐加入蔬菜，并搭配一份水果。');
    if (!groups.some(group => group.protein)) observations.push('记录中未看到明确的蛋白质食物；今天可考虑鸡蛋、豆腐、鱼或瘦肉。');
  }
  if (waterGoal && water !== null && water < waterGoal) observations.push(`昨天记录饮水 ${Math.round(water)} 毫升，低于你设置的 ${Math.round(waterGoal)} 毫升参考值。`);
  const goals = [];
  if (goal) goals.push(`摄入参考：${Math.round(goal)} 千卡（你自行设定）`);
  if (number(plan.targetWeight)) goals.push(`阶段体重目标：${number(plan.targetWeight)} 公斤${plan.targetDate ? `，目标日期 ${plan.targetDate}` : ''}`);
  if (waterGoal) goals.push(`饮水参考：${Math.round(waterGoal)} 毫升（你自行设定）`);
  if (number(plan.exercise)) goals.push(`活动目标：${Math.round(number(plan.exercise))} 分钟`);
  if (number(plan.sleep)) goals.push(`睡眠目标：${number(plan.sleep)} 小时`);
  if (!goals.length) goals.push('你还没有设置个人目标。可在“我的健康计划”中填写适合自己的参考值。');
  const mealIdeas = chineseMealIdeas(date, goal);
  return { version: REPORT_VERSION, date, yesterday, mealCount: meals.length, totalKcal: total, observations, goals, mealIdeas, generatedAt: new Date().toISOString(), sourceUpdatedAt: state?.updatedAt || null, note: '仅根据已记录的食物名称、热量和个人目标生成；中式餐食是参考示例，不能据此判断营养素、盐糖含量或诊断健康问题。参考《中国居民膳食指南（2022）》与国家卫生健康委《成人肥胖食养指南（2024年版）》。' };
}
async function generateReport(env, date = chinaDate()) {
  const state = await readJson(env.BUCKET, STATE_KEY);
  const key = reportKey(date);
  const prior = await readJson(env.BUCKET, key);
  if (prior && prior.version === REPORT_VERSION && prior.sourceUpdatedAt === (state?.updatedAt || null)) return prior;
  const report = makeReport(date, state);
  await env.BUCKET.put(key, JSON.stringify(report), { httpMetadata: { contentType: 'application/json' } });
  return report;
}
async function handleMcp(request, env) {
  let rpc;
  try { rpc = await request.json(); } catch { return responseJson({ jsonrpc: '2.0', id: null, error: { code: -32700, message: 'Invalid JSON' } }, 400); }
  const reply = (result, error) => responseJson({ jsonrpc: '2.0', id: rpc.id ?? null, ...(error ? { error } : { result }) });
  if (rpc.method === 'server/discover') return reply({ supportedVersions: ['2026-07-28'], capabilities: { tools: {} } });
  if (rpc.method === 'tools/list') return reply({ tools: [
    { name: 'generate_daily_report', description: 'Generate and save today’s health journal morning report from yesterday’s records in China time. Safe to retry.', inputSchema: { type: 'object', properties: {}, additionalProperties: false } },
    { name: 'get_daily_report', description: 'Read today’s saved morning report without changing it.', inputSchema: { type: 'object', properties: {}, additionalProperties: false } }
  ] });
  if (rpc.method === 'tools/call') {
    const name = rpc.params?.name;
    try {
      let result;
      if (name === 'generate_daily_report') result = await generateReport(env);
      else if (name === 'get_daily_report') result = await readJson(env.BUCKET, reportKey(chinaDate()));
      else return reply(null, { code: -32601, message: 'Unknown tool' });
      return reply({ content: [{ type: 'text', text: JSON.stringify(result) }] });
    } catch (error) { return reply({ content: [{ type: 'text', text: `Report error: ${error.message}` }], isError: true }); }
  }
  return reply(null, { code: -32601, message: 'Unknown method' });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    if (path === '/mcp' && request.method === 'POST') return handleMcp(request, env);
    if (path === '/' || path === '/index.html') return new Response(PAGE_HTML, { headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' } });
    if (path === '/food-catalog.js') return new Response(FOOD_CATALOG_JS, { headers: { 'content-type': 'application/javascript; charset=utf-8', 'cache-control': 'public, max-age=86400' } });
    if (path === '/chinese-dishes.js') return new Response(CHINESE_DISHES_JS, { headers: { 'content-type': 'application/javascript; charset=utf-8', 'cache-control': 'no-store' } });
    if (path === '/food-all.js') return new Response(FOOD_ALL_JS, { headers: { 'content-type': 'application/javascript; charset=utf-8', 'cache-control': 'public, max-age=86400' } });
    if (!path.startsWith('/api/')) return new Response('Not found', { status: 404 });
    if (!request.headers.get('oai-authenticated-user-id')) return responseJson({ error: '请登录后使用云端报告' }, 401);
    if (!env.BUCKET) return responseJson({ error: '云端存储尚未就绪' }, 503);
    try {
      if (path === '/api/state' && request.method === 'GET') return responseJson(await readJson(env.BUCKET, STATE_KEY));
      if (path === '/api/state' && request.method === 'PUT') {
        const body = await request.text();
        if (body.length > 5_000_000) return responseJson({ error: '记录文件过大' }, 413);
        const state = JSON.parse(body);
        if (!state || typeof state !== 'object' || !state.plan || typeof state.plan !== 'object' || !state.days || typeof state.days !== 'object') return responseJson({ error: '记录格式无效' }, 400);
        await env.BUCKET.put(STATE_KEY, JSON.stringify({ plan: state.plan, days: state.days, updatedAt: state.updatedAt || new Date().toISOString() }), { httpMetadata: { contentType: 'application/json' } });
        return responseJson({ ok: true });
      }
      if (path === '/api/report' && request.method === 'GET') return responseJson(await readJson(env.BUCKET, reportKey(chinaDate())));
      if (path === '/api/report' && request.method === 'POST') return responseJson(await generateReport(env));
      return responseJson({ error: 'Not found' }, 404);
    } catch (error) { return responseJson({ error: `请求失败：${error.message}` }, 500); }
  }
};
