// ===== PMBOK 第8版 知识图谱完整数据 =====
// 6原则 + 7域 + 5关注领域 + 43过程(含3采购) + 15敏捷概念
// 共 127 个知识单元 · 76个独立节点

const KNOWLEDGE_NODES = [];

// ===== Helper =====
let _nid = 0;
function node(type, id, zh, en, parentId, opts = {}) {
  _nid++;
  return {
    _index: _nid,
    id,
    type, // 'principle' | 'domain' | 'focus_area' | 'process' | 'agile_concept'
    name: { zh, en },
    description: { zh: opts.desc || '', en: opts.descEn || '' },
    parentId: parentId || null,
    relatedIds: opts.related || [],
    examTips: { zh: opts.tips || '', en: opts.tipsEn || '' },
    order: opts.order || _nid,
    domain: opts.domain || null,
    focusArea: opts.focusArea || null,
    itto: opts.itto || null,       // { inputs: [], tools: [], outputs: [] }
    priority: opts.priority || 2,  // 1=核心 2=重要 3=基础
    weight: opts.weight || 1,      // 学习进度权重
  };
}

// ============================================================
// PART 1: 6 大项目管理原则 (Principles)
// ============================================================
const P_GLOBAL = 'principle-global-view';
const P_VALUE = 'principle-focus-value';
const P_QUALITY = 'principle-quality';
const P_LEADER = 'principle-responsible-leader';
const P_SUSTAIN = 'principle-sustainability';
const P_CULTURE = 'principle-empower-culture';

KNOWLEDGE_NODES.push(
  node('principle', P_GLOBAL, '采用整体视角', 'Adopt a Holistic View', null, {
    desc: '在理解和管理项目时，将所有组件及其相互依赖关系作为更大系统的一部分进行考量。与系统思维理念契合，帮助项目经理把握整体状况和不同项目组件之间的联系，精确定位挑战的根本原因并高效应对。',
    tips: '考试重点：该原则与所有7个绩效域都相互作用。在情景题中，当项目出现跨领域问题时，应选择「整体视角」的思维模式。',
    priority: 2, weight: 1,
  }),
  node('principle', P_VALUE, '聚焦于价值', 'Focus on Value', null, {
    desc: '价值是衡量项目最终成功的核心指标。通过可衡量指标（如ROI）或定性观察（如客户口碑）来评估。该原则旨在为客户、执行组织和其他利益相关方实现项目投资回报的最大化。当项目难以实现预期价值时，终止项目可能是最佳选择。',
    tips: '考试重点：区分「可交付物」和「预期成果」。聚焦于价值意味着关注成果而非仅仅是输出的完成。业务论证是价值决策的核心文件。',
    priority: 1, weight: 1,
  }),
  node('principle', P_QUALITY, '将质量融入过程和可交付物', 'Embed Quality in Processes and Deliverables', null, {
    desc: '质量是项目可交付物或过程的一系列固有特性满足或超出项目预期目标的程度。涵盖绩效、符合性、可靠性、韧性、满意度、一致性、效率、可持续性、合规性九个维度。持续改进和消除浪费是质量融入过程的基础。',
    tips: '考试重点：DoD(完成定义)是敏捷中质量的关键概念。预防胜于检查——质量是「融入」而非「检查出来」的。',
    priority: 2, weight: 1,
  }),
  node('principle', P_LEADER, '成为负责任的领导者', 'Be a Responsible Leader', null, {
    desc: '负责任的领导力的核心在于勇于担当——对项目的既定业务目标以及所采取的行动和决策负责。关键特征：诚信正直公正、自我认知、尊重谦逊开放、灵活性和适应性、共享领导力。领导力有别于职权——职权是组织授予的控制权，领导力是通过以身作则来激励和鼓舞他人。',
    tips: '考试重点：仆人式领导是敏捷环境中的核心理念。项目经理需要根据情境调整领导力风格。情商(Emotional Intelligence)是领导者化解冲突和压力的关键能力。',
    priority: 1, weight: 1,
  }),
  node('principle', P_SUSTAIN, '将可持续性融入所有项目领域', 'Integrate Sustainability into All Project Areas', null, {
    desc: '既满足当前需要，也不损害子孙后代满足其自身需要的能力。遵循三重底线原则——在社会公平、环境保护和经济繁荣之间实现平衡。策略按影响程度递增：补偿负面后果 → 减轻负面后果 → 完全避免负面后果。',
    tips: '考试重点：可持续性金字塔（补偿→减轻→避免）。三重底线：人(People)、利润(Profit)、地球(Planet)。可持续性不仅是环境问题，也包括社会公平和经济可持续。',
    priority: 3, weight: 1,
  }),
  node('principle', P_CULTURE, '构建赋能型文化', 'Build an Empowering Culture', null, {
    desc: '培育赋能型项目文化需要建立信任、明确角色职责、制定团队协议和指导流程。关键领域：多元化、流程定义、人际关系技能、组织结构知识、团队协议。远程团队和虚拟团队面临更大挑战，赋能型文化有助于主动化解分歧、管理冲突。',
    tips: '考试重点：团队协议应在项目开始时制定。多元化团队能汇集不同观点。T型人才（通才型专家）在敏捷团队中更受青睐。',
    priority: 2, weight: 1,
  })
);

// ============================================================
// PART 2: 7 大绩效域 (Performance Domains)
// ============================================================
const D_GOVERNANCE = 'domain-governance';
const D_SCOPE = 'domain-scope';
const D_SCHEDULE = 'domain-schedule';
const D_FINANCE = 'domain-finance';
const D_STAKEHOLDER = 'domain-stakeholder';
const D_RESOURCE = 'domain-resource';
const D_RISK = 'domain-risk';

KNOWLEDGE_NODES.push(
  node('domain', D_GOVERNANCE, '治理', 'Governance', null, {
    desc: '治理由框架、职能和过程组成，用于指导项目管理的决策和活动，以优化项目的价值交付。包含战略一致性、决策制定与变更、项目成功标准相关的整合管理要素。治理贯穿整个项目生命周期。',
    tips: '🚨 最重要绩效域！9个过程覆盖启动到收尾全流程。变更控制流程是PMP最爱考的场景。治理不是一次性活动，从启动到收尾持续进行。',
    priority: 1, weight: 3,
  }),
  node('domain', D_SCOPE, '范围', 'Scope', null, {
    desc: '范围在项目管理中具有独特且核心的地位。包括确保项目涵盖成功完成所需的全部工作（且仅必要工作）所需的过程。同时关注质量——确保可交付物符合验收标准，过程既有效又高效。质量被视为范围的内在属性。',
    tips: '考试重点：范围说明书 vs 项目章程的区别（范围说明书详细描述可交付物和验收标准）。WBS是PMBOK最核心的工具之一。确认范围（客户验收）vs 控制范围（防止范围蔓延）要区分清楚。',
    priority: 1, weight: 2,
  }),
  node('domain', D_SCHEDULE, '进度', 'Schedule', null, {
    desc: '项目进度计划提供了项目如何以及何时交付产品、服务和结果的详细计划。进度计划作为协调和管理利益相关方期望的工具，并为绩效报告提供基础。同时有助于主动识别潜在的延误和风险。',
    tips: '考试重点：关键路径法(CPM)是必考内容。进度压缩两大方法——赶工(Crashing，加资源)和快速跟进(Fast Tracking，并行执行)。SPI=EV/PV是衡量进度效率的核心公式。',
    priority: 2, weight: 2,
  }),
  node('domain', D_FINANCE, '财务', 'Finance', null, {
    desc: '涉及与执行组织内部和外部货币资源的使用和分配相关的过程与工具。包括规划、估算、预算制定、融资、筹资、管理、测量和成本控制。不仅关注成本管理，更致力于确保项目为组织交付最大价值。',
    tips: '考试重点：挣值管理(EVM)公式必背——SV/CV/SPI/CPI/TCPI。应急储备(已知风险)vs管理储备(未知风险)。成本基准=项目预算-管理储备。',
    priority: 2, weight: 2,
  }),
  node('domain', D_STAKEHOLDER, '利益相关方', 'Stakeholders', null, {
    desc: '涉及利益相关方参与的过程和工具，覆盖从识别利益相关方到监督其在整个项目生命周期中参与度的全过程。发起人、团队成员以及所有受项目影响或自认为受项目影响的人都是利益相关方。与沟通管理紧密相关。',
    tips: '考试重点：权力/利益方格是识别和分析干系人的核心工具。沟通渠道数=n(n-1)/2。干系人参与度评估矩阵（不知晓/抵制/中立/支持/领导）。People板块占考试42%，必须吃透！',
    priority: 1, weight: 3,
  }),
  node('domain', D_RESOURCE, '资源', 'Resources', null, {
    desc: '关注项目团队如何有效且高效地规划和使用可用资源。涵盖人力资源（项目团队）和实物或虚拟资源（设备、材料、设施、软件等）。还包括资源可用性、利用率和维护。',
    tips: '考试重点：Tuckman团队发展阶段模型（形成/震荡/规范/成熟/解散）。冲突解决5种方式（合作/妥协/缓和/强制/回避）。RACI矩阵。虚拟团队需要更多沟通。',
    priority: 1, weight: 2,
  }),
  node('domain', D_RISK, '风险', 'Risk', null, {
    desc: '涵盖风险管理规划、风险识别、风险分析、风险应对规划、风险应对实施和风险监督所需的所有过程。目标是增加正面风险（机会）的概率和影响，同时降低负面风险（威胁）的概率和影响。',
    tips: '考试重点：威胁5策略（上报/规避/转移/减轻/接受）和机会5策略（上报/利用/分享/增强/接受）。定性分析（概率影响矩阵）vs定量分析（蒙特卡洛模拟、决策树）。SWOT是识别风险的重要工具。',
    priority: 1, weight: 3,
  })
);

