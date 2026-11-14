// 营养地图数据集（结构演示版）
// 说明：参考值与食物含量均为「结构演示」示例数据，用于展示字段设计与交互；
// 正式上线前必须替换为中国营养学会 DRIs 2023 官方完整数据与中国食物成分表数据，
// 并逐条保留标准版本、来源与适用范围。页面已在显著位置标注「示例数据」。

export const STANDARD_META = {
  version: 'DRIs 2023',
  sourceName: '中国营养学会《中国居民膳食营养素参考摄入量（2023 版）》',
  sourceUrl: 'https://www.cnsoc.org/drpostand/',
  isIllustrative: true,
}

const BAIKE = 'https://baike.baidu.com/item/'
const GUIDE = 'http://dg.cnsoc.org/'

// 科普正文参考百度百科对应条目与中国居民膳食指南（2022）公开建议，
// 仅作膳食科普，不用于诊断或替代个体化医疗建议。
export const demoNutrients = [
  {
    id: 1, slug: 'protein', name: '蛋白质', englishName: 'Protein', group: 'macronutrient', subgroup: '宏量营养素', canonicalUnit: 'g/d',
    summary: '构成机体组织、酶和激素的重要成分，参与修复与免疫。',
    description: '蛋白质是构成肌肉、皮肤、毛发、酶、激素和抗体等重要物质的基础，也参与体内物质运输与酸碱平衡。膳食中的蛋白质主要来自鱼、禽、蛋、瘦肉、奶及奶制品、大豆及其制品。中国居民膳食指南（2022）建议平均每天摄入鱼、禽、蛋和瘦肉 120～200 克，奶及奶制品 300～500 克，大豆及坚果 25～35 克，并注意荤素搭配、种类多样。',
    sourceName: '百度百科 · 蛋白质；中国居民膳食指南（2022）',
    sourceUrl: BAIKE + encodeURIComponent('蛋白质'),
    guidelineUrl: GUIDE,
  },
  {
    id: 2, slug: 'carbohydrate', name: '碳水化合物', englishName: 'Carbohydrate', group: 'macronutrient', subgroup: '宏量营养素', canonicalUnit: 'g/d',
    summary: '人体最主要的能量来源，优先选择全谷物和杂豆。',
    description: '碳水化合物是人体最经济、最主要的能量来源，参与构成细胞和组织，并有助于节约蛋白质。膳食指南（2022）建议每天摄入谷类 200～300 克，其中全谷物和杂豆 50～150 克，薯类 50～100 克，少吃精制糖和含糖饮料，把主食的一部分换成全谷物、杂豆和薯类。',
    sourceName: '百度百科 · 碳水化合物；中国居民膳食指南（2022）',
    sourceUrl: BAIKE + encodeURIComponent('碳水化合物'),
    guidelineUrl: GUIDE,
  },
  {
    id: 3, slug: 'fat', name: '脂肪', englishName: 'Fat', group: 'macronutrient', subgroup: '宏量营养素', canonicalUnit: 'g/d',
    summary: '提供能量和必需脂肪酸，帮助脂溶性维生素吸收。',
    description: '脂肪是高能量营养素，提供必需脂肪酸，并促进维生素 A、D、E、K 等脂溶性维生素的吸收。膳食指南（2022）建议成年人每天烹调油 25～30 克，少吃油炸食品和动物脂肪，适当增加富含不饱和脂肪酸的植物油、鱼类和坚果。',
    sourceName: '百度百科 · 脂肪；中国居民膳食指南（2022）',
    sourceUrl: BAIKE + encodeURIComponent('脂肪'),
    guidelineUrl: GUIDE,
  },
  {
    id: 4, slug: 'vitamin-a', name: '维生素 A', englishName: 'Vitamin A', group: 'vitamin', subgroup: '脂溶性维生素', canonicalUnit: 'μg RAE/d',
    summary: '维持视觉、免疫和皮肤黏膜健康。', isFatSoluble: true,
    description: '维生素 A 参与视觉形成、免疫功能、生长发育和皮肤黏膜完整性。动物肝脏、蛋类、奶类富含视黄醇；深绿色和橙黄色蔬菜水果中的 β-胡萝卜素可在体内转化为维生素 A。膳食指南（2022）建议餐餐有蔬菜，保证每天摄入不少于 300 克新鲜蔬菜，其中深色蔬菜应占一半。',
    sourceName: '百度百科 · 维生素A；中国居民膳食指南（2022）',
    sourceUrl: BAIKE + encodeURIComponent('维生素A'),
    guidelineUrl: GUIDE,
  },
  {
    id: 5, slug: 'vitamin-b1', name: '维生素 B₁', englishName: 'Thiamin', group: 'vitamin', subgroup: '水溶性维生素', canonicalUnit: 'mg/d',
    summary: '参与能量代谢，缺乏可影响神经系统。', isFatSoluble: false,
    description: '维生素 B₁（硫胺素）参与碳水化合物代谢和神经、心肌功能，长期严重缺乏可引起脚气病。全谷物、豆类、瘦肉、动物内脏是主要来源。谷物加工越精细，B 族维生素损失越多，因此膳食指南（2022）提倡增加全谷物摄入。',
    sourceName: '百度百科 · 维生素B1；中国居民膳食指南（2022）',
    sourceUrl: BAIKE + encodeURIComponent('维生素B1'),
    guidelineUrl: GUIDE,
  },
  {
    id: 6, slug: 'vitamin-b12', name: '维生素 B₁₂', englishName: 'Cobalamin', group: 'vitamin', subgroup: '水溶性维生素', canonicalUnit: 'μg/d',
    summary: '参与红细胞生成和神经系统功能，主要来自动物性食物。', isFatSoluble: false,
    description: '维生素 B₁₂（钴胺素）参与红细胞生成、DNA 合成和神经系统功能，缺乏可导致巨幼红细胞性贫血和神经损害。它几乎只存在于动物性食物中，如动物肝脏、肉类、蛋类、奶类和水产品，长期严格素食者需特别关注并咨询专业人员。',
    sourceName: '百度百科 · 维生素B12；中国居民膳食指南（2022）',
    sourceUrl: BAIKE + encodeURIComponent('维生素B12'),
    guidelineUrl: GUIDE,
  },
  {
    id: 7, slug: 'vitamin-c', name: '维生素 C', englishName: 'Vitamin C', group: 'vitamin', subgroup: '水溶性维生素', canonicalUnit: 'mg/d',
    summary: '抗氧化、参与胶原合成，并促进非血红素铁吸收。', isFatSoluble: false,
    description: '维生素 C（抗坏血酸）具有抗氧化作用，参与胶原蛋白合成、神经递质形成，并能促进非血红素铁的吸收。新鲜蔬菜和水果是主要来源，如鲜枣、猕猴桃、柑橘、草莓、西兰花、青椒等。维生素 C 怕热、怕光、易溶于水，长时间高温烹调会明显损失，建议急火快炒、适当生食。膳食指南（2022）建议天天吃水果，保证每天摄入 200～350 克新鲜水果。',
    sourceName: '百度百科 · 维生素C；中国居民膳食指南（2022）',
    sourceUrl: BAIKE + encodeURIComponent('维生素C'),
    guidelineUrl: GUIDE,
  },
  {
    id: 8, slug: 'vitamin-d', name: '维生素 D', englishName: 'Vitamin D', group: 'vitamin', subgroup: '脂溶性维生素', canonicalUnit: 'μg/d',
    summary: '促进钙吸收和骨骼健康，日照是重要来源。', isFatSoluble: true,
    description: '维生素 D 主要通过调节钙、磷代谢维持骨骼健康，也参与免疫和肌肉功能。人体皮肤经紫外线照射可合成维生素 D，食物来源包括脂肪含量较高的鱼类、蛋黄、动物肝脏和强化食品。日照不足、户外活动少的人群更容易摄入不足，是否需要补充应结合个体情况咨询专业人员。',
    sourceName: '百度百科 · 维生素D；中国居民膳食指南（2022）',
    sourceUrl: BAIKE + encodeURIComponent('维生素D'),
    guidelineUrl: GUIDE,
  },
  {
    id: 9, slug: 'vitamin-e', name: '维生素 E', englishName: 'Vitamin E', group: 'vitamin', subgroup: '脂溶性维生素', canonicalUnit: 'mg/d',
    summary: '抗氧化，保护细胞膜中的不饱和脂肪酸。', isFatSoluble: true,
    description: '维生素 E 是一类脂溶性抗氧化剂，主要作用是保护细胞膜和脂蛋白中的不饱和脂肪酸免受氧化损伤。植物油、坚果、种子和全谷物是主要来源。由于维生素 E 广泛存在于常见食物中，正常膳食通常不易缺乏，长期大剂量补充需谨慎。',
    sourceName: '百度百科 · 维生素E；中国居民膳食指南（2022）',
    sourceUrl: BAIKE + encodeURIComponent('维生素E'),
    guidelineUrl: GUIDE,
  },
  {
    id: 10, slug: 'vitamin-k', name: '维生素 K', englishName: 'Vitamin K', group: 'vitamin', subgroup: '脂溶性维生素', canonicalUnit: 'μg/d',
    summary: '参与凝血和骨代谢，深绿色蔬菜是主要来源。', isFatSoluble: true,
    description: '维生素 K 参与凝血因子合成和骨代谢。深绿色蔬菜（如菠菜、西兰花、油菜）、纳豆和部分发酵食品是主要来源。正在服用华法林等抗凝药物的人群，应保持维生素 K 摄入相对稳定，并遵医嘱调整。',
    sourceName: '百度百科 · 维生素K；中国居民膳食指南（2022）',
    sourceUrl: BAIKE + encodeURIComponent('维生素K'),
    guidelineUrl: GUIDE,
  },
  {
    id: 11, slug: 'calcium', name: '钙', englishName: 'Calcium', group: 'mineral', subgroup: '常量元素', canonicalUnit: 'mg/d',
    summary: '骨骼和牙齿的主要成分，参与神经与肌肉功能。',
    description: '钙是人体含量最多的矿物质，约 99% 存在于骨骼和牙齿中，其余参与神经传导、肌肉收缩和血液凝固。奶及奶制品是优质来源，豆制品、绿叶蔬菜、小鱼小虾也可提供。膳食指南（2022）建议每天摄入奶及奶制品 300～500 克，并经常食用豆制品。',
    sourceName: '百度百科 · 钙；中国居民膳食指南（2022）',
    sourceUrl: BAIKE + encodeURIComponent('钙'),
    guidelineUrl: GUIDE,
  },
  {
    id: 12, slug: 'magnesium', name: '镁', englishName: 'Magnesium', group: 'mineral', subgroup: '常量元素', canonicalUnit: 'mg/d',
    summary: '参与能量代谢和多种酶反应。',
    description: '镁参与体内 300 多种酶促反应，涉及能量代谢、神经肌肉兴奋性和骨骼构成。全谷物、坚果、豆类和深绿色蔬菜是主要来源。以精制谷物为主、蔬菜水果摄入不足的膳食结构，可能使镁摄入偏低。',
    sourceName: '百度百科 · 镁；中国居民膳食指南（2022）',
    sourceUrl: BAIKE + encodeURIComponent('镁'),
    guidelineUrl: GUIDE,
  },
  {
    id: 13, slug: 'iron', name: '铁', englishName: 'Iron', group: 'mineral', subgroup: '微量元素', canonicalUnit: 'mg/d',
    summary: '血红蛋白的重要组成，吸收受食物形态和搭配影响。',
    description: '铁是血红蛋白、肌红蛋白和多种酶的组成成分，参与氧的运输和能量代谢。动物性食物中的血红素铁吸收率较高，植物性食物中的非血红素铁易受植酸、多酚影响，而维生素 C 可促进其吸收。动物血、肝脏、红肉是良好来源。育龄期女性、孕妇和婴幼儿是缺铁的高风险人群。',
    sourceName: '百度百科 · 铁；中国居民膳食指南（2022）',
    sourceUrl: BAIKE + encodeURIComponent('铁'),
    guidelineUrl: GUIDE,
  },
  {
    id: 14, slug: 'zinc', name: '锌', englishName: 'Zinc', group: 'mineral', subgroup: '微量元素', canonicalUnit: 'mg/d',
    summary: '参与生长发育、免疫和味觉功能。',
    description: '锌参与生长发育、免疫功能、伤口愈合和味觉维持，也是多种酶的组成成分。贝壳类海产品、红肉、动物内脏、坚果是良好来源。植物性食物中的植酸会影响锌的吸收，以谷物豆类为主的人群应注意搭配。',
    sourceName: '百度百科 · 锌；中国居民膳食指南（2022）',
    sourceUrl: BAIKE + encodeURIComponent('锌'),
    guidelineUrl: GUIDE,
  },
  {
    id: 15, slug: 'iodine', name: '碘', englishName: 'Iodine', group: 'mineral', subgroup: '微量元素', canonicalUnit: 'μg/d',
    summary: '合成甲状腺激素，碘盐是主要来源。',
    description: '碘是合成甲状腺激素的必需元素，参与调节新陈代谢和生长发育。碘缺乏可导致甲状腺肿，孕期缺碘还会影响胎儿神经发育。海带、紫菜、海鱼等海产品含碘丰富，加碘食盐是我国居民碘的主要来源。膳食指南（2022）建议成年人每天食盐摄入不超过 5 克。',
    sourceName: '百度百科 · 碘；中国居民膳食指南（2022）',
    sourceUrl: BAIKE + encodeURIComponent('碘'),
    guidelineUrl: GUIDE,
  },
  {
    id: 16, slug: 'selenium', name: '硒', englishName: 'Selenium', group: 'mineral', subgroup: '微量元素', canonicalUnit: 'μg/d',
    summary: '抗氧化酶的重要组成，参与甲状腺激素代谢。',
    description: '硒是谷胱甘肽过氧化物酶等多种抗氧化酶的组成成分，参与甲状腺激素代谢和免疫调节。海产品、动物内脏、蛋类和坚果（尤其巴西坚果）是主要来源。硒的安全范围相对较窄，长期过量摄入可能产生不良反应，补充剂应在专业指导下使用。',
    sourceName: '百度百科 · 硒；中国居民膳食指南（2022）',
    sourceUrl: BAIKE + encodeURIComponent('硒'),
    guidelineUrl: GUIDE,
  },
  {
    id: 17, slug: 'sodium', name: '钠', englishName: 'Sodium', group: 'mineral', subgroup: '常量元素', canonicalUnit: 'mg/d',
    summary: '维持体液平衡和神经肌肉功能，主要来自食盐。',
    description: '钠是维持体液容量、渗透压和神经肌肉正常功能的重要元素，主要通过食盐（氯化钠）摄入。食盐中约 40% 是钠，1 克食盐约含 400 毫克钠。中国居民膳食指南（2022）建议成年人每天食盐摄入不超过 5 克，并减少酱油、腌制品等隐形盐的摄入。长期高钠摄入与高血压风险相关，减盐是慢病预防的重要措施。',
    sourceName: '百度百科 · 钠；中国居民膳食指南（2022）',
    sourceUrl: BAIKE + encodeURIComponent('钠'),
    guidelineUrl: GUIDE,
  },
  {
    id: 18, slug: 'anthocyanin', name: '花青素', englishName: 'Anthocyanins', group: 'other', subgroup: '植物化合物', canonicalUnit: 'mg/d',
    summary: '使蔬果呈紫红色的多酚类物质，具抗氧化作用。',
    description: '花青素是一类水溶性色素，广泛存在于紫甘蓝、蓝莓、葡萄、樱桃、紫薯、草莓等深色蔬果中，使它们呈现红、紫、蓝等颜色。花青素具有抗氧化作用，属于植物化合物而非必需营养素，目前没有官方的推荐摄入量。日常多吃深色蔬果是获取花青素的自然方式。',
    sourceName: '百度百科 · 花青素；中国居民膳食指南（2022）',
    sourceUrl: BAIKE + encodeURIComponent('花青素'),
    guidelineUrl: GUIDE,
    isFatSoluble: false,
  },
  {
    id: 19, slug: 'lutein', name: '叶黄素', englishName: 'Lutein', group: 'other', subgroup: '类胡萝卜素', canonicalUnit: 'mg/d',
    summary: '集中在视网膜黄斑区，帮助过滤蓝光。',
    description: '叶黄素是一种含氧类胡萝卜素，与玉米黄质一起集中在视网膜黄斑区，能吸收蓝光、减轻氧化损伤。深绿色蔬菜（菠菜、羽衣甘蓝）、玉米、蛋黄是主要来源。叶黄素属脂溶性，与油脂同烹或同餐更利于吸收；它不是必需营养素，暂无官方推荐量。',
    sourceName: '百度百科 · 叶黄素；中国居民膳食指南（2022）',
    sourceUrl: BAIKE + encodeURIComponent('叶黄素'),
    guidelineUrl: GUIDE,
    isFatSoluble: true,
  },
  {
    id: 20, slug: 'lycopene', name: '番茄红素', englishName: 'Lycopene', group: 'other', subgroup: '类胡萝卜素', canonicalUnit: 'mg/d',
    summary: '番茄等红色蔬果中的类胡萝卜素，抗氧化。',
    description: '番茄红素是一种红色类胡萝卜素，主要存在于番茄、西瓜、番石榴、红心柚等红色蔬果中，具有抗氧化作用。它属脂溶性，加热和油脂可提高其溶出与吸收，因此番茄炒蛋、番茄汤比生吃更利于番茄红素利用。与叶黄素一样，它属于植物化合物，暂无官方推荐摄入量。',
    sourceName: '百度百科 · 番茄红素；中国居民膳食指南（2022）',
    sourceUrl: BAIKE + encodeURIComponent('番茄红素'),
    guidelineUrl: GUIDE,
    isFatSoluble: true,
  },
  {
    id: 21, slug: 'beta-carotene', name: 'β-胡萝卜素', englishName: 'Beta-Carotene', group: 'other', subgroup: '类胡萝卜素', canonicalUnit: 'μg/d',
    summary: '维生素 A 的前体，深色蔬果中含量丰富。',
    description: 'β-胡萝卜素是类胡萝卜素的一种，可在体内转化为维生素 A，因此被称为维生素 A 前体。胡萝卜、红薯、南瓜、深绿色蔬菜中含量丰富。它属脂溶性，用油烹调或与含脂食物同餐可提高吸收；过量补充剂反而可能带来风险，优先从食物获取。',
    sourceName: '百度百科 · β-胡萝卜素；中国居民膳食指南（2022）',
    sourceUrl: BAIKE + encodeURIComponent('β-胡萝卜素'),
    guidelineUrl: GUIDE,
    isFatSoluble: true,
  },
  {
    id: 22, slug: 'dietary-fiber', name: '膳食纤维', englishName: 'Dietary Fiber', group: 'macronutrient', subgroup: '碳水化合物', canonicalUnit: 'g/d',
    summary: '促进肠道蠕动、帮助控制血糖和血脂。',
    description: '膳食纤维是植物性食物中不能被人体消化吸收的碳水化合物，分为可溶性和不可溶性两类。它有助于增加饱腹感、促进肠道蠕动、改善肠道菌群，并帮助控制血糖和血脂。全谷物、杂豆、薯类、蔬菜和水果是主要来源。膳食指南（2022）建议每天摄入谷类 200～300 克，其中全谷物和杂豆 50～150 克。',
    sourceName: '百度百科 · 膳食纤维；中国居民膳食指南（2022）',
    sourceUrl: BAIKE + encodeURIComponent('膳食纤维'),
    guidelineUrl: GUIDE,
  },
  {
    id: 23, slug: 'potassium', name: '钾', englishName: 'Potassium', group: 'mineral', subgroup: '常量元素', canonicalUnit: 'mg/d',
    summary: '维持体液平衡和正常血压，蔬果豆类含量高。',
    description: '钾是细胞内主要的阳离子，参与维持体液平衡、神经肌肉兴奋性和心脏节律，并有助于对抗钠升压作用、维持正常血压。蔬菜、水果、豆类、薯类、菌菇含钾丰富。肾功能不全者需在医生指导下控制钾摄入。',
    sourceName: '百度百科 · 钾；中国居民膳食指南（2022）',
    sourceUrl: BAIKE + encodeURIComponent('钾'),
    guidelineUrl: GUIDE,
  },
  {
    id: 24, slug: 'phosphorus', name: '磷', englishName: 'Phosphorus', group: 'mineral', subgroup: '常量元素', canonicalUnit: 'mg/d',
    summary: '骨骼和牙齿的重要组成，参与能量代谢。',
    description: '磷是人体含量仅次于钙的矿物质，约 85% 存在于骨骼和牙齿中，其余参与能量代谢、核酸和细胞膜构成。磷广泛存在于各类食物中，奶类、蛋类、肉类、豆类和全谷物含量较高，正常膳食一般不易缺乏。加工食品中的磷酸盐添加剂是隐形磷的主要来源。',
    sourceName: '百度百科 · 磷；中国居民膳食指南（2022）',
    sourceUrl: BAIKE + encodeURIComponent('磷'),
    guidelineUrl: GUIDE,
  },
  {
    id: 25, slug: 'copper', name: '铜', englishName: 'Copper', group: 'mineral', subgroup: '微量元素', canonicalUnit: 'mg/d',
    summary: '参与铁代谢和抗氧化酶功能。',
    description: '铜是多种酶的组成成分，参与铁代谢、能量产生、结缔组织合成和抗氧化防御。动物肝脏、贝类、坚果、豆类、全谷物和可可含量较高。铜缺乏较少见，但长期过量补充可能影响肝功能和锌吸收，补充剂应在专业指导下使用。',
    sourceName: '百度百科 · 铜；中国居民膳食指南（2022）',
    sourceUrl: BAIKE + encodeURIComponent('铜'),
    guidelineUrl: GUIDE,
  },
  {
    id: 26, slug: 'vitamin-b2', name: '维生素 B₂', englishName: 'Riboflavin', group: 'vitamin', subgroup: '水溶性维生素', canonicalUnit: 'mg/d',
    summary: '参与能量代谢，缺乏可引起口角炎。',
    description: '维生素 B₂（核黄素）参与碳水化合物、脂肪和蛋白质的代谢，维持皮肤、黏膜和视觉健康。奶类、蛋类、动物肝脏、瘦肉、绿叶蔬菜是主要来源。它怕光，牛奶等食物应避光保存。长期缺乏可引起口角炎、舌炎和脂溢性皮炎。',
    sourceName: '百度百科 · 维生素B2；中国居民膳食指南（2022）',
    sourceUrl: BAIKE + encodeURIComponent('维生素B2'),
    guidelineUrl: GUIDE,
    isFatSoluble: false,
  },
  {
    id: 27, slug: 'vitamin-b6', name: '维生素 B₆', englishName: 'Pyridoxine', group: 'vitamin', subgroup: '水溶性维生素', canonicalUnit: 'mg/d',
    summary: '参与氨基酸代谢和血红蛋白合成。',
    description: '维生素 B₆ 包括吡哆醇、吡哆醛和吡哆胺，参与氨基酸代谢、血红蛋白合成、神经递质生成和免疫功能。鸡肉、鱼肉、动物肝脏、土豆、香蕉、豆类和全谷物是主要来源。长期大剂量补充可能引起神经损伤，补充剂不宜自行长期大剂量使用。',
    sourceName: '百度百科 · 维生素B6；中国居民膳食指南（2022）',
    sourceUrl: BAIKE + encodeURIComponent('维生素B6'),
    guidelineUrl: GUIDE,
    isFatSoluble: false,
  },
  {
    id: 28, slug: 'astaxanthin', name: '虾青素', englishName: 'Astaxanthin', group: 'other', subgroup: '类胡萝卜素', canonicalUnit: 'mg/d',
    summary: '使三文鱼、虾蟹呈红色的类胡萝卜素，抗氧化。',
    description: '虾青素是一种红色类胡萝卜素，使三文鱼、虾、蟹等呈现橙红色，具有较强抗氧化作用。它属于植物/海洋生物化合物，不是必需营养素，目前没有官方推荐摄入量。三文鱼、虾蟹、藻类是其天然来源，属脂溶性，与油脂同餐更利于吸收。',
    sourceName: '百度百科 · 虾青素；中国居民膳食指南（2022）',
    sourceUrl: BAIKE + encodeURIComponent('虾青素'),
    guidelineUrl: GUIDE,
    isFatSoluble: true,
  },
  {
    id: 29, slug: 'vitamin-b3', name: '维生素 B₃', englishName: 'Niacin', group: 'vitamin', subgroup: '水溶性维生素', canonicalUnit: 'mg/d',
    summary: '即烟酸，参与能量代谢，维持皮肤和神经系统健康。',
    description: '维生素 B₃（烟酸、尼克酸）参与体内能量代谢，维持皮肤、神经系统和消化系统健康。肉类、动物肝脏、鱼类、全谷物、豆类和坚果是主要来源。玉米中的烟酸多为结合型，需经碱处理才易被利用。长期大量补充可能引起皮肤潮红等不适。',
    sourceName: '百度百科 · 维生素B3；中国居民膳食指南（2022）',
    sourceUrl: BAIKE + encodeURIComponent('维生素B3'),
    guidelineUrl: GUIDE,
    isFatSoluble: false,
  },
  {
    id: 30, slug: 'vitamin-b5', name: '维生素 B₅', englishName: 'Pantothenic Acid', group: 'vitamin', subgroup: '水溶性维生素', canonicalUnit: 'mg/d',
    summary: '即泛酸，参与能量代谢和辅酶 A 的构成。',
    description: '维生素 B₅（泛酸）是辅酶 A 的组成成分，参与碳水化合物、脂肪和蛋白质的代谢。它广泛存在于各类食物中，动物肝脏、蛋类、肉类、豆类、全谷物和蘑菇含量较高，正常膳食一般不易缺乏。',
    sourceName: '百度百科 · 维生素B5；中国居民膳食指南（2022）',
    sourceUrl: BAIKE + encodeURIComponent('维生素B5'),
    guidelineUrl: GUIDE,
    isFatSoluble: false,
  },
  {
    id: 31, slug: 'sugar', name: '糖', englishName: 'Sugar', group: 'macronutrient', subgroup: '碳水化合物', canonicalUnit: 'g/d',
    summary: '总糖，含天然糖与添加糖，过量增加龋齿和超重风险。',
    description: '糖包括食物中天然存在的糖（果糖、葡萄糖、乳糖等）和人工添加的游离糖。中国居民膳食指南（2022）建议添加糖每天不超过 50 克，最好控制在 25 克以下，同时少吃含糖饮料。水果和纯奶中的天然糖不计入添加糖，但总量过多仍会影响能量摄入。',
    sourceName: '百度百科 · 糖；中国居民膳食指南（2022）',
    sourceUrl: BAIKE + encodeURIComponent('糖'),
    guidelineUrl: GUIDE,
    isFatSoluble: false,
  },
]

