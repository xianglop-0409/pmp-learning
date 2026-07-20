// ===== IndexedDB 数据层 (Dexie.js) =====

const DB_NAME = 'pmp_learning_db';
const DB_VERSION = 4;

class Database {
  constructor() {
    this.db = null;
    this.ready = false;
  }

  async init() {
    // Dexie 由 app.js 预加载，直接使用
    this.db = new Dexie(DB_NAME);

    this.db.version(DB_VERSION).stores({
      // 用户学习进度（以知识节点ID为key）
      nodeProgress: 'nodeId, domain, correctRate, lastAttempt, studied',
      // 答题记录（以题目ID为key）
      questionProgress: 'questionId, nodeIds, domain, correctRate, lastAttempt, isStarred',
      // 考试记录
      examSessions: 'id, startedAt, score',
      // 用户设置
      settings: 'key',
      // 自定义题目
      customQuestions: 'id, domain, focusArea, difficulty, createdAt',
    });

    // 初始化默认设置（亮色主题）
    const theme = await this.getSetting('theme');
    if (!theme || theme === 'dark') {
      await this.db.settings.put({ key: 'theme', value: 'light' });
    }

    // 首次运行加载预设题目
    const presetsLoaded = await this.getSetting('preset_questions_loaded');
    if (!presetsLoaded) {
      console.log('Loading preset questions...');
      await this._loadPresets();
      await this.setSetting('preset_questions_loaded', '1');
    }

    // 导入外部题库（清洗后2800题）
    const bankLoaded = await this.getSetting('bank_v5_clean');
    if (!bankLoaded) {
      console.log('Importing cleaned question bank (2800 questions)...');
      try {
        const resp = await fetch('./data/all-bank.json');
        if (resp.ok) {
          const bank = await resp.json();
          await this.db.customQuestions.bulkPut(bank);
          await this.setSetting('bank_v5_clean', '1');
          console.log('✅ Imported ' + bank.length + ' questions');
        }
      } catch (e) {
        console.warn('Bank import failed:', e.message);
      }
    }

    this.ready = true;
    console.log('Database ready');
    return this;
  }

  // ===== 节点进度 =====
  async getNodeProgress(nodeId) {
    return this.db.nodeProgress.get(nodeId) || null;
  }

  async getAllNodeProgress() {
    return this.db.nodeProgress.toArray();
  }

  async updateNodeProgress(nodeId, data) {
    const existing = await this.db.nodeProgress.get(nodeId);
    if (existing) {
      return this.db.nodeProgress.update(nodeId, {
        ...data,
        updatedAt: new Date().toISOString(),
      });
    } else {
      return this.db.nodeProgress.put({
        nodeId,
        ...data,
        updatedAt: new Date().toISOString(),
      });
    }
  }

  // ===== 答题记录 =====
  async getQuestionProgress(questionId) {
    return this.db.questionProgress.get(questionId) || null;
  }

  async getAllQuestionProgress() {
    return this.db.questionProgress.toArray();
  }

  async updateQuestionProgress(questionId, data) {
    const existing = await this.db.questionProgress.get(questionId);
    if (existing) {
      return this.db.questionProgress.update(questionId, {
        ...data,
        updatedAt: new Date().toISOString(),
      });
    } else {
      return this.db.questionProgress.put({
        questionId,
        ...data,
        updatedAt: new Date().toISOString(),
      });
    }
  }

  async getStarredQuestions() {
    return this.db.questionProgress
      .where('isStarred')
      .equals(1)
      .toArray();
  }

  async getQuestionProgressByDomain(domain) {
    return this.db.questionProgress
      .where('domain')
      .equals(domain)
      .toArray();
  }

  // ===== 考试记录 =====
  async saveExamSession(session) {
    return this.db.examSessions.put(session);
  }

  async getExamSessions() {
    return this.db.examSessions
      .orderBy('startedAt')
      .reverse()
      .toArray();
  }

  // ===== 设置 =====
  async getSetting(key) {
    const s = await this.db.settings.get(key);
    return s ? s.value : null;
  }

  async setSetting(key, value) {
    return this.db.settings.put({ key, value });
  }

  // ===== 自定义题目 =====
  async addCustomQuestion(q) {
    return this.db.customQuestions.put(q);
  }

