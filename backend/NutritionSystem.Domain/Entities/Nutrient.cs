using NutritionSystem.Domain.Enums;

namespace NutritionSystem.Domain.Entities;

//营养素主档，包含分类、计量单位、科普正文及关联数据
public sealed class Nutrient
{
    //主键
    public int Id { get; set; }

    //URL 友好且稳定的唯一标识
    public required string Slug { get; set; }

    //中文名称
    public required string Name { get; set; }

    //英文名称（可选）
    public string? EnglishName { get; set; }

    //营养学分类
    public NutrientGroup Group { get; set; }

    //子类（如脂溶性、水溶性，可选）
    public string? Subgroup { get; set; }

    //规范计量单位（如 g/d、mg/d）
    public required string CanonicalUnit { get; set; }

    //科普正文
    public required string Summary { get; set; }

    //详细描述（可选）
    public string? Description { get; set; }

    //是否脂溶性（仅部分维生素有意义）
    public bool? IsFatSoluble { get; set; }

    //展示排序
    public int DisplayOrder { get; set; }

    //是否已发布
    public bool IsPublished { get; set; }

    //关联的参考摄入量
    public ICollection<NutrientReference> References { get; set; } = new List<NutrientReference>();

    //关联的吸收相互作用证据
    public ICollection<AbsorptionEvidence> AbsorptionEvidence { get; set; } = new List<AbsorptionEvidence>();

    //关联的食物营养成分
    public ICollection<FoodNutrient> FoodNutrients { get; set; } = new List<FoodNutrient>();
}
