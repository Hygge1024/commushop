package org.lt.commushop.dto;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@ApiModel(value = "更新团购活动请求")
public class UpdateGroupBuyingActivityDTO {
    @ApiModelProperty(value = "活动ID")
    private Integer activityId;

    @ApiModelProperty(value = "活动编码")
    private String activityCode;

    @ApiModelProperty(value = "活动名称")
    private String activityName;

    @ApiModelProperty(value = "活动开始时间")
    private LocalDateTime activityStartTime;

    @ApiModelProperty(value = "活动结束时间")
    private LocalDateTime activityEndTime;

    @ApiModelProperty(value = "最小成团人数")
    private Integer minGroupSize;

    @ApiModelProperty(value = "最大成团人数")
    private Integer maxGroupSize;

    @ApiModelProperty(value = "商品ID列表")
    private List<Integer> productIds;
}
