// ===== 术语词汇表页面 =====

import router from './router.js';

// ===== 术语数据 =====
const GLOSSARY_DATA = {
  'evm': {
    id: 'evm',
    label: 'EVM / 挣值管理',
    icon: '📊',
    terms: [
      {
        abbr: 'PV',
        fullEn: 'Planned Value',
        fullZh: '计划价值',
        formula: 'PV = 计划完成百分比 × BAC',
        explanation: '截至某一时间点，计划完成工作的预算价值。PV 是 EVM 的"基准"，所有偏差比较的参照点。',
        related: ['EV', 'BAC'],
        knowledgeNode: 'domain-finance',
      },
      {
        abbr: 'EV',
        fullEn: 'Earned Value',
        fullZh: '挣值',
        formula: 'EV = 实际完成百分比 × BAC',
        explanation: '实际完成工作的预算价值。EV 衡量的是"实际产出"而非"实际花费"，是 EVM 最核心的概念。',
        related: ['PV', 'AC', 'BAC'],
        knowledgeNode: 'domain-finance',
      },
      {
        abbr: 'AC',
        fullEn: 'Actual Cost',
        fullZh: '实际成本',
        formula: null,
        explanation: '截至某一时间点，实际完成工作所花费的全部成本。AC 反映的是真实的资金流出，与预算无关。',
        related: ['EV', 'CV'],
        knowledgeNode: 'domain-finance',
      },
      {
        abbr: 'SV',
        fullEn: 'Schedule Variance',
        fullZh: '进度偏差',
        formula: 'SV = EV − PV',
        explanation: '衡量进度绩效的绝对值指标。SV > 0 表示进度超前，SV < 0 表示进度落后。单位与预算货币一致。',
        related: ['EV', 'PV', 'SPI'],
        knowledgeNode: 'domain-schedule',
      },
      {
        abbr: 'CV',
        fullEn: 'Cost Variance',
        fullZh: '成本偏差',
        formula: 'CV = EV − AC',
        explanation: '衡量成本绩效的绝对值指标。CV > 0 表示成本节约，CV < 0 表示成本超支。',
        related: ['EV', 'AC', 'CPI'],
        knowledgeNode: 'domain-finance',
      },
      {
        abbr: 'SPI',
        fullEn: 'Schedule Performance Index',
        fullZh: '进度绩效指数',
        formula: 'SPI = EV ÷ PV',
        explanation: '衡量进度效率的相对值指标。SPI > 1 表示进度超前，SPI < 1 表示进度落后。SPI 可预测完工时间。',
        related: ['EV', 'PV', 'SV'],
        knowledgeNode: 'domain-schedule',
      },
      {
        abbr: 'CPI',
        fullEn: 'Cost Performance Index',
        fullZh: '成本绩效指数',
        formula: 'CPI = EV ÷ AC',
        explanation: '衡量成本效率的相对值指标。CPI > 1 表示成本节约，CPI < 1 表示成本超支。CPI 是预测 EAC 的关键输入。',
        related: ['EV', 'AC', 'CV', 'EAC'],
        knowledgeNode: 'domain-finance',
      },
      {
        abbr: 'BAC',
        fullEn: 'Budget at Completion',
        fullZh: '完工预算',
        formula: null,
        explanation: '项目开始前批准的全部预算。BAC 是 EVM 所有指标的"总盘子"，不随项目进展而改变（除非通过正式变更控制流程）。',
        related: ['EAC', 'ETC', 'TCPI'],
        knowledgeNode: 'domain-finance',
      },
      {
        abbr: 'EAC',
        fullEn: 'Estimate at Completion',
        fullZh: '完工估算',
        formula: 'EAC = AC + ETC（或 EAC = BAC ÷ CPI）',
        explanation: '根据当前绩效预测的项目完工总成本。常见计算方式：按当前 CPI 推算（EAC = BAC/CPI），或按剩余预算加实际成本。',
        related: ['BAC', 'ETC', 'CPI'],
        knowledgeNode: 'domain-finance',
      },
      {
        abbr: 'ETC',
        fullEn: 'Estimate to Complete',
        fullZh: '完工尚需估算',
        formula: 'ETC = EAC − AC（或 ETC = (BAC − EV) ÷ CPI）',
        explanation: '从当前时点到项目完工还需要花费的成本。可用于评估剩余资金是否充足。',
        related: ['EAC', 'AC', 'CPI'],
        knowledgeNode: 'domain-finance',
      },
      {
        abbr: 'TCPI',
        fullEn: 'To-Complete Performance Index',
        fullZh: '完工尚需绩效指数',
        formula: 'TCPI = (BAC − EV) ÷ (BAC − AC) 或 (BAC − EV) ÷ (EAC − AC)',
        explanation: '为实现 BAC 或 EAC 目标，剩余工作必须达到的成本绩效水平。TCPI > 1 表示未来必须比原计划更高效才能达标。',
        related: ['BAC', 'EAC', 'EV', 'AC', 'CPI'],
        knowledgeNode: 'domain-finance',
      },
    ],
  },

  'schedule': {
    id: 'schedule',
    label: '进度管理',
    icon: '📅',
    terms: [
      {
        abbr: 'CPM',
        fullEn: 'Critical Path Method',
        fullZh: '关键路径法',
        formula: '总浮动时间 = 最晚开始 − 最早开始',
        explanation: '一种进度网络分析技术，用于确定项目中最长的活动路径（关键路径）。关键路径上的任何延迟都会直接影响项目完工日期。',
        related: ['PERT', '浮动时间'],
        knowledgeNode: 'domain-schedule',
      },
      {
        abbr: 'PERT',
        fullEn: 'Program Evaluation and Review Technique',
        fullZh: '计划评审技术',
        formula: '期望时间 tE = (tO + 4tM + tP) ÷ 6',
        explanation: '三点估算技术，结合乐观(O)、最可能(M)、悲观(P)三种估计值，通过加权平均计算活动的期望持续时间。',
        related: ['CPM', 'SD', '蒙特卡洛'],
        knowledgeNode: 'domain-schedule',
      },
      {
        abbr: 'WBS',
        fullEn: 'Work Breakdown Structure',
        fullZh: '工作分解结构',
        formula: null,
        explanation: '将项目可交付物和项目工作逐层分解为更小、更易于管理的组件。WBS 是范围基准的核心，定义了项目"要做"和"不做"的全部工作。',
        related: ['范围基准', 'WBS词典', '控制账户'],
        knowledgeNode: 'domain-scope',
      },
      {
        abbr: 'SD',
        fullEn: 'Standard Deviation',
        fullZh: '标准差',
        formula: 'σ = (tP − tO) ÷ 6',
        explanation: '在 PERT 中衡量活动持续时间不确定性的统计指标。σ 越大，说明估计的不确定性越高。用于计算项目在特定时间内完工的概率。',
        related: ['PERT', '方差 σ²', '正态分布'],
        knowledgeNode: 'domain-schedule',
      },
    ],
  },

  'quality': {
    id: 'quality',
    label: '质量管理',
    icon: '✅',
    terms: [
      {
        abbr: 'COQ',
        fullEn: 'Cost of Quality',
        fullZh: '质量成本',
        formula: 'COQ = 一致性成本 + 非一致性成本',
        explanation: '包括预防成本、评估成本（一致性成本）和内部/外部失败成本（非一致性成本）。最佳实践是增加预防投入以降低失败成本。',
        related: ['QA', 'QC', '预防胜于检查'],
        knowledgeNode: 'domain-quality',
      },
      {
        abbr: 'QA',
        fullEn: 'Quality Assurance',
        fullZh: '质量保证',
        formula: null,
        explanation: '关注"过程"，通过审计和过程分析确保项目使用正确的流程和标准。QA 回答"我们做得对吗？"，属管理过程组。',
        related: ['QC', 'COQ', '质量审计'],
        knowledgeNode: 'domain-quality',
      },
      {
        abbr: 'QC',
        fullEn: 'Quality Control',
        fullZh: '质量控制',
        formula: null,
        explanation: '关注"结果"，通过检查和测量验证可交付物符合质量标准。QC 回答"结果符合要求吗？"，属监控过程组。',
        related: ['QA', 'COQ', '检查'],
        knowledgeNode: 'domain-quality',
      },
      {
        abbr: 'DoD',
        fullEn: 'Definition of Done',
        fullZh: '完成定义',
        formula: null,
        explanation: '敏捷团队对"完成"的共同理解，通常以检查清单形式存在。DoD 确保每个增量都达到可发布的质量标准。是 Scrum 三大工件中增量的质量门禁。',
        related: ['验收标准', 'Scrum', '增量'],
        knowledgeNode: 'agile-scrum',
      },
    ],
  },

  'risk': {
    id: 'risk',
    label: '风险管理',
    icon: '⚠️',
    terms: [
      {
        abbr: 'EMV',
        fullEn: 'Expected Monetary Value',
        fullZh: '期望货币价值',
        formula: 'EMV = 概率 × 影响（金额）',
        explanation: '将不确定事件的概率与财务影响相乘，得到量化的风险货币期望值。用于决策树分析和风险优先级排序。正 EMV 表示机会，负 EMV 表示威胁。',
        related: ['决策树', '敏感性分析', '蒙特卡洛'],
        knowledgeNode: 'domain-risk',
      },
      {
        abbr: 'RBS',
        fullEn: 'Risk Breakdown Structure',
        fullZh: '风险分解结构',
        formula: null,
        explanation: '按风险类别和子类别对已识别风险进行层级化表示。RBS 帮助团队系统性地识别和分析风险，避免遗漏重要的风险来源。',
        related: ['WBS', '风险登记册', '风险类别'],
        knowledgeNode: 'domain-risk',
      },
      {
        abbr: 'SWOT',
        fullEn: 'Strengths, Weaknesses, Opportunities, Threats',
        fullZh: '态势分析（优势/劣势/机会/威胁）',
        formula: null,
        explanation: '从组织内部（优势 S、劣势 W）和外部（机会 O、威胁 T）四个维度系统识别风险。SWOT 是一种风险识别工具，常用于项目启动阶段。',
        related: ['PESTLE', '风险识别', '战略规划'],
        knowledgeNode: 'domain-risk',
      },
      {
        abbr: 'PESTLE',
        fullEn: 'Political, Economic, Social, Technological, Legal, Environmental',
        fullZh: '宏观环境分析（政治/经济/社会/技术/法律/环境）',
        formula: null,
        explanation: '从六个宏观维度分析可能影响项目的外部环境因素。PESTLE 帮助识别项目外部的战略风险和机会，是事业环境因素分析的重要工具。',
        related: ['SWOT', '事业环境因素', '风险识别'],
        knowledgeNode: 'domain-risk',
      },
    ],
  },

  'resource': {
    id: 'resource',
    label: '资源管理',
    icon: '👥',
    terms: [
      {
        abbr: 'RACI',
        fullEn: 'Responsible, Accountable, Consulted, Informed',
        fullZh: '责任分配矩阵（执行/负责/咨询/知情）',
        formula: null,
        explanation: '一种责任分配矩阵，明确每项工作包或活动的四种角色：R-执行者（干活的人）、A-负责人（最终担责，每项活动仅1个A）、C-被咨询者（双向沟通）、I-被通知者（单向告知）。',
        related: ['WBS', '组织分解结构', '资源管理计划'],
        knowledgeNode: 'domain-resource',
      },
      {
        abbr: 'Tuckman',
        fullEn: 'Tuckman Ladder — Forming, Storming, Norming, Performing, Adjourning',
        fullZh: '塔克曼团队发展阶段模型（组建/震荡/规范/成熟/解散）',
        formula: null,
        explanation: '描述团队从成立到解散经历的五个阶段。项目经理需要根据团队所处阶段调整领导风格：Forming（指导型）→ Storming（教练型）→ Norming（支持型）→ Performing（授权型）→ Adjourning（认可型）。',
        related: ['领导力风格', '团队建设', '冲突管理'],
        knowledgeNode: 'domain-resource',
      },
    ],
  },

  'governance': {
    id: 'governance',
    label: '变更与治理',
    icon: '⚖️',
    terms: [
      {
        abbr: 'CCB',
        fullEn: 'Change Control Board',
        fullZh: '变更控制委员会',
        formula: null,
        explanation: '由关键利益相关方组成的正式小组，负责审查、评估、批准、推迟或拒绝项目变更请求。CCB 是整体变更控制流程的决策机构。',
        related: ['变更请求', '变更日志', '配置管理'],
        knowledgeNode: 'domain-governance',
      },
      {
        abbr: 'SMART',
        fullEn: 'Specific, Measurable, Achievable, Realistic, Time-bound',
        fullZh: 'SMART 目标原则（具体的/可衡量的/可实现的/相关的/有时限的）',
        formula: null,
        explanation: '制定项目目标和关键绩效指标(KPI)的五项准则。SMART 原则确保目标清晰、可量化、可达成，是制定项目章程和WBS分解的基础。',
        related: ['项目目标', 'KPI', '项目章程'],
        knowledgeNode: 'domain-governance',
      },
    ],
  },

  'finance': {
    id: 'finance',
    label: '财务管理',
    icon: '💰',
    terms: [
      {
        abbr: 'ROI',
        fullEn: 'Return on Investment',
        fullZh: '投资回报率',
        formula: 'ROI = (收益 − 投资成本) ÷ 投资成本 × 100%',
        explanation: '衡量项目投资效益的百分比指标。ROI 越高，表明项目投资价值越大。常用于项目选择阶段的商业论证。',
        related: ['NPV', 'IRR', 'BCR', '商业论证'],
        knowledgeNode: 'domain-finance',
      },
      {
        abbr: 'NPV',
        fullEn: 'Net Present Value',
        fullZh: '净现值',
        formula: 'NPV = Σ[未来各期现金流 ÷ (1 + 折现率)^t] − 初始投资',
        explanation: '考虑货币时间价值后的项目净收益。NPV > 0 表示项目在经济上可行。NPV 越大，项目越有吸引力。',
        related: ['IRR', 'ROI', '折现率', 'BCR'],
        knowledgeNode: 'domain-finance',
      },
      {
        abbr: 'IRR',
        fullEn: 'Internal Rate of Return',
        fullZh: '内部收益率',
        formula: '令 NPV = 0 时的折现率',
        explanation: '使项目净现值为零的折现率。IRR 代表项目的预期收益率，当 IRR > 资本成本时项目可行。IRR 越高，项目投资价值越大。',
        related: ['NPV', 'ROI', '折现现金流'],
        knowledgeNode: 'domain-finance',
      },
      {
        abbr: 'CapEx',
        fullEn: 'Capital Expenditure',
        fullZh: '资本性支出',
        formula: null,
        explanation: '用于获取、升级和维护长期资产（如设备、建筑物）的支出。CapEx 需资本化并在资产寿命内折旧，属于项目投资决策中的重要考量因素。',
        related: ['OpEx', '折旧', '资产'],
        knowledgeNode: 'domain-finance',
      },
      {
        abbr: 'OpEx',
        fullEn: 'Operational Expenditure',
        fullZh: '运营性支出',
        formula: null,
        explanation: '维持日常运营的持续性支出（如工资、租金、水电费）。OpEx 在发生当期直接计入费用，不影响资产负债表。项目决策时需区分 CapEx 和 OpEx。',
        related: ['CapEx', '运营成本', '预算'],
        knowledgeNode: 'domain-finance',
      },
      {
        abbr: 'BCR',
        fullEn: 'Benefit-Cost Ratio',
        fullZh: '效益成本比',
        formula: 'BCR = 项目总收益 ÷ 项目总成本',
        explanation: '项目收益与成本的比例。BCR > 1 表示收益大于成本，项目值得投资。BCR 不考虑货币时间价值。',
        related: ['ROI', 'NPV', '成本效益分析'],
        knowledgeNode: 'domain-finance',
      },
    ],
  },

  'agile': {
    id: 'agile',
    label: '敏捷',
    icon: '🔄',
    terms: [
      {
        abbr: 'WIP',
        fullEn: 'Work in Progress',
        fullZh: '在制品',
        formula: null,
        explanation: '团队当前正在进行但尚未完成的工作项数量。限制 WIP 是看板方法的核心原则，通过减少多任务切换提高流动效率和交付速度。利特尔法则：周期时间 = WIP ÷ 吞吐率。',
        related: ['看板', 'CFD', '利特尔法则'],
        knowledgeNode: 'agile-kanban',
      },
      {
        abbr: 'TDD',
        fullEn: 'Test-Driven Development',
        fullZh: '测试驱动开发',
        formula: '红 → 绿 → 重构 循环',
        explanation: '先编写失败的测试用例，再编写使之通过的最小代码，最后重构优化。TDD 确保代码可测试、高内聚，是极限编程的核心实践。',
        related: ['BDD', 'ATDD', 'XP', '单元测试'],
        knowledgeNode: 'agile-practices',
      },
      {
        abbr: 'BDD',
        fullEn: 'Behavior-Driven Development',
        fullZh: '行为驱动开发',
        formula: 'Given-When-Then 格式',
        explanation: '基于用户故事的行为描述来驱动开发，使用自然语言（Gherkin 语法）编写可执行的需求规格。BDD 架起业务人员与开发人员之间的沟通桥梁。',
        related: ['TDD', 'ATDD', '用户故事'],
        knowledgeNode: 'agile-practices',
      },
      {
        abbr: 'ATDD',
        fullEn: 'Acceptance Test-Driven Development',
        fullZh: '验收测试驱动开发',
        formula: null,
        explanation: '在开发开始前，由客户、开发者和测试人员共同定义验收测试标准，开发以通过这些验收测试为目标。ATDD 确保团队对"完成"有一致理解。',
        related: ['TDD', 'BDD', 'DoD', '验收标准'],
        knowledgeNode: 'agile-practices',
      },
      {
        abbr: 'CFD',
        fullEn: 'Cumulative Flow Diagram',
        fullZh: '累积流图',
        formula: null,
        explanation: '一种可视化工具，显示各工作状态（待办/进行中/已完成）下工作项数量的堆叠面积图。CFD 用于识别瓶颈、预测交付时间和衡量 WIP 的稳定性。',
        related: ['WIP', '看板', '周期时间', '吞吐率'],
        knowledgeNode: 'agile-kanban',
      },
      {
        abbr: 'XP',
        fullEn: 'eXtreme Programming',
        fullZh: '极限编程',
        formula: null,
        explanation: '一种强调技术卓越的敏捷开发方法。核心实践包括：结对编程、持续集成、TDD、小版本发布、简单设计、编码标准等。XP 适用于需求变化频繁的项目。',
        related: ['TDD', 'Scrum', '持续集成', '结对编程'],
        knowledgeNode: 'agile-practices',
      },
      {
        abbr: 'PO',
        fullEn: 'Product Owner',
        fullZh: '产品负责人',
        formula: null,
        explanation: 'Scrum 三大角色之一，负责最大化产品价值。PO 管理 Product Backlog，定义优先级，确保团队做"正确的事"。PO 是一个人而非一个委员会。',
        related: ['SM', 'Scrum', 'Product Backlog'],
        knowledgeNode: 'agile-scrum',
      },
      {
        abbr: 'SM',
        fullEn: 'Scrum Master',
        fullZh: '敏捷教练（Scrum Master）',
        formula: null,
        explanation: 'Scrum 三大角色之一，负责确保 Scrum 被理解和实施。SM 是仆人式领导者，帮助团队消除障碍、促进协作、持续改进。SM 不是传统的"项目经理"。',
        related: ['PO', 'Scrum', '仆人式领导'],
        knowledgeNode: 'agile-scrum',
      },
    ],
  },

  'communication': {
    id: 'communication',
    label: '沟通',
    icon: '💬',
    terms: [
      {
        abbr: '沟通渠道',
        fullEn: 'Communication Channels',
        fullZh: '沟通渠道数',
        formula: '沟通渠道数 = n(n − 1) ÷ 2',
        explanation: '计算项目团队中潜在沟通渠道数量的公式。n 为项目利益相关方（含项目经理）的数量。随着人数增加，沟通渠道呈 O(n²) 级别增长，沟通管理的重要性也随之增加。',
        related: ['干系人管理', '沟通管理计划', 'RACI'],
        knowledgeNode: 'domain-stakeholder',
      },
    ],
  },
};

