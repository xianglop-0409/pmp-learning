// ===== 题库管理页面 =====

import db from './db.js';
import { getHierarchy, getNodeById } from './knowledge-graph.js';
import { uid, toast, escapeHtml, showModal, confirm } from './utils.js';
import router from './router.js';

// ===== 预设题目数据（30道高频考点题目） =====
const PRESET_QUESTIONS = [
  // ----- 治理域 -----
  {
    id: 'preset-001',
    type: 'scenario',
    scenario: { zh: '你正在管理一个软件开发项目。项目执行到一半时，一位关键干系人提出了一个重大功能变更请求。这个变更会影响项目的进度和预算。' },
    question: { zh: '作为项目经理，你应该首先做什么？' },
    options: [
      { label: 'A', text: { zh: '立即实施变更以满足干系人需求' } },
      { label: 'B', text: { zh: '评估变更对项目的影响' } },
      { label: 'C', text: { zh: '拒绝变更，因为会影响进度和预算' } },
      { label: 'D', text: { zh: '直接提交给变更控制委员会(CCB)' } },
    ],
    correctAnswer: 'B',
    explanation: { zh: '根据PMBOK第8版变更控制流程，第一步永远是评估变更影响。只有充分了解变更的范围、进度、成本和质量影响后，才能做出明智的决策。变更控制流程：识别变更→评估影响→提交变更请求→CCB审批→实施→更新计划。' },
    knowledgeNodeIds: ['proc-evaluate-change'],
    difficulty: 2, domain: 'governance', focusArea: 'monitoring',
    tags: ['变更控制', '流程'],
  },
  {
    id: 'preset-002',
    type: 'scenario',
    scenario: { zh: '一个大型基础设施项目正在启动阶段。发起人要求你准备一份正式文件，授权你作为项目经理动用组织资源。' },
    question: { zh: '这份文件是什么？' },
    options: [
      { label: 'A', text: { zh: '项目管理计划' } },
      { label: 'B', text: { zh: '项目章程' } },
      { label: 'C', text: { zh: '项目范围说明书' } },
      { label: 'D', text: { zh: '商业论证' } },
    ],
    correctAnswer: 'B',
    explanation: { zh: '项目章程(Project Charter)是由发起人签发的文件，正式授权项目的存在，并授予项目经理动用组织资源的权力。它与项目管理计划的区别在于：章程是授权文件（谁说了算），管理计划是执行文件（怎么干）。项目章程应在启动阶段就完成。' },
    knowledgeNodeIds: ['proc-start-project'],
    difficulty: 1, domain: 'governance', focusArea: 'initiating',
    tags: ['章程', '启动'],
  },
  {
    id: 'preset-003',
    type: 'scenario',
    scenario: { zh: '在项目执行过程中，你发现项目进度偏差SV为负值，成本绩效指数CPI小于1。' },
    question: { zh: '这说明了什么？' },
    options: [
      { label: 'A', text: { zh: '进度超前且成本节约' } },
      { label: 'B', text: { zh: '进度滞后且成本超支' } },
      { label: 'C', text: { zh: '进度超前但成本超支' } },
      { label: 'D', text: { zh: '进度滞后但成本节约' } },
    ],
    correctAnswer: 'B',
    explanation: { zh: 'SV（进度偏差）= EV - PV，负值表示挣得价值小于计划价值→进度滞后。CPI（成本绩效指数）= EV / AC，小于1表示每花1元钱挣回的价值不到1元→成本超支。核心记忆口诀：正=好（SV>0超前，CV>0节约），大于1=好（SPI>1超前，CPI>1节约）。' },
    knowledgeNodeIds: ['proc-monitor-performance'],
    difficulty: 2, domain: 'governance', focusArea: 'monitoring',
    tags: ['EVM', '挣值', '公式'],
  },
  // ----- 干系人域 -----
  {
    id: 'preset-004',
    type: 'scenario',
    scenario: { zh: '你被任命为一个跨部门项目的项目经理。项目涉及5个部门，共12个主要干系人。在一次项目会议上，两名部门负责人对项目优先级产生了激烈冲突。' },
    question: { zh: '你应该如何处理？' },
    options: [
      { label: 'A', text: { zh: '分别找两人谈话，了解各自的立场和关切' } },
      { label: 'B', text: { zh: '将问题上报给项目发起人' } },
      { label: 'C', text: { zh: '投票决定谁的意见正确' } },
      { label: 'D', text: { zh: '忽略冲突，继续按原计划推进' } },
    ],
    correctAnswer: 'A',
    explanation: { zh: '冲突解决的5种方式中，合作/解决问题(Collaborate/Problem Solve)是最佳方式——通过面对面沟通深入了解各方关切，找到Win-Win方案。按照优先级顺序：合作>妥协>缓和>强制>回避。直接上报发起人应在尝试解决无果后才使用。' },
    knowledgeNodeIds: ['proc-manage-stakeholder-engagement', 'proc-lead-team'],
    difficulty: 2, domain: 'stakeholder', focusArea: 'executing',
    tags: ['冲突解决', '干系人'],
  },
  {
    id: 'preset-005',
    type: 'scenario',
    scenario: { zh: '项目有10个关键干系人。你正在制定沟通管理计划。' },
    question: { zh: '这个项目有多少条沟通渠道？' },
    options: [
      { label: 'A', text: { zh: '10' } },
      { label: 'B', text: { zh: '20' } },
      { label: 'C', text: { zh: '45' } },
      { label: 'D', text: { zh: '100' } },
    ],
    correctAnswer: 'C',
    explanation: { zh: '沟通渠道数 = n(n-1)/2，其中n为干系人数量。n=10时，10×9÷2=45条。这是PMP计算题中的高频考点。如果新增1个干系人，沟通渠道从45条增加到11×10÷2=55条，增加了10条。' },
    knowledgeNodeIds: ['proc-plan-communications'],
    difficulty: 2, domain: 'stakeholder', focusArea: 'planning',
    tags: ['沟通', '公式'],
  },
  // ----- 风险域 -----
  {
    id: 'preset-006',
    type: 'scenario',
    scenario: { zh: '在一个建筑项目中，你识别出供应商可能延迟交付关键建材的风险。这种风险一旦发生，项目将延误至少2周。你决定从多家供应商处采购，分散单一供应商的风险。' },
    question: { zh: '这属于哪种风险应对策略？' },
    options: [
      { label: 'A', text: { zh: '规避(Avoid)' } },
      { label: 'B', text: { zh: '转移(Transfer)' } },
      { label: 'C', text: { zh: '减轻(Mitigate)' } },
      { label: 'D', text: { zh: '接受(Accept)' } },
    ],
    correctAnswer: 'C',
    explanation: { zh: '减轻(Mitigate)策略旨在降低风险发生的概率或减少风险发生后的影响。从多家供应商采购，降低了单一供应商延迟导致项目受影响的概率。记忆诀窍：规避=不做这件事了；转移=出钱让别人扛（买保险）；减轻=降低概率或影响；接受=认了，准备储备金应对。' },
    knowledgeNodeIds: ['proc-plan-risk-responses'],
    difficulty: 2, domain: 'risk', focusArea: 'planning',
    tags: ['风险应对', '策略'],
  },
  {
    id: 'preset-007',
    type: 'scenario',
    scenario: { zh: '团队正在对一个新产品的风险进行优先级排序。项目经理使用概率影响矩阵将风险分为高、中、低三个等级。' },
    question: { zh: '这个过程属于什么？' },
    options: [
      { label: 'A', text: { zh: '识别风险(Identify Risks)' } },
      { label: 'B', text: { zh: '实施定性风险分析(Perform Qualitative Risk Analysis)' } },
      { label: 'C', text: { zh: '实施定量风险分析(Perform Quantitative Risk Analysis)' } },
      { label: 'D', text: { zh: '规划风险应对(Plan Risk Responses)' } },
    ],
    correctAnswer: 'B',
    explanation: { zh: '定性风险分析使用概率影响矩阵对风险进行排序和优先级划分——它是主观的、快速的排序工具。定量风险分析则使用蒙特卡洛模拟、决策树等数值方法，输出具体的概率数值（如"项目有85%的概率在预算内完成"）。先定性再定量，定性够用就不需要定量。' },
    knowledgeNodeIds: ['proc-perform-risk-analysis'],
    difficulty: 2, domain: 'risk', focusArea: 'planning',
    tags: ['风险分析', '定性', '定量'],
  },
  // ----- 资源域 -----
  {
    id: 'preset-008',
    type: 'scenario',
    scenario: { zh: '一个新的项目团队刚组建完成。团队成员来自不同的部门，彼此不熟悉，对项目目标的理解也不一致。' },
    question: { zh: '根据Tuckman模型，团队目前处于哪个阶段？接下来你应该重点关注什么？' },
    options: [
      { label: 'A', text: { zh: '规范阶段(Norming)，重点建立团队规则' } },
      { label: 'B', text: { zh: '形成阶段(Forming)，重点明确目标和角色' } },
      { label: 'C', text: { zh: '震荡阶段(Storming)，重点解决冲突' } },
      { label: 'D', text: { zh: '成熟阶段(Performing)，重点授权赋能' } },
    ],
    correctAnswer: 'B',
    explanation: { zh: 'Tuckman团队发展阶段模型顺序：Forming(形成)→Storming(震荡)→Norming(规范)→Performing(成熟)→Adjourning(解散)。刚组建的团队处于形成阶段——成员彼此不熟悉、需要理解团队目标、明确各自角色。项目经理此阶段应：澄清项目目标、分配角色职责、建立基本规则。' },
    knowledgeNodeIds: ['proc-lead-team'],
    difficulty: 2, domain: 'resource', focusArea: 'executing',
    tags: ['Tuckman', '团队发展'],
  },
  // ----- 范围域 -----
  {
    id: 'preset-009',
    type: 'scenario',
    scenario: { zh: '你在管理一个产品开发项目。客户频繁要求增加新功能，这些功能都不在原定的项目范围说明书内。每次你都不好意思拒绝，默默加了进去。' },
    question: { zh: '这属于什么现象？正确的做法是什么？' },
    options: [
      { label: 'A', text: { zh: '范围蔓延(Scope Creep)，应通过变更控制流程管理' } },
      { label: 'B', text: { zh: '镀金(Gold Plating)，应立即停止额外工作' } },
      { label: 'C', text: { zh: '范围蔓延(Scope Creep)，应直接拒绝所有额外请求' } },
      { label: 'D', text: { zh: '敏捷迭代，应欢迎所有变更请求' } },
    ],
    correctAnswer: 'A',
    explanation: { zh: '范围蔓延(Scope Creep)是指未经控制的范围变更——客户提出、项目经理未走正规变更流程就接受了。镀金(Gold Plating)是团队主动添加额外功能（"我觉得这样做更好"），客户并未要求。两者都违反聚焦于价值的原则。正确做法：走变更控制流程，评估影响后再决定是否纳入变更。' },
    knowledgeNodeIds: ['proc-monitor-scope', 'proc-evaluate-change'],
    difficulty: 2, domain: 'scope', focusArea: 'monitoring',
    tags: ['范围蔓延', '变更控制'],
  },
  {
    id: 'preset-010',
    type: 'scenario',
    scenario: { zh: '你刚刚完成了项目的WBS（工作分解结构）。一名团队成员问你：WBS最底层的组件叫什么？它的主要作用是什么？' },
    question: { zh: 'WBS的最底层组件是？' },
    options: [
      { label: 'A', text: { zh: '活动(Activity)' } },
      { label: 'B', text: { zh: '工作包(Work Package)' } },
      { label: 'C', text: { zh: '可交付物(Deliverable)' } },
      { label: 'D', text: { zh: '任务(Task)' } },
    ],
    correctAnswer: 'B',
    explanation: { zh: 'WBS的最底层是工作包(Work Package)，它是可以进行成本估算、资源分配和进度安排的最小单位。工作包可以进一步分解为活动(Activity)，但活动不属于WBS的正式层级。WBS遵循100%原则——必须涵盖项目的全部工作范围。' },
    knowledgeNodeIds: ['proc-develop-scope-structure'],
    difficulty: 1, domain: 'scope', focusArea: 'planning',
    tags: ['WBS', '范围'],
  },
  // ----- 进度域 -----
  {
    id: 'preset-011',
    type: 'scenario',
    scenario: { zh: '项目进度落后了2周，发起人要求你压缩进度，但明确表示不能增加额外预算。' },
    question: { zh: '你应该采用什么方法？' },
    options: [
      { label: 'A', text: { zh: '赶工(Crashing)——增加资源加班赶进度' } },
      { label: 'B', text: { zh: '快速跟进(Fast Tracking)——将原本串行的活动并行执行' } },
      { label: 'C', text: { zh: '削减范围' } },
      { label: 'D', text: { zh: '如实告诉发起人无法压缩' } },
    ],
    correctAnswer: 'B',
    explanation: { zh: '进度压缩两大方法：赶工(Crashing)=增加资源或加班→需要额外成本；快速跟进(Fast Tracking)=将串行活动改为并行→增加风险和返工可能性，但不增加成本。发起人不允许增加预算→赶工不可行→快速跟进是最佳选择。注意：只对关键路径上的活动进行压缩才有效。' },
    knowledgeNodeIds: ['proc-develop-schedule'],
    difficulty: 2, domain: 'schedule', focusArea: 'planning',
    tags: ['进度压缩', '关键路径'],
  },
  // ----- 财务域 -----
  {
    id: 'preset-012',
    type: 'scenario',
    scenario: { zh: '项目总预算BAC为100万，目前已完成40%的工作(EV=40万)，实际花费AC=45万，计划此时应完成50%(PV=50万)。' },
    question: { zh: '该项目的CPI和SPI分别是多少？项目状态如何？' },
    options: [
      { label: 'A', text: { zh: 'CPI=0.89, SPI=0.8，成本超支且进度滞后' } },
      { label: 'B', text: { zh: 'CPI=1.13, SPI=1.25，成本节约且进度超前' } },
      { label: 'C', text: { zh: 'CPI=0.89, SPI=1.25，成本超支但进度超前' } },
      { label: 'D', text: { zh: 'CPI=1.13, SPI=0.8，成本节约但进度滞后' } },
    ],
    correctAnswer: 'A',
    explanation: { zh: '计算过程：CPI=EV/AC=40/45=0.89（<1，每投入1元只挣回0.89元→成本超支），SPI=EV/PV=40/50=0.8（<1，进度只完成计划的80%→进度滞后）。TCPI=(BAC-EV)/(BAC-AC)=(100-40)/(100-45)=60/55=1.09，剩余工作需要以1.09的效率执行才能达到BAC。' },
    knowledgeNodeIds: ['proc-monitor-finance', 'proc-monitor-performance'],
    difficulty: 3, domain: 'finance', focusArea: 'monitoring',
    tags: ['EVM', '计算', 'CPI', 'SPI'],
  },
  // ----- 敏捷 -----
  {
    id: 'preset-013',
    type: 'scenario',
    scenario: { zh: '一个项目的需求极不明确，客户希望在开发过程中看到可工作的产品并不断反馈。项目团队在2周的迭代中交付增量。在每个迭代结束时，团队会进行回顾以改进过程。' },
    question: { zh: '团队使用的是哪种项目生命周期？' },
    options: [
      { label: 'A', text: { zh: '预测型(Predictive)' } },
      { label: 'B', text: { zh: '迭代型(Iterative)' } },
      { label: 'C', text: { zh: '增量型(Incremental)' } },
      { label: 'D', text: { zh: '敏捷型(Agile)——迭代+增量' } },
    ],
    correctAnswer: 'D',
    explanation: { zh: '敏捷型生命周期=迭代（通过回顾不断改进过程）+增量（每次迭代交付可工作的产品增量）。关键区分：迭代型关注通过原型学习和改进，但不一定每次交付可用产品；增量型关注频繁交付可用产品，但不一定有过程回顾改进；敏捷型两者兼备。预测型要求需求在前期明确。' },
    knowledgeNodeIds: ['agile-lifecycle', 'agile-scrum'],
    difficulty: 2, domain: 'agile', focusArea: null,
    tags: ['敏捷', '生命周期'],
  },
  {
    id: 'preset-014',
    type: 'scenario',
    scenario: { zh: '一个硬件开发项目，硬件部分需求明确且稳定，但嵌入式软件部分需求不确定。项目经理决定：硬件部分使用预测型方法，软件部分使用敏捷方法。' },
    question: { zh: '这属于什么方法？' },
    options: [
      { label: 'A', text: { zh: '纯预测型' } },
      { label: 'B', text: { zh: '纯敏捷型' } },
      { label: 'C', text: { zh: '混合型(Hybrid)' } },
      { label: 'D', text: { zh: 'Scrum' } },
    ],
    correctAnswer: 'C',
    explanation: { zh: '混合型(Hybrid)生命周期在同一项目中结合了预测型和敏捷型方法——通常是因为不同项目组件的需求确定性不同。PMP考试越来越喜欢考混合场景。4种常见混合模式：敏捷开发+预测型发布、同时使用敏捷和预测、预测为主+敏捷元素、敏捷为主+预测组件。' },
    knowledgeNodeIds: ['agile-hybrid', 'agile-lifecycle'],
    difficulty: 2, domain: 'agile', focusArea: null,
    tags: ['混合', '敏捷', '生命周期'],
  },
  {
    id: 'preset-015',
    type: 'scenario',
    scenario: { zh: '在一个Scrum团队中，产品负责人(PO)刚刚更新了产品待办事项列表的优先级。团队在下次Sprint Planning中应该怎么做？' },
    question: { zh: '对于Sprint内的变更，Scrum的做法是？' },
    options: [
      { label: 'A', text: { zh: 'Sprint内随时可以变更范围' } },
      { label: 'B', text: { zh: 'Sprint开始后范围一般不变，变更留到下一个Sprint' } },
      { label: 'C', text: { zh: '由Scrum Master决定是否可以变更' } },
      { label: 'D', text: { zh: '由项目经理决定变更流程' } },
    ],
    correctAnswer: 'B',
    explanation: { zh: 'Scrum的核心规则：Sprint一旦开始，Sprint Backlog不应更改（保护团队免受干扰，确保承诺的完成）。新的优先级调整反映在Product Backlog中，在下一次Sprint Planning时再决定是否纳入。这与传统项目管理的变更控制有本质区别——不是不响应变更，而是在合适的时间点响应。' },
    knowledgeNodeIds: ['agile-scrum', 'proc-evaluate-change'],
    difficulty: 2, domain: 'agile', focusArea: null,
    tags: ['Scrum', 'Sprint', '变更'],
  },
];

