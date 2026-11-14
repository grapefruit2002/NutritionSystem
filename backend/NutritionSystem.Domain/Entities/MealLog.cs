using NutritionSystem.Domain.Enums;

namespace NutritionSystem.Domain.Entities;

//一条饮食记录，表示某天某一餐吃了哪些食物
public sealed class MealLog
{
    //主键
    public int Id { get; set; }

    //数据归属键，单用户默认 local，预留多用户扩展
    public string OwnerKey { get; set; } = "local";

    //记录日期（按本地日期，不含时间）
    public DateOnly LogDate { get; set; }

    //餐次
    public MealType MealType { get; set; }

    //备注（可选）
    public string? Note { get; set; }

    //创建时间（UTC）
    public DateTime CreatedAtUtc { get; set; }

    //最后更新时间（UTC）
    public DateTime UpdatedAtUtc { get; set; }

    //这一餐包含的食物条目
    public ICollection<MealLogItem> Items { get; set; } = new List<MealLogItem>();
}