// 搜索归一化：忽略空格、全角字符、下角标与常见简称，使「维生素C」「维生素 C」「维C」「VC」等价。
const SUBSCRIPTS = '₀₁₂₃₄₅₆₇₈₉'
const SYNONYMS = {
  vc: '维生素c', vd: '维生素d', va: '维生素a', ve: '维生素e', vk: '维生素k',
  vb1: '维生素b1', vb2: '维生素b2', vb12: '维生素b12',
}

export function normalizeSearch(value) {
  let text = String(value || '')
    .toLocaleLowerCase()
    .replace(/[\s\u3000\u00a0]/g, '')
    .replace(/[₀-₉]/g, (char) => String(SUBSCRIPTS.indexOf(char)))
    .replace(/[·・,，、.。_\-—()（）]/g, '')
  if (SYNONYMS[text]) return SYNONYMS[text]
  if (text.startsWith('维') && !text.startsWith('维生素')) text = '维生素' + text.slice(1)
  return text
}

export function matchesKeyword(keyword, fields) {
  const query = normalizeSearch(keyword)
  if (!query) return true
  return normalizeSearch(fields.filter(Boolean).join(' ')).includes(query)
}

// 参考人群按「儿童 / 成人 / 老人」三档呈现，不再按年龄组 × 性别细分。
// 说明：性别差异已合并为单一代表值，正式上线需按 DRIs 2023 分性别完整数据。
export const demoPopulations = [
  { code: 'child', displayName: '儿童', ageLabel: '4–10 岁', minAgeMonths: 48, maxAgeMonths: 131, sex: 'both', sexLabel: '不分性别', lifeStage: '儿童期' },
  { code: 'adult', displayName: '成人', ageLabel: '18–49 岁', minAgeMonths: 216, maxAgeMonths: 599, sex: 'notSpecified', sexLabel: '性别差异已合并', lifeStage: '成年期' },
  { code: 'older', displayName: '老人', ageLabel: '65–79 岁', minAgeMonths: 780, maxAgeMonths: 959, sex: 'notSpecified', sexLabel: '性别差异已合并', lifeStage: '老年期' },
]

const M = {
  EAR: '平均需要量',
  RNI: '推荐摄入量',
  AI: '适宜摄入量',
  UL: '可耐受最高摄入量',
}

// 各营养素的参考值表：按「指标类型 → 人群（儿童 / 成人 / 老人）」组织。
// 数值为结构演示示例，不代表官方发布值；性别差异已合并为单一代表值。
const referenceProfiles = {
  protein: {
    unit: 'g/d',
    metrics: [
      { type: 'RNI', values: { child: 40, adult: 55, older: 55 } },
    ],
  },
  calcium: {
    unit: 'mg/d',
    metrics: [
      { type: 'RNI', values: { child: 1000, adult: 800, older: 1000 } },
      { type: 'UL', values: { adult: 2000, older: 2000 } },
    ],
  },
  iron: {
    unit: 'mg/d',
    metrics: [
      { type: 'RNI', values: { child: 13, adult: 18, older: 12 } },
      { type: 'UL', values: { adult: 42, older: 42 } },
    ],
  },
  zinc: {
    unit: 'mg/d',
    metrics: [
      { type: 'RNI', values: { child: 7.0, adult: 7.5, older: 7.5 } },
      { type: 'UL', values: { adult: 40, older: 40 } },
    ],
  },
  'vitamin-a': {
    unit: 'μg RAE/d',
    metrics: [
      { type: 'RNI', values: { child: 500, adult: 700, older: 700 } },
      { type: 'UL', values: { adult: 3000, older: 3000 } },
    ],
  },
  'vitamin-c': {
    unit: 'mg/d',
    metrics: [
      { type: 'RNI', values: { child: 65, adult: 100, older: 100 } },
      { type: 'UL', values: { adult: 2000, older: 2000 } },
    ],
  },
  'vitamin-d': {
    unit: 'μg/d',
    metrics: [
      { type: 'RNI', values: { child: 10, adult: 10, older: 15 } },
      { type: 'UL', values: { adult: 50, older: 50 } },
    ],
  },
  sodium: {
    unit: 'mg/d',
    metrics: [
      { type: 'AI', values: { child: 900, adult: 1500, older: 1500 } },
    ],
  },
  anthocyanin: {
    unit: 'mg/d',
    metrics: [
      { type: 'AI', values: { child: 20, adult: 50, older: 50 } },
    ],
  },
  lutein: {
    unit: 'mg/d',
    metrics: [
      { type: 'AI', values: { child: 5, adult: 10, older: 10 } },
    ],
  },
  lycopene: {
    unit: 'mg/d',
    metrics: [
      { type: 'AI', values: { child: 5, adult: 15, older: 15 } },
    ],
  },
  'beta-carotene': {
    unit: 'μg/d',
    metrics: [
      { type: 'AI', values: { child: 2000, adult: 4000, older: 4000 } },
    ],
  },
  'dietary-fiber': {
    unit: 'g/d',
    metrics: [
      { type: 'AI', values: { child: 15, adult: 25, older: 25 } },
    ],
  },
  sugar: {
    unit: 'g/d',
    metrics: [
      { type: 'UL', values: { child: 25, adult: 50, older: 25 } },
    ],
  },
  potassium: {
    unit: 'mg/d',
    metrics: [
      { type: 'AI', values: { child: 1500, adult: 2000, older: 2000 } },
    ],
  },
  phosphorus: {
    unit: 'mg/d',
    metrics: [
      { type: 'RNI', values: { child: 500, adult: 700, older: 700 } },
    ],
  },
  copper: {
    unit: 'mg/d',
    metrics: [
      { type: 'RNI', values: { child: 0.5, adult: 0.8, older: 0.8 } },
    ],
  },
  'vitamin-b2': {
    unit: 'mg/d',
    metrics: [
      { type: 'RNI', values: { child: 0.9, adult: 1.2, older: 1.2 } },
    ],
  },
  'vitamin-b6': {
    unit: 'mg/d',
    metrics: [
      { type: 'RNI', values: { child: 0.9, adult: 1.3, older: 1.5 } },
    ],
  },
  astaxanthin: {
    unit: 'mg/d',
    metrics: [
      { type: 'AI', values: { child: 2, adult: 4, older: 4 } },
    ],
  },
  'vitamin-b3': {
    unit: 'mg/d',
    metrics: [
      { type: 'RNI', values: { child: 8, adult: 14, older: 14 } },
    ],
  },
  'vitamin-b5': {
    unit: 'mg/d',
    metrics: [
      { type: 'AI', values: { child: 3, adult: 5, older: 5 } },
    ],
  },
  carbohydrate: {
    unit: 'g/d',
    metrics: [
      { type: 'AMDR', values: { child: 200, adult: 300, older: 250 } },
    ],
  },
  fat: {
    unit: 'g/d',
    metrics: [
      { type: 'AMDR', values: { child: 45, adult: 65, older: 55 } },
    ],
  },
  'vitamin-b1': {
    unit: 'mg/d',
    metrics: [
      { type: 'RNI', values: { child: 0.8, adult: 1.2, older: 1.2 } },
    ],
  },
  'vitamin-b12': {
    unit: 'μg/d',
    metrics: [
      { type: 'RNI', values: { child: 1.2, adult: 2.4, older: 2.4 } },
    ],
  },
  'vitamin-e': {
    unit: 'mg/d',
    metrics: [
      { type: 'AI', values: { child: 8, adult: 14, older: 14 } },
    ],
  },
  'vitamin-k': {
    unit: 'μg/d',
    metrics: [
      { type: 'AI', values: { child: 55, adult: 80, older: 80 } },
    ],
  },
  magnesium: {
    unit: 'mg/d',
    metrics: [
      { type: 'RNI', values: { child: 200, adult: 330, older: 320 } },
    ],
  },
  iodine: {
    unit: 'μg/d',
    metrics: [
      { type: 'RNI', values: { child: 90, adult: 120, older: 120 } },
    ],
  },
  selenium: {
    unit: 'μg/d',
    metrics: [
      { type: 'RNI', values: { child: 40, adult: 60, older: 60 } },
    ],
  },
}

