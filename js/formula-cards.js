/**
 * PMP Formula Cards & Examples Utility Module
 * Reusable, self-contained formula cards with inline CSS using app CSS variables.
 *
 * Expected CSS variables (define in :root):
 *   --color-primary, --color-surface2, --color-border,
 *   --color-text, --color-text2, --color-text3,
 *   --color-success, --color-danger, --color-warning
 */
(function (global) {
  'use strict';

  /* ===================================================================
   *  BUILT-IN FORMULA PRESETS
   * =================================================================== */

  const FORMULAS = {

    // --- EVM Core ---
    SV: {
      id: 'sv',
      title: '进度偏差 (Schedule Variance)',
      formula: 'SV = EV − PV',
      variables: [
        { symbol: 'SV', name: '进度偏差 (Schedule Variance)' },
        { symbol: 'EV', name: '挣值 (Earned Value) — 实际完成工作的预算价值' },
        { symbol: 'PV', name: '计划价值 (Planned Value) — 计划完成工作的预算价值' }
      ],
      example: {
        scenario: '项目预算 BAC = ¥100 万，计划第 4 个月末完成 40% 的工作（PV = ¥40 万），实际只完成了 35%（EV = ¥35 万）。',
        steps: [
          'EV = BAC × 实际完成百分比 = ¥100万 × 35% = ¥35 万',
          'PV = BAC × 计划完成百分比 = ¥100万 × 40% = ¥40 万',
          'SV = EV − PV = ¥35万 − ¥40万 = −¥5 万'
        ],
        conclusion: 'SV < 0，进度落后于计划，落后价值 ¥5 万。'
      },
      tips: 'SV > 0：进度超前 | SV = 0：按计划进行 | SV < 0：进度落后',
      colorHint: 'positive-negative' // green when >=0, red when <0
    },

    CV: {
      id: 'cv',
      title: '成本偏差 (Cost Variance)',
      formula: 'CV = EV − AC',
      variables: [
        { symbol: 'CV', name: '成本偏差 (Cost Variance)' },
        { symbol: 'EV', name: '挣值 (Earned Value)' },
        { symbol: 'AC', name: '实际成本 (Actual Cost) — 已完成工作的实际花费' }
      ],
      example: {
        scenario: '项目已完成工作的预算价值 EV = ¥35 万，但实际花费 AC = ¥38 万。',
        steps: [
          'EV = ¥35 万',
          'AC = ¥38 万',
          'CV = EV − AC = ¥35万 − ¥38万 = −¥3 万'
        ],
        conclusion: 'CV < 0，成本超支 ¥3 万。'
      },
      tips: 'CV > 0：成本节约 | CV = 0：按预算 | CV < 0：成本超支',
      colorHint: 'positive-negative'
    },

    SPI: {
      id: 'spi',
      title: '进度绩效指数 (Schedule Performance Index)',
      formula: 'SPI = EV ÷ PV',
      variables: [
        { symbol: 'SPI', name: '进度绩效指数' },
        { symbol: 'EV', name: '挣值 (Earned Value)' },
        { symbol: 'PV', name: '计划价值 (Planned Value)' }
      ],
      example: {
        scenario: 'EV = ¥35 万，PV = ¥40 万。',
        steps: [
          'SPI = EV ÷ PV = ¥35万 ÷ ¥40万 = 0.875'
        ],
        conclusion: 'SPI = 0.875 < 1，进度效率只有计划的 87.5%，进度落后。'
      },
      tips: 'SPI > 1：进度超前 | SPI = 1：按计划 | SPI < 1：进度落后',
      colorHint: 'positive-negative'
    },

    CPI: {
      id: 'cpi',
      title: '成本绩效指数 (Cost Performance Index)',
      formula: 'CPI = EV ÷ AC',
      variables: [
        { symbol: 'CPI', name: '成本绩效指数' },
        { symbol: 'EV', name: '挣值 (Earned Value)' },
        { symbol: 'AC', name: '实际成本 (Actual Cost)' }
      ],
      example: {
        scenario: 'EV = ¥35 万，AC = ¥38 万。',
        steps: [
          'CPI = EV ÷ AC = ¥35万 ÷ ¥38万 ≈ 0.921'
        ],
        conclusion: 'CPI = 0.921 < 1，每花 ¥1 只产出约 ¥0.92 的价值，成本效率偏低。'
      },
      tips: 'CPI > 1：成本节约 | CPI = 1：按预算 | CPI < 1：成本超支。CPI 是预测最终成本的关键指标。',
      colorHint: 'positive-negative'
    },

    // --- EVM Advanced ---
    TCPI: {
      id: 'tcpi',
      title: '完工尚需绩效指数 (To-Complete Performance Index)',
      formula: 'TCPI = (BAC − EV) ÷ (BAC − AC)',
      variables: [
        { symbol: 'TCPI', name: '完工尚需绩效指数' },
        { symbol: 'BAC', name: '完工预算 (Budget at Completion)' },
        { symbol: 'EV', name: '挣值 (Earned Value)' },
        { symbol: 'AC', name: '实际成本 (Actual Cost)' }
      ],
      example: {
        scenario: 'BAC = ¥100 万，EV = ¥35 万，AC = ¥38 万。问：剩余工作必须以什么效率执行才能不超 BAC？',
        steps: [
          '剩余工作价值 = BAC − EV = ¥100万 − ¥35万 = ¥65 万',
          '剩余预算 = BAC − AC = ¥100万 − ¥38万 = ¥62 万',
          'TCPI = ¥65万 ÷ ¥62万 ≈ 1.048'
        ],
        conclusion: 'TCPI ≈ 1.05 > 1，剩余工作必须比原计划效率高约 5% 才能不超预算，难度较大。'
      },
      tips: 'TCPI > 1：剩余工作需更高效率（有压力）| TCPI = 1：按原效率即可 | TCPI < 1：较轻松。若改用 EAC 为目标：TCPI = (BAC−EV)÷(EAC−AC)',
      colorHint: 'positive-negative' // Here, < 1 is better (easier)
    },

    EAC: {
      id: 'eac',
      title: '完工估算 (Estimate at Completion)',
      formula: 'EAC = BAC ÷ CPI',
      variables: [
        { symbol: 'EAC', name: '完工估算' },
        { symbol: 'BAC', name: '完工预算' },
        { symbol: 'CPI', name: '成本绩效指数' }
      ],
      example: {
        scenario: 'BAC = ¥100 万，当前 CPI = 0.921。假设未来效率与当前相同：',
        steps: [
          'EAC = BAC ÷ CPI = ¥100万 ÷ 0.921 ≈ ¥108.6 万'
        ],
        conclusion: '预计最终总成本约 ¥108.6 万，超出预算 ¥8.6 万。'
      },
      tips: '其他 EAC 公式：EAC = AC + ETC（自下而上估算）；EAC = AC + (BAC−EV)（剩余按计划）；EAC = AC + (BAC−EV)÷(CPI×SPI)（考虑 SPI）',
      colorHint: 'neutral'
    },

    ETC: {
      id: 'etc',
      title: '完工尚需估算 (Estimate to Complete)',
      formula: 'ETC = EAC − AC',
      variables: [
        { symbol: 'ETC', name: '完工尚需估算' },
        { symbol: 'EAC', name: '完工估算' },
        { symbol: 'AC', name: '实际成本' }
      ],
      example: {
        scenario: 'EAC ≈ ¥108.6 万，AC = ¥38 万。',
        steps: [
          'ETC = EAC − AC = ¥108.6万 − ¥38万 = ¥70.6 万'
        ],
        conclusion: '完成项目还需约 ¥70.6 万。'
      },
      tips: 'ETC 也可以自下而上重新估算剩余工作成本：ETC = 剩余工作的重新估算之和',
      colorHint: 'neutral'
    },

    VAC: {
      id: 'vac',
      title: '完工偏差 (Variance at Completion)',
      formula: 'VAC = BAC − EAC',
      variables: [
        { symbol: 'VAC', name: '完工偏差' },
        { symbol: 'BAC', name: '完工预算' },
        { symbol: 'EAC', name: '完工估算' }
      ],
      example: {
        scenario: 'BAC = ¥100 万，EAC = ¥108.6 万。',
        steps: [
          'VAC = BAC − EAC = ¥100万 − ¥108.6万 = −¥8.6 万'
        ],
        conclusion: 'VAC < 0，预计完工时超支 ¥8.6 万。'
      },
      tips: 'VAC > 0：预计低于预算 | VAC < 0：预计超预算',
      colorHint: 'positive-negative'
    },

    // --- PERT ---
    PERT: {
      id: 'pert',
      title: 'PERT 三点估算 (期望时间)',
      formula: 'tE = (O + 4M + P) ÷ 6',
      variables: [
        { symbol: 'tE', name: '期望持续时间 (Expected Duration)' },
        { symbol: 'O', name: '乐观时间 (Optimistic)' },
        { symbol: 'M', name: '最可能时间 (Most Likely)' },
        { symbol: 'P', name: '悲观时间 (Pessimistic)' }
      ],
      example: {
        scenario: '某活动的乐观时间 O = 10 天，最可能 M = 15 天，悲观 P = 32 天。',
        steps: [
          '计算加权和：O + 4M + P = 10 + 4×15 + 32 = 10 + 60 + 32 = 102',
          'tE = 102 ÷ 6 = 17 天'
        ],
        conclusion: '该活动的期望工期为 17 天（比最可能的 15 天多 2 天，因为悲观估计拉高了均值）。'
      },
      tips: 'PERT 使用 Beta 分布加权，最可能值权重为 4。简单三点平均（三角分布）为 (O+M+P)/3，注意区分。',
      colorHint: 'neutral'
    },

    SD: {
      id: 'sd',
      title: 'PERT 标准差 (Standard Deviation)',
      formula: 'σ = (P − O) ÷ 6',
      variables: [
        { symbol: 'σ', name: '标准差 (Standard Deviation)' },
        { symbol: 'O', name: '乐观时间' },
        { symbol: 'P', name: '悲观时间' }
      ],
      example: {
        scenario: 'O = 10 天，P = 32 天。',
        steps: [
          'σ = (P − O) ÷ 6 = (32 − 10) ÷ 6 = 22 ÷ 6 ≈ 3.67 天'
        ],
        conclusion: '标准差约 3.67 天。活动在 tE ± 1σ（13.33 ~ 20.67 天）内的概率约 68.26%。'
      },
      tips: '±1σ ≈ 68.26% | ±2σ ≈ 95.46% | ±3σ ≈ 99.73%。方差 σ² = ((P−O)/6)²，活动方差可累加求路径总方差。',
      colorHint: 'neutral'
    },

    // --- Communication Channels ---
    COMM: {
      id: 'comm',
      title: '沟通渠道 (Communication Channels)',
      formula: 'C = n(n − 1) ÷ 2',
      variables: [
        { symbol: 'C', name: '沟通渠道数' },
        { symbol: 'n', name: '干系人数量（包括项目经理）' }
      ],
      example: {
        scenario: '项目团队从 5 人增加到 8 人，沟通渠道增加了多少？',
        steps: [
          '5 人时：C₅ = 5×4÷2 = 10 条',
          '8 人时：C₈ = 8×7÷2 = 28 条',
          '增加：28 − 10 = 18 条'
        ],
        conclusion: '团队增加 3 人，沟通渠道增加 18 条（增长了 180%），沟通复杂度急剧上升。'
      },
      tips: 'n 必须包含项目经理。每增加 1 人，增加 (n−1) 条渠道。沟通管理在敏捷和传统项目中都至关重要。',
      colorHint: 'neutral'
    },

    // --- EMV ---
    EMV: {
      id: 'emv',
      title: '预期货币价值 (Expected Monetary Value)',
      formula: 'EMV = P × I',
      variables: [
        { symbol: 'EMV', name: '预期货币价值' },
        { symbol: 'P', name: '概率 (Probability)，0~1' },
        { symbol: 'I', name: '影响/金额 (Impact)，正值=机会，负值=威胁' }
      ],
      example: {
        scenario: '某风险发生概率 30%（P=0.3），若发生将造成 ¥50 万损失（I=−¥50万）；另有一机会概率 20%（P=0.2），可节省 ¥30 万（I=+¥30万）。',
        steps: [
          '风险 EMV = 0.3 × (−¥50万) = −¥15 万',
          '机会 EMV = 0.2 × (+¥30万) = +¥6 万',
          '合计 EMV = −¥15万 + ¥6万 = −¥9 万'
        ],
        conclusion: '综合考虑这两个风险事件，项目 EMV 为 −¥9 万，应预留至少 ¥9 万的应急储备。'
      },
      tips: 'EMV 用于决策树分析和应急储备计算。正 EMV 是机会，负 EMV 是威胁。所有风险的 EMV 求和可确定应急储备。',
      colorHint: 'positive-negative'
    },

    // --- Float ---
    FLOAT: {
      id: 'float',
      title: '浮动时间 (Float / Slack)',
      formula: 'Float = LS − ES 或 Float = LF − EF',
      variables: [
        { symbol: 'Float', name: '浮动时间（总浮动时间 Total Float）' },
        { symbol: 'LS', name: '最晚开始 (Late Start)' },
        { symbol: 'ES', name: '最早开始 (Early Start)' },
        { symbol: 'LF', name: '最晚完成 (Late Finish)' },
        { symbol: 'EF', name: '最早完成 (Early Finish)' }
      ],
      example: {
        scenario: '某活动 ES=10，EF=18，LS=14，LF=22。',
        steps: [
          'Float = LS − ES = 14 − 10 = 4 天',
          '验证：Float = LF − EF = 22 − 18 = 4 天（一致）'
        ],
        conclusion: '该活动有 4 天总浮动时间，可延迟最多 4 天而不影响项目总工期。'
      },
      tips: '总浮动时间 (Total Float) = LS−ES = LF−EF。自由浮动时间 (Free Float) = 后续活动最早 ES − 本活动 EF。关键路径上所有活动 Float = 0。',
      colorHint: 'neutral'
    },

    // --- Earned Value basic building blocks ---
    EV: {
      id: 'ev',
      title: '挣值 (Earned Value)',
      formula: 'EV = BAC × 实际完成百分比',
      variables: [
        { symbol: 'EV', name: '挣值' },
        { symbol: 'BAC', name: '完工预算' },
        { symbol: '%Complete', name: '实际完成百分比（基于 BAC 的完成比例）' }
      ],
      example: {
        scenario: 'BAC = ¥200 万，到第 3 个月实际完成了 25% 的工作。',
        steps: [
          'EV = ¥200万 × 25% = ¥50 万'
        ],
        conclusion: '项目实际"挣得"了 ¥50 万的价值。'
      },
      tips: 'EV 是 EVM 的核心。注意区分：不能简单用花费了多少来衡量进度，必须用实际完成的工作价值。',
      colorHint: 'neutral'
    }
  };

  /* ===================================================================
   *  BUILT-IN COMPARISON TABLES
   * =================================================================== */

  const COMPARISONS = {
    qualVsQuant: {
      title: '定性风险分析 vs 定量风险分析',
      rows: [
        ['维度', '定性分析 (Qualitative)', '定量分析 (Quantitative)'],
        ['目的', '排序风险优先级', '量化风险对项目的数值影响'],
        ['方法', '概率影响矩阵、风险分类、紧迫性评估', 'EMV、蒙特卡洛模拟、决策树、敏感性分析'],
        ['输入', '风险登记册、风险概率影响定义', '风险登记册、成本/进度估算、历史数据'],
        ['输出', '风险排序列表、重点关注风险清单', '量化风险暴露值、概率分布、应急储备金额'],
        ['精度', '主观、相对排序', '客观、数值化'],
        ['时机', '风险识别后尽快进行，可反复', '定性分析后，对高优先级风险进行'],
        ['成本', '低、快速', '高、需要数据和工具'],
        ['谁做', '项目团队 + 风险专家', '需要建模专家和数据分析能力']
      ]
    },
    crashingVsFastTracking: {
      title: '赶工 vs 快速跟进',
      rows: [
        ['维度', '赶工 (Crashing)', '快速跟进 (Fast Tracking)'],
        ['定义', '增加资源以缩短工期', '将原本串行的活动改为并行或重叠'],
        ['成本影响', '通常增加成本（加班费、额外资源）', '成本几乎不变'],
        ['风险', '风险较低，但额外资源需要磨合', '风险显著增加（返工可能性变大）'],
        ['前提', '活动可以被额外资源加速', '活动之间存在可重叠的依赖关系'],
        ['适用场景', '关键路径活动、资源可获取', '依赖关系非强制性、风险可接受'],
        ['成本-进度', '用成本换时间', '用风险换时间'],
        ['局限性', '收益递减，并非无限加速', '不是所有活动都能并行']
      ]
    },
    cpffVsCpifVsFp: {
      title: '合同类型对比',
      rows: [
        ['维度', 'CPFF\n(成本+固定酬金)', 'CPIF\n(成本+激励酬金)', 'FP\n(固定总价)'],
        ['买方风险', '高 — 买方承担所有成本超支', '中等 — 双方共担', '低 — 卖方承担成本风险'],
        ['卖方风险', '低 — 保证有酬金', '中等 — 酬金取决于绩效', '高 — 成本估算不准则亏损'],
        ['成本控制动力', '卖方无动力控成本', '卖方有动力控成本（分享节余）', '卖方最大动力控成本'],
        ['范围确定性', '范围模糊、不确定', '范围较清楚、有目标', '范围清晰、定义完备'],
        ['适用场景', '研发、紧急项目', '有明确目标绩效的项目', '成熟、标准化的采购'],
        ['合同管理成本', '高 — 需审计成本', '中 — 需跟踪目标', '低 — 仅验收交付物']
      ]
    },
    configVsNonConfig: {
      title: '配置管理 vs 非配置变更',
      rows: [
        ['维度', '配置变更\n(Configuration Change)', '非配置变更\n(Non-Configuration Change)'],
        ['定义', '影响产品范围/功能/性能的变更', '不影响产品范围，仅影响项目过程'],
        ['示例', '增加一项功能、修改技术规格', '调整进度计划、更换团队成员'],
        ['审批', 'CCB（变更控制委员会）审批', '项目经理可自行审批'],
        ['影响', '影响合同、验收标准', '影响管理计划、资源分配'],
        ['记录', '配置管理计划 + 配置状态记录', '项目文件更新']
      ]
    },
    pushVsPull: {
      title: '推式沟通 vs 拉式沟通 vs 交互式沟通',
      rows: [
        ['维度', '推式 (Push)', '拉式 (Pull)', '交互式 (Interactive)'],
        ['定义', '主动发送给特定接收方', '接收方自行访问获取', '双方/多方实时交换'],
        ['示例', '邮件、报告、备忘录', '内网、知识库、项目管理信息系统', '会议、电话、视频会议'],
        ['适用', '信息需要确保送达', '信息量大、非紧急', '需要讨论、达成共识'],
        ['优点', '确保接收方收到', '按需获取、信息量大', '即时反馈、高效达成一致'],
        ['缺点', '信息可能被忽略', '接收方可能不主动查看', '协调时间成本高'],
        ['何时用', '状态报告、通知', '政策、程序、模板', '解决问题、谈判、头脑风暴']
      ]
    },
    presentValue: {
      title: '现值 (PV) / 净现值 (NPV) / IRR / BCR 对比',
      rows: [
        ['指标', '公式/定义', '判断标准', '特点'],
        ['PV\n(现值)', 'FV ÷ (1+r)ⁿ', '越大越好', '仅考虑未来现金流折现'],
        ['NPV\n(净现值)', 'Σ[CFₜ÷(1+r)ᵗ] − 初始投资', 'NPV > 0 可接受\n越大越好', '考虑了所有现金流和初始投资'],
        ['IRR\n(内部收益率)', '使 NPV=0 的折现率', 'IRR > 资金成本\n越高越好', '反映项目收益率百分比'],
        ['BCR\n(效益成本比)', '总收益现值 ÷ 总成本现值', 'BCR > 1 可接受\n越大越好', '直观比较投入产出比'],
        ['ROI\n(投资回报率)', '(收益−成本)÷成本 ×100%', '越高越好', '简单百分比，不考虑时间价值'],
        ['Payback\n(回收期)', '累计现金流回正的时间', '越短越好', '不考虑回收后的现金流']
      ]
    }
  };

  /* ===================================================================
   *  TOP 30 PMP ABBREVIATIONS
   * =================================================================== */

  const ABBREVIATIONS = [
    { abbr: 'AC',     full: 'Actual Cost',                          cn: '实际成本' },
    { abbr: 'BAC',    full: 'Budget at Completion',                 cn: '完工预算' },
    { abbr: 'CCB',    full: 'Change Control Board',                 cn: '变更控制委员会' },
    { abbr: 'CPI',    full: 'Cost Performance Index',               cn: '成本绩效指数' },
    { abbr: 'CPFF',   full: 'Cost Plus Fixed Fee',                  cn: '成本加固定酬金合同' },
    { abbr: 'CPIF',   full: 'Cost Plus Incentive Fee',              cn: '成本加激励酬金合同' },
    { abbr: 'CPM',    full: 'Critical Path Method',                 cn: '关键路径法' },
    { abbr: 'CR',     full: 'Change Request',                       cn: '变更请求' },
    { abbr: 'CV',     full: 'Cost Variance',                        cn: '成本偏差' },
    { abbr: 'EAC',    full: 'Estimate at Completion',               cn: '完工估算' },
    { abbr: 'EF',     full: 'Early Finish',                         cn: '最早完成' },
    { abbr: 'EMV',    full: 'Expected Monetary Value',              cn: '预期货币价值' },
    { abbr: 'ES',     full: 'Early Start',                          cn: '最早开始' },
    { abbr: 'ETC',    full: 'Estimate to Complete',                 cn: '完工尚需估算' },
    { abbr: 'EV',     full: 'Earned Value',                         cn: '挣值' },
    { abbr: 'EVM',    full: 'Earned Value Management',              cn: '挣值管理' },
    { abbr: 'FP',     full: 'Fixed Price',                          cn: '固定总价合同' },
    { abbr: 'IRR',    full: 'Internal Rate of Return',              cn: '内部收益率' },
    { abbr: 'LF',     full: 'Late Finish',                          cn: '最晚完成' },
    { abbr: 'LS',     full: 'Late Start',                           cn: '最晚开始' },
    { abbr: 'NPV',    full: 'Net Present Value',                    cn: '净现值' },
    { abbr: 'OPA',    full: 'Organizational Process Assets',        cn: '组织过程资产' },
    { abbr: 'PERT',   full: 'Program Evaluation & Review Technique',cn: '计划评审技术' },
    { abbr: 'PMBOK',  full: 'Project Mgmt Body of Knowledge',       cn: '项目管理知识体系' },
    { abbr: 'PMIS',   full: 'Project Mgmt Information System',      cn: '项目管理信息系统' },
    { abbr: 'PV',     full: 'Planned Value',                        cn: '计划价值' },
    { abbr: 'RACI',   full: 'Responsible,Accountable,Consult,Inform',cn: '责任分配矩阵' },
    { abbr: 'SPI',    full: 'Schedule Performance Index',           cn: '进度绩效指数' },
    { abbr: 'SV',     full: 'Schedule Variance',                    cn: '进度偏差' },
    { abbr: 'TCPI',   full: 'To-Complete Performance Index',        cn: '完工尚需绩效指数' },
    { abbr: 'VAC',    full: 'Variance at Completion',               cn: '完工偏差' },
    { abbr: 'WBS',    full: 'Work Breakdown Structure',             cn: '工作分解结构' }
  ];

  /* ===================================================================
   *  HELPER: CSS color class based on numeric hint
   * =================================================================== */

  function colorClass(value, hint) {
    if (hint === 'positive-negative') {
      if (value > 0) return 'pmp-good';
      if (value < 0) return 'pmp-bad';
      return '';
    }
    return '';
  }

  function sign(num) {
    return num > 0 ? '+' : '';
  }

  /* ===================================================================
   *  generateFormulaCard
   * =================================================================== */

  function generateFormulaCard({ title, formula, variables, example, tips, colorHint } = {}) {
    const id = 'pmp-card-' + Math.random().toString(36).slice(2, 8);

    const tipsClass = colorHint === 'positive-negative'
      ? 'pmp-tips-posneg'
      : '';

    return `
<div class="pmp-formula-card" id="${id}">
  <style>
    .pmp-formula-card {
      background: var(--color-surface2, #1e1e2e);
      border: 1px solid var(--color-border, #333);
      border-radius: 10px;
      margin: 14px 0;
      overflow: hidden;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    .pmp-formula-card .pmp-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 14px 18px;
      cursor: pointer;
      user-select: none;
      transition: background 0.15s;
    }
    .pmp-formula-card .pmp-header:hover {
      background: rgba(255,255,255,0.03);
    }
    .pmp-formula-card .pmp-header h3 {
      margin: 0;
      font-size: 1rem;
      color: var(--color-text, #e0e0e0);
      font-weight: 600;
    }
    .pmp-formula-card .pmp-header .pmp-chevron {
      font-size: 0.7rem;
      color: var(--color-text3, #999);
      transition: transform 0.25s;
    }
    .pmp-formula-card.pmp-expanded .pmp-header .pmp-chevron {
      transform: rotate(180deg);
    }

    .pmp-formula-card .pmp-body {
      display: none;
      padding: 0 18px 18px;
      border-top: 1px solid var(--color-border, #333);
    }
    .pmp-formula-card.pmp-expanded .pmp-body {
      display: block;
    }

    /* Formula display */
    .pmp-formula-card .pmp-formula-box {
      background: linear-gradient(135deg, rgba(88,101,242,0.12), rgba(88,101,242,0.04));
      border: 1px dashed var(--color-primary, #5865f2);
      border-radius: 8px;
      padding: 14px 18px;
      margin: 14px 0;
      text-align: center;
    }
    .pmp-formula-card .pmp-formula-box .pmp-formula-text {
      font-size: 1.35rem;
      font-weight: 700;
      color: var(--color-primary, #5865f2);
      letter-spacing: 0.03em;
      font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace;
    }

    /* Variables table */
    .pmp-formula-card .pmp-vars {
      width: 100%;
      border-collapse: collapse;
      margin: 10px 0;
      font-size: 0.88rem;
    }
    .pmp-formula-card .pmp-vars th {
      text-align: left;
      padding: 6px 8px;
      color: var(--color-text3, #999);
      font-weight: 500;
      font-size: 0.78rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      border-bottom: 1px solid var(--color-border, #333);
    }
    .pmp-formula-card .pmp-vars td {
      padding: 7px 8px;
      vertical-align: top;
      border-bottom: 1px solid rgba(128,128,128,0.1);
    }
    .pmp-formula-card .pmp-vars .pmp-sym {
      font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace;
      font-weight: 700;
      color: var(--color-primary, #5865f2);
      white-space: nowrap;
    }
    .pmp-formula-card .pmp-vars .pmp-name {
      color: var(--color-text, #e0e0e0);
    }

    /* Example */
    .pmp-formula-card .pmp-section-title {
      font-size: 0.82rem;
      font-weight: 700;
      color: var(--color-text2, #bbb);
      text-transform: uppercase;
      letter-spacing: 0.06em;
      margin: 16px 0 6px;
    }
    .pmp-formula-card .pmp-scenario {
      background: rgba(255,255,255,0.03);
      border-left: 3px solid var(--color-warning, #e5a83e);
      padding: 10px 14px;
      border-radius: 0 6px 6px 0;
      font-size: 0.88rem;
      color: var(--color-text2, #bbb);
      line-height: 1.6;
      margin: 8px 0;
    }
    .pmp-formula-card .pmp-steps {
      list-style: none;
      padding: 0;
      margin: 8px 0;
      counter-reset: step;
    }
    .pmp-formula-card .pmp-steps li {
      counter-increment: step;
      padding: 6px 0 6px 32px;
      position: relative;
      font-size: 0.88rem;
      color: var(--color-text, #e0e0e0);
      line-height: 1.55;
    }
    .pmp-formula-card .pmp-steps li::before {
      content: counter(step);
      position: absolute;
      left: 0;
      top: 6px;
      width: 22px;
      height: 22px;
      line-height: 22px;
      text-align: center;
      background: var(--color-primary, #5865f2);
      color: #fff;
      font-size: 0.72rem;
      font-weight: 700;
      border-radius: 50%;
    }
    .pmp-formula-card .pmp-conclusion {
      background: rgba(88,101,242,0.07);
      border-radius: 6px;
      padding: 10px 14px;
      font-size: 0.88rem;
      color: var(--color-text, #e0e0e0);
      line-height: 1.6;
      margin: 8px 0;
    }
    .pmp-formula-card .pmp-conclusion strong {
      color: var(--color-primary, #5865f2);
    }

    /* Tips */
    .pmp-formula-card .pmp-tips {
      background: rgba(255,255,255,0.03);
      border-radius: 6px;
      padding: 9px 14px;
      font-size: 0.84rem;
      color: var(--color-text2, #bbb);
      line-height: 1.6;
      margin: 10px 0 0;
    }
    .pmp-formula-card .pmp-tips::before {
      content: "💡 提示：";
      font-weight: 600;
      color: var(--color-warning, #e5a83e);
    }

    /* Color indicators */
    .pmp-good { color: var(--color-success, #3ba55c); font-weight: 600; }
    .pmp-bad  { color: var(--color-danger, #ed4245);  font-weight: 600; }

    .pmp-formula-card .pmp-tips-posneg .pmp-good { display: block; }
    .pmp-formula-card .pmp-tips-posneg .pmp-bad  { display: block; }
  </style>

  <div class="pmp-header" onclick="
    var card = document.getElementById('${id}');
    card.classList.toggle('pmp-expanded');
  ">
    <h3>📐 ${escapeHTML(title)}</h3>
    <span class="pmp-chevron">▼</span>
  </div>

  <div class="pmp-body">
    <div class="pmp-formula-box">
      <div class="pmp-formula-text">${escapeHTML(formula)}</div>
    </div>

    ${variables && variables.length ? `
    <table class="pmp-vars">
      <thead><tr><th>符号</th><th>全称</th></tr></thead>
      <tbody>
        ${variables.map(function(v) { return `
        <tr>
          <td class="pmp-sym">${escapeHTML(v.symbol)}</td>
          <td class="pmp-name">${escapeHTML(v.name)}</td>
        </tr>`; }).join('')}
      </tbody>
    </table>
    ` : ''}

    ${example ? `
    <div class="pmp-section-title">📋 实例演算</div>
    <div class="pmp-scenario">${escapeHTML(example.scenario)}</div>
    <ol class="pmp-steps">
      ${example.steps.map(function(s) { return '<li>' + escapeHTML(s) + '</li>'; }).join('')}
    </ol>
    <div class="pmp-conclusion"><strong>结论：</strong>${escapeHTML(example.conclusion)}</div>
    ` : ''}

    ${tips ? `
    <div class="pmp-tips ${tipsClass}">${escapeHTML(tips)}</div>
    ` : ''}
  </div>
</div>`;
  }

  /* ===================================================================
   *  generateComparisonTable
   * =================================================================== */

  function generateComparisonTable({ title, rows } = {}) {
    if (!rows || !rows.length) return '';

    const header = rows[0];
    const body = rows.slice(1);

    return `
<div class="pmp-compare">
  <style>
    .pmp-compare {
      background: var(--color-surface2, #1e1e2e);
      border: 1px solid var(--color-border, #333);
      border-radius: 10px;
      margin: 14px 0;
      overflow-x: auto;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    .pmp-compare h3 {
      margin: 0;
      padding: 14px 18px 10px;
      font-size: 1rem;
      color: var(--color-text, #e0e0e0);
      font-weight: 600;
    }
    .pmp-compare table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.84rem;
      min-width: 640px;
    }
    .pmp-compare thead th {
      background: rgba(88,101,242,0.1);
      color: var(--color-primary, #5865f2);
      font-weight: 700;
      padding: 10px 12px;
      text-align: left;
      white-space: pre-line;
      font-size: 0.82rem;
      border-bottom: 2px solid var(--color-primary, #5865f2);
    }
    .pmp-compare thead th:first-child {
      color: var(--color-text3, #999);
      font-weight: 500;
      min-width: 100px;
    }
    .pmp-compare tbody td {
      padding: 9px 12px;
      color: var(--color-text, #e0e0e0);
      border-bottom: 1px solid rgba(128,128,128,0.08);
      vertical-align: top;
      line-height: 1.5;
      white-space: pre-line;
    }
    .pmp-compare tbody td:first-child {
      color: var(--color-text2, #bbb);
      font-weight: 600;
    }
    .pmp-compare tbody tr:nth-child(even) td {
      background: rgba(255,255,255,0.015);
    }
    .pmp-compare tbody tr:hover td {
      background: rgba(255,255,255,0.04);
    }
  </style>
  <h3>📊 ${escapeHTML(title)}</h3>
  <table>
    <thead>
      <tr>${header.map(function(h) { return '<th>' + escapeHTML(h) + '</th>'; }).join('')}</tr>
    </thead>
    <tbody>
      ${body.map(function(row) {
        return '<tr>' + row.map(function(cell) { return '<td>' + escapeHTML(cell) + '</td>'; }).join('') + '</tr>';
      }).join('')}
    </tbody>
  </table>
</div>`;
  }

  /* ===================================================================
   *  generateAbbrGuide
   * =================================================================== */

  function generateAbbrGuide() {
    return `
<div class="pmp-abbr-guide">
  <style>
    .pmp-abbr-guide {
      background: var(--color-surface2, #1e1e2e);
      border: 1px solid var(--color-border, #333);
      border-radius: 10px;
      margin: 14px 0;
      padding: 18px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      max-height: 560px;
      overflow-y: auto;
    }
    .pmp-abbr-guide h3 {
      margin: 0 0 14px;
      font-size: 1rem;
      color: var(--color-text, #e0e0e0);
      font-weight: 600;
      position: sticky;
      top: -18px;
      background: var(--color-surface2, #1e1e2e);
      padding: 6px 0;
      z-index: 1;
    }
    .pmp-abbr-guide .pmp-abbr-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 4px 12px;
    }
    .pmp-abbr-guide .pmp-abbr-item {
      display: flex;
      align-items: baseline;
      padding: 7px 10px;
      border-radius: 5px;
      transition: background 0.12s;
    }
    .pmp-abbr-guide .pmp-abbr-item:hover {
      background: rgba(255,255,255,0.04);
    }
    .pmp-abbr-guide .pmp-abbr-code {
      font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace;
      font-weight: 700;
      color: var(--color-primary, #5865f2);
      min-width: 56px;
      font-size: 0.86rem;
    }
    .pmp-abbr-guide .pmp-abbr-full {
      color: var(--color-text, #e0e0e0);
      font-size: 0.84rem;
      flex: 1;
    }
    .pmp-abbr-guide .pmp-abbr-cn {
      color: var(--color-text3, #999);
      font-size: 0.78rem;
      margin-left: 6px;
    }
  </style>
  <h3>📖 PMP 常用缩写速查 (TOP 30)</h3>
  <div class="pmp-abbr-grid">
    ${ABBREVIATIONS.map(function(a) { return `
    <div class="pmp-abbr-item">
      <span class="pmp-abbr-code">${escapeHTML(a.abbr)}</span>
      <span class="pmp-abbr-full">${escapeHTML(a.full)}</span>
      <span class="pmp-abbr-cn">${escapeHTML(a.cn)}</span>
    </div>`; }).join('')}
  </div>
</div>`;
  }

  /* ===================================================================
   *  HELPERS: Generate cards from presets
   * =================================================================== */

  /** Return a formula-card HTML string for a built-in formula by key. */
  function getPresetFormulaCard(key) {
    var f = FORMULAS[key];
    if (!f) return '<p style="color:var(--color-danger)">Unknown formula key: ' + escapeHTML(String(key)) + '</p>';
    return generateFormulaCard({
      title: f.title,
      formula: f.formula,
      variables: f.variables,
      example: f.example,
      tips: f.tips,
      colorHint: f.colorHint
    });
  }

  /** Return HTML for all built-in formula cards. */
  function getAllFormulaCards() {
    return Object.keys(FORMULAS).map(function(k) {
      return getPresetFormulaCard(k);
    }).join('\n');
  }

  /** Return EVM-only formula cards (core + advanced). */
  function getEVMFormulaCards() {
    var keys = ['SV', 'CV', 'SPI', 'CPI', 'EV', 'TCPI', 'EAC', 'ETC', 'VAC'];
    return keys.map(function(k) { return getPresetFormulaCard(k); }).join('\n');
  }

  /** Return a comparison-table HTML string for a built-in comparison by key. */
  function getPresetComparisonTable(key) {
    var c = COMPARISONS[key];
    if (!c) return '<p style="color:var(--color-danger)">Unknown comparison key: ' + escapeHTML(String(key)) + '</p>';
    return generateComparisonTable({ title: c.title, rows: c.rows });
  }

  /** Return HTML for all built-in comparison tables. */
  function getAllComparisonTables() {
    return Object.keys(COMPARISONS).map(function(k) {
      return getPresetComparisonTable(k);
    }).join('\n');
  }

  /* ===================================================================
   *  UTILITY
   * =================================================================== */

  function escapeHTML(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /* ===================================================================
   *  EXPORT
   * =================================================================== */

  var api = {
    // Core generators
    generateFormulaCard: generateFormulaCard,
    generateComparisonTable: generateComparisonTable,
    generateAbbrGuide: generateAbbrGuide,

    // Preset accessors
    FORMULAS: FORMULAS,
    COMPARISONS: COMPARISONS,
    ABBREVIATIONS: ABBREVIATIONS,
    getPresetFormulaCard: getPresetFormulaCard,
    getAllFormulaCards: getAllFormulaCards,
    getEVMFormulaCards: getEVMFormulaCards,
    getPresetComparisonTable: getPresetComparisonTable,
    getAllComparisonTables: getAllComparisonTables,

    // Utility
    escapeHTML: escapeHTML
  };

  // Support CommonJS, AMD, and browser global
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  } else if (typeof define === 'function' && define.amd) {
    define(function () { return api; });
  } else {
    global.PmpFormulaCards = api;
  }

})(typeof window !== 'undefined' ? window : this);

// ES module export
export default (typeof window !== 'undefined' ? window.PmpFormulaCards : undefined);
