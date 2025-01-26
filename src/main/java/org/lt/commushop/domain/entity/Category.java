package org.lt.commushop.domain.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.experimental.Accessors;
import org.apache.ibatis.type.LocalDateTimeTypeHandler;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * <p>
 * 类别实体类
 * </p>
 *
 * @author tao
 * @since 2025-01-21
 */
@Data
@EqualsAndHashCode(callSuper = false)
@Accessors(chain = true)
@TableName("category")
@ApiModel(value="Category对象", description="商品类别")
public class Category implements Serializable {

    private static final long serialVersionUID = 1L;

    @TableId(value = "category_id", type = IdType.AUTO)
    @ApiModelProperty(value = "类别ID")
    private Integer categoryId;

    @ApiModelProperty(value = "类别名称")
    private String categoryName;

    private Boolean isActive;

    @TableField(typeHandler = LocalDateTimeTypeHandler.class)
    private LocalDateTime createdAt;

}
