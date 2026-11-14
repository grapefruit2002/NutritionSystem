using Microsoft.AspNetCore.Mvc;
using NutritionSystem.Application.Contracts;
using NutritionSystem.Application.Services;

namespace NutritionSystem.Api.Controllers;

//饮食记录接口：保存、查询与删除某一餐
[ApiController]
[Route("api/meal-logs")]
public sealed class MealLogsController(IMealLogService mealLogService) : ControllerBase
{
    //单用户模式默认 local；预留 X-Owner-Key 供未来多用户使用
    private string OwnerKey =>
        Request.Headers.TryGetValue("X-Owner-Key", out var key) && !string.IsNullOrWhiteSpace(key)
            ? key.ToString()
            : "local";

    //按日期区间获取饮食记录
    [HttpGet]
    [ProducesResponseType<IReadOnlyList<MealLogDto>>(StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<MealLogDto>>> GetMealLogs(
        [FromQuery] DateOnly? from,
        [FromQuery] DateOnly? to,
        CancellationToken cancellationToken)
    {
        return Ok(await mealLogService.GetMealLogsAsync(from, to, OwnerKey, cancellationToken));
    }

    //保存一餐
    [HttpPost]
    [ProducesResponseType<MealLogDto>(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<MealLogDto>> SaveMealLog(
        [FromBody] SaveMealLogRequestDto request,
        CancellationToken cancellationToken)
    {
        if (request.Items is null || request.Items.Count == 0)
        {
            return BadRequest("这一餐还没有食物。");
        }

        var result = await mealLogService.SaveMealLogAsync(request, OwnerKey, cancellationToken);
        return CreatedAtAction(nameof(GetMealLogs), null, result);
    }

    //删除一条饮食记录
    [HttpDelete("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteMealLog(int id, CancellationToken cancellationToken)
    {
        var deleted = await mealLogService.DeleteMealLogAsync(id, OwnerKey, cancellationToken);
        return deleted ? NoContent() : NotFound();
    }
}
