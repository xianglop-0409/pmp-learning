// Step-by-step import test
const main = document.getElementById('mainContent');
function log(step, msg) {
  console.log(step, msg);
  main.innerHTML = `
    <div style="padding:40px;font-family:monospace;">
      <h3>逐个导入测试</h3>
      <div style="margin-top:16px;">${step}: ${msg}</div>
    </div>
  `;
}

async function test() {
  try {
    log('1/6', '导入 utils.js ...');
    const u = await import('/js/utils.js');

    log('2/6', '导入 router.js ...');
    const r = await import('/js/router.js');

    log('3/6', '导入 db.js ...');
    // This needs Dexie - load it first
    await u.loadScript('https://unpkg.com/dexie@4/dist/dexie.min.js');
    const d = await import('/js/db.js');

    log('4/6', '导入 knowledge-graph.js ...');
    const kg = await import('/js/knowledge-graph.js');

    log('5/6', '加载 CDN + 初始化数据库 ...');
    const cdnOk = await u.preloadCDN();
    await d.default.init();

    log('✅ 完成', '所有模块加载成功！');
  } catch (e) {
    log('❌ 失败', e.message + '\n' + (e.stack || '').split('\n').slice(0, 4).join('\n'));
    console.error(e);
  }
}

test();
