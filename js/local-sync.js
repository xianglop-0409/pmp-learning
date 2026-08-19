// ===== 本地文件同步模块 =====
// 数据导出到JSON文件，放网盘同步文件夹，两台电脑自动同步
import db from './db.js';
import { toast } from './utils.js';

const SYNC_FILE = 'pmp_data.json'; // 默认保存到当前目录

const LocalSync = {
  /** 将所有本地数据导出为JSON并下载 */
  async exportToFile() {
    const nodeProgress = await db.getAllNodeProgress();
    const questionProgress = await db.getAllQuestionProgress();
    const examSessions = await db.getExamSessions();
    const data = {
      version: 1,
      exportedAt: new Date().toISOString(),
      stats: {
        nodeCount: nodeProgress.length,
        questionCount: questionProgress.length,
        examCount: examSessions.length
      },
      nodeProgress,
      questionProgress,
      examSessions
    };
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pmp_backup_${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    return data;
  },

  /** 从JSON文件导入数据到本地 */
  async importFromFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = JSON.parse(e.target.result);
          if (!data.version) throw new Error('无效的备份文件');

          // 导入节点进度
          if (data.nodeProgress?.length) {
            for (const p of data.nodeProgress) {
              const existing = await db.getNodeProgress(p.nodeId);
              if (!existing || new Date(p.updatedAt || 0) > new Date(existing.updatedAt || 0)) {
                await db.updateNodeProgress(p.nodeId, p);
              }
            }
          }
          // 导入答题记录
          if (data.questionProgress?.length) {
            for (const p of data.questionProgress) {
              const existing = await db.getQuestionProgress(p.questionId);
              if (!existing || (p.attempts || 0) >= (existing.attempts || 0)) {
                await db.updateQuestionProgress(p.questionId, p);
              }
            }
          }
          // 导入考试记录
          if (data.examSessions?.length) {
            for (const s of data.examSessions) {
              await db.saveExamSession(s);
            }
          }
          resolve(data.stats);
        } catch(err) { reject(err); }
      };
      reader.onerror = () => reject(new Error('文件读取失败'));
      reader.readAsText(file);
    });
  }
};

// 全局函数
window._exportData = async () => {
  try {
    const data = await LocalSync.exportToFile();
    toast(`已导出! 节点${data.stats.nodeCount} 题目${data.stats.questionCount} 考试${data.stats.examCount}`, 'success');
  } catch(e) { toast('导出失败: '+e.message, 'error'); }
};

window._importData = () => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = async (e) => {
    try {
      const stats = await LocalSync.importFromFile(e.target.files[0]);
      toast(`已导入! 节点${stats.nodeCount} 题目${stats.questionCount} 考试${stats.examCount}`, 'success');
      setTimeout(() => location.reload(), 800);
    } catch(err) { toast('导入失败: '+err.message, 'error'); }
  };
  input.click();
};

export default LocalSync;
