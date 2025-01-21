package org.lt.commushop.service;

import org.lt.commushop.domain.entity.Permission;
import org.lt.commushop.domain.entity.User;
import com.baomidou.mybatisplus.extension.service.IService;

import java.util.List;

/**
 * <p>
 *  服务类
 * </p>
 *
 * @author tao
 * @since 2025-01-21
 */
public interface IUserService extends IService<User> {

    User getUserList(String username);
    String[] getPermissionList(int userid);

}
