// D1 查询层：把 EF Core 的查询与 DTO 映射照搬到 SQL，保持接口字段与排序一致。

// 把 C# 枚举名转成 camelCase，与 System.Text.Json 的 CamelCase 策略逐字对齐：
// 只小写开头连续的大写串，"RNI" → "rni"，"NotSpecified" → "notSpecified"。
export function enumToCamel(value) {
  if (typeof value !== 'string' || value.length === 0) return value
  if (!/[A-Z]/.test(value[0])) return value

  const chars = [...value]
  for (let index = 0; index < chars.length; index += 1) {
    if (index === 1 && !/[A-Z]/.test(chars[index])) break
    const hasNext = index + 1 < chars.length
    if (index > 0 && hasNext && !/[A-Z]/.test(chars[index + 1])) break
    chars[index] = chars[index].toLowerCase()
  }
  return chars.join('')
}

// 与后端 NormalizeKeyword 一致：NFKC 归一、去空白与标点、转小写、维生素别名映射
export function normalizeKeyword(value) {
  if (!value) return ''
  let normalized = String(value)
    .normalize('NFKC')
    .replace(/[\s\p{P}\p{S}]/gu, '')
    .toLowerCase()
  if (normalized.startsWith('vitamin')) {
    normalized = '维生素' + normalized.slice('vitamin'.length)
  } else if (normalized.length > 1 && normalized[0] === 'b' && /[0-9]/.test(normalized[1])) {
    normalized = '维生素' + normalized
  }
  return normalized
}

// 营养素分组枚举，用于校验 group 参数
const NUTRIENT_GROUPS = ['Macronutrient', 'Vitamin', 'Mineral', 'Other']

function nutrientSummary(row) {
  return {
    id: row.Id,
    slug: row.Slug,
    name: row.Name,
    englishName: row.EnglishName,
    group: enumToCamel(row.Group),
    subgroup: row.Subgroup,
    canonicalUnit: row.CanonicalUnit,
    summary: row.Summary,
    isFatSoluble: row.IsFatSoluble === null ? null : row.IsFatSoluble === 1,
  }
}

// 营养素列表：按分类与关键字筛选，关键字先匹配名称，再回退到正文
export async function getNutrients(db, { group, keyword }) {
  const { results } = await db
    .prepare('SELECT * FROM "Nutrients" WHERE "IsPublished" = 1 ORDER BY "DisplayOrder"')
    .all()

  let rows = results ?? []

  if (group) {
    const matched = NUTRIENT_GROUPS.find((item) => item.toLowerCase() === group.toLowerCase())
    if (!matched) return []
    rows = rows.filter((item) => item.Group === matched)
  }

  const normalized = normalizeKeyword(keyword)
  if (normalized) {
    const byName = rows.filter((item) =>
      normalizeKeyword(`${item.Name ?? ''} ${item.EnglishName ?? ''} ${item.Slug ?? ''}`).includes(normalized),
    )
    const byDetails = rows.filter((item) =>
      normalizeKeyword(
        `${item.Name ?? ''} ${item.EnglishName ?? ''} ${item.Subgroup ?? ''} ${item.Summary ?? ''} ${item.Slug ?? ''}`,
      ).includes(normalized),
    )
    rows = byName.length > 0 ? byName : byDetails
  }

  return rows.map(nutrientSummary)
}