// 定义分类顺序
const CATEGORY_ORDER = ['evm', 'schedule', 'quality', 'risk', 'resource', 'governance', 'finance', 'agile', 'communication'];

// 合并所有术语为扁平数组（用于搜索）
function getAllTerms() {
  const allTerms = [];
  for (const catId of CATEGORY_ORDER) {
    const cat = GLOSSARY_DATA[catId];
    if (!cat) continue;
    for (const term of cat.terms) {
      allTerms.push({ ...term, categoryId: catId, categoryLabel: cat.label, categoryIcon: cat.icon });
    }
  }
  return allTerms;
}

// 知识节点映射：将术语缩写映射到知识图谱节点ID
const KNOWLEDGE_NODE_ALIASES = {
  'domain-finance': ['EVM', 'PV', 'EV', 'AC', 'SV', 'CV', 'SPI', 'CPI', 'BAC', 'EAC', 'ETC', 'TCPI', 'ROI', 'NPV', 'IRR', 'BCR', 'CapEx', 'OpEx'],
  'domain-schedule': ['CPM', 'PERT', 'SD'],
  'domain-scope': ['WBS'],
  'domain-quality': ['COQ', 'QA', 'QC'],
  'domain-risk': ['EMV', 'RBS', 'SWOT', 'PESTLE'],
  'domain-resource': ['RACI', 'Tuckman'],
  'domain-governance': ['CCB', 'SMART'],
  'domain-stakeholder': ['沟通渠道'],
  'agile-scrum': ['SM', 'PO', 'DoD'],
  'agile-kanban': ['WIP', 'CFD'],
  'agile-practices': ['TDD', 'BDD', 'ATDD', 'XP'],
};

