package org.lt.commushop.service;

import org.lt.commushop.domain.Hander.UserRegistrationDTO;
import org.lt.commushop.domain.Hander.UserRoleAddress;
import org.lt.commushop.domain.entity.User;
import com.baomidou.mybatisplus.extension.service.IService;
import org.lt.commushop.domain.entity.UserAddress;

import java.util.List;

/**
 * <p>
 * 服务类
 * </p>
 *
 * @author tao
 * @since 2025-01-21
 */
public interface IUserService extends IService<User> {

    User getUserList(String username);

    String[] getPermissionList(int userid);

    List<User> getUserInfo();

    User getUserName(String username);

    List<UserRoleAddress> getAllUserRoleAddresses();

    UserRoleAddress getUserDetails(String username);

    User registerUser(UserRegistrationDTO userRegistrationDTO);

    User addAddress(String username, UserAddress userAddress);

    User deleteAddress(String username, Integer addressId);
    User updateUserInfo(UserRegistrationDTO userRegistrationDTO);
}