// 营养素详情：参考摄入量可按人群筛选，吸收证据按复核时间倒序
export async function getNutrientBySlug(db, slug, populationCode) {
  const nutrient = await db
    .prepare('SELECT * FROM "Nutrients" WHERE "IsPublished" = 1 AND "Slug" = ?')
    .bind(slug)
    .first()

  if (!nutrient) return null

  const referenceSql = populationCode
    ? `SELECT r.*, p."Code" AS PopulationCode, p."DisplayName" AS PopulationName
         FROM "NutrientReferences" r
         JOIN "PopulationGroups" p ON p."Id" = r."PopulationGroupId"
        WHERE r."NutrientId" = ? AND p."Code" = ?
        ORDER BY p."MinAgeMonths", r."Type"`
    : `SELECT r.*, p."Code" AS PopulationCode, p."DisplayName" AS PopulationName
         FROM "NutrientReferences" r
         JOIN "PopulationGroups" p ON p."Id" = r."PopulationGroupId"
        WHERE r."NutrientId" = ?
        ORDER BY p."MinAgeMonths", r."Type"`

  const references = populationCode
    ? (await db.prepare(referenceSql).bind(nutrient.Id, populationCode).all()).results ?? []
    : (await db.prepare(referenceSql).bind(nutrient.Id).all()).results ?? []

  const evidence =
    (
      await db
        .prepare('SELECT * FROM "AbsorptionEvidence" WHERE "NutrientId" = ? ORDER BY "ReviewedAtUtc" DESC')
        .bind(nutrient.Id)
        .all()
    ).results ?? []

  return {
    id: nutrient.Id,
    slug: nutrient.Slug,
    name: nutrient.Name,
    englishName: nutrient.EnglishName,
    group: enumToCamel(nutrient.Group),
    subgroup: nutrient.Subgroup,
    canonicalUnit: nutrient.CanonicalUnit,
    summary: nutrient.Summary,
    description: nutrient.Description,
    isFatSoluble: nutrient.IsFatSoluble === null ? null : nutrient.IsFatSoluble === 1,
    references: references.map((row) => ({
      populationCode: row.PopulationCode,
      populationName: row.PopulationName,
      type: enumToCamel(row.Type),
      amount: row.Amount,
      unit: row.Unit,
      sourceName: row.SourceName,
      sourceUrl: row.SourceUrl,
      standardVersion: row.StandardVersion,
      notes: row.Notes,
    })),
    absorptionEvidence: evidence.map((row) => ({
      title: row.Title,
      summary: row.Summary,
      direction: enumToCamel(row.Direction),
      applicability: row.Applicability,
      evidenceLevel: row.EvidenceLevel,
      sourceName: row.SourceName,
      sourceUrl: row.SourceUrl,
      reviewedAtUtc: toIsoDateTime(row.ReviewedAtUtc),
    })),
  }
}

// 食物列表：按名称、分类或描述模糊匹配
export async function getFoods(db, keyword) {
  const term = (keyword ?? '').trim()
  const sql = term
    ? `SELECT * FROM "Foods"
        WHERE "IsPublished" = 1
          AND ("Name" LIKE ? OR IFNULL("Category", '') LIKE ? OR IFNULL("Description", '') LIKE ?)
        ORDER BY "Name"`
    : 'SELECT * FROM "Foods" WHERE "IsPublished" = 1 ORDER BY "Name"'

  const like = `%${term}%`
  const statement = db.prepare(sql)
  const { results } = term ? await statement.bind(like, like, like).all() : await statement.all()

  return (results ?? []).map((row) => ({
    id: row.Id,
    slug: row.Slug,
    name: row.Name,
    category: row.Category,
    description: row.Description,
    sourceName: row.SourceName,
  }))
}

// 食物详情：成分按营养素展示顺序排列
export async function getFoodBySlug(db, slug) {
  const food = await db
    .prepare('SELECT * FROM "Foods" WHERE "IsPublished" = 1 AND "Slug" = ?')
    .bind(slug)
    .first()

  if (!food) return null

  const { results } = await db
    .prepare(
      `SELECT fn.*, n."Slug" AS NutrientSlug, n."Name" AS NutrientName, n."DisplayOrder" AS NutrientOrder
         FROM "FoodNutrients" fn
         JOIN "Nutrients" n ON n."Id" = fn."NutrientId"
        WHERE fn."FoodId" = ?
        ORDER BY n."DisplayOrder"`,
    )
    .bind(food.Id)
    .all()

  return {
    id: food.Id,
    slug: food.Slug,
    name: food.Name,
    category: food.Category,
    description: food.Description,
    nutrients: (results ?? []).map((row) => ({
      nutrientSlug: row.NutrientSlug,
      nutrientName: row.NutrientName,
      amountPer100g: row.AmountPer100g,
      unit: row.Unit,
      preparationState: row.PreparationState,
      sourceName: row.SourceName,
      sourceUrl: row.SourceUrl,
    })),
  }
}