  async getCustomQuestions() {
    return this.db.customQuestions.toArray();
  }

  async deleteCustomQuestion(id) {
    return this.db.customQuestions.delete(id);
  }

  // ===== 预设题目 =====
  async _loadPresets() {
    const presets = [
      { id:'preset-001',type:'scenario',scenario:{zh:'你正在管理一个软件开发项目。项目执行到一半时，一位关键干系人提出了一个重大功能变更请求。这个变更会影响项目的进度和预算。'},question:{zh:'作为项目经理，你应该首先做什么？'},options:[{label:'A',text:{zh:'立即实施变更以满足干系人需求'}},{label:'B',text:{zh:'评估变更对项目的影响'}},{label:'C',text:{zh:'拒绝变更，因为会影响进度和预算'}},{label:'D',text:{zh:'直接提交给变更控制委员会(CCB)'}}],correctAnswer:'B',explanation:{zh:'根据PMBOK第8版变更控制流程，第一步永远是评估变更影响。变更控制流程：识别变更→评估影响→提交变更请求→CCB审批→实施→更新计划。'},knowledgeNodeIds:['proc-evaluate-change'],difficulty:2,domain:'governance',focusArea:'monitoring',tags:['变更控制','流程'],createdAt:new Date().toISOString()},
      { id:'preset-002',type:'scenario',scenario:{zh:'一个大型基础设施项目正在启动阶段。发起人要求你准备一份正式文件，授权你作为项目经理动用组织资源。'},question:{zh:'这份文件是什么？'},options:[{label:'A',text:{zh:'项目管理计划'}},{label:'B',text:{zh:'项目章程'}},{label:'C',text:{zh:'项目范围说明书'}},{label:'D',text:{zh:'商业论证'}}],correctAnswer:'B',explanation:{zh:'项目章程(Project Charter)是由发起人签发的文件，正式授权项目的存在，并授予项目经理动用组织资源的权力。'},knowledgeNodeIds:['proc-start-project'],difficulty:1,domain:'governance',focusArea:'initiating',tags:['章程','启动'],createdAt:new Date().toISOString()},
      { id:'preset-003',type:'scenario',scenario:{zh:'在项目执行过程中，你发现项目进度偏差SV为负值，成本绩效指数CPI小于1。'},question:{zh:'这说明了什么？'},options:[{label:'A',text:{zh:'进度超前且成本节约'}},{label:'B',text:{zh:'进度滞后且成本超支'}},{label:'C',text:{zh:'进度超前但成本超支'}},{label:'D',text:{zh:'进度滞后但成本节约'}}],correctAnswer:'B',explanation:{zh:'SV=EV-PV，负值表示挣得价值小于计划价值→进度滞后。CPI=EV/AC，小于1表示每花1元钱挣回的价值不到1元→成本超支。'},knowledgeNodeIds:['proc-monitor-performance'],difficulty:2,domain:'governance',focusArea:'monitoring',tags:['EVM','挣值','公式'],createdAt:new Date().toISOString()},
      { id:'preset-004',type:'scenario',scenario:{zh:'你被任命为一个跨部门项目的项目经理。项目涉及5个部门，共12个主要干系人。在一次项目会议上，两名部门负责人对项目优先级产生了激烈冲突。'},question:{zh:'你应该如何处理？'},options:[{label:'A',text:{zh:'分别找两人谈话，了解各自的立场和关切'}},{label:'B',text:{zh:'将问题上报给项目发起人'}},{label:'C',text:{zh:'投票决定谁的意见正确'}},{label:'D',text:{zh:'忽略冲突，继续按原计划推进'}}],correctAnswer:'A',explanation:{zh:'冲突解决的5种方式中，合作/解决问题(Collaborate)是最佳方式——通过面对面沟通深入了解各方关切，找到Win-Win方案。'},knowledgeNodeIds:['proc-manage-stakeholder-engagement','proc-lead-team'],difficulty:2,domain:'stakeholder',focusArea:'executing',tags:['冲突解决','干系人'],createdAt:new Date().toISOString()},
      { id:'preset-005',type:'scenario',scenario:{zh:'项目有10个关键干系人。你正在制定沟通管理计划。'},question:{zh:'这个项目有多少条沟通渠道？'},options:[{label:'A',text:{zh:'10'}},{label:'B',text:{zh:'20'}},{label:'C',text:{zh:'45'}},{label:'D',text:{zh:'100'}}],correctAnswer:'C',explanation:{zh:'沟通渠道数=n(n-1)/2，其中n为干系人数量。n=10时，10×9÷2=45条。'},knowledgeNodeIds:['proc-plan-communications'],difficulty:2,domain:'stakeholder',focusArea:'planning',tags:['沟通','公式'],createdAt:new Date().toISOString()},
      { id:'preset-006',type:'scenario',scenario:{zh:'在一个建筑项目中，你识别出供应商可能延迟交付关键建材的风险。你决定从多家供应商处采购，分散单一供应商的风险。'},question:{zh:'这属于哪种风险应对策略？'},options:[{label:'A',text:{zh:'规避(Avoid)'}},{label:'B',text:{zh:'转移(Transfer)'}},{label:'C',text:{zh:'减轻(Mitigate)'}},{label:'D',text:{zh:'接受(Accept)'}}],correctAnswer:'C',explanation:{zh:'减轻(Mitigate)策略旨在降低风险发生的概率或减少风险发生后的影响。从多家供应商采购降低了单一供应商延迟的概率。威胁5策略：上报/规避/转移/减轻/接受。机会5策略：上报/利用/分享/增强/接受。'},knowledgeNodeIds:['proc-plan-risk-responses'],difficulty:2,domain:'risk',focusArea:'planning',tags:['风险应对','策略'],createdAt:new Date().toISOString()},
      { id:'preset-007',type:'scenario',scenario:{zh:'团队正在对一个新产品的风险进行优先级排序。项目经理使用概率影响矩阵将风险分为高、中、低三个等级。'},question:{zh:'这个过程属于什么？'},options:[{label:'A',text:{zh:'识别风险'}},{label:'B',text:{zh:'实施定性风险分析'}},{label:'C',text:{zh:'实施定量风险分析'}},{label:'D',text:{zh:'规划风险应对'}}],correctAnswer:'B',explanation:{zh:'定性风险分析使用概率影响矩阵对风险进行排序和优先级划分——它是主观的、快速的排序工具。定量分析使用蒙特卡洛模拟、决策树等数值方法。'},knowledgeNodeIds:['proc-perform-risk-analysis'],difficulty:2,domain:'risk',focusArea:'planning',tags:['风险分析','定性','定量'],createdAt:new Date().toISOString()},
      { id:'preset-008',type:'scenario',scenario:{zh:'一个新的项目团队刚组建完成。团队成员来自不同的部门，彼此不熟悉，对项目目标的理解也不一致。'},question:{zh:'根据Tuckman模型，团队目前处于哪个阶段？'},options:[{label:'A',text:{zh:'规范阶段(Norming)'}},{label:'B',text:{zh:'形成阶段(Forming)'}},{label:'C',text:{zh:'震荡阶段(Storming)'}},{label:'D',text:{zh:'成熟阶段(Performing)'}}],correctAnswer:'B',explanation:{zh:'Tuckman团队发展阶段模型顺序：Forming(形成)→Storming(震荡)→Norming(规范)→Performing(成熟)→Adjourning(解散)。刚组建的团队处于形成阶段。'},knowledgeNodeIds:['proc-lead-team'],difficulty:2,domain:'resource',focusArea:'executing',tags:['Tuckman','团队发展'],createdAt:new Date().toISOString()},
      { id:'preset-009',type:'scenario',scenario:{zh:'你在管理一个产品开发项目。客户频繁要求增加新功能，这些功能都不在原定的项目范围说明书内。'},question:{zh:'这属于什么现象？正确的做法是什么？'},options:[{label:'A',text:{zh:'范围蔓延，应通过变更控制流程管理'}},{label:'B',text:{zh:'镀金，应立即停止额外工作'}},{label:'C',text:{zh:'范围蔓延，应直接拒绝所有额外请求'}},{label:'D',text:{zh:'敏捷迭代，应欢迎所有变更请求'}}],correctAnswer:'A',explanation:{zh:'范围蔓延(Scope Creep)是指未经控制的范围变更。镀金(Gold Plating)是团队主动添加额外功能。正确做法：走变更控制流程，评估影响后再决定。'},knowledgeNodeIds:['proc-monitor-scope','proc-evaluate-change'],difficulty:2,domain:'scope',focusArea:'monitoring',tags:['范围蔓延','变更控制'],createdAt:new Date().toISOString()},
      { id:'preset-010',type:'scenario',scenario:{zh:'你刚刚完成了项目的WBS（工作分解结构）。'},question:{zh:'WBS的最底层组件是？'},options:[{label:'A',text:{zh:'活动(Activity)'}},{label:'B',text:{zh:'工作包(Work Package)'}},{label:'C',text:{zh:'可交付物(Deliverable)'}},{label:'D',text:{zh:'任务(Task)'}}],correctAnswer:'B',explanation:{zh:'WBS的最底层是工作包，它是进行成本估算、资源分配和进度安排的最小单位。WBS遵循100%原则。'},knowledgeNodeIds:['proc-develop-scope-structure'],difficulty:1,domain:'scope',focusArea:'planning',tags:['WBS','范围'],createdAt:new Date().toISOString()},
      { id:'preset-011',type:'scenario',scenario:{zh:'项目进度落后了2周，发起人要求你压缩进度，但明确表示不能增加额外预算。'},question:{zh:'你应该采用什么方法？'},options:[{label:'A',text:{zh:'赶工——增加资源加班赶进度'}},{label:'B',text:{zh:'快速跟进——将原本串行的活动并行执行'}},{label:'C',text:{zh:'削减范围'}},{label:'D',text:{zh:'如实告诉发起人无法压缩'}}],correctAnswer:'B',explanation:{zh:'赶工=增加资源+成本。快速跟进=串行改并行+风险增加。不能增加预算→赶工不可行→快速跟进是最佳选择。只对关键路径上的活动压缩才有效。'},knowledgeNodeIds:['proc-develop-schedule'],difficulty:2,domain:'schedule',focusArea:'planning',tags:['进度压缩','关键路径'],createdAt:new Date().toISOString()},
      { id:'preset-012',type:'scenario',scenario:{zh:'项目总预算BAC为100万，已完成40%(EV=40万)，实际花费AC=45万，计划完成50%(PV=50万)。'},question:{zh:'CPI和SPI分别是多少？'},options:[{label:'A',text:{zh:'CPI=0.89, SPI=0.8，成本超支且进度滞后'}},{label:'B',text:{zh:'CPI=1.13, SPI=1.25，好于计划'}},{label:'C',text:{zh:'CPI=0.89, SPI=1.25，成本超支但进度超前'}},{label:'D',text:{zh:'CPI=1.13, SPI=0.8，成本节约但进度滞后'}}],correctAnswer:'A',explanation:{zh:'CPI=EV/AC=40/45=0.89(<1→成本超支)，SPI=EV/PV=40/50=0.8(<1→进度滞后)。TCPI=(100-40)/(100-45)=60/55=1.09。'},knowledgeNodeIds:['proc-monitor-finance','proc-monitor-performance'],difficulty:3,domain:'finance',focusArea:'monitoring',tags:['EVM','计算'],createdAt:new Date().toISOString()},
      { id:'preset-013',type:'scenario',scenario:{zh:'一个项目的需求极不明确，客户希望在开发过程中看到可工作的产品并不断反馈。团队在2周的迭代中交付增量。'},question:{zh:'团队使用的是哪种项目生命周期？'},options:[{label:'A',text:{zh:'预测型'}},{label:'B',text:{zh:'迭代型'}},{label:'C',text:{zh:'增量型'}},{label:'D',text:{zh:'敏捷型——迭代+增量'}}],correctAnswer:'D',explanation:{zh:'敏捷型=迭代（通过回顾改进过程）+增量（每次迭代交付可用产品）。迭代型关注学习改进但不一定交付可用产品；增量型关注频繁交付但不一定有过程改进。'},knowledgeNodeIds:['agile-lifecycle','agile-scrum'],difficulty:2,domain:'agile',focusArea:null,tags:['敏捷','生命周期'],createdAt:new Date().toISOString()},
      { id:'preset-014',type:'scenario',scenario:{zh:'一个硬件开发项目，硬件部分需求明确且稳定，但嵌入式软件部分需求不确定。硬件用预测型，软件用敏捷。'},question:{zh:'这属于什么方法？'},options:[{label:'A',text:{zh:'纯预测型'}},{label:'B',text:{zh:'纯敏捷型'}},{label:'C',text:{zh:'混合型(Hybrid)'}},{label:'D',text:{zh:'Scrum'}}],correctAnswer:'C',explanation:{zh:'混合型在同一项目中结合了预测型和敏捷型方法——不同项目组件的需求确定性不同。PMP考试越来越喜欢考混合场景。'},knowledgeNodeIds:['agile-hybrid','agile-lifecycle'],difficulty:2,domain:'agile',focusArea:null,tags:['混合','敏捷'],createdAt:new Date().toISOString()},
      { id:'preset-015',type:'scenario',scenario:{zh:'在一个Scrum团队中，Sprint已经开始第3天了。产品负责人在待办事项列表中增加了一个新功能，要求团队立即纳入当前Sprint。'},question:{zh:'Scrum Master应该怎么做？'},options:[{label:'A',text:{zh:'接受变更，立即调整Sprint'}},{label:'B',text:{zh:'将新功能加入下一个Sprint'}},{label:'C',text:{zh:'由团队投票决定'}},{label:'D',text:{zh:'延长当前Sprint'}}],correctAnswer:'B',explanation:{zh:'Scrum核心规则：Sprint一旦开始，Sprint Backlog不应更改（保护团队免受干扰）。新优先级反映在Product Backlog中，在下一次Sprint Planning时决定。不是不响应变更，而是在合适的节奏点响应。'},knowledgeNodeIds:['agile-scrum','proc-evaluate-change'],difficulty:2,domain:'agile',focusArea:null,tags:['Scrum','Sprint'],createdAt:new Date().toISOString()},
    ];
    for (const q of presets) {
      await this.db.customQuestions.put(q);
    }
    console.log(`✅ ${presets.length} preset questions loaded`);
  }

