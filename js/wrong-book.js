// ===== 错题本页面 =====
import db from './db.js';
import router from './router.js';
import bus from './event-bus.js';
import { getNodeById } from './knowledge-graph.js';
import { escapeHtml, toast, progressColor, pct } from './utils.js';

const domainMap = { governance: '治理', scope: '范围', schedule: '进度', finance: '财务', stakeholder: '利益相关方', resource: '资源', risk: '风险', agile: '敏捷' };

const WrongBook = {
  filterDomain: 'all',
  filterDifficulty: 'all',

  async render() {
    this.filterDomain = 'all';
    this.filterDifficulty = 'all';
    const allProgress = await db.getAllQuestionProgress();
    const allQuestions = await db.getCustomQuestions();
    const questionMap = {};
    allQuestions.forEach(q => { questionMap[q.id] = q; });

    // 错题：attempts >= 1 且 正确率 < 70%
    const wrongProgress = allProgress.filter(p => {
      if (!p.attempts || p.attempts === 0) return false;
      const correct = p.correct || 0;
      return (correct / p.attempts) < 0.7;
    });

    // 关联题目详情
    const wrongList = wrongProgress.map(p => {
      const q = questionMap[p.questionId];
      if (!q) return null;
      return {
        ...p,
        question: q,
        correctRate: pct(p.correct || 0, p.attempts),
        lastAttempt: p.lastAttempt,
        domain: q.domain,
        difficulty: q.difficulty || 1,
      };
    }).filter(Boolean);

    // 按领域分组统计
    const domainStats = {};
    wrongList.forEach(w => {
      if (!domainStats[w.domain]) domainStats[w.domain] = { count: 0, label: domainMap[w.domain] || w.domain };
      domainStats[w.domain].count++;
    });

    return `
      <div class="wrong-book-page">
        <div style="margin-bottom:20px;">
          <h2 style="font-size:20px;">❌ 错题本</h2>
          <p style="color:var(--color-text2);font-size:13px;margin-top:4px;">
            正确率低于70%的题目 · 共 <strong>${wrongList.length}</strong> 道
          </p>
        </div>

        ${wrongList.length === 0 ? `
          <div class="card" style="text-align:center;padding:60px;">
            <div style="font-size:64px;">🎉</div>
            <h3>太棒了！没有错题</h3>
            <p style="color:var(--color-text2);">所有做过的题目正确率都在70%以上</p>
            <button class="btn btn-primary" style="margin-top:16px;" onclick="window._nav('/practice')">去练习 →</button>
          </div>
        ` : `
          <!-- 统计卡片 -->
          <div class="stats-grid" style="margin-bottom:16px;">
            ${Object.entries(domainStats).map(([domain, stat]) => `
              <div class="stat-card" style="cursor:pointer;" onclick="window._wbFilterDomain('${domain}')">
                <div class="stat-value" style="font-size:24px;">${stat.count}</div>
                <div class="stat-label">${stat.label}</div>
              </div>
            `).join('')}
          </div>

          <!-- 筛选条 -->
          <div class="card" style="margin-bottom:16px;padding:10px 16px;display:flex;gap:10px;align-items:center;flex-wrap:wrap;">
            <span style="font-size:13px;font-weight:600;">筛选：</span>
            <select onchange="window._wbFilterDomain(this.value)" style="padding:4px 8px;border-radius:4px;border:1px solid var(--color-border);font-size:12px;">
              <option value="all">全部领域</option>
              ${Object.entries(domainStats).map(([d, s]) => `<option value="${d}">${s.label} (${s.count})</option>`).join('')}
            </select>
            <select onchange="window._wbFilterDiff(this.value)" style="padding:4px 8px;border-radius:4px;border:1px solid var(--color-border);font-size:12px;">
              <option value="all">全部难度</option>
              <option value="1">⭐ 简单</option>
              <option value="2">⭐⭐ 中等</option>
              <option value="3">⭐⭐⭐ 困难</option>
              <option value="4">⭐⭐⭐⭐ 很难</option>
            </select>
            <span style="flex:1;"></span>
            <button class="btn btn-primary btn-sm" onclick="window._wbRetryAll()">🔄 重做全部错题</button>
          </div>

          <!-- 错题列表 -->
          <div id="wrongList">
            ${this._renderList(wrongList)}
          </div>
        `}
      </div>
    `;
  },

  _renderList(list) {
    return list.map(w => `
      <div class="card wrong-item" style="margin-bottom:10px;padding:14px 16px;" data-domain="${w.domain}" data-diff="${w.difficulty}">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
          <span class="tag tag-blue">${domainMap[w.domain] || w.domain}</span>
          <span style="font-size:12px;color:var(--color-text3);">${'⭐'.repeat(w.difficulty)}</span>
          <span style="font-weight:600;color:${progressColor(w.correctRate)};">正确率 ${w.correctRate}%</span>
          <span style="font-size:11px;color:var(--color-text3);">答题${w.attempts}次</span>
          <span style="flex:1;"></span>
          <button class="btn btn-primary btn-sm" onclick="window._wbRetryOne('${w.questionId}')">🔄 重做</button>
        </div>
        <div style="font-size:13px;color:var(--color-text);line-height:1.6;">
          ${w.question.scenario?.zh ? `<div style="padding:6px 8px;background:var(--color-surface2);border-radius:4px;margin-bottom:6px;font-size:12px;color:var(--color-text2);">📖 ${escapeHtml(w.question.scenario.zh)}</div>` : ''}
          <strong>${escapeHtml(w.question.question?.zh || '')}</strong>
        </div>
        ${w.question.knowledgeNodeIds?.length > 0 ? `
          <div style="margin-top:6px;font-size:11px;color:var(--color-text3);">
            🔗 ${w.question.knowledgeNodeIds.map(nid => {
              const node = getNodeById(nid);
              return node ? `<span style="cursor:pointer;color:var(--color-primary);" onclick="window._nav('/learn?node=${nid}')">${node.name.zh}</span>` : '';
            }).join(' · ')}
          </div>
        ` : ''}
      </div>
    `).join('');
  },

  filterByDomain(domain) {
    this.filterDomain = domain;
    this._applyFilters();
  },

  filterByDifficulty(diff) {
    this.filterDifficulty = diff;
    this._applyFilters();
  },

  _applyFilters() {
    const items = document.querySelectorAll('.wrong-item');
    items.forEach(el => {
      const d = el.dataset.domain;
      const diff = el.dataset.diff;
      const domainMatch = this.filterDomain === 'all' || d === this.filterDomain;
      const diffMatch = this.filterDifficulty === 'all' || diff === this.filterDifficulty;
      el.style.display = domainMatch && diffMatch ? '' : 'none';
    });
  },

  async retryOne(questionId) {
    const allQuestions = await db.getCustomQuestions();
    const q = allQuestions.find(q => q.id === questionId);
    if (!q) { toast('题目未找到', 'info'); return; }
    // 跳到练习页，用该题的知识节点做专项练习
    const nodeId = q.knowledgeNodeIds?.[0] || '';
    router.navigate(`/practice?node=${nodeId}&domain=${q.domain}&auto=1`);
    toast('已跳转到专项练习 🎯', 'success');
  },

  async retryAll() {
    const allProgress = await db.getAllQuestionProgress();
    const wrongIds = allProgress
      .filter(p => p.attempts > 0 && (p.correct || 0) / p.attempts < 0.7)
      .map(p => p.questionId);
    if (wrongIds.length === 0) {
      toast('没有错题了！🎉', 'success');
      return;
    }
    // 跳转到练习页，薄弱点模式会自动选正确率<50%的题
    router.navigate('/practice?mode=weakness');
    toast(`已加载 ${wrongIds.length} 道错题 🎯`, 'success');
  },
};

window._wbFilterDomain = (d) => WrongBook.filterByDomain(d);
window._wbFilterDiff = (d) => WrongBook.filterByDifficulty(d);
window._wbRetryOne = (id) => WrongBook.retryOne(id);
window._wbRetryAll = () => WrongBook.retryAll();

export default WrongBook;
