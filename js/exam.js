// ===== 模拟考试页面 =====

import db from './db.js';
import router from './router.js';
import bus from './event-bus.js';
import { shuffle, toast, escapeHtml, formatMinutes, pct, progressColor } from './utils.js';

const TOTAL_QUESTIONS = 185;  // 2026新考纲：180计分 + 5预测试题
const TOTAL_TIME = 240 * 60; // 240分钟（2026新考纲：原230→240）

const Exam = {
  questions: [],
  answers: {},
  flagged: new Set(),
  currentIndex: 0,
  timeLeft: TOTAL_TIME,
  timerInterval: null,
  isStarted: false,
  isFinished: false,
  sessionId: null,

  async render() {
    // 检查题库
    const allQuestions = await db.getCustomQuestions();
    const questionCount = allQuestions.length;

    if (questionCount < 30) {
      return `
        <div class="card" style="max-width:600px;margin:0 auto;text-align:center;padding:48px;">
          <div style="font-size:64px;">⚠️</div>
          <h3>题库题目不足</h3>
          <p style="color:var(--color-text2);margin:12px 0;">模拟考试需要至少180题，当前题库仅有 <strong>${questionCount}</strong> 题</p>
          <p style="color:var(--color-text3);font-size:12px;">请先在题库管理中添加更多题目，或从JSON导入</p>
          <button class="btn btn-primary" onclick="window._nav('/questions')" style="margin-top:16px;">前往题库管理</button>
        </div>
      `;
    }

    return `
      <div class="card" style="max-width:800px;margin:0 auto;text-align:center;" id="examStartPage">
        <div style="padding:40px 20px;">
          <div style="font-size:64px;margin-bottom:16px;">🏆</div>
          <h2 style="margin-bottom:8px;">PMP 模拟考试</h2>
          <p style="color:var(--color-text2);margin-bottom:8px;">
            ${Math.min(questionCount, TOTAL_QUESTIONS)}题 · ${formatMinutes(240)}
          </p>

          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:32px;max-width:500px;margin-left:auto;margin-right:auto;">
            <div style="text-align:center;padding:12px;background:var(--color-surface2);border-radius:8px;">
              <div style="font-size:24px;font-weight:700;color:var(--color-primary);">33%</div>
              <div style="font-size:11px;color:var(--color-text2);">人员 People</div>
            </div>
            <div style="text-align:center;padding:12px;background:var(--color-surface2);border-radius:8px;">
              <div style="font-size:24px;font-weight:700;color:var(--color-success);">41%</div>
              <div style="font-size:11px;color:var(--color-text2);">过程 Process</div>
            </div>
            <div style="text-align:center;padding:12px;background:var(--color-surface2);border-radius:8px;">
              <div style="font-size:24px;font-weight:700;color:var(--color-warning);">26%</div>
              <div style="font-size:11px;color:var(--color-text2);">商业环境 Business</div>
            </div>
          </div>

          <div style="margin-bottom:24px;font-size:13px;color:var(--color-text2);">
            <p>📋 答题卡导航 &nbsp;|&nbsp; ⭐ 标记题目 &nbsp;|&nbsp; ⏰ 230分钟倒计时</p>
            <p style="margin-top:4px;">所有题目完成后可提前交卷</p>
          </div>

          <button class="btn btn-primary btn-lg" onclick="window._examStart()">
            开始考试
          </button>
          <p style="margin-top:12px;font-size:12px;color:var(--color-text3);">
            ⚠️ 考试开始后计时不会暂停
          </p>
        </div>
      </div>
      <div id="examMain" style="display:none;"></div>
    `;
  },

  async start() {
    const allQuestions = await db.getCustomQuestions();
    // 如果有>=180题，出180题；否则全部
    const count = Math.min(allQuestions.length, TOTAL_QUESTIONS);
    this.questions = shuffle(allQuestions).slice(0, count);
    this.answers = {};
    this.flagged = new Set();
    this.currentIndex = 0;
    this.timeLeft = TOTAL_TIME;
    this.isStarted = true;
    this.isFinished = false;
    this.sessionId = 'exam-' + Date.now().toString(36);

    document.getElementById('examStartPage').style.display = 'none';
    document.getElementById('examMain').style.display = '';

    this._renderExam();
    this._startTimer();
  },

  _renderExam() {
    const el = document.getElementById('examMain');
    const q = this.questions[this.currentIndex];
    if (!q) return;

    const answeredCount = Object.keys(this.answers).length;
    const progressPct = pct(this.currentIndex + 1, this.questions.length);

    el.innerHTML = `
      <!-- 顶部信息 -->
      <div class="exam-header">
        <span style="font-size:14px;font-weight:600;">题目 ${this.currentIndex + 1}/${this.questions.length}</span>
        <span class="exam-timer" id="examTimer">${this._formatTime(this.timeLeft)}</span>
        <span style="font-size:12px;color:var(--color-text2);">已答 ${answeredCount} | 标记 ${this.flagged.size}</span>
      </div>

      <div style="display:grid;grid-template-columns:1fr 280px;gap:16px;">
        <!-- 题目区 -->
        <div>
          <div class="card">
            ${q.scenario?.zh ? `
              <div class="question-scenario">
                <strong>📖 情景：</strong>${escapeHtml(q.scenario.zh)}
              </div>
            ` : ''}
            <div class="question-text">${escapeHtml(q.question?.zh || '')}</div>
            <div class="option-list">
              ${q.options.map(opt => `
                <div class="option-item ${this.answers[q.id] === opt.label ? 'selected' : ''}"
                     onclick="window._examAnswer('${q.id}', '${opt.label}')">
                  <div class="option-label">${opt.label}</div>
                  <span>${escapeHtml(opt.text?.zh || '')}</span>
                </div>
              `).join('')}
            </div>
            <div style="display:flex;gap:8px;margin-top:16px;">
              ${this.currentIndex > 0 ? `<button class="btn btn-secondary btn-sm" onclick="window._examNav(-1)">◀ 上一题</button>` : ''}
              <button class="btn btn-secondary btn-sm" onclick="window._examFlag('${q.id}')">
                ${this.flagged.has(q.id) ? '⭐ 取消标记' : '☆ 标记'}
              </button>
              <div style="flex:1;"></div>
              ${this.currentIndex < this.questions.length - 1
                ? `<button class="btn btn-primary btn-sm" onclick="window._examNav(1)">下一题 ▶</button>`
                : `<button class="btn btn-primary btn-sm" onclick="window._examSubmit()">交卷 📝</button>`
              }
            </div>
          </div>
        </div>

        <!-- 答题卡 -->
        <div class="card" style="position:sticky;top:80px;max-height:calc(100vh - 200px);overflow-y:auto;">
          <h4 style="font-size:13px;margin-bottom:12px;">📋 答题卡</h4>
          <div class="exam-answer-grid" style="grid-template-columns:repeat(9,1fr);">
            ${this.questions.map((q, i) => `
              <button class="exam-answer-btn
                ${this.answers[q.id] ? 'answered' : ''}
                ${this.flagged.has(q.id) ? 'flagged' : ''}
                ${i === this.currentIndex ? 'active' : ''}"
                onclick="window._examGoTo(${i})"
                title="第${i+1}题">
                ${i + 1}
              </button>
            `).join('')}
          </div>
          <button class="btn btn-primary btn-sm" style="width:100%;margin-top:8px;"
                  onclick="window._examSubmit()">
            交卷 (${Object.keys(this.answers).length}/${this.questions.length})
          </button>
        </div>
      </div>
    `;
  },

  answer(questionId, label) {
    if (this.isFinished) return;
    this.answers[questionId] = label;
    this._renderExam();
    // 自动跳到下一题（如果是最后一题则不跳）
    if (this.currentIndex < this.questions.length - 1) {
      setTimeout(() => {
        this.currentIndex++;
        this._renderExam();
      }, 300);
    }
  },

  flag(questionId) {
    if (this.flagged.has(questionId)) {
      this.flagged.delete(questionId);
    } else {
      this.flagged.add(questionId);
    }
    this._renderExam();
  },

  navigate(delta) {
    this.currentIndex = Math.max(0, Math.min(this.questions.length - 1, this.currentIndex + delta));
    this._renderExam();
  },

  goTo(index) {
    this.currentIndex = index;
    this._renderExam();
  },

  async submit() {
    if (this.isFinished) return;

    const unanswered = this.questions.length - Object.keys(this.answers).length;
    if (unanswered > 0) {
      const ok = await new Promise(resolve => {
        const { confirm: c } = window;
        if (typeof confirm === 'function') {
          c(`还有${unanswered}道题未作答，确定要交卷吗？未答题目将被记为错误。`);
        } else {
          resolve(confirm(`还有${unanswered}道题未作答，确定要交卷吗？`));
        }
        resolve(true); // 简化处理，直接允许
      });
      // 直接处理
    }

    this.isFinished = true;
    clearInterval(this.timerInterval);

    // 计算分数
    let score = 0;
    const domainScores = {};
    this.questions.forEach(q => {
      const userAnswer = this.answers[q.id];
      const isCorrect = userAnswer === q.correctAnswer;
      if (isCorrect) score++;
      if (!domainScores[q.domain]) domainScores[q.domain] = { correct: 0, total: 0 };
      domainScores[q.domain].total++;
      if (isCorrect) domainScores[q.domain].correct++;
    });
    this._wrongCount = this.questions.length - score;

    // 保存考试记录
    const session = {
      id: this.sessionId,
      startedAt: new Date(Date.now() - (TOTAL_TIME - this.timeLeft) * 1000).toISOString(),
      finishedAt: new Date().toISOString(),
      questions: this.questions.map(q => q.id),
      answers: { ...this.answers },
      score,
      total: this.questions.length,
      timeUsed: Math.round((TOTAL_TIME - this.timeLeft) / 60),
      domainScores: Object.fromEntries(
        Object.entries(domainScores).map(([k, v]) => [k, Math.round((v.correct / v.total) * 100)])
      ),
    };
    await db.saveExamSession(session);

    // 发布事件
    bus.emit('exam:completed', {
      sessionId: session.id,
      score,
      total: this.questions.length,
      rate: Math.round((score / this.questions.length) * 100),
    });
    bus.emit('streak:updated', {});

    // 显示结果
    this._showResult(score, domainScores);
  },

  _showResult(score, domainScores) {
    const total = this.questions.length;
    const rate = pct(score, total);
    const domainMap = { governance: '治理', scope: '范围', schedule: '进度', finance: '财务', stakeholder: '利益相关方', resource: '资源', risk: '风险', agile: '敏捷' };

    document.getElementById('examMain').innerHTML = `
      <div class="card" style="max-width:700px;margin:0 auto;text-align:center;">
        <div style="font-size:64px;">${rate >= 70 ? '🎉' : '💪'}</div>
        <h2 style="margin-bottom:4px;">考试完成！</h2>
        <p style="color:var(--color-text2);">用时 ${Math.round((TOTAL_TIME - this.timeLeft) / 60)}分钟</p>

        <div style="font-size:48px;font-weight:700;margin:20px 0;background:linear-gradient(135deg,var(--color-primary),#a78bfa);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">${score}/${total} · ${rate}%</div>

        <div class="progress-bar" style="height:12px;border-radius:6px;max-width:400px;margin:0 auto 20px;">
          <div class="progress-fill" style="width:${rate}%;background:${progressColor(rate)};height:12px;border-radius:6px;"></div>
        </div>

        <h4 style="margin-bottom:12px;">各领域正确率</h4>
        <div style="text-align:left;max-width:400px;margin:0 auto 20px;">
          ${Object.entries(domainScores).map(([domain, ds]) => {
            const dpct = Math.round((ds.correct / ds.total) * 100);
            return `
              <div class="domain-progress-row">
                <div class="domain-status" style="background:${progressColor(dpct)};"></div>
                <span class="domain-name">${domainMap[domain] || domain}</span>
                <div class="mini-bar-wrap">
                  <div class="mini-bar-fill" style="width:${dpct}%;background:${progressColor(dpct)};"></div>
                </div>
                <span class="domain-score">${ds.correct}/${ds.total} ${dpct}%</span>
              </div>
            `;
          }).join('')}
        </div>

        ${this._wrongCount > 0 ? `
          <div style="margin-top:16px;padding:12px;background:var(--color-surface2);border-radius:8px;text-align:center;">
            <p style="font-size:13px;margin-bottom:8px;">❌ 本次考试答错 <strong>${this._wrongCount}</strong> 题</p>
            <button class="btn btn-primary" onclick="window._nav('/wrong-book')">📋 去错题本查看详情</button>
          </div>
        ` : ''}

        <div style="display:flex;gap:12px;justify-content:center;margin-top:16px;">
          <button class="btn btn-primary" onclick="window._nav('/practice?mode=weakness')">薄弱点突击 🎯</button>
          <button class="btn btn-secondary" onclick="window._nav('/analytics')">学习报告 📈</button>
          <button class="btn btn-secondary" onclick="window._nav('/exam')">重新考试</button>
        </div>
      </div>
    `;
  },

  _startTimer() {
    this.timerInterval = setInterval(() => {
      this.timeLeft--;
      const timerEl = document.getElementById('examTimer');
      if (timerEl) {
        timerEl.textContent = this._formatTime(this.timeLeft);
        timerEl.style.color = this.timeLeft < 600 ? 'var(--color-danger)' : this.timeLeft < 1800 ? 'var(--color-warning)' : '';
      }
      if (this.timeLeft <= 0) {
        this.submit();
      }
    }, 1000);
  },

  _formatTime(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  },
};

// ===== 全局函数 =====
window._examStart = () => Exam.start();
window._examAnswer = (qid, label) => Exam.answer(qid, label);
window._examFlag = (qid) => Exam.flag(qid);
window._examNav = (delta) => Exam.navigate(delta);
window._examGoTo = (idx) => Exam.goTo(idx);
window._examSubmit = () => Exam.submit();

export default Exam;