const sexRank = { both: 0, notSpecified: 0, male: 1, female: 2 }

function buildReferenceRows() {
  const rows = []
  Object.keys(referenceProfiles).forEach((slug) => {
    const nutrient = demoNutrients.find((item) => item.slug === slug)
    if (!nutrient) return
    const profile = referenceProfiles[slug]
    profile.metrics.forEach((metric) => {
      Object.keys(metric.values).forEach((populationCode) => {
        const population = demoPopulations.find((item) => item.code === populationCode)
        if (!population) return
        rows.push({
          nutrientSlug: slug,
          nutrientName: nutrient.name,
          group: nutrient.group,
          type: metric.type,
          typeLabel: M[metric.type] || metric.type,
          amount: metric.values[populationCode],
          unit: profile.unit,
          populationCode,
          populationName: population.displayName,
          ageLabel: population.ageLabel,
          sex: population.sex,
          sexLabel: population.sexLabel,
          lifeStage: population.lifeStage,
          minAgeMonths: population.minAgeMonths,
          standardVersion: STANDARD_META.version,
          sourceName: STANDARD_META.sourceName,
          sourceUrl: STANDARD_META.sourceUrl,
          isIllustrative: true,
        })
      })
    })
  })
  return rows.sort((a, b) => {
    if (a.nutrientSlug !== b.nutrientSlug) return a.nutrientSlug.localeCompare(b.nutrientSlug)
    if (a.minAgeMonths !== b.minAgeMonths) return a.minAgeMonths - b.minAgeMonths
    if (a.sex !== b.sex) return sexRank[a.sex] - sexRank[b.sex]
    return a.type.localeCompare(b.type)
  })
}

// 完整参考记录：营养素 × 人群 × 指标类型 × 单位 × 数值 × 标准版本 × 出处
export const demoReferenceIntakes = buildReferenceRows()

// 可作为「每日参考值」主卡片切换的营养素
export const referenceNutrientSlugs = Object.keys(referenceProfiles)

// 每日参考卡下拉使用的 7 个主要指标：能量 / 蛋白质 / 脂肪 / 维生素 / 糖 / 钠 / 碳水化合物。
// 与图鉴中按 A、B 族、C、D 细分的营养素分开维护；数值为结构演示示例。
export const referenceCardItems = [
  {
    slug: 'energy', name: '能量', unit: 'kcal/d', type: 'RNI', typeLabel: '推荐摄入量',
    values: { child: 1400, adult: 2250, older: 2050 },
    note: '按轻体力活动水平估算，实际需要随身高、体重和活动量变化。',
  },
  {
    slug: 'protein', name: '蛋白质', unit: 'g/d', type: 'RNI', typeLabel: '推荐摄入量',
    values: { child: 40, adult: 55, older: 55 },
    note: '优先来自鱼、禽、蛋、瘦肉、奶及大豆制品。',
  },
  {
    slug: 'fat', name: '脂肪', unit: 'g/d', type: 'AMDR', typeLabel: '可接受范围',
    values: { child: 45, adult: 65, older: 55 },
    note: '按脂肪供能 20%～30% 折算，具体克数随总能量变化。',
  },
  {
    slug: 'vitamin', name: '维生素', group: true,
    members: [
      { name: '维生素 A', unit: 'μg RAE/d', values: { child: 500, adult: 700, older: 700 } },
      { name: '维生素 C', unit: 'mg/d', values: { child: 65, adult: 100, older: 100 } },
      { name: '维生素 D', unit: 'μg/d', values: { child: 10, adult: 10, older: 15 } },
    ],
    note: '维生素是多种化合物的总称，按 A、B 族、C、D、E、K 分别制定参考值。',
  },
  {
    slug: 'sugar', name: '糖', unit: 'g/d', type: 'UL', typeLabel: '建议上限',
    values: { child: 25, adult: 50, older: 25 },
    note: '指添加糖，建议控制在总能量 10% 以内，最好低于 5%；儿童与老人严格控制在 25 克以内。',
  },
  {
    slug: 'sodium', name: '钠', unit: 'mg/d', type: 'AI', typeLabel: '适宜摄入量',
    values: { child: 900, adult: 1500, older: 1500 },
    note: '约相当于食盐 2.3～3.8 克，建议每天食盐不超过 5 克。',
  },
  {
    slug: 'carbohydrate', name: '碳水化合物', unit: 'g/d', type: 'AMDR', typeLabel: '可接受范围',
    values: { child: 200, adult: 300, older: 250 },
    note: '按碳水供能 50%～65% 折算，优先全谷物、杂豆和薯类。',
  },
]

export function getReferenceCardItem(slug) {
  const card = referenceCardItems.find((item) => item.slug === slug)
  if (card) return card
  // 回退：从完整参考记录里取该营养素（优先 AI，其次 RNI），供计算器等场景使用。
  const rows = demoReferenceIntakes.filter((row) => row.nutrientSlug === slug)
  if (!rows.length) return null
  const preferred = rows.find((row) => row.type === 'AI') || rows.find((row) => row.type === 'RNI') || rows[0]
  const values = {}
  rows.forEach((row) => {
    if (row.type === preferred.type) values[row.populationCode] = row.amount
  })
  return {
    slug,
    name: preferred.nutrientName,
    unit: `${preferred.unit}/d`,
    type: preferred.type,
    typeLabel: preferred.typeLabel,
    values,
    note: preferred.type === 'AI' ? '适宜摄入量，供参考。' : '',
  }
}

export function getNutrientBySlug(slug) {
  return demoNutrients.find((item) => item.slug === slug) || null
}

// 每日参考值单位带 /d；食物含量按每 100 克计，需要去掉每日维度。
export function baseUnitOf(nutrient) {
  return nutrient && nutrient.canonicalUnit ? nutrient.canonicalUnit.replace(/\/d$/, '') : ''
}

export function getReferenceFor(nutrientSlug, populationCode) {
  return demoReferenceIntakes.filter(
    (row) => row.nutrientSlug === nutrientSlug && row.populationCode === populationCode,
  )
}

export function getReferencesByNutrient(nutrientSlug) {
  return demoReferenceIntakes.filter((row) => row.nutrientSlug === nutrientSlug)
}

export function getReferencesByPopulation(populationCode) {
  return demoReferenceIntakes.filter((row) => row.populationCode === populationCode)
}

// ---------------------------------------------------------------------------
// 食物含量：每条记录都必须带「计量基准」和「食物状态」，不把生/熟/制品混为一谈。
// ---------------------------------------------------------------------------
export const FOOD_STATES = {
  raw: { label: '生', hint: '未烹调原料', tone: 'state-raw' },
  cooked: { label: '熟', hint: '烹调后', tone: 'state-cooked' },
  processed: { label: '加工', hint: '制品 / 加工食品', tone: 'state-processed' },
}

