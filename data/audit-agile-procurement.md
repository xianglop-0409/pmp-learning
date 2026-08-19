# PMP 学习机「15个敏捷概念 + 采购过程」知识覆盖度审计报告

审计依据：《敏捷实践指南》与 PMBOK 第8版。数据来源：`knowledge-content.js`（正文）+ `knowledge-graph.js`（desc/tips/itto 补充）。以下"缺失"指正文中未覆盖、或仅提及一句而无实质讲解的知识点。

## 一、总览表

敏捷节点维度：①核心定义 ②关键概念 ③框架/方法要素 ④与传统对比 ⑤实践/工具 ⑥度量指标 ⑦考试重点
采购节点维度：A过程目的 B输入/工具/输出 C合同类型详解 D考试重点

| 节点 | 字数 | 已覆盖维度 | 缺失/薄弱维度 |
|---|---|---|---|
| agile-manifesto | 681 | ①②⑦ | ④⑤（缺与传统对比、宣言→原则→实践落地） |
| agile-lifecycle | 642 | ①②⑦ | ⑤（各生命周期特征与选择考量薄弱） |
| agile-scrum | 459 | ①②③⑦ | ④⑤⑥（最薄且最常考） |
| agile-servant-leader | 646 | ①②④⑦ | ⑤（障碍分类、教练式工具少） |
| agile-kanban | 533 | ①②③⑤⑥⑦ | ④（无与传统预测对比；缺服务类别/吞吐量） |
| agile-hybrid | 660 | ①②③④⑦ | ⑤（缺具体场景案例与切换决策方法） |
| agile-metrics | 578 | ①②④⑥⑦ | ⑤（CFD识别瓶颈机制、吞吐量、Forecast缺失） |
| agile-xp | 647 | ①②③⑦ | ④⑤（无传统对比；TDD/结对细节薄） |
| agile-lean | 495 | ①②③⑥ | ④（缺拉动vs推动、单件流、Kaizen细化） |
| agile-estimation | 470 | ①②⑤⑥⑦ | ④（缺与传统估算对比、校准与Release规划） |
| agile-risk | 541 | ①②④⑤⑥⑦ | ③（缺风险作为Backlog工作项的整合机制） |
| agile-contracts | 561 | ①②③④⑦ | ⑤（缺买方/卖方风险分布对比，与采购节点未衔接） |
| agile-scaled | 469 | ①②③⑦ | ⑤⑥（缺组件vs特性团队、Nexus、规模化度量与角色） |
| agile-change-mgmt | 491 | ①②③④⑦ | ⑥（缺变革度量；采纳曲线/阻力类型薄） |
| agile-charter | 573 | ①②③④⑤⑦ | 整体较完整，仅缺创建时机/持续更新 |
| proc-plan-procurement | 530 | ABD | C（合同类型变体FPIF/CPAF/CPPC、风险分配矩阵缺失） |
| proc-conduct-procurement | 563 | ABD | 建议书评价方法、谈判策略BATNA、履约保证缺失 |
| proc-control-procurement | 546 | ABD | 索赔处理流程、提前终止、EVM在采购中应用缺失 |

## 二、逐节点缺失的具体知识点

**agile-manifesto**：缺与预测型(瀑布)的系统对比（计划驱动vs价值驱动、文档vs可工作软件），缺"12原则中哪几条是高频考点"的标注；仅提及"思维模式"一词，未展开价值观→原则→实践→框架的层次关系。

**agile-lifecycle**：缺各生命周期详细特征（预测型需早期冻结需求/低变更率；迭代型靠原型反馈；增量型按可交付物计费价值；敏捷=迭代+增量、变更常态化）；缺生命周期选择考量（组织文化、团队经验、风险容忍度、交付频率要求）与"项目早期需求不确定时如何裁剪"。

**agile-scrum**（最薄弱）：①缺 DoD 与验收标准(AC)的区分——DoD是团队对"完成"的共同定义，AC是单个用户故事的接受条件，两者易混；②缺 Sprint Goal 冲刺目标（2020 Scrum指南核心）；③缺 Backlog 精化/细化会议；④缺 Sprint 取消规则（PO可在Sprint中取消，只有PO有权）；⑤缺 Scrum 5大价值观（承诺/专注/开放/尊重/勇气）；⑥缺 Sprint 燃尽图这一冲刺级度量（Velocity在 metrics 节点已有）；⑦缺自组织团队与传统命令式团队对比；⑧缺"传统项目经理转SM/PO角色"场景。