// 食物概览：每种食物附上精简成分，制备状态取该食物第一条记录的取值
export async function getFoodOverview(db) {
  const { results } = await db
    .prepare(
      `SELECT f.*, fn."PreparationState", n."Slug" AS NutrientSlug, n."DisplayOrder" AS NutrientOrder,
              fn."AmountPer100g", fn."Unit", fn."Id" AS FoodNutrientId
         FROM "Foods" f
         LEFT JOIN "FoodNutrients" fn ON fn."FoodId" = f."Id"
         LEFT JOIN "Nutrients" n ON n."Id" = fn."NutrientId"
        WHERE f."IsPublished" = 1
        ORDER BY f."Name", fn."Id"`,
    )
    .all()

  const foods = new Map()
  for (const row of results ?? []) {
    let food = foods.get(row.Id)
    if (!food) {
      food = {
        id: row.Id,
        slug: row.Slug,
        name: row.Name,
        category: row.Category,
        description: row.Description,
        state: null,
        sourceName: row.SourceName,
        nutrients: [],
      }
      foods.set(row.Id, food)
    }
    if (row.FoodNutrientId === null) continue
    if (food.state === null) food.state = row.PreparationState
    food.nutrients.push({
      nutrientSlug: row.NutrientSlug,
      amountPer100g: row.AmountPer100g,
      unit: row.Unit,
      displayOrder: row.NutrientOrder ?? 0,
    })
  }

  return [...foods.values()].map((food) => ({
    ...food,
    nutrients: food.nutrients
      .sort((left, right) => left.displayOrder - right.displayOrder)
      .map(({ nutrientSlug, amountPer100g, unit }) => ({ nutrientSlug, amountPer100g, unit })),
  }))
}

// 人群选项：按起始月龄与性别排序
export async function getPopulationGroups(db) {
  const { results } = await db
    .prepare('SELECT * FROM "PopulationGroups" ORDER BY "MinAgeMonths", "Sex"')
    .all()

  return (results ?? []).map((row) => ({
    code: row.Code,
    displayName: row.DisplayName,
    minAgeMonths: row.MinAgeMonths,
    maxAgeMonths: row.MaxAgeMonths,
    sex: enumToCamel(row.Sex),
    lifeStage: row.LifeStage,
    notes: row.Notes,
  }))
}

// 参考摄入量明细：只返回已录入的条目，不为缺项补估算值
export async function getReferenceIntakes(db, populationCode) {
  const { results } = await db
    .prepare(
      `SELECT r.*, n."Slug" AS NutrientSlug, n."Name" AS NutrientName, n."Group" AS NutrientGroup,
              p."Code" AS PopulationCode, p."DisplayName" AS PopulationName
         FROM "NutrientReferences" r
         JOIN "Nutrients" n ON n."Id" = r."NutrientId"
         JOIN "PopulationGroups" p ON p."Id" = r."PopulationGroupId"
        WHERE p."Code" = ? AND n."IsPublished" = 1
        ORDER BY n."DisplayOrder", r."Type"`,
    )
    .bind(populationCode)
    .all()

  return (results ?? []).map((row) => ({
    nutrientSlug: row.NutrientSlug,
    nutrientName: row.NutrientName,
    // 后端此字段是枚举的 ToString() 结果，保持 PascalCase 不转 camelCase
    group: row.NutrientGroup,
    type: enumToCamel(row.Type),
    amount: row.Amount,
    unit: row.Unit,
    populationCode: row.PopulationCode,
    populationName: row.PopulationName,
    sourceName: row.SourceName,
    sourceUrl: row.SourceUrl,
    standardVersion: row.StandardVersion,
    notes: row.Notes,
  }))
}

// 把 SQLite 里的 "YYYY-MM-DD HH:mm:ss" 转成 .NET 输出的 ISO 形式 "YYYY-MM-DDTHH:mm:ss"
function toIsoDateTime(value) {
  if (typeof value !== 'string') return value
  return value.replace(/^(\d{4}-\d{2}-\d{2}) /, '$1T')
}