export const demoFoods = [
  {
    id: 'pork-liver-raw', name: '猪肝', alias: '生猪肝', category: '畜禽内脏', emoji: '🥩',
    state: 'raw', basis: '每 100 克可食部', ediblePortion: 100,
    nutrients: { protein: 19.3, iron: 22.6, 'vitamin-a': 4972, zinc: 5.78, calcium: 6 },
    note: '生重计。烹调失水后，同样重量熟制品的每 100 克数值会明显升高，不能与生重直接比较。',
  },
  {
    id: 'pork-liver-braised', name: '猪肝（卤煮）', alias: '熟猪肝', category: '畜禽内脏', emoji: '🥘',
    state: 'cooked', basis: '每 100 克可食部', ediblePortion: 100,
    nutrients: { protein: 26.0, iron: 30.0, 'vitamin-a': 6100, 'vitamin-d': 8, zinc: 7.5, calcium: 8 },
    note: '熟重计。与「生猪肝」为不同状态记录，数值因失水而浓缩，请勿混用。',
  },
  {
    id: 'spinach-raw', name: '菠菜', alias: '生菠菜', category: '深色蔬菜', emoji: '🥬',
    state: 'raw', basis: '每 100 克可食部', ediblePortion: 89,
    nutrients: { protein: 2.6, iron: 2.9, calcium: 66, 'vitamin-a': 487, 'vitamin-c': 32, zinc: 0.85 },
    note: '生重计。菠菜含草酸，焯水会同时影响草酸与维生素 C 的含量。',
  },
  {
    id: 'spinach-blanched', name: '菠菜（焯熟）', alias: '焯水菠菜', category: '深色蔬菜', emoji: '🥗',
    state: 'cooked', basis: '每 100 克可食部', ediblePortion: 100,
    nutrients: { protein: 2.9, iron: 3.5, calcium: 80, 'vitamin-a': 520, 'vitamin-c': 12, zinc: 0.9 },
    note: '熟重计。焯水后维生素 C 明显下降，矿物质因失水相对浓缩。',
  },
  {
    id: 'soybean-cooked', name: '黄豆（煮）', alias: '煮黄豆', category: '豆类', emoji: '🫘',
    state: 'cooked', basis: '每 100 克', ediblePortion: 100,
    nutrients: { protein: 16.6, carbohydrate: 8.4, fat: 8.0, 'dietary-fiber': 6.0, potassium: 515, phosphorus: 194, calcium: 60, iron: 2.2 },
    note: '熟重计。干黄豆煮制后吸水增重，每 100 克数值明显低于干豆，不能混算。',
  },
  {
    id: 'tofu-firm', name: '北豆腐', alias: '老豆腐', category: '豆制品', emoji: '🍲',
    state: 'processed', basis: '每 100 克', ediblePortion: 100,
    nutrients: { protein: 12.2, iron: 1.5, calcium: 138, zinc: 0.63 },
    note: '制品计。加工后含水量升高，每 100 克蛋白质低于干黄豆。',
  },
  {
    id: 'milk-whole', name: '牛奶（全脂）', alias: '全脂牛奶', category: '奶类', emoji: '🥛',
    state: 'processed', basis: '每 100 毫升', ediblePortion: 100,
    nutrients: { protein: 3.0, calcium: 104, 'vitamin-d': 0.5 },
    note: '按体积计。与固体食物的「每 100 克」基准不同，比较时需注意单位。',
  },
  {
    id: 'egg-boiled', name: '鸡蛋（煮）', alias: '水煮蛋', category: '蛋类', emoji: '🥚',
    state: 'cooked', basis: '每 100 克可食部', ediblePortion: 88,
    nutrients: { protein: 13.3, iron: 2.4, 'vitamin-a': 234, 'vitamin-d': 5, zinc: 1.1, calcium: 56 },
    note: '熟重计。可食部指去壳后可食用部分。',
  },
  {
    id: 'beef-lean-raw', name: '瘦牛肉', alias: '生瘦牛肉', category: '畜禽肉', emoji: '🥩',
    state: 'raw', basis: '每 100 克可食部', ediblePortion: 100,
    nutrients: { protein: 20.2, iron: 2.8, zinc: 3.71, 'vitamin-a': 6 },
    note: '生重计。血红素铁比例较高，吸收受同餐因素影响相对较小。',
  },
  {
    id: 'beef-lean-stewed', name: '瘦牛肉（炖熟）', alias: '炖牛肉', category: '畜禽肉', emoji: '🍖',
    state: 'cooked', basis: '每 100 克可食部', ediblePortion: 100,
    nutrients: { protein: 28.0, iron: 3.9, zinc: 5.2, 'vitamin-a': 8 },
    note: '熟重计。长时间炖煮失水，单位重量营养素浓度升高。',
  },
  {
    id: 'salmon-cooked', name: '三文鱼（熟）', alias: '熟三文鱼', category: '水产', emoji: '🐟',
    state: 'cooked', basis: '每 100 克可食部', ediblePortion: 100,
    nutrients: { protein: 22.0, 'vitamin-d': 13.0, calcium: 9 },
    note: '熟重计。是维生素 D 的天然食物来源之一。',
  },
  {
    id: 'orange-fresh', name: '橙子', alias: '鲜橙', category: '水果', emoji: '🍊',
    state: 'raw', basis: '每 100 克可食部', ediblePortion: 74,
    nutrients: { protein: 0.8, 'vitamin-c': 33, calcium: 20 },
    note: '生重计。可食部指去皮后的果肉部分。',
  },
  {
    id: 'broccoli-blanched', name: '西兰花（焯熟）', alias: '焯水西兰花', category: '深色蔬菜', emoji: '🥦',
    state: 'cooked', basis: '每 100 克可食部', ediblePortion: 100,
    nutrients: { protein: 4.1, 'vitamin-c': 51, calcium: 67, iron: 1.0 },
    note: '熟重计。短时焯水比长时间水煮保留更多维生素 C。',
  },
  {
    id: 'oats-dry', name: '燕麦片', alias: '干燕麦片', category: '谷类', emoji: '🌾',
    state: 'processed', basis: '每 100 克干重', ediblePortion: 100,
    nutrients: { protein: 15.0, iron: 4.2, calcium: 186, zinc: 2.59 },
    note: '干重计。冲泡后重量增加，每 100 克熟制燕麦片的数值会相应下降。',
  },

  // ---- 畜禽肉与水产 ----
  {
    id: 'pork-lean-raw', name: '猪瘦肉', alias: '生猪肉', category: '畜禽肉', emoji: '🥩',
    state: 'raw', basis: '每 100 克可食部', ediblePortion: 100,
    nutrients: { protein: 20.3, fat: 6.2, iron: 1.3, zinc: 2.0, 'vitamin-b1': 0.54, calcium: 6, sodium: 57.5 },
    note: '生重计。选择瘦肉可减少饱和脂肪，烹调时少油少盐。',
  },
  {
    id: 'pork-lean-cooked', name: '猪瘦肉（熟）', alias: '炖猪肉', category: '畜禽肉', emoji: '🍖',
    state: 'cooked', basis: '每 100 克可食部', ediblePortion: 100,
    nutrients: { protein: 26.0, fat: 8.0, iron: 1.7, zinc: 2.6, 'vitamin-b1': 0.3, calcium: 8, sodium: 60 },
    note: '熟重计。与生猪瘦肉为不同状态记录，数值因失水而浓缩，不能混算。',
  },
  {
    id: 'beef-raw', name: '牛肉', alias: '生牛肉', category: '畜禽肉', emoji: '🥩',
    state: 'raw', basis: '每 100 克可食部', ediblePortion: 100,
    nutrients: { protein: 19.9, fat: 4.2, iron: 3.3, zinc: 4.73, 'vitamin-b1': 0.04, calcium: 23, sodium: 53.6 },
    note: '生重计。血红素铁含量较高，吸收受同餐因素影响相对较小。',
  },
  {
    id: 'chicken-raw', name: '鸡肉', alias: '生鸡肉', category: '畜禽肉', emoji: '🍗',
    state: 'raw', basis: '每 100 克可食部', ediblePortion: 66,
    nutrients: { protein: 19.3, fat: 9.4, iron: 1.4, zinc: 1.09, 'vitamin-a': 48, calcium: 9, sodium: 63.3 },
    note: '生重计。可食部指去骨后的肉部分，带皮脂肪明显更高。',
  },
  {
    id: 'chicken-cooked', name: '鸡肉（熟）', alias: '炖鸡肉', category: '畜禽肉', emoji: '🍗',
    state: 'cooked', basis: '每 100 克可食部', ediblePortion: 100,
    nutrients: { protein: 23.0, fat: 11.0, iron: 1.6, zinc: 1.3, 'vitamin-a': 55, calcium: 11, sodium: 70 },
    note: '熟重计。与生鸡肉为不同状态记录，数值因失水而浓缩。',
  },
  {
    id: 'chicken-breast-raw', name: '鸡胸肉', alias: '生鸡胸肉', category: '畜禽肉', emoji: '🍗',
    state: 'raw', basis: '每 100 克可食部', ediblePortion: 100,
    nutrients: { protein: 24.6, fat: 5.0, iron: 0.6, zinc: 0.7, 'vitamin-b1': 0.07, calcium: 5, sodium: 45 },
    note: '生重计。蛋白质高、脂肪低，是常见的优质蛋白来源。',
  },
  {
    id: 'chicken-breast-cooked', name: '鸡胸肉（熟）', alias: '水煮鸡胸', category: '畜禽肉', emoji: '🍗',
    state: 'cooked', basis: '每 100 克可食部', ediblePortion: 100,
    nutrients: { protein: 29.0, fat: 6.0, iron: 0.7, zinc: 0.8, 'vitamin-b1': 0.05, calcium: 6, sodium: 50 },
    note: '熟重计。水煮后失水，单位重量蛋白质浓度升高。',
  },
  {
    id: 'chicken-leg-braised', name: '卤鸡腿', alias: '卤制鸡腿', category: '畜禽肉', emoji: '🍗',
    state: 'cooked', basis: '每 100 克可食部', ediblePortion: 100,
    nutrients: { protein: 17.9, carbohydrate: 2.8, fat: 9.7, sodium: 620, potassium: 232, phosphorus: 178, iron: 1.3, zinc: 2.0 },
    note: '熟重计。卤汁带入较多盐和少量糖，钠含量偏高。',
  },
  {
    id: 'duck-leg-braised', name: '卤鸭腿', alias: '卤制鸭腿', category: '畜禽肉', emoji: '🦆',
    state: 'cooked', basis: '每 100 克可食部', ediblePortion: 100,
    nutrients: { protein: 16.5, carbohydrate: 2.5, fat: 17.8, sodium: 640, potassium: 210, phosphorus: 165, iron: 2.1, zinc: 1.8 },
    note: '熟重计。带皮卤制脂肪较多，能量高于卤鸡腿。',
  },
  {
    id: 'grass-carp-raw', name: '草鱼', alias: '鲩鱼', category: '水产', emoji: '🐟',
    state: 'raw', basis: '每 100 克可食部', ediblePortion: 58,
    nutrients: { protein: 16.6, fat: 5.2, calcium: 38, iron: 0.8, zinc: 0.87, 'vitamin-a': 11, sodium: 46 },
    note: '生重计。可食部指去鳞去内脏后的鱼肉部分。',
  },
  {
    id: 'hairtail-raw', name: '带鱼', alias: '刀鱼', category: '水产', emoji: '🐟',
    state: 'raw', basis: '每 100 克可食部', ediblePortion: 76,
    nutrients: { protein: 17.7, fat: 4.9, calcium: 28, iron: 1.2, zinc: 0.7, 'vitamin-a': 29, sodium: 150 },
    note: '生重计。海鱼，钠含量高于多数淡水鱼。',
  },
  {
    id: 'seabass-raw', name: '鲈鱼', alias: '花鲈', category: '水产', emoji: '🐟',
    state: 'raw', basis: '每 100 克可食部', ediblePortion: 58,
    nutrients: { protein: 18.6, fat: 3.4, calcium: 138, iron: 2.0, zinc: 2.83, 'vitamin-a': 19, sodium: 144 },
    note: '生重计。钙、锌含量在鱼类中相对较高。',
  },

  // ---- 蔬菜 ----
  {
    id: 'cabbage-chinese', name: '大白菜', alias: '白菜', category: '蔬菜 · 叶菜', emoji: '🥬',
    state: 'raw', basis: '每 100 克可食部', ediblePortion: 89,
    nutrients: { protein: 1.5, carbohydrate: 3.2, calcium: 50, iron: 0.7, 'vitamin-c': 31, zinc: 0.38, sodium: 57.5 },
    note: '生重计。可食部指去根去老叶后的部分。',
  },
  {
    id: 'youcai', name: '油菜', alias: '小油菜', category: '蔬菜 · 叶菜', emoji: '🥬',
    state: 'raw', basis: '每 100 克可食部', ediblePortion: 87,
    nutrients: { protein: 1.8, carbohydrate: 3.8, calcium: 108, iron: 1.2, 'vitamin-c': 36, zinc: 0.33, sodium: 55.8 },
    note: '生重计。钙含量在叶菜中相对较高，但受草酸影响吸收率有限。',
  },
  {
    id: 'carrot', name: '胡萝卜', alias: '红萝卜', category: '蔬菜 · 根茎', emoji: '🥕',
    state: 'raw', basis: '每 100 克可食部', ediblePortion: 96,
    nutrients: { protein: 1.0, carbohydrate: 8.8, calcium: 32, iron: 1.0, 'vitamin-a': 688, 'vitamin-c': 13, zinc: 0.23, sodium: 71.4 },
    note: '生重计。β-胡萝卜素属脂溶性，油烹调后吸收率通常提高。',
  },
  {
    id: 'tomato', name: '番茄', alias: '西红柿', category: '蔬菜 · 茄果', emoji: '🍅',
    state: 'raw', basis: '每 100 克可食部', ediblePortion: 97,
    nutrients: { protein: 0.9, carbohydrate: 4.0, calcium: 10, iron: 0.4, 'vitamin-c': 19, 'vitamin-a': 92, zinc: 0.13, sodium: 5.0 },
    note: '生重计。番茄红素在加热和油脂条件下更易被利用。',
  },
  {
    id: 'cucumber', name: '黄瓜', alias: '青瓜', category: '蔬菜 · 茄果', emoji: '🥒',
    state: 'raw', basis: '每 100 克可食部', ediblePortion: 92,
    nutrients: { protein: 0.8, carbohydrate: 2.9, calcium: 24, iron: 0.5, 'vitamin-c': 9, zinc: 0.18, sodium: 4.9 },
    note: '生重计。含水量高，单位重量营养素浓度较低。',
  },
  {
    id: 'eggplant', name: '茄子', category: '蔬菜 · 茄果', emoji: '🍆',
    state: 'raw', basis: '每 100 克可食部', ediblePortion: 93,
    nutrients: { protein: 1.1, carbohydrate: 4.9, calcium: 24, iron: 0.5, 'vitamin-c': 5, zinc: 0.23, sodium: 5.4 },
    note: '生重计。吸油性强，烹调方式会明显影响最终脂肪含量。',
  },
  {
    id: 'celery', name: '芹菜', category: '蔬菜 · 叶菜', emoji: '🌿',
    state: 'raw', basis: '每 100 克可食部', ediblePortion: 66,
    nutrients: { protein: 1.2, carbohydrate: 4.5, calcium: 80, iron: 1.2, 'vitamin-c': 8, zinc: 0.24, sodium: 159 },
    note: '生重计。茎叶都可食，钠含量在蔬菜中偏高。',
  },
  {
    id: 'green-pepper', name: '青椒', alias: '柿子椒', category: '蔬菜 · 茄果', emoji: '🫑',
    state: 'raw', basis: '每 100 克可食部', ediblePortion: 100,
    nutrients: { protein: 1.4, carbohydrate: 5.4, calcium: 15, iron: 0.8, 'vitamin-c': 72, 'vitamin-a': 57, zinc: 0.19, sodium: 3.3 },
    note: '生重计。维生素 C 含量较高，急火快炒可减少损失。',
  },
  {
    id: 'onion', name: '洋葱', category: '蔬菜 · 根茎', emoji: '🧅',
    state: 'raw', basis: '每 100 克可食部', ediblePortion: 90,
    nutrients: { protein: 1.1, carbohydrate: 9.0, calcium: 24, iron: 0.6, 'vitamin-c': 8, zinc: 0.23, selenium: 1.0, sodium: 4.4 },
    note: '生重计。切开后放置会损失部分含硫风味物质。',
  },
  {
    id: 'shiitake', name: '香菇（鲜）', alias: '鲜香菇', category: '蔬菜 · 菌藻', emoji: '🍄',
    state: 'raw', basis: '每 100 克可食部', ediblePortion: 100,
    nutrients: { protein: 2.2, carbohydrate: 5.2, calcium: 2, iron: 0.3, 'vitamin-c': 1, zinc: 0.66, selenium: 2.58, sodium: 1.4 },
    note: '生重计。干制后单位重量营养素浓度显著升高。',
  },

  // ---- 水果 ----
  {
    id: 'apple', name: '苹果', category: '水果', emoji: '🍎',
    state: 'raw', basis: '每 100 克可食部', ediblePortion: 85,
    nutrients: { protein: 0.2, carbohydrate: 13.5, calcium: 4, iron: 0.6, 'vitamin-c': 4, zinc: 0.19, sodium: 1.6 },
    note: '生重计。可食部指去核后的果肉部分。',
  },
  {
    id: 'banana', name: '香蕉', category: '水果', emoji: '🍌',
    state: 'raw', basis: '每 100 克可食部', ediblePortion: 59,
    nutrients: { protein: 1.4, carbohydrate: 22.0, calcium: 7, iron: 0.4, 'vitamin-c': 8, zinc: 0.18, magnesium: 43, sodium: 0.8 },
    note: '生重计。可食部指去皮后的果肉部分，钾含量较高。',
  },
  {
    id: 'pear', name: '梨', category: '水果', emoji: '🍐',
    state: 'raw', basis: '每 100 克可食部', ediblePortion: 75,
    nutrients: { protein: 0.4, carbohydrate: 13.3, calcium: 9, iron: 0.5, 'vitamin-c': 6, zinc: 0.46, sodium: 2.1 },
    note: '生重计。可食部指去核后的果肉部分。',
  },
  {
    id: 'grape', name: '葡萄', category: '水果', emoji: '🍇',
    state: 'raw', basis: '每 100 克可食部', ediblePortion: 86,
    nutrients: { protein: 0.5, carbohydrate: 10.3, calcium: 5, iron: 0.4, 'vitamin-c': 25, zinc: 0.18, sodium: 1.3 },
    note: '生重计。可食部指去梗去皮后的果肉部分。',
  },
  {
    id: 'watermelon', name: '西瓜', category: '水果', emoji: '🍉',
    state: 'raw', basis: '每 100 克可食部', ediblePortion: 56,
    nutrients: { protein: 0.6, carbohydrate: 8.1, calcium: 8, iron: 0.3, 'vitamin-c': 6, zinc: 0.1, sodium: 3.2 },
    note: '生重计。含水量高，单位重量营养素浓度较低。',
  },
  {
    id: 'kiwi', name: '猕猴桃', alias: '奇异果', category: '水果', emoji: '🥝',
    state: 'raw', basis: '每 100 克可食部', ediblePortion: 83,
    nutrients: { protein: 0.8, carbohydrate: 14.5, calcium: 27, iron: 1.2, 'vitamin-c': 62, zinc: 0.57, sodium: 10 },
    note: '生重计。维生素 C 含量突出。',
  },
  {
    id: 'strawberry', name: '草莓', category: '水果', emoji: '🍓',
    state: 'raw', basis: '每 100 克可食部', ediblePortion: 97,
    nutrients: { protein: 1.0, carbohydrate: 7.1, calcium: 18, iron: 1.8, 'vitamin-c': 47, zinc: 0.14, sodium: 4.2 },
    note: '生重计。维生素 C 含量较高，但易受存放时间影响。',
  },

  // ---- 谷物 ----
  {
    id: 'rice-cooked', name: '米饭（熟）', category: '谷物', emoji: '🍚',
    state: 'cooked', basis: '每 100 克', ediblePortion: 100,
    nutrients: { protein: 2.6, carbohydrate: 25.9, fat: 0.3, calcium: 7, iron: 1.3, zinc: 0.92, sodium: 2.5 },
    note: '熟重计。与生大米为不同状态记录，不能混算。',
  },
  {
    id: 'mantou', name: '馒头', alias: '蒸馒头', category: '谷物', emoji: '🍞',
    state: 'cooked', basis: '每 100 克', ediblePortion: 100,
    nutrients: { protein: 7.0, carbohydrate: 47.0, fat: 1.1, calcium: 38, iron: 1.8, zinc: 0.71, sodium: 165 },
    note: '熟重计。制作时加入的碱和盐会带入少量钠。',
  },
  {
    id: 'millet-porridge', name: '小米粥（熟）', alias: '煮小米粥', category: '谷物', emoji: '🥣',
    state: 'cooked', basis: '每 100 克', ediblePortion: 100,
    nutrients: { protein: 1.4, carbohydrate: 9.7, fat: 0.7, potassium: 19, phosphorus: 29, iron: 1.0 },
    note: '熟重计。加水量不同浓度差异较大，数值按常规稠度估算。',
  },
  {
    id: 'corn', name: '玉米（鲜）', alias: '甜玉米', category: '谷物', emoji: '🌽',
    state: 'raw', basis: '每 100 克可食部', ediblePortion: 46,
    nutrients: { protein: 4.0, carbohydrate: 22.8, fat: 1.2, calcium: 4, iron: 1.1, zinc: 0.9, 'vitamin-c': 16, sodium: 1.1 },
    note: '生重计。可食部指去除玉米芯后的籽粒部分。',
  },
  {
    id: 'wholewheat-bread', name: '全麦面包', category: '谷物', emoji: '🍞',
    state: 'processed', basis: '每 100 克', ediblePortion: 100,
    nutrients: { protein: 9.0, carbohydrate: 45.0, fat: 3.0, calcium: 60, iron: 2.5, zinc: 1.5, sodium: 460 },
    note: '制品计。含盐量通常高于馒头，注意隐形钠。',
  },
  {
    id: 'noodle-cooked', name: '面条（煮）', alias: '水煮面条', category: '谷物', emoji: '🍜',
    state: 'cooked', basis: '每 100 克', ediblePortion: 100,
    nutrients: { protein: 3.9, carbohydrate: 22.0, fat: 0.4, 'dietary-fiber': 0.8, calcium: 13, iron: 0.9, sodium: 84, potassium: 47, phosphorus: 40 },
    note: '熟重计。煮制后吸水增重，与面粉干重数值不能直接比较。',
  },

  // ---- 薯类 ----
  {
    id: 'potato', name: '土豆（生）', alias: '马铃薯', category: '薯类', emoji: '🥔',
    state: 'raw', basis: '每 100 克可食部', ediblePortion: 94,
    nutrients: { protein: 2.0, carbohydrate: 17.2, fat: 0.2, calcium: 8, iron: 0.8, 'vitamin-c': 27, zinc: 0.37, sodium: 2.7 },
    note: '生重计。发芽或表皮变绿的土豆不宜食用。',
  },
  {
    id: 'potato-steamed', name: '土豆（蒸熟）', category: '薯类', emoji: '🥔',
    state: 'cooked', basis: '每 100 克', ediblePortion: 100,
    nutrients: { protein: 1.9, carbohydrate: 16.5, fat: 0.2, calcium: 8, iron: 0.7, 'vitamin-c': 15, zinc: 0.35, sodium: 3.0 },
    note: '熟重计。蒸煮后维生素 C 有部分损失，矿物质相对稳定。',
  },
  {
    id: 'sweet-potato', name: '红薯', alias: '甘薯', category: '薯类', emoji: '🍠',
    state: 'raw', basis: '每 100 克可食部', ediblePortion: 90,
    nutrients: { protein: 1.1, carbohydrate: 24.7, fat: 0.2, calcium: 23, iron: 0.5, 'vitamin-c': 26, 'vitamin-a': 125, zinc: 0.15, sodium: 28.5 },
    note: '生重计。可食部指去皮后的薯肉部分。',
  },
  {
    id: 'yam', name: '山药', alias: '淮山', category: '薯类', emoji: '🍠',
    state: 'raw', basis: '每 100 克可食部', ediblePortion: 83,
    nutrients: { protein: 1.9, carbohydrate: 12.4, fat: 0.2, calcium: 16, iron: 0.3, 'vitamin-c': 5, zinc: 0.27, sodium: 18.6 },
    note: '生重计。黏液蛋白接触皮肤可能引起瘙痒，处理时可戴手套。',
  },

  // ---- 豆类 ----
  {
    id: 'red-bean-cooked', name: '红豆（煮）', alias: '煮红豆', category: '豆类', emoji: '🫘',
    state: 'cooked', basis: '每 100 克', ediblePortion: 100,
    nutrients: { protein: 7.5, carbohydrate: 24.8, fat: 0.5, 'dietary-fiber': 3.1, potassium: 323, phosphorus: 120, iron: 2.0 },
    note: '熟重计。干红豆煮制后吸水增重，数值与干豆不能混算。',
  },
  {
    id: 'mung-bean-cooked', name: '绿豆（煮）', alias: '煮绿豆', category: '豆类', emoji: '🫘',
    state: 'cooked', basis: '每 100 克', ediblePortion: 100,
    nutrients: { protein: 7.0, carbohydrate: 19.2, fat: 0.5, 'dietary-fiber': 1.8, potassium: 266, phosphorus: 99, iron: 1.4 },
    note: '熟重计。干绿豆煮制后吸水增重，数值与干豆不能混算。',
  },
  {
    id: 'black-bean-cooked', name: '黑豆（煮）', alias: '煮黑豆', category: '豆类', emoji: '🫘',
    state: 'cooked', basis: '每 100 克', ediblePortion: 100,
    nutrients: { protein: 15.7, carbohydrate: 14.6, fat: 6.9, 'dietary-fiber': 4.4, potassium: 599, phosphorus: 217, iron: 3.0, calcium: 97 },
    note: '熟重计。干黑豆煮制后吸水增重，数值与干豆不能混算。',
  },

  // ---- 豆制品 ----
  {
    id: 'south-tofu', name: '南豆腐', alias: '嫩豆腐', category: '豆制品', emoji: '🍲',
    state: 'processed', basis: '每 100 克', ediblePortion: 100,
    nutrients: { protein: 6.2, carbohydrate: 2.4, fat: 3.7, calcium: 116, iron: 1.5, zinc: 0.55, sodium: 7.3 },
    note: '制品计。含水量高，蛋白质和钙低于北豆腐。',
  },
  {
    id: 'tofu-dry', name: '豆腐干', alias: '香干', category: '豆制品', emoji: '🧈',
    state: 'processed', basis: '每 100 克', ediblePortion: 100,
    nutrients: { protein: 16.2, carbohydrate: 11.5, fat: 3.6, calcium: 308, iron: 4.9, zinc: 1.76, sodium: 76 },
    note: '制品计。脱水后蛋白质和钙浓度高于豆腐。',
  },
  {
    id: 'soy-milk', name: '无糖豆浆', alias: '纯豆浆', category: '豆制品', emoji: '🥛',
    state: 'processed', basis: '每 100 毫升', ediblePortion: 100,
    nutrients: { protein: 3.0, carbohydrate: 1.2, fat: 1.6, calcium: 10, iron: 0.5, zinc: 0.24, sodium: 3.0 },
    note: '按体积计。无糖版本；与固体豆制品的计量基准不同，比较时需注意单位。',
  },
  {
    id: 'soy-milk-sweet', name: '有糖豆浆', alias: '甜豆浆', category: '豆制品', emoji: '🥛',
    state: 'processed', basis: '每 100 毫升', ediblePortion: 100,
    nutrients: { protein: 1.7, carbohydrate: 5.8, fat: 0.8, potassium: 45, sodium: 3.0 },
    note: '制品计。含添加糖，碳水高于无糖豆浆，控糖人群建议选无糖版本。',
  },

  // ---- 油 ----
  {
    id: 'soybean-oil', name: '大豆油', alias: '豆油', category: '油脂', emoji: '🫒',
    state: 'processed', basis: '每 100 克', ediblePortion: 100,
    nutrients: { fat: 99.9, 'vitamin-e': 93.0, sodium: 0 },
    note: '几乎全是脂肪，按每 100 克计。膳食指南建议每天烹调油 25～30 克。',
  },
  {
    id: 'peanut-oil', name: '花生油', category: '油脂', emoji: '🥜',
    state: 'processed', basis: '每 100 克', ediblePortion: 100,
    nutrients: { fat: 99.9, 'vitamin-e': 42.1 },
    note: '几乎全是脂肪，按每 100 克计。注意控制总用油量。',
  },
  {
    id: 'olive-oil', name: '橄榄油', category: '油脂', emoji: '🫒',
    state: 'processed', basis: '每 100 克', ediblePortion: 100,
    nutrients: { fat: 99.9, 'vitamin-e': 14.4 },
    note: '以单不饱和脂肪酸为主，按每 100 克计。',
  },

  // ---- 盐 / 调味品 ----
  {
    id: 'salt', name: '食盐', alias: '精盐', category: '调味品', emoji: '🧂',
    state: 'processed', basis: '每 100 克', ediblePortion: 100,
    nutrients: { sodium: 39000 },
    note: '以钠计：食盐约含 40% 钠，1 克食盐约含 400 毫克钠。膳食指南建议每天食盐不超过 5 克。',
  },
]

