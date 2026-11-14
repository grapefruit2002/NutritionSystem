using NutritionSystem.Domain.Enums;

namespace NutritionSystem.Application.Contracts;

//保存一餐的请求
public sealed record SaveMealLogRequestDto(
    DateOnly LogDate,
    MealType MealType,
    string? Note,
    IReadOnlyList<SaveMealLogItemDto> Items);

//保存一餐时的单条食物
public sealed record SaveMealLogItemDto(
    string FoodSlug,
    string FoodName,
    double Grams,
    Dictionary<string, double>? Nutrients);

//饮食记录中的单条食物
public sealed record MealLogItemDto(
    int Id,
    string FoodSlug,
    string FoodName,
    double Grams,
    double EnergyKcal,
    IReadOnlyDictionary<string, double> Nutrients);

//一条饮食记录
public sealed record MealLogDto(
    int Id,
    DateOnly LogDate,
    MealType MealType,
    string? Note,
    DateTime CreatedAtUtc,
    double TotalEnergyKcal,
    double TotalGrams,
    IReadOnlyList<MealLogItemDto> Items);
