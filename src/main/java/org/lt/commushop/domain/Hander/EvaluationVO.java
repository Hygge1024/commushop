package org.lt.commushop.domain.Hander;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 评价信息VO
 */
@Data
@ApiModel(value = "EvaluationVO", description = "评价信息展示对象")
public class EvaluationVO {

    @ApiModelProperty("评价ID")
    private Integer evaluationId;

    @ApiModelProperty("订单ID")
    private Integer orderId;

    @ApiModelProperty("用户ID")
    private Integer userId;

    @ApiModelProperty("用户名")
    private String username;

    @ApiModelProperty("用户全名")
    private String fullname;

    @ApiModelProperty("商品ID")
    private Integer productId;

    @ApiModelProperty("商品名称")
    private String productName;

    @ApiModelProperty("商品图片")
    private String imageUrl;

    @ApiModelProperty("评价内容")
    private String evaluationContent;

    @ApiModelProperty("评分")
    private Integer evaluationScore;

    @ApiModelProperty("评价时间")
    private LocalDateTime evaluationTime;
}