// 各营养素含量最高的常见食物（若原数据集没有则补充到这里），
// 用于「食物来源」按含量排序展示前 5 位。数值为每 100 克可食部。
const EXTRA_RICH_FOODS = [
  { id: 'chicken-liver', name: '鸡肝', alias: '生鸡肝', category: '畜禽内脏', emoji: '🍖', state: 'raw', basis: '每 100 克可食部', ediblePortion: 100,
    nutrients: { protein: 16.6, fat: 4.8, 'vitamin-a': 10414, 'vitamin-b2': 1.1, 'vitamin-b12': 16.6, 'vitamin-b3': 11.9, 'vitamin-b5': 6.0, iron: 12, zinc: 2.4, phosphorus: 263, copper: 0.4, selenium: 38 },
    note: '生重计。动物肝脏维生素 A 含量极高，适量食用即可，不宜过量。' },
  { id: 'chicken-liver-cooked', name: '鸡肝（熟）', alias: '卤鸡肝', category: '畜禽内脏', emoji: '🍖', state: 'cooked', basis: '每 100 克可食部', ediblePortion: 100,
    nutrients: { protein: 26, fat: 7, 'vitamin-a': 10000, 'vitamin-b2': 1.2, 'vitamin-b12': 17, 'vitamin-b3': 12, 'vitamin-b5': 7, iron: 14, zinc: 2.8, phosphorus: 300, copper: 0.45, selenium: 40 },
    note: '熟重计。与生鸡肝为不同状态记录，数值因失水而浓缩，不能混算。' },
  { id: 'clam', name: '蛤蜊', alias: '花蛤', category: '水产', emoji: '🦪', state: 'raw', basis: '每 100 克可食部', ediblePortion: 39,
    nutrients: { protein: 10.1, fat: 1.1, 'vitamin-b12': 19.1, iron: 10.9, zinc: 2.4, 'vitamin-b2': 0.28, calcium: 133, sodium: 425, selenium: 55 },
    note: '可食部指去壳后的蛤肉。贝类是维生素 B12 和铁的优质来源。' },
  { id: 'fresh-jujube', name: '鲜枣', alias: '冬枣', category: '水果', emoji: '🫒', state: 'raw', basis: '每 100 克可食部', ediblePortion: 87,
    nutrients: { carbohydrate: 30.5, 'vitamin-c': 243, 'dietary-fiber': 1.9, potassium: 375, 'vitamin-a': 40 },
    note: '维生素 C 含量在水果中名列前茅，但干枣后损失较多。' },
  { id: 'peanut', name: '花生', alias: '落花生', category: '豆类', emoji: '🥜', state: 'raw', basis: '每 100 克可食部', ediblePortion: 100,
    nutrients: { protein: 24.8, fat: 44.3, carbohydrate: 21.7, 'vitamin-b1': 0.72, 'vitamin-b3': 17.9, 'vitamin-e': 18.1, 'dietary-fiber': 7.7, magnesium: 178, potassium: 587, zinc: 2.5 },
    note: '能量较高，注意控制份量；霉变花生可能含黄曲霉毒素，不可食用。' },
  { id: 'sunflower-seed', name: '葵花籽仁', alias: '瓜子仁', category: '坚果', emoji: '🌻', state: 'raw', basis: '每 100 克可食部', ediblePortion: 100,
    nutrients: { protein: 19.1, fat: 52.8, 'vitamin-e': 34.5, 'dietary-fiber': 8.6, magnesium: 264, selenium: 5.8, zinc: 6.0 },
    note: '维生素 E 含量很高，但热量也高，每天一小把即可。' },
  { id: 'almond', name: '杏仁', alias: '巴旦木', category: '坚果', emoji: '🌰', state: 'raw', basis: '每 100 克可食部', ediblePortion: 100,
    nutrients: { protein: 21.2, fat: 49.9, 'vitamin-e': 25.6, 'dietary-fiber': 12.5, calcium: 97, magnesium: 178, potassium: 733 },
    note: '选择原味坚果，避免盐焗、糖衣带来的额外盐和糖。' },
  { id: 'natto', name: '纳豆', category: '豆制品', emoji: '🫘', state: 'processed', basis: '每 100 克', ediblePortion: 100,
    nutrients: { protein: 17.7, 'vitamin-k': 729, 'vitamin-b2': 0.56, 'dietary-fiber': 5.4, calcium: 90 },
    note: '发酵豆制品，维生素 K（尤其 K2）含量突出；服用华法林者需保持摄入稳定。' },
  { id: 'sesame-paste', name: '芝麻酱', category: '坚果', emoji: '🫙', state: 'processed', basis: '每 100 克', ediblePortion: 100,
    nutrients: { calcium: 1170, protein: 19.2, fat: 52.7, iron: 9.1, magnesium: 238, 'vitamin-e': 4.0, copper: 1.7 },
    note: '钙含量很高，但热量也高，拌菜时一小勺即可。' },
  { id: 'duck-blood', name: '鸭血', category: '畜禽内脏', emoji: '🩸', state: 'processed', basis: '每 100 克', ediblePortion: 100,
    nutrients: { protein: 13.6, iron: 30.5, 'vitamin-b12': 2.0, zinc: 0.7 },
    note: '制品计。血红素铁含量高，是补铁的良好来源。' },
  { id: 'oyster', name: '生蚝', alias: '牡蛎', category: '水产', emoji: '🦪', state: 'raw', basis: '每 100 克可食部', ediblePortion: 100,
    nutrients: { protein: 10.9, fat: 1.5, zinc: 9.39, 'vitamin-b12': 15.6, iron: 5.5, copper: 5.0, selenium: 86.6, calcium: 131 },
    note: '锌含量在所有食物中名列前茅；生食需注意食品安全。' },
  { id: 'kelp', name: '海带（鲜）', alias: '冷鲜海带', category: '蔬菜 · 菌藻', emoji: '🌿', state: 'raw', basis: '每 100 克可食部', ediblePortion: 100,
    nutrients: { iodine: 2950, calcium: 168, 'dietary-fiber': 1.2, potassium: 89, protein: 1.2 },
    note: '碘含量受产地、品种影响很大（干海带更高）；甲状腺疾病患者应遵医嘱。' },
  { id: 'brazil-nut', name: '巴西坚果', alias: '巴西栗', category: '坚果', emoji: '🌰', state: 'raw', basis: '每 100 克可食部', ediblePortion: 100,
    nutrients: { selenium: 1917, protein: 14.3, fat: 66.4, magnesium: 376, 'dietary-fiber': 7.5 },
    note: '硒含量极高，每天 1～2 颗即可，不宜大量食用。' },
  { id: 'red-cabbage', name: '紫甘蓝', category: '蔬菜 · 叶菜', emoji: '🥬', state: 'raw', basis: '每 100 克可食部', ediblePortion: 100,
    nutrients: { anthocyanin: 150, 'vitamin-c': 57, 'dietary-fiber': 2.5, calcium: 45, potassium: 243 },
    note: '紫红色来自花青素，凉拌或快炒可减少损失。' },
  { id: 'kale', name: '羽衣甘蓝', category: '蔬菜 · 叶菜', emoji: '🥬', state: 'raw', basis: '每 100 克可食部', ediblePortion: 100,
    nutrients: { lutein: 11.4, 'vitamin-k': 705, 'vitamin-c': 120, 'beta-carotene': 4360, calcium: 150 },
    note: '叶黄素和维生素 K 含量高，适合快炒或做沙拉。' },
  { id: 'pumpkin', name: '南瓜', category: '蔬菜 · 根茎', emoji: '🎃', state: 'raw', basis: '每 100 克可食部', ediblePortion: 85,
    nutrients: { 'beta-carotene': 890, 'vitamin-a': 74, 'dietary-fiber': 0.8, potassium: 145 },
    note: 'β-胡萝卜素丰富，与油脂同烹更利于吸收。' },
  { id: 'guava', name: '番石榴', alias: '芭乐', category: '水果', emoji: '🍐', state: 'raw', basis: '每 100 克可食部', ediblePortion: 97,
    nutrients: { lycopene: 5.2, 'vitamin-c': 228, 'dietary-fiber': 5.9, potassium: 417 },
    note: '番茄红素和维生素 C 含量都较高。' },
  { id: 'shrimp', name: '虾', alias: '鲜虾', category: '水产', emoji: '🦐', state: 'raw', basis: '每 100 克可食部', ediblePortion: 60,
    nutrients: { protein: 18.6, astaxanthin: 1.0, iodine: 40, zinc: 2.4, selenium: 33, calcium: 62 },
    note: '虾壳和虾青素赋予虾类橙红色；可食部指去壳后的虾肉。' },
  { id: 'crab', name: '蟹', alias: '河蟹', category: '水产', emoji: '🦀', state: 'raw', basis: '每 100 克可食部', ediblePortion: 45,
    nutrients: { protein: 17.5, astaxanthin: 1.5, iodine: 30, zinc: 3.3, selenium: 40, calcium: 126 },
    note: '可食部指去壳后的蟹肉和蟹黄。' },
  { id: 'cocoa-powder', name: '可可粉', category: '调味品', emoji: '🍫', state: 'processed', basis: '每 100 克', ediblePortion: 100,
    nutrients: { copper: 3.8, magnesium: 499, iron: 13.9, 'dietary-fiber': 33.2, protein: 19.6, potassium: 1524 },
    note: '选择无糖可可粉；市售可可饮品往往含较多糖。' },
  { id: 'butter', name: '黄油', category: '油脂', emoji: '🧈', state: 'processed', basis: '每 100 克', ediblePortion: 100,
    nutrients: { fat: 81.1, 'vitamin-a': 684, 'vitamin-e': 2.3, sodium: 11 },
    note: '以饱和脂肪为主，建议少量使用。' },
  { id: 'tomato-paste', name: '番茄酱', category: '调味品', emoji: '🥫', state: 'processed', basis: '每 100 克', ediblePortion: 100,
    nutrients: { lycopene: 15, carbohydrate: 18.0, potassium: 989, 'vitamin-c': 12 },
    note: '浓缩制品，番茄红素含量高；注意市售产品可能额外加糖和盐。' },
  { id: 'grapefruit', name: '红心柚', alias: '西柚', category: '水果', emoji: '🍊', state: 'raw', basis: '每 100 克可食部', ediblePortion: 69,
    nutrients: { lycopene: 3.4, 'vitamin-c': 23, 'dietary-fiber': 1.2, potassium: 119 },
    note: '正在服用部分药物（如他汀、降压药）者，食用西柚前应咨询医生。' },
]

demoFoods.push(...EXTRA_RICH_FOODS)

