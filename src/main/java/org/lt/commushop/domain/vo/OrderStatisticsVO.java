package org.lt.commushop.domain.vo;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@ApiModel(description = "订单统计信息")
public class OrderStatisticsVO {
    @ApiModelProperty("总订单数")
    private Long totalOrders;

    @ApiModelProperty("总金额")
    private BigDecimal totalAmount;

    @ApiModelProperty("下单用户数")
    private Long uniqueUsers;

    @ApiModelProperty("订单趋势-每日订单数")
    private Map<String, Long> dailyOrderCounts;

    @ApiModelProperty("订单趋势-每日订单金额")
    private Map<String, BigDecimal> dailyOrderAmounts;

    @ApiModelProperty("订单状态分布")
    private Map<Integer, Long> orderStatusCounts;
}
