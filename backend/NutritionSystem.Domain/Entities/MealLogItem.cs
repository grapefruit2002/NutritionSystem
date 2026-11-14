namespace NutritionSystem.Domain.Entities;

//饮食记录中的一条食物，保存当时的克数与营养素快照
public sealed class MealLogItem
{
    //主键
    public int Id { get; set; }

    //所属饮食记录主键
    public int MealLogId { get; set; }

    //食物唯一标识（slug）
    public string FoodSlug { get; set; } = string.Empty;

    //食物名称快照
    public string FoodName { get; set; } = string.Empty;

    //食用克数
    public double Grams { get; set; }

    //该条目热量（kcal）
    public double EnergyKcal { get; set; }

    //营养素快照（slug 到含量的 JSON），保证历史不随主数据变化
    public string NutrientSnapshotJson { get; set; } = "{}";

    //所属饮食记录
    public MealLog MealLog { get; set; } = null!;
}
