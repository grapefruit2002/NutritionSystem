namespace NutritionSystem.Domain.Enums;

//营养素之间吸收相互作用的方向
public enum AbsorptionDirection
{
    //促进吸收
    Enhances,

    //抑制吸收
    Inhibits,

    //吸收效果取决于具体条件（如剂量、搭配）
    DependsOnContext,

    //作用方向不明确
    Unclear
}