// 熟制水产：与生鲜水产成对记录，只展示熟制。
const COOKED_SEAFOOD_FOODS = [
  { id: 'grass-carp-cooked', name: '草鱼（清蒸）', alias: '熟草鱼', category: '水产', emoji: '🐟', state: 'cooked', basis: '每 100 克可食部', ediblePortion: 100,
    nutrients: { protein: 19.5, fat: 5.0, calcium: 42, iron: 0.9, zinc: 1.0, 'vitamin-a': 12, sodium: 50, iodine: 7.5, selenium: 8, 'vitamin-b12': 1.2, phosphorus: 230, magnesium: 35, astaxanthin: 0.12 },
    note: '熟重计。清蒸后失水，单位重量营养素浓度略高于生鱼。' },
  { id: 'hairtail-cooked', name: '带鱼（煎）', alias: '熟带鱼', category: '水产', emoji: '🐟', state: 'cooked', basis: '每 100 克可食部', ediblePortion: 100,
    nutrients: { protein: 20.5, fat: 6.0, calcium: 32, iron: 1.4, zinc: 0.8, 'vitamin-a': 33, sodium: 170, iodine: 46, selenium: 42, 'vitamin-b12': 1.2, phosphorus: 220, magnesium: 32, astaxanthin: 0.25 },
    note: '熟重计。煎制会带入少量烹调油，脂肪略高于生带鱼。' },
  { id: 'seabass-cooked', name: '鲈鱼（清蒸）', alias: '熟鲈鱼', category: '水产', emoji: '🐟', state: 'cooked', basis: '每 100 克可食部', ediblePortion: 100,
    nutrients: { protein: 21.5, fat: 3.8, calcium: 160, iron: 2.3, zinc: 3.2, 'vitamin-a': 22, sodium: 165, iodine: 9, selenium: 23, 'vitamin-b12': 1.7, phosphorus: 275, magnesium: 42 },
    note: '熟重计。清蒸后钙、锌等矿物质相对浓缩。' },
  { id: 'clam-cooked', name: '蛤蜊（熟）', alias: '熟花蛤', category: '水产', emoji: '🦪', state: 'cooked', basis: '每 100 克可食部', ediblePortion: 100,
    nutrients: { protein: 12.0, fat: 1.3, 'vitamin-b12': 21, 'vitamin-b2': 0.32, iron: 12.5, zinc: 2.8, calcium: 150, sodium: 480, selenium: 62, iodine: 45 },
    note: '熟重计。加热后蛤肉收缩，维生素 B12 与铁相对浓缩。' },
  { id: 'oyster-cooked', name: '生蚝（蒸）', alias: '熟牡蛎', category: '水产', emoji: '🦪', state: 'cooked', basis: '每 100 克可食部', ediblePortion: 100,
    nutrients: { protein: 12.5, fat: 1.7, zinc: 10.5, 'vitamin-b12': 18, iron: 6.3, copper: 5.6, selenium: 95, calcium: 145, iodine: 72 },
    note: '熟重计。蒸熟后食用更安全，锌、硒相对浓缩。' },
  { id: 'shrimp-cooked', name: '虾（熟）', alias: '熟虾', category: '水产', emoji: '🦐', state: 'cooked', basis: '每 100 克可食部', ediblePortion: 100,
    nutrients: { protein: 21.0, fat: 1.2, astaxanthin: 1.1, iodine: 46, zinc: 2.7, selenium: 37, calcium: 70 },
    note: '熟重计。虾青素在加热后仍较稳定。' },
  { id: 'crab-cooked', name: '蟹（蒸熟）', alias: '熟蟹', category: '水产', emoji: '🦀', state: 'cooked', basis: '每 100 克可食部', ediblePortion: 100,
    nutrients: { protein: 20.0, fat: 2.5, astaxanthin: 1.7, iodine: 34, zinc: 3.8, selenium: 45, calcium: 145 },
    note: '熟重计。可食部指蒸熟后的蟹肉和蟹黄。' },
]

demoFoods.push(...COOKED_SEAFOOD_FOODS)

// 各营养素按含量排序的前 5 位食物（[食物 id, 每 100 克含量]）。
// 详情页「食物来源」优先使用这份清单，确保展示的是该营养素真正含量最高的常见食物。
export const NUTRIENT_TOP_FOODS = {
  protein: [['chicken-breast-cooked', 29], ['beef-lean-stewed', 28], ['chicken-liver-cooked', 26], ['peanut', 24.8], ['chicken-cooked', 23]],
  fat: [['soybean-oil', 99.9], ['butter', 81.1], ['brazil-nut', 66.4], ['sunflower-seed', 52.8], ['almond', 49.9]],
  carbohydrate: [['mantou', 47], ['wholewheat-bread', 45], ['fresh-jujube', 30.5], ['rice-cooked', 25.9], ['corn', 22.8]],
  'dietary-fiber': [['cocoa-powder', 33.2], ['almond', 12.5], ['guava', 5.9], ['black-bean-cooked', 4.4], ['red-bean-cooked', 3.1]],
  'vitamin-a': [['chicken-liver-cooked', 10000], ['pork-liver-braised', 6100], ['carrot', 688], ['spinach-raw', 487], ['sweet-potato', 125]],
  'vitamin-b1': [['peanut', 0.72], ['sunflower-seed', 0.36], ['pork-lean-cooked', 0.3], ['beef-lean-stewed', 0.05]],
  'vitamin-b2': [['pork-liver-braised', 2.4], ['chicken-liver-cooked', 1.2], ['egg-boiled', 0.27], ['spinach-raw', 0.19], ['milk-whole', 0.14]],
  'vitamin-b3': [['pork-liver-braised', 18], ['peanut', 17.9], ['chicken-breast-cooked', 12], ['chicken-cooked', 6.7], ['beef-lean-stewed', 4.5]],
  'vitamin-b5': [['pork-liver-braised', 7.5], ['chicken-liver-cooked', 7], ['egg-boiled', 1.5], ['milk-whole', 0.35]],
  'vitamin-b6': [['chicken-breast-cooked', 0.7], ['chicken-cooked', 0.6], ['banana', 0.37], ['pork-liver-braised', 0.32], ['potato', 0.3]],
  'vitamin-b12': [['pork-liver-braised', 26], ['clam-cooked', 21], ['oyster-cooked', 18], ['chicken-liver-cooked', 17], ['salmon-cooked', 3.2]],
  'vitamin-c': [['fresh-jujube', 243], ['guava', 228], ['kale', 120], ['green-pepper', 72], ['kiwi', 62]],
  'vitamin-d': [['salmon-cooked', 13], ['pork-liver-braised', 8], ['egg-boiled', 5], ['milk-whole', 0.5]],
  'vitamin-e': [['soybean-oil', 93], ['sunflower-seed', 34.5], ['almond', 25.6], ['peanut', 18.1], ['olive-oil', 14.4]],
  'vitamin-k': [['natto', 729], ['kale', 705], ['spinach-raw', 483], ['youcai', 270], ['broccoli-blanched', 141]],
  calcium: [['sesame-paste', 1170], ['tofu-dry', 308], ['kelp', 168], ['tofu-firm', 138], ['milk-whole', 104]],
  magnesium: [['cocoa-powder', 499], ['brazil-nut', 376], ['sunflower-seed', 264], ['almond', 178]],
  iron: [['duck-blood', 30.5], ['pork-liver-braised', 30], ['chicken-liver-cooked', 14], ['clam-cooked', 12.5], ['oyster', 5.5]],
  zinc: [['oyster-cooked', 10.5], ['pork-liver-braised', 7.5], ['sunflower-seed', 6.0], ['beef-lean-stewed', 5.2], ['crab-cooked', 3.8]],
  iodine: [['kelp', 2950], ['hairtail-cooked', 46], ['shrimp', 40], ['crab', 30], ['egg-boiled', 22.5]],
  selenium: [['brazil-nut', 1917], ['oyster-cooked', 95], ['hairtail-cooked', 42], ['egg-boiled', 14], ['chicken-cooked', 14]],
  sodium: [['salt', 39000], ['wholewheat-bread', 460], ['hairtail-cooked', 170], ['seabass-cooked', 165], ['celery', 159]],
  potassium: [['cocoa-powder', 1524], ['black-bean-cooked', 599], ['guava', 417], ['potato', 342], ['spinach-raw', 311]],
  phosphorus: [['oats-dry', 734], ['pork-liver-braised', 350], ['chicken-breast-cooked', 260], ['pork-lean-cooked', 230], ['egg-boiled', 130]],
  copper: [['oyster-cooked', 5.6], ['cocoa-powder', 3.8], ['sesame-paste', 1.7], ['pork-liver-braised', 0.75]],
  anthocyanin: [['red-cabbage', 150], ['grape', 30], ['strawberry', 20], ['eggplant', 15]],
  lutein: [['spinach-raw', 12], ['kale', 11.4], ['corn', 1.5], ['broccoli-blanched', 1.4], ['egg-boiled', 0.3]],
  lycopene: [['tomato-paste', 15], ['guava', 5.2], ['watermelon', 4.5], ['grapefruit', 3.4], ['tomato', 2.5]],
  'beta-carotene': [['carrot', 8300], ['sweet-potato', 7500], ['kale', 4360], ['spinach-raw', 2920], ['pumpkin', 890]],
  astaxanthin: [['crab-cooked', 1.7], ['shrimp-cooked', 1.1], ['salmon-cooked', 0.8], ['hairtail-cooked', 0.25], ['grass-carp-cooked', 0.12]],
}

// 返回某营养素精选的前 5 位食物，并把含量覆盖为选定值。
export function getCuratedFoodSources(slug) {
  const list = NUTRIENT_TOP_FOODS[slug]
  if (!list) return null
  return list
    .map(([id, amount]) => {
      const food = demoFoods.find((item) => item.id === id)
      if (!food) return null
      return Object.assign({}, food, {
        nutrients: Object.assign({}, food.nutrients, { [slug]: amount }),
      })
    })
    .filter(Boolean)
    .sort((a, b) => (b.nutrients[slug] || 0) - (a.nutrients[slug] || 0))
    .slice(0, 5)
}

// 植物化合物、膳食纤维与部分矿物质的食物含量（每 100 克），
// 统一叠加到已有食物上，避免逐条改写食物定义。数值为结构演示示例。
const EXTRA_FOOD_NUTRIENTS = {
  'pork-liver-raw': { phosphorus: 310, copper: 0.65, 'vitamin-b2': 2.08, 'vitamin-b6': 0.29, potassium: 235 },
  'pork-liver-braised': { phosphorus: 350, copper: 0.75, 'vitamin-b2': 2.4, 'vitamin-b6': 0.32, potassium: 260 },
  'pork-lean-raw': { phosphorus: 189, copper: 0.06, 'vitamin-b2': 0.1, 'vitamin-b6': 0.35, potassium: 305 },
  'pork-lean-cooked': { phosphorus: 230, copper: 0.08, 'vitamin-b2': 0.12, 'vitamin-b6': 0.42, potassium: 360 },
  'beef-raw': { phosphorus: 168, copper: 0.07, 'vitamin-b2': 0.1, 'vitamin-b6': 0.38, potassium: 284 },
  'beef-lean-raw': { phosphorus: 172, copper: 0.07, 'vitamin-b2': 0.1, 'vitamin-b6': 0.4, potassium: 290 },
  'beef-lean-stewed': { phosphorus: 220, copper: 0.09, 'vitamin-b2': 0.13, 'vitamin-b6': 0.5, potassium: 350 },
  'chicken-raw': { phosphorus: 156, copper: 0.07, 'vitamin-b2': 0.09, 'vitamin-b6': 0.5, potassium: 251 },
  'chicken-cooked': { phosphorus: 190, copper: 0.08, 'vitamin-b2': 0.11, 'vitamin-b6': 0.6, potassium: 300 },
  'chicken-breast-raw': { phosphorus: 220, copper: 0.05, 'vitamin-b2': 0.06, 'vitamin-b6': 0.6, potassium: 338 },
  'chicken-breast-cooked': { phosphorus: 260, copper: 0.06, 'vitamin-b2': 0.07, 'vitamin-b6': 0.7, potassium: 400 },
  'egg-boiled': { phosphorus: 130, copper: 0.06, 'vitamin-b2': 0.27, 'vitamin-b6': 0.07, potassium: 128, lutein: 0.3 },
  'milk-whole': { phosphorus: 73, copper: 0.02, 'vitamin-b2': 0.14, 'vitamin-b6': 0.04, potassium: 109 },
  'salmon-cooked': { phosphorus: 240, copper: 0.06, 'vitamin-b2': 0.13, 'vitamin-b6': 0.6, potassium: 360 },
  'grass-carp-raw': { phosphorus: 203, copper: 0.05, 'vitamin-b2': 0.05, 'vitamin-b6': 0.2, potassium: 312 },
  'hairtail-raw': { phosphorus: 191, copper: 0.05, 'vitamin-b2': 0.06, 'vitamin-b6': 0.25, potassium: 280 },
  'seabass-raw': { phosphorus: 242, copper: 0.05, 'vitamin-b2': 0.17, 'vitamin-b6': 0.3, potassium: 205 },
  'spinach-raw': { anthocyanin: 20, lutein: 12, 'beta-carotene': 2920, 'dietary-fiber': 2.2, potassium: 311, phosphorus: 47, copper: 0.1, 'vitamin-b2': 0.19, 'vitamin-b6': 0.2 },
  'spinach-blanched': { anthocyanin: 12, lutein: 8, 'beta-carotene': 2500, 'dietary-fiber': 2.0, potassium: 280, phosphorus: 45, copper: 0.09, 'vitamin-b2': 0.16, 'vitamin-b6': 0.18 },
  'broccoli-blanched': { lutein: 1.4, 'beta-carotene': 1200, 'dietary-fiber': 2.6, potassium: 316, phosphorus: 66, copper: 0.05, 'vitamin-b2': 0.12, 'vitamin-b6': 0.2 },
  carrot: { 'beta-carotene': 8300, 'dietary-fiber': 2.8, potassium: 320, phosphorus: 35, copper: 0.05, 'vitamin-b2': 0.06, 'vitamin-b6': 0.14 },
  tomato: { lycopene: 2.5, 'dietary-fiber': 1.2, potassium: 237, phosphorus: 23, copper: 0.06, 'vitamin-b2': 0.03, 'vitamin-b6': 0.08 },
  cucumber: { 'dietary-fiber': 0.5, potassium: 147, phosphorus: 24 },
  eggplant: { anthocyanin: 15, 'dietary-fiber': 2.2, potassium: 229, phosphorus: 24 },
  celery: { 'dietary-fiber': 1.2, potassium: 206, phosphorus: 22 },
  'green-pepper': { 'beta-carotene': 340, 'dietary-fiber': 1.4, potassium: 175, phosphorus: 20 },
  onion: { anthocyanin: 10, 'dietary-fiber': 1.7, potassium: 146, phosphorus: 37 },
  'cabbage-chinese': { 'beta-carotene': 120, 'dietary-fiber': 1.2, potassium: 130, phosphorus: 31 },
  youcai: { 'beta-carotene': 620, 'dietary-fiber': 1.1, potassium: 210, phosphorus: 30 },
  shiitake: { 'dietary-fiber': 3.3, potassium: 20, phosphorus: 53, copper: 0.12 },
  apple: { anthocyanin: 8, 'dietary-fiber': 2.4, potassium: 119, phosphorus: 11 },
  banana: { anthocyanin: 5, 'dietary-fiber': 1.2, potassium: 256, phosphorus: 28, copper: 0.08, 'vitamin-b6': 0.37 },
  pear: { anthocyanin: 6, 'dietary-fiber': 3.1, potassium: 92, phosphorus: 14 },
  grape: { anthocyanin: 30, 'dietary-fiber': 0.4, potassium: 104, phosphorus: 20, copper: 0.04 },
  watermelon: { lycopene: 4.5, 'dietary-fiber': 0.3, potassium: 112, phosphorus: 11 },
  kiwi: { 'dietary-fiber': 1.6, potassium: 312, phosphorus: 34, copper: 0.13, 'vitamin-b6': 0.06 },
  strawberry: { anthocyanin: 20, 'dietary-fiber': 2.0, potassium: 153, phosphorus: 24 },
  'orange-fresh': { anthocyanin: 5, 'dietary-fiber': 1.8, potassium: 181, phosphorus: 14 },
  'rice-cooked': { 'dietary-fiber': 0.3, potassium: 30, phosphorus: 62, copper: 0.08, 'vitamin-b2': 0.02, 'vitamin-b6': 0.05 },
  mantou: { 'dietary-fiber': 1.3, potassium: 140, phosphorus: 100, copper: 0.15, 'vitamin-b2': 0.05, 'vitamin-b6': 0.1 },
  corn: { lutein: 1.5, 'dietary-fiber': 2.9, potassium: 270, phosphorus: 89 },
  'wholewheat-bread': { 'dietary-fiber': 6.0, potassium: 250, phosphorus: 200, copper: 0.3, 'vitamin-b2': 0.1, 'vitamin-b6': 0.2 },
  potato: { 'dietary-fiber': 1.2, potassium: 342, phosphorus: 57, copper: 0.12, 'vitamin-b2': 0.05, 'vitamin-b6': 0.3 },
  'potato-steamed': { 'dietary-fiber': 1.5, potassium: 380, phosphorus: 60, copper: 0.13, 'vitamin-b2': 0.04, 'vitamin-b6': 0.32 },
  'sweet-potato': { 'beta-carotene': 7500, 'dietary-fiber': 3.0, potassium: 337, phosphorus: 47, copper: 0.15, 'vitamin-b2': 0.05, 'vitamin-b6': 0.28 },
  yam: { 'dietary-fiber': 0.8, potassium: 213, phosphorus: 34, copper: 0.24 },
  'south-tofu': { 'dietary-fiber': 0.4, potassium: 120, phosphorus: 90, copper: 0.15 },
  'tofu-firm': { 'dietary-fiber': 0.5, potassium: 125, phosphorus: 119, copper: 0.2, 'vitamin-b2': 0.05 },
  'tofu-dry': { 'dietary-fiber': 1.8, potassium: 140, phosphorus: 270, copper: 0.4, 'vitamin-b2': 0.1 },
  'soy-milk': { 'dietary-fiber': 0.2, potassium: 48, phosphorus: 30, copper: 0.07 },
  'oats-dry': { 'dietary-fiber': 10.6, potassium: 429, phosphorus: 734, copper: 0.6, 'vitamin-b2': 0.15, 'vitamin-b6': 0.2 },
}

