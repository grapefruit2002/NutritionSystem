using System.Reflection;
using System.Text;
using Microsoft.EntityFrameworkCore;

namespace NutritionSystem.Infrastructure.Persistence;

//将现有数据库导出的只读数据快照写入新建数据库
public sealed class NutritionDataSeeder(NutritionDbContext db)
{
    //以 INSERT OR IGNORE 写入基础营养资料，不覆盖数据库中已有记录
    public async Task SeedAsync(CancellationToken cancellationToken = default)
    {
        var assembly = typeof(NutritionDataSeeder).Assembly;
        var resourceName = assembly.GetManifestResourceNames()
            .Single(name => name.EndsWith("NutritionSeedData.sql", StringComparison.Ordinal));

        await using var stream = assembly.GetManifestResourceStream(resourceName)
            ?? throw new InvalidOperationException("找不到营养数据初始化资源。");
        using var reader = new StreamReader(stream, Encoding.UTF8);
        var sql = await reader.ReadToEndAsync(cancellationToken);

        if (!string.IsNullOrWhiteSpace(sql))
            await db.Database.ExecuteSqlRawAsync(sql, cancellationToken);
    }
}