-- Cloudflare D1 结构：与后端 EF Core 迁移保持一致的表结构
-- 表名 / 列名沿用 EF 生成的名字，便于从 data.db 直接导出种子数据。

DROP TABLE IF EXISTS "MealLogItems";
DROP TABLE IF EXISTS "MealLogs";
DROP TABLE IF EXISTS "AbsorptionEvidence";
DROP TABLE IF EXISTS "FoodNutrients";
DROP TABLE IF EXISTS "NutrientReferences";
DROP TABLE IF EXISTS "Foods";
DROP TABLE IF EXISTS "Nutrients";
DROP TABLE IF EXISTS "PopulationGroups";

-- 参考人群：按年龄区间与性别拆分，是参考摄入量的自然键
CREATE TABLE "PopulationGroups" (
    "Id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "Code" TEXT NOT NULL,
    "DisplayName" TEXT NOT NULL,
    "MinAgeMonths" INTEGER NULL,
    "MaxAgeMonths" INTEGER NULL,
    "Sex" TEXT NOT NULL,
    "LifeStage" TEXT NOT NULL,
    "Notes" TEXT NULL
);
CREATE UNIQUE INDEX "IX_PopulationGroups_Code" ON "PopulationGroups" ("Code");

-- 营养素主档
CREATE TABLE "Nutrients" (
    "Id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "Slug" TEXT NOT NULL,
    "Name" TEXT NOT NULL,
    "EnglishName" TEXT NULL,
    "Group" TEXT NOT NULL,
    "Subgroup" TEXT NULL,
    "CanonicalUnit" TEXT NOT NULL,
    "Summary" TEXT NOT NULL,
    "Description" TEXT NULL,
    "IsFatSoluble" INTEGER NULL,
    "DisplayOrder" INTEGER NOT NULL,
    "IsPublished" INTEGER NOT NULL
);
CREATE UNIQUE INDEX "IX_Nutrients_Slug" ON "Nutrients" ("Slug");

-- 食物主档
CREATE TABLE "Foods" (
    "Id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "Slug" TEXT NOT NULL,
    "Name" TEXT NOT NULL,
    "Category" TEXT NULL,
    "Description" TEXT NULL,
    "IsPublished" INTEGER NOT NULL,
    "SourceName" TEXT NULL,
    "SourceUrl" TEXT NULL
);
CREATE UNIQUE INDEX "IX_Foods_Slug" ON "Foods" ("Slug");

-- 按人群区分的膳食参考摄入量
CREATE TABLE "NutrientReferences" (
    "Id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "NutrientId" INTEGER NOT NULL,
    "PopulationGroupId" INTEGER NOT NULL,
    "Type" TEXT NOT NULL,
    "Amount" REAL NOT NULL,
    "Unit" TEXT NOT NULL,
    "SourceName" TEXT NOT NULL,
    "SourceUrl" TEXT NULL,
    "StandardVersion" TEXT NOT NULL,
    "Notes" TEXT NULL,
    "UpdatedAtUtc" TEXT NOT NULL,
    FOREIGN KEY ("NutrientId") REFERENCES "Nutrients" ("Id") ON DELETE CASCADE,
    FOREIGN KEY ("PopulationGroupId") REFERENCES "PopulationGroups" ("Id") ON DELETE RESTRICT
);
CREATE UNIQUE INDEX "IX_NutrientReferences_NutrientId_PopulationGroupId_Type_StandardVersion"
    ON "NutrientReferences" ("NutrientId", "PopulationGroupId", "Type", "StandardVersion");

-- 食物每 100 克营养成分
CREATE TABLE "FoodNutrients" (
    "Id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "FoodId" INTEGER NOT NULL,
    "NutrientId" INTEGER NOT NULL,
    "AmountPer100g" REAL NOT NULL,
    "Unit" TEXT NOT NULL,
    "PreparationState" TEXT NOT NULL,
    "SourceName" TEXT NOT NULL,
    "SourceUrl" TEXT NULL,
    FOREIGN KEY ("FoodId") REFERENCES "Foods" ("Id") ON DELETE CASCADE,
    FOREIGN KEY ("NutrientId") REFERENCES "Nutrients" ("Id") ON DELETE RESTRICT
);
CREATE UNIQUE INDEX "IX_FoodNutrients_FoodId_NutrientId_PreparationState_SourceName"
    ON "FoodNutrients" ("FoodId", "NutrientId", "PreparationState", "SourceName");

-- 营养素吸收相互作用的证据
CREATE TABLE "AbsorptionEvidence" (
    "Id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "NutrientId" INTEGER NOT NULL,
    "Title" TEXT NOT NULL,
    "Summary" TEXT NOT NULL,
    "Direction" TEXT NOT NULL,
    "Applicability" TEXT NULL,
    "EvidenceLevel" TEXT NULL,
    "SourceName" TEXT NOT NULL,
    "SourceUrl" TEXT NOT NULL,
    "ReviewedAtUtc" TEXT NOT NULL,
    FOREIGN KEY ("NutrientId") REFERENCES "Nutrients" ("Id") ON DELETE CASCADE
);

-- 饮食记录（某天某一餐）
CREATE TABLE "MealLogs" (
    "Id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "OwnerKey" TEXT NOT NULL,
    "LogDate" TEXT NOT NULL,
    "MealType" TEXT NOT NULL,
    "Note" TEXT NULL,
    "CreatedAtUtc" TEXT NOT NULL,
    "UpdatedAtUtc" TEXT NOT NULL
);
CREATE INDEX "IX_MealLogs_OwnerKey_LogDate" ON "MealLogs" ("OwnerKey", "LogDate");

-- 饮食记录中的食物条目
CREATE TABLE "MealLogItems" (
    "Id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "MealLogId" INTEGER NOT NULL,
    "FoodSlug" TEXT NOT NULL,
    "FoodName" TEXT NOT NULL,
    "Grams" REAL NOT NULL,
    "EnergyKcal" REAL NOT NULL,
    "NutrientSnapshotJson" TEXT NOT NULL,
    FOREIGN KEY ("MealLogId") REFERENCES "MealLogs" ("Id") ON DELETE CASCADE
);
CREATE INDEX "IX_MealLogItems_MealLogId" ON "MealLogItems" ("MealLogId");
