package org.lt.commushop.domain.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import io.swagger.annotations.ApiModel;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.experimental.Accessors;

import java.io.Serializable;
import java.time.LocalDateTime;

@Data
@EqualsAndHashCode
@Accessors(chain = true)
@TableName("order_all")
@ApiModel(value = "Order对象",description = "统一订单对象")
public class Order implements Serializable {
    private static final long serialVersionUID = 1L;
    @TableId(value = "order_id", type = IdType.AUTO)
    private Integer orderId;
    private String orderCode;
    private Integer userId;
    private Double totalMoney;
    private Integer orderStatus;
    private String address;
    private Integer leaderId;
    private Integer isDeleted;
    private LocalDateTime createTime;
}
