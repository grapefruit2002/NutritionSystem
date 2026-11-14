using NutritionSystem.Domain.Enums;

namespace NutritionSystem.Domain.Entities;

//营养素针对特定人群的参考摄入量
public sealed class NutrientReference
{
    //主键
    public int Id { get; set; }

    //关联营养素主键
    public int NutrientId { get; set; }

    //关联人群主键
    public int PopulationGroupId { get; set; }

    //参考摄入量类型（RNI、UL 等）
    public ReferenceType Type { get; set; }

    //推荐量数值
    public double Amount { get; set; }

    //计量单位
    public required string Unit { get; set; }

    //数据来源名称
    public required string SourceName { get; set; }

    //数据来源链接（可选）
    public string? SourceUrl { get; set; }

    //标准版本（如 DRIs 2023）
    public required string StandardVersion { get; set; }

    //补充说明（可选）
    public string? Notes { get; set; }

    //更新时间（UTC）
    public DateTime UpdatedAtUtc { get; set; }

    //关联的营养素
    public Nutrient Nutrient { get; set; } = null!;

    //关联的人群
    public PopulationGroup PopulationGroup { get; set; } = null!;
}
