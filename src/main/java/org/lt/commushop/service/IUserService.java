package org.lt.commushop.service;

import org.lt.commushop.domain.entity.User;
import com.baomidou.mybatisplus.extension.service.IService;

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

}
