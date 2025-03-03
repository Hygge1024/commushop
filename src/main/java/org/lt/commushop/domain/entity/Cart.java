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

/**
 * 实体类
 */
@Data
@EqualsAndHashCode(callSuper = false)
@Accessors(chain = true)
@TableName("cart")
@ApiModel(value = "Cart对象", description = "购物车")
public class Cart  implements Serializable {
    private static long serialVersionUID = 1L;
    @TableId(value = "cart_id", type = IdType.AUTO)
    @ApiModelProperty(value = "购物车ID")
    private Integer cartId;
    private Integer userId;
    private Integer productId;
    private Integer amount;
    private LocalDateTime addTime;


}
