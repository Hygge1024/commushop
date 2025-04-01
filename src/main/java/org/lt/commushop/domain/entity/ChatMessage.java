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
 * 聊天消息实体类
 * </p>
 *
 * @author tao
 * @since 2025-04-01
 */
@Data
@EqualsAndHashCode(callSuper = false)
@Accessors(chain = true)
@TableName("ChatMessage")
@ApiModel(value="ChatMessage对象", description="聊天消息信息")
public class ChatMessage implements Serializable {

    private static final long serialVersionUID = 1L;

    @ApiModelProperty(value = "消息ID")
    @TableId(value = "msg_id", type = IdType.AUTO)
    private Long msgId;

    @ApiModelProperty(value = "聊天ID")
    private Long chatId;

    @ApiModelProperty(value = "发送者ID")
    private Long senderId;

    @ApiModelProperty(value = "接收者ID")
    private Long receiverId;

    @ApiModelProperty(value = "消息内容")
    private String msgContent;

    @ApiModelProperty(value = "消息类型")
    private Integer msgType;

    @ApiModelProperty(value = "发送时间")
    private LocalDateTime sendTime;

    @ApiModelProperty(value = "消息状态")
    private Integer msgStatus;
}
