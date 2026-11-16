// 数值均为 FDA 原表每份可食部绝对量，不是每 100 g；换算须乘以食用克重 / servingGrams。
// 单位：energy=kcal，protein/fiber=g，potassium/sodium=mg。0 保留原表舍入值，不代表分析学绝对零。
// null 表示未提供可量化数据，不得按 0 汇总。原表 Ca/VitC 仅有 %DV，因此不导入。
const fruitSource = 'https://www.fda.gov/food/labeling-nutrition/raw-fruits-poster-text-version-accessible-version'
const vegetableSource = 'https://www.fda.gov/food/labeling-nutrition/raw-vegetables-poster-text-accessible-version'
const fishSource = 'https://www.fda.gov/food/labeling-nutrition/cooked-seafood-poster-text-version-accessible-version'
const verified = '2026-11-16'

export const verifiedFoods = [
  {
    id: 'fda-banana', name: '香蕉', original: 'Banana — 1 medium (126 g/4.5 oz)',
    servingGrams: 126, state: '生可食部', category: 'fruit',
    nutrients: { energy: 110, protein: 1, fiber: 3, potassium: 450, sodium: 0 },
    source: fruitSource, verified,
  },
  {
    id: 'fda-orange', name: '橙子', original: 'Orange — 1 medium (154 g/5.5 oz)',
    servingGrams: 154, state: '生可食部', category: 'fruit',
    nutrients: { energy: 80, protein: 1, fiber: 3, potassium: 250, sodium: 0 },
    source: fruitSource, verified,
  },
  {
    id: 'fda-apple', name: '苹果', original: 'Apple — 1 large (242 g/8 oz)',
    servingGrams: 242, state: '生可食部', category: 'fruit',
    nutrients: { energy: 130, protein: 1, fiber: 5, potassium: 260, sodium: 0 },
    source: fruitSource, verified,
  },
  {
    id: 'fda-strawberries', name: '草莓', original: 'Strawberries — 8 medium (147 g/5.3 oz)',
    servingGrams: 147, state: '生可食部', category: 'fruit',
    nutrients: { energy: 50, protein: 1, fiber: 2, potassium: 170, sodium: 0 },
    source: fruitSource, verified,
  },
  {
    id: 'fda-grapes', name: '葡萄', original: 'Grapes — 3/4 cup (126 g/4.5 oz)',
    servingGrams: 126, state: '生可食部', category: 'fruit',
    nutrients: { energy: 90, protein: 0, fiber: 1, potassium: 240, sodium: 15 },
    source: fruitSource, verified,
  },
  {
    id: 'fda-watermelon', name: '西瓜', original: 'Watermelon — 1/18 medium melon; 2 cups diced pieces (280 g/10.0 oz)',
    servingGrams: 280, state: '生可食部', category: 'fruit',
    nutrients: { energy: 80, protein: 1, fiber: 1, potassium: 270, sodium: 0 },
    source: fruitSource, verified,
  },
  {
    id: 'fda-carrot', name: '胡萝卜', original: 'Carrot — 1 carrot, 7" long, 1 1/4" diameter (78 g/2.8 oz)',
    servingGrams: 78, state: '生可食部', category: 'vegetable',
    nutrients: { energy: 30, protein: 1, fiber: 2, potassium: 250, sodium: 60 },
    source: vegetableSource, verified,
  },
  {
    id: 'fda-tomato', name: '番茄', original: 'Tomato — 1 medium (148 g/5.3 oz)',
    servingGrams: 148, state: '生可食部', category: 'vegetable',
    nutrients: { energy: 25, protein: 1, fiber: 1, potassium: 340, sodium: 20 },
    source: vegetableSource, verified,
  },
  {
    id: 'fda-cucumber', name: '黄瓜', original: 'Cucumber — 1/3 medium (99 g/3.5 oz)',
    servingGrams: 99, state: '生可食部', category: 'vegetable',
    nutrients: { energy: 10, protein: 1, fiber: 1, potassium: 140, sodium: 0 },
    source: vegetableSource, verified,
  },
  {
    id: 'fda-bell-pepper', name: '甜椒', original: 'Bell Pepper — 1 medium (148 g/5.3 oz)',
    servingGrams: 148, state: '生可食部', category: 'vegetable',
    nutrients: { energy: 25, protein: 1, fiber: 2, potassium: 220, sodium: 40 },
    source: vegetableSource, verified,
  },
  // 海鲜原表仅称纤维可忽略，未给逐项绝对值，故保留 null 而不是推断为 0。
  // 熟制方式为湿热或干热且不添加任何配料；不适用于加盐、裹粉或油炸成品。
  {
    id: 'fda-cod', name: '鳕鱼（熟制无添加）', original: 'Cod — 84 g/3 oz; cooked by moist or dry heat with no added ingredients',
    servingGrams: 84, state: '熟/即食可食部', category: 'fish',
    nutrients: { energy: 90, protein: 20, fiber: null, potassium: 460, sodium: 65 },
    source: fishSource, verified,
  },
  {
    id: 'fda-salmon', name: '三文鱼（大西洋鲑/银鲑/红鲑/帝王鲑，熟制无添加）',
    original: 'Salmon, Atlantic/Coho/Sockeye/Chinook — 84 g/3 oz; cooked by moist or dry heat with no added ingredients',
    servingGrams: 84, state: '熟/即食可食部', category: 'fish',
    nutrients: { energy: 200, protein: 24, fiber: null, potassium: 430, sodium: 55 },
    source: fishSource, verified,
  },
  {
    id: 'fda-tilapia', name: '罗非鱼（熟制无添加）', original: 'Tilapia — 84 g/3 oz; cooked by moist or dry heat with no added ingredients',
    servingGrams: 84, state: '熟/即食可食部', category: 'fish',
    nutrients: { energy: 110, protein: 22, fiber: null, potassium: 360, sodium: 30 },
    source: fishSource, verified,
  },
  {
    id: 'fda-tuna', name: '金枪鱼（熟制无添加）', original: 'Tuna — 84 g/3 oz; cooked by moist or dry heat with no added ingredients',
    servingGrams: 84, state: '熟/即食可食部', category: 'fish',
    nutrients: { energy: 130, protein: 26, fiber: null, potassium: 480, sodium: 40 },
    source: fishSource, verified,
  },
]

