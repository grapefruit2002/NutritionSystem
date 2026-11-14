using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore;
using NutritionSystem.Application.Services;
using NutritionSystem.Infrastructure.Persistence;
using NutritionSystem.Infrastructure.Services;
using Swashbuckle.AspNetCore.SwaggerUI;

var builder = WebApplication.CreateBuilder(args);

var configuredDatabasePath = builder.Configuration["Nutrition:DatabasePath"];
var databasePath = Path.IsPathRooted(configuredDatabasePath ?? string.Empty)
    ? configuredDatabasePath!
    : Path.GetFullPath(Path.Combine(
        builder.Environment.ContentRootPath,
        configuredDatabasePath ?? Path.Combine("..", "..", "data.db")));
Directory.CreateDirectory(Path.GetDirectoryName(databasePath)!);

builder.Services.AddDbContext<NutritionDbContext>(options =>
    options.UseSqlite($"Data Source={databasePath}"));
builder.Services.AddScoped<INutritionQueryService, NutritionQueryService>();
builder.Services.AddScoped<IMealLogService, MealLogService>();
builder.Services.AddScoped<NutritionDataSeeder>();

var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
    ?? ["http://localhost:5173", "http://127.0.0.1:5173"];
builder.Services.AddCors(options => options.AddDefaultPolicy(policy =>
    policy.WithOrigins(allowedOrigins).AllowAnyHeader().AllowAnyMethod()));

builder.Services.AddControllers().AddJsonOptions(options =>
{
    options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
    options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter(JsonNamingPolicy.CamelCase));
});
builder.Services.AddOpenApi();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/openapi/v1.json", "NutritionSystem API v1");
        options.RoutePrefix = "swagger";
    });
}

app.UseCors();
if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}
app.MapGet("/health", () => Results.Ok(new { status = "ok", service = "nutrition-api" }))
    .WithName("HealthCheck");
app.MapControllers();

await using (var scope = app.Services.CreateAsyncScope())
{
    var database = scope.ServiceProvider.GetRequiredService<NutritionDbContext>();
    await database.Database.MigrateAsync();

    var seeder = scope.ServiceProvider.GetRequiredService<NutritionDataSeeder>();
    await seeder.SeedAsync();
}

app.Run();