// 虾青素与 B 族（B3/B5）的食物含量，单独一张表以便维护。
const MORE_FOOD_NUTRIENTS = {
  'pork-liver-raw': { 'vitamin-b3': 15, 'vitamin-b5': 6.5 },
  'pork-liver-braised': { 'vitamin-b3': 18, 'vitamin-b5': 7.5 },
  'pork-lean-raw': { 'vitamin-b3': 4.2, 'vitamin-b5': 0.9 },
  'beef-raw': { 'vitamin-b3': 4.5, 'vitamin-b5': 0.7 },
  'beef-lean-raw': { 'vitamin-b3': 4.5, 'vitamin-b5': 0.7 },
  'chicken-raw': { 'vitamin-b3': 5.6, 'vitamin-b5': 1.0 },
  'chicken-cooked': { 'vitamin-b3': 6.7, 'vitamin-b5': 1.2 },
  'chicken-breast-raw': { 'vitamin-b3': 10, 'vitamin-b5': 1.2 },
  'chicken-breast-cooked': { 'vitamin-b3': 12, 'vitamin-b5': 1.4 },
  'egg-boiled': { 'vitamin-b3': 0.2, 'vitamin-b5': 1.5, astaxanthin: 0.1 },
  'milk-whole': { 'vitamin-b3': 0.1, 'vitamin-b5': 0.35 },
  'salmon-cooked': { 'vitamin-b3': 8.5, 'vitamin-b5': 1.6, astaxanthin: 0.8 },
  'grass-carp-raw': { 'vitamin-b3': 2.5, 'vitamin-b5': 0.4, astaxanthin: 0.1 },
  'hairtail-raw': { 'vitamin-b3': 2.8, 'vitamin-b5': 0.5, astaxanthin: 0.2 },
  'seabass-raw': { 'vitamin-b3': 3.0, 'vitamin-b5': 0.5 },
  'shiitake': { 'vitamin-b3': 3.5, 'vitamin-b5': 1.5 },
  'rice-cooked': { 'vitamin-b3': 0.5, 'vitamin-b5': 0.2 },
  'oats-dry': { 'vitamin-b3': 1.0, 'vitamin-b5': 1.0 },
}

// 维生素 B12、维生素 K、碘、镁、硒等微量元素的食物含量（每 100 克）。
const MICRO_FOOD_NUTRIENTS = {
  'pork-liver-raw': { 'vitamin-b12': 26, 'vitamin-k': 25, magnesium: 24 },
  'pork-liver-braised': { 'vitamin-b12': 26, 'vitamin-k': 22, magnesium: 26 },
  'beef-raw': { 'vitamin-b12': 1.8, magnesium: 20, selenium: 8 },
  'beef-lean-raw': { 'vitamin-b12': 1.8, magnesium: 20, selenium: 8 },
  'beef-lean-stewed': { 'vitamin-b12': 2.4, magnesium: 24, selenium: 10 },
  'chicken-raw': { 'vitamin-b12': 0.3, magnesium: 22, selenium: 12 },
  'chicken-cooked': { 'vitamin-b12': 0.4, magnesium: 26, selenium: 14 },
  'chicken-breast-raw': { 'vitamin-b12': 0.2, magnesium: 28, selenium: 16 },
  'chicken-breast-cooked': { 'vitamin-b12': 0.3, magnesium: 32, selenium: 18 },
  'egg-boiled': { 'vitamin-b12': 1.1, 'vitamin-k': 12, iodine: 22.5, magnesium: 10, selenium: 14 },
  'milk-whole': { 'vitamin-b12': 0.4, iodine: 1.9, magnesium: 11, selenium: 3 },
  'salmon-cooked': { 'vitamin-b12': 3.2, magnesium: 30, selenium: 25 },
  'grass-carp-raw': { 'vitamin-b12': 1.0, iodine: 6.4, magnesium: 31, selenium: 6 },
  'hairtail-raw': { 'vitamin-b12': 1.0, iodine: 40.8, magnesium: 28, selenium: 36 },
  'seabass-raw': { 'vitamin-b12': 1.5, iodine: 7.9, magnesium: 37, selenium: 20 },
  'spinach-raw': { 'vitamin-k': 483, magnesium: 58 },
  'spinach-blanched': { 'vitamin-k': 460, magnesium: 55 },
  'broccoli-blanched': { 'vitamin-k': 141, magnesium: 21 },
  youcai: { 'vitamin-k': 270, magnesium: 22 },
  'cabbage-chinese': { 'vitamin-k': 42, magnesium: 11 },
  celery: { 'vitamin-k': 29, magnesium: 11 },
  cucumber: { 'vitamin-k': 16, magnesium: 15 },
  'green-pepper': { 'vitamin-k': 14, magnesium: 12 },
  'tofu-firm': { magnesium: 63 },
  'oats-dry': { magnesium: 177 },
  potato: { magnesium: 23 },
  salt: { iodine: 2000 },
}

// 总糖（Total Sugars，含天然糖，每 100 克可食部）。
// 数据来源：USDA FoodData Central + 中国食物成分表（标准版第 6 版）。
// 肉类、水产、蛋类、油脂与食盐实测不含糖，列为 0；其余按实测值列出。
const SUGAR_FOOD_NUTRIENTS = {
  // —— 水果 ——
  apple: { sugar: 10.4 }, banana: { sugar: 12.2 }, pear: { sugar: 9.8 },
  grape: { sugar: 16.2 }, watermelon: { sugar: 6.2 }, kiwi: { sugar: 9.0 },
  strawberry: { sugar: 4.9 }, 'orange-fresh': { sugar: 9.2 }, 'fresh-jujube': { sugar: 28.6 },
  guava: { sugar: 8.9 }, grapefruit: { sugar: 6.9 },

  // —— 蔬菜 ——
  'spinach-raw': { sugar: 0.4 }, 'spinach-blanched': { sugar: 0.4 },
  'broccoli-blanched': { sugar: 1.7 }, 'cabbage-chinese': { sugar: 1.2 },
  youcai: { sugar: 1.4 }, kale: { sugar: 1.3 }, celery: { sugar: 1.3 },
  cucumber: { sugar: 1.7 }, eggplant: { sugar: 3.5 }, 'green-pepper': { sugar: 4.1 },
  onion: { sugar: 4.2 }, 'red-cabbage': { sugar: 3.8 }, pumpkin: { sugar: 2.8 },
  carrot: { sugar: 4.7 }, tomato: { sugar: 2.6 }, shiitake: { sugar: 2.0 },
  kelp: { sugar: 0.3 },

  // —— 谷薯类 ——
  'rice-cooked': { sugar: 0.1 }, mantou: { sugar: 1.0 },
  corn: { sugar: 6.3 }, 'millet-porridge': { sugar: 0.7 },
  'wholewheat-bread': { sugar: 4.5 }, 'oats-dry': { sugar: 0.99 },
  'sweet-potato': { sugar: 4.2 }, potato: { sugar: 1.8 }, 'potato-steamed': { sugar: 1.7 },
  yam: { sugar: 0.5 }, 'noodle-cooked': { sugar: 0.5 },

  // —— 豆类与豆制品 ——
  'red-bean-cooked': { sugar: 0.3 }, 'mung-bean-cooked': { sugar: 0.4 }, 'black-bean-cooked': { sugar: 0.4 },
  'soybean-cooked': { sugar: 1.3 }, 'soy-milk': { sugar: 1.0 }, 'soy-milk-sweet': { sugar: 4.5 },
  'tofu-firm': { sugar: 1.5 }, 'south-tofu': { sugar: 2.0 }, 'tofu-dry': { sugar: 3.0 },
  natto: { sugar: 1.7 },

  // —— 坚果与种子 ——
  peanut: { sugar: 4.7 }, almond: { sugar: 4.4 }, 'brazil-nut': { sugar: 4.0 },
  'sesame-paste': { sugar: 5.9 }, 'sunflower-seed': { sugar: 2.6 },

  // —— 乳制品 ——
  'milk-whole': { sugar: 4.8 },

  // —— 动物性食物（实测不含糖）——
  'pork-liver-braised': { sugar: 0 }, 'chicken-liver-cooked': { sugar: 0 },
  'pork-lean-cooked': { sugar: 0 }, 'beef-lean-stewed': { sugar: 0 },
  'chicken-cooked': { sugar: 0 }, 'chicken-breast-cooked': { sugar: 0 },
  'duck-blood': { sugar: 0 }, 'egg-boiled': { sugar: 0.4 },
  'chicken-leg-braised': { sugar: 1.5 }, 'duck-leg-braised': { sugar: 1.2 },
  'salmon-cooked': { sugar: 0 }, 'grass-carp-cooked': { sugar: 0 },
  'hairtail-cooked': { sugar: 0 }, 'seabass-cooked': { sugar: 0 },
  'oyster-cooked': { sugar: 0 }, 'shrimp-cooked': { sugar: 0 },
  'clam-cooked': { sugar: 0 }, 'crab-cooked': { sugar: 0 },

  // —— 油脂与调味品 ——
  'soybean-oil': { sugar: 0 }, 'olive-oil': { sugar: 0 }, 'peanut-oil': { sugar: 0 },
  butter: { sugar: 0 }, salt: { sugar: 0 },
  'cocoa-powder': { sugar: 1.0 }, 'tomato-paste': { sugar: 12.0 },
}

demoFoods.forEach((food) => {
  const extra = EXTRA_FOOD_NUTRIENTS[food.id]
  if (extra) Object.assign(food.nutrients, extra)
  const more = MORE_FOOD_NUTRIENTS[food.id]
  if (more) Object.assign(food.nutrients, more)
  const micro = MICRO_FOOD_NUTRIENTS[food.id]
  if (micro) Object.assign(food.nutrients, micro)
  const sugar = SUGAR_FOOD_NUTRIENTS[food.id]
  if (sugar) Object.assign(food.nutrients, sugar)
})

// 只保留熟制肉类与水产：移除生肉、生鲜水产记录。
const RAW_ANIMAL_IDS = [
  'pork-liver-raw', 'pork-lean-raw', 'beef-raw', 'beef-lean-raw', 'chicken-raw', 'chicken-breast-raw', 'chicken-liver',
  'grass-carp-raw', 'hairtail-raw', 'seabass-raw', 'clam', 'oyster', 'shrimp', 'crab',
]
for (let i = demoFoods.length - 1; i >= 0; i -= 1) {
  if (RAW_ANIMAL_IDS.includes(demoFoods[i].id)) demoFoods.splice(i, 1)
}

export const FOOD_SOURCE = {
  name: '中国食物成分表（标准版第 6 版）/ USDA FoodData Central',
  url: 'https://nlc.chinanutri.cn/',
  note: '数值为每 100 克可食部；品种、产地、烹调方式会造成差异。',
}

export function getFoodById(id) {
  return demoFoods.find((item) => item.id === id) || null
}

export function getFoodsByNutrient(nutrientSlug) {
  return demoFoods.filter((food) => typeof food.nutrients[nutrientSlug] === 'number')
}

// 食物能量按蛋白质×4、脂肪×9、碳水化合物×4（Atwater 系数）折算，单位 kcal / 100 克。
export function foodEnergyPer100g(food) {
  if (!food || !food.nutrients) return 0
  const protein = Number(food.nutrients.protein) || 0
  const fat = Number(food.nutrients.fat) || 0
  const carbohydrate = Number(food.nutrients.carbohydrate) || 0
  return Math.round(protein * 4 + fat * 9 + carbohydrate * 4)
}

// 食物对比与计算器使用的营养素列表（能量单独折算）。
export const FOOD_COMPARE_SLUGS = [
  'protein', 'fat', 'carbohydrate', 'sodium',
  'calcium', 'iron', 'zinc', 'vitamin-c', 'vitamin-a',
]

// 统一的营养素名称与单位（食物按每 100 克计，单位去掉每日维度）。
export function nutrientMeta(slug) {
  if (slug === 'energy') return { name: '能量', unit: 'kcal' }
  const nutrient = demoNutrients.find((item) => item.slug === slug)
  return nutrient
    ? { name: nutrient.name, unit: baseUnitOf(nutrient) }
    : { name: slug, unit: '' }
}

// ---------------------------------------------------------------------------
// 吸收与膳食因素：与「食物含量」「每日摄入量」分开呈现。
// 只有条件明确时才给出具体数值，并同时标注适用条件与出处。
// ---------------------------------------------------------------------------
const NIH_IRON = 'https://ods.od.nih.gov/factsheets/Iron-HealthProfessional/'
const NIH_CALCIUM = 'https://ods.od.nih.gov/factsheets/Calcium-HealthProfessional/'
const NIH_ZINC = 'https://ods.od.nih.gov/factsheets/Zinc-HealthProfessional/'
const NIH_VITC = 'https://ods.od.nih.gov/factsheets/VitaminC-HealthProfessional/'
const NIH_VITA = 'https://ods.od.nih.gov/factsheets/VitaminA-HealthProfessional/'
const NIH_VITD = 'https://ods.od.nih.gov/factsheets/VitaminD-HealthProfessional/'

