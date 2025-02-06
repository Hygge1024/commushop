package org.lt.commushop.domain.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.experimental.Accessors;

/**
 * <p>
 * 活动包含商品关联表
 * </p>
 *
 * @author tao
 * @since 2025-01-21
 */
@Data
@EqualsAndHashCode(callSuper = false)
@Accessors(chain = true)
@TableName("activity_include_product")
@ApiModel(value="ActivityIncludeProduct对象", description="活动包含商品关联表")
public class ActivityIncludeProduct {
    private static final long serialVersionUID = 1L;

    @ApiModelProperty(value = "关联ID")
    @TableId(value = "activity_product_id", type = IdType.AUTO)
    private Integer activityProductId;

    @ApiModelProperty(value = "活动编码")
    private String pActivityCode;

    @ApiModelProperty(value = "商品ID")
    private Integer productId;
}
