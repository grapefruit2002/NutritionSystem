using Microsoft.AspNetCore.Mvc;
using NutritionSystem.Application.Contracts;
using NutritionSystem.Application.Services;

namespace NutritionSystem.Api.Controllers;

//食物相关查询接口
[ApiController]
[Route("api/foods")]
public sealed class FoodsController(INutritionQueryService nutritionQueryService) : ControllerBase
{


    //按关键字搜索食物列表
    [HttpGet]
    [ProducesResponseType<IReadOnlyList<FoodSummaryDto>>(StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<FoodSummaryDto>>> GetFoods(
        [FromQuery] string? keyword,
        CancellationToken cancellationToken)
    {
        var result = await nutritionQueryService.GetFoodsAsync(keyword, cancellationToken);
        return Ok(result);
    }

    //获取食物概览列表（含精简营养成分）
    [HttpGet("overview")]
    [ProducesResponseType<IReadOnlyList<FoodOverviewDto>>(StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<FoodOverviewDto>>> GetOverview(CancellationToken cancellationToken)
    {
        return Ok(await nutritionQueryService.GetFoodOverviewAsync(cancellationToken));
    }

    //按唯一标识获取食物详情
    [HttpGet("{slug}")]
    [ProducesResponseType<FoodDetailDto>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<FoodDetailDto>> GetFood(string slug, CancellationToken cancellationToken)
    {
        var result = await nutritionQueryService.GetFoodBySlugAsync(slug, cancellationToken);
        return result is null ? NotFound() : Ok(result);
    }
}