const Questions = {
  async render() {
    // 初始化属性（普通对象无constructor，在此初始化）
    this.allQuestions = [];
    this.filteredQuestions = [];
    this.filter = { domain: '', focusArea: '', difficulty: '', search: '' };

    // 加载题目（预设 + 自定义）
    await this._loadQuestions();
    this._applyFilter();

    return `
      <div class="card">
        <div class="card-header">
          <span class="card-title">📝 题库管理</span>
          <span class="card-subtitle">${this.allQuestions.length} 道题目</span>
        </div>
        <div style="padding:0 16px 8px;">
          <button class="btn btn-primary btn-sm" onclick="window._qAdd()" style="width:100%;">+ 添加题目</button>
        </div>

        <!-- 筛选工具栏 -->
        <div style="padding:8px 16px;border-bottom:1px solid var(--color-border);">
          <input class="input" id="qFilterSearch" placeholder="搜索题目关键词..." oninput="window._qFilter()" style="width:100%;padding:8px 12px;border-radius:4px;border:1px solid var(--color-border);font-size:14px;margin-bottom:6px;">
          <div class="toolbar" style="display:flex;gap:6px;">
            <select id="qFilterDomain" onchange="window._qFilter()" style="flex:1;padding:4px 6px;border-radius:4px;border:1px solid var(--color-border);font-size:12px;">
              <option value="">全部领域</option>
              <option value="governance">治理</option><option value="scope">范围</option><option value="schedule">进度</option><option value="finance">财务</option><option value="stakeholder">干系人</option><option value="resource">资源</option><option value="risk">风险</option><option value="agile">敏捷</option>
            </select>
            <select id="qFilterFocus" onchange="window._qFilter()" style="flex:1;padding:4px 6px;border-radius:4px;border:1px solid var(--color-border);font-size:12px;">
              <option value="">全部阶段</option>
              <option value="initiating">启动</option><option value="planning">规划</option><option value="executing">执行</option><option value="monitoring">监控</option><option value="closing">收尾</option>
            </select>
            <select id="qFilterDiff" onchange="window._qFilter()" style="flex:1;padding:4px 6px;border-radius:4px;border:1px solid var(--color-border);font-size:12px;">
              <option value="">难度</option>
              <option value="1">⭐</option><option value="2">⭐⭐</option><option value="3">⭐⭐⭐</option><option value="4">⭐⭐⭐⭐</option><option value="5">⭐⭐⭐⭐⭐</option>
            </select>
          </div>
        </div>

        <!-- 题目列表 -->
        <div id="questionList">
          ${this._renderList()}
        </div>
      </div>
    `;
  },

  async _loadQuestions() {
    // 预设题目由 db.init() 自动加载，这里只读取
    this.allQuestions = await db.getCustomQuestions();
  },

  _applyFilter() {
    this.filteredQuestions = this.allQuestions.filter(q => {
      if (this.filter.domain && q.domain !== this.filter.domain) return false;
      if (this.filter.focusArea && q.focusArea !== this.filter.focusArea) return false;
      if (this.filter.difficulty && q.difficulty !== parseInt(this.filter.difficulty)) return false;
      if (this.filter.search) {
        const s = this.filter.search.toLowerCase();
        const text = (q.scenario?.zh || '') + (q.question?.zh || '') + (q.tags || []).join(' ');
        if (!text.toLowerCase().includes(s)) return false;
      }
      return true;
    });
  },

  _renderList() {
    if (this.filteredQuestions.length === 0) {
      return `
        <div class="empty-state">
          <div class="empty-icon">📭</div>
          <h3>暂无题目</h3>
          <p>点击「添加题目」或「导入JSON」开始创建题库</p>
        </div>
      `;
    }

    const domainMap = { governance: '治理', scope: '范围', schedule: '进度', finance: '财务', stakeholder: '利益相关方', resource: '资源', risk: '风险', agile: '敏捷' };
    const diffStars = { 1: '⭐', 2: '⭐⭐', 3: '⭐⭐⭐', 4: '⭐⭐⭐⭐', 5: '⭐⭐⭐⭐⭐' };

    return this.filteredQuestions.slice(0, 200).map((q, i) => `
      <div class="question-list-item" style="display:flex;align-items:flex-start;gap:8px;padding:10px 12px;border-bottom:1px solid var(--color-border);">
        <span style="font-weight:700;color:var(--color-primary);min-width:24px;flex-shrink:0;">${i+1}</span>
        <div style="flex:1;min-width:0;">
          <p style="font-size:13px;line-height:1.5;word-break:break-all;">${escapeHtml(q.question?.zh || q.scenario?.zh || '无题目')}</p>
          <div style="display:flex;gap:6px;margin-top:4px;flex-wrap:wrap;">
            <span class="tag tag-blue" style="font-size:10px;">${domainMap[q.domain]||q.domain}</span>
            <span style="font-size:10px;color:var(--color-text3);">${diffStars[q.difficulty]||''}</span>
          </div>
        </div>
        <div style="display:flex;flex-direction:column;gap:4px;flex-shrink:0;">
          <button class="btn btn-sm btn-secondary" onclick="window._qPreview('${q.id}')" style="font-size:11px;padding:4px 8px;">查看</button>
        </div>
      </div>
    `).join('') + (this.filteredQuestions.length > 200 ? `<p style="text-align:center;color:var(--color-text3);padding:12px;">仅显示前200条，${this.filteredQuestions.length}条匹配中请用搜索筛选</p>` : '');
  },
};

