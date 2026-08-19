// ===== 系统设置 =====
import db from './db.js';
import Sync from './sync.js';
import { toast } from './utils.js';

function getGoal() { return parseInt(localStorage.getItem('pmp_daily_goal') || '20'); }
function getTodayDone() {
  const today = new Date().toISOString().slice(0,10);
  const done = parseInt(localStorage.getItem('pmp_done_' + today) || '0');
  return done;
}

const Settings = {
  async render() {
    Sync.loadConfig();
    const hasSync = Sync.enabled();
    const goal = getGoal();
    const todayDone = getTodayDone();
    const goalPct = Math.min(100, Math.round(todayDone / goal * 100));
    const stats = await db.getStats();
    const allQ = (await db.getCustomQuestions()).length;
    const allNP = (await db.getAllNodeProgress()).length;
    const allQP = (await db.getAllQuestionProgress()).length;
    // Estimate storage
    let dbSize = '0 KB';
    try {
      const est = await navigator.storage?.estimate();
      if (est?.usage) dbSize = (est.usage / 1024).toFixed(0) + ' KB';
    } catch(e) {}

    return `
      <div class="settings-page" style="max-width:700px;margin:0 auto;">
        <h2 style="font-size:20px;margin-bottom:20px;">系统设置</h2>

        <div class="card" style="margin-bottom:16px;">
          <div class="card-header"><span class="card-title">主题切换</span></div>
          <div style="display:flex;gap:12px;">
            <button class="btn btn-secondary" onclick="document.documentElement.setAttribute('data-theme','light');localStorage.setItem('theme','light')" style="flex:1;">亮色</button>
            <button class="btn btn-secondary" onclick="document.documentElement.setAttribute('data-theme','dark');localStorage.setItem('theme','dark')" style="flex:1;">暗色</button>
          </div>
        </div>

        <div class="card" style="margin-bottom:16px;">
          <div class="card-header"><span class="card-title">☁️ 双电脑同步 (Supabase)</span></div>
          ${hasSync ? `
            <p style="color:var(--color-success);font-size:13px;margin-bottom:8px;">✅ 已启用 · 同步码 ${Sync.syncKey}</p>
            <button class="btn btn-primary btn-sm" style="width:100%;margin-bottom:6px;" onclick="window._doSyncNow()">立即同步</button>
            <button class="btn btn-secondary btn-sm" style="width:100%;" onclick="window._disableSync()">停用同步</button>
          ` : `
            <p style="font-size:12px;color:var(--color-text2);margin-bottom:10px;">用 Supabase 免费云数据库同步学习进度，两台电脑输入相同同步码即可共享数据。</p>
            <div style="font-size:12px;margin-bottom:10px;padding:8px;background:var(--color-surface2);border-radius:4px;line-height:1.7;">
              <strong>配置步骤：</strong><br>
              1. 注册 <a href="https://supabase.com" target="_blank" style="color:var(--color-primary);">supabase.com</a>（免费）<br>
              2. 建项目 → SQL Editor 粘贴建表 SQL（见桌面"同步建表SQL.md"）<br>
              3. 复制 Project URL 和 anon public key 填到下面
            </div>
            <input id="sbUrl" placeholder="Supabase URL (https://xxxx.supabase.co)" style="width:100%;padding:8px;border-radius:4px;border:1px solid var(--color-border);font-size:13px;margin-bottom:6px;">
            <input id="sbKey" placeholder="anon public key" style="width:100%;padding:8px;border-radius:4px;border:1px solid var(--color-border);font-size:13px;margin-bottom:6px;">
            <div style="display:flex;gap:6px;margin-bottom:6px;">
              <input id="sbSyncKey" placeholder="同步码（PMP-XXXX-XXXX-XXXX-XXXX）" style="flex:1;padding:8px;border-radius:4px;border:1px solid var(--color-border);font-size:13px;">
              <button class="btn btn-secondary btn-sm" onclick="window._genSyncKey()" style="white-space:nowrap;">生成</button>
            </div>
            <button class="btn btn-primary btn-sm" style="width:100%;" onclick="window._enableSync()">启用云同步</button>
          `}
        </div>

        <div class="card" style="margin-bottom:16px;">
          <div class="card-header"><span class="card-title">每日目标</span></div>
          <div style="display:flex;align-items:center;gap:12px;margin-bottom:10px;">
            <span style="font-size:13px;">每天刷</span>
            <input id="dailyGoal" type="number" min="5" max="500" value="${goal}" onchange="window._setGoal(this.value)"
              style="width:70px;padding:4px 8px;border-radius:4px;border:1px solid var(--color-border);font-size:14px;text-align:center;">
            <span style="font-size:13px;">题</span>
            <span style="flex:1;"></span>
            <span style="font-size:13px;color:var(--color-text2);">今日完成 <strong>${todayDone}</strong>/${goal}</span>
          </div>
          <div class="progress-bar" style="height:8px;border-radius:4px;">
            <div class="progress-fill" style="width:${goalPct}%;background:${goalPct>=100?'var(--color-success)':'var(--color-primary)'};height:8px;border-radius:4px;"></div>
          </div>
        </div>

        <div class="card" style="margin-bottom:16px;">
          <div class="card-header"><span class="card-title">数据库信息</span></div>
          <div style="font-size:13px;color:var(--color-text2);line-height:2;">
            <div style="display:flex;justify-content:space-between;"><span>题库</span><strong>${allQ} 题</strong></div>
            <div style="display:flex;justify-content:space-between;"><span>学习节点</span><strong>${allNP} 个</strong></div>
            <div style="display:flex;justify-content:space-between;"><span>答题记录</span><strong>${allQP} 条</strong></div>
            <div style="display:flex;justify-content:space-between;"><span>总答题次数</span><strong>${stats.totalAttempts} 次</strong></div>
            <div style="display:flex;justify-content:space-between;"><span>存储占用</span><strong>${dbSize}</strong></div>
          </div>
        </div>

        <div class="card" style="margin-bottom:16px;">
          <div class="card-header"><span class="card-title">数据管理</span></div>
          <div style="display:flex;gap:8px;flex-wrap:wrap;">
            <button class="btn btn-secondary btn-sm" onclick="window._doExport()">导出备份</button>
            <button class="btn btn-secondary btn-sm" onclick="window._doImport()">导入备份</button>
          </div>
          <div style="margin-top:10px;padding-top:8px;border-top:1px solid var(--color-border);">
            <button class="btn btn-sm" style="background:var(--color-danger);color:#fff;width:100%;" onclick="window._resetData()">重置所有学习进度</button>
          </div>
        </div>

        <div style="text-align:center;padding:12px;font-size:11px;color:var(--color-text3);">
          PMP 联动学习机 v2.0 · PMBOK 第8版 · 2026新考纲<br>
          <a href="https://github.com/xianglop-0409/pmp-learning" target="_blank" style="color:var(--color-primary);">GitHub</a>
        </div>
      </div>
    `;
  }
};

