package org.lt.commushop.domain.Hander;

import lombok.Data;

@Data
public class UserRegistrationDTO {
    private String username;
    private String password;
    private String phoneNumber;
    private String fullname;
    private String email;
    private Integer gender;
    private Integer roleId; // 角色ID
}
