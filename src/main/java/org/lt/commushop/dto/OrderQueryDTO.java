package org.lt.commushop.dto;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDateTime;

@Data
@ApiModel(description = "订单查询请求对象")
public class OrderQueryDTO {
    @ApiModelProperty("订单ID")
    private String orderId;

    @ApiModelProperty("活动名称")
    private String activityName;

    @ApiModelProperty("用户ID")
    private String userId;

    @ApiModelProperty("订单状态：0-待付款，1-已完成，2-已取消")
    private Integer orderStatus;

    @ApiModelProperty("开始时间")
    @DateTimeFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime startTime;

    @ApiModelProperty("结束时间")
    @DateTimeFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime endTime;
}