// ===== 全局函数 =====
window._qFilter = () => {
  Questions.filter.domain = document.getElementById('qFilterDomain')?.value || '';
  Questions.filter.focusArea = document.getElementById('qFilterFocus')?.value || '';
  Questions.filter.difficulty = document.getElementById('qFilterDiff')?.value || '';
  Questions.filter.search = document.getElementById('qFilterSearch')?.value || '';
  Questions._applyFilter();
  const list = document.getElementById('questionList');
  if (list) list.innerHTML = Questions._renderList();
};

window._qAdd = () => {
  const domains = ['governance','scope','schedule','finance','stakeholder','resource','risk','agile'];
  const domainNames = ['治理','范围','进度','财务','利益相关方','资源','风险','敏捷'];
  const focusAreas = ['initiating','planning','executing','monitoring','closing'];
  const focusNames = ['启动','规划','执行','监控','收尾'];

  showModal(`
    <h3 style="margin-bottom:16px;">添加新题目</h3>
    <div class="form-group">
      <label class="form-label">情景描述</label>
      <textarea class="textarea" id="qAddScenario" placeholder="描述项目背景和具体情况..." rows="3"></textarea>
    </div>
    <div class="form-group">
      <label class="form-label">问题</label>
      <input class="input" id="qAddQuestion" placeholder="具体问题是什么？">
    </div>
    <div class="grid-2">
      <div class="form-group">
        <label class="form-label">选项A</label>
        <input class="input" id="qAddOptA" placeholder="选项A">
      </div>
      <div class="form-group">
        <label class="form-label">选项B</label>
        <input class="input" id="qAddOptB" placeholder="选项B">
      </div>
      <div class="form-group">
        <label class="form-label">选项C</label>
        <input class="input" id="qAddOptC" placeholder="选项C">
      </div>
      <div class="form-group">
        <label class="form-label">选项D</label>
        <input class="input" id="qAddOptD" placeholder="选项D">
      </div>
    </div>
    <div class="grid-3">
      <div class="form-group">
        <label class="form-label">正确答案</label>
        <select class="select" id="qAddAnswer">
          <option value="A">A</option><option value="B">B</option>
          <option value="C">C</option><option value="D">D</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">难度</label>
        <select class="select" id="qAddDiff">
          <option value="1">⭐</option><option value="2">⭐⭐</option>
          <option value="3">⭐⭐⭐</option><option value="4">⭐⭐⭐⭐</option><option value="5">⭐⭐⭐⭐⭐</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">领域</label>
        <select class="select" id="qAddDomain">
          ${domains.map((d,i) => `<option value="${d}">${domainNames[i]}</option>`).join('')}
        </select>
      </div>
    </div>
    <div class="form-group">
      <label class="form-label">解析</label>
      <textarea class="textarea" id="qAddExplanation" placeholder="解释为什么这个答案是正确的..." rows="3"></textarea>
    </div>
    <div class="form-group">
      <label class="form-label">标签（逗号分隔）</label>
      <input class="input" id="qAddTags" placeholder="如：变更控制, 流程">
    </div>
    <button class="btn btn-primary" onclick="window._qSave()" style="width:100%;">保存题目</button>
  `, { width: '700px' });
};

