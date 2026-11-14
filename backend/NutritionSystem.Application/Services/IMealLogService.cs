using NutritionSystem.Application.Contracts;

namespace NutritionSystem.Application.Services;

//饮食记录的读写服务
public interface IMealLogService
{
    //按日期区间获取饮食记录
    Task<IReadOnlyList<MealLogDto>> GetMealLogsAsync(
        DateOnly? from,
        DateOnly? to,
        string ownerKey,
        CancellationToken cancellationToken);

    //保存一餐
    Task<MealLogDto> SaveMealLogAsync(
        SaveMealLogRequestDto request,
        string ownerKey,
        CancellationToken cancellationToken);

    //删除一条饮食记录
    Task<bool> DeleteMealLogAsync(
        int id,
        string ownerKey,
        CancellationToken cancellationToken);
}
