package org.lt.commushop.domain.Hander;

import lombok.Data;
import org.lt.commushop.domain.entity.Role;
import org.lt.commushop.domain.entity.User;
import org.lt.commushop.domain.entity.UserAddress;

import java.util.List;


@Data
public class UserRoleAddress {
    private User user;
    private Role role;
    private List<UserAddress> userAddresses;
}
