// ===== 工具函数 =====

/** 动态加载外部脚本（返回Promise，10秒超时） */
export function loadScript(url, timeoutMs = 10000) {
  return new Promise((resolve, reject) => {
    // 检查是否已加载
    const existing = document.querySelector(`script[data-src="${url}"]`);
    if (existing) return resolve();

    const script = document.createElement('script');
    script.src = url;
    script.setAttribute('data-src', url);

    const timer = setTimeout(() => {
      script.remove();
      reject(new Error(`Script load timeout: ${url}`));
    }, timeoutMs);

    script.onload = () => {
      clearTimeout(timer);
      resolve();
    };
    script.onerror = () => {
      clearTimeout(timer);
      script.remove();
      reject(new Error(`Script load failed: ${url}`));
    };
    document.head.appendChild(script);
  });
}

/** 预加载必须库，返回加载成功的库列表 */
export async function preloadCDN() {
  const results = [];
  // Dexie (必须) — 本地优先，CDN兜底
  try {
    await loadScript('./js/vendor/dexie.min.js');
    console.log('✅ Dexie loaded (local)');
    results.push('dexie');
  } catch (e) {
    console.warn('⚠️ Local Dexie failed, trying CDN...');
    try {
      await loadScript('https://unpkg.com/dexie@4/dist/dexie.min.js');
      console.log('✅ Dexie loaded (unpkg)');
      results.push('dexie');
    } catch (e2) {
      try {
        await loadScript('https://cdn.jsdelivr.net/npm/dexie@4/dist/dexie.min.js');
        console.log('✅ Dexie loaded (jsdelivr)');
        results.push('dexie');
      } catch (e3) {
        console.error('❌ Dexie all sources failed');
      }
    }
  }
  // D3 & Chart.js 按需加载，也优先本地
  return results;
}

/** 生成唯一ID */
export function uid(prefix = '') {
  return prefix + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

/** 格式化日期 YYYY-MM-DD */
export function formatDate(d) {
  const date = d ? new Date(d) : new Date();
  return date.toISOString().slice(0, 10);
}

/** 格式化日期时间 */
export function formatDateTime(d) {
  const date = new Date(d);
  const y = date.getFullYear();
  const mo = String(date.getMonth() + 1).padStart(2, '0');
  const da = String(date.getDate()).padStart(2, '0');
  const h = String(date.getHours()).padStart(2, '0');
  const mi = String(date.getMinutes()).padStart(2, '0');
  return `${y}-${mo}-${da} ${h}:${mi}`;
}

/** 格式化分钟数为 Xh Ym */
export function formatMinutes(mins) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}小时${m}分钟` : `${m}分钟`;
}

/** 防抖 */
export function debounce(fn, delay = 300) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

/** 节流 */
export function throttle(fn, limit = 300) {
  let inThrottle;
  return function (...args) {
    if (!inThrottle) {
      fn.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/** 深拷贝 */
export function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

/** 随机打乱数组 (Fisher-Yates) */
export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** 按权重随机抽取 */
export function weightedSample(arr, weightFn, count) {
  const items = arr.map(item => ({ item, weight: weightFn(item) }));
  const totalWeight = items.reduce((s, x) => s + Math.max(x.weight, 0.01), 0);
  const result = new Set();
  const pool = [...items];
  while (result.size < Math.min(count, arr.length)) {
    let r = Math.random() * totalWeight;
    for (let i = 0; i < pool.length; i++) {
      r -= Math.max(pool[i].weight, 0.01);
      if (r <= 0) {
        result.add(pool[i].item);
        break;
      }
    }
  }
  return [...result];
}

/** 百分比计算 */
export function pct(part, total) {
  if (total === 0) return 0;
  return Math.round((part / total) * 100);
}

/** 进度颜色 */
export function progressColor(rate) {
  if (rate === null || rate === undefined || rate < 0) return '#9ca3af'; // 灰色 未开始
  if (rate >= 70) return '#22c55e'; // 绿色 掌握
  if (rate >= 30) return '#f59e0b'; // 黄色 一般
  return '#ef4444'; // 红色 薄弱
}

/** 进度状态文字 */
export function progressLabel(rate) {
  if (rate === null || rate === undefined || rate < 0) return '未开始';
  if (rate >= 70) return '已掌握';
  if (rate >= 30) return '学习中';
  return '薄弱';
}

/** Toast 提示 */
export function toast(msg, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const el = document.createElement('div');
  el.className = `toast toast-${type}`;
  el.textContent = msg;
  container.appendChild(el);
  setTimeout(() => {
    el.classList.add('toast-out');
    setTimeout(() => el.remove(), 300);
  }, 2500);
}

/** 模态窗 */
export function showModal(html, opts = {}) {
  const overlay = document.getElementById('modalOverlay');
  const content = document.getElementById('modalContent');
  if (!overlay || !content) return;

  content.innerHTML = html;
  content.style.maxWidth = opts.width || '640px';
  overlay.style.display = 'flex';

  const close = () => {
    overlay.style.display = 'none';
    content.innerHTML = '';
    if (opts.onClose) opts.onClose();
  };

  overlay.onclick = (e) => {
    if (e.target === overlay) close();
  };

  // 绑定关闭按钮
  const closeBtn = content.querySelector('.modal-close');
  if (closeBtn) closeBtn.onclick = close;

  return { close, content };
}

/** 确认对话框 */
export function confirm(msg) {
  return new Promise(resolve => {
    const m = showModal(`
      <div class="confirm-box">
        <p>${msg}</p>
        <div class="confirm-actions">
          <button class="btn btn-secondary modal-close">取消</button>
          <button class="btn btn-primary" id="confirmOk">确认</button>
        </div>
      </div>
    `, { width: '400px' });
    const okBtn = m.content.querySelector('#confirmOk');
    okBtn.onclick = () => { m.close(); resolve(true); };
    // 取消按钮绑定在 showModal 中自动关闭
    const cancelBtn = m.content.querySelector('.modal-close');
    cancelBtn.onclick = () => { m.close(); resolve(false); };
  });
}

/** HTML转义 */
export function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/** 获取设备类型 */
export function isMobile() {
  return window.innerWidth < 768;
}

/** 响应式回调 */
export function onResize(fn) {
  window.addEventListener('resize', debounce(fn, 200));
}

/** 数字跳动动画：从0平滑过渡到目标值 */
export function animateCount(el, target, duration = 800) {
  if (!el) return;
  const start = 0;
  const startTime = performance.now();

  function update(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    // easeOutCubic 缓动
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(start + (target - start) * eased);
    el.textContent = current;
    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      el.textContent = target;
      // 到达目标后触发微脉冲
      el.classList.add('counting');
      setTimeout(() => el.classList.remove('counting'), 400);
    }
  }

  requestAnimationFrame(update);
}

/** 为多个统计卡片添加交错入场动画 */
export function staggerCards(selector, baseDelay = 60) {
  const cards = document.querySelectorAll(selector);
  cards.forEach((card, i) => {
    card.style.animationDelay = `${i * baseDelay}ms`;
    card.classList.add('animate-in');
  });
}