// ===== 全局函数 =====

window._genSyncKey = () => {
  const input = document.getElementById('sbSyncKey');
  if (input) input.value = Sync.genSyncKey();
};

window._enableSync = async () => {
  const url = (document.getElementById('sbUrl').value || '').trim();
  const key = (document.getElementById('sbKey').value || '').trim();
  let syncKey = (document.getElementById('sbSyncKey').value || '').trim();

  if (!url) return toast('请填入 Supabase URL', 'info');
  if (!key) return toast('请填入 anon public key', 'info');
  if (!syncKey) { syncKey = Sync.genSyncKey(); document.getElementById('sbSyncKey').value = syncKey; }

  const btn = document.querySelector('#sbSyncKey').parentElement.nextElementSibling;
  btn.textContent = '启用中...'; btn.disabled = true;
  try {
    // 保存配置
    localStorage.setItem('pmp_sb_url', url);
    localStorage.setItem('pmp_sb_key', key);
    localStorage.setItem('pmp_sync_key', syncKey);
    Sync.loadConfig();

    // 验证连接：尝试拉取（空表会返回 []，若表不存在会报错）
    const test = await Sync.pull('nodeProgress');
    if (!Array.isArray(test)) {
      throw new Error('连接失败，请检查 URL/key 是否正确，且已执行建表 SQL');
    }

    // 推送本地已有数据到云端
    const np = await db.getAllNodeProgress();
    const qp = await db.getAllQuestionProgress();
    const ex = await db.getExamSessions();
    for (const p of np) await Sync.push('nodeProgress', p.nodeId, p);
    for (const p of qp) await Sync.push('questionProgress', p.questionId, p);
    for (const s of ex) await Sync.push('examSessions', s.id, s);

    toast('云同步已启用！同步码: ' + syncKey, 'success');
    setTimeout(() => location.reload(), 800);
  } catch(e) {
    console.error(e);
    toast('失败: ' + e.message, 'error');
    btn.textContent = '启用云同步'; btn.disabled = false;
  }
};

