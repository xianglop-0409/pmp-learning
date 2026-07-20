// ===== 仪表盘页面 =====

import db from './db.js';
import router from './router.js';
import bus from './event-bus.js';
import { getHierarchy, getTotalKnowledgeUnits, getNodeById, getNodesByType } from './knowledge-graph.js';
import { formatDate, formatMinutes, pct, progressColor, progressLabel, animateCount, staggerCards } from './utils.js';

const Dashboard = {
  async render() {
    const stats = await db.getStats();
    const studyStats = await db.getStudyStats();
    const streak = await db.getStreak();
    const sessionStats = bus.getSessionStats();

    // 计算各域进度（整合答题数据 + 学习数据）
    const domainProgress = await this._calcDomainProgress();
    // 计算三本书进度
    const bookProgress = this._calcBookProgress(domainProgress);
    // 总进度
    const totalUnits = getTotalKnowledgeUnits();
    const overallProgress = this._calcOverallProgress(domainProgress);

    return `
      <div class="dashboard">
        <!-- 统计卡片 -->
        <div class="stats-grid" id="statsGrid">
          <div class="stat-card" style="animation-delay:0ms;">
            <div class="stat-value" data-count="${stats.totalAttempts}">0</div>
            <div class="stat-label">总刷题数</div>
          </div>
          <div class="stat-card" style="animation-delay:80ms;">
            <div class="stat-value"><span data-count="${stats.overallCorrectRate}">0</span><span style="font-size:18px;">%</span></div>
            <div class="stat-label">总体正确率</div>
          </div>
          <div class="stat-card" style="animation-delay:160ms;">
            <div class="stat-value" data-count="${streak}">0</div>
            <div class="stat-label">🔥 连续学习天数</div>
          </div>
          <div class="stat-card" style="animation-delay:240ms;">
            <div class="stat-value"><span data-count="${overallProgress.learned}">0</span>/${totalUnits.independent}</div>
            <div class="stat-label">已掌握知识单元</div>
          </div>
        </div>

        <!-- 学习进度小结 -->
        <div class="card" style="margin-bottom:16px;">
          <div style="display:flex;gap:24px;padding:12px 16px;align-items:center;">
            <div style="text-align:center;">
              <div style="font-size:20px;font-weight:700;color:#6366f1;">👁️ ${studyStats.viewed}</div>
              <div style="font-size:11px;color:var(--color-text2);">已浏览</div>
            </div>
            <div style="width:1px;height:30px;background:var(--color-border);"></div>
            <div style="text-align:center;">
              <div style="font-size:20px;font-weight:700;color:#22c55e;">✅ ${studyStats.studied}</div>
              <div style="font-size:11px;color:var(--color-text2);">已学习</div>
            </div>
            <div style="width:1px;height:30px;background:var(--color-border);"></div>
            <div style="text-align:center;">
              <div style="font-size:20px;font-weight:700;color:#f59e0b;">📝 ${studyStats.totalAttempts}</div>
              <div style="font-size:11px;color:var(--color-text2);">随堂练习</div>
            </div>
            <div style="width:1px;height:30px;background:var(--color-border);"></div>
            <div style="flex:1;font-size:12px;color:var(--color-text2);line-height:1.6;">
              💡 学习进度来自<strong>知识学习</strong>页的浏览记录和手动标记，已掌握单元则综合了答题正确率。
            </div>
          </div>
        </div>

        <!-- 本次会话实时统计 -->
        ${sessionStats.questionsAnswered > 0 || sessionStats.nodesStudied > 0 ? `
        <div class="card" style="margin-bottom:16px;border-left:3px solid var(--color-primary);">
          <div style="display:flex;gap:20px;padding:10px 16px;align-items:center;font-size:13px;">
            <span style="font-weight:600;color:var(--color-primary);">⚡ 本次会话</span>
            ${sessionStats.questionsAnswered > 0 ? `<span>📝 做题 <strong>${sessionStats.questionsAnswered}</strong> 题 · 正确率 <strong>${sessionStats.correctRate}%</strong></span>` : ''}
            ${sessionStats.nodesStudied > 0 ? `<span>✅ 标记学习 <strong>${sessionStats.nodesStudied}</strong> 个</span>` : ''}
            ${sessionStats.examsCompleted > 0 ? `<span>🏆 完成考试 <strong>${sessionStats.examsCompleted}</strong> 次</span>` : ''}
            <span style="font-size:11px;color:var(--color-text3);">（打开页面后累计，刷新清零）</span>
          </div>
        </div>
        ` : ''}

        <!-- 今日推荐学习 -->
        ${await this._renderDailyRecommend(domainProgress)}

        <!-- 教材学习进度 -->
        ${this._renderProgressSection(bookProgress, domainProgress, overallProgress)}

        <!-- 快捷入口 -->
        <div class="card" style="margin-top:20px;">
          <div class="card-header">
            <span class="card-title">🚀 快捷入口</span>
          </div>
          <div class="quick-actions">
            <button class="quick-action-btn" onclick="window._nav('/practice?mode=weakness')">
              <span class="action-icon">🎯</span>
              <span>薄弱点突击</span>
            </button>
            <button class="quick-action-btn" onclick="window._nav('/wrong-book')">
              <span class="action-icon">❌</span>
              <span>错题本</span>
            </button>
            <button class="quick-action-btn" onclick="window._nav('/exam')">
              <span class="action-icon">🏆</span>
              <span>模拟考试</span>
            </button>
            <button class="quick-action-btn" onclick="window._nav('/glossary')">
              <span class="action-icon">📖</span>
              <span>术语词典</span>
            </button>
            <button class="quick-action-btn" onclick="window._nav('/graph')">
              <span class="action-icon">🕸️</span>
              <span>知识图谱</span>
            </button>
            <button class="quick-action-btn" onclick="window._nav('/practice?mode=random')">
              <span class="action-icon">🎲</span>
              <span>随机练习</span>
            </button>
          </div>
        </div>
      </div>
    `;
  },

  // ===== 三本书进度环形图 =====
  _renderProgressSection(bookProgress, domainProgress, overallProgress) {
    return `
      <div class="card">
        <div class="card-header">
          <span class="card-title">📖 教材学习进度</span>
          <span class="card-subtitle">三本教材 · ${getTotalKnowledgeUnits().total}个知识单元</span>
        </div>

        <!-- 三层环形进度 -->
        <div class="progress-rings">
          ${this._renderRing('PMBOK 第8版', bookProgress.pmbok, '#6366f1')}
          ${this._renderRing('过程组实践指南', bookProgress.processGroups, '#22c55e')}
          ${this._renderRing('敏捷实践指南', bookProgress.agile, '#f59e0b')}
        </div>

        <!-- 总进度条 -->
        <div style="padding: 0 16px;">
          <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
            <span style="font-size:14px;font-weight:600;">
              总体进度 ${overallProgress.pct}%
            </span>
            <span style="font-size:12px;color:var(--color-text2);">
              ${overallProgress.learned}/${overallProgress.total} 单元
            </span>
          </div>
          <div class="progress-bar" style="height:12px;border-radius:6px;">
            <div class="progress-fill" style="width:${overallProgress.pct}%;background:linear-gradient(90deg,#6366f1,#a78bfa);height:12px;border-radius:6px;"></div>
          </div>
        </div>

        <!-- 领域细分 -->
        <div class="collapsible open" style="margin-top:16px;border-top:1px solid var(--color-border);">
          <div class="collapsible-header" onclick="this.parentElement.classList.toggle('open')">
            <span style="font-size:13px;font-weight:600;color:var(--color-text2);">按领域展开 ▼</span>
          </div>
          <div class="collapsible-body domain-progress-list">
            ${domainProgress.map(d => this._renderDomainRow(d)).join('')}
          </div>
        </div>
      </div>
    `;
  },

  /** SVG 环形进度 */
  _renderRing(label, progress, color) {
    const r = 38;
    const c = 2 * Math.PI * r;
    const offset = c * (1 - progress.pct / 100);
    const size = 100;
    const center = size / 2;

    return `
      <div class="ring-item">
        <svg viewBox="0 0 ${size} ${size}">
          <circle cx="${center}" cy="${center}" r="${r}"
            fill="none" stroke="var(--color-surface2)" stroke-width="8"/>
          <circle cx="${center}" cy="${center}" r="${r}"
            fill="none" stroke="${color}" stroke-width="8"
            stroke-dasharray="${c}" stroke-dashoffset="${offset}"
            stroke-linecap="round"
            transform="rotate(-90 ${center} ${center})"
            style="transition: stroke-dashoffset 1s ease;"/>
          <text x="${center}" y="${center-4}" text-anchor="middle"
            fill="var(--color-text)" font-size="18" font-weight="700">${progress.pct}%</text>
          <text x="${center}" y="${center+14}" text-anchor="middle"
            fill="var(--color-text3)" font-size="10">${progress.learned}/${progress.total}</text>
        </svg>
        <span class="ring-label">${label}</span>
      </div>
    `;
  },

  /** 领域进度行 */
  _renderDomainRow(d) {
    const colorMap = {
      governance: '#6366f1', scope: '#22c55e', schedule: '#f59e0b',
      finance: '#ef4444', stakeholder: '#3b82f6', resource: '#a855f7',
      risk: '#ec4899', agile: '#14b8a6',
    };
    const color = colorMap[d.domain] || '#6366f1';
    const statusColor = d.learned === 0 ? '#9ca3af' : progressColor(d.pct);

    return `
      <div class="domain-progress-row">
        <div class="domain-status" style="background:${statusColor};"></div>
        <span class="domain-name">${d.label}</span>
        <div class="mini-bar-wrap">
          <div class="mini-bar-fill" style="width:${d.pct}%;background:${color};"></div>
        </div>
        <span class="domain-score">${d.learned}/${d.total} ${d.pct}%</span>
      </div>
    `;
  },

  // ===== 进度计算 =====
  async _calcDomainProgress() {
    const allProgress = await db.getAllQuestionProgress();
    const allNodeProgress = await db.getAllNodeProgress();
    const nodeProgressMap = {};
    allNodeProgress.forEach(p => {
      nodeProgressMap[p.nodeId] = p;
    });

    // 获取每个节点关联的题目进度
    const domains = getNodesByType('domain');
    const agileNodes = getNodesByType('agile_concept');
    const processes = getNodesByType('process');

    // 动态计算各绩效域的节点数量（从知识图谱中读取，不再硬编码）
    const domainMap = {};
    const domainNodes = getNodesByType('domain');
    domainNodes.forEach(d => {
      // 计算该域下的过程数量
      const domainProcesses = processes.filter(p => p.domain === d.id.replace('domain-', ''));
      domainMap[d.id.replace('domain-', '')] = {
        label: d.name.zh,
        total: domainProcesses.length || 0,
      };
    });
    // 敏捷单独处理
    domainMap['agile'] = {
      label: '敏捷',
      total: agileNodes.length || 0,
    };

    // 统计每个过程的正确率 + 学习状态
    const processProgress = {};
    processes.forEach(p => {
      const related = allProgress.filter(qp => {
        return qp.domain === p.domain;
      });
      const attempts = related.reduce((s, qp) => s + (qp.attempts || 0), 0);
      const correct = related.reduce((s, qp) => s + (qp.correct || 0), 0);
      const nodeProg = nodeProgressMap[p.id];
      // 已掌握 = 答题达标 OR 在学习页手动标记为已学习
      const quizMastered = attempts >= 3 && (correct / attempts) >= 0.7;
      const studyMastered = nodeProg?.studied === true;
      processProgress[p.id] = {
        attempts,
        correct,
        pct: attempts >= 3 ? Math.round((correct / attempts) * 100) : (attempts > 0 ? Math.round((correct / attempts) * 100) : 0),
        learned: quizMastered || studyMastered,
      };
    });

    // 按域汇总
    const result = [];
    for (const [domain, info] of Object.entries(domainMap)) {
      const domainProcesses = processes.filter(p => p.domain === domain);
      let learned = 0;

      if (domain === 'agile') {
        // 敏捷概念单独处理
        const agileProgs = allProgress.filter(qp => qp.domain === 'agile');
        const attemptsMap = {};
        agileProgs.forEach(qp => {
          if (!attemptsMap[qp.questionId]) attemptsMap[qp.questionId] = { attempts: 0, correct: 0 };
          attemptsMap[qp.questionId].attempts += (qp.attempts || 0);
          attemptsMap[qp.questionId].correct += (qp.correct || 0);
        });
        const totalAgileItems = Object.values(attemptsMap).filter(a => a.attempts >= 3 && (a.correct / a.attempts) >= 0.7).length;
        learned = Math.min(totalAgileItems, info.total);
      } else {
        learned = domainProcesses.filter(p => processProgress[p.id]?.learned).length;
      }

      result.push({
        domain,
        label: info.label,
        total: info.total,
        learned,
        pct: info.total > 0 ? Math.round((learned / info.total) * 100) : 0,
      });
    }

    return result;
  },

  _calcBookProgress(domainProgress) {
    // PMBOK: 6原则 + 7域 + 5关注领域 + 40过程（但域和过程是主要学习点）
    // 过程组实践指南：独立加权
    // 敏捷：敏捷概念

    const pmbokDomains = domainProgress.filter(d => d.domain !== 'agile');
    const pmbokTotal = pmbokDomains.reduce((s, d) => s + d.total, 0);
    const pmbokLearned = pmbokDomains.reduce((s, d) => s + d.learned, 0);

    const agile = domainProgress.find(d => d.domain === 'agile') || { total: 8, learned: 0 };

    return {
      pmbok: {
        total: pmbokTotal,
        learned: pmbokLearned,
        pct: pmbokTotal > 0 ? Math.round((pmbokLearned / pmbokTotal) * 100) : 0,
      },
      processGroups: {
        total: 30,
        learned: Math.round(pmbokLearned * 0.6), // 过程组指南与PMBOK核心重叠约60%
        pct: pmbokTotal > 0 ? Math.round((pmbokLearned * 0.6 / 30) * 100) : 0,
      },
      agile: {
        total: agile.total,
        learned: agile.learned,
        pct: agile.total > 0 ? Math.round((agile.learned / agile.total) * 100) : 0,
      },
    };
  },

  /** 今日推荐学习卡片 */
  async _renderDailyRecommend(domainProgress) {
    try {
      const sorted = [...domainProgress].sort((a, b) => a.pct - b.pct);
      const weakest = sorted.slice(0, 2).filter(d => d.total > 0 && d.pct < 70);
      const streak = parseInt(await db.getSetting('streak_cache') || '0');

      // 用静态导入的 getNodesByType，不再动态import
      const allNodeProgress = await db.getAllNodeProgress();
      const studiedIds = new Set(allNodeProgress.filter(p => p.studied).map(p => p.nodeId));
      const processes = getNodesByType('process');
      const highPriority = processes
        .filter(n => n.priority === 1 && !studiedIds.has(n.id))
        .slice(0, 3);

      const today = new Date().toLocaleDateString('zh-CN', {weekday:'long', month:'long', day:'numeric'});

      return `
        <div class="card" style="margin-bottom:16px;border-left:4px solid var(--color-primary);">
          <div class="card-header">
            <span class="card-title">🌟 今日推荐</span>
            <span style="font-size:12px;color:var(--color-text3);">${today}</span>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
            <div style="padding:12px;background:var(--color-surface2);border-radius:8px;">
              <h4 style="font-size:13px;margin-bottom:8px;">🎯 薄弱领域</h4>
              ${weakest.length > 0 ? weakest.map(d => `
                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;cursor:pointer;"
                     onclick="window._nav('/practice?domain=${d.domain}&auto=1')">
                  <span style="font-size:13px;">${d.label}</span>
                  <span style="font-size:12px;color:var(--color-danger);">${d.pct}% → 突击</span>
                </div>
              `).join('') : '<p style="font-size:12px;color:var(--color-text3);">暂无薄弱领域 🎉</p>'}
            </div>
            <div style="padding:12px;background:var(--color-surface2);border-radius:8px;">
              <h4 style="font-size:13px;margin-bottom:8px;">📖 推荐知识点</h4>
              ${highPriority.length > 0 ? highPriority.map(n => `
                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;cursor:pointer;"
                     onclick="window._nav('/learn?node=${n.id}')">
                  <span style="font-size:13px;">⭐ ${n.name.zh}</span>
                  <span style="font-size:11px;color:var(--color-primary);">学习 →</span>
                </div>
              `).join('') : '<p style="font-size:12px;color:var(--color-text3);">核心知识点已全部覆盖！</p>'}
            </div>
          </div>
          <div style="margin-top:12px;padding-top:10px;border-top:1px solid var(--color-border);font-size:12px;color:var(--color-text2);">
            💡 ${weakest.length > 0 ? `建议优先突击 <strong>${weakest.map(d=>d.label).join('、')}</strong> 领域` : '所有领域进度都不错，保持练习节奏！'}
          </div>
        </div>`;
    } catch(e) {
      console.warn('[Dashboard] _renderDailyRecommend failed:', e.message);
      return '';
    }
  },

  _calcOverallProgress(domainProgress) {
    const total = domainProgress.reduce((s, d) => s + d.total, 0);
    const learned = domainProgress.reduce((s, d) => s + d.learned, 0);
    return {
      total,
      learned,
      pct: total > 0 ? Math.round((learned / total) * 100) : 0,
    };
  },

  /** 渲染后触发动效 */
  afterRender() {
    // 统计卡片交错入场
    staggerCards('.stat-card', 60);

    // 数字跳动
    document.querySelectorAll('.stat-value [data-count]').forEach(el => {
      const target = parseInt(el.dataset.count, 10);
      if (!isNaN(target) && target > 0) {
        animateCount(el, target, 800);
      }
    });
    // 处理非span包裹的数字（如 streak）
    document.querySelectorAll('.stat-value[data-count]').forEach(el => {
      const target = parseInt(el.dataset.count, 10);
      if (!isNaN(target) && target > 0) {
        // 如果里面已有数字文本但没有span
        if (!el.querySelector('[data-count]')) {
          const span = document.createElement('span');
          span.dataset.count = el.dataset.count;
          span.textContent = '0';
          el.textContent = '';
          el.appendChild(span);
          // 追加后缀
          const suffix = el.dataset.count.includes('%') ? '%' : '';
          if (suffix) el.appendChild(document.createTextNode(suffix));
          animateCount(span, target, 800);
        }
      }
    });

    // 进度条宽度动画
    setTimeout(() => {
      document.querySelectorAll('.progress-fill').forEach(el => {
        el.classList.add('animate-width');
      });
    }, 300);
  },
};

// 全局导航函数
window._nav = (path) => {
  router.navigate(path);
};

export default Dashboard;
