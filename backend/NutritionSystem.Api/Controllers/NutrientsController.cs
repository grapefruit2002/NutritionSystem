using Microsoft.AspNetCore.Mvc;
using NutritionSystem.Application.Contracts;
using NutritionSystem.Application.Services;

namespace NutritionSystem.Api.Controllers;

//营养素相关查询接口
[ApiController]
[Route("api/nutrients")]
public sealed class NutrientsController(INutritionQueryService nutritionQueryService) : ControllerBase
{
    //按分类与关键字查询营养素列表
    [HttpGet]
    [ProducesResponseType<IReadOnlyList<NutrientSummaryDto>>(StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<NutrientSummaryDto>>> GetNutrients(
        [FromQuery] string? group,
        [FromQuery] string? keyword,
        CancellationToken cancellationToken)
    {
        var result = await nutritionQueryService.GetNutrientsAsync(group, keyword, cancellationToken);
        return Ok(result);
    }

    //按唯一标识获取营养素详情，可附带指定人群以展示对应参考摄入量
    [HttpGet("{slug}")]
    [ProducesResponseType<NutrientDetailDto>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<NutrientDetailDto>> GetNutrient(
        string slug,
        [FromQuery] string? populationCode,
        CancellationToken cancellationToken)
    {
        var result = await nutritionQueryService.GetNutrientBySlugAsync(slug, populationCode, cancellationToken);
        return result is null ? NotFound() : Ok(result);
    }
}
