// ===== 练习模式页面 — 联动学习引擎核心 =====

import db from './db.js';
import router from './router.js';
import bus from './event-bus.js';
import { getNodesByType, getNodeById } from './knowledge-graph.js';
import { shuffle, toast, escapeHtml, pct, progressColor, progressLabel } from './utils.js';

const Practice = {
  mode: 'domain',     // 'domain' | 'random' | 'weakness' | 'adaptive'
  questions: [],       // 当前练习题目池
  currentIndex: 0,     // 当前题目索引
  selectedAnswer: null,
  isSubmitted: false,
  correctCount: 0,
  wrongCount: 0,
  practiceId: null,
  answers: {},         // 每道题的作答记录 { [questionId]: { selected, correct } }
  sessionActive: false, // 是否在活跃练习会话中（跨菜单切换保留）

  /** 清空所有练习状态 */
  _resetState() {
    this.mode = 'domain';
    this.questions = [];
    this.currentIndex = 0;
    this.selectedAnswer = null;
    this.isSubmitted = false;
    this.correctCount = 0;
    this.wrongCount = 0;
    this.answers = {};
    this.sessionActive = false;
  },

  async render() {
    const query = router.getQuery();
    const hasJump = !!(query.node || query.domain || query.auto);
    // 恢复会话：已有活跃会话且非带参跳转（从学习页/图谱跳转过来 = 新开覆盖）
    const restoring = this.sessionActive && this.questions.length > 0 && !hasJump;

    // 带参跳转（新开覆盖）或首次进入（无活跃会话）→ 重置
    if (hasJump || !this.sessionActive) {
      this._resetState();
    }

    // 读取查询参数
    const targetNode = query.node ? getNodeById(query.node) : null;
    const targetDomain = targetNode?.domain || (query.domain || '');
    const autoStart = query.auto === '1';

    const domains = getNodesByType('domain');

    const html = `
      <div class="question-card">
        <!-- 模式切换 -->
        <div class="tab-group">
          <button class="tab-btn active" onclick="window._pSwitchMode('domain', this)">📂 按领域练习</button>
          <button class="tab-btn" onclick="window._pSwitchMode('random', this)">🎲 随机练习</button>
          <button class="tab-btn" onclick="window._pSwitchMode('weakness', this)">🎯 薄弱点突击</button>
          <button class="tab-btn" onclick="window._pSwitchMode('adaptive', this)" style="color:var(--color-success);">🤖 智能推荐</button>
        </div>

        <!-- 领域选择 + 筛选（按领域模式） -->
        <div id="pDomainSelect" class="card" style="margin-bottom:16px;">
          <div style="font-size:13px;color:var(--color-text2);margin-bottom:8px;">选择练习领域（可多选）：</div>
          <div style="display:flex;gap:8px;flex-wrap:wrap;">
            ${domains.map(d => `
              <button class="tag tag-blue domain-tag" data-domain="${d.id.replace('domain-','')}" onclick="this.classList.toggle('tag-green');this.classList.toggle('tag-blue');" style="cursor:pointer;">
                ${d.name.zh}
              </button>
            `).join('')}
            <button class="tag tag-gray domain-tag" data-domain="agile" onclick="this.classList.toggle('tag-green');this.classList.toggle('tag-gray');" style="cursor:pointer;">
              敏捷
            </button>
          </div>
          <div style="margin-top:10px;">
            <div style="display:flex;gap:6px;align-items:center;flex-wrap:nowrap;overflow-x:auto;">
              <span style="font-size:12px;color:var(--color-text2);white-space:nowrap;">难度：</span>
              ${[1,2,3,4,5].map(d => `
                <button class="tag tag-gray diff-tag" data-diff="${d}" onclick="this.classList.toggle('tag-green');this.classList.toggle('tag-gray');" style="cursor:pointer;flex-shrink:0;">
                  ${'⭐'.repeat(d)}
                </button>
              `).join('')}
            </div>
            <div style="display:flex;gap:8px;align-items:center;margin-top:8px;">
              <span style="font-size:12px;color:var(--color-text2);white-space:nowrap;">状态：</span>
              <select id="pStatusFilter" style="flex:1;padding:4px 8px;border-radius:4px;border:1px solid var(--color-border);font-size:12px;">
                <option value="all">全部题目</option>
                <option value="unattempted">未做过</option>
                <option value="starred">已标记</option>
                <option value="wrong">曾答错</option>
              </select>
              <span style="font-size:12px;color:var(--color-text2);white-space:nowrap;">题数：</span>
              <select id="pCountFilter" style="width:70px;padding:4px 8px;border-radius:4px;border:1px solid var(--color-border);font-size:12px;">
                <option value="20">20</option>
                <option value="50">50</option>
                <option value="100">100</option>
                <option value="0">全部</option>
              </select>
            </div>
          </div>
          <div style="flex:1;"></div>
          <button class="btn btn-primary btn-sm" style="margin-top:12px;" onclick="window._pStart()">开始练习</button>
        </div>

        ${targetDomain ? `
        <div class="card" style="margin-top:12px;background:var(--color-primary-bg);border-color:var(--color-primary);">
          <p style="font-size:13px;">🎯 已自动选中领域「<strong>${targetNode?.name?.zh || targetDomain}</strong>」</p>
          <button class="btn btn-primary btn-sm" style="margin-top:8px;" onclick="window._pQuickStart('${targetDomain}')">
            直接开始练习 →
          </button>
        </div>
        ` : ''}

        <!-- 进度条（答题中） -->
        <div id="pProgress" style="display:none;margin-bottom:16px;">
          <div style="display:flex;justify-content:space-between;margin-bottom:6px;font-size:13px;">
            <span>📝 题目 <span id="pProgressNum">1/0</span></span>
            <span>✅ <span id="pCorrect">0</span> | ❌ <span id="pWrong">0</span></span>
            <span style="color:var(--color-text2);">正确率: <span id="pRate">0%</span></span>
          </div>
          <div class="progress-bar" style="height:6px;">
            <div class="progress-fill" id="pProgressBar" style="width:0%;background:var(--color-primary);height:6px;"></div>
          </div>
        </div>

        <!-- 答题区域 -->
        <div id="pQuestionArea"></div>

        <!-- 答题结果统计 -->
        <div id="pResultSummary" style="display:none;"></div>
      </div>
    `;

    // 渲染后：恢复会话 或 自动开始
    setTimeout(() => {
      if (restoring) {
        // 恢复会话：隐藏领域选择，显示进度条 + 当前题目
        const domainSelect = document.getElementById('pDomainSelect');
        if (domainSelect) domainSelect.style.display = 'none';
        const progress = document.getElementById('pProgress');
        if (progress) progress.style.display = '';
        this._renderQuestion();
      } else if (autoStart && targetDomain) {
        // 带参自动开始（从学习页/图谱跳转，新开覆盖）
        window._pQuickStart(targetDomain);
      }
    }, 50);

    return html;
  },

  // 模式切换
  switchMode(mode) {
    this.mode = mode;
    const domainSelect = document.getElementById('pDomainSelect');
    if (domainSelect) {
      domainSelect.style.display = mode === 'domain' ? '' : 'none';
    }
    // 重置
    this.questions = [];
    this.currentIndex = 0;
    this.selectedAnswer = null;
    this.isSubmitted = false;
    this.correctCount = 0;
    this.wrongCount = 0;
    this.answers = {};
    this.sessionActive = false;  // 切换模式 = 结束当前会话
    const qArea = document.getElementById('pQuestionArea');
    if (qArea) qArea.innerHTML = mode === 'domain' ? '' : '<div class="page-loading"><div class="spinner"></div><p>加载题目中...</p></div>';
    const result = document.getElementById('pResultSummary');
    if (result) result.style.display = 'none';

    // 随机练习、薄弱突击、智能推荐都自动开始
    if (mode === 'random' || mode === 'weakness' || mode === 'adaptive') {
      setTimeout(() => this.start(), 100);
    }
  },

  // 开始练习
  async start() {
    let pool = [];
    let allQuestions = await db.getCustomQuestions();

    // 等待数据导入完成（最多等10秒）
    let retries = 0;
    while (allQuestions.length === 0 && retries < 20) {
      await new Promise(r => setTimeout(r, 500));
      allQuestions = await db.getCustomQuestions();
      retries++;
    }

    if (allQuestions.length === 0) {
      const qArea = document.getElementById('pQuestionArea');
      if (qArea) qArea.innerHTML = '<div class="empty-state"><div class="empty-icon">📭</div><h3>题库为空</h3><p>请先在题库管理中导入或添加题目</p><button class="btn btn-primary btn-sm" style="margin-top:12px;" onclick="window._nav(\'/questions\')">前往题库管理</button></div>';
      return;
    }

    if (this.mode === 'domain') {
      const selectedDomains = [...document.querySelectorAll('.domain-tag.tag-green')]
        .map(el => el.dataset.domain);
      if (selectedDomains.length === 0) {
        toast('请至少选择一个领域', 'info');
        return;
      }
      pool = allQuestions.filter(q => selectedDomains.includes(q.domain));
    } else if (this.mode === 'random') {
      pool = [...allQuestions];
    } else if (this.mode === 'weakness') {
      const allProgress = await db.getAllQuestionProgress();
      const weakIds = allProgress
        .filter(p => p.attempts >= 3 && (p.correct || 0) / p.attempts < 0.5)
        .map(p => p.questionId);
      pool = allQuestions.filter(q => weakIds.includes(q.id));
      if (pool.length === 0) {
        toast('没有薄弱题目 🎉', 'success');
        pool = [...allQuestions];
      }
    } else if (this.mode === 'adaptive') {
      // 智能推荐引擎
      const allProgress = await db.getAllQuestionProgress();
      const progressMap = {};
      allProgress.forEach(p => { progressMap[p.questionId] = p; });

      // 计算每道题的推荐分数
      const scored = allQuestions.map(q => {
        const p = progressMap[q.id];
        let score = 50; // 基础分

        if (!p || (p.attempts || 0) === 0) {
          // 未做过的题：根据领域薄弱程度加权，给高分让用户优先做
          score += 30;
        } else {
          const rate = (p.correct || 0) / Math.max(p.attempts, 1);
          if (rate < 0.4) {
            // 正确率极低 → 需要重做但不要太频繁
            score += 20 * (1 - rate);
          } else if (rate < 0.7) {
            // 正确率偏低 → 需要加强
            score += 10 * (1 - rate);
          } else {
            // 正确率高 → 降低权重
            score -= 20 * rate;
          }
          // 错过的题目加分
          if (p.wrongCount && p.wrongCount > 0) {
            score += Math.min(p.wrongCount * 5, 30);
          }
          // 题目越久没做分越高
          if (p.lastAttempt) {
            const days = (Date.now() - new Date(p.lastAttempt).getTime()) / 86400000;
            score += Math.min(days * 3, 25);
          }
        }

        // 标记的题目优先
        if (p?.isStarred) score += 15;

        return { ...q, _score: score };
      });

      // 按分数降序排列
      scored.sort((a, b) => b._score - a._score);
      pool = scored;
      toast(`🤖 已按掌握度排序 ${pool.length} 题`, 'success');
    }

    // 通用筛选：难度
    const selectedDiffs = [...document.querySelectorAll('.diff-tag.tag-green')].map(el => parseInt(el.dataset.diff));
    if (selectedDiffs.length > 0) {
      pool = pool.filter(q => selectedDiffs.includes(q.difficulty || 1));
    }

    // 通用筛选：状态
    const statusFilter = document.getElementById('pStatusFilter')?.value || 'all';
    if (statusFilter !== 'all') {
      const allProgress = await db.getAllQuestionProgress();
      const progressMap = {};
      allProgress.forEach(p => { progressMap[p.questionId] = p; });
      if (statusFilter === 'unattempted') {
        pool = pool.filter(q => !progressMap[q.id] || (progressMap[q.id].attempts || 0) === 0);
      } else if (statusFilter === 'starred') {
        pool = pool.filter(q => progressMap[q.id]?.isStarred);
      } else if (statusFilter === 'wrong') {
        pool = pool.filter(q => {
          const p = progressMap[q.id];
          return p && p.attempts > 0 && (p.correct || 0) / p.attempts < 0.7;
        });
      }
    }

    // 题数限制（智能推荐不改顺序，只截取数量）
    const countLimit = parseInt(document.getElementById('pCountFilter')?.value || '0');
    if (countLimit > 0 && pool.length > countLimit) {
      if (this.mode === 'adaptive') {
        pool = pool.slice(0, countLimit); // 智能推荐按分数顺序取
      } else {
        pool = shuffle(pool).slice(0, countLimit);
      }
    }

    if (this.mode !== 'adaptive') {
      pool = shuffle(pool);
    }
    this.questions = pool;
    this.currentIndex = 0;
    this.correctCount = 0;
    this.wrongCount = 0;
    this.answers = {};
    this.sessionActive = true;

    // 隐藏选择，显示进度和题目
    const domainSelect = document.getElementById('pDomainSelect');
    if (domainSelect) domainSelect.style.display = 'none';
    const progress = document.getElementById('pProgress');
    if (progress) progress.style.display = '';
    const result = document.getElementById('pResultSummary');
    if (result) result.style.display = 'none';

    this._updateProgress();
    this._renderQuestion();
  },

  // 渲染当前题目
  _renderQuestion() {
    const area = document.getElementById('pQuestionArea');
    if (!area) return;

    if (this.currentIndex >= this.questions.length) {
      this._showResult();
      return;
    }

    const q = this.questions[this.currentIndex];

    // 还原已作答状态（回看上一题/下一题时保留作答记录）
    const prevAnswer = this.answers[q.id];
    if (prevAnswer) {
      this.selectedAnswer = prevAnswer.selected;
      this.isSubmitted = true;
    } else {
      this.selectedAnswer = null;
      this.isSubmitted = false;
    }

    const domainMap = { governance: '治理', scope: '范围', schedule: '进度', finance: '财务', stakeholder: '利益相关方', resource: '资源', risk: '风险', agile: '敏捷' };
    const diffStars = { 1: '⭐', 2: '⭐⭐', 3: '⭐⭐⭐', 4: '⭐⭐⭐⭐', 5: '⭐⭐⭐⭐⭐' };

    area.innerHTML = `
      <div class="card">
        <div style="display:flex;gap:8px;align-items:center;margin-bottom:12px;">
          <span class="tag tag-blue">${domainMap[q.domain] || q.domain}</span>
          <span style="font-size:12px;color:var(--color-text3);">${diffStars[q.difficulty] || ''}</span>
          ${q.focusArea ? `<span class="tag tag-gray">${q.focusArea}</span>` : ''}
        </div>

        ${q.scenario?.zh ? `
          <div class="question-scenario">
            <strong style="font-size:12px;color:var(--color-text2);">📖 情景：</strong>
            <p style="margin-top:4px;">${escapeHtml(q.scenario.zh)}</p>
          </div>
        ` : ''}

        <div class="question-text">${escapeHtml(q.question?.zh || '')}</div>

        <div class="option-list" id="pOptions">
          ${q.options.map((opt, i) => {
            let extraClass = '';
            if (this.isSubmitted) {
              if (opt.label === q.correctAnswer) extraClass = 'correct';
              else if (opt.label === this.selectedAnswer && opt.label !== q.correctAnswer) extraClass = 'wrong';
            }
            return `
              <div class="option-item ${opt.label === this.selectedAnswer ? 'selected' : ''} ${extraClass}"
                   onclick="window._pSelect('${opt.label}')" data-opt="${opt.label}">
                <div class="option-label">${opt.label}</div>
                <span>${escapeHtml(opt.text?.zh || '')}</span>
              </div>
            `;
          }).join('')}
        </div>

        ${!this.isSubmitted ? `
          <button class="btn btn-primary btn-lg" style="width:100%;margin-top:16px;"
                  onclick="window._pSubmit()"
                  ${!this.selectedAnswer ? 'disabled' : ''}
                  id="pSubmitBtn">
            ${this.selectedAnswer ? '提交答案' : '请先选择一个选项'}
          </button>
          <button class="btn btn-secondary btn-sm" style="width:100%;margin-top:8px;" onclick="window._pExit()">
            退出练习
          </button>
        ` : `
          <div class="explanation-box ${this.selectedAnswer === q.correctAnswer ? 'correct' : 'wrong'}">
            <strong>${this.selectedAnswer === q.correctAnswer ? '✅ 回答正确！' : '❌ 回答错误'}</strong>
            ${q.explanation?.zh ? `<p style="margin-top:8px;line-height:1.7;">${escapeHtml(q.explanation.zh)}</p>` : ''}
            ${q.explanation?.zh ? `
              <button class="btn btn-sm btn-secondary" style="margin-top:8px;font-size:11px;"
                onclick="navigator.clipboard?.writeText(this.previousElementSibling?.textContent||'');window._pToastCopy()">
                📋 复制解析
              </button>
            ` : ''}
          </div>

          ${q.knowledgeNodeIds?.length > 0 ? `
            <div style="margin-top:12px;">
              <span style="font-size:12px;color:var(--color-text2);">🔗 关联知识节点：</span>
              ${q.knowledgeNodeIds.map(nid => {
                const node = getNodeById(nid);
                return node ? `<span class="knowledge-card" onclick="window._nav('/learn?node=${nid}')" style="display:inline-block;margin:4px;padding:6px 10px;font-size:12px;cursor:pointer;background:var(--color-surface2);border-radius:4px;border:1px solid var(--color-border);" title="点击跳转到学习页查看「${node.name.zh}」">📚 ${node.name.zh}</span>` : '';
              }).join('')}
            </div>
          ` : ''}

          <div style="display:flex;gap:8px;margin-top:16px;">
            <button class="btn btn-secondary btn-sm" onclick="window._pMark('${q.id}')">
              ⭐ 标记
            </button>
            <button class="btn btn-secondary btn-sm" onclick="window._nav('/graph?node=${q.knowledgeNodeIds?.[0] || ''}')">
              🕸️ 查看图谱
            </button>
            ${q.knowledgeNodeIds?.length > 0 ? `
              <button class="btn btn-secondary btn-sm" onclick="window._nav('/learn?node=${q.knowledgeNodeIds[0]}')" style="color:var(--color-primary);">
                📖 去学习页复习
              </button>
            ` : ''}
            <div style="flex:1;"></div>
            ${this.currentIndex > 0 ? `<button class="btn btn-secondary" onclick="window._pPrev()">◀ 上一题</button>` : ''}
            <button class="btn btn-primary" onclick="window._pNext()">
              ${this.currentIndex < this.questions.length - 1 ? '下一题 ▶' : '查看结果 📊'}
            </button>
          </div>
        `}
      </div>
    `;

    this._updateProgress();
  },

  // 选择答案
  async selectAnswer(label) {
    if (this.isSubmitted) return;
    this.selectedAnswer = label;

    // 更新UI
    document.querySelectorAll('.option-item').forEach(el => {
      el.classList.toggle('selected', el.dataset.opt === label);
    });
    const btn = document.getElementById('pSubmitBtn');
    if (btn) {
      btn.textContent = '提交答案';
      btn.disabled = false;
    }
  },

  // 提交答案
  async submit() {
    if (!this.selectedAnswer || this.isSubmitted) return;
    this.isSubmitted = true;

    const q = this.questions[this.currentIndex];
    const isCorrect = this.selectedAnswer === q.correctAnswer;
    if (isCorrect) this.correctCount++;
    else this.wrongCount++;

    // 保存本题作答记录（供上一题/下一题回看）
    this.answers[q.id] = { selected: this.selectedAnswer, correct: isCorrect };

    // 保存进度到 IndexedDB
    const existing = await db.getQuestionProgress(q.id);
    await db.updateQuestionProgress(q.id, {
      nodeIds: q.knowledgeNodeIds || [],
      domain: q.domain,
      attempts: (existing?.attempts || 0) + 1,
      correct: (existing?.correct || 0) + (isCorrect ? 1 : 0),
      wrongCount: (existing?.wrongCount || 0) + (isCorrect ? 0 : 1),
      lastAnswer: this.selectedAnswer,
      lastAttempt: new Date().toISOString(),
    });

    // 发布事件：通知其他模块
    bus.emit('question:answered', {
      questionId: q.id,
      isCorrect,
      domain: q.domain,
      nodeIds: q.knowledgeNodeIds || [],
    });

    // 里程碑通知 + 鼓励
    const totalAnswered = this.correctCount + this.wrongCount;
    const currentRate = Math.round((this.correctCount / totalAnswered) * 100);
    if (totalAnswered === 5) {
      if (currentRate >= 80) toast(`🎉 前5题正确率 ${currentRate}%，状态不错！`, 'success');
      else if (currentRate < 50) toast(`💪 前5题正确率 ${currentRate}%，继续加油！薄弱点正在帮你识别`, 'info');
      bus.emit('milestone:reached', { type: 'practice_5', rate: currentRate });
    }
    if (totalAnswered === 10) {
      if (currentRate >= 70) toast(`🚀 ${totalAnswered}题正确率 ${currentRate}%，保持节奏！`, 'success');
      else toast(`📚 已做${totalAnswered}题，正确率${currentRate}%，建议回顾错题解析`, 'info');
      bus.emit('milestone:reached', { type: 'practice_10', rate: currentRate });
    }
    if (totalAnswered > 0 && totalAnswered % 20 === 0) {
      toast(`⚡ 连续刷题 ${totalAnswered} 道！`, 'success');
    }

    // 重绘题目（显示对错和解析），用户手动点下一题/上一题
    this._renderQuestion();
  },

  // 下一题
  nextQuestion() {
    this.currentIndex++;
    if (this.currentIndex >= this.questions.length) {
      this._showResult();
    } else {
      this._renderQuestion();
    }
  },

  // 上一题（回看作答情况和解析）
  prevQuestion() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this._renderQuestion();
    }
  },

  // 标记题目
  async markQuestion(questionId) {
    const existing = await db.getQuestionProgress(questionId);
    await db.updateQuestionProgress(questionId, {
      ...(existing || { nodeIds: [], domain: 'governance' }),
      isStarred: existing?.isStarred ? 0 : 1,
    });
    toast(existing?.isStarred ? '已取消标记' : '已标记 ⭐', 'success');
  },

  // 显示结果
  _showResult() {
    // 完成一轮练习 → 会话结束，下次进入重新开始
    this.sessionActive = false;
    const total = this.questions.length;
    const rate = total > 0 ? Math.round((this.correctCount / total) * 100) : 0;

    const area = document.getElementById('pQuestionArea');
    if (area) area.innerHTML = '';

    const progress = document.getElementById('pProgress');
    if (progress) progress.style.display = 'none';

    const result = document.getElementById('pResultSummary');
    if (result) {
      result.style.display = '';
      result.innerHTML = `
        <div class="card" style="text-align:center;">
          <div style="font-size:64px;">${rate >= 70 ? '🎉' : rate >= 50 ? '💪' : '📚'}</div>
          <h2 style="margin-bottom:8px;">练习完成！</h2>
          <p style="color:var(--color-text2);margin-bottom:20px;">共 ${total} 题 · 正确 ${this.correctCount} · 错误 ${this.wrongCount} · 正确率 ${rate}%</p>
          <div class="progress-bar" style="height:12px;border-radius:6px;max-width:400px;margin:0 auto 20px;">
            <div class="progress-fill" style="width:${rate}%;background:${progressColor(rate)};height:12px;border-radius:6px;"></div>
          </div>
          <div style="display:flex;gap:12px;justify-content:center;">
            <button class="btn btn-primary" onclick="window._nav('/practice')">继续练习</button>
            <button class="btn btn-secondary" onclick="window._nav('/graph?node=${Practice.questions[0]?.knowledgeNodeIds?.[0] || ''}')">查看知识图谱</button>
            <button class="btn btn-secondary" onclick="window._nav('/analytics')">学习报告</button>
            <button class="btn btn-secondary" onclick="window._shareResult()" style="background:#22c55e;color:#fff;border-color:#22c55e;">📤 分享成绩</button>
          </div>
        </div>
      `;
    }
  },

  // 更新进度条
  _updateProgress() {
    document.getElementById('pProgressNum').textContent = `${this.currentIndex + 1}/${this.questions.length}`;
    document.getElementById('pCorrect').textContent = this.correctCount;
    document.getElementById('pWrong').textContent = this.wrongCount;
    const totalAnswered = this.correctCount + this.wrongCount;
    document.getElementById('pRate').textContent = totalAnswered > 0 ? `${Math.round((this.correctCount / totalAnswered) * 100)}%` : '0%';
    document.getElementById('pProgressBar').style.width = `${((this.currentIndex) / this.questions.length) * 100}%`;
  },
};

