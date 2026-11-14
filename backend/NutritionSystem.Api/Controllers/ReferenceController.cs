using Microsoft.AspNetCore.Mvc;
using NutritionSystem.Application.Contracts;
using NutritionSystem.Application.Services;

namespace NutritionSystem.Api.Controllers;

//参考摄入量查询接口
[Route("api/reference")]
public sealed class ReferenceController(INutritionQueryService nutritionQueryService) : ControllerBase
{
    //获取可供选择的人群选项列表
    [HttpGet("populations")]
    [ProducesResponseType<IReadOnlyList<PopulationOptionDto>>(StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<PopulationOptionDto>>> GetPopulationGroups(
        CancellationToken cancellationToken)
    {
        return Ok(await nutritionQueryService.GetPopulationGroupsAsync(cancellationToken));
    }

    //获取指定人群的参考摄入量明细
    [HttpGet("intakes")]
    [ProducesResponseType<IReadOnlyList<ReferenceIntakeRowDto>>(StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<ReferenceIntakeRowDto>>> GetReferenceIntakes(
        [FromQuery] string populationCode,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(populationCode))
            return BadRequest(new { message = "请提供 populationCode" });

        return Ok(await nutritionQueryService.GetReferenceIntakesAsync(populationCode, cancellationToken));
    }
}
