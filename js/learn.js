// ===== 知识学习页面 — 系统阅读教材内容 =====

import { getHierarchy, getNodeById, getChildren, getRelatedNodes, getTotalKnowledgeUnits } from "./knowledge-graph.js";
import KNOWLEDGE_CONTENT from "./knowledge-content.js";
import db from "./db.js";
import router from "./router.js";
import bus from "./event-bus.js";
import formulaCards from "./formula-cards.js";
import { progressColor, progressLabel, escapeHtml, toast } from "./utils.js";

const Learn = {
  currentNodeId: null,
  history: [],  // 导航历史栈
  progressMap: {},  // 缓存节点进度数据

  async render() {
    const { principles, domains, focusAreas, agileConcepts } = getHierarchy();
    const allProgress = await db.getAllNodeProgress();

    // 计算每个节点的学习状态
    this.progressMap = {};
    allProgress.forEach(p => {
      this.progressMap[p.nodeId] = p;
    });
    const progressMap = this.progressMap;

    // 读取路由参数：优先定位到指定节点
    const query = router.getQuery();
    const targetNodeId = query.node || null;

    // 默认选中：优先路由参数 → 上次浏览 → 第一个原则
    if (!this.currentNodeId) {
      if (targetNodeId && getNodeById(targetNodeId)) {
        this.currentNodeId = targetNodeId;
      } else {
        this.currentNodeId = principles[0]?.id || domains[0]?.id || 'agile-manifesto';
      }
    }

    return `
      <div style="display:grid;grid-template-columns:280px 1fr;gap:20px;height:calc(100vh - var(--color-topbar-height) - 60px);">
        <!-- 左侧知识树 -->
        <div class="card" style="overflow-y:auto;">
          <div style="padding:12px 0;border-bottom:1px solid var(--color-border);margin-bottom:8px;">
            <h3 style="font-size:15px;">📚 知识目录</h3>
            <p style="font-size:11px;color:var(--color-text2);margin-top:2px;">
              ${getTotalKnowledgeUnits().independent} 个知识单元
            </p>
            ${(() => {
              const viewed = allProgress.filter(p => p.viewCount > 0).length;
              const studied = allProgress.filter(p => p.studied).length;
              return `
                <div style="display:flex;gap:12px;margin-top:6px;font-size:11px;">
                  <span style="color:#6366f1;">👁️ 已浏览 ${viewed}</span>
                  <span style="color:#22c55e;">✅ 已学习 ${studied}</span>
                </div>
              `;
            })()}
          </div>

          <div class="learn-tree">
            <!-- 原则 -->
            <div class="learn-section">
              <div class="learn-section-title" onclick="this.parentElement.classList.toggle('collapsed')">
                <span>💡 项目管理原则</span>
                <span class="learn-count">${principles.length}</span>
              </div>
              <div class="learn-section-body">
                ${principles.map(p => this._treeItem(p, progressMap)).join('')}
              </div>
            </div>

            <!-- 绩效域（含过程） -->
            <div class="learn-section">
              <div class="learn-section-title" onclick="this.parentElement.classList.toggle('collapsed')">
                <span>📂 绩效域</span>
                <span class="learn-count">${domains.length}域</span>
              </div>
              <div class="learn-section-body">
                ${domains.map(d => {
                  const processes = getChildren(d.id);
                  return `
                    <div class="learn-group">
                      ${this._treeItem(d, progressMap, true)}
                      <div class="learn-group-children">
                        ${processes.map(p => this._treeItem(p, progressMap)).join('')}
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>

            <!-- 关注领域 -->
            <div class="learn-section">
              <div class="learn-section-title" onclick="this.parentElement.classList.toggle('collapsed')">
                <span>🎯 关注领域</span>
                <span class="learn-count">${focusAreas.length}</span>
              </div>
              <div class="learn-section-body">
                ${focusAreas.map(f => this._treeItem(f, progressMap)).join('')}
              </div>
            </div>

            <!-- 敏捷 -->
            <div class="learn-section">
              <div class="learn-section-title" onclick="this.parentElement.classList.toggle('collapsed')">
                <span>🔄 敏捷概念</span>
                <span class="learn-count">${agileConcepts.length}</span>
              </div>
              <div class="learn-section-body">
                ${agileConcepts.map(a => this._treeItem(a, progressMap)).join('')}
              </div>
            </div>
          </div>
        </div>

        <!-- 右侧阅读面板 -->
        <div class="card" style="overflow-y:auto;" id="learnContent">
          ${this._renderContent(this.currentNodeId)}
        </div>
      </div>
    `;
  },

  /** 树节点条目 */
  _treeItem(node, progressMap, isParent = false) {
    const progress = progressMap[node.id];
    const studied = progress?.studied || false;
    const viewed = progress?.viewCount > 0 || false;
    const rate = progress?.correctRate ?? null;
    const active = this.currentNodeId === node.id ? 'active' : '';

    // 三种状态：未浏览(灰) → 已浏览(蓝) → 已学习(绿或进度色)
    let dotColor = '#cbd5e1'; // 未浏览 灰色
    let statusMark = '';
    if (studied) {
      dotColor = progressColor(rate);
      statusMark = '<span class="learn-check" style="font-size:10px;margin-left:4px;">✅</span>';
    } else if (viewed) {
      dotColor = '#6366f1'; // 已浏览 蓝色
      statusMark = '<span class="learn-check" style="font-size:10px;margin-left:4px;opacity:0.5;">👁️</span>';
    }

    return `
      <div class="learn-tree-item ${active} ${isParent ? 'is-parent' : ''}"
           data-node-id="${node.id}"
           onclick="window._learnSelect('${node.id}')">
        <span class="learn-tree-dot" style="background:${dotColor};"></span>
        <span class="learn-tree-name">${node.name.zh}</span>
        ${statusMark}
      </div>
    `;
  },

  /** 渲染知识内容 */
  /** 格式化文本：分段加bullet、加粗关键词、高亮重点句 */
  _formatText(text) {
    if (!text) return '';

    // 步骤0: 先拆分原始文本为段落（以连续换行分隔）
    const rawParas = text.split(/\n\s*\n/).filter(p => p.trim());
    if (rawParas.length === 0) rawParas.push(text);

    // 步骤1: 每个段落独立处理
    let resultParts = rawParas.map(raw => {
      // 段落内单换行 → <br>
      let html = raw.trim().replace(/\n/g, '<br>');
      return html;
    });

    // 步骤2: 对所有文本统一加粗关键词
    let html = resultParts.join('<br><br>');

    const autoBold = [
      '项目章程', '项目管理计划', '商业论证', 'CCB',
      'WBS', 'CPM', 'EVM', '挣值管理', '挣值',
      '应急储备', '管理储备', '成本基准', '范围蔓延', '镀金',
      '仆人式领导', 'Scrum', 'Sprint', '产品负责人', 'Scrum Master',
      '预测型', '适应型', '敏捷型', '混合型',
      '蒙特卡洛', '决策树', '三点估算', 'PERT',
      'Tuckman', 'RACI', 'SWOT', 'DoD', 'BAC', 'EAC', 'CPI', 'SPI',
      '权力.利益方格', '凸显模型', '干系人登记册', '风险登记册',
      '经验教训登记册', '问题日志', '假设日志', '变更日志',
      '组织过程资产', '事业环境因素',
    ];

    // 先保护已有HTML标签
    const protectedTags = [];
    html = html.replace(/<[^>]+>/g, match => {
      protectedTags.push(match);
      return `\x00TAG${protectedTags.length - 1}\x00`;
    });

    // 在纯文本中执行加粗
    autoBold.forEach(term => {
      html = html.replace(new RegExp(term, 'g'), m => `\x00B\x00${m}\x00/B\x00`);
    });

    // 高亮包含关键标记的句子
    html = html.replace(/([^。；\n]*?(?:考试重点|🚨|⚠️|最重要|必须掌握|核心概念|必考)[^。；\n]*[。；])/g,
      '\x00HL\x00$1\x00/HL\x00');

    // 恢复HTML标签
    html = html.replace(/\x00TAG(\d+)\x00/g, (_, i) => protectedTags[parseInt(i)]);

    // 转换加粗标记为真实标签
    html = html.replace(/\x00B\x00/g, '<strong>').replace(/\x00\/B\x00/g, '</strong>');

    // 转换高亮标记
    html = html.replace(/\x00HL\x00/g, '<span class="learn-highlight">').replace(/\x00\/HL\x00/g, '</span>');

    // 步骤3: 每个段落包裹 <p> 并加 bullet
    const finalParas = html.split(/<br><br>/).filter(p => p.trim());
    html = finalParas.map(p => {
      p = p.trim().replace(/^<br>|<br>$/g, '');
      if (!p) return '';
      // 每个段落前加 bullet point
      return '<p class="learn-p"><span class="learn-bullet">●</span>' + p + '</p>';
    }).join('');

    return html;
  },

  _renderContent(nodeId) {
    const node = getNodeById(nodeId);
    if (!node) return '<div class="empty-state"><p>请从左侧选择知识点</p></div>';

    const typeLabels = {
      principle: { label: '项目管理原则', icon: '💡', color: '#f59e0b' },
      domain: { label: '绩效域', icon: '📂', color: '#6366f1' },
      focus_area: { label: '关注领域（过程组）', icon: '🎯', color: '#22c55e' },
      process: { label: '项目管理过程', icon: '⚙️', color: '#3b82f6' },
      agile_concept: { label: '敏捷概念', icon: '🔄', color: '#14b8a6' },
    };
    const typeInfo = typeLabels[node.type] || { label: '', icon: '📄', color: '#6366f1' };

    const parent = node.parentId ? getNodeById(node.parentId) : null;
    const children = getChildren(node.id);
    const related = getRelatedNodes(node.id);

    // 从知识内容库获取详细描述
    const content = KNOWLEDGE_CONTENT[node.id];
    console.log('[LEARN] Node:', node.id, 'Content found:', !!content, 'Fields:', content ? Object.keys(content).join(',') : 'NONE');
    console.log('[LEARN] overview length:', content?.overview?.length || 0);
    const fullDesc = content?.overview || node.description?.zh || '';
    const keyPoints = content?.keyPoints || content?.keyConcepts || '';
    const details = content?.details || {};
    const siblings = parent ? getChildren(parent.id) : [];
    const currentIdx = siblings.findIndex(s => s.id === nodeId);
    const prevNode = currentIdx > 0 ? siblings[currentIdx - 1] : null;
    const nextNode = currentIdx < siblings.length - 1 ? siblings[currentIdx + 1] : null;

    // Debug: 内容统计
    const contentStats = content ?
      `overview:${(content.overview||'').length}字 keyConcepts:${(content.keyConcepts||'').length}字 tailoring:${(content.tailoring||'').length}字 interactions:${(content.interactions||'').length}字 examTips:${(content.examTips||'').length}字` :
      '内容未找到!';

    return `
      <article class="learn-article">
        <!-- 内容加载状态 -->
        <div style="font-size:10px;color:var(--color-text3);margin-bottom:8px;padding:4px 8px;background:var(--color-surface2);border-radius:4px;">
          📊 ${content ? '✅ 教材内容已加载' : '⚠️ 教材内容未找到'} | ${contentStats}
        </div>

        <!-- 面包屑 -->
        <div class="learn-breadcrumb">
          ${parent ? `<span onclick="window._learnSelect('${parent.id}')" style="cursor:pointer;color:var(--color-text2);">${parent.name.zh}</span> › ` : ''}
          <span style="font-weight:600;">${node.name.zh}</span>
        </div>

        <!-- 标题区 -->
        <div class="learn-header">
          <span class="tag" style="background:${typeInfo.color}20;color:${typeInfo.color};font-weight:600;">
            ${typeInfo.icon} ${typeInfo.label}
          </span>
          <h2 style="margin-top:10px;font-size:22px;">${node.name.zh}</h2>
          <p style="color:var(--color-text2);font-size:13px;">${node.name.en}</p>
        </div>

        <!-- 进度条 -->
        ${node.type === 'process' || node.type === 'agile_concept' ? `
          <div class="learn-progress-mini" id="learnProgress">
            <span style="font-size:12px;color:var(--color-text2);">📊 本知识点掌握度：</span>
            <span style="font-weight:700;color:${progressColor(node.correctRate || 0)};" id="learnProgressLabel">
              ${progressLabel(node.correctRate)}
            </span>
          </div>
        ` : ''}

        <!-- 概述区 -->
        ${fullDesc ? `
        <div class="learn-key-points">
          <h4>📖 ${node.type === 'principle' ? '原则详解' : node.type === 'domain' ? '绩效域概述' : node.type === 'process' ? '过程说明' : '概念说明'}</h4>
          <div class="learn-body-text">${this._formatText(fullDesc)}</div>
        </div>
        ` : ''}

        <!-- 关键要点列表（数组） -->
        ${Array.isArray(keyPoints) && keyPoints.length > 0 ? `
        <div class="learn-section-block">
          <h4>🔑 关键要点</h4>
          <ul class="learn-keypoint-list">
            ${keyPoints.map(kp => `<li>${kp}</li>`).join('')}
          </ul>
        </div>
        ` : ''}

        <!-- 关键概念（字符串） -->
        ${typeof keyPoints === 'string' && keyPoints ? `
        <div class="learn-section-block">
          <h4>📌 关键概念</h4>
          <div class="learn-body-text">${this._formatText(keyPoints)}</div>
        </div>
        ` : ''}

        <!-- 项目影响（原则） -->
        ${content?.projectImpact ? `
        <div class="learn-section-block">
          <h4>📊 项目影响</h4>
          <div class="learn-body-text">${this._formatText(content.projectImpact)}</div>
        </div>
        ` : ''}

        <!-- 裁剪考虑 -->
        ${content?.tailoring ? `
        <div class="learn-section-block">
          <h4>✂️ 裁剪考虑因素</h4>
          <div class="learn-body-text">${this._formatText(content.tailoring)}</div>
        </div>
        ` : ''}

        <!-- 原则实践案例 -->
        ${content?.practiceExample ? `
        <div class="learn-section-block">
          <h4>💼 实践案例</h4>
          <div class="learn-body-text">${this._formatText(content.practiceExample)}</div>
        </div>
        ` : ''}

        <!-- 关联/相互作用 -->
        ${content?.interactions ? `
        <div class="learn-section-block">
          <h4>🔗 相互作用</h4>
          <div class="learn-body-text">${this._formatText(content.interactions)}</div>
        </div>
        ` : ''}

        <!-- 域关联（原则） -->
        ${content?.domainConnections ? `
        <div class="learn-section-block">
          <h4>🔗 与绩效域的联系</h4>
          <div class="learn-body-text">${this._formatText(content.domainConnections)}</div>
        </div>
        ` : ''}

        <!-- 考试要点 -->
        ${content?.examTips ? `
        <div class="learn-exam-tips">
          <h4>🎯 考试要点</h4>
          <div>${this._formatText(content.examTips)}</div>
        </div>
        ` : ''}

        <!-- details 附加区块（嵌套对象） -->
        ${Object.entries(details).map(([title, text]) => `
        <div class="learn-section-block">
          <h4>📌 ${title}</h4>
          <div class="learn-body-text">${(text||'').replace(/\n/g, '<br>')}</div>
        </div>
        `).join('')}

        <!-- ITTO 信息（仅过程节点） -->
        ${node.itto ? `
          <div class="learn-itto">
            <h4>📋 输入、工具与输出 (ITTO)</h4>
            <div class="learn-itto-grid">
              <div class="learn-itto-col">
                <h5>📥 输入</h5>
                <ul>${(node.itto.inputs || []).map(i => `<li>${i}</li>`).join('')}</ul>
              </div>
              <div class="learn-itto-col">
                <h5>🔧 工具与技术</h5>
                <ul>${(node.itto.tools || []).map(t => `<li>${t}</li>`).join('')}</ul>
              </div>
              <div class="learn-itto-col">
                <h5>📤 输出</h5>
                <ul>${(node.itto.outputs || []).map(o => `<li>${o}</li>`).join('')}</ul>
              </div>
            </div>
          </div>
        ` : ''}

        <!-- 考试要点（高亮框） -->
        ${node.examTips?.zh ? `
          <div class="learn-exam-tips">
            <h4>🎯 考试要点</h4>
            <div>${node.examTips.zh.replace(/\n/g, '<br>')}</div>
          </div>
        ` : ''}

        <!-- 关联概念 -->
        ${related.length > 0 ? `
          <div class="learn-related">
            <h4>🔗 关联概念</h4>
            <div style="display:flex;flex-wrap:wrap;gap:6px;">
              ${related.map(r => `
                <span class="tag tag-blue" style="cursor:pointer;" onclick="window._learnSelect('${r.id}')">
                  ${r.name.zh}
                </span>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <!-- 下级节点 -->
        ${children.length > 0 ? `
          <div class="learn-children-list">
            <h4>📋 包含的${node.type === 'domain' ? '过程' : '子节点'}</h4>
            <div class="learn-child-grid">
              ${children.map(c => `
                <div class="learn-child-card" onclick="window._learnSelect('${c.id}')">
                  <span style="font-weight:600;font-size:13px;">${c.name.zh}</span>
                  <span style="font-size:11px;color:var(--color-text2);">→</span>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <!-- 缩写速查表 -->
        ${content?.abbrGuide ? `
        <div class="learn-abbr-guide">
          <h4>📋 ${escapeHtml(content.abbrGuide.title)}</h4>
          <p style="font-size:12px;color:var(--color-text2);margin-bottom:8px;">${escapeHtml(content.abbrGuide.description)}</p>
          <div class="abbr-table">
            ${content.abbrGuide.abbreviations.map(a => `
              <div class="abbr-row">
                <span class="abbr-tag">${escapeHtml(a.abbr)}</span>
                <span class="abbr-full">${escapeHtml(a.full)}</span>
                <span class="abbr-cn">${escapeHtml(a.cn)}</span>
                <span class="abbr-explain">${escapeHtml(a.explain)}</span>
              </div>
            `).join('')}
          </div>
        </div>
        ` : ''}

        <!-- EVM完整教程 -->
        ${content?.evmGuide ? `
        <div class="learn-evm-guide">
          <h4>📊 ${escapeHtml(content.evmGuide.title)}</h4>
          <p style="margin-bottom:12px;">${escapeHtml(content.evmGuide.intro)}</p>
          <div class="evm-metrics">
            ${content.evmGuide.coreMetrics.map(m => `
              <div class="evm-metric-card">
                <strong>${escapeHtml(m.metric)}</strong>
                <p>${escapeHtml(m.desc)}</p>
                <p style="font-size:12px;color:var(--color-text3);">📝 ${escapeHtml(m.example)}</p>
              </div>
            `).join('')}
          </div>
          <div class="evm-interpretation">
            <strong>🎯 判读规则</strong>
            <p>${escapeHtml(content.evmGuide.interpretationSummary.variance)}</p>
            <p>${escapeHtml(content.evmGuide.interpretationSummary.index)}</p>
            <p style="color:var(--color-warning);font-weight:600;">💡 ${escapeHtml(content.evmGuide.interpretationSummary.proverb)}</p>
          </div>
          ${content.evmGuide.workedExample ? `
          <div class="evm-example">
            <strong>🧮 ${escapeHtml(content.evmGuide.workedExample.title)}</strong>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;margin:8px 0;padding:8px;background:var(--color-surface2);border-radius:4px;">
              ${Object.entries(content.evmGuide.workedExample.given).map(([k,v]) => `
                <span style="font-size:12px;"><strong>${k}:</strong> ${v}</span>
              `).join('')}
            </div>
            <ol style="padding-left:20px;">
              ${content.evmGuide.workedExample.steps.map(s => `<li style="margin:4px 0;font-size:13px;">${s}</li>`).join('')}
            </ol>
            <p style="margin-top:10px;padding:8px;background:var(--color-primary-bg);border-radius:4px;font-size:13px;">📌 ${escapeHtml(content.evmGuide.workedExample.conclusion)}</p>
          </div>
          ` : ''}
        </div>
        ` : ''}

        <!-- 公式卡片（按领域自动匹配） -->
        ${node.type === 'process' || node.domain ? (() => {
          const domainFormulas = {
            governance: ['SV', 'CV', 'SPI', 'CPI', 'TCPI', 'EAC', 'ETC'],
            finance: ['SV', 'CV', 'SPI', 'CPI', 'TCPI', 'EAC', 'ETC', 'VAC'],
            schedule: ['PERT', 'SD', 'FLOAT'],
            stakeholder: ['COMM'],
            risk: ['EMV'],
            scope: ['PERT'],
            resource: ['COMM'],
          };
          const keys = domainFormulas[node.domain];
          if (!keys || keys.length === 0) return '';
          let html = '<div class="learn-formula-cards"><h4>🧮 相关公式卡片</h4><div class="formula-cards-grid">';
          keys.forEach(k => {
            try {
              html += formulaCards.getPresetFormulaCard(k);
            } catch(e) { /* skip if card not found */ }
          });
          html += '</div></div>';
          return html;
        })() : ''}

        <!-- 即时检验：关联题目 -->
        ${node.type === 'process' || node.type === 'agile_concept' || node.type === 'principle' ? `
        <div class="learn-quick-check" id="learnQuickCheck">
          <h4>✏️ 学以致用</h4>
          <p style="font-size:12px;color:var(--color-text3);">加载中...</p>
        </div>
        ` : ''}

        <!-- 底部操作栏 -->
        <div class="learn-actions">
          <div>
            ${prevNode ? `<button class="btn btn-secondary btn-sm" onclick="window._learnSelect('${prevNode.id}')">◀ ${prevNode.name.zh}</button>` : ''}
          </div>
          <div style="display:flex;gap:8px;">
            ${(() => {
              const isStudied = Learn.progressMap?.[nodeId]?.studied;
              return isStudied
                ? `<button class="btn btn-studied btn-sm" id="btnMarkStudied" disabled style="background:#22c55e;color:#fff;border-color:#22c55e;">✅ 已学习</button>`
                : `<button class="btn btn-primary btn-sm" id="btnMarkStudied" onclick="window._learnMark('${nodeId}')">✅ 标记为已学习</button>`;
            })()}
            <button class="btn btn-secondary btn-sm" onclick="window._nav('/practice?domain=${node.domain || ''}&node=${nodeId}&auto=1')">
              ✏️ 做相关题目
            </button>
          </div>
          <div style="text-align:right;">
            ${nextNode ? `<button class="btn btn-secondary btn-sm" onclick="window._learnSelect('${nextNode.id}')">${nextNode.name.zh} ▶</button>` : ''}
          </div>
        </div>
      </article>
    `;
  },

  /** 选择节点 */
  async selectNode(nodeId) {
    this.currentNodeId = nodeId;
    const content = document.getElementById('learnContent');
    if (content) {
      content.innerHTML = this._renderContent(nodeId);
    }
    // 更新左侧树的高亮
    document.querySelectorAll('.learn-tree-item').forEach(el => {
      el.classList.toggle('active', el.dataset.nodeId === nodeId);
    });

    // 自动记录学习行为（查看即记录）
    await this._autoTrackView(nodeId);

    // 加载关联题目
    this._loadQuickCheck(nodeId);
  },

  /** 自动记录：打开知识点即标记为浏览过 */
  async _autoTrackView(nodeId) {
    try {
      const node = getNodeById(nodeId);
      if (!node) return;
      const existing = await db.getNodeProgress(nodeId);
      // 仅在首次浏览或超过1小时才更新（避免频繁写入）
      const lastViewed = existing?.lastViewed ? new Date(existing.lastViewed) : null;
      const now = new Date();
      if (!lastViewed || (now - lastViewed) > 3600000) {
        await db.updateNodeProgress(nodeId, {
          domain: node.domain || existing?.domain || '',
          lastViewed: now.toISOString(),
          viewCount: (existing?.viewCount || 0) + 1,
        });
        // 更新左侧树状态点
        this._updateTreeDot(nodeId, existing?.studied || false, existing?.correctRate ?? null);
      }
    } catch (e) {
      // 静默失败，不影响浏览体验
      console.warn('[LEARN] Auto-track view failed:', e.message);
    }
  },

  /** 更新左侧树节点的状态指示点 */
  _updateTreeDot(nodeId, studied, correctRate) {
    const treeItem = document.querySelector(`.learn-tree-item[data-node-id="${nodeId}"]`);
    if (!treeItem) return;
    const dot = treeItem.querySelector('.learn-tree-dot');
    if (dot) {
      dot.style.background = studied ? progressColor(correctRate) : '#cbd5e1';
    }
    // 添加/移除 ✓ 标记
    let check = treeItem.querySelector('.learn-check');
    if (studied && !check) {
      check = document.createElement('span');
      check.className = 'learn-check';
      check.style.cssText = 'font-size:10px;margin-left:4px;';
      check.textContent = '✓';
      treeItem.appendChild(check);
    } else if (!studied && check) {
      check.remove();
    }
  },

  /** 加载即时检验题目 */
  async _loadQuickCheck(nodeId) {
    const container = document.getElementById('learnQuickCheck');
    if (!container) return;

    const node = getNodeById(nodeId);
    if (!node) return;

    try {
      const allQuestions = await db.getCustomQuestions();

      // 第一优先：knowledgeNodeIds 精确匹配
      let exactMatch = true;
      let matched = allQuestions.filter(q => {
        if (q.knowledgeNodeIds && q.knowledgeNodeIds.length > 0) {
          return q.knowledgeNodeIds.includes(nodeId);
        }
        return false;
      });

      // 第二优先：同领域匹配
      if (matched.length === 0 && node.domain) {
        exactMatch = false;
        matched = allQuestions.filter(q => q.domain === node.domain);
      }

      if (matched.length === 0) {
        container.innerHTML = '<h4>✏️ 学以致用</h4><p style="font-size:12px;color:var(--color-text3);">暂无关联题目，去题库添加吧~</p>';
        return;
      }

      // 按ID排序确保稳定，用hash取模固定选一题
      matched.sort((a, b) => (a.id || '').localeCompare(b.id || ''));
      let hash = 0;
      for (let i = 0; i < nodeId.length; i++) {
        hash = ((hash << 5) - hash) + nodeId.charCodeAt(i);
        hash |= 0;
      }
      const idx = Math.abs(hash) % matched.length;
      const q = matched[idx];

      container.innerHTML = `
        <h4>✏️ 学以致用</h4>
        <p style="font-size:11px;color:${exactMatch ? 'var(--color-success)' : 'var(--color-warning)'};margin-bottom:6px;">
          ${exactMatch ? '📌 精准匹配：' + node.name.zh : '📎 同领域题目（' + node.name.zh + '）'}
        </p>
        ${matched.length > 1 ? `<p style="font-size:11px;color:var(--color-text3);margin-bottom:4px;">该知识点共有 ${matched.length} 道相关题目（当前固定展示第${idx+1}题）</p>` : ''}
        <div class="learn-quiz-card" id="learnQuiz">
          ${q.scenario?.zh ? `<div style="font-size:13px;color:var(--color-text2);margin-bottom:8px;padding:8px;background:var(--color-bg);border-radius:4px;border-left:3px solid var(--color-primary);">📖 ${escapeHtml(q.scenario.zh)}</div>` : ''}
          <p style="font-weight:600;margin-bottom:12px;">${escapeHtml(q.question?.zh || '')}</p>
          <div class="option-list" id="learnQuizOptions">
            ${q.options.map(opt => `
              <div class="option-item" data-opt="${opt.label}" onclick="window._learnQuizAnswer('${q.id}', '${opt.label}', '${q.correctAnswer}', this)">
                <div class="option-label">${opt.label}</div>
                <span>${escapeHtml(opt.text?.zh || '')}</span>
              </div>
            `).join('')}
          </div>
          <div id="learnQuizResult" style="margin-top:8px;"></div>
        </div>
      `;
    } catch (e) {
      container.innerHTML = '<h4>✏️ 学以致用</h4><p style="font-size:12px;color:var(--color-text3);">加载题目失败</p>';
    }
  },

  /** 标记为已学习（局部刷新，不跳转页面） */
  async markStudied(nodeId) {
    const existing = await db.getNodeProgress(nodeId);
    await db.updateNodeProgress(nodeId, {
      studied: true,
      lastStudied: new Date().toISOString(),
      domain: existing?.domain || getNodeById(nodeId)?.domain || '',
    });
    // 同步更新缓存
    this.progressMap[nodeId] = { ...(this.progressMap[nodeId] || {}), studied: true };
    toast('已标记为学习完成 ✅', 'success');

    // 发布事件
    const node = getNodeById(nodeId);
    bus.emit('node:studied', { nodeId, nodeName: node?.name?.zh, domain: node?.domain });

    // 局部更新UI：按钮状态 + 树节点状态
    const btn = document.getElementById('btnMarkStudied');
    if (btn) {
      btn.textContent = '✅ 已学习';
      btn.style.background = '#22c55e';
      btn.style.color = '#fff';
      btn.style.borderColor = '#22c55e';
      btn.disabled = true;
    }
    this._updateTreeDot(nodeId, true, existing?.correctRate ?? null);
  },
};

// 全局函数
window._learnSelect = (nodeId) => Learn.selectNode(nodeId);
window._learnMark = (nodeId) => Learn.markStudied(nodeId);

// 即时检验答题
window._learnQuizAnswer = async (questionId, selected, correct, el) => {
  const container = document.getElementById('learnQuizResult');
  const options = document.querySelectorAll('#learnQuizOptions .option-item');
  if (!container || container.dataset.answered) return;

  const isCorrect = selected === correct;
  container.dataset.answered = '1';

  // 高亮选项
  options.forEach(opt => {
    opt.style.pointerEvents = 'none';
    if (opt.dataset.opt === correct) opt.classList.add('correct');
    if (opt.dataset.opt === selected && !isCorrect) opt.classList.add('wrong');
  });

  // 保存进度——从DB获取完整题目对象以获取正确的domain和nodeIds
  const allQuestions = await db.getCustomQuestions();
  const question = allQuestions.find(q => q.id === questionId);
  const node = Learn.currentNodeId ? getNodeById(Learn.currentNodeId) : null;
  const correctDomain = question?.domain || node?.domain || 'governance';
  const correctNodeIds = question?.knowledgeNodeIds || [];

  const existing = await db.getQuestionProgress(questionId);
  await db.updateQuestionProgress(questionId, {
    nodeIds: correctNodeIds,
    domain: correctDomain,
    attempts: (existing?.attempts || 0) + 1,
    correct: (existing?.correct || 0) + (isCorrect ? 1 : 0),
    wrongCount: (existing?.wrongCount || 0) + (isCorrect ? 0 : 1),
    lastAnswer: selected,
    lastAttempt: new Date().toISOString(),
  });

  container.innerHTML = `
    <div style="padding:10px;border-radius:6px;margin-top:8px;${isCorrect ? 'background:rgba(34,197,94,0.1);border:1px solid var(--color-success);' : 'background:rgba(239,68,68,0.1);border:1px solid var(--color-danger);'}">
      <strong>${isCorrect ? '✅ 回答正确！' : '❌ 回答错误'}</strong>
      <p style="font-size:12px;margin-top:4px;">正确答案：${correct}</p>
    </div>
  `;

  // 更新节点进度
  const nodeId = Learn.currentNodeId;
  if (nodeId) {
    const nodeProgress = await db.getNodeProgress(nodeId);
    const totalAttempts = (nodeProgress?.attempts || 0) + 1;
    const totalCorrect = (nodeProgress?.correct || 0) + (isCorrect ? 1 : 0);
    await db.updateNodeProgress(nodeId, {
      domain: nodeProgress?.domain || '',
      attempts: totalAttempts,
      correct: totalCorrect,
      correctRate: Math.round((totalCorrect / totalAttempts) * 100),
      lastAttempt: new Date().toISOString(),
    });
  }

  // 发布事件
  bus.emit('question:answered', {
    questionId,
    isCorrect,
    domain: correctDomain,
    nodeIds: correctNodeIds,
  });
};

export default Learn;