// ============================================================
// PART 3: 5 大关注领域 (Focus Areas, 原过程组)
// ============================================================
KNOWLEDGE_NODES.push(
  node('focus_area', 'focus-initiating', '启动', 'Initiating', null, {
    desc: '定义一个新项目或现有项目的一个新阶段，授权开始该项目或阶段的一组过程。包含2个过程：启动项目或阶段、识别利益相关方。',
    tips: '启动阶段的核心产出是项目章程和干系人登记册。项目章程由发起人签发，授权项目经理动用资源。',
    priority: 1, weight: 1,
  }),
  node('focus_area', 'focus-planning', '规划', 'Planning', null, {
    desc: '明确项目范围，优化目标，为实现目标制定行动方案的一组过程。包含19个过程，是最大的关注领域。',
    tips: '规划不是一次性活动——在敏捷中通过滚动式规划渐进明细。项目管理计划整合所有子计划。',
    priority: 1, weight: 1,
  }),
  node('focus_area', 'focus-executing', '执行', 'Executing', null, {
    desc: '完成项目管理计划中确定的工作，以满足项目要求的一组过程。包含8个过程。',
    tips: '执行阶段产出的是工作绩效数据，监控阶段将其转化为工作绩效信息。',
    priority: 1, weight: 1,
  }),
  node('focus_area', 'focus-monitoring', '监控', 'Monitoring & Controlling', null, {
    desc: '跟踪、审查和调整项目进展与绩效，识别必要的计划变更并启动相应变更的一组过程。包含10个过程。',
    tips: '监控贯穿整个项目生命周期。变更请求是监控阶段的关键输出。',
    priority: 1, weight: 1,
  }),
  node('focus_area', 'focus-closing', '收尾', 'Closing', null, {
    desc: '正式完成或结束项目、阶段或合同所执行的过程。包含1个过程：结束项目或阶段。',
    tips: '收尾不仅发生在项目结束时——每个阶段结束时也需要收尾。必须归档经验教训。',
    priority: 2, weight: 1,
  })
);

// ============================================================
// PART 4: 40 项目管理过程 (Processes)
// ============================================================

// ----- 治理域 (9 processes) -----
(function() {
  const dom = D_GOVERNANCE;
  const related = [D_SCOPE, D_SCHEDULE, D_FINANCE, D_STAKEHOLDER, D_RESOURCE, D_RISK];

  KNOWLEDGE_NODES.push(
    node('process', 'proc-start-project', '启动项目或阶段', 'Start Project or Phase', dom, {
      desc: '正式授权项目启动，创建将项目与业务目标联系起来的文件（项目章程）。定义项目的高层级范围、总体预算、关键干系人和项目经理任命。',
      tips: '🥇 必考！项目章程由发起人签发，不是项目经理写的但项目经理可以参与起草。章程的核心要素：项目目的、高层级需求、总体预算、关键干系人、项目经理职权。',
      domain: 'governance', focusArea: 'initiating', priority: 1, weight: 3,
      related: [D_SCOPE, D_STAKEHOLDER, 'proc-identify-stakeholders'],
      itto: { inputs: ['商业论证', '协议', '事业环境因素', '组织过程资产'], tools: ['专家判断', '数据收集', '人际关系与团队技能', '会议'], outputs: ['项目章程', '假设日志'] },
    }),
    node('process', 'proc-integrate-plan', '整合与对齐项目计划', 'Integrate & Align Project Plans', dom, {
      desc: '整合并协调所有绩效域的规划组件，形成统一的项目管理计划。确保各子计划之间的一致性和连贯性。',
      tips: '项目管理计划不是一份单一文件，而是所有子计划的集合体。在敏捷中，这对应着产品愿景和发布计划的整合。',
      domain: 'governance', focusArea: 'planning', priority: 1, weight: 2,
      related: ['proc-define-scope', 'proc-develop-schedule', 'proc-develop-budget'],
      itto: { inputs: ['项目章程', '其他过程的输出', '事业环境因素', '组织过程资产'], tools: ['专家判断', '数据收集', '人际关系与团队技能', '会议'], outputs: ['项目管理计划'] },
    }),
    node('process', 'proc-plan-resource-acquisition', '规划资源获取策略', 'Plan Resource Acquisition Strategy', dom, {
      desc: '基于文化、专业知识、能力、风险和价值主张，确定项目组件使用内部还是外部资源。包括自制或外购决策。',
      tips: '与采购管理紧密相关。核心决策：make-or-buy分析。考虑因素：战略重要性、成本、风险、时间。',
      domain: 'governance', focusArea: 'planning', priority: 2, weight: 1,
      related: [D_RESOURCE, D_FINANCE, D_RISK],
      itto: { inputs: ['项目章程', '项目管理计划', '项目文件', '事业环境因素', '组织过程资产'], tools: ['专家判断', '数据分析', '自制或外购分析', '供方选择分析', '会议'], outputs: ['资源获取策略计划', '供方选择标准', '自制或外购决策'] },
    }),
    node('process', 'proc-manage-execution', '管理项目执行', 'Manage Project Execution', dom, {
      desc: '指导和执行整合项目计划中定义的工作。包括管理资源、问题、风险和变更，确保项目按计划推进。',
      tips: '执行阶段的项目经理角色从规划者转变为协调者和问题解决者。产出工作绩效数据。',
      domain: 'governance', focusArea: 'executing', priority: 1, weight: 2,
      related: ['proc-manage-quality', 'proc-manage-knowledge', 'proc-implement-risk-response'],
      itto: { inputs: ['项目管理计划', '项目文件', '批准的变更请求', '事业环境因素', '组织过程资产'], tools: ['专家判断', '项目管理信息系统', '会议'], outputs: ['可交付物', '工作绩效数据', '问题日志', '变更请求'] },
    }),
    node('process', 'proc-manage-quality', '管理质量保证', 'Manage Quality Assurance', dom, {
      desc: '通过计划、系统化的质量活动，确保过程按照利益相关方期望执行。关注过程质量而非产品检验。',
      tips: '管理质量 = 质量保证（QA），关注过程。控制质量 = 质量控制（QC），关注产品。成本效益分析、质量成本。',
      domain: 'governance', focusArea: 'executing', priority: 2, weight: 1,
      related: [D_SCOPE, 'proc-control-quality'],
      itto: { inputs: ['质量管理计划', '质量度量指标', '质量控制测量结果', '项目文件'], tools: ['数据收集', '数据分析', '决策', '质量审计', '过程分析'], outputs: ['质量报告', '测试与评估文件', '变更请求'] },
    }),
    node('process', 'proc-manage-knowledge', '管理项目知识', 'Manage Project Knowledge', dom, {
      desc: '利用现有知识（包括经验教训）并创造新知识以实现项目目标。显性知识（可编码）和隐性知识（通过互动分享）。',
      tips: '知识管理工具：经验教训登记册、实践社区(CoP)、工作见习、故事讲述。隐性知识通过互动传递。',
      domain: 'governance', focusArea: 'executing', priority: 2, weight: 1,
      related: [D_RESOURCE, 'proc-close-project'],
      itto: { inputs: ['项目管理计划', '项目文件', '可交付物', '事业环境因素', '组织过程资产'], tools: ['专家判断', '知识管理工具', '信息管理工具', '人际关系与团队技能'], outputs: ['经验教训登记册', '项目管理计划更新', '组织过程资产更新'] },
    }),
    node('process', 'proc-monitor-performance', '监控项目绩效', 'Monitor Project Performance', dom, {
      desc: '跟踪、审查和报告整体项目进展，对照绩效目标进行评估。使用挣值管理(EVM)等工具。',
      tips: '🥇 EVM必考！SV=EV-PV、CV=EV-AC、SPI=EV/PV、CPI=EV/AC。TCPI=(BAC-EV)/(BAC-AC)表示剩余工作的效率要求。',
      domain: 'governance', focusArea: 'monitoring', priority: 1, weight: 3,
      related: [D_SCHEDULE, D_FINANCE, 'proc-monitor-schedule', 'proc-monitor-finance'],
      itto: { inputs: ['项目管理计划', '项目文件', '工作绩效数据', '协议', '事业环境因素', '组织过程资产'], tools: ['专家判断', '数据分析', '决策', '会议'], outputs: ['工作绩效报告', '变更请求'] },
    }),
    node('process', 'proc-evaluate-change', '评估与实施变更', 'Evaluate & Implement Changes', dom, {
      desc: '管理影响项目各方面的变更，在整个项目生命周期中调整计划。变更控制委员会(CCB)审批变更。',
      tips: '🚨 最常考！变更控制流程：识别变更→评估影响→提交变更请求→CCB审批→更新计划→实施→验证。永远不能跳过流程直接实施变更！',
      domain: 'governance', focusArea: 'monitoring', priority: 1, weight: 4,
      related: ['proc-monitor-performance', D_SCOPE, D_SCHEDULE, D_FINANCE],
      itto: { inputs: ['项目管理计划', '变更请求', '工作绩效数据', '组织过程资产'], tools: ['专家判断', '变更控制工具', '数据分析', '决策', '会议'], outputs: ['批准的变更请求', '项目管理计划更新', '项目文件更新'] },
    }),
    node('process', 'proc-close-project', '结束项目或阶段', 'Close Project or Phase', dom, {
      desc: '最终完成所有项目/阶段活动，归档知识，完成计划工作，释放资源。确保所有可交付物移交并获得正式验收。',
      tips: '收尾≠结束——每个阶段结束时也需要收尾。必须发布最终报告和归档经验教训。行政收尾和合同收尾都要完成。',
      domain: 'governance', focusArea: 'closing', priority: 2, weight: 2,
      related: ['proc-manage-knowledge', D_STAKEHOLDER],
      itto: { inputs: ['项目管理计划', '项目文件', '验收的可交付物', '商业文件', '协议', '采购文档', '组织过程资产'], tools: ['专家判断', '数据分析', '会议'], outputs: ['最终产品/服务/结果移交', '最终报告', '组织过程资产更新'] },
    })
  );
})();