  // ===== 统计数据 =====
  async getStats() {
    const allProgress = await this.getAllQuestionProgress();
    const total = allProgress.length;
    const totalAttempts = allProgress.reduce((s, p) => s + (p.attempts || 0), 0);
    const totalCorrect = allProgress.reduce((s, p) => s + (p.correct || 0), 0);
    const totalWrong = allProgress.reduce((s, p) => s + (p.wrongCount || 0), 0);

    return {
      totalQuestions: total,
      totalAttempts,
      totalCorrect,
      totalWrong,
      overallCorrectRate: totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0,
    };
  }

  /** 获取学习统计（已浏览/已学习节点数） */
  async getStudyStats() {
    const allProgress = await this.db.nodeProgress.toArray();
    const viewed = allProgress.filter(p => p.viewCount > 0).length;
    const studied = allProgress.filter(p => p.studied).length;
    const totalAttempts = allProgress.reduce((s, p) => s + (p.attempts || 0), 0);
    const totalCorrect = allProgress.reduce((s, p) => s + (p.correct || 0), 0);
    return { viewed, studied, totalAttempts, totalCorrect };
  }

  /** 获取连续学习天数 */
  async getStreak() {
    const allProgress = await this.getAllQuestionProgress();
    const dates = new Set();
    allProgress.forEach(p => {
      if (p.lastAttempt) {
        dates.add(p.lastAttempt.slice(0, 10)); // YYYY-MM-DD
      }
    });

    const sorted = [...dates].sort().reverse();
    if (sorted.length === 0) return 0;

    let streak = 0;
    const today = new Date();
    for (let i = 0; i < sorted.length; i++) {
      const d = new Date(sorted[i]);
      const expected = new Date(today);
      expected.setDate(expected.getDate() - i);
      if (d.toISOString().slice(0, 10) === expected.toISOString().slice(0, 10)) {
        streak++;
      } else if (i === 0) {
        // 今天还没学，从昨天开始算
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        if (d.toISOString().slice(0, 10) === yesterday.toISOString().slice(0, 10)) {
          streak++;
          continue;
        }
        break;
      } else {
        break;
      }
    }
    return streak;
  }
}

// 全局单例
const db = new Database();
export default db;
