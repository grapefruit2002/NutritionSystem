using NutritionSystem.Application.Contracts;

namespace NutritionSystem.Application.Services;

//营养数据查询服务，提供营养素、食物与参考摄入量的只读查询
public interface INutritionQueryService
{
    //按分类与关键字查询营养素列表
    Task<IReadOnlyList<NutrientSummaryDto>> GetNutrientsAsync(
        string? group,
        string? keyword,
        CancellationToken cancellationToken);

    //按唯一标识获取营养素详情，可附带指定人群以展示对应参考摄入量
    Task<NutrientDetailDto?> GetNutrientBySlugAsync(
        string slug,
        string? populationCode,
        CancellationToken cancellationToken);

    //按关键字搜索食物列表
    Task<IReadOnlyList<FoodSummaryDto>> GetFoodsAsync(
        string? keyword,
        CancellationToken cancellationToken);

    //按唯一标识获取食物详情
    Task<FoodDetailDto?> GetFoodBySlugAsync(
        string slug,
        CancellationToken cancellationToken);

    //获取食物概览列表（含精简营养成分）
    Task<IReadOnlyList<FoodOverviewDto>> GetFoodOverviewAsync(CancellationToken cancellationToken);

    //获取可供选择的人群选项列表
    Task<IReadOnlyList<PopulationOptionDto>> GetPopulationGroupsAsync(CancellationToken cancellationToken);

    //获取指定人群的参考摄入量明细
    Task<IReadOnlyList<ReferenceIntakeRowDto>> GetReferenceIntakesAsync(
        string populationCode,
        CancellationToken cancellationToken);
}