// ----- 范围域 (6 processes) -----
(function() {
  const dom = D_SCOPE;
  KNOWLEDGE_NODES.push(
    node('process', 'proc-plan-scope-mgmt', '规划范围管理', 'Plan Scope Management', dom, {
      desc: '创建范围管理计划，记录如何定义、验证和控制项目范围和产品范围。',
      tips: '范围管理计划是项目管理计划的子计划之一。明确需求管理和范围变更的流程。',
      domain: 'scope', focusArea: 'planning', priority: 2, weight: 1,
      related: [D_GOVERNANCE],
      itto: { inputs: ['项目章程', '项目管理计划', '事业环境因素', '组织过程资产'], tools: ['专家判断', '数据分析', '会议'], outputs: ['范围管理计划', '需求管理计划'] },
    }),
    node('process', 'proc-elicit-requirements', '启发并分析需求', 'Elicit & Analyze Requirements', dom, {
      desc: '识别、记录和管理利益相关方的需求和期望，以实现项目目标。使用访谈、焦点小组、问卷、原型等多种方法。',
      tips: '需求管理计划 + 需求跟踪矩阵是关键输出。需求类型：业务需求、干系人需求、解决方案需求、过渡需求。',
      domain: 'scope', focusArea: 'planning', priority: 2, weight: 1,
      related: [D_STAKEHOLDER, 'proc-define-scope'],
      itto: { inputs: ['项目章程', '项目管理计划', '项目文件', '协议', '事业环境因素', '组织过程资产'], tools: ['专家判断', '数据收集（访谈/焦点小组/问卷/标杆对照）', '数据分析', '决策', '人际关系与团队技能', '原型法'], outputs: ['需求文件', '需求跟踪矩阵'] },
    }),
    node('process', 'proc-define-scope', '定义范围', 'Define Scope', dom, {
      desc: '制定项目和产品的详细或高层级描述，包括质量要求和验收标准。范围说明书详细描述了可交付物、验收标准和项目除外责任。',
      tips: '🥇 范围说明书≠项目章程！范围说明书更详细，包含：产品范围描述、可交付物、验收标准、项目除外责任。章程更侧重于授权和高层级信息。',
      domain: 'scope', focusArea: 'planning', priority: 1, weight: 2,
      related: ['proc-start-project', 'proc-develop-scope-structure'],
      itto: { inputs: ['项目章程', '项目管理计划', '项目文件', '需求文件', '事业环境因素', '组织过程资产'], tools: ['专家判断', '产品分析', '备选方案分析', '引导'], outputs: ['项目范围说明书', '项目文件更新'] },
    }),
    node('process', 'proc-develop-scope-structure', '制定范围结构', 'Develop Scope Structure', dom, {
      desc: '将项目可交付物和工作细分为更小、更易管理的组件（如WBS或产品待办事项列表）。WBS是PMBOK最核心的工具。',
      tips: 'WBS的底层是工作包(Work Package)。WBS是后续估算、进度计划、风险识别的基础。100%原则——WBS必须包含所有工作。',
      domain: 'scope', focusArea: 'planning', priority: 1, weight: 2,
      related: ['proc-define-scope', D_SCHEDULE, D_FINANCE],
      itto: { inputs: ['项目管理计划', '项目文件', '需求文件', '项目范围说明书', '事业环境因素', '组织过程资产'], tools: ['专家判断', '分解'], outputs: ['范围基准', '项目文件更新'] },
    }),
    node('process', 'proc-monitor-scope', '监控范围', 'Monitor Scope', dom, {
      desc: '监督项目和产品范围状态，管理范围基准变更，衡量可交付物质量，确保标准得到满足。防止范围蔓延和镀金。',
      tips: '范围蔓延(Scope Creep) = 未经控制的变更。镀金(Gold Plating) = 主动添加超出需求的功能。两者都违背聚焦于价值的原则。',
      domain: 'scope', focusArea: 'monitoring', priority: 1, weight: 2,
      related: ['proc-evaluate-change', 'proc-validate-scope'],
      itto: { inputs: ['项目管理计划', '项目文件', '工作绩效数据', '组织过程资产'], tools: ['偏差分析', '趋势分析'], outputs: ['工作绩效信息', '变更请求', '项目管理计划更新', '项目文件更新'] },
    }),
    node('process', 'proc-validate-scope', '确认范围', 'Validate Scope', dom, {
      desc: '正式验收已完成的、核实的项目可交付物。由客户或发起人进行验收。',
      tips: '确认范围(Validate Scope) = 客户正式验收可交付物。控制质量(Control Quality) = 内部检查可交付物是否正确。顺序：先控制质量（内部），再确认范围（客户）。',
      domain: 'scope', focusArea: 'monitoring', priority: 2, weight: 2,
      related: ['proc-manage-quality', 'proc-close-project'],
      itto: { inputs: ['项目管理计划', '项目文件', '核实的可交付物', '工作绩效数据'], tools: ['检查', '决策'], outputs: ['验收的可交付物', '工作绩效信息', '变更请求'] },
    })
  );
})();

