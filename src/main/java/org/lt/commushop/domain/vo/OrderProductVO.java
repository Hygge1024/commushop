package org.lt.commushop.domain.vo;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;
import org.lt.commushop.domain.entity.Product;

@Data
@ApiModel(value = "OrderProductVO对象", description = "订单商品详情视图对象")
public class OrderProductVO {
    @ApiModelProperty("订单商品ID")
    private Integer orderproductId;

    @ApiModelProperty("订单编号")
    private String orderCode;

    @ApiModelProperty("用户ID")
    private Integer userId;

    @ApiModelProperty("商品数量")
    private Integer amount;

    @ApiModelProperty("商品详情")
    private Product product;
}
