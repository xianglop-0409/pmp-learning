// ===== 全局事件总线 =====
// 模块间解耦通信 + 会话统计

const listeners = {};
const sessionStats = {
  questionsAnswered: 0,
  questionsCorrect: 0,
  nodesStudied: 0,
  examsCompleted: 0,
  streakToday: false,
};

const bus = {
  on(event, fn) {
    if (!listeners[event]) listeners[event] = [];
    listeners[event].push(fn);
    return () => this.off(event, fn);
  },

  off(event, fn) {
    if (!listeners[event]) return;
    listeners[event] = listeners[event].filter(f => f !== fn);
  },

  emit(event, data) {
    // 更新会话统计
    switch (event) {
      case 'question:answered':
        sessionStats.questionsAnswered++;
        if (data?.isCorrect) sessionStats.questionsCorrect++;
        break;
      case 'node:studied':
        sessionStats.nodesStudied++;
        break;
      case 'exam:completed':
        sessionStats.examsCompleted++;
        break;
      case 'streak:updated':
        sessionStats.streakToday = true;
        break;
    }
    // 通知监听器
    if (!listeners[event]) return;
    listeners[event].forEach(fn => {
      try { fn(data); } catch (e) { console.warn('[EventBus]', e.message); }
    });
  },

  /** 检查并发放成就 */
  async checkAchievements() {
    const stats = this.getSessionStats();
    const total = await this._getTotalFromDB();
    const achievements = [];
    if (total.totalAttempts >= 100) achievements.push('💯 百题斩');
    if (total.totalAttempts >= 500) achievements.push('🏅 五百题大师');
    if (total.totalAttempts >= 1000) achievements.push('👑 千题之王');
    if (stats.correctRate >= 80 && stats.questionsAnswered >= 20) achievements.push('🎯 神枪手');
    if (sessionStats.streakToday) achievements.push('🔥 今日已打卡');
    if (sessionStats.nodesStudied >= 5) achievements.push('📚 学霸');
    return achievements;
  },

  async _getTotalFromDB() {
    try {
      const Dexie = window.Dexie;
      if (!Dexie) return { totalAttempts: 0 };
      const db = new Dexie('pmp_learning_db');
      db.version(3).stores({ questionProgress: 'questionId' });
      await db.open();
      const all = await db.questionProgress.toArray();
      db.close();
      return {
        totalAttempts: all.reduce((s, p) => s + (p.attempts || 0), 0),
      };
    } catch(e) { return { totalAttempts: 0 }; }
  },

  getSessionStats() {
    const total = sessionStats.questionsAnswered;
    return {
      ...sessionStats,
      correctRate: total > 0 ? Math.round((sessionStats.questionsCorrect / total) * 100) : 0,
    };
  },
};

export default bus;