// ----- 进度域 (3 processes) -----
(function() {
  const dom = D_SCHEDULE;
  KNOWLEDGE_NODES.push(
    node('process', 'proc-plan-schedule-mgmt', '规划进度管理', 'Plan Schedule Management', dom, {
      desc: '建立用于设计、制定、管理、执行和维护进度计划的政策、程序和文档。',
      tips: '进度管理计划定义时间单位（小时/天/周）、进度模型、里程碑精度和进度控制阈值。',
      domain: 'schedule', focusArea: 'planning', priority: 2, weight: 1,
      related: [D_GOVERNANCE],
      itto: { inputs: ['项目章程', '项目管理计划', '事业环境因素', '组织过程资产'], tools: ['专家判断', '数据分析', '会议'], outputs: ['进度管理计划'] },
    }),
    node('process', 'proc-develop-schedule', '制订进度计划', 'Develop Schedule', dom, {
      desc: '创建项目进度模型输出，显示活动及其计划日期、持续时间、里程碑和资源分配。包含关键路径分析。',
      tips: '🥇 核心考点！关键路径法(CPM)：项目最长路径，决定最短工期。浮动时间=LS-ES=LF-EF。赶工(Crashing)=加资源加班，快速跟进(Fast Tracking)=并行执行。PERT三点估算:(O+4M+P)/6。',
      domain: 'schedule', focusArea: 'planning', priority: 1, weight: 3,
      related: ['proc-develop-scope-structure', D_FINANCE, D_RESOURCE],
      itto: { inputs: ['项目管理计划', '项目文件', '活动清单', '活动属性', '估算依据', '持续时间估算', '资源需求', '资源日历', '假设日志', '风险登记册', '协议', '事业环境因素', '组织过程资产'], tools: ['专家判断', '进度网络分析', '关键路径法', '资源优化', '数据分析', '进度压缩', '进度管理软件'], outputs: ['进度基准', '项目进度计划', '进度数据'] },
    }),
    node('process', 'proc-monitor-schedule', '监控进度', 'Monitor Schedule', dom, {
      desc: '监控进度状态，管理进度基准变更，确保项目按时完成。使用挣值管理中的SV和SPI评估进度偏差。',
      tips: 'SV>0=提前，SV<0=滞后，SPI>1=提前，SPI<1=滞后。迭代燃尽图是敏捷中监控进度的主要工具。',
      domain: 'schedule', focusArea: 'monitoring', priority: 2, weight: 1,
      related: ['proc-monitor-performance', 'proc-evaluate-change'],
      itto: { inputs: ['项目管理计划', '项目文件', '工作绩效数据', '组织过程资产'], tools: ['数据分析', '关键路径法', '项目管理信息系统', '资源优化', '进度压缩'], outputs: ['工作绩效信息', '进度预测', '变更请求', '项目管理计划更新'] },
    })
  );
})();

// ----- 财务域 (4 processes) -----
(function() {
  const dom = D_FINANCE;
  KNOWLEDGE_NODES.push(
    node('process', 'proc-plan-financial-mgmt', '规划财务管理', 'Plan Financial Management', dom, {
      desc: '定义如何估算、预算、管理和监控项目收入和支出。确定资金需求和财务控制方法。',
      tips: '财务/成本管理计划包含：计量单位、精确度、控制临界值、绩效测量规则、报告格式。',
      domain: 'finance', focusArea: 'planning', priority: 2, weight: 1,
      related: [D_GOVERNANCE],
      itto: { inputs: ['项目章程', '项目管理计划', '事业环境因素', '组织过程资产'], tools: ['专家判断', '数据分析', '会议'], outputs: ['财务管理计划'] },
    }),
    node('process', 'proc-estimate-costs', '估算成本', 'Estimate Costs', dom, {
      desc: '制定完成项目工作所需资源成本的近似估算。方法包括类比估算、参数估算、自下而上估算、三点估算。',
      tips: '类比估算（基于历史项目，粗略快速）vs参数估算（基于单位成本×数量）vs自下而上估算（汇总WBS底层，最精确）。应急储备包含在成本基准中，管理储备不包含。',
      domain: 'finance', focusArea: 'planning', priority: 2, weight: 2,
      related: ['proc-develop-schedule', 'proc-estimate-resources'],
      itto: { inputs: ['项目管理计划', '项目文件', '资源需求', '假设日志', '风险登记册', '经验教训登记册', '事业环境因素', '组织过程资产'], tools: ['专家判断', '类比估算', '参数估算', '自下而上估算', '三点估算', '数据分析', '项目管理信息系统', '决策'], outputs: ['成本估算', '估算依据', '项目文件更新'] },
    }),
    node('process', 'proc-develop-budget', '制定预算', 'Develop Budget', dom, {
      desc: '汇总活动或工作包的估算成本，建立经批准的成本基准。成本基准=总预算-管理储备。加上管理储备后为项目总资金需求。',
      tips: '🥇 成本基准 + 管理储备 = 项目预算。成本基准是批准的项目总预算时间分配，用于衡量和监控成本绩效。应急储备(Contingency Reserve)处理已知-未知风险，包含在成本基准中。管理储备(Management Reserve)处理未知-未知风险。***PMBOK 8th 特别指出:*** 管理储备由管理层控制，不在项目经理的权限范围内。',
      domain: 'finance', focusArea: 'planning', priority: 1, weight: 2,
      related: ['proc-develop-schedule', D_RISK],
      itto: { inputs: ['项目管理计划', '项目文件', '成本估算', '估算依据', '风险登记册', '协议', '事业环境因素', '组织过程资产'], tools: ['专家判断', '成本汇总', '数据分析', '历史信息审核', '资金限制平衡', '融资'], outputs: ['成本基准', '项目资金需求', '项目文件更新'] },
    }),
    node('process', 'proc-monitor-finance', '监控财务', 'Monitor Finances', dom, {
      desc: '监控项目财务状态，更新财务信息，管理成本基准变更，确保项目持续的财务可行性。核心工具是挣值管理(EVM)。',
      tips: 'EVM核心公式：PV(计划价值)、EV(挣值)、AC(实际成本)、SV=EV-PV、CV=EV-AC、SPI=EV/PV、CPI=EV/AC、TCPI=(BAC-EV)/(BAC-AC)。CPI>1节约，CPI<1超支。',
      domain: 'finance', focusArea: 'monitoring', priority: 1, weight: 2,
      related: ['proc-monitor-performance', 'proc-evaluate-change', 'proc-monitor-schedule'],
      itto: { inputs: ['项目管理计划', '项目文件', '工作绩效数据', '组织过程资产'], tools: ['专家判断', '数据分析', '挣值管理(EVM)', '预测', '储备分析'], outputs: ['工作绩效信息', '成本预测', '变更请求', '项目管理计划更新'] },
    })
  );
})();

