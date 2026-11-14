namespace NutritionSystem.Domain.Entities;

//食物营养成分，记录每种食物每 100 克所含营养素的含量与制备状态
public sealed class FoodNutrient
{
    //主键
    public int Id { get; set; }

    //关联食物主键
    public int FoodId { get; set; }

    //关联营养素主键
    public int NutrientId { get; set; }

    //每 100 克含量
    public double AmountPer100g { get; set; }

    //计量单位
    public required string Unit { get; set; }

    //制备状态（生、熟、加工等）
    public required string PreparationState { get; set; }

    //数据来源名称
    public required string SourceName { get; set; }

    //数据来源链接（可选）
    public string? SourceUrl { get; set; }

    //关联的食物
    public Food Food { get; set; } = null!;

    //关联的营养素
    public Nutrient Nutrient { get; set; } = null!;
}
