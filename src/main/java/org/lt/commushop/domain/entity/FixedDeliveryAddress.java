package org.lt.commushop.domain.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.experimental.Accessors;

import java.io.Serializable;

@Data
@EqualsAndHashCode(callSuper = false)
@TableName("fixed_delivery_address")
public class FixedDeliveryAddress  implements Serializable {
    private static final long serialVersionUID = 1L;
    @TableId(value = "location_id",type = IdType.AUTO)
    private Integer locationId;
    private String fixedAddress;

}