// 欧洲 EFSA 健康成人群体参考，不是中国 DRIs、食品标签 DV 或个人诊断标准。
// 每日参考应与全天饮食比较，不能用某一种食物是否达到参考值判断营养是否充足。
export const references = {
  protein: {
    value: 0.83,
    unit: 'g/kg/day',
    type: 'PRI',
    region: '欧洲（EFSA）',
    population: '健康成年人，非孕期、非哺乳期',
    requiresBodyWeight: true,
    note: '每日克数需乘以体重（kg）；群体参考摄入量不是最低阈值或上限，不适用于临床特殊饮食需求。',
    sources: ['https://www.efsa.europa.eu/en/press/news/120209', 'https://efsa.onlinelibrary.wiley.com/doi/10.2903/j.efsa.2012.2557'],
    verified,
  },
  fiber: {
    value: 25,
    unit: 'g/day',
    type: 'AI',
    region: '欧洲（EFSA）',
    population: '健康成年人（18岁及以上），非孕期、非哺乳期',
    requiresBodyWeight: false,
    note: '以维持成人正常排便为依据的适宜摄入量，不是上限；低于该值不能直接诊断缺乏。',
    sources: [
      'https://www.efsa.europa.eu/hu/press/news/nda100326',
      'https://www.efsa.europa.eu/sites/default/files/assets/DRV_Summary_tables_jan_17.pdf',
    ],
    verified,
  },
}