**agile-servant-leader**：缺具体障碍分类（组织障碍/过程障碍/资源障碍）、教练式辅导(COR/Care框架)、心理安全与团队信任建设工具、授权(Empowerment)如何落地为自组织的具体机制。

**agile-kanban**：缺看板系统设计（泳道/列/卡片信息、WIP上限如何设定）；缺服务类别(Service Classes：紧急/固定日期/标准/无形)；缺吞吐量(Throughput)度量；缺看板"渐进式变更、不推翻现有流程"的管理哲学；缺与预测型（批处理、看板vs甘特图）的对比。

**agile-hybrid**：缺具体混合场景案例（如硬件用预测+软件用敏捷、阶段门+迭代并存）；缺"项目哪部分用哪种方法"的分区决策方法（斯泰西模型应用到子组件）；缺混合型下变更/风险/质量/沟通如何在两套体系间衔接。

**agile-metrics**：缺累积流图(CFD)识别瓶颈的具体机制（某列带宽持续变宽=该阶段积压；曲线垂直间距增大=WIP上升、交付周期拉长）；缺吞吐量指标；缺"基于Velocity的Forecast预测方法"（如按稳定速率推算剩余Sprint数）；缺度量误用在敏捷中的具体表现。

**agile-xp**：缺与传统开发对比（文档驱动vs测试驱动、预先设计vs重构）；缺 TDD"红-绿-重构"循环流程；缺结对编程角色分工（驾驶员/领航员）；缺各实践的适用场景（现场客户的变体——产品负责人角色）。

**agile-lean**：缺单件流(Single-Piece Flow)概念；缺拉动系统vs推动系统(Push/Pull)的对比；缺 Kaizen 持续改进在迭代中的落地；缺知识工作中TIMWOOD各浪费的具体实例（如"等待"=评审积压）。

**agile-estimation**：缺基准故事点/校准故事(Reference Story)方法；缺 Velocity 在 Release 规划（发布计划推算交付日期）中的应用；缺估算不确定性的表达（范围vs单点）；缺"团队集体估算vs个人拍板"的原则；缺与传统估算（专家判断/类比/参数）的对比维度。

**agile-risk**：缺"风险作为Backlog工作项"（风险故事、风险储备在迭代中排期）；缺敏捷风险应对与传统5策略的映射；缺轻量风险登记册；缺 Sprint 规划中如何为高风险工作预留时间盒。

**agile-contracts**：缺买方/卖方风险分布的量化对比（与 proc-plan-procurement 节点衔接互引）；缺多供应商协作与集成治理；缺"总成本与变更成本"权衡；缺敏捷合同的验收/回款里程碑设计。

**agile-scaled**：缺组件团队vs特性团队(Feature Team)的权衡——规模化关键考点；缺 Nexus 框架（graph tips提及但正文无）；缺规模化角色（Release Train Engineer、Product Manager、Chief PO）；缺跨团队依赖管理工具（PI Planning 依赖板）；缺规模化度量（跨团队Velocity、发布燃尽图）。

**agile-change-mgmt**：缺变革度量（采用率、使用率、员工净推荐值）；缺创新采纳曲线与变革阻力类型（被动/主动抵制）；缺 ADKAR 在敏捷转型中的具体应用示例。

**agile-charter**：整体最完整。仅缺章程的创建时机（项目启动前）、持续更新/定期重审、与项目启动会(Kickoff)及 Proc-start-project 节点的衔接。

**proc-plan-procurement**：①缺合同类型变体：FPIF(固定总价加激励)、FP-EPA(固定总价加经济价格调整)、CPAF(成本加酬金)、CPPC(成本百分比酬金——风险最高、一般不推荐)；②缺"买方/卖方风险分配矩阵"系统对比（FP卖方担险最高→T&M→CR买方担险最高）；③缺独立成本估算(Independent Cost Estimate，买方内部估算用于识别虚假低价)；④缺招标文件内容（采购SOW/工作说明书、评价标准）；⑤缺采购策略四要素（交付方式/支付方式/采购阶段/进度）；⑥缺法律法规与可持续采购考量（PMBOK8 强调）。

**proc-conduct-procurement**：①缺建议书评价方法详解（加权评分法、筛选系统Screening、独立成本估算比较）；②缺谈判策略与 BATNA（最佳替代方案）、立场vs利益谈判；③缺投标保证/履约保证/履约保证金概念；④缺对"明显低于独立估算"报价的甄别；⑤缺分包商管理与供应商资格证明（财务/资质审查）。