// 解析历史记录里的营养素快照，坏数据按空对象处理
function parseSnapshot(json) {
  if (!json) return {}
  try {
    const parsed = JSON.parse(json)
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

function mealLogDto(log, items) {
  const mapped = items.map((item) => ({
    id: item.Id,
    foodSlug: item.FoodSlug,
    foodName: item.FoodName,
    grams: item.Grams,
    energyKcal: item.EnergyKcal,
    nutrients: parseSnapshot(item.NutrientSnapshotJson),
  }))

  return {
    id: log.Id,
    logDate: log.LogDate,
    mealType: enumToCamel(log.MealType),
    note: log.Note,
    createdAtUtc: log.CreatedAtUtc,
    totalEnergyKcal: mapped.reduce((sum, item) => sum + (item.energyKcal || 0), 0),
    totalGrams: mapped.reduce((sum, item) => sum + (item.grams || 0), 0),
    items: mapped,
  }
}

// 饮食记录列表：按日期倒序、餐次正序
export async function getMealLogs(db, { from, to, ownerKey }) {
  const conditions = ['"OwnerKey" = ?']
  const binds = [ownerKey]
  if (from) {
    conditions.push('"LogDate" >= ?')
    binds.push(from)
  }
  if (to) {
    conditions.push('"LogDate" <= ?')
    binds.push(to)
  }

  const { results: logs } = await db
    .prepare(
      `SELECT * FROM "MealLogs" WHERE ${conditions.join(' AND ')}
        ORDER BY "LogDate" DESC, "MealType" ASC`,
    )
    .bind(...binds)
    .all()

  const rows = logs ?? []
  if (rows.length === 0) return []

  const ids = rows.map((row) => row.Id)
  const { results: items } = await db
    .prepare(
      `SELECT * FROM "MealLogItems"
        WHERE "MealLogId" IN (${ids.map(() => '?').join(', ')})
        ORDER BY "Id" ASC`,
    )
    .bind(...ids)
    .all()

  const grouped = new Map()
  for (const item of items ?? []) {
    if (!grouped.has(item.MealLogId)) grouped.set(item.MealLogId, [])
    grouped.get(item.MealLogId).push(item)
  }

  return rows.map((row) => mealLogDto(row, grouped.get(row.Id) ?? []))
}

// 保存一餐：先写主记录再写条目，全部走 batch 保证原子性
export async function saveMealLog(db, request, ownerKey) {
  const now = new Date().toISOString()
  const items = request.items ?? []
  const meta = await db
    .prepare(
      `INSERT INTO "MealLogs" ("OwnerKey", "LogDate", "MealType", "Note", "CreatedAtUtc", "UpdatedAtUtc")
       VALUES (?, ?, ?, ?, ?, ?)`,
    )
    .bind(ownerKey, request.logDate, request.mealType, request.note ?? null, now, now)
    .run()
  const logId = meta.meta.last_row_id

  const itemRows = []
  for (const item of items) {
    const nutrients = item.nutrients ?? {}
    const energy = typeof nutrients.energy === 'number' ? nutrients.energy : 0
    const inserted = await db
      .prepare(
        `INSERT INTO "MealLogItems" ("MealLogId", "FoodSlug", "FoodName", "Grams", "EnergyKcal", "NutrientSnapshotJson")
         VALUES (?, ?, ?, ?, ?, ?)`,
      )
      .bind(logId, item.foodSlug, item.foodName, item.grams, energy, JSON.stringify(nutrients))
      .run()

    itemRows.push({
      Id: inserted.meta.last_row_id,
      MealLogId: logId,
      FoodSlug: item.foodSlug,
      FoodName: item.foodName,
      Grams: item.grams,
      EnergyKcal: energy,
      NutrientSnapshotJson: JSON.stringify(nutrients),
    })
  }

  return mealLogDto(
    {
      Id: logId,
      OwnerKey: ownerKey,
      LogDate: request.logDate,
      MealType: request.mealType,
      Note: request.note ?? null,
      CreatedAtUtc: now,
      UpdatedAtUtc: now,
    },
    itemRows,
  )
}

// 删除一条饮食记录，条目一并清理
export async function deleteMealLog(db, id, ownerKey) {
  const log = await db
    .prepare('SELECT "Id" FROM "MealLogs" WHERE "Id" = ? AND "OwnerKey" = ?')
    .bind(id, ownerKey)
    .first()

  if (!log) return false

  await db.batch([
    db.prepare('DELETE FROM "MealLogItems" WHERE "MealLogId" = ?').bind(id),
    db.prepare('DELETE FROM "MealLogs" WHERE "Id" = ?').bind(id),
  ])

  return true
}
