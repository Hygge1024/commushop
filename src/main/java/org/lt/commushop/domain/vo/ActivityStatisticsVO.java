package org.lt.commushop.domain.vo;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
@ApiModel(value = "活动统计数据")
public class ActivityStatisticsVO {
    @ApiModelProperty(value = "总活动数")
    private Long totalActivities;

    @ApiModelProperty(value = "总参与人数")
    private Long totalParticipants;

    @ApiModelProperty(value = "转化率")
    private String conversionRate;

    @ApiModelProperty(value = "每日统计数据")
    private List<DailyStatistics> dailyStatistics;

    @Data
    public static class DailyStatistics {
        @ApiModelProperty(value = "星期几（1-7代表周一到周日）")
        private Integer dayOfWeek;

        @ApiModelProperty(value = "参与人数")
        private Long participants;

        @ApiModelProperty(value = "销售额")
        private BigDecimal salesAmount;
    }
}
