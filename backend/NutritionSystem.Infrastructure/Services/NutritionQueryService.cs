using System.Globalization;
using System.Text;
using Microsoft.EntityFrameworkCore;
using NutritionSystem.Application.Contracts;
using NutritionSystem.Application.Services;
using NutritionSystem.Domain.Entities;
using NutritionSystem.Domain.Enums;
using NutritionSystem.Infrastructure.Persistence;

namespace NutritionSystem.Infrastructure.Services;

//通过 EF Core 提供营养素、食物、人群参考量和吸收资料查询
public sealed class NutritionQueryService(NutritionDbContext dbContext) : INutritionQueryService
{
    //按分类与关键词查询已发布营养素
    public async Task<IReadOnlyList<NutrientSummaryDto>> GetNutrientsAsync(
        string? group,
        string? keyword,
        CancellationToken cancellationToken)
    {
        IQueryable<Nutrient> query = dbContext.Nutrients
            .AsNoTracking()
            .Where(item => item.IsPublished);

        if (!string.IsNullOrWhiteSpace(group))
        {
            if (!Enum.TryParse<NutrientGroup>(group, ignoreCase: true, out var parsedGroup))
                return Array.Empty<NutrientSummaryDto>();

            query = query.Where(item => item.Group == parsedGroup);
        }

        var nutrients = await query
            .OrderBy(item => item.DisplayOrder)
            .ToListAsync(cancellationToken);

        if (!string.IsNullOrWhiteSpace(keyword))
        {
            var normalizedKeyword = NormalizeKeyword(keyword);
            if (normalizedKeyword.Length > 0)
            {
                var byName = nutrients
                    .Where(item => NormalizeKeyword($"{item.Name} {item.EnglishName} {item.Slug}")
                        .Contains(normalizedKeyword, StringComparison.Ordinal))
                    .ToList();

                var byDetails = nutrients
                    .Where(item => NormalizeKeyword($"{item.Name} {item.EnglishName} {item.Subgroup} {item.Summary} {item.Slug}")
                        .Contains(normalizedKeyword, StringComparison.Ordinal))
                    .ToList();

                nutrients = byName.Count > 0 ? byName : byDetails;
            }
        }

        return nutrients
            .Select(item => new NutrientSummaryDto(
                item.Id,
                item.Slug,
                item.Name,
                item.EnglishName,
                item.Group,
                item.Subgroup,
                item.CanonicalUnit,
                item.Summary,
                item.IsFatSoluble))
            .ToArray();
    }

    //返回营养素详情，并可按参考人群筛选摄入量
    public async Task<NutrientDetailDto?> GetNutrientBySlugAsync(
        string slug,
        string? populationCode,
        CancellationToken cancellationToken)
    {
        var nutrient = await dbContext.Nutrients
            .AsNoTracking()
            .Where(item => item.IsPublished && item.Slug == slug)
            .Include(item => item.References)
                .ThenInclude(item => item.PopulationGroup)
            .Include(item => item.AbsorptionEvidence)
            .SingleOrDefaultAsync(cancellationToken);

        if (nutrient is null)
            return null;

        var references = nutrient.References
            .Where(item => string.IsNullOrWhiteSpace(populationCode)
                || item.PopulationGroup.Code == populationCode)
            .OrderBy(item => item.PopulationGroup.MinAgeMonths)
            .ThenBy(item => item.Type)
            .Select(item => new NutrientReferenceDto(
                item.PopulationGroup.Code,
                item.PopulationGroup.DisplayName,
                item.Type,
                item.Amount,
                item.Unit,
                item.SourceName,
                item.SourceUrl,
                item.StandardVersion,
                item.Notes))
            .ToArray();

        var evidence = nutrient.AbsorptionEvidence
            .OrderByDescending(item => item.ReviewedAtUtc)
            .Select(item => new AbsorptionEvidenceDto(
                item.Title,
                item.Summary,
                item.Direction,
                item.Applicability,
                item.EvidenceLevel,
                item.SourceName,
                item.SourceUrl,
                item.ReviewedAtUtc))
            .ToArray();

        return new NutrientDetailDto(
            nutrient.Id,
            nutrient.Slug,
            nutrient.Name,
            nutrient.EnglishName,
            nutrient.Group,
            nutrient.Subgroup,
            nutrient.CanonicalUnit,
            nutrient.Summary,
            nutrient.Description,
            nutrient.IsFatSoluble,
            references,
            evidence);
    }

    //按名称、分类或描述搜索已发布食物
    public async Task<IReadOnlyList<FoodSummaryDto>> GetFoodsAsync(
        string? keyword,
        CancellationToken cancellationToken)
    {
        IQueryable<Food> query = dbContext.Foods
            .AsNoTracking()
            .Where(item => item.IsPublished);

        if (!string.IsNullOrWhiteSpace(keyword))
        {
            var term = keyword.Trim();
            query = query.Where(item =>
                item.Name.Contains(term) ||
                (item.Category != null && item.Category.Contains(term)) ||
                (item.Description != null && item.Description.Contains(term)));
        }

        return await query
            .OrderBy(item => item.Name)
            .Select(item => new FoodSummaryDto(
                item.Id, item.Slug, item.Name, item.Category, item.Description, item.SourceName))
            .ToArrayAsync(cancellationToken);
    }

