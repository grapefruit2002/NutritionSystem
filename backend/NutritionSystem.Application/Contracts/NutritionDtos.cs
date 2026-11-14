using NutritionSystem.Domain.Enums;

namespace NutritionSystem.Application.Contracts;

//营养素的简要信息，用于列表与概览展示
public sealed record NutrientSummaryDto(
    //营养素主键
    int Id,
    //URL 友好且稳定的唯一标识
    string Slug,
    //中文名称
    string Name,
    //英文名称（可选）
    string? EnglishName,
    //营养学分类
    NutrientGroup Group,
    //子类（如脂溶性、水溶性）
    string? Subgroup,
    //规范计量单位（如 g/d、mg/d）
    string CanonicalUnit,
    //科普正文
    string Summary,
    //是否脂溶性（仅部分维生素有意义）
    bool? IsFatSoluble);

//某营养素针对特定人群的参考摄入量
public sealed record NutrientReferenceDto(
    //人群代码
    string PopulationCode,
    //人群显示名称
    string PopulationName,
    //参考摄入量类型（RNI、UL 等）
    ReferenceType Type,
    //推荐量数值
    double Amount,
    //计量单位
    string Unit,
    //数据来源名称
    string SourceName,
    //数据来源链接（可选）
    string? SourceUrl,
    //标准版本（如 DRIs 2023）
    string StandardVersion,
    //补充说明（可选）
    string? Notes);

//可供前端选择的人群选项
public sealed record PopulationOptionDto(
    //人群代码
    string Code,
    //显示名称
    string DisplayName,
    //最小月龄（可选）
    int? MinAgeMonths,
    //最大月龄（可选，null 表示无上限）
    int? MaxAgeMonths,
    //适用性别
    PopulationSex Sex,
    //生命阶段描述
    string LifeStage,
    //补充说明（可选）
    string? Notes);

//参考摄入量明细行，用于表格化展示营养素与人群的交叉数据
public sealed record ReferenceIntakeRowDto(
    //营养素代码
    string NutrientSlug,
    //营养素名称
    string NutrientName,
    //营养学分类
    string Group,
    //参考摄入量类型
    ReferenceType Type,
    //推荐量数值
    double Amount,
    //计量单位
    string Unit,
    //人群代码
    string PopulationCode,
    //人群显示名称
    string PopulationName,
    //数据来源名称
    string SourceName,
    //数据来源链接（可选）
    string? SourceUrl,
    //标准版本
    string StandardVersion,
    //补充说明（可选）
    string? Notes);

//营养素吸收的相互作用证据
public sealed record AbsorptionEvidenceDto(
    //证据标题
    string Title,
    //证据摘要
    string Summary,
    //作用方向（促进、抑制等）
    AbsorptionDirection Direction,
    //适用条件（可选）
    string? Applicability,
    //证据等级（可选）
    string? EvidenceLevel,
    //来源名称
    string SourceName,
    //来源链接
    string SourceUrl,
    //复核时间（UTC）
    DateTime ReviewedAtUtc);

//营养素的完整详情，包含参考摄入量与吸收证据
public sealed record NutrientDetailDto(
    //主键
    int Id,
    //唯一标识
    string Slug,
    //中文名称
    string Name,
    //英文名称（可选）
    string? EnglishName,
    //营养学分类
    NutrientGroup Group,
    //子类（可选）
    string? Subgroup,
    //规范计量单位
    string CanonicalUnit,
    //科普正文
    string Summary,
    //详细描述（可选）
    string? Description,
    //是否脂溶性（可选）
    bool? IsFatSoluble,
    //参考摄入量列表
    IReadOnlyList<NutrientReferenceDto> References,
    //吸收相互作用证据列表
    IReadOnlyList<AbsorptionEvidenceDto> AbsorptionEvidence);

//食物简要信息，用于列表展示
public sealed record FoodSummaryDto(
    //主键
    int Id,
    //唯一标识
    string Slug,
    //名称
    string Name,
    //分类（可选）
    string? Category,
    //描述（可选）
    string? Description,
    //数据来源名称（可选）
    string? SourceName);

//食物所含营养成分（每 100 克）
public sealed record FoodNutrientDto(
    //营养素代码
    string NutrientSlug,
    //营养素名称
    string NutrientName,
    //每 100 克含量
    double AmountPer100g,
    //计量单位
    string Unit,
    //制备状态（生、熟、加工等）
    string PreparationState,
    //数据来源名称
    string SourceName,
    //数据来源链接（可选）
    string? SourceUrl);

//食物完整详情，包含其营养成分列表
public sealed record FoodDetailDto(
    //主键
    int Id,
    //唯一标识
    string Slug,
    //名称
    string Name,
    //分类（可选）
    string? Category,
    //描述（可选）
    string? Description,
    //营养成分列表
    IReadOnlyList<FoodNutrientDto> Nutrients);

//食物概览，包含精简的营养成分条目
public sealed record FoodOverviewDto(
    //主键
    int Id,
    //唯一标识
    string Slug,
    //名称
    string Name,
    //分类（可选）
    string? Category,
    //描述（可选）
    string? Description,
    //制备状态（可选）
    string? State,
    //数据来源名称（可选）
    string? SourceName,
    //营养成分条目列表
    IReadOnlyList<FoodNutrientItemDto> Nutrients);

//食物概览中单个营养成分的精简条目
public sealed record FoodNutrientItemDto(
    //营养素代码
    string NutrientSlug,
    //每 100 克含量
    double AmountPer100g,
    //计量单位
    string Unit);
