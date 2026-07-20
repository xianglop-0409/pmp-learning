// ===== 知识图谱·移动端知识树 =====
import { getHierarchy, getNodeById, getChildren } from './knowledge-graph.js';
import { progressColor } from './utils.js';
import router from './router.js';

const TreeView = {
  targetNodeId: null,
  expandedNodes: new Set(),
  searchQuery: '',

  async render() {
    const query = router.getQuery();
    this.targetNodeId = query.node || null;
    this.expandedNodes = new Set();
    this.searchQuery = '';
    if (this.targetNodeId) this._expandTo(this.targetNodeId);

    const { principles, domains, focusAreas, agileConcepts } = getHierarchy();
    const total = principles.length + domains.length + focusAreas.length + getChildren('domain-governance').length + getChildren('domain-scope').length + getChildren('domain-schedule').length + getChildren('domain-finance').length + getChildren('domain-stakeholder').length + getChildren('domain-resource').length + getChildren('domain-risk').length + agileConcepts.length;

    return `
      <div style="margin-bottom:12px;">
        <input type="text" id="treeSearch" placeholder="搜索知识点名称..." oninput="window._treeSearch(this.value)"
          style="width:100%;padding:10px 14px;border-radius:8px;border:1px solid var(--color-border);font-size:14px;background:var(--color-surface);color:var(--color-text);">
        <p style="font-size:11px;color:var(--color-text3);margin-top:4px;">共${total}个节点 · 点击展开 · 点名称跳学习页</p>
      </div>
      <div id="treeViewContainer">
        <div class="tree-section">
          <div class="tree-section-hdr" onclick="window._treeToggleSection(this)">💡 项目管理原则 <span>${principles.length}</span></div>
          <div class="tree-section-body">${principles.map(p => this._renderNode(p, 0)).join('')}</div>
        </div>
        <div class="tree-section">
          <div class="tree-section-hdr" onclick="window._treeToggleSection(this)">📂 绩效域 <span>${domains.length}域</span></div>
          <div class="tree-section-body">${domains.map(d => this._renderNode(d, 0)).join('')}</div>
        </div>
        <div class="tree-section">
          <div class="tree-section-hdr" onclick="window._treeToggleSection(this)">🎯 关注领域 <span>${focusAreas.length}</span></div>
          <div class="tree-section-body">${focusAreas.map(f => this._renderNode(f, 0)).join('')}</div>
        </div>
        <div class="tree-section">
          <div class="tree-section-hdr" onclick="window._treeToggleSection(this)">🔄 敏捷概念 <span>${agileConcepts.length}</span></div>
          <div class="tree-section-body">${agileConcepts.map(a => this._renderNode(a, 0)).join('')}</div>
        </div>
      </div>
    `;
  },

  _renderNode(node, depth) {
    const children = getChildren(node.id);
    const hasChildren = children.length > 0;
    const isTarget = this.targetNodeId === node.id;
    const expanded = this.expandedNodes.has(node.id);
    const isVisible = !this.searchQuery || node.name.zh.includes(this.searchQuery) || node.name.en?.toLowerCase().includes(this.searchQuery.toLowerCase());

    if (!isVisible) return '';

    return `
      <div class="tv-node" data-id="${node.id}" style="${isTarget ? 'background:var(--color-primary-bg);border-left:3px solid var(--color-primary);' : ''}">
        <div class="tv-node-row" onclick="${hasChildren ? `window._treeExpand('${node.id}')` : `window._nav('/learn?node=${node.id}')`}" style="padding-left:${12+depth*16}px;">
          ${hasChildren ? `<span class="tv-arrow" style="transform:${expanded?'rotate(90deg)':''}">▶</span>` : '<span style="width:14px;"></span>'}
          <span style="font-size:13px;font-weight:${hasChildren?'600':'400'};flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${node.name.zh}</span>
          <span class="tv-dot" style="background:${progressColor(node.correctRate||0)};"></span>
          <button class="tv-learn-btn" onclick="event.stopPropagation();window._nav('/learn?node=${node.id}')" title="去学习">📖</button>
        </div>
        ${hasChildren && expanded ? `<div class="tv-children">${children.map(c => this._renderNode(c, depth+1)).join('')}</div>` : ''}
      </div>
    `;
  },

  _expandTo(nodeId) {
    const node = getNodeById(nodeId);
    if (!node) return;
    if (node.parentId) {
      this.expandedNodes.add(node.parentId);
      this._expandTo(node.parentId);
    }
    this.expandedNodes.add(nodeId);
  },

  afterRender() {
    if (this.targetNodeId) {
      setTimeout(() => {
        const el = document.querySelector(`.tv-node[data-id="${this.targetNodeId}"]`);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
    }
  },
};

function getTotalUnits() {
  const { principles, domains, focusAreas, agileConcepts } = getHierarchy();
  return principles.length + domains.length + focusAreas.length + agileConcepts.length;
}

window._treeExpand = (id) => {
  const el = document.querySelector(`.tv-node[data-id="${id}"]`);
  const children = el?.querySelector('.tv-children');
  const arrow = el?.querySelector('.tv-arrow');
  if (children) {
    const isOpen = children.style.display !== 'none';
    children.style.display = isOpen ? 'none' : 'block';
    if (arrow) arrow.style.transform = isOpen ? '' : 'rotate(90deg)';
  }
};

window._treeToggleSection = (hdr) => {
  const body = hdr.nextElementSibling;
  body.style.display = body.style.display === 'none' ? '' : 'none';
};

window._treeSearch = (q) => {
  TreeView.searchQuery = q;
  const container = document.getElementById('treeViewContainer');
  if (container) {
    // Simple filter: hide/show nodes
    document.querySelectorAll('.tv-node').forEach(el => {
      const text = el.textContent || '';
      el.style.display = !q || text.includes(q) ? '' : 'none';
    });
  }
};

export default TreeView;