// ----- 利益相关方域 (7 processes) -----
(function() {
  const dom = D_STAKEHOLDER;
  KNOWLEDGE_NODES.push(
    node('process', 'proc-identify-stakeholders', '识别利益相关方', 'Identify Stakeholders', dom, {
      desc: '定期识别项目利益相关方，分析并记录其兴趣、参与度、相互依赖关系、影响力和潜在影响。核心工具：权力/利益方格、凸显模型。',
      tips: '🥇 权力/利益方格(Power/Interest Grid)是识别干系人的核心工具。凸显模型(Salience Model)从权力、合法性和紧迫性三个维度分析。沟通渠道数=n(n-1)/2（n为干系人数量）。',
      domain: 'stakeholder', focusArea: 'initiating', priority: 1, weight: 3,
      related: [D_GOVERNANCE, D_RISK],
      itto: { inputs: ['项目章程', '商业文件', '项目管理计划', '项目文件', '协议', '事业环境因素', '组织过程资产'], tools: ['专家判断', '数据收集', '数据分析', '干系人映射/表现', '会议'], outputs: ['干系人登记册', '变更请求'] },
    }),
    node('process', 'proc-plan-stakeholder-engagement', '规划利益相关方争取', 'Plan Stakeholder Engagement', dom, {
      desc: '根据利益相关方的需求、期望、兴趣和潜在影响，制定争取其参与的策略。核心输出：干系人参与计划。',
      tips: '参与度评估矩阵：不知晓(Unaware)→抵制(Resistant)→中立(Neutral)→支持(Supporting)→领导(Leading)。目标是推动干系人向理想参与度移动。',
      domain: 'stakeholder', focusArea: 'planning', priority: 2, weight: 2,
      related: ['proc-identify-stakeholders', 'proc-plan-communications'],
      itto: { inputs: ['项目章程', '项目管理计划', '项目文件', '协议', '事业环境因素', '组织过程资产'], tools: ['专家判断', '数据收集', '数据分析', '决策', '会议'], outputs: ['利益相关方参与计划'] },
    }),
    node('process', 'proc-plan-communications', '规划沟通管理', 'Plan Communications Management', dom, {
      desc: '规划如何与已识别的利益相关方（团队内部和外部）沟通。考虑沟通需求、方法、模型和技术。',
      tips: '沟通方法：交互式（面对面、电话）、推送式（邮件、报告）、拉取式（内部网、知识库）。5C沟通原则：Correct/Concise/Clear/Coherent/Controlling。',
      domain: 'stakeholder', focusArea: 'planning', priority: 2, weight: 2,
      related: ['proc-manage-communications', 'proc-monitor-communications'],
      itto: { inputs: ['项目章程', '项目管理计划', '项目文件', '事业环境因素', '组织过程资产'], tools: ['专家判断', '沟通需求分析', '沟通技术', '沟通模型', '会议'], outputs: ['沟通管理计划', '项目管理计划更新'] },
    }),
    node('process', 'proc-manage-stakeholder-engagement', '管理利益相关方争取', 'Manage Stakeholder Engagement', dom, {
      desc: '与利益相关方沟通和协作，满足其需求，解决问题，促进适当参与。需要积极应对干系人的顾虑和期望。',
      tips: '冲突解决5方式：合作/解决问题(Collaborate，Win-Win，最佳)、妥协/调解(Compromise，双方各让一步)、缓和/包容(Smooth，求同存异)、强制/命令(Force，一方强制另一方)、回避/退出(Avoid，推迟处理)。',
      domain: 'stakeholder', focusArea: 'executing', priority: 1, weight: 2,
      related: ['proc-lead-team', 'proc-manage-communications'],
      itto: { inputs: ['项目管理计划', '项目文件', '事业环境因素', '组织过程资产'], tools: ['专家判断', '沟通技能', '人际关系与团队技能', '会议'], outputs: ['问题日志', '变更请求', '项目管理计划更新', '项目文件更新'] },
    }),
    node('process', 'proc-manage-communications', '管理沟通', 'Manage Communications', dom, {
      desc: '确保及时、适当地收集、创建、分发、存储、检索、管理、监控和处理项目信息。遵循沟通管理计划。',
      tips: '沟通模型：发送方→编码→媒介→噪声→解码→接收方→反馈→回应。最大障碍是噪声和缺乏反馈。',
      domain: 'stakeholder', focusArea: 'executing', priority: 2, weight: 1,
      related: ['proc-plan-communications', 'proc-monitor-communications'],
      itto: { inputs: ['项目管理计划', '项目文件', '工作绩效报告', '事业环境因素', '组织过程资产'], tools: ['沟通技术', '沟通方法', '沟通技能', '项目管理信息系统'], outputs: ['项目沟通记录', '项目管理计划更新', '项目文件更新'] },
    }),
    node('process', 'proc-monitor-stakeholder-engagement', '监督利益相关方争取', 'Monitor Stakeholder Engagement', dom, {
      desc: '监督干系人关系，通过调整计划和策略来裁剪干系人参与策略。持续评估参与度变化。',
      domain: 'stakeholder', focusArea: 'monitoring', priority: 2, weight: 1,
      related: ['proc-identify-stakeholders', 'proc-manage-stakeholder-engagement'],
      itto: { inputs: ['项目管理计划', '项目文件', '工作绩效数据', '事业环境因素', '组织过程资产'], tools: ['数据分析', '决策', '会议'], outputs: ['工作绩效信息', '变更请求', '项目管理计划更新'] },
    }),
    node('process', 'proc-monitor-communications', '监督沟通', 'Monitor Communications', dom, {
      desc: '确保项目及其利益相关方的信息需求得到满足。收集沟通活动数据并评估沟通效果。',
      domain: 'stakeholder', focusArea: 'monitoring', priority: 2, weight: 1,
      related: ['proc-plan-communications', 'proc-manage-communications'],
      itto: { inputs: ['项目管理计划', '项目文件', '项目沟通记录', '事业环境因素', '组织过程资产'], tools: ['数据分析', '决策', '会议'], outputs: ['工作绩效信息', '变更请求', '项目管理计划更新'] },
    })
  );
})();

// ----- 资源域 (5 processes) -----
(function() {
  const dom = D_RESOURCE;
  KNOWLEDGE_NODES.push(
    node('process', 'proc-plan-resource-mgmt', '规划资源管理', 'Plan Resource Management', dom, {
      desc: '定义如何估算、获取、领导和利用实物资源、虚拟资源或团队资源。使用RACI矩阵明确角色和职责。',
      tips: 'RACI矩阵：R(执行)、A(负责)、C(咨询)、I(知会)。每个活动只有一个A。团队章程确立团队价值观、沟通指南、会议规则。',
      domain: 'resource', focusArea: 'planning', priority: 2, weight: 1,
      related: [D_GOVERNANCE, D_STAKEHOLDER],
      itto: { inputs: ['项目章程', '项目管理计划', '事业环境因素', '组织过程资产'], tools: ['专家判断', '数据收集', '组织理论', '责任分配矩阵(RACI)', '会议'], outputs: ['资源管理计划', '团队章程', '项目文件更新'] },
    }),
    node('process', 'proc-estimate-resources', '估算资源', 'Estimate Resources', dom, {
      desc: '估算所需团队资源以及实物或虚拟资源的类型和数量。为后续成本估算和进度计划提供基础。',
      domain: 'resource', focusArea: 'planning', priority: 2, weight: 1,
      related: ['proc-estimate-costs', 'proc-develop-schedule'],
      itto: { inputs: ['项目管理计划', '项目文件', '事业环境因素', '组织过程资产'], tools: ['专家判断', '类比估算', '参数估算', '自下而上估算', '数据分析'], outputs: ['资源需求', '估算依据', '资源分解结构(RBS)', '项目文件更新'] },
    }),
    node('process', 'proc-acquire-resources', '获取资源', 'Acquire Resources', dom, {
      desc: '根据活动清单获取完成项目工作所需的团队、实物或虚拟资源。获取方法包括预分派、谈判、多标准决策分析。',
      tips: '虚拟团队需要特别关注沟通和信任建设。资源日历显示每个资源何时可用。',
      domain: 'resource', focusArea: 'executing', priority: 2, weight: 1,
      related: ['proc-lead-team', D_FINANCE],
      itto: { inputs: ['项目管理计划', '项目文件', '事业环境因素', '组织过程资产'], tools: ['专家判断', '谈判', '预分派', '多标准决策分析', '虚拟团队'], outputs: ['项目团队派工单', '资源日历', '变更请求', '项目管理计划更新'] },
    }),
    node('process', 'proc-lead-team', '领导团队', 'Lead Team', dom, {
      desc: '通过反馈、协作、冲突解决或上报来指导、建设和管理团队，以提高绩效。核心模型：Tuckman团队发展阶段。',
      tips: '🥇 Tuckman模型必考！Forming(形成)→Storming(震荡)→Norming(规范)→Performing(成熟)→Adjourning(解散)。激励理论：Maslow需求层次、Herzberg双因素、McGregor XY理论。情商(Emotional Intelligence)对领导力至关重要。',
      domain: 'resource', focusArea: 'executing', priority: 1, weight: 3,
      related: [D_STAKEHOLDER, P_LEADER, P_CULTURE],
      itto: { inputs: ['项目管理计划', '项目文件', '项目团队派工单', '团队章程', '工作绩效数据', '组织过程资产'], tools: ['冲突管理', '决策', '情商', '影响力', '领导力'], outputs: ['团队绩效评价', '变更请求'] },
    }),
    node('process', 'proc-monitor-resources', '监控资源', 'Monitor Resources', dom, {
      desc: '确保分配给项目的实物或虚拟资源按计划可用；监控计划与实际使用情况的对比。及时调整资源分配。',
      domain: 'resource', focusArea: 'monitoring', priority: 3, weight: 1,
      related: ['proc-monitor-performance'],
      itto: { inputs: ['项目管理计划', '项目文件', '工作绩效数据', '协议', '组织过程资产'], tools: ['数据分析', '问题解决', '人际关系与团队技能', '项目管理信息系统'], outputs: ['工作绩效信息', '变更请求', '项目管理计划更新'] },
    })
  );
})();