**proc-control-procurement**：①缺索赔管理流程（索赔提出→协商→调解ADR→仲裁/诉讼的升级路径，诉讼是最后手段）；②缺合同提前终止的两种情形（便利终止 vs 违约终止）与费用结算；③缺 EVM 指标用于采购绩效评估；④缺供应商绩效记分卡（Supplier Scorecard）；⑤缺"合同变更令/变更单"的书面程序（内容仅提到附录）；⑥缺结算(Settlement)与最终付款争议处理。

## 三、优先级（最需要补充的8个节点）

1. **agile-scrum**（459字最薄 + 考试最常考，缺 DoD vs 验收标准、Sprint Goal）
2. **proc-plan-procurement**（合同类型是高频考点，缺 FPIF/CPAF 变体与风险矩阵）
3. **agile-metrics**（度量必考，缺 CFD 瓶颈机制、吞吐量、Forecast）
4. **agile-lifecycle**（必考，缺生命周期特征与选择考量）
5. **agile-estimation**（470字偏薄，缺校准与 Release 规划应用）
6. **agile-scaled**（469字最薄之一，缺组件vs特性团队、Nexus、扩展角色）
7. **proc-conduct-procurement**（缺建议书评价方法与谈判策略）
8. **agile-kanban**（缺服务类别、吞吐量、渐进式原则）

## 四、补充建议（按优先级）

**1. agile-scrum（+350字）**：新增一段"DoD vs 验收标准：DoD是团队级通用'完成'核对清单，AC是单条用户故事的可测试条件"；补充 Sprint Goal（每次冲刺的北极星）、Backlog 精化会议（PO与团队定期拆解故事）、Sprint 取消（仅PO有权，取消后已完成部分评审并复盘）、5大价值观；将Sprint燃尽图并入本文（metrics节点只保留Velocity/CFD）。

**2. proc-plan-procurement（+300字）**：新增"合同类型全谱系"段落：FP→FPIF→FP-EPA→T&M→CPFF→CPIF→CPAF→CPPC，逐类标注买方/卖方风险高低与适用场景（范围明确用FP、范围模糊+高不确定性用CPIF/CPAF、严禁CPPC）；补充独立成本估算与招标文件构成。

**3. agile-metrics（+250字）**：用3-4行写清 CFD 判读规则（列带宽增宽=积压/瓶颈；曲线垂直间距=平均WIP，利特尔法则推算交付周期；出现平行线时看斜率判断是否趋于稳定）；补吞吐量定义与"Velocity+吞吐量"双指标互补；补 Forecast 示例（稳定Velocity÷剩余故事点=预期Sprint数）。

**4. agile-lifecycle（+250字）**：为四种生命周期各补1-2条"特征/变更容忍度/交付频率/度量方式"；补选择考量四要素（组织文化、团队经验、需求与技术不确定性、风险偏好）一句，明确"无完美生命周期，需裁剪"。

**5. agile-estimation（+200字）**：补"基准故事点（Reference Story）"校准法；补 Release 规划示例（120点剩余÷Velocity 30=4个Sprint）；补原则"估算由执行工作的团队共同完成，不用个人拍板"；点一句与传统类比/参数估算的本质区别。

**6. agile-scaled（+250字）**：补组件团队vs特性团队对比（特性团队跨职能、减少交接、规模化推荐；组件团队复用好但协调成本高）；补 Nexus（3-9个Scrum团队集成增量）一句；补扩展角色（RTE/Product Manager/Chief PO）；补规模化度量的警告（不跨团队比Velocity）。

**7. proc-conduct-procurement（+200字）**：补建议书评价三方法（加权评分=技术+价格按权重；筛选系统=资格预审一票否决；独立成本估算比较=识别低价陷阱）；补谈判的BATNA与"对事不对人"；补投标/履约保证概念一句。

**8. agile-kanban（+200字）**：补服务类别（紧急/固定交付日期/标准/无形）与泳道；补吞吐量与交付速率；补"看板是渐进式改良，不推翻现有流程"的管理哲学（与变革管理呼应）。

**次要建议**：agile-contracts 与 proc-plan-procurement 互加关联引用，避免重复；agile-change-mgmt 补采用率/使用率两类度量；agile-xp 补 TDD 红-绿-重构一句话；agile-manifesto 补一句"左边优先但右边仍有价值"的考试陷阱已具备，可加"宣言发表背景（2001年）"；agile-risk 补"风险故事写入Backlog排期"一句。

> 说明：proc-control-procurement 正文实际546字（上表已修正，非1140）。全部18个节点单节点字数均未达到文件头声明的"1000-3000字符"标准，整体偏薄；建议优先用上表8个节点扩容，兼顾字数达标与考点覆盖。
