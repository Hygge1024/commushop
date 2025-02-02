package org.lt.commushop.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import lombok.extern.slf4j.Slf4j;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.checkerframework.checker.units.qual.A;
import org.lt.commushop.domain.Hander.UserRegistrationDTO;
import org.lt.commushop.domain.Hander.UserRoleAddress;
import org.lt.commushop.domain.entity.Permission;
import org.lt.commushop.domain.entity.Role;
import org.lt.commushop.domain.entity.User;
import org.lt.commushop.domain.entity.UserAddress;
import org.lt.commushop.domain.entity.UserRole;
import org.lt.commushop.mapper.RoleMapper;
import org.lt.commushop.mapper.UserAddressMapper;
import org.lt.commushop.mapper.UserMapper;
import org.lt.commushop.mapper.UserRoleMapper;
import org.lt.commushop.service.IUserService;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

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
    @Autowired
    UserRoleMapper userRoleMapper;
    @Autowired
    private UserAddressMapper userAddressMapper;
    @Autowired
    private RoleMapper roleMapper;
    @Autowired
    private PasswordEncoder passwordEncoder;// 引入PasswordEncoder



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

    @Override
    public List<User> getUserInfo() {
        return userMapper.selectList(null);
    }

    @Override
    public User getUserName(String username) {
        return userMapper.selectOne(new QueryWrapper<User>().eq("username", username));
    }

    @Override
    public List<UserRoleAddress> getAllUserRoleAddresses() {
          // 1. 查询所有用户
        List<User> users = userMapper.selectList(null);

        if (users.isEmpty()) {
            return Collections.emptyList();
        }

        // 2. 获取所有用户的 userId
        List<Integer> userIds = users.stream()
                .map(User::getUserId)
                .collect(Collectors.toList());//获取所有用户的userId,转换成list

        // 3. 查询 user_role 表，获取 userId 对应的 roleId
        Map<Integer, Integer> userRoleMap = new HashMap<>();
        for (Integer userId : userIds) {
            List<Integer> roleIds = userRoleMapper.getRoleIdsByUserId(userId);//获取用户角色id,本应用User与Role是一对一关系
            // 这里预留一对多的关系，通过取第一个角色id来表示用户角色来获得用户角色
            if (!roleIds.isEmpty()) {
                userRoleMap.put(userId, roleIds.get(0)); // 只取第一个角色
            }
        }

        // 4. 批量查询所有角色
        List<Integer> allRoleIds = new ArrayList<>(userRoleMap.values());
        List<Role> roles = roleMapper.selectBatchIds(allRoleIds);
        Map<Integer, Role> roleMap = roles.stream()
                .collect(Collectors.toMap(Role::getRoleId, role -> role));

        // 5. 批量查询所有用户地址
        List<UserAddress> addresses = userAddressMapper.selectList(
                new com.baomidou.mybatisplus.core.conditions.query.QueryWrapper<UserAddress>()
                        .in("user_id", userIds)
        );

        // 6. 按 userId 分组地址
        Map<Integer, List<UserAddress>> addressMap = addresses.stream()
                .collect(Collectors.groupingBy(UserAddress::getUserId));//按userId分组地址

        // 7. 组装 UserRoleAddress 对象
        List<UserRoleAddress> result = new ArrayList<>();
        for (User user : users) {
            //创建UserRoleAddress对象
            UserRoleAddress ura = new UserRoleAddress();
            //设置用户
            ura.setUser(user);

            // 设置角色
            Integer roleId = userRoleMap.get(user.getUserId());//从用户角色map中获取用户角色id
            Role role = roleMap.get(roleId);
            ura.setRole(role); // 只设置一个 Role 对象

            // 设置地址列表
            List<UserAddress> userAddresses = addressMap.get(user.getUserId());//从地址map中获取用户地址
            ura.setUserAddresses(userAddresses != null ? userAddresses : new ArrayList<>());

            result.add(ura);
        }
        return result;
    }

    @Override
    public UserRoleAddress getUserDetails(String username) {
        User user = userMapper.selectOne(new QueryWrapper<User>().eq("username", username));
        if (user == null) {
            return null; // 或者抛出异常
        }

        Role role = userMapper.getRoleByUserId(user.getUserId());
        List<UserAddress> userAddresses = userMapper.getUserAddressesByUserId(user.getUserId());

        UserRoleAddress userRoleAddress = new UserRoleAddress();
        userRoleAddress.setUser(user);
        userRoleAddress.setRole(role);
        userRoleAddress.setUserAddresses(userAddresses);

        return userRoleAddress;
    }

   @Override
    public User registerUser(UserRegistrationDTO userRegistrationDTO) {
        // 检查用户名是否已存在
        User existingUser = userMapper.selectOne(new QueryWrapper<User>().eq("username", userRegistrationDTO.getUsername()));
        if (existingUser != null) {
            throw new IllegalArgumentException("用户名已被注册"); // 或者返回一个自定义的错误响应
        }

        // 创建User对象
        User user = new User();
        user.setUsername(userRegistrationDTO.getUsername());

       // 使用PasswordEncoder加密密码
        String encodedPassword = passwordEncoder.encode(userRegistrationDTO.getPassword());
        user.setPassword(encodedPassword); // 存储加密后的密码
        user.setPhoneNumber(userRegistrationDTO.getPhoneNumber());
        user.setFullname(userRegistrationDTO.getFullname());
        user.setUserState(1);
        user.setEmail(userRegistrationDTO.getEmail());
        user.setGender(userRegistrationDTO.getGender());

        // 保存用户信息
        userMapper.insert(user);

        // 保存用户角色信息
        UserRole userRole = new UserRole();
        userRole.setUserId(user.getUserId()); // 假设user.getUserId()能获取到插入后的用户ID
        userRole.setRoleId(userRegistrationDTO.getRoleId());
        userRoleMapper.insert(userRole);

        return user; // 返回注册的用户信息
    }

    @Override
    public User addAddress(String username, UserAddress userAddress) {
          // 根据用户名查找用户
        User user = userMapper.selectOne(new QueryWrapper<User>().eq("username", username));
        if (user == null) {
            throw new IllegalArgumentException("用户不存在");
        }
        // 创建UserAddress对象
        userAddress.setUserId(user.getUserId()); // 设置用户ID
        userAddress.setIsDefault(true); // 设置是否为默认地址
        userAddressMapper.insert(userAddress);
        return user;//返回用户地址
    }

    @Override
    public User deleteAddress(String username, Integer addressId) {
        // 根据用户名查找用户
        User user = userMapper.selectOne(new QueryWrapper<User>().eq("username", username));
        if (user == null) {
            throw new IllegalArgumentException("用户不存在");
        }
        if (addressId == null) {
            throw new IllegalArgumentException("地址ID不能为空");
        }
        // 删除地址
        userAddressMapper.delete(new QueryWrapper<UserAddress>().eq("address_id", addressId));
        return user;
    }
    @Override
    public User updateUserInfo(UserRegistrationDTO userRegistrationDTO) {
        // 检查用户是否存在
        User existingUser = userMapper.selectOne(new QueryWrapper<User>().eq("username", userRegistrationDTO.getUsername()));
        if (existingUser == null) {
            throw new IllegalArgumentException("用户不存在"); // 或者返回一个自定义的错误响应
        }

        // 更新用户信息
        existingUser.setPhoneNumber(userRegistrationDTO.getPhoneNumber());
        existingUser.setFullname(userRegistrationDTO.getFullname());
        existingUser.setEmail(userRegistrationDTO.getEmail());
        existingUser.setGender(userRegistrationDTO.getGender());

        // 如果密码不为空，则更新密码
        if (userRegistrationDTO.getPassword() != null && !userRegistrationDTO.getPassword().isEmpty()) {
            String encodedPassword = passwordEncoder.encode(userRegistrationDTO.getPassword());
            existingUser.setPassword(encodedPassword); // 存储加密后的密码
        }

        // 保存更新后的用户信息
        userMapper.updateById(existingUser);//更新用户信息

        // 更新用户角色信息
        if (userRegistrationDTO.getRoleId() != null) {
            // 删除用户之前的角色信息
            userRoleMapper.delete(new QueryWrapper<UserRole>().eq("user_id", existingUser.getUserId()));

            // 保存新的用户角色信息
            UserRole userRole = new UserRole();
            userRole.setUserId(existingUser.getUserId());
            userRole.setRoleId(userRegistrationDTO.getRoleId());
            userRoleMapper.insert(userRole);//插入新的用户角色信息
        }

        return existingUser; // 返回更新后的用户信息
    }
}
