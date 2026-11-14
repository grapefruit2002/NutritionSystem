using NutritionSystem.Domain.Enums;

namespace NutritionSystem.Domain.Entities;

//营养素吸收的相互作用证据，描述不同营养素之间的促进或抑制关系
public sealed class AbsorptionEvidence
{
    //主键
    public int Id { get; set; }

    //关联营养素主键
    public int NutrientId { get; set; }

    //证据标题
    public required string Title { get; set; }

    //证据摘要
    public required string Summary { get; set; }

    //作用方向（促进、抑制等）
    public AbsorptionDirection Direction { get; set; }

    //适用条件（可选）
    public string? Applicability { get; set; }

    //证据等级（可选）
    public string? EvidenceLevel { get; set; }

    //来源名称
    public required string SourceName { get; set; }

    //来源链接
    public required string SourceUrl { get; set; }

    //复核时间（UTC）
    public DateTime ReviewedAtUtc { get; set; }

    //关联的营养素
    public Nutrient Nutrient { get; set; } = null!;
}
