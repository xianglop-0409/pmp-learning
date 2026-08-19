// ===== Supabase 云同步层 =====
// 用原生 fetch 调 Supabase REST API，不引入 supabase-js（避免 CDN 依赖）
// 数据模型：一张通用表 sync_records 存所有同步数据
// 表结构：sync_key | collection | row_key | data(jsonb) | updated_at
// 同步策略：last-write-wins，按 updated_at 合并

const Sync = {
  url: '',
  apiKey: '',
  syncKey: '',

  /** 读取本地保存的配置，返回是否已启用 */
  loadConfig() {
    this.url = (localStorage.getItem('pmp_sb_url') || '').replace(/\/+$/, '');
    this.apiKey = localStorage.getItem('pmp_sb_key') || '';
    this.syncKey = localStorage.getItem('pmp_sync_key') || '';
    return this.enabled();
  },

  /** 是否已启用同步 */
  enabled() {
    return !!(this.url && this.apiKey && this.syncKey);
  },

  /** 生成随机同步码，格式 PMP-XXXX-XXXX-XXXX-XXXX */
  genSyncKey() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let segs = [];
    for (let i = 0; i < 4; i++) {
      let seg = '';
      for (let j = 0; j < 4; j++) seg += chars[Math.floor(Math.random() * chars.length)];
      segs.push(seg);
    }
    return 'PMP-' + segs.join('-');
  },

  /** 通用请求头 */
  _headers() {
    return {
      'apikey': this.apiKey,
      'Authorization': 'Bearer ' + this.apiKey,
      'Content-Type': 'application/json',
      'Prefer': 'resolution=merge-duplicates',
    };
  },

  /**
   * 推送单条记录到云端（upsert）
   * @param {string} collection nodeProgress | questionProgress | examSessions
   * @param {string} rowKey nodeId / questionId / examId
   * @param {object} data 完整记录
   */
  async push(collection, rowKey, data) {
    if (!this.enabled()) return false;
    try {
      const resp = await fetch(
        `${this.url}/rest/v1/sync_records?on_conflict=sync_key,collection,row_key`,
        {
          method: 'POST',
          headers: this._headers(),
          body: JSON.stringify({
            sync_key: this.syncKey,
            collection,
            row_key: rowKey,
            data,
            updated_at: new Date().toISOString(),
          }),
        }
      );
      if (!resp.ok) {
        console.warn('[Sync] push failed:', resp.status);
        return false;
      }
      return true;
    } catch (e) {
      console.warn('[Sync] push error:', e.message);
      return false;
    }
  },

  /** 拉取某个集合的全部记录，返回 [{row_key, data, updated_at}] */
  async pull(collection) {
    if (!this.enabled()) return [];
    try {
      const url = `${this.url}/rest/v1/sync_records` +
        `?sync_key=eq.${encodeURIComponent(this.syncKey)}` +
        `&collection=eq.${encodeURIComponent(collection)}` +
        `&select=row_key,data,updated_at`;
      const resp = await fetch(url, {
        headers: { 'apikey': this.apiKey, 'Authorization': 'Bearer ' + this.apiKey },
      });
      if (!resp.ok) {
        console.warn('[Sync] pull failed:', resp.status);
        return [];
      }
      return await resp.json();
    } catch (e) {
      console.warn('[Sync] pull error:', e.message);
      return [];
    }
  },

  /** 拉取全部三个集合 */
  async pullAll() {
    const collections = ['nodeProgress', 'questionProgress', 'examSessions'];
    const result = {};
    for (const c of collections) {
      result[c] = await this.pull(c);
    }
    return result;
  },
};

export default Sync;
