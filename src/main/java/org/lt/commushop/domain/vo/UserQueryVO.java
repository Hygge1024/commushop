package org.lt.commushop.domain.vo;

import lombok.Data;
import org.lt.commushop.domain.entity.UserAddress;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class UserQueryVO {
    // 用户ID
    private Long userId;

    // 用户名
    private String username;

    // 姓名
    private String realName;

    // 手机号
    private String phone;

    // 邮箱
    private String email;

    // 性别
    private String gender;

    // 创建时间
    private LocalDateTime createdTime;

    // 状态
    private String status;

    // 角色
    private String role;

    // 角色描述
    private String roleDescription;

    // 地址列表
    private List<UserAddress> addresses;
}
