// ===== Hash 路由 =====

class Router {
  constructor() {
    this.routes = new Map();
    this.currentRoute = null;
    this.beforeHooks = [];
  }

  /** 注册路由 */
  on(path, handler) {
    this.routes.set(path, handler);
    return this;
  }

  /** 路由守卫 */
  beforeEach(fn) {
    this.beforeHooks.push(fn);
    return this;
  }

  /** 导航到指定路径 */
  navigate(path) {
    window.location.hash = '#' + path;
  }

  /** 替换当前路径 */
  replace(path) {
    window.location.replace('#' + path);
  }

  /** 获取当前路径（不含查询参数） */
  getPath() {
    const raw = window.location.hash.slice(1) || '/dashboard';
    return raw.split('?')[0];  // 去掉 ? 后的查询参数
  }

  /** 获取查询参数 */
  getQuery() {
    const raw = window.location.hash.slice(1) || '';
    const qIdx = raw.indexOf('?');
    if (qIdx < 0) return {};
    const params = {};
    new URLSearchParams(raw.slice(qIdx)).forEach((v, k) => { params[k] = v; });
    return params;
  }

  /** 启动路由监听 */
  start() {
    window.addEventListener('hashchange', () => this._handle());
    // 初始加载
    if (!window.location.hash) {
      window.location.hash = '#/dashboard';
    } else {
      this._handle();
    }
  }

  async _handle() {
    const path = this.getPath();

    // 运行守卫
    for (const hook of this.beforeHooks) {
      const result = await hook(path);
      if (result === false) return;
      if (typeof result === 'string') {
        this.navigate(result);
        return;
      }
    }

    // 查找匹配的路由
    let handler = this.routes.get(path);

    // 尝试前缀匹配
    if (!handler) {
      for (const [pattern, h] of this.routes) {
        if (path.startsWith(pattern + '/') || path === pattern) {
          handler = h;
          break;
        }
      }
    }

    // 404
    if (!handler) {
      handler = this.routes.get('*') || (() => '<p>页面不存在</p>');
    }

    this.currentRoute = path;

    // 执行处理器
    try {
      const mainContent = document.getElementById('mainContent');
      const result = await handler(path);
      if (typeof result === 'string') {
        mainContent.innerHTML = result;
      } else if (result instanceof HTMLElement) {
        mainContent.innerHTML = '';
        mainContent.appendChild(result);
      }

      // 更新导航高亮
      this._updateNavHighlight(path);

      // 滚动到顶部
      mainContent.scrollTop = 0;
    } catch (err) {
      console.error('Route error:', err);
      document.getElementById('mainContent').innerHTML =
        `<div class="error-page"><h2>出错了</h2><p>${err.message}</p></div>`;
    }
  }

  _updateNavHighlight(path) {
    // 侧边栏
    document.querySelectorAll('.nav-item').forEach(el => {
      el.classList.toggle('active', el.dataset.route === path);
    });
    // 底部Tab
    document.querySelectorAll('.tab-item').forEach(el => {
      el.classList.toggle('active', el.dataset.route === path);
    });
  }
}

// 全局单例
const router = new Router();
export default router;