const Glossary = {
  activeCategory: 'all',
  searchQuery: '',

  async render() {
    this.activeCategory = 'all';
    this.searchQuery = '';

    return `
      <div class="glossary-page">
        <div class="page-header">
          <h2>📖 术语词汇表</h2>
          <p class="page-desc">PMP 考试核心术语速查 —— 按类别浏览或搜索，点击关联知识点可跳转到学习页</p>
        </div>

        <!-- 搜索栏 -->
        <div class="glossary-search-wrap">
          <div class="glossary-search-bar">
            <span class="search-icon">🔍</span>
            <input
              type="text"
              id="glossarySearch"
              class="glossary-search-input"
              placeholder="搜索术语（输入缩写、英文或中文关键词）..."
              oninput="window._gSearch(this.value)"
            />
            <span id="glossaryResultCount" class="search-count"></span>
          </div>
        </div>

        <!-- 分类标签 -->
        <div class="glossary-tabs" id="glossaryTabs">
          <button class="glossary-tab active" data-cat="all" onclick="window._gFilter('all', this)">
            📋 全部
          </button>
          ${CATEGORY_ORDER.map(catId => {
            const cat = GLOSSARY_DATA[catId];
            return `
              <button class="glossary-tab" data-cat="${catId}" onclick="window._gFilter('${catId}', this)">
                ${cat.icon} ${cat.label}
              </button>
            `;
          }).join('')}
        </div>

        <!-- 术语卡片列表 -->
        <div class="glossary-list" id="glossaryList">
          ${this._renderTermCards(this.activeCategory, this.searchQuery)}
        </div>

        <!-- 统计提示 -->
        <div class="glossary-footer">
          <span>共收录 <strong>${getAllTerms().length}</strong> 个术语 · ${CATEGORY_ORDER.length} 个分类</span>
        </div>
      </div>
    `;
  },

  /** 渲染术语卡片 */
  _renderTermCards(category, query) {
    let terms = getAllTerms();

    // 按分类筛选
    if (category && category !== 'all') {
      terms = terms.filter(t => t.categoryId === category);
    }

    // 按搜索词筛选
    if (query && query.trim()) {
      const q = query.trim().toLowerCase();
      terms = terms.filter(t =>
        t.abbr.toLowerCase().includes(q) ||
        t.fullEn.toLowerCase().includes(q) ||
        t.fullZh.includes(q) ||
        t.explanation.toLowerCase().includes(q) ||
        (t.formula && t.formula.toLowerCase().includes(q))
      );
    }

    // 如果筛选后为空
    if (terms.length === 0) {
      return `
        <div class="empty-state" style="padding:40px;">
          <div style="font-size:48px;">🔍</div>
          <h3>未找到匹配的术语</h3>
          <p style="color:var(--color-text2);">尝试使用其他关键词搜索，或切换分类</p>
          <button class="btn btn-secondary btn-sm" style="margin-top:12px;" onclick="window._gSearchInput().value='';window._gSearch('');">
            清除搜索
          </button>
        </div>
      `;
    }

    // 按分类分组
    const grouped = {};
    for (const t of terms) {
      if (!grouped[t.categoryId]) grouped[t.categoryId] = { label: t.categoryLabel, icon: t.categoryIcon, terms: [] };
      grouped[t.categoryId].terms.push(t);
    }

    // 渲染分组卡片
    let html = '';
    for (const catId of CATEGORY_ORDER) {
      const group = grouped[catId];
      if (!group) continue;

      html += `
        <div class="glossary-category-section">
          <h3 class="glossary-category-title">${group.icon} ${group.label}</h3>
          <div class="glossary-cards-grid">
            ${group.terms.map(t => this._renderSingleCard(t)).join('')}
          </div>
        </div>
      `;
    }

    // 更新搜索结果计数
    setTimeout(() => {
      const countEl = document.getElementById('glossaryResultCount');
      if (countEl) {
        countEl.textContent = query && query.trim() ? `找到 ${terms.length} 个术语` : '';
      }
    }, 50);

    return html;
  },

  /** 渲染单个术语卡片 */
  _renderSingleCard(term) {
    const hasFormula = term.formula && term.formula.trim();
    const hasRelated = term.related && term.related.length > 0;

    return `
      <div class="glossary-card" id="glossary-${term.abbr}">
        <div class="glossary-card-header">
          <div class="glossary-abbr">${term.abbr}</div>
          <div class="glossary-names">
            <div class="glossary-full-en">${term.fullEn}</div>
            <div class="glossary-full-zh">${term.fullZh}</div>
          </div>
          <span class="glossary-cat-tag">${term.categoryIcon} ${term.categoryLabel}</span>
        </div>

        <div class="glossary-card-body">
          <p class="glossary-explanation">${term.explanation}</p>

          ${hasFormula ? `
            <div class="glossary-formula-box">
              <span class="formula-label">📐 公式</span>
              <code class="glossary-formula">${term.formula}</code>
            </div>
          ` : ''}
        </div>

        <div class="glossary-card-footer">
          ${hasRelated ? `
            <div class="glossary-related">
              <span class="related-label">🔗 关联术语：</span>
              ${term.related.map(r => `<span class="related-tag" onclick="window._gJumpTerm('${r.replace(/'/g, "\\'")}')">${r}</span>`).join('')}
            </div>
          ` : ''}
          ${term.knowledgeNode ? `
            <button class="btn btn-sm btn-outline glossary-learn-btn" onclick="window._nav('/learn?node=${term.knowledgeNode}')" title="去学习页查看相关知识">
              📖 关联知识 →
            </button>
          ` : ''}
        </div>
      </div>
    `;
  },

  /** 筛选分类 */
  filterCategory(categoryId) {
    this.activeCategory = categoryId;
    const list = document.getElementById('glossaryList');
    if (list) {
      list.innerHTML = this._renderTermCards(categoryId, this.searchQuery);
      // 滚动到顶部
      list.scrollTop = 0;
    }
    // 更新标签激活状态
    document.querySelectorAll('.glossary-tab').forEach(tab => {
      tab.classList.toggle('active', tab.dataset.cat === categoryId);
    });
  },

  /** 搜索过滤 */
  filterSearch(query) {
    this.searchQuery = query || '';
    const list = document.getElementById('glossaryList');
    if (list) {
      list.innerHTML = this._renderTermCards(this.activeCategory, this.searchQuery);
    }
  },

  /** 跳转到某个术语（滚动并高亮） */
  jumpToTerm(abbr) {
    const card = document.getElementById('glossary-' + abbr);
    if (card) {
      card.scrollIntoView({ behavior: 'smooth', block: 'center' });
      card.classList.add('glossary-card-highlight');
      setTimeout(() => card.classList.remove('glossary-card-highlight'), 2000);
    } else {
      // 如果术语不在当前视图中，先切换到"全部"分类
      this.filterCategory('all');
      this.filterSearch('');
      // 重新搜索
      const input = document.getElementById('glossarySearch');
      if (input) {
        input.value = abbr;
        setTimeout(() => {
          this.filterSearch(abbr);
          const card2 = document.getElementById('glossary-' + abbr);
          if (card2) {
            card2.scrollIntoView({ behavior: 'smooth', block: 'center' });
            card2.classList.add('glossary-card-highlight');
            setTimeout(() => card2.classList.remove('glossary-card-highlight'), 2000);
          }
        }, 150);
      }
    }
  },

  /** 渲染后的初始化 */
  afterRender() {
    // 使标签栏有横向滚动时初始位置可见
    const tabs = document.getElementById('glossaryTabs');
    if (tabs) {
      tabs.scrollLeft = 0;
    }
  },
};

// ===== 全局函数 =====
window._gFilter = (catId, el) => {
  Glossary.filterCategory(catId);
  if (el) {
    el.parentElement.querySelectorAll('.glossary-tab').forEach(t => t.classList.remove('active'));
    el.classList.add('active');
  }
};

window._gSearch = (query) => {
  Glossary.filterSearch(query);
};

window._gSearchInput = () => document.getElementById('glossarySearch');

window._gJumpTerm = (abbr) => {
  Glossary.jumpToTerm(abbr);
};

export default Glossary;
