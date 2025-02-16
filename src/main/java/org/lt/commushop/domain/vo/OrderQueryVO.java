package org.lt.commushop.domain.vo;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;
import org.lt.commushop.domain.entity.GroupBuyingActivity;
import org.lt.commushop.domain.entity.GroupBuyingOrder;
import org.lt.commushop.domain.entity.Product;

import java.util.List;

@Data
@ApiModel(description = "订单查询返回对象")
public class OrderQueryVO {
    @ApiModelProperty("订单信息")
    private GroupBuyingOrder order;

    @ApiModelProperty("活动信息")
    private GroupBuyingActivity activity;

    @ApiModelProperty("活动包含的商品列表")
    private List<Product> products;
}
