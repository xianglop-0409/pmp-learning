// ===== 学习报告页面 =====

import db from './db.js';
import bus from './event-bus.js';
import { getNodesByType } from './knowledge-graph.js';
import { formatDate, pct, progressColor, loadScript } from './utils.js';

const Analytics = {
  async render() {
    const stats = await db.getStats();
    const streak = await db.getStreak();
    const exams = await db.getExamSessions();
    const sessionStats = bus.getSessionStats();

    return `
      <div style="margin-bottom:24px;">
        <h2 style="font-size:20px;margin-bottom:4px;">📈 学习报告</h2>
        <p style="color:var(--color-text2);font-size:13px;">基于你的答题数据自动生成 · ${formatDate()}</p>
        ${sessionStats.questionsAnswered > 0 ? `<p style="color:var(--color-primary);font-size:12px;margin-top:4px;">⚡ 本次会话已答 ${sessionStats.questionsAnswered} 题 · 正确率 ${sessionStats.correctRate}%</p>` : ''}
      </div>

      <!-- 概览 -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-value">${stats.overallCorrectRate}%</div>
          <div class="stat-label">总体正确率</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${stats.totalAttempts}</div>
          <div class="stat-label">总答题次数</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${streak}</div>
          <div class="stat-label">🔥 连续学习天数</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${exams.length}</div>
          <div class="stat-label">模拟考试次数</div>
        </div>
      </div>

      <!-- 考试历史 -->
      ${exams.length > 0 ? `
        <div class="card" style="margin-bottom:20px;">
          <div class="card-header">
            <span class="card-title">📋 考试记录</span>
          </div>
          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>日期</th><th>分数</th><th>正确率</th><th>用时</th><th>详情</th>
                </tr>
              </thead>
              <tbody>
                ${exams.slice(0, 10).map(e => `
                  <tr>
                    <td>${formatDate(e.startedAt)}</td>
                    <td>${e.score}/${e.total}</td>
                    <td>
                      <span style="color:${progressColor(pct(e.score, e.total))};font-weight:600;">${pct(e.score, e.total)}%</span>
                    </td>
                    <td>${e.timeUsed || '—'}分钟</td>
                    <td>
                      <button class="btn btn-sm btn-secondary" onclick="window._nav('/exam')">查看</button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      ` : ''}

      <!-- 图表区 -->
      <div class="chart-grid">
        <div class="chart-card" id="chartTrendCard">
          <h4 style="margin-bottom:12px;">📊 正确率趋势</h4>
          <canvas id="trendChart" height="250"></canvas>
        </div>
        <div class="chart-card" id="chartRadarCard">
          <h4 style="margin-bottom:12px;">🕸️ 7大域正确率</h4>
          <canvas id="radarChart" height="250"></canvas>
        </div>
      </div>
    `;
  },

  async mount() {
    // 按需加载 Chart.js
    if (typeof Chart === 'undefined') {
      try {
        await loadScript('./js/vendor/chart.umd.min.js');
      } catch (e) {
        try {
          await loadScript('https://unpkg.com/chart.js@4/dist/chart.umd.min.js');
        } catch (e2) {
          await loadScript('https://cdn.jsdelivr.net/npm/chart.js@4/dist/chart.umd.min.js');
        }
      }
    }
    await this._renderCharts();
  },

  async _renderCharts() {
    if (typeof Chart === 'undefined') {
      console.warn('Chart.js not loaded, skipping charts');
      return;
    }

    // ---- 趋势图 ----
    const allProgress = await db.getAllQuestionProgress();
    const trendCtx = document.getElementById('trendChart');
    if (trendCtx) {
      // 按日期聚合正确率
      const dateMap = {};
      allProgress.forEach(p => {
        if (p.lastAttempt) {
          const date = p.lastAttempt.slice(0, 10);
          if (!dateMap[date]) dateMap[date] = { correct: 0, total: 0 };
          dateMap[date].correct += (p.correct || 0);
          dateMap[date].total += (p.attempts || 0);
        }
      });

      const sorted = Object.entries(dateMap).sort((a, b) => a[0].localeCompare(b[0]));
      const labels = sorted.map(([d]) => d.slice(5)); // MM-DD
      const data = sorted.map(([, v]) => v.total > 0 ? Math.round((v.correct / v.total) * 100) : 0);

      new Chart(trendCtx, {
        type: 'line',
        data: {
          labels: labels.length > 0 ? labels : ['暂无数据'],
          datasets: [{
            label: '正确率',
            data: data.length > 0 ? data : [0],
            borderColor: '#6366f1',
            backgroundColor: 'rgba(99,102,241,0.1)',
            fill: true,
            tension: 0.4,
            pointRadius: 4,
            pointBackgroundColor: '#6366f1',
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: { min: 0, max: 100, ticks: { callback: v => v + '%' } },
          },
          plugins: {
            legend: { display: false },
          },
        },
      });
    }

    // ---- 雷达图 ----
    const radarCtx = document.getElementById('radarChart');
    if (radarCtx) {
      const domainMap = { governance: '治理', scope: '范围', schedule: '进度', finance: '财务', stakeholder: '利益相关方', resource: '资源', risk: '风险' };
      const domainData = {};
      allProgress.forEach(p => {
        if (p.domain && domainMap[p.domain]) {
          if (!domainData[p.domain]) domainData[p.domain] = { correct: 0, total: 0 };
          domainData[p.domain].correct += (p.correct || 0);
          domainData[p.domain].total += (p.attempts || 0);
        }
      });

      const radarLabels = Object.keys(domainMap).map(k => domainMap[k]);
      const radarData = Object.keys(domainMap).map(k => {
        const d = domainData[k];
        return d && d.total >= 3 ? Math.round((d.correct / d.total) * 100) : 0;
      });

      new Chart(radarCtx, {
        type: 'radar',
        data: {
          labels: radarLabels,
          datasets: [{
            label: '正确率 (%)',
            data: radarData,
            backgroundColor: 'rgba(99,102,241,0.2)',
            borderColor: '#6366f1',
            borderWidth: 2,
            pointBackgroundColor: '#6366f1',
            pointRadius: 5,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            r: {
              min: 0,
              max: 100,
              ticks: { stepSize: 20, display: false },
            },
          },
          plugins: {
            legend: { display: false },
          },
        },
      });
    }
  },
};

export default Analytics;
