package org.lt.commushop.domain.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.experimental.Accessors;

import java.io.Serializable;
import java.time.LocalDateTime;
//已弃用
@Data
@EqualsAndHashCode(callSuper = false)
@Accessors(chain = true)
@TableName("product_order")
@ApiModel(value = "商品订单", description = "以商品为依据下单产品")
public class ProductOrder implements Serializable {
    private static long serialVersionUID = 1L;
    @TableId(value = "porder_id",type = IdType.AUTO)
    @ApiModelProperty(value = "订单ID")
    private Integer porderId;
    private Integer userId;
    private Integer productId;
    private Integer orderStatus;
    private double totalMoney;
    private LocalDateTime createTime;
    private Integer amount;
    private String address;
    private Integer leaderId;
    private Integer isDeleted;


}