window._qSave = async () => {
  const q = {
    id: uid('q-'),
    type: 'scenario',
    scenario: { zh: document.getElementById('qAddScenario')?.value || '' },
    question: { zh: document.getElementById('qAddQuestion')?.value || '' },
    options: [
      { label: 'A', text: { zh: document.getElementById('qAddOptA')?.value || '' } },
      { label: 'B', text: { zh: document.getElementById('qAddOptB')?.value || '' } },
      { label: 'C', text: { zh: document.getElementById('qAddOptC')?.value || '' } },
      { label: 'D', text: { zh: document.getElementById('qAddOptD')?.value || '' } },
    ],
    correctAnswer: document.getElementById('qAddAnswer')?.value || 'A',
    explanation: { zh: document.getElementById('qAddExplanation')?.value || '' },
    knowledgeNodeIds: [],
    difficulty: parseInt(document.getElementById('qAddDiff')?.value || '2'),
    domain: document.getElementById('qAddDomain')?.value || 'governance',
    focusArea: null,
    tags: (document.getElementById('qAddTags')?.value || '').split(',').map(s => s.trim()).filter(Boolean),
    createdAt: new Date().toISOString(),
  };

  await db.addCustomQuestion(q);
  toast('题目已保存 ✅', 'success');
  document.getElementById('modalOverlay').style.display = 'none';
  router.navigate('/questions');
};