export const absorptionEvidence = {
  iron: [
    {
      direction: 'dependsOnContext',
      title: '血红素铁与非血红素铁的吸收途径不同',
      summary: '肉类、内脏中的血红素铁吸收率通常高于植物性食物中的非血红素铁，且较少受同餐抑制因素影响。因此「铁含量相同」不等于「可吸收的铁相同」。',
      applicability: '一般膳食人群；具体比例随膳食结构、个体铁营养状况变化',
      pairings: [
        '血红素铁：动物血、肝脏、红肉、鱼类',
        '非血红素铁：菠菜等深色蔬菜、豆类、全谷物',
        '同餐搭配维生素 C，可提高非血红素铁的吸收',
      ],
      sourceName: 'NIH Office of Dietary Supplements · Iron Fact Sheet',
      sourceUrl: NIH_IRON,
      figure: null,
    },
    {
      direction: 'enhances',
      title: '维生素 C 可促进非血红素铁吸收',
      summary: '同餐摄入维生素 C 能在一定范围内提高非血红素铁的吸收，是植物性膳食中较明确的促进因素。',
      applicability: '以植物性食物为主的一餐，且同餐含维生素 C',
      pairings: [
        '同餐吃彩椒、西兰花、猕猴桃、鲜枣、橙子等富含维生素 C 的食物',
        '维生素 C 怕热，蔬菜急火快炒、水果尽量生食',
      ],
      sourceName: 'NIH · Iron Fact Sheet',
      sourceUrl: NIH_IRON,
      figure: { display: '约 2–3 倍', label: '相对吸收倍数', condition: '同餐含约 25–75 mg 维生素 C 的研究条件下' },
    },
    {
      direction: 'inhibits',
      title: '植酸与多酚会降低铁吸收',
      summary: '全谷物、豆类中的植酸，以及茶、咖啡中的多酚，会与铁结合而降低非血红素铁的吸收。',
      applicability: '与富含植酸或多酚的食物同餐时',
      pairings: [
        '浓茶、咖啡与含铁餐间隔 1–2 小时',
        '全谷物、豆类提前浸泡或发酵，可减少部分植酸',
      ],
      sourceName: 'NIH · Iron Fact Sheet',
      sourceUrl: NIH_IRON,
      figure: null,
    },
    {
      direction: 'dependsOnContext',
      title: '钙与铁同餐可能相互影响',
      summary: '较大剂量的钙补充剂与铁同服时可能降低铁吸收，但常规膳食中的钙影响通常较小。是否成立取决于剂量与形式。',
      applicability: '补充剂同服场景；普通膳食证据不一致',
      pairings: [
        '钙补充剂与铁剂错开时间服用',
        '普通膳食中奶类与含铁食物的影响通常有限',
      ],
      sourceName: 'NIH · Iron Fact Sheet',
      sourceUrl: NIH_IRON,
      figure: null,
    },
  ],
  calcium: [
    {
      direction: 'enhances',
      title: '维生素 D 参与钙的吸收与利用',
      summary: '维生素 D 通过调节钙磷代谢影响钙的吸收。膳食钙的利用还受年龄、生理阶段与总摄入量影响。',
      applicability: '维生素 D 状态不足的人群需特别关注',
      pairings: [
        '适当日照，帮助皮肤合成维生素 D',
        '搭配富脂鱼类、蛋黄、动物肝脏等维生素 D 来源',
        '奶及奶制品是膳食钙的主要来源',
      ],
      sourceName: 'NIH · Calcium Fact Sheet',
      sourceUrl: NIH_CALCIUM,
      figure: null,
    },
    {
      direction: 'dependsOnContext',
      title: '单次摄入量与吸收比例并非线性',
      summary: '随着单次钙摄入量增加，吸收比例通常下降。因此把一天的量分散到多餐，往往比一次大量摄入更有利。',
      applicability: '评估单餐或补充剂剂量时',
      pairings: [
        '奶制品分次摄入，如早晚各一杯奶',
        '避免一次大剂量补钙，分次更利于吸收',
      ],
      sourceName: 'NIH · Calcium Fact Sheet',
      sourceUrl: NIH_CALCIUM,
      figure: null,
    },
  ],
  zinc: [
    {
      direction: 'inhibits',
      title: '植酸会降低锌的吸收',
      summary: '全谷物和豆类中的植酸可与锌结合，降低其吸收。发酵、浸泡等处理可减少部分植酸。',
      applicability: '以未精制谷物、豆类为主食时',
      pairings: [
        '全谷物、豆类提前浸泡、发酵，减少植酸',
        '搭配肉类、贝类等动物性食物，提高锌的吸收',
      ],
      sourceName: 'NIH · Zinc Fact Sheet',
      sourceUrl: NIH_ZINC,
      figure: null,
    },
  ],
  'vitamin-c': [
    {
      direction: 'dependsOnContext',
      title: '维生素 C 的吸收存在剂量与个体差异',
      summary: '在常规摄入范围内吸收比例较高，随单次剂量增大而下降。吸烟、感染等状态可能提高需要量。',
      applicability: '评估补充剂剂量与吸烟人群时',
      pairings: [
        '分次摄入比一次大剂量吸收比例更高',
        '吸烟、感染状态下需要量可能增加',
      ],
      sourceName: 'NIH · Vitamin C Fact Sheet',
      sourceUrl: NIH_VITC,
      figure: null,
    },
  ],
  'vitamin-a': [
    {
      direction: 'dependsOnContext',
      title: '维生素 A 的吸收与脂肪和形式有关',
      summary: '视黄醇类与类胡萝卜素类的吸收和转化效率不同；膳食脂肪有助于脂溶性维生素的吸收。',
      applicability: '低脂膳食或主要依赖植物性来源时',
      pairings: [
        '动物肝脏、蛋黄、奶类提供视黄醇',
        '深色蔬菜中的 β-胡萝卜素用油烹调更利于吸收',
      ],
      sourceName: 'NIH · Vitamin A Fact Sheet',
      sourceUrl: NIH_VITA,
      figure: null,
    },
  ],
  'vitamin-d': [
    {
      direction: 'dependsOnContext',
      title: '维生素 D 的来源不止膳食',
      summary: '除食物外，皮肤经日照合成维生素 D 是重要来源。膳食参考值通常是在假设日照有限的前提下制定。',
      applicability: '日照不足、户外活动少的人群',
      pairings: [
        '适当日照是维生素 D 的重要来源',
        '富脂鱼类、蛋黄、强化食品可补充膳食来源',
      ],
      sourceName: 'NIH · Vitamin D Fact Sheet',
      sourceUrl: NIH_VITD,
      figure: null,
    },
  ],
  'vitamin-b12': [
    {
      direction: 'dependsOnContext',
      title: '吸收依赖胃内因子，来源以动物性食物为主',
      summary: '维生素 B12 需要与胃分泌的内因子结合才能被吸收；胃切除、萎缩性胃炎或长期服用抑酸药的人群，吸收可能下降。它几乎只存在于动物性食物中。',
      applicability: '老年人、胃部手术或长期抑酸治疗人群',
      pairings: [
        '动物肝脏、肉类、蛋类、奶类、鱼类',
        '严格素食者需关注强化食品或补充剂',
        '吸收不良人群应咨询专业人员',
      ],
      sourceName: 'NIH · Vitamin B12 Fact Sheet',
      sourceUrl: 'https://ods.od.nih.gov/factsheets/VitaminB12-HealthProfessional/',
      figure: null,
    },
  ],
  'vitamin-e': [
    {
      direction: 'dependsOnContext',
      title: '脂溶性，随膳食脂肪一起吸收',
      summary: '维生素 E 属脂溶性维生素，膳食脂肪有助于其吸收；植物油、坚果、种子和全谷物是主要来源。',
      applicability: '低脂膳食或脂肪吸收不良人群',
      pairings: [
        '植物油、坚果、种子、全谷物',
        '与含脂食物同餐更利于吸收',
      ],
      sourceName: 'NIH · Vitamin E Fact Sheet',
      sourceUrl: 'https://ods.od.nih.gov/factsheets/VitaminE-HealthProfessional/',
      figure: null,
    },
  ],
  'vitamin-k': [
    {
      direction: 'dependsOnContext',
      title: '与抗凝药物需要保持稳定',
      summary: '维生素 K 参与凝血。正在服用华法林等抗凝药的人，应保持维生素 K 摄入相对稳定，避免短期内大幅波动。',
      applicability: '服用华法林等抗凝药物的人群',
      pairings: [
        '深绿色蔬菜（菠菜、西兰花、油菜）摄入保持稳定',
        '纳豆、部分发酵食品含较多维生素 K',
        '调整饮食或补充前咨询医生',
      ],
      sourceName: 'NIH · Vitamin K Fact Sheet',
      sourceUrl: 'https://ods.od.nih.gov/factsheets/VitaminK-HealthProfessional/',
      figure: null,
    },
  ],
  iodine: [
    {
      direction: 'dependsOnContext',
      title: '碘盐是主要来源，孕期需求增加',
      summary: '碘是合成甲状腺激素的原料，加碘食盐是我国居民碘的主要来源；海带、紫菜、海鱼等海产品也富含碘。孕期和哺乳期需求增加。',
      applicability: '碘缺乏地区、孕期与哺乳期女性',
      pairings: [
        '使用加碘食盐',
        '海带、紫菜、海鱼等海产品',
        '孕期、哺乳期注意保证摄入',
      ],
      sourceName: 'NIH · Iodine Fact Sheet',
      sourceUrl: 'https://ods.od.nih.gov/factsheets/Iodine-HealthProfessional/',
      figure: null,
    },
  ],
  magnesium: [
    {
      direction: 'dependsOnContext',
      title: '植酸与补充剂剂量影响吸收',
      summary: '全谷物、豆类中的植酸可能降低镁的吸收；大剂量补充剂可能引起腹泻，分次随餐服用更利于耐受。',
      applicability: '以精制谷物为主或使用补充剂时',
      pairings: [
        '全谷物、坚果、豆类、深绿色蔬菜',
        '补充剂分次随餐服用',
      ],
      sourceName: 'NIH · Magnesium Fact Sheet',
      sourceUrl: 'https://ods.od.nih.gov/factsheets/Magnesium-HealthProfessional/',
      figure: null,
    },
  ],
}

export function getAbsorptionEvidence(slug) {
  return absorptionEvidence[slug] || []
}

// ---------------------------------------------------------------------------
// 食物与食物的搭配：以「两种食物同吃」为单位，说明促进/影响/互补关系。
// 来源均为可访问的公开资料（NIH ODS、哈佛公共卫生学院营养源）。
// ---------------------------------------------------------------------------
const HARVARD_PROTEIN = 'https://www.hsph.harvard.edu/nutritionsource/what-should-you-eat/protein/'

export const PAIRING_RELATIONS = {
  enhances: { label: '促进吸收', tone: 'pair-enhances' },
  inhibits: { label: '影响吸收', tone: 'pair-inhibits' },
  complement: { label: '蛋白互补', tone: 'pair-complement' },
  depends: { label: '视条件而定', tone: 'pair-depends' },
}

export const foodPairings = [
  {
    id: 'liver-pepper',
    a: { name: '猪肝', emoji: '🥩' },
    b: { name: '彩椒', emoji: '🫑' },
    relation: 'enhances',
    title: '维生素 C 帮铁多吸收一点',
    summary: '彩椒富含维生素 C，同餐可提高猪肝中非血红素铁的吸收；猪肝本身还提供吸收率较高的血红素铁。',
    suggestion: '炒猪肝时搭配彩椒、西兰花等富含维生素 C 的蔬菜，比单独吃更利于铁的利用。',
    sourceName: 'NIH Office of Dietary Supplements · Iron Fact Sheet',
    sourceUrl: NIH_IRON,
  },
  {
    id: 'spinach-orange',
    a: { name: '菠菜', emoji: '🥬' },
    b: { name: '橙子', emoji: '🍊' },
    relation: 'enhances',
    title: '植物铁配维生素 C',
    summary: '菠菜中的铁属非血红素铁，易受植酸、草酸影响；同餐吃橙子等富含维生素 C 的水果，可提高这部分铁的吸收。',
    suggestion: '菠菜焯水后凉拌，饭后吃一个橙子或猕猴桃。',
    sourceName: 'NIH · Iron Fact Sheet',
    sourceUrl: NIH_IRON,
  },
  {
    id: 'tea-liver',
    a: { name: '浓茶 / 咖啡', emoji: '☕' },
    b: { name: '红肉 / 猪肝', emoji: '🥩' },
    relation: 'inhibits',
    title: '多酚会“拦住”铁',
    summary: '茶和咖啡中的多酚会与铁结合，降低非血红素铁的吸收；与含铁餐同饮时影响更明显。',
    suggestion: '浓茶、咖啡与正餐间隔 1–2 小时再喝。',
    sourceName: 'NIH · Iron Fact Sheet',
    sourceUrl: NIH_IRON,
  },
  {
    id: 'grain-beef',
    a: { name: '全谷物 / 豆类', emoji: '🌾' },
    b: { name: '牛肉', emoji: '🥩' },
    relation: 'depends',
    title: '植酸影响锌铁，动物蛋白来帮忙',
    summary: '全谷物、豆类中的植酸会降低锌、铁的吸收；同餐搭配牛肉等动物性食物，可改善锌的利用。',
    suggestion: '豆类提前浸泡、发酵，并与肉类同餐。',
    sourceName: 'NIH · Zinc Fact Sheet',
    sourceUrl: NIH_ZINC,
  },
  {
    id: 'milk-liver',
    a: { name: '牛奶', emoji: '🥛' },
    b: { name: '猪肝', emoji: '🥩' },
    relation: 'depends',
    title: '钙与铁同餐，影响通常有限',
    summary: '较大剂量的钙补充剂可能降低铁吸收，但普通膳食中奶类与含铁食物同餐的影响通常较小。',
    suggestion: '服用铁剂时与奶制品错开时间；日常饮食不必刻意分开。',
    sourceName: 'NIH · Iron Fact Sheet',
    sourceUrl: NIH_IRON,
  },
  {
    id: 'rice-tofu',
    a: { name: '米饭', emoji: '🍚' },
    b: { name: '豆腐 / 红豆', emoji: '🍲' },
    relation: 'complement',
    title: '谷物 + 豆类，蛋白质互补',
    summary: '谷物赖氨酸较少、蛋氨酸较多，豆类正好相反；两者同餐可提高蛋白质的整体利用。',
    suggestion: '米饭配豆腐、红豆饭、杂豆粥，都是常见的互补搭配。',
    sourceName: 'Harvard T.H. Chan School of Public Health · The Nutrition Source: Protein',
    sourceUrl: HARVARD_PROTEIN,
  },
  {
    id: 'carrot-oil',
    a: { name: '胡萝卜', emoji: '🥕' },
    b: { name: '食用油', emoji: '🫒' },
    relation: 'enhances',
    title: '脂溶性维生素 A 前体，配油更好吸收',
    summary: '胡萝卜中的 β-胡萝卜素是脂溶性维生素 A 前体，膳食脂肪有助于它的吸收。',
    suggestion: '胡萝卜用少量油炒，或与含脂食物同餐。',
    sourceName: 'NIH · Vitamin A Fact Sheet',
    sourceUrl: NIH_VITA,
  },
  {
    id: 'spinach-tofu',
    a: { name: '菠菜', emoji: '🥬' },
    b: { name: '豆腐', emoji: '🍲' },
    relation: 'inhibits',
    title: '草酸会和钙“抢位置”',
    summary: '菠菜含较多草酸，可与豆腐中的钙结合，降低钙的吸收；但这不代表不能同吃。',
    suggestion: '菠菜先焯水去掉部分草酸，再与豆腐同烹，既保留搭配也减少影响。',
    sourceName: 'NIH · Calcium Fact Sheet',
    sourceUrl: NIH_CALCIUM,
  },
  {
    id: 'salmon-milk',
    a: { name: '三文鱼', emoji: '🐟' },
    b: { name: '牛奶', emoji: '🥛' },
    relation: 'enhances',
    title: '维生素 D 帮钙“搬进骨头”',
    summary: '三文鱼提供维生素 D，牛奶提供钙；维生素 D 参与钙的吸收与利用，两者同餐更有利于骨骼健康。',
    suggestion: '早餐牛奶配一份富脂鱼类，或日常注意日照。',
    sourceName: 'NIH · Vitamin D Fact Sheet',
    sourceUrl: NIH_VITD,
  },
  {
    id: 'corn-redbean',
    a: { name: '玉米', emoji: '🌽' },
    b: { name: '红豆', emoji: '🫘' },
    relation: 'complement',
    title: '谷物 + 豆类，氨基酸互补',
    summary: '玉米赖氨酸偏少、蛋氨酸较多，红豆正好相反；同餐搭配可提高蛋白质的整体利用。',
    suggestion: '玉米红豆粥、杂粮饭都是常见做法。',
    sourceName: 'Harvard T.H. Chan School of Public Health · The Nutrition Source: Protein',
    sourceUrl: HARVARD_PROTEIN,
  },
  {
    id: 'grain-milk',
    a: { name: '全谷物', emoji: '🌾' },
    b: { name: '牛奶', emoji: '🥛' },
    relation: 'depends',
    title: '植酸与纤维会影响矿物质吸收',
    summary: '全谷物中的植酸和膳食纤维可能降低钙、锌等矿物质的吸收，但发酵、浸泡可减少部分植酸。',
    suggestion: '全谷物提前浸泡或发酵，与奶类分开时段吃也无妨。',
    sourceName: 'NIH · Zinc Fact Sheet',
    sourceUrl: NIH_ZINC,
  },
]

export function getFoodPairings() {
  return foodPairings
}

// 兼容旧引用：蛋白质示例参考值
export const demoProteinReferences = getReferencesByNutrient('protein')
