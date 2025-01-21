package org.lt.commushop.service.impl;

import lombok.extern.slf4j.Slf4j;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.lt.commushop.domain.entity.Permission;
import org.lt.commushop.domain.entity.User;
import org.lt.commushop.mapper.UserMapper;
import org.lt.commushop.service.IUserService;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

/**
 * <p>
 *  服务实现类
 * </p>
 *
 * @author tao
 * @since 2025-01-21
 */
@Service
@Slf4j
public class UserServiceImpl extends ServiceImpl<UserMapper, User> implements IUserService {
    @Autowired
    UserMapper userMapper;


    //根据用户账号获取用户信息
    @Override
    public User getUserList(String username) {
        List<User> list = userMapper.getUserList(username);
        log.info("当前用户List为"+list);
        User user = null;
        if(list != null && list.size() == 1){
            user = list.get(0);
            log.info("当前用户为"+user);
        }
        if(user == null){
            log.info("当前username对应的用户为空");
            return null;
        }
        return user;
    }

    @Override
    public String[] getPermissionList(int userid) {
        List<Permission> permissionList = userMapper.getPermissionList(userid);
        List<String> permissions = new ArrayList<>();
        permissionList.forEach(c -> permissions.add(c.getPermissionCode()));
        //将权限code转换成String数组
        String[] permissionArray = new String[permissions.size()];
        permissions.toArray(permissionArray);
        log.info("当前用户ID："+userid+"的权限为："+permissionArray);
        return permissionArray;
    }
}
