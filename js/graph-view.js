// ===== D3 力导向知识图谱（桌面端） =====

import { getHierarchy, getNodeById, getChildren, getRelatedNodes } from './knowledge-graph.js';
import db from './db.js';
import { progressColor, pct, escapeHtml, loadScript } from './utils.js';
import router from './router.js';

const GraphView = {
  simulation: null,
  svg: null,
  nodes: [],
  links: [],
  selectedNode: null,
  targetNodeId: null,  // 外部传入的聚焦节点ID

  async render() {
    // 读取路由参数，获取需要高亮的节点
    const query = router.getQuery();
    this.targetNodeId = query.node || null;

    return `
      <div class="card" style="margin-bottom:16px;">
        <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;">
          <span style="font-weight:600;">🕸️ 知识图谱</span>
          <span style="font-size:12px;color:var(--color-text3);">6原则 → 7域 → 5关注领域 → 43过程 · 共76节点</span>
          <span style="flex:1;"></span>
          <span style="font-size:11px;color:var(--color-text2);">💡 拖拽节点 | 滚轮缩放 | 点击展开详情</span>
          <button class="btn btn-sm btn-secondary" onclick="window._gReset()">重置视图</button>
        </div>
        <!-- 图例 -->
        <div style="display:flex;gap:16px;font-size:11px;color:var(--color-text2);margin-top:8px;flex-wrap:wrap;">
          <span>💡 原则</span><span>📂 绩效域</span><span>🎯 关注领域</span><span>⚙️ 过程</span>
          <span style="margin-left:8px;">🟢已掌握</span><span>🟡学习中</span><span>🔴薄弱</span><span>⚪未开始</span>
        </div>
      </div>
      <div class="graph-container" id="graphContainer">
        <div class="graph-sidebar" id="graphSidebar"></div>
      </div>
    `;
  },

  async mount() {
    // 按需加载 D3.js
    if (typeof d3 === 'undefined') {
      const container = document.getElementById('graphContainer');
      if (container) container.innerHTML = '<div style="text-align:center;padding:60px;"><div class="spinner"></div><p>加载 D3.js...</p></div>';
      try {
        await loadScript('./js/vendor/d3.min.js');
      } catch (e) {
        try {
          await loadScript('https://unpkg.com/d3@7/dist/d3.min.js');
        } catch (e2) {
          await loadScript('https://cdn.jsdelivr.net/npm/d3@7/dist/d3.min.js');
        }
      }
    }
    await this._buildGraph();
    this._initD3();

    // 如果有外部传入的目标节点，自动聚焦
    if (this.targetNodeId) {
      // 等待 D3 渲染完成后聚焦
      setTimeout(() => {
        const targetNode = this.nodes.find(n => n.id === this.targetNodeId);
        if (targetNode) {
          const container = document.getElementById('graphContainer');
          const sidebar = document.getElementById('graphSidebar');
          if (container && sidebar) {
            const width = container.clientWidth;
            const height = container.clientHeight;
            const svg = this.svg;
            const g = svg.select('g');
            const zoom = d3.zoom()
              .scaleExtent([0.3, 4])
              .on('zoom', (event) => {
                g.attr('transform', event.transform);
              });
            // 聚焦+放大该节点
            const transform = d3.zoomIdentity
              .translate(width / 2, height / 2)
              .scale(2.5)
              .translate(-targetNode.x, -targetNode.y);
            svg.transition().duration(1000).call(zoom.transform, transform);
            // 同时打开详情侧边栏
            this._showDetail(targetNode, sidebar);
          }
        }
      }, 500);
    }
  },

  async _buildGraph() {
    const { principles, domains, focusAreas, processes } = getHierarchy();

    // 构建节点列表
    this.nodes = [];
    this.links = [];

    const addNode = (n, group) => {
      this.nodes.push({
        id: n.id,
        name: n.name,
        type: n.type,
        group,
        priority: n.priority || 2,
        focusArea: n.focusArea || null,
        domain: n.domain || null,
      });
    };

    principles.forEach(n => addNode(n, 'principle'));
    domains.forEach(n => addNode(n, 'domain'));
    focusAreas.forEach(n => addNode(n, 'focus_area'));
    processes.forEach(n => addNode(n, 'process'));

    // 构建连接
    // 1. 父子关系
    this.nodes.forEach(n => {
      const original = getNodeById(n.id);
      if (original && original.parentId) {
        this.links.push({ source: original.parentId, target: n.id, type: 'parent' });
      }
      // 关联关系
      if (original && original.relatedIds) {
        original.relatedIds.forEach(rid => {
          if (this.nodes.find(x => x.id === rid)) {
            this.links.push({ source: n.id, target: rid, type: 'related' });
          }
        });
      }
    });

    // 加载进度数据，给节点附加颜色
    const allProgress = await db.getAllQuestionProgress();
    this.nodes.forEach(n => {
      const domainProgress = allProgress.filter(p => {
        const orig = getNodeById(n.id);
        return orig && orig.domain && p.domain === orig.domain;
      });
      const total = domainProgress.reduce((s, p) => s + (p.attempts || 0), 0);
      const correct = domainProgress.reduce((s, p) => s + (p.correct || 0), 0);
      n.correctRate = total > 0 ? Math.round((correct / total) * 100) : null;
    });
  },

  _initD3() {
    const container = document.getElementById('graphContainer');
    if (!container) return;
    const sidebar = document.getElementById('graphSidebar');

    const width = container.clientWidth;
    const height = container.clientHeight;

    // 清除旧内容
    container.querySelector('svg')?.remove();

    const svg = d3.select('#graphContainer')
      .append('svg')
      .attr('width', width)
      .attr('height', height);

    this.svg = svg;

    // 缩放行为
    const g = svg.append('g');
    const zoom = d3.zoom()
      .scaleExtent([0.3, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });
    svg.call(zoom);

    // 颜色映射
    const colorMap = {
      principle: '#f59e0b',
      domain: '#6366f1',
      focus_area: '#22c55e',
      process: '#3b82f6',
    };

    const radiusMap = {
      principle: 18,
      domain: 22,
      focus_area: 14,
      process: 10,
    };

    // 力模拟
    const simulation = d3.forceSimulation(this.nodes)
      .force('link', d3.forceLink(this.links).id(d => d.id).distance(d => d.type === 'parent' ? 80 : 120))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(d => radiusMap[d.group] + 8));

    this.simulation = simulation;

    // 绘制连线
    const link = g.append('g')
      .selectAll('line')
      .data(this.links)
      .join('line')
      .attr('stroke', d => d.type === 'parent' ? '#333' : '#555')
      .attr('stroke-opacity', d => d.type === 'parent' ? 0.5 : 0.2)
      .attr('stroke-width', d => d.type === 'parent' ? 1.5 : 0.8)
      .attr('stroke-dasharray', d => d.type === 'related' ? '4,4' : null);

    // 绘制节点
    const node = g.append('g')
      .selectAll('g')
      .data(this.nodes)
      .join('g')
      .call(this._drag(simulation));

    // 节点圆形
    node.append('circle')
      .attr('r', d => radiusMap[d.group])
      .attr('fill', d => {
        const baseColor = colorMap[d.group] || '#6366f1';
        if (d.correctRate === null) return '#3a3a55';
        return progressColor(d.correctRate);
      })
      .attr('stroke', d => {
        const baseColor = colorMap[d.group] || '#6366f1';
        return baseColor;
      })
      .attr('stroke-width', d => d.priority === 1 ? 3 : 1.5)
      .attr('cursor', 'pointer');

    // 节点文字
    node.append('text')
      .text(d => d.name.zh.length > 6 ? d.name.zh.slice(0, 5) + '…' : d.name.zh)
      .attr('text-anchor', 'middle')
      .attr('dy', d => radiusMap[d.group] + 14)
      .attr('font-size', d => d.group === 'process' ? 9 : 11)
      .attr('fill', 'var(--color-text2)')
      .attr('pointer-events', 'none');

    // 节点交互
    node.on('click', (event, d) => {
      event.stopPropagation();
      this._showDetail(d, sidebar);
    });

    node.on('dblclick', (event, d) => {
      event.stopPropagation();
      // 聚焦节点
      this._focusNode(d, g, zoom, width, height, svg);
    });

    // 点击空白关闭侧边栏
    svg.on('click', () => {
      sidebar.classList.remove('open');
      this.selectedNode = null;
    });

    // 力模拟更新
    simulation.on('tick', () => {
      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);

      node.attr('transform', d => `translate(${d.x},${d.y})`);
    });
  },

  _drag(simulation) {
    function dragstarted(event, d) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }
    function dragged(event, d) {
      d.fx = event.x;
      d.fy = event.y;
    }
    function dragended(event, d) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }
    return d3.drag().on('start', dragstarted).on('drag', dragged).on('end', dragended);
  },

  _focusNode(d, g, zoom, width, height, svg) {
    const transform = d3.zoomIdentity
      .translate(width / 2, height / 2)
      .scale(2)
      .translate(-d.x, -d.y);
    svg.transition().duration(750).call(zoom.transform, transform);
  },

  _showDetail(d, sidebar) {
    this.selectedNode = d;
    const node = getNodeById(d.id);
    if (!node) return;

    const typeLabel = { principle: '原则', domain: '绩效域', focus_area: '关注领域', process: '过程', agile_concept: '敏捷概念' };
    const parent = node.parentId ? getNodeById(node.parentId) : null;
    const children = getChildren(node.id);
    const related = getRelatedNodes(node.id);

    sidebar.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:16px;">
        <div>
          <span class="tag tag-blue">${typeLabel[node.type] || node.type}</span>
          <h3 style="margin-top:8px;">${node.name.zh}</h3>
          <p style="color:var(--color-text3);font-size:12px;">${node.name.en}</p>
        </div>
        <button class="btn-icon" onclick="document.getElementById('graphSidebar').classList.remove('open')">✕</button>
      </div>

      <!-- 进度 -->
      <div style="margin-bottom:16px;padding:12px;background:var(--color-surface2);border-radius:8px;">
        <span style="font-size:12px;color:var(--color-text2);">掌握程度：</span>
        ${d.correctRate !== null ? `
          <span style="font-weight:700;color:${progressColor(d.correctRate)};">${d.correctRate}%</span>
          <div class="progress-bar" style="margin-top:6px;">
            <div class="progress-fill" style="width:${d.correctRate}%;background:${progressColor(d.correctRate)};"></div>
          </div>
        ` : '<span style="color:var(--color-text3);">未开始</span>'}
      </div>

      <!-- 描述 -->
      ${node.description?.zh ? `
        <div style="margin-bottom:16px;">
          <h4 style="font-size:13px;color:var(--color-text2);margin-bottom:6px;">📖 概述</h4>
          <p style="font-size:13px;line-height:1.7;">${node.description.zh}</p>
        </div>
      ` : ''}

      <!-- 考试要点 -->
      ${node.examTips?.zh ? `
        <div style="margin-bottom:16px;padding:12px;background:var(--color-primary-bg);border-radius:8px;border-left:3px solid var(--color-primary);">
          <strong style="font-size:13px;">🎯 考试要点</strong>
          <p style="font-size:13px;margin-top:6px;">${node.examTips.zh.replace(/\n/g, '<br>')}</p>
        </div>
      ` : ''}

      <!-- 父/子/关联 -->
      <div style="margin-bottom:12px;">
        ${parent ? `<p style="font-size:12px;color:var(--color-text3);">📂 上级：${parent.name.zh}</p>` : ''}
        ${children.length > 0 ? `
          <p style="font-size:12px;color:var(--color-text3);margin-top:4px;">📋 下级：${children.map(c => c.name.zh).join('、')}</p>
        ` : ''}
        ${related.length > 0 ? `
          <p style="font-size:12px;color:var(--color-text3);margin-top:4px;">🔗 关联：${related.map(r => r.name.zh).join('、')}</p>
        ` : ''}
      </div>

      <!-- 操作按钮 -->
      <div style="display:flex;gap:8px;margin-top:16px;">
        <button class="btn btn-primary btn-sm" onclick="window._nav('/practice?domain=${node.domain || ''}&node=${node.id}')">
          ✏️ 练习相关题目
        </button>
        <button class="btn btn-secondary btn-sm" onclick="window._nav('/questions?node=${node.id}')">
          📝 查看题目列表
        </button>
      </div>
    `;

    sidebar.classList.add('open');
  },
};

// 全局重置
window._gReset = () => {
  const container = document.getElementById('graphContainer');
  const sidebar = document.getElementById('graphSidebar');
  if (sidebar) sidebar.classList.remove('open');
  // 重新初始化
  GraphView.mount();
};

export default GraphView;