window._doSyncNow = async () => {
  if (!Sync.loadConfig()) return toast('未配置同步', 'info');
  toast('同步中...', 'info');
  try {
    // 1. 拉取云端合并到本地
    await db._syncFromCloud();
    // 2. 推送本地到云端
    const np = await db.getAllNodeProgress();
    const qp = await db.getAllQuestionProgress();
    const ex = await db.getExamSessions();
    for (const p of np) await Sync.push('nodeProgress', p.nodeId, p);
    for (const p of qp) await Sync.push('questionProgress', p.questionId, p);
    for (const s of ex) await Sync.push('examSessions', s.id, s);

    toast('同步完成', 'success');
    setTimeout(() => location.reload(), 800);
  } catch(e) { toast('失败: '+e.message, 'error'); }
};

window._setGoal = (val) => {
  const v = Math.max(5, Math.min(500, parseInt(val) || 20));
  localStorage.setItem('pmp_daily_goal', v);
  toast('每日目标: ' + v + '题', 'success');
};

window._resetData = async () => {
  if (!confirm('确定要清空所有学习进度和答题记录吗？此操作不可恢复！')) return;
  try {
    await db.db.nodeProgress.clear();
    await db.db.questionProgress.clear();
    await db.db.examSessions.clear();
    toast('已清空所有数据', 'info');
    setTimeout(() => location.reload(), 500);
  } catch(e) { toast('失败: '+e.message, 'error'); }
};

window._disableSync = () => {
  localStorage.removeItem('pmp_sb_url'); localStorage.removeItem('pmp_sb_key'); localStorage.removeItem('pmp_sync_key');
  toast('已停用云同步'); location.reload();
};

window._doExport = async () => {
  const data = { version: 1, exportedAt: new Date().toISOString(), nodeProgress: await db.getAllNodeProgress(), questionProgress: await db.getAllQuestionProgress(), examSessions: await db.getExamSessions() };
  const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
  a.download = 'pmp-backup-' + new Date().toISOString().slice(0,10) + '.json';
  a.click(); toast('已导出', 'success');
};

window._doImport = () => {
  const inp = document.createElement('input'); inp.type = 'file'; inp.accept = '.json';
  inp.onchange = async (e) => {
    try {
      const text = await e.target.files[0].text();
      const data = JSON.parse(text);
      if (data.nodeProgress) for (const p of data.nodeProgress) await db.updateNodeProgress(p.nodeId, p);
      if (data.questionProgress) for (const p of data.questionProgress) await db.updateQuestionProgress(p.questionId, p);
      toast('已导入', 'success'); setTimeout(() => location.reload(), 500);
    } catch(err) { toast('失败: '+err.message, 'error'); }
  };
  inp.click();
};

export default Settings;