// ----- 风险域 (6 processes) -----
(function() {
  const dom = D_RISK;
  KNOWLEDGE_NODES.push(
    node('process', 'proc-plan-risk-mgmt', '规划风险管理', 'Plan Risk Management', dom, {
      desc: '定义如何进行风险管理活动，从项目构思阶段就开始。创建风险管理计划，定义风险类别和概率影响标度。',
      tips: '风险分解结构(RBS)按风险来源分类。风险偏好(Risk Appetite)vs风险承受力(Risk Tolerance)vs风险临界值(Risk Threshold)。',
      domain: 'risk', focusArea: 'planning', priority: 2, weight: 1,
      related: [D_GOVERNANCE],
      itto: { inputs: ['项目章程', '项目管理计划', '事业环境因素', '组织过程资产'], tools: ['专家判断', '数据分析', '会议'], outputs: ['风险管理计划'] },
    }),
    node('process', 'proc-identify-risks', '识别风险', 'Identify Risks', dom, {
      desc: '识别项目威胁和机会；区分真正的风险和潜在顾虑，在整个项目中迭代进行。使用SWOT、头脑风暴、德尔菲技术等。',
      tips: 'SWOT分析：Strengths/Weaknesses(内部) + Opportunities/Threats(外部)。提示清单：PESTLE(政治/经济/社会/技术/法律/环境)、TECOP(技术/环境/商业/运营/政治)、VUCA(易变性/不确定性/复杂性/模糊性)。',
      domain: 'risk', focusArea: 'planning', priority: 1, weight: 2,
      related: [D_STAKEHOLDER, 'proc-perform-risk-analysis'],
      itto: { inputs: ['项目管理计划', '项目文件', '协议', '采购文档', '事业环境因素', '组织过程资产'], tools: ['专家判断', '数据收集', '数据分析', '人际关系与团队技能', '提示清单', '会议'], outputs: ['风险登记册', '风险报告', '项目文件更新'] },
    }),
    node('process', 'proc-perform-risk-analysis', '实施风险分析', 'Implement Risk Analysis', dom, {
      desc: '使用迭代方法分析风险，结合定性分析（概率和影响）和定量分析（对目标的综合影响）。',
      tips: '🥇 定性分析：概率影响矩阵(Probability & Impact Matrix)，将风险排序。定量分析：蒙特卡洛模拟(Monte Carlo)、决策树(Decision Tree)、敏感性分析(Tornado Diagram)。EMV=P×I（期望货币价值）。',
      domain: 'risk', focusArea: 'planning', priority: 1, weight: 3,
      related: ['proc-identify-risks', 'proc-plan-risk-responses'],
      itto: { inputs: ['项目管理计划', '项目文件', '风险登记册', '事业环境因素', '组织过程资产'], tools: ['专家判断', '数据分析', '风险概率和影响评估', '概率和影响矩阵', '不确定性表现', '风险分类'], outputs: ['风险登记册更新', '风险报告更新'] },
    }),
    node('process', 'proc-plan-risk-responses', '规划风险应对', 'Plan Risk Responses', dom, {
      desc: '制定适当有效的应对措施来管理整体项目风险和单个风险。为每个识别出的重要风险分配风险应对策略和责任人。',
      tips: '🚨 必背！威胁5策略：上报(Escalate)、规避(Avoid)、转移(Transfer→保险/外包)、减轻(Mitigate)、接受(Accept→主动/被动)。机会5策略：上报(Escalate)、利用(Exploit)、分享(Share)、增强(Enhance)、接受(Accept)。次生风险(Secondary Risk)=应对措施引发的新风险。残余风险(Residual Risk)=应对后仍存在的风险。',
      domain: 'risk', focusArea: 'planning', priority: 1, weight: 3,
      related: ['proc-perform-risk-analysis', 'proc-implement-risk-response'],
      itto: { inputs: ['项目管理计划', '项目文件', '风险登记册', '风险报告', '项目团队派工单', '组织过程资产'], tools: ['专家判断', '数据收集', '数据分析', '威胁应对策略', '机会应对策略', '应急应对策略', '决策'], outputs: ['变更请求', '项目文件更新', '项目管理计划更新'] },
    }),
    node('process', 'proc-implement-risk-response', '实施风险应对', 'Implement Risk Responses', dom, {
      desc: '执行风险应对计划以应对项目风险，最小化威胁并最大化机会。将风险应对措施纳入项目执行过程。',
      tips: '风险应对不是一次性活动，需要持续执行和监控。风险所有者(Risk Owner)负责确保应对措施的实施效果。',
      domain: 'risk', focusArea: 'executing', priority: 2, weight: 1,
      related: ['proc-plan-risk-responses', 'proc-monitor-risks'],
      itto: { inputs: ['项目管理计划', '项目文件', '风险登记册', '风险报告', '组织过程资产'], tools: ['专家判断', '人际关系与团队技能', '项目管理信息系统'], outputs: ['变更请求', '项目文件更新'] },
    }),
    node('process', 'proc-monitor-risks', '监督风险', 'Monitor Risks', dom, {
      desc: '在整个项目生命周期中持续跟踪和分析风险，实施应对计划，评估应对措施的有效性。关注新风险和次生风险。',
      tips: '触发条件(Trigger Conditions)表明风险即将或已经发生。风险审计(Risk Audit)评估风险管理过程的有效性。储备分析(Reserve Analysis)判断剩余储备是否充足。',
      domain: 'risk', focusArea: 'monitoring', priority: 2, weight: 1,
      related: ['proc-perform-risk-analysis', 'proc-evaluate-change'],
      itto: { inputs: ['项目管理计划', '项目文件', '风险登记册', '风险报告', '工作绩效数据', '组织过程资产'], tools: ['数据分析', '风险审计', '储备分析', '会议'], outputs: ['工作绩效信息', '变更请求', '项目管理计划更新', '项目文件更新'] },
    })
  );
})();

// ============================================================
// PART 5: 敏捷实践概念 (Agile Concepts)
// ============================================================
KNOWLEDGE_NODES.push(
  node('agile_concept', 'agile-manifesto', '敏捷宣言', 'Agile Manifesto', null, {
    desc: '4大价值观：1.个体与互动高于流程和工具；2.可工作的软件高于详尽的文档；3.客户合作高于合同谈判；4.响应变化高于遵循计划。12大原则包括：持续交付有价值的软件、欢迎需求变更、频繁交付、业务人员与开发人员每日协作等。',
    tips: 'PMP考试敏捷占比约50%！敏捷宣言是所有敏捷方法的基础。虽然有价值项目在右边，但左边更重要——不是非此即彼。',
    priority: 1, weight: 3, domain: 'agile',
  }),
  node('agile_concept', 'agile-lifecycle', '生命周期选择', 'Lifecycle Selection', null, {
    desc: '5种项目生命周期：预测型（需求确定、单次交付）、迭代型（通过原型学习）、增量型（加速交付）、敏捷型（迭代+增量，拥抱变化）、混合型（不同部分用不同方法）。选择取决于需求不确定性、技术不确定性和风险水平。',
    tips: '🥇 必考！斯泰西复杂度模型：需求不确定性(高/低) × 技术不确定性(高/低) → 简单(预测型)→复杂(迭代/增量)→混乱(先约束一个变量)。混合型生命周期是PMP考试的新宠！',
    priority: 1, weight: 3, domain: 'agile',
  }),
  node('agile_concept', 'agile-scrum', 'Scrum框架', 'Scrum Framework', null, {
    desc: '3角色：Product Owner(产品负责人)、Scrum Master(敏捷教练)、Development Team(开发团队，5-9人，跨职能)。5事件：Sprint(1-4周迭代)、Sprint Planning(规划)、Daily Scrum(每日站会15分钟)、Sprint Review(评审)、Sprint Retrospective(回顾)。3工件：Product Backlog、Sprint Backlog、Increment。',
    tips: 'Scrum是PMP考试中最常考的敏捷框架。PO负责What(做什么)，Team负责How(怎么做)，SM负责Process(过程)。回顾(Retrospective)是敏捷最重要的实践——持续改进的核心。',
    priority: 1, weight: 3, domain: 'agile',
  }),
  node('agile_concept', 'agile-servant-leader', '仆人式领导', 'Servant Leadership', null, {
    desc: '项目经理在敏捷环境中的角色转变为仆人式领导者。核心职责：为团队服务、消除障碍、保护团队免受外部干扰、促进协作、帮助团队成长。不是传统的命令-控制型管理。',
    tips: '仆人式领导≠无为而治——仍然要对项目的交付结果负责。关键行为：提问而非指令、赋能而非控制、引导而非指挥。',
    priority: 2, weight: 2, domain: 'agile',
  }),
  node('agile_concept', 'agile-kanban', '看板方法', 'Kanban Method', null, {
    desc: '精益(Lean)思想的衍生产品。核心实践：可视化工作流、限制在制品(WIP)、管理工作流、使过程策略明确化、使用反馈循环、协作式改进。不需要预设时间盒迭代，是"原地出发"的最佳选择。',
    tips: 'Kanban vs Scrum：Kanban没有预设迭代，变更可随时加入；Scrum在Sprint内通常不接受变更。WIP限制是Kanban的核心。累积流图(CFD)用于识别瓶颈。',
    priority: 2, weight: 1, domain: 'agile',
  }),
  node('agile_concept', 'agile-hybrid', '混合模式', 'Hybrid Approaches', null, {
    desc: '4种混合模式：1.敏捷开发+预测型发布；2.同时使用敏捷和预测型方法；3.预测型为主+敏捷元素；4.敏捷为主+预测型组件。还有作为过渡策略的渐进混合模式。选择混合模式取决于不同项目组件的不同不确定性特征。',
    tips: 'PMP考试越来越多地考察混合场景——例如一个项目中，硬件部分用预测型，软件部分用敏捷。关键是要理解为什么选择混合以及如何切换。',
    priority: 1, weight: 2, domain: 'agile',
  }),
  node('agile_concept', 'agile-metrics', '敏捷度量', 'Agile Metrics', null, {
    desc: '敏捷核心度量指标：Velocity（速率=每迭代完成的故事点数）、Lead Time（从需求提出到交付的总时间）、Cycle Time（处理一个工作项的时间）、燃尽图(Burndown Chart)、燃起图(Burnup Chart)、累积流图(CFD)。',
    tips: '燃尽图显示剩余工作 vs 剩余时间；燃起图显示已完成工作。Velocity在4-8个迭代后趋于稳定，可用于预测。不要跨团队比较Velocity！',
    priority: 2, weight: 1, domain: 'agile',
  }),
  node('agile_concept', 'agile-xp', '极限编程 XP', 'Extreme Programming', null, {
    desc: '12大实践：持续集成、测试驱动开发(TDD)、结对编程、代码集体所有权、编码标准、简单设计、重构、小发布、计划游戏、现场客户、系统隐喻、可持续节奏。5大核心价值观：沟通、简单、反馈、勇气、尊重。',
    tips: 'TDD：先写测试再写代码。持续集成：频繁地将代码整合到主干，自动化测试确保质量。在PMP考试中，TDD和持续集成是敏捷技术实践的常见考点。',
    priority: 3, weight: 1, domain: 'agile',
  })
);