window._qPreview = (id) => {
  const all = [...PRESET_QUESTIONS, ...(Questions.allQuestions || [])];
  const q = all.find(x => x.id === id);
  if (!q) return toast('题目不存在', 'error');

  const optStr = q.options.map(o => `
    <div style="padding:10px;margin:4px 0;background:var(--color-surface2);border-radius:6px;
      ${o.label === q.correctAnswer ? 'border:2px solid var(--color-success);' : ''}">
      <strong>${o.label}.</strong> ${escapeHtml(o.text?.zh || '')}
      ${o.label === q.correctAnswer ? '<span style="color:var(--color-success);margin-left:8px;">✅ 正确答案</span>' : ''}
    </div>
  `).join('');

  showModal(`
    <h3 style="margin-bottom:12px;">题目预览</h3>
    ${q.scenario?.zh ? `<div style="padding:12px;background:var(--color-surface2);border-radius:8px;margin-bottom:12px;border-left:3px solid var(--color-primary);">${escapeHtml(q.scenario.zh)}</div>` : ''}
    <p style="font-weight:600;margin-bottom:12px;">${escapeHtml(q.question?.zh || '')}</p>
    ${optStr}
    ${q.explanation?.zh ? `<div style="margin-top:12px;padding:12px;background:rgba(34,197,94,0.05);border-radius:8px;"><strong>📖 解析：</strong><br>${escapeHtml(q.explanation.zh)}</div>` : ''}
  `, { width: '650px' });
};

window._qDelete = async (id) => {
  const ok = await confirm('确定要删除这道题目吗？此操作不可撤销。');
  if (ok) {
    await db.deleteCustomQuestion(id);
    toast('题目已删除', 'info');
    router.navigate('/questions');
  }
};

window._qImport = () => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      if (!Array.isArray(data)) throw new Error('JSON应为题目数组');
      let count = 0;
      for (const q of data) {
        if (q.question && q.options && q.correctAnswer) {
          q.id = uid('import-');
          q.createdAt = new Date().toISOString();
          await db.addCustomQuestion(q);
          count++;
        }
      }
      toast(`成功导入${count}道题目 ✅`, 'success');
      router.navigate('/questions');
    } catch (err) {
      toast('导入失败：' + err.message, 'error');
    }
  };
  input.click();
};

window._qExport = async () => {
  const questions = await db.getCustomQuestions();
  const json = JSON.stringify(questions, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `pmp-questions-${new Date().toISOString().slice(0,10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
  toast('题库已导出 ✅', 'success');
};

export default Questions;
