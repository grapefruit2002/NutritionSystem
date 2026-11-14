namespace NutritionSystem.Domain.Enums;

//参考摄入量的类型，对应居民膳食营养素参考摄入量（DRIs）中的各类指标
public enum ReferenceType
{
    //平均需要量（Estimated Average Requirement）
    EAR,

    //推荐摄入量（Recommended Nutrient Intake）
    RNI,

    //适宜摄入量（Adequate Intake）
    AI,

    //可耐受最高摄入量（Tolerable Upper Intake Level）
    UL,

    //建议摄入量（Proposed Intake）
    PI,

    //宏量营养素可接受范围（Acceptable Macronutrient Distribution Range）
    AMDR
}
