using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NutritionSystem.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddMealLogs : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "MealLogs",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    OwnerKey = table.Column<string>(type: "TEXT", maxLength: 80, nullable: false),
                    LogDate = table.Column<DateOnly>(type: "TEXT", nullable: false),
                    MealType = table.Column<string>(type: "TEXT", maxLength: 24, nullable: false),
                    Note = table.Column<string>(type: "TEXT", maxLength: 400, nullable: true),
                    CreatedAtUtc = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MealLogs", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "MealLogItems",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    MealLogId = table.Column<int>(type: "INTEGER", nullable: false),
                    FoodSlug = table.Column<string>(type: "TEXT", maxLength: 120, nullable: false),
                    FoodName = table.Column<string>(type: "TEXT", maxLength: 120, nullable: false),
                    Grams = table.Column<double>(type: "REAL", nullable: false),
                    EnergyKcal = table.Column<double>(type: "REAL", nullable: false),
                    NutrientSnapshotJson = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MealLogItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MealLogItems_MealLogs_MealLogId",
                        column: x => x.MealLogId,
                        principalTable: "MealLogs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_MealLogItems_MealLogId",
                table: "MealLogItems",
                column: "MealLogId");

            migrationBuilder.CreateIndex(
                name: "IX_MealLogs_OwnerKey_LogDate",
                table: "MealLogs",
                columns: new[] { "OwnerKey", "LogDate" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "MealLogItems");

            migrationBuilder.DropTable(
                name: "MealLogs");
        }
    }
}
