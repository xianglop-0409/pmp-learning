// ===== PMP 联动学习机 — 应用主入口 =====

import router from './router.js';
import db from './db.js';
import KNOWLEDGE_NODES, { getHierarchy, getTotalKnowledgeUnits, getNodeById, getChildren } from './knowledge-graph.js';
import { toast, isMobile, onResize, pct, progressColor, progressLabel, preloadCDN, loadScript } from './utils.js';

// ===== 页面状态更新（调试用） =====
function updateStatus(msg) {
  const main = document.getElementById('mainContent');
  if (main && main.querySelector('.page-loading')) {
    main.innerHTML = `
      <div class="page-loading">
        <div class="spinner"></div>
        <p>${msg}</p>
        <p style="font-size:11px;color:#64748b;margin-top:4px;">调试模式</p>
      </div>
    `;
  }
  console.log('[APP]', msg);
}

// ===== 全局错误处理 =====
window.addEventListener('error', (e) => {
  console.error('[APP] Global error:', e.message, e.filename, e.lineno);
  const main = document.getElementById('mainContent');
  if (main) {
    main.innerHTML = `
      <div style="padding:40px;text-align:center;">
        <div style="font-size:48px;">💥</div>
        <h3>JavaScript 错误</h3>
        <p style="color:#a0aec0;word-break:break-all;">${e.message}</p>
        <p style="font-size:11px;color:#64748b;">文件: ${e.filename} 行: ${e.lineno}</p>
        <button onclick="location.reload()" style="margin-top:16px;padding:10px 24px;background:#6366f1;color:#fff;border:none;border-radius:6px;cursor:pointer;">🔄 刷新</button>
      </div>
    `;
  }
});

window.addEventListener('unhandledrejection', (e) => {
  console.error('[APP] Unhandled rejection:', e.reason);
});

// ===== 全局状态 =====
const AppState = {
  ready: false,
  mobile: isMobile(),
  knowledgeNodes: KNOWLEDGE_NODES,
};

// ===== 初始化 =====
async function init() {
  try {
    updateStatus('步骤 1/6: 加载 CDN 资源...');

    // 1. 预加载核心库（本地优先）
    const cdnLoaded = await preloadCDN();
    if (!cdnLoaded.includes('dexie')) {
      throw new Error('Dexie.js 加载失败');
    }
    // 预加载 D3.js（图谱页需要，避免首次打开时等待）
    if (typeof d3 === 'undefined') {
      try { await loadScript('./js/vendor/d3.min.js'); console.log('✅ D3 preloaded'); }
      catch(e) { console.warn('⚠️ D3 preload failed, will try on graph page'); }
    }
    console.log('✅ Core libs loaded:', cdnLoaded);

    updateStatus('步骤 2/6: 初始化数据库...');

    // 2. 初始化数据库
    await db.init();
    console.log('✅ Database ready');

    updateStatus('步骤 3/6: 设置主题...');

    // 3. 设置主题
    const theme = await db.getSetting('theme') || 'light';
    document.documentElement.setAttribute('data-theme', theme);

    updateStatus('步骤 4/6: 设置导航...');

    // 4. 侧边栏切换
    setupSidebar();

    // 5. 响应式监听
    onResize(() => {
      AppState.mobile = isMobile();
    });

    updateStatus('步骤 5/6: 注册路由...');

    // 6. 注册路由
    registerRoutes();

    updateStatus('步骤 6/6: 启动应用...');

    AppState.ready = true;
    console.log('✅ App ready —', getTotalKnowledgeUnits().total, '知识单元');

    // 7. 启动路由
    router.start();

    // 检查首次访问
    const visited = await db.getSetting('has_visited');
    if (!visited) {
      setTimeout(() => toast('欢迎！三本教材共127个知识单元已就绪 📚', 'success'), 500);
      await db.setSetting('has_visited', '1');
    }
  } catch (err) {
    console.error('[APP] Init failed:', err);
    document.getElementById('mainContent').innerHTML = `
      <div style="text-align:center;padding:60px 20px;">
        <div style="font-size:48px;margin-bottom:16px;">⚠️</div>
        <h3>初始化失败</h3>
        <p style="color:#a0aec0;margin:12px 0;">${err.message || String(err)}</p>
        <p style="font-size:12px;color:#64748b;">${err.stack ? err.stack.split('\n').slice(1, 4).join('<br>') : ''}</p>
        <button onclick="location.reload()" style="margin-top:16px;padding:10px 24px;background:#6366f1;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:14px;">🔄 刷新重试</button>
      </div>
    `;
  }
}

// ===== 侧边栏 =====
function setupSidebar() {
  const toggle = document.getElementById('menuToggle');
  const sidebar = document.getElementById('sidebar');

  if (toggle && sidebar) {
    toggle.addEventListener('click', () => {
      sidebar.classList.toggle('open');
    });
    document.getElementById('mainContent').addEventListener('click', () => {
      sidebar.classList.remove('open');
    });
  }
}

// ===== 注册路由 =====
function registerRoutes() {
  // 知识学习（新增）
  router.on('/learn', async () => {
    const mod = await import('./learn.js');
    return mod.default.render();
  });

  router.on('/wrong-book', async () => {
    const mod = await import('./wrong-book.js');
    return mod.default.render();
  });

  router.on('/glossary', async () => {
    const mod = await import('./glossary.js');
    const html = await mod.default.render();
    requestAnimationFrame(() => {
      if (mod.default.afterRender) mod.default.afterRender();
    });
    return html;
  });

  router.on('/dashboard', async () => {
    const mod = await import('./dashboard.js');
    const html = await mod.default.render();
    requestAnimationFrame(() => {
      if (mod.default.afterRender) mod.default.afterRender();
    });
    return html;
  });

  router.on('/graph', async () => {
    if (AppState.mobile) {
      const mod = await import('./tree-view.js');
      const html = await mod.default.render();
      // 渲染后自动展开并滚动到目标节点
      requestAnimationFrame(() => {
        if (mod.default.afterRender) mod.default.afterRender();
      });
      return html;
    } else {
      const mod = await import('./graph-view.js');
      const html = await mod.default.render();
      requestAnimationFrame(() => mod.default.mount());
      return html;
    }
  });

  router.on('/questions', async () => {
    const mod = await import('./questions.js');
    return mod.default.render();
  });

  router.on('/practice', async () => {
    const mod = await import('./practice.js');
    return mod.default.render();
  });

  router.on('/exam', async () => {
    const mod = await import('./exam.js');
    return mod.default.render();
  });

  router.on('/analytics', async () => {
    const mod = await import('./analytics.js');
    const html = await mod.default.render();
    requestAnimationFrame(() => mod.default.mount());
    return html;
  });

  router.on('*', () => {
    return `
      <div class="empty-state">
        <div class="empty-icon">🔍</div>
        <h3>页面未找到</h3>
        <p>请使用导航菜单访问其他页面</p>
      </div>
    `;
  });
}

// ===== 导出 =====
export { AppState, db, router };
export { KNOWLEDGE_NODES, getHierarchy, getTotalKnowledgeUnits, getNodeById, getChildren };
export { toast, pct, progressColor, progressLabel, isMobile };

// ===== 全局导航 =====
window._nav = (path) => {
  router.navigate(path);
};

// ===== 启动 =====
init();
