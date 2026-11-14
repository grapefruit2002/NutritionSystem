namespace NutritionSystem.Domain.Entities;

//食物主档，记录食物的基础信息与数据来源
public sealed class Food
{
    //主键
    public int Id { get; set; }

    //URL 友好且稳定的唯一标识
    public required string Slug { get; set; }

    //食物名称
    public required string Name { get; set; }

    //分类（可选）
    public string? Category { get; set; }

    //描述（可选）
    public string? Description { get; set; }

    //是否已发布
    public bool IsPublished { get; set; }

    //数据来源名称（可选）
    public string? SourceName { get; set; }

    //数据来源链接（可选）
    public string? SourceUrl { get; set; }

    //该食物包含的营养成分
    public ICollection<FoodNutrient> Nutrients { get; set; } = new List<FoodNutrient>();
}
