using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NutritionSystem.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class InitialNutritionSchema : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Foods",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Slug = table.Column<string>(type: "TEXT", maxLength: 120, nullable: false),
                    Name = table.Column<string>(type: "TEXT", maxLength: 120, nullable: false),
                    Category = table.Column<string>(type: "TEXT", nullable: true),
                    Description = table.Column<string>(type: "TEXT", nullable: true),
                    IsPublished = table.Column<bool>(type: "INTEGER", nullable: false),
                    SourceName = table.Column<string>(type: "TEXT", nullable: true),
                    SourceUrl = table.Column<string>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Foods", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Nutrients",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Slug = table.Column<string>(type: "TEXT", maxLength: 120, nullable: false),
                    Name = table.Column<string>(type: "TEXT", maxLength: 80, nullable: false),
                    EnglishName = table.Column<string>(type: "TEXT", nullable: true),
                    Group = table.Column<string>(type: "TEXT", maxLength: 32, nullable: false),
                    Subgroup = table.Column<string>(type: "TEXT", nullable: true),
                    CanonicalUnit = table.Column<string>(type: "TEXT", maxLength: 24, nullable: false),
                    Summary = table.Column<string>(type: "TEXT", maxLength: 320, nullable: false),
                    Description = table.Column<string>(type: "TEXT", nullable: true),
                    IsFatSoluble = table.Column<bool>(type: "INTEGER", nullable: true),
                    DisplayOrder = table.Column<int>(type: "INTEGER", nullable: false),
                    IsPublished = table.Column<bool>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Nutrients", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "PopulationGroups",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Code = table.Column<string>(type: "TEXT", maxLength: 80, nullable: false),
                    DisplayName = table.Column<string>(type: "TEXT", maxLength: 120, nullable: false),
                    MinAgeMonths = table.Column<int>(type: "INTEGER", nullable: true),
                    MaxAgeMonths = table.Column<int>(type: "INTEGER", nullable: true),
                    Sex = table.Column<string>(type: "TEXT", maxLength: 24, nullable: false),
                    LifeStage = table.Column<string>(type: "TEXT", maxLength: 80, nullable: false),
                    Notes = table.Column<string>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PopulationGroups", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "AbsorptionEvidence",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    NutrientId = table.Column<int>(type: "INTEGER", nullable: false),
                    Title = table.Column<string>(type: "TEXT", maxLength: 180, nullable: false),
                    Summary = table.Column<string>(type: "TEXT", nullable: false),
                    Direction = table.Column<string>(type: "TEXT", maxLength: 32, nullable: false),
                    Applicability = table.Column<string>(type: "TEXT", nullable: true),
                    EvidenceLevel = table.Column<string>(type: "TEXT", nullable: true),
                    SourceName = table.Column<string>(type: "TEXT", maxLength: 240, nullable: false),
                    SourceUrl = table.Column<string>(type: "TEXT", maxLength: 1000, nullable: false),
                    ReviewedAtUtc = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AbsorptionEvidence", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AbsorptionEvidence_Nutrients_NutrientId",
                        column: x => x.NutrientId,
                        principalTable: "Nutrients",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "FoodNutrients",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    FoodId = table.Column<int>(type: "INTEGER", nullable: false),
                    NutrientId = table.Column<int>(type: "INTEGER", nullable: false),
                    AmountPer100g = table.Column<double>(type: "REAL", nullable: false),
                    Unit = table.Column<string>(type: "TEXT", maxLength: 24, nullable: false),
                    PreparationState = table.Column<string>(type: "TEXT", maxLength: 80, nullable: false),
                    SourceName = table.Column<string>(type: "TEXT", maxLength: 240, nullable: false),
                    SourceUrl = table.Column<string>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FoodNutrients", x => x.Id);
                    table.ForeignKey(
                        name: "FK_FoodNutrients_Foods_FoodId",
                        column: x => x.FoodId,
                        principalTable: "Foods",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_FoodNutrients_Nutrients_NutrientId",
                        column: x => x.NutrientId,
                        principalTable: "Nutrients",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "NutrientReferences",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    NutrientId = table.Column<int>(type: "INTEGER", nullable: false),
                    PopulationGroupId = table.Column<int>(type: "INTEGER", nullable: false),
                    Type = table.Column<string>(type: "TEXT", maxLength: 24, nullable: false),
                    Amount = table.Column<double>(type: "REAL", nullable: false),
                    Unit = table.Column<string>(type: "TEXT", maxLength: 24, nullable: false),
                    SourceName = table.Column<string>(type: "TEXT", maxLength: 240, nullable: false),
                    SourceUrl = table.Column<string>(type: "TEXT", nullable: true),
                    StandardVersion = table.Column<string>(type: "TEXT", maxLength: 80, nullable: false),
                    Notes = table.Column<string>(type: "TEXT", nullable: true),
                    UpdatedAtUtc = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_NutrientReferences", x => x.Id);
                    table.ForeignKey(
                        name: "FK_NutrientReferences_Nutrients_NutrientId",
                        column: x => x.NutrientId,
                        principalTable: "Nutrients",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_NutrientReferences_PopulationGroups_PopulationGroupId",
                        column: x => x.PopulationGroupId,
                        principalTable: "PopulationGroups",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AbsorptionEvidence_NutrientId",
                table: "AbsorptionEvidence",
                column: "NutrientId");

            migrationBuilder.CreateIndex(
                name: "IX_FoodNutrients_FoodId_NutrientId_PreparationState_SourceName",
                table: "FoodNutrients",
                columns: new[] { "FoodId", "NutrientId", "PreparationState", "SourceName" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_FoodNutrients_NutrientId",
                table: "FoodNutrients",
                column: "NutrientId");

            migrationBuilder.CreateIndex(
                name: "IX_Foods_Slug",
                table: "Foods",
                column: "Slug",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_NutrientReferences_NutrientId_PopulationGroupId_Type_StandardVersion",
                table: "NutrientReferences",
                columns: new[] { "NutrientId", "PopulationGroupId", "Type", "StandardVersion" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_NutrientReferences_PopulationGroupId",
                table: "NutrientReferences",
                column: "PopulationGroupId");

            migrationBuilder.CreateIndex(
                name: "IX_Nutrients_Slug",
                table: "Nutrients",
                column: "Slug",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PopulationGroups_Code",
                table: "PopulationGroups",
                column: "Code",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AbsorptionEvidence");

            migrationBuilder.DropTable(
                name: "FoodNutrients");

            migrationBuilder.DropTable(
                name: "NutrientReferences");

            migrationBuilder.DropTable(
                name: "Foods");

            migrationBuilder.DropTable(
                name: "Nutrients");

            migrationBuilder.DropTable(
                name: "PopulationGroups");
        }
    }
}
