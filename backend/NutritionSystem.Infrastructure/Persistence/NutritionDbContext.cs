using Microsoft.EntityFrameworkCore;
using NutritionSystem.Domain.Entities;

namespace NutritionSystem.Infrastructure.Persistence;

//应用 SQLite 数据上下文，集中配置实体约束、索引和关系
public sealed class NutritionDbContext(DbContextOptions<NutritionDbContext> options) : DbContext(options)
{
    //营养素主档
    public DbSet<Nutrient> Nutrients => Set<Nutrient>();

    //营养参考人群
    public DbSet<PopulationGroup> PopulationGroups => Set<PopulationGroup>();

    //按人群区分的膳食参考摄入量
    public DbSet<NutrientReference> NutrientReferences => Set<NutrientReference>();

    //食物主档
    public DbSet<Food> Foods => Set<Food>();

    //食物营养素含量
    public DbSet<FoodNutrient> FoodNutrients => Set<FoodNutrient>();

    //带来源的吸收与搭配资料
    public DbSet<AbsorptionEvidence> AbsorptionEvidence => Set<AbsorptionEvidence>();

    //饮食记录（某天某一餐）
    public DbSet<MealLog> MealLogs => Set<MealLog>();

    //饮食记录中的食物条目
    public DbSet<MealLogItem> MealLogItems => Set<MealLogItem>();

    //配置唯一索引、枚举存储方式及外键删除规则
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Nutrient>(entity =>
        {
            entity.HasIndex(item => item.Slug).IsUnique();
            entity.Property(item => item.Slug).HasMaxLength(120).IsRequired();
            entity.Property(item => item.Name).HasMaxLength(80).IsRequired();
            entity.Property(item => item.CanonicalUnit).HasMaxLength(24).IsRequired();
            entity.Property(item => item.Group).HasConversion<string>().HasMaxLength(32);
            entity.Property(item => item.Summary).HasMaxLength(320).IsRequired();
        });

        modelBuilder.Entity<PopulationGroup>(entity =>
        {
            entity.HasIndex(item => item.Code).IsUnique();
            entity.Property(item => item.Code).HasMaxLength(80).IsRequired();
            entity.Property(item => item.DisplayName).HasMaxLength(120).IsRequired();
            entity.Property(item => item.Sex).HasConversion<string>().HasMaxLength(24);
            entity.Property(item => item.LifeStage).HasMaxLength(80).IsRequired();
        });

        modelBuilder.Entity<NutrientReference>(entity =>
        {
            entity.HasIndex(item => new { item.NutrientId, item.PopulationGroupId, item.Type, item.StandardVersion }).IsUnique();
            entity.Property(item => item.Type).HasConversion<string>().HasMaxLength(24);
            entity.Property(item => item.Amount).HasColumnType("REAL");
            entity.Property(item => item.Unit).HasMaxLength(24).IsRequired();
            entity.Property(item => item.SourceName).HasMaxLength(240).IsRequired();
            entity.Property(item => item.StandardVersion).HasMaxLength(80).IsRequired();
            entity.HasOne(item => item.Nutrient)
                .WithMany(item => item.References)
                .HasForeignKey(item => item.NutrientId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(item => item.PopulationGroup)
                .WithMany(item => item.References)
                .HasForeignKey(item => item.PopulationGroupId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Food>(entity =>
        {
            entity.HasIndex(item => item.Slug).IsUnique();
            entity.Property(item => item.Slug).HasMaxLength(120).IsRequired();
            entity.Property(item => item.Name).HasMaxLength(120).IsRequired();
        });

        modelBuilder.Entity<FoodNutrient>(entity =>
        {
            entity.HasIndex(item => new { item.FoodId, item.NutrientId, item.PreparationState, item.SourceName }).IsUnique();
            entity.Property(item => item.AmountPer100g).HasColumnType("REAL");
            entity.Property(item => item.Unit).HasMaxLength(24).IsRequired();
            entity.Property(item => item.PreparationState).HasMaxLength(80).IsRequired();
            entity.Property(item => item.SourceName).HasMaxLength(240).IsRequired();
            entity.HasOne(item => item.Food).WithMany(item => item.Nutrients)
                .HasForeignKey(item => item.FoodId).OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(item => item.Nutrient).WithMany(item => item.FoodNutrients)
                .HasForeignKey(item => item.NutrientId).OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<AbsorptionEvidence>(entity =>
        {
            entity.Property(item => item.Direction).HasConversion<string>().HasMaxLength(32);
            entity.Property(item => item.Title).HasMaxLength(180).IsRequired();
            entity.Property(item => item.SourceName).HasMaxLength(240).IsRequired();
            entity.Property(item => item.SourceUrl).HasMaxLength(1000).IsRequired();
            entity.HasOne(item => item.Nutrient).WithMany(item => item.AbsorptionEvidence)
                .HasForeignKey(item => item.NutrientId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<MealLog>(entity =>
        {
            entity.HasIndex(item => new { item.OwnerKey, item.LogDate });
            entity.Property(item => item.OwnerKey).HasMaxLength(80).IsRequired();
            entity.Property(item => item.MealType).HasConversion<string>().HasMaxLength(24);
            entity.Property(item => item.Note).HasMaxLength(400);
            entity.HasMany(item => item.Items).WithOne(item => item.MealLog)
                .HasForeignKey(item => item.MealLogId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<MealLogItem>(entity =>
        {
            entity.HasIndex(item => item.MealLogId);
            entity.Property(item => item.FoodSlug).HasMaxLength(120).IsRequired();
            entity.Property(item => item.FoodName).HasMaxLength(120).IsRequired();
            entity.Property(item => item.Grams).HasColumnType("REAL");
            entity.Property(item => item.EnergyKcal).HasColumnType("REAL");
            entity.Property(item => item.NutrientSnapshotJson).IsRequired();
        });
    }
}