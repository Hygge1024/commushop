package org.lt.commushop.domain.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import io.swagger.annotations.ApiModel;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.experimental.Accessors;

@Data
@EqualsAndHashCode
@Accessors(chain = true)
@TableName("order_products")
@ApiModel(value = "order_products对象",description = "订单于商品的关联")
public class OrderProducts {
    private static final long serialVersionUID = 1L;
    @TableId(value = "orderproduct_id",type = IdType.AUTO)
    private Integer orderproductId;
    private String orderCode;
    private Integer productId;
    private Integer userId;
    private int amount;
}
