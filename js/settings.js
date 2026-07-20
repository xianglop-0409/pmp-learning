// ===== 学习提醒 & 数据备份页面 =====
import db from './db.js';
import bus from './event-bus.js';
import { toast } from './utils.js';

const Settings = {
  async render() {
    const streak = await db.getStreak();
    const stats = await db.getStats();
    const sessionStats = bus.getSessionStats();

    return `
      <div class="settings-page" style="max-width:700px;margin:0 auto;">
        <h2 style="font-size:20px;margin-bottom:20px;">⚙️ 系统设置</h2>

        <!-- 主题切换 -->
        <div class="card" style="margin-bottom:16px;">
          <div class="card-header"><span class="card-title">🎨 主题切换</span></div>
          <div style="display:flex;gap:12px;">
            <button class="btn btn-secondary" id="btnThemeLight" onclick="window._setTheme('light')" style="flex:1;">☀️ 亮色模式</button>
            <button class="btn btn-secondary" id="btnThemeDark" onclick="window._setTheme('dark')" style="flex:1;background:var(--color-surface2);color:var(--color-text);">🌙 暗色模式</button>
          </div>
        </div>

        <!-- 今日目标 -->
        <div class="card" style="margin-bottom:16px;">
          <div class="card-header"><span class="card-title">🎯 今日学习目标</span></div>
          <div style="padding:4px 0;">
            <div style="display:flex;gap:24px;align-items:center;">
              <div style="text-align:center;">
                <div style="font-size:28px;font-weight:700;color:var(--color-primary);">${sessionStats.questionsAnswered}</div>
                <div style="font-size:12px;color:var(--color-text2);">今日已答</div>
              </div>
              <div style="width:1px;height:40px;background:var(--color-border);"></div>
              <div style="text-align:center;">
                <div style="font-size:28px;font-weight:700;color:var(--color-success);">${sessionStats.nodesStudied}</div>
                <div style="font-size:12px;color:var(--color-text2);">今日学习</div>
              </div>
              <div style="width:1px;height:40px;background:var(--color-border);"></div>
              <div style="text-align:center;">
                <div style="font-size:28px;font-weight:700;color:var(--color-warning);">${streak}</div>
                <div style="font-size:12px;color:var(--color-text2);">🔥 连续天数</div>
              </div>
            </div>
            <div style="margin-top:12px;padding:10px;background:var(--color-primary-bg);border-radius:6px;font-size:12px;">
              💡 建议每天至少练习 <strong>20题</strong> 或学习 <strong>3个知识单元</strong>，连续7天可显著提升通过率。
            </div>
          </div>
        </div>

        <!-- 数据备份 -->
        <div class="card" style="margin-bottom:16px;">
          <div class="card-header"><span class="card-title">💾 数据备份</span></div>
          <div style="display:flex;gap:12px;flex-wrap:wrap;">
            <button class="btn btn-primary" onclick="window._settingsExport()">📥 导出学习数据</button>
            <button class="btn btn-secondary" onclick="window._settingsImport()">📤 导入学习数据</button>
          </div>
          <p style="font-size:11px;color:var(--color-text3);margin-top:8px;">
            导出包含所有答题记录、学习进度、考试记录。建议定期备份。
          </p>
          <input type="file" id="settingsImportFile" accept=".json" style="display:none;" onchange="window._settingsHandleImport(event)">
        </div>

        <!-- 统计信息 -->
        <div class="card">
          <div class="card-header"><span class="card-title">📊 数据统计</span></div>
          <div style="font-size:13px;color:var(--color-text2);line-height:2;">
            <p>📝 总答题次数：<strong>${stats.totalAttempts}</strong></p>
            <p>✅ 总正确数：<strong>${stats.totalCorrect}</strong></p>
            <p>❌ 总错误数：<strong>${stats.totalWrong}</strong></p>
            <p>📊 总体正确率：<strong>${stats.overallCorrectRate}%</strong></p>
          </div>
        </div>
      </div>
    `;
  },
};

// 导出
window._settingsExport = async () => {
  try {
    const data = {
      version: 1,
      exportedAt: new Date().toISOString(),
      nodeProgress: await db.getAllNodeProgress(),
      questionProgress: await db.getAllQuestionProgress(),
      examSessions: await db.getExamSessions(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pmp-backup-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast('✅ 学习数据已导出', 'success');
  } catch(e) {
    toast('导出失败: ' + e.message, 'error');
  }
};

// 导入
window._settingsImport = () => {
  document.getElementById('settingsImportFile').click();
};

window._settingsHandleImport = async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  try {
    const text = await file.text();
    const data = JSON.parse(text);
    if (!data.version) throw new Error('无效的备份文件');

    // 恢复数据
    if (data.nodeProgress) {
      for (const p of data.nodeProgress) await db.updateNodeProgress(p.nodeId, p);
    }
    if (data.questionProgress) {
      for (const p of data.questionProgress) await db.updateQuestionProgress(p.questionId, p);
    }
    if (data.examSessions) {
      for (const s of data.examSessions) await db.saveExamSession(s);
    }
    toast(`✅ 已导入！节点${data.nodeProgress?.length||0}个 题目${data.questionProgress?.length||0}条 考试${data.examSessions?.length||0}次`, 'success');
  } catch(e) {
    toast('导入失败: ' + e.message, 'error');
  }
};

// 主题切换
window._setTheme = async (theme) => {
  document.documentElement.setAttribute('data-theme', theme);
  await db.setSetting('theme', theme);
  document.getElementById('btnThemeLight').style.background = theme === 'light' ? 'var(--color-primary)' : '';
  document.getElementById('btnThemeDark').style.background = theme === 'dark' ? 'var(--color-primary)' : '';
  toast(theme === 'dark' ? '🌙 已切换暗色模式' : '☀️ 已切换亮色模式', 'success');
};

export default Settings;

