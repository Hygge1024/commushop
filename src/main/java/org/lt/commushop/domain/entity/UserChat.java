package org.lt.commushop.domain.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import java.io.Serializable;
import java.time.LocalDateTime;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.experimental.Accessors;

/**
 * <p>
 * 用户聊天会话实体类
 * </p>
 *
 * @author tao
 * @since 2025-04-01
 */
@Data
@EqualsAndHashCode(callSuper = false)
@Accessors(chain = true)
@TableName("UserChat")
@ApiModel(value="UserChat对象", description="用户聊天会话信息")
public class UserChat implements Serializable {

    private static final long serialVersionUID = 1L;

    @ApiModelProperty(value = "聊天ID")
    @TableId(value = "chat_id", type = IdType.AUTO)
    private Long chatId;

    @ApiModelProperty(value = "用户ID")
    private Long userId;

    @ApiModelProperty(value = "聊天对象ID")
    private Long partnerId;

    @ApiModelProperty(value = "最后消息时间")
    private LocalDateTime lastMsgTime;

    @ApiModelProperty(value = "是否删除")
    private Integer isDeleted;
}
