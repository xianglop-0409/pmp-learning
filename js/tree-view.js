// ===== 树形层级视图（手机端知识图谱） =====
// Phase 2 实现

import { getHierarchy, getNodeById, getChildren } from './knowledge-graph.js';
import { progressColor, pct } from './utils.js';
import router from './router.js';

const TreeView = {
  targetNodeId: null,

  async render() {
    // 读取路由参数
    const query = router.getQuery();
    this.targetNodeId = query.node || null;

    const { principles, domains, focusAreas, processes, agileConcepts } = getHierarchy();

    return `
      <div class="card" style="margin-bottom:16px;">
        <span style="font-weight:600;">🕸️ 知识图谱 · 树形视图</span>
        <span style="font-size:12px;color:var(--color-text3);margin-left:8px;">${getTotalUnits()}个节点</span>
        ${this.targetNodeId ? `<span style="font-size:12px;color:var(--color-primary);margin-left:8px;">🎯 已定位到指定节点</span>` : ''}
      </div>
      <div class="tree-view" id="treeView">
        <h4 style="margin:12px 0 8px;color:var(--color-primary);">📌 项目管理原则</h4>
        ${principles.map(p => this._renderNode(p, 0)).join('')}

        <h4 style="margin:12px 0 8px;color:var(--color-success);">📂 绩效域</h4>
        ${domains.map(d => this._renderNode(d, 0)).join('')}

        <h4 style="margin:12px 0 8px;color:var(--color-warning);">🎯 关注领域（过程组）</h4>
        ${focusAreas.map(f => this._renderNode(f, 0)).join('')}

        <h4 style="margin:12px 0 8px;color:var(--color-info);">🔄 敏捷概念</h4>
        ${agileConcepts.map(a => this._renderNode(a, 0)).join('')}
      </div>
    `;
  },

  /** 渲染后调用：滚动到目标节点 */
  afterRender() {
    if (!this.targetNodeId) return;
    // 延迟等 DOM 渲染完毕
    setTimeout(() => {
      // 展开所有上级节点
      this._expandAncestors(this.targetNodeId);
      // 滚动到目标节点
      const targetEl = document.querySelector(`.tree-node[data-id="${this.targetNodeId}"]`);
      if (targetEl) {
        targetEl.classList.add('tree-highlight');
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // 高亮效果
        targetEl.style.background = 'var(--color-primary-bg)';
        targetEl.style.borderLeft = '3px solid var(--color-primary)';
        targetEl.style.paddingLeft = '8px';
        targetEl.style.borderRadius = '4px';
      }
    }, 300);
  },

  /** 递归展开所有祖先节点 */
  _expandAncestors(nodeId) {
    const node = getNodeById(nodeId);
    if (!node) return;
    if (node.parentId) {
      this._expandAncestors(node.parentId);
    }
    // 展开当前节点的父容器
    const parentNode = node.parentId ? getNodeById(node.parentId) : null;
    if (parentNode) {
      const parentEl = document.querySelector(`.tree-node[data-id="${parentNode.id}"]`);
      if (parentEl && !parentEl.classList.contains('expanded')) {
        parentEl.classList.add('expanded');
      }
    }
    // 如果当前节点有子节点，也展开它自己
    const el = document.querySelector(`.tree-node[data-id="${nodeId}"]`);
    if (el && getChildren(nodeId).length > 0 && !el.classList.contains('expanded')) {
      el.classList.add('expanded');
    }
  },

  _renderNode(node, depth) {
    const children = getChildren(node.id);
    const hasChildren = children.length > 0;
    const isTarget = this.targetNodeId === node.id;
    const nodeClass = hasChildren ? 'tree-node' : 'tree-node';

    return `
      <div class="${nodeClass}${isTarget ? ' tree-highlight' : ''}" data-id="${node.id}">
        <div class="tree-node-header" onclick="window._treeToggle('${node.id}')" ondblclick="window._treeNodeDbClick('${node.id}')" style="padding-left:${12 + depth * 16}px;cursor:pointer;" title="单击展开 · 双击跳转学习页">
          <span class="tree-node-icon">${this._typeIcon(node.type)}</span>
          <span class="tree-node-name" style="${isTarget ? 'font-weight:700;color:var(--color-primary);' : ''}">${node.name.zh}${isTarget ? ' 🎯' : ''}</span>
          <span class="tree-node-status" style="background:${progressColor(node.correctRate || 0)};"></span>
          <span style="color:var(--color-text3);font-size:10px;">${node.type === 'process' ? node.focusArea : ''}</span>
        </div>
        ${hasChildren ? `<div class="tree-children">${children.map(c => this._renderNode(c, depth + 1)).join('')}</div>` : ''}
      </div>
    `;
  },

  _typeIcon(type) {
    const icons = { principle: '💡', domain: '📂', focus_area: '🎯', process: '⚙️', agile_concept: '🔄' };
    return icons[type] || '📄';
  },
};

function getTotalUnits() {
  const { principles, domains, focusAreas, processes, agileConcepts } = getHierarchy();
  return principles.length + domains.length + focusAreas.length + processes.length + agileConcepts.length;
}

window._treeToggle = (id) => {
  const el = document.querySelector(`.tree-node[data-id="${id}"]`);
  if (el) {
    el.classList.toggle('expanded');
    // 高亮当前节点
    document.querySelectorAll('.tree-node-header').forEach(h => h.style.background = '');
    const header = el.querySelector('.tree-node-header');
    if (header) header.style.background = 'var(--color-primary-bg)';
  }
};

// 双击跳转到学习页
window._treeNodeDbClick = (id) => {
  window._nav('/learn?node=' + id);
};

export default TreeView;