    //按食物代码返回营养素含量及制备状态
    public async Task<FoodDetailDto?> GetFoodBySlugAsync(
        string slug,
        CancellationToken cancellationToken)
    {
        var food = await dbContext.Foods
            .AsNoTracking()
            .Where(item => item.IsPublished && item.Slug == slug)
            .Include(item => item.Nutrients)
                .ThenInclude(item => item.Nutrient)
            .SingleOrDefaultAsync(cancellationToken);

        if (food is null)
            return null;

        var nutrients = food.Nutrients
            .OrderBy(item => item.Nutrient.DisplayOrder)
            .Select(item => new FoodNutrientDto(
                item.Nutrient.Slug,
                item.Nutrient.Name,
                item.AmountPer100g,
                item.Unit,
                item.PreparationState,
                item.SourceName,
                item.SourceUrl))
            .ToArray();

        return new FoodDetailDto(
            food.Id, food.Slug, food.Name, food.Category, food.Description, nutrients);
    }

    //返回食物概览及每种食物当前已维护的营养素摘要
    public async Task<IReadOnlyList<FoodOverviewDto>> GetFoodOverviewAsync(
        CancellationToken cancellationToken)
    {
        var foods = await dbContext.Foods
            .AsNoTracking()
            .Where(item => item.IsPublished)
            .Include(item => item.Nutrients)
                .ThenInclude(item => item.Nutrient)
            .OrderBy(item => item.Name)
            .ToListAsync(cancellationToken);

        return foods
            .Select(food => new FoodOverviewDto(
                food.Id,
                food.Slug,
                food.Name,
                food.Category,
                food.Description,
                food.Nutrients.Select(item => item.PreparationState).FirstOrDefault(),
                food.SourceName,
                food.Nutrients
                    .OrderBy(item => item.Nutrient.DisplayOrder)
                    .Select(item => new FoodNutrientItemDto(
                        item.Nutrient.Slug, item.AmountPer100g, item.Unit))
                    .ToArray()))
            .ToArray();
    }

    //按年龄与性别排序返回参考人群清单
    public async Task<IReadOnlyList<PopulationOptionDto>> GetPopulationGroupsAsync(
        CancellationToken cancellationToken)
    {
        return await dbContext.PopulationGroups
            .AsNoTracking()
            .OrderBy(item => item.MinAgeMonths)
            .ThenBy(item => item.Sex)
            .Select(item => new PopulationOptionDto(
                item.Code,
                item.DisplayName,
                item.MinAgeMonths,
                item.MaxAgeMonths,
                item.Sex,
                item.LifeStage,
                item.Notes))
            .ToArrayAsync(cancellationToken);
    }

    //返回指定人群已录入的全部参考摄入量，不为缺项补入估算值
    public async Task<IReadOnlyList<ReferenceIntakeRowDto>> GetReferenceIntakesAsync(
        string populationCode,
        CancellationToken cancellationToken)
    {
        return await dbContext.NutrientReferences
            .AsNoTracking()
            .Where(item => item.PopulationGroup.Code == populationCode && item.Nutrient.IsPublished)
            .OrderBy(item => item.Nutrient.DisplayOrder)
            .ThenBy(item => item.Type)
            .Select(item => new ReferenceIntakeRowDto(
                item.Nutrient.Slug,
                item.Nutrient.Name,
                item.Nutrient.Group.ToString(),
                item.Type,
                item.Amount,
                item.Unit,
                item.PopulationGroup.Code,
                item.PopulationGroup.DisplayName,
                item.SourceName,
                item.SourceUrl,
                item.StandardVersion,
                item.Notes))
            .ToArrayAsync(cancellationToken);
    }

    //统一字母大小写、全角字符及维生素英文别名，便于中英文混合搜索
    private static string NormalizeKeyword(string value)
    {
        var builder = new StringBuilder(value.Length);
        foreach (var character in value.Normalize(NormalizationForm.FormKC))
        {
            if (char.IsWhiteSpace(character) || char.IsPunctuation(character) || char.IsSymbol(character))
                continue;

            builder.Append(char.ToLower(character, CultureInfo.InvariantCulture));
        }

        var normalized = builder.ToString();
        if (normalized.StartsWith("vitamin", StringComparison.Ordinal))
            normalized = "维生素" + normalized["vitamin".Length..];
        else if (normalized.Length > 1 && normalized[0] == 'b' && char.IsDigit(normalized[1]))
            normalized = "维生素" + normalized;

        return normalized;
    }
}