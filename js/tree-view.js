// ===== 知识图谱·移动端交互式Canvas力导向图 =====
import { getHierarchy, getNodeById, getChildren, getRelatedNodes } from './knowledge-graph.js';
import db from './db.js';
import { progressColor, toast } from './utils.js';
import router from './router.js';

const TreeView = {
  nodes: [], links: [], targetNodeId: null,
  simRunning: false, canvas: null, ctx: null,
  selectedNode: null, transform: { x: 0, y: 0, s: 1 },
  dragging: false, lastTouch: null,

  async render() {
    const query = router.getQuery();
    this.targetNodeId = query.node || null;

    // Build graph data
    const { principles, domains, focusAreas, processes } = getHierarchy();
    this.nodes = []; this.links = [];

    const addNode = (n, group) => {
      this.nodes.push({ id: n.id, name: n.name, type: n.type, group, parentId: n.parentId, domain: n.domain, correctRate: null });
    };
    principles.forEach(n => addNode(n, 'principle'));
    domains.forEach(n => addNode(n, 'domain'));
    focusAreas.forEach(n => addNode(n, 'focus_area'));
    processes.forEach(n => addNode(n, 'process'));

    // Build links
    this.nodes.forEach(n => {
      if (n.parentId && this.nodes.find(x => x.id === n.parentId)) {
        this.links.push({ source: n.parentId, target: n.id });
      }
    });

    // Load progress
    const allProgress = await db.getAllQuestionProgress();
    this.nodes.forEach(n => {
      const prog = allProgress.filter(p => p.domain === n.domain);
      const total = prog.reduce((s, p) => s + (p.attempts || 0), 0);
      const correct = prog.reduce((s, p) => s + (p.correct || 0), 0);
      n.correctRate = total > 0 ? Math.round((correct / total) * 100) : null;
    });

    this.transform = { x: 0, y: 0, s: 1 };
    this.selectedNode = null;

    return `
      <div style="margin-bottom:8px;display:flex;gap:8px;align-items:center;">
        <span style="font-weight:600;">🕸️ 知识图谱</span>
        <span style="font-size:11px;color:var(--color-text3);">${this.nodes.length}节点</span>
        <span style="flex:1;"></span>
        <button class="btn btn-sm btn-secondary" onclick="window._tvReset()">重置</button>
      </div>
      <canvas id="tvCanvas" style="width:100%;height:calc(100vh - 280px);background:var(--color-surface);border-radius:8px;border:1px solid var(--color-border);touch-action:none;"></canvas>
      <div id="tvDetail" style="margin-top:8px;min-height:60px;"></div>
    `;
  },

  afterRender() {
    this.canvas = document.getElementById('tvCanvas');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');

    const resize = () => {
      const rect = this.canvas.getBoundingClientRect();
      this.canvas.width = rect.width * devicePixelRatio;
      this.canvas.height = rect.height * devicePixelRatio;
      this.ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
      this._layout(rect.width, rect.height);
      this._draw();
    };
    resize();
    window.addEventListener('resize', () => setTimeout(resize, 200));

    // Touch/Mouse events
    this.canvas.addEventListener('touchstart', e => this._onDown(e), { passive: false });
    this.canvas.addEventListener('touchmove', e => this._onMove(e), { passive: false });
    this.canvas.addEventListener('touchend', e => this._onUp(e));
    this.canvas.addEventListener('mousedown', e => this._onDown(e));
    this.canvas.addEventListener('mousemove', e => this._onMove(e));
    this.canvas.addEventListener('mouseup', e => this._onUp(e));
    this.canvas.addEventListener('click', e => this._onClick(e));
    this.canvas.addEventListener('wheel', e => { e.preventDefault(); this._onZoom(e); }, { passive: false });
  },

  _layout(w, h) {
    const cx = w / 2, cy = h / 2;
    const groups = { principle: [], domain: [], focus_area: [], process: [] };
    this.nodes.forEach(n => groups[n.group]?.push(n));

    // Arrange in concentric rings
    const rings = [
      { key: 'principle', r: Math.min(w, h) * 0.15, count: groups.principle.length },
      { key: 'domain', r: Math.min(w, h) * 0.30, count: groups.domain.length },
      { key: 'focus_area', r: Math.min(w, h) * 0.45, count: groups.focus_area.length },
      { key: 'process', r: Math.min(w, h) * 0.60, count: groups.process.length },
    ];

    rings.forEach(ring => {
      const items = groups[ring.key];
      items.forEach((n, i) => {
        const angle = (2 * Math.PI * i / ring.count) - Math.PI / 2;
        n.x = cx + ring.r * Math.cos(angle);
        n.y = cy + ring.r * Math.sin(angle);
        n.radius = ring.key === 'process' ? 10 : ring.key === 'domain' ? 20 : 14;
      });
    });
  },

  _draw() {
    const { ctx, canvas, nodes, links, transform } = this;
    const w = canvas.width / devicePixelRatio, h = canvas.height / devicePixelRatio;
    ctx.clearRect(0, 0, w, h);

    ctx.save();
    ctx.translate(transform.x, transform.y);
    ctx.scale(transform.s, transform.s);

    // Draw links
    links.forEach(l => {
      const s = nodes.find(n => n.id === l.source);
      const t = nodes.find(n => n.id === l.target);
      if (!s || !t) return;
      const isSelected = this.selectedNode && (s.id === this.selectedNode.id || t.id === this.selectedNode.id);
      ctx.beginPath();
      ctx.moveTo(s.x, s.y); ctx.lineTo(t.x, t.y);
      ctx.strokeStyle = isSelected ? '#6366f1' : 'rgba(148,163,184,0.3)';
      ctx.lineWidth = isSelected ? 2 : 1;
      ctx.stroke();
    });

    // Draw nodes
    const colorMap = { principle: '#f59e0b', domain: '#6366f1', focus_area: '#22c55e', process: '#3b82f6' };
    nodes.forEach(n => {
      const r = n.radius || 10;
      ctx.beginPath();
      ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
      const fillColor = n.correctRate === null ? '#cbd5e1' : progressColor(n.correctRate);
      ctx.fillStyle = this.selectedNode?.id === n.id ? colorMap[n.group] : fillColor;
      ctx.fill();
      ctx.strokeStyle = colorMap[n.group];
      ctx.lineWidth = this.selectedNode?.id === n.id ? 3 : 1;
      ctx.stroke();

      // Label (on outer ring only)
      if (n.group !== 'process') {
        ctx.fillStyle = '#64748b';
        ctx.font = `${n.group === 'domain' ? 11 : 9}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText(n.name.zh.slice(0, n.group === 'domain' ? 4 : 6), n.x, n.y + r + 12);
      }
    });

    ctx.restore();

    // Legend
    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('🟢已掌握 🟡学习中 🔴薄弱 ⚪未开始', 8, h - 8);
    ctx.fillText('💡原则 📂域 🎯关注 ⚙️过程', 8, h - 22);
  },

  _findNode(ex, ey) {
    const { transform } = this;
    const x = (ex - transform.x) / transform.s;
    const y = (ey - transform.y) / transform.s;
    for (let i = this.nodes.length - 1; i >= 0; i--) {
      const n = this.nodes[i];
      const r = (n.radius || 10) + 4;
      if (Math.hypot(x - n.x, y - n.y) < r) return n;
    }
    return null;
  },

  _onDown(e) {
    e.preventDefault();
    const p = e.touches ? e.touches[0] : e;
    this.dragging = true;
    this.lastTouch = { x: p.clientX, y: p.clientY, tx: this.transform.x, ty: this.transform.y };
  },

  _onMove(e) {
    if (!this.dragging) return;
    const p = e.touches ? e.touches[0] : e;
    if (this.lastTouch) {
      this.transform.x = this.lastTouch.tx + (p.clientX - this.lastTouch.x);
      this.transform.y = this.lastTouch.ty + (p.clientY - this.lastTouch.y);
      this._draw();
    }
  },

  _onUp(e) { this.dragging = false; this.lastTouch = null; },

  _onClick(e) {
    const rect = this.canvas.getBoundingClientRect();
    const node = this._findNode(e.clientX - rect.left, e.clientY - rect.top);
    if (node) {
      this.selectedNode = node;
      this._showDetail(node);
      this._draw();
    } else {
      this.selectedNode = null;
      document.getElementById('tvDetail').innerHTML = '<p style="text-align:center;color:var(--color-text3);font-size:12px;">👆 点击节点查看详情 · 拖拽平移 · 双指缩放</p>';
      this._draw();
    }
  },

  _onZoom(e) {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    this.transform.s = Math.max(0.3, Math.min(3, this.transform.s * delta));
    this._draw();
  },

  _showDetail(node) {
    const detail = document.getElementById('tvDetail');
    if (!detail) return;
    const data = getNodeById(node.id);
    if (!data) return;

    const typeMap = { principle: '原则', domain: '绩效域', focus_area: '关注领域', process: '过程' };
    const info = data.description?.zh?.slice(0, 100) || data.examTips?.zh?.slice(0, 100) || '';

    detail.innerHTML = `
      <div class="card" style="padding:14px;">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
          <span class="tag tag-blue">${typeMap[node.group] || node.group}</span>
          <strong>${node.name.zh}</strong>
          ${node.correctRate !== null ? `<span style="color:${progressColor(node.correctRate)};font-weight:600;">${node.correctRate}%</span>` : '<span style="color:#94a3b8;">未开始</span>'}
        </div>
        ${info ? `<p style="font-size:12px;color:var(--color-text2);line-height:1.6;">${info}...</p>` : ''}
        <div style="display:flex;gap:8px;margin-top:10px;">
          <button class="btn btn-primary btn-sm" onclick="window._nav('/learn?node=${node.id}')">📖 学习</button>
          <button class="btn btn-secondary btn-sm" onclick="window._nav('/practice?domain=${node.domain||''}&node=${node.id}&auto=1')">✏️ 练习</button>
        </div>
      </div>
    `;
  }
};

window._tvReset = () => {
  TreeView.transform = { x: 0, y: 0, s: 1 };
  TreeView.selectedNode = null;
  TreeView._draw();
  document.getElementById('tvDetail').innerHTML = '<p style="text-align:center;color:var(--color-text3);font-size:12px;">👆 点击节点查看详情 · 拖拽平移 · 双指缩放</p>';
};

export default TreeView;
