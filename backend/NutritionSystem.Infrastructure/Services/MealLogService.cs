using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using NutritionSystem.Application.Contracts;
using NutritionSystem.Application.Services;
using NutritionSystem.Domain.Entities;
using NutritionSystem.Infrastructure.Persistence;

namespace NutritionSystem.Infrastructure.Services;

//基于 EF Core 的饮食记录读写实现
public sealed class MealLogService(NutritionDbContext dbContext) : IMealLogService
{
    private static readonly JsonSerializerOptions SnapshotOptions = new(JsonSerializerDefaults.Web);

    public async Task<IReadOnlyList<MealLogDto>> GetMealLogsAsync(
        DateOnly? from,
        DateOnly? to,
        string ownerKey,
        CancellationToken cancellationToken)
    {
        var query = dbContext.MealLogs
            .AsNoTracking()
            .Include(log => log.Items)
            .Where(log => log.OwnerKey == ownerKey);

        if (from is not null) query = query.Where(log => log.LogDate >= from.Value);
        if (to is not null) query = query.Where(log => log.LogDate <= to.Value);

        var logs = await query
            .OrderByDescending(log => log.LogDate)
            .ThenBy(log => log.MealType)
            .ToListAsync(cancellationToken);

        return logs.Select(ToDto).ToList();
    }

    public async Task<MealLogDto> SaveMealLogAsync(
        SaveMealLogRequestDto request,
        string ownerKey,
        CancellationToken cancellationToken)
    {
        var now = DateTime.UtcNow;
        var log = new MealLog
        {
            OwnerKey = ownerKey,
            LogDate = request.LogDate,
            MealType = request.MealType,
            Note = request.Note,
            CreatedAtUtc = now,
            UpdatedAtUtc = now,
        };

        foreach (var item in request.Items)
        {
            var nutrients = item.Nutrients ?? new Dictionary<string, double>();
            log.Items.Add(new MealLogItem
            {
                FoodSlug = item.FoodSlug,
                FoodName = item.FoodName,
                Grams = item.Grams,
                EnergyKcal = nutrients.TryGetValue("energy", out var energy) ? energy : 0,
                // 保存当时的营养素快照，避免主数据更新后历史记录数值漂移。
                NutrientSnapshotJson = JsonSerializer.Serialize(nutrients, SnapshotOptions),
            });
        }

        dbContext.MealLogs.Add(log);
        await dbContext.SaveChangesAsync(cancellationToken);

        return ToDto(log);
    }

    public async Task<bool> DeleteMealLogAsync(int id, string ownerKey, CancellationToken cancellationToken)
    {
        var log = await dbContext.MealLogs
            .FirstOrDefaultAsync(item => item.Id == id && item.OwnerKey == ownerKey, cancellationToken);
        if (log is null) return false;

        dbContext.MealLogs.Remove(log);
        await dbContext.SaveChangesAsync(cancellationToken);
        return true;
    }

    private static MealLogDto ToDto(MealLog log)
    {
        var items = log.Items
            .OrderBy(item => item.Id)
            .Select(item => new MealLogItemDto(
                item.Id,
                item.FoodSlug,
                item.FoodName,
                item.Grams,
                item.EnergyKcal,
                ParseSnapshot(item.NutrientSnapshotJson)))
            .ToList();

        return new MealLogDto(
            log.Id,
            log.LogDate,
            log.MealType,
            log.Note,
            log.CreatedAtUtc,
            items.Sum(item => item.EnergyKcal),
            items.Sum(item => item.Grams),
            items);
    }

    private static IReadOnlyDictionary<string, double> ParseSnapshot(string json)
    {
        if (string.IsNullOrWhiteSpace(json)) return new Dictionary<string, double>();
        try
        {
            return JsonSerializer.Deserialize<Dictionary<string, double>>(json, SnapshotOptions)
                ?? new Dictionary<string, double>();
        }
        catch (JsonException)
        {
            return new Dictionary<string, double>();
        }
    }
}
