package org.lt.commushop.service;

import org.lt.commushop.domain.Hander.UserRegistrationDTO;
import org.lt.commushop.domain.Hander.UserRoleAddress;
import org.lt.commushop.domain.entity.User;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.service.IService;
import org.lt.commushop.domain.entity.UserAddress;
import org.lt.commushop.domain.vo.UserQueryVO;
import org.lt.commushop.domain.vo.UserStatisticsVO;

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

    /**
     * 分页查询用户信息
     * @param current 当前页
     * @param size 每页大小
     * @param userId 用户ID
     * @param username 用户名
     * @param phone 手机号
     * @return 用户分页数据
     */
    IPage<UserQueryVO> getUserPage(Integer current, Integer size, 
            Long userId, String username, String phone);

    /**
     * 获取用户统计信息
     * @return 用户统计信息
     */
    UserStatisticsVO getUserStatistics();
}
