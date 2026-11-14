using NutritionSystem.Domain.Enums;

namespace NutritionSystem.Domain.Entities;

//参考人群，按年龄区间与性别拆分，作为参考摄入量的自然键
public sealed class PopulationGroup
{
    //主键
    public int Id { get; set; }

    //人群代码（自然键）
    public required string Code { get; set; }

    //显示名称
    public required string DisplayName { get; set; }

    //最小月龄（可选）
    public int? MinAgeMonths { get; set; }

    //最大月龄（可选，null 表示无上限）
    public int? MaxAgeMonths { get; set; }

    //适用性别
    public PopulationSex Sex { get; set; }

    //生命阶段描述
    public required string LifeStage { get; set; }

    //补充说明（可选）
    public string? Notes { get; set; }

    //该人群关联的参考摄入量
    public ICollection<NutrientReference> References { get; set; } = new List<NutrientReference>();
}
