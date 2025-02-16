package org.lt.commushop.domain.vo;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;
import org.lt.commushop.domain.entity.GroupBuyingActivity;
import org.lt.commushop.domain.entity.GroupBuyingOrder;
import org.lt.commushop.domain.entity.PaymentRecord;

@Data
@ApiModel(description = "支付记录查询返回对象")
public class PaymentQueryVO {
    @ApiModelProperty("支付记录信息")
    private PaymentRecord payment;

    @ApiModelProperty("订单信息")
    private GroupBuyingOrder order;

    @ApiModelProperty("活动信息")
    private GroupBuyingActivity activity;
}
