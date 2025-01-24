package org.lt.commushop.service.UtilsService;

import lombok.extern.slf4j.Slf4j;
import org.lt.commushop.domain.entity.Permission;
import org.lt.commushop.domain.entity.User;
import org.lt.commushop.mapper.UserMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
@Slf4j
@Service
public class UserDetailsServiceImpl implements org.springframework.security.core.userdetails.UserDetailsService {
    @Autowired
    UserMapper userMapper;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = this.getUser(username);
        if(user == null){
            throw new UsernameNotFoundException("用户账号错误");
        }
        String[] permissionArray = this.getPermissionList(user.getUserId());
        UserDetails userDetails = org.springframework.security.core.userdetails.User.withUsername(user.getUsername()).password(user.getPassword()).authorities(permissionArray).build();
        return userDetails;
    }


    //根据用户账号获取用户信息
    public User getUser(String username) {
        List<User> list = userMapper.getUserList(username);
        User user = null;
        if(list != null && list.size() == 1){
            user = list.get(0);
        }
        if(user == null){
            return null;
        }
        return user;
    }


    public String[] getPermissionList(int userid) {
        List<Permission> permissionList = userMapper.getPermissionList(userid);
        List<String> permissions = new ArrayList<>();
        permissionList.forEach(c -> permissions.add(c.getPermissionCode()));
        //将权限code转换成String数组
        String[] permissionArray = new String[permissions.size()];
        permissions.toArray(permissionArray);
        log.info("当前用户 ID：{} 的权限列表为：{}", userid, Arrays.toString(permissionArray));
        return permissionArray;
    }
}