// ============================================================
// PART 5 续: 敏捷扩展概念 (Extended Agile Concepts)
// ============================================================
KNOWLEDGE_NODES.push(
  node('agile_concept', 'agile-lean', '精益思想', 'Lean Thinking', null, {
    desc: '精益(Lean)起源于丰田生产系统，核心理念是用更少的资源创造更多的客户价值。七大浪费（TIMWOOD）：运输(Transport)、库存(Inventory)、动作(Motion)、等待(Waiting)、过度加工(Over-processing)、过度生产(Over-production)、缺陷(Defects)。精益项目管理的五大原则：确定价值→价值流映射→创建流动→建立拉动→追求完美。与看板方法深度融合——看板是知识工作中应用精益理念的主要框架。',
    tips: '精益与敏捷关系密切，许多敏捷实践（如小批量、持续流动、消除浪费）都源于精益。MVP(最小可行产品)=精益\"尽早交付价值\"理念的体现。利特尔法则：周期时间=WIP÷吞吐率——限制WIP可以缩短交付时间。价值流映射(Value Stream Mapping)=识别流程中增加价值和不增加价值的步骤。',
    priority: 1, weight: 2, domain: 'agile',
  }),
  node('agile_concept', 'agile-estimation', '敏捷估算', 'Agile Estimation', null, {
    desc: '敏捷估算强调相对估算而非绝对估算，认为人和团队在相对大小上比绝对大小上更准确。核心方法包括：Planning Poker(计划扑克)——团队使用扑克牌进行相对估算，通过讨论收敛一致；T-shirt Sizing( T恤尺码 )——使用XS/S/M/L/XL进行粗略的相对估算；故事点(Story Points)——综合考量工作量、复杂性和风险的相对单位；Affinity Estimation——将用户故事相对于彼此排列分组。理想时间vs实际时间——敏捷更倾向于使用理想时间而非日历时间。速度(Velocity)需要4-8个迭代后才能稳定作为预测依据。',
    tips: 'Planning Poker规则：每人同时亮牌→差异最大的人分别发言→讨论→重投→直到趋同。不跨团队比较Velocity！每个团队的估算标准和故事点定义不同。故事点并非时间单位——它反映的是相对大小，不能简单转换为\"1点=1天\"。斐波那契数列(1/2/3/5/8/13/20/40/100)常用于故事点估算。',
    priority: 1, weight: 2, domain: 'agile',
  }),
  node('agile_concept', 'agile-risk', '敏捷风险管理', 'Agile Risk Management', null, {
    desc: '敏捷环境中的风险管理不是一次性的、文件驱动的前期活动，而是嵌入每个迭代的持续过程。通过频繁交付小增量来降低不确定性和风险（风险缓解的渐进方式）。每日站会识别阻碍(Impediments)即风险的早期信号。迭代评审(Sprint Review)获取利益相关方反馈以识别新风险和调整方向。迭代回顾(Retrospective)识别过程风险和改进机会。信息发射源(Information Radiators)如燃尽图、看板面板提供风险可视化。基于风险的刺探(Spike)——即专门用于探索未知领域、降低技术风险的短期研究活动。风险调整的待办事项排序——将风险较高的用户故事提前做以尽早验证。',
    tips: '敏捷中\"失败得快\"以降低沉没成本。失败的实验不被视为\"浪费\"而是\"学习投资\"。刺探(Spike)是时间盒限定的技术探索活动，结果用于为后续决策提供信息。风险燃尽图(Risk Burndown Chart)跟踪随时间减少的项目风险敞口。在PMP考试中，将\"基于风险的刺探\"与\"常规迭代工作\"区分开来是重要的区分点。',
    priority: 2, weight: 2, domain: 'agile',
  }),
  node('agile_concept', 'agile-contracts', '敏捷合同与采购', 'Agile Contracts & Procurement', null, {
    desc: '传统合同（固定总价/FP）与敏捷的\"拥抱变更\"理念存在冲突。敏捷合同模式旨在将采购关系从对抗性转向协作式。新兴敏捷合同模式包括：目标成本+激励酬金合同——双方约定目标成本，节余或超支按比例分享/分担；分阶段合同——初始阶段定义范围，后续阶段根据已验证的学习调整；时间与材料合同(T&M)——按实际投入计费，适合高度不确定性项目；增量交付合同——按交付价值而非符合规范来测量。敏捷合同关注的是\"成果\"而非\"输出\"。合同变更使用产品待办事项列表而非正式变更请求进行管理。',
    tips: 'PMP考试越来越多地考察敏捷合同场景——特别是如何在敏捷环境中处理与外部供应商的关系。关键原则：合同应当激励合作而非惩罚变更。将供应商纳入\"团队\"而非视为\"承包商\"。合同需要跨阶段反馈机制而非单向交付验收。在混合型项目中，硬件采购可能需要传统合同（FP），软件部分可能需要T&M或增量交付合同。',
    priority: 2, weight: 1, domain: 'agile',
  }),
  node('agile_concept', 'agile-scaled', '规模化敏捷', 'Scaled Agile', null, {
    desc: '当敏捷从单一团队扩展到多个团队、项目群甚至整个组织时，需要规模化敏捷框架。SAFe(Scaled Agile Framework)——最流行的企业级规模化框架，包含团队层、项目群层、大型解决方案层和投资组合层。核心概念：敏捷发布火车(ART)——50-125人的长期跨职能团队，每8-12周发布一次。LeSS(Large-Scale Scrum)——极简主义规模化方法，保持\"一个产品、一个产品负责人、一个产品待办事项列表\"。Scrum of Scrums——多个Scrum团队的协调机制，每个团队派代表参加定期会议。Nexus框架——3-9个Scrum团队合作交付一个集成增量的框架。规模化敏捷的挑战：团队间依赖管理、架构一致性、组织文化变革。',
    tips: 'SAFe在PMP考试中偶尔出现（特别是ART概念）。Scrum of Scrums是高频考点——跨团队的每日站会代表。规模化决策信号：团队间依赖增多、需要跨团队协调、架构/设计统一性要求高。不要为了\"追求规模\"而规模化——仅在需要时才引入框架。Scrum@Scale vs SAFe vs LeSS vs Disciplined Agile(DA)是常见的规模化选项。',
    priority: 3, weight: 1, domain: 'agile',
  }),
  node('agile_concept', 'agile-change-mgmt', '组织变革管理', 'Organizational Change Management', null, {
    desc: '项目管理与组织变革管理(OCM)经常重叠。变革管理关注于帮助个人和团队从当前状态过渡到目标状态所需的活动。项目管理侧重于项目可交付物的完成，而变革管理侧重于这些可交付物在组织中的接受和应用。关键模型：ADKAR模型（Awareness认知、Desire意愿、Knowledge知识、Ability能力、Reinforcement强化）——个人变革的五阶段模型。Kotter的八步变革模型——组织变革的经典框架。在敏捷转型中，变革管理通常比技术变革更困难，因为它涉及文化、人员心态和工作习惯的根本改变。',
    tips: '区分\"项目成功\"和\"变革成功\"——项目按时按预算交付不意味着变革被组织接受。变革饱和(Change Saturation)——组织同时启动太多变革导致员工抗拒。变革代理人(Change Agent)角色经常由项目经理兼任。在PMP考试中，涉及\"员工抗拒新系统/新流程\"的情景题通常需要先了解原因再采取具体行动（对话而非强制）。',
    priority: 2, weight: 1, domain: 'agile',
  }),
  node('agile_concept', 'agile-charter', '敏捷项目章程', 'Agile Project Charter', null, {
    desc: '敏捷项目仍然需要章程来授权项目启动，但形式远比传统章程轻量。敏捷章程（有时称为\"项目愿景文档\"或\"章程/宪章\"）通常只需1-2页，回答核心问题：我们为什么做这个项目？（愿景和目的）、成功是什么样？（高层次的成功标准）、受约束的是什么？（固定的预算/时间/范围）、谁参与？（关键利益相关方和团队配置）、我们怎么工作？（协商一致的工作协议）。敏捷章程的三要素：愿景(Vision)——项目\"为什么\"；任务(Mission)——项目\"是什么\"；验收标准——项目\"怎么才算成功\"。章程由发起人（产品负责人+执行发起人）签发，但在团队参与下共同创建。',
    tips: '敏捷章程与预测型章程的关键区别：更加简洁（1-2页 vs 10+页）、更多团队参与创建、更具对话性和适应性、聚焦于\"为什么\"和\"是什么\"而非\"怎么做\"。章程不能替代产品待办事项列表——章程定义为什么和是什么，待办事项列表定义具体细节。在混合型项目中，高层治理需求可以通过轻量级章程满足，而无需完整PGMP文档集。',
    priority: 2, weight: 1, domain: 'agile',
  })
);