// ===== 全局函数 =====
window._pSwitchMode = (mode, el) => {
  Practice.switchMode(mode);
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
};

window._pStart = () => Practice.start();
window._pQuickStart = async (domain) => {
  // 自动选择领域标记
  document.querySelectorAll('.domain-tag').forEach(el => {
    if (el.dataset.domain === domain) {
      el.classList.remove('tag-blue', 'tag-gray');
      el.classList.add('tag-green');
    }
  });
  Practice.mode = 'domain';
  await Practice.start();
};
window._pSelect = (label) => Practice.selectAnswer(label);
window._pSubmit = () => Practice.submit();
window._pNext = () => Practice.nextQuestion();
window._pPrev = () => Practice.prevQuestion();
window._pMark = (id) => Practice.markQuestion(id);

// 退出练习
window._pExit = () => {
  if (confirm('确定要退出练习吗？本次练习进度将清空。')) {
    Practice._resetState();
    window._nav('/dashboard');
  }
};

// 复制提示
window._pToastCopy = () => toast('已复制解析到剪贴板 📋', 'info');

// 分享成绩
window._shareResult = () => {
  const total = Practice.questions.length;
  const rate = total > 0 ? Math.round((Practice.correctCount / total) * 100) : 0;
  const emoji = rate >= 70 ? '🎉' : rate >= 50 ? '💪' : '📚';
  const text = `${emoji} PMP学习机 · 今日练习 ${Practice.correctCount}/${total} · 正确率${rate}%\n\nPMBOK第8版 · 2026新考纲备战中！`;
  if (navigator.share) {
    navigator.share({ title: 'PMP学习机练习成绩', text });
  } else {
    navigator.clipboard?.writeText(text);
    toast('成绩已复制，可粘贴分享到微信！', 'success');
  }
};

export default Practice;
