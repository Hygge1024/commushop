package org.lt.commushop.domain.vo;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class UserStatisticsVO {
    // 用户总数
    private Integer totalUsers;
    
    // 今日新增用户数
    private Integer todayNewUsers;
    
    // 活跃用户数（近14天有订单的用户）
    private Integer activeUsers;
    
    // 地址完善率
    private Double addressCompletionRate;
    
    // 性别比例
    private GenderRatio genderRatio;
    
    // 近5日用户增长趋势 [日期: 用户数]
    private List<DailyUserGrowth> userGrowthTrend;
    
    @Data
    public static class DailyUserGrowth {
        private LocalDateTime date;
        private Integer count;
    }
    
    @Data
    public static class GenderRatio {
        // 男性用户数量
        private Integer maleCount;
        // 女性用户数量
        private Integer femaleCount;
        // 男性比例
        private Double maleRatio;
        // 女性比例
        private Double femaleRatio;
    }
}