// ===== 新增采购专项过程（治理域补充） =====
// 说明：PMBOK第8版将采购管理整合到治理域的"规划资源获取策略"过程中，
// 但考试中采购知识仍是非常重要的独立考点。因此增加3个采购补充节点以完善知识覆盖。
(function() {
  const dom = D_GOVERNANCE;
  KNOWLEDGE_NODES.push(
    node('process', 'proc-plan-procurement', '规划采购管理', 'Plan Procurement Management', dom, {
      desc: '记录项目采购决策，明确采购方法，识别潜在卖方。确定是否获取外部资源、如何获取、获取多少以及何时获取。核心输出包括采购管理计划、采购策略和招标文件。需要识别哪些项目需求可以通过采购外部产品、服务或成果来更好地实现。',
      tips: '采购管理计划定义采购类型（分包/咨询/产品采购）、如何管理多个供应商、采购与项目进度的协调。合同类型选择是关键：固定总价(FP)——范围明确、成本固定；成本补偿(CR)——范围不确定、买方承担成本风险；时间和材料(T&M)——小型、短期工作。供方选择分析：最低成本、资质唯一来源、固定预算、基于质量。',
      domain: 'governance', focusArea: 'planning', priority: 2, weight: 2,
      related: ['proc-plan-resource-acquisition', D_FINANCE, D_RISK],
      itto: { inputs: ['项目章程', '项目管理计划', '项目文件', '事业环境因素', '组织过程资产'], tools: ['专家判断', '数据分析', '供方选择分析', '会议'], outputs: ['采购管理计划', '采购策略', '招标文件', '供方选择标准', '自制或外购决策'] },
    }),
    node('process', 'proc-conduct-procurement', '实施采购', 'Conduct Procurement', dom, {
      desc: '获取卖方响应，选择卖方并授予合同。包括发布招标文件、召开投标人会议、评估投标书、谈判并签订合同。核心目标是选择最具价值（不一定最低价）的供应商，以最优方式实现项目目标。',
      tips: '投标人会议(Bidder Conference)——确保所有潜在卖方对采购需求有清晰一致的理解，所有卖方获得相同信息。建议书评价技术(Source Selection)——使用加权标准评估投标书，技术分和价格分的权重根据项目需要设定。谈判(Negotiation)——在合同授予前澄清双方期望和条款。合同是法律约束力的文件，项目经理需与法务/采购专业人员紧密协作。',
      domain: 'governance', focusArea: 'executing', priority: 2, weight: 1,
      related: ['proc-plan-procurement', D_STAKEHOLDER],
      itto: { inputs: ['采购管理计划', '采购文档', '供方建议书', '事业环境因素', '组织过程资产'], tools: ['专家判断', '广告', '投标人会议', '数据分析', '谈判'], outputs: ['选定的卖方', '协议/合同', '资源日历', '采购文档更新'] },
    }),
    node('process', 'proc-control-procurement', '控制采购', 'Control Procurement', dom, {
      desc: '管理采购关系，监督合同绩效，进行必要的变更和纠正措施，以及关闭合同。确保自身的项目团队和供应商都按照合同条款履行职责。绩效审查、检查和审计是核心工具。合同变更需要双方正式协商并记录为合同附录。',
      tips: '采购绩效审查——检查供应商是否按合同规定的范围、质量、进度和成本交付。索赔管理——记录、处理、监督和管理有争议的变更。合同收尾——确认所有工作和可交付物可接受、完成合同文档归档、支付最终付款。特别注意：合同收尾≠行政收尾——合同收尾在行政收尾之前进行。',
      domain: 'governance', focusArea: 'monitoring', priority: 2, weight: 1,
      related: ['proc-monitor-performance', 'proc-evaluate-change', 'proc-close-project'],
      itto: { inputs: ['项目管理计划', '采购文档', '协议', '批准的变更请求', '工作绩效数据'], tools: ['专家判断', '索赔管理', '数据分析', '检查', '审计'], outputs: ['采购关闭', '工作绩效信息', '采购文档更新', '变更请求'] },
    })
  );
})();

// ===== 导出 =====
export default KNOWLEDGE_NODES;

// ===== 便捷查找工具 =====
/** 根据ID获取节点 */
export function getNodeById(id) {
  return KNOWLEDGE_NODES.find(n => n.id === id);
}

/** 获取所有子节点 */
export function getChildren(parentId) {
  return KNOWLEDGE_NODES.filter(n => n.parentId === parentId);
}

/** 按类型获取 */
export function getNodesByType(type) {
  return KNOWLEDGE_NODES.filter(n => n.type === type);
}

/** 按域获取 */
export function getNodesByDomain(domain) {
  return KNOWLEDGE_NODES.filter(n => n.domain === domain);
}

/** 获取父链 */
export function getParentChain(nodeId) {
  const chain = [];
  let current = getNodeById(nodeId);
  while (current) {
    chain.unshift(current);
    current = getNodeById(current.parentId);
  }
  return chain;
}

/** 获取所有关联节点 */
export function getRelatedNodes(nodeId) {
  const node = getNodeById(nodeId);
  if (!node || !node.relatedIds) return [];
  return node.relatedIds.map(id => getNodeById(id)).filter(Boolean);
}

/** 获取层次结构 */
export function getHierarchy() {
  const principles = getNodesByType('principle');
  const domains = getNodesByType('domain');
  const focusAreas = getNodesByType('focus_area');
  const processes = getNodesByType('process');
  const agileConcepts = getNodesByType('agile_concept');

  return { principles, domains, focusAreas, processes, agileConcepts };
}

/** 获取总知识单元数 */
export function getTotalKnowledgeUnits() {
  // 6原则 + 7域 + 5关注领域 + 43过程(含3采购) + 15敏捷概念
  return {
    pmbok: 61,    // 6+7+5+43
    processGroups: 30,
    agile: 36,
    total: 127,
    independent: getNodesByType('agile_concept').length +
                 getNodesByType('principle').length +
                 getNodesByType('domain').length +
                 getNodesByType('focus_area').length +
                 getNodesByType('process').length,
  };
}
