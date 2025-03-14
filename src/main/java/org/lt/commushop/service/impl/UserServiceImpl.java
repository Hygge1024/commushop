package org.lt.commushop.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import lombok.extern.slf4j.Slf4j;

import org.lt.commushop.domain.Hander.UserRegistrationDTO;
import org.lt.commushop.domain.Hander.UserRoleAddress;
import org.lt.commushop.domain.entity.*;
import org.lt.commushop.domain.vo.UserQueryVO;
import org.lt.commushop.domain.vo.UserStatisticsVO;
import org.lt.commushop.exception.BusinessException;
import org.lt.commushop.mapper.*;
import org.lt.commushop.service.IUserService;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;
import org.springframework.util.StringUtils;

/**
 * <p>
 * 服务实现类
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
    @Autowired
    private GroupBuyingOrderMapper groupBuyingOrderMapper; // 修改为团购订单Mapper

    // 根据用户账号获取用户信息
    @Override
    public User getUserList(String username) {
        List<User> list = userMapper.getUserList(username);
        log.info("当前用户List为" + list);
        User user = null;
        if (list != null && list.size() == 1) {
            user = list.get(0);
            log.info("当前用户为" + user);
        }
        if (user == null) {
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
        // 将权限code转换成String数组
        String[] permissionArray = new String[permissions.size()];
        permissions.toArray(permissionArray);
        log.info("当前用户ID：" + userid + "的权限为：" + permissionArray);
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
                .collect(Collectors.toList());// 获取所有用户的userId,转换成list

        // 3. 查询 user_role 表，获取 userId 对应的 roleId
        Map<Integer, Integer> userRoleMap = new HashMap<>();
        for (Integer userId : userIds) {
            List<Integer> roleIds = userRoleMapper.getRoleIdsByUserId(userId);// 获取用户角色id,本应用User与Role是一对一关系
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
                        .in("user_id", userIds));

        // 6. 按 userId 分组地址
        Map<Integer, List<UserAddress>> addressMap = addresses.stream()
                .collect(Collectors.groupingBy(UserAddress::getUserId));// 按userId分组地址

        // 7. 组装 UserRoleAddress 对象
        List<UserRoleAddress> result = new ArrayList<>();
        for (User user : users) {
            // 创建UserRoleAddress对象
            UserRoleAddress ura = new UserRoleAddress();
            // 设置用户
            ura.setUser(user);

            // 设置角色
            Integer roleId = userRoleMap.get(user.getUserId());// 从用户角色map中获取用户角色id
            Role role = roleMap.get(roleId);
            ura.setRole(role); // 只设置一个 Role 对象

            // 设置地址列表
            List<UserAddress> userAddresses = addressMap.get(user.getUserId());// 从地址map中获取用户地址
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
        User existingUser = userMapper
                .selectOne(new QueryWrapper<User>().eq("username", userRegistrationDTO.getUsername()));
        if (existingUser != null) {
            throw new IllegalArgumentException("用户名已被注册");
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
        userAddress.setIsDefault(false); // 设置是否为默认地址
        userAddressMapper.insert(userAddress);
        return user;// 返回用户地址
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
        User existingUser = userMapper
                .selectOne(new QueryWrapper<User>().eq("username", userRegistrationDTO.getUsername()));
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
        userMapper.updateById(existingUser);// 更新用户信息

        // 更新用户角色信息
        if (userRegistrationDTO.getRoleId() != null) {
            // 删除用户之前的角色信息
            userRoleMapper.delete(new QueryWrapper<UserRole>().eq("user_id", existingUser.getUserId()));

            // 保存新的用户角色信息
            UserRole userRole = new UserRole();
            userRole.setUserId(existingUser.getUserId());
            userRole.setRoleId(userRegistrationDTO.getRoleId());
            userRoleMapper.insert(userRole);// 插入新的用户角色信息
        }

        return existingUser; // 返回更新后的用户信息
    }

    @Transactional(rollbackFor = Exception.class)
    @Override
    public Boolean updatePassword(String username, String oldPassword, String newPassword) {
        // 1.参数校验
        if (StringUtils.isEmpty(username) || StringUtils.isEmpty(oldPassword) || StringUtils.isEmpty(newPassword)) {
            throw new BusinessException("修改密码失败：参数不能为空");
        }

        // 2.查询用户是否存在
        User user = userMapper.selectOne(new QueryWrapper<User>().eq("username", username));
        if (user == null) {
            throw new BusinessException("修改密码失败：用户不存在");
        }

        // 3.验证原密码是否正确
        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new BusinessException("修改密码失败：原密码错误");
        }

        // 4.加密新密码并更新
        String encodedNewPassword = passwordEncoder.encode(newPassword);
        user.setPassword(encodedNewPassword);

        // 5.更新用户信息
        return userMapper.updateById(user) > 0;
    }

    @Override
    public IPage<UserQueryVO> getUserPage(Integer current, Integer size,
            Long userId, String username, String phone) {
        // 1. 创建分页对象
        Page<User> page = new Page<>(current, size);

        // 2. 构建查询条件
        LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
        if (userId != null) {
            wrapper.eq(User::getUserId, userId);
        }
        if (StringUtils.hasText(username)) {
            wrapper.like(User::getUsername, username);
        }
        if (StringUtils.hasText(phone)) {
            wrapper.like(User::getPhoneNumber, phone);
        }
        wrapper.orderByDesc(User::getUserId);

        // 3. 执行分页查询
        IPage<User> userPage = this.page(page, wrapper);

        // 4. 获取所有用户ID
        Set<Integer> userIds = userPage.getRecords().stream()
                .map(User::getUserId)
                .collect(Collectors.toSet());

        // 5. 批量查询用户角色关系
        Map<Integer, Integer> userRoleMap;
        if (!userIds.isEmpty()) {
            LambdaQueryWrapper<UserRole> userRoleWrapper = new LambdaQueryWrapper<>();
            userRoleWrapper.in(UserRole::getUserId, userIds);
            List<UserRole> userRoles = userRoleMapper.selectList(userRoleWrapper);
            userRoleMap = userRoles.stream()
                    .collect(Collectors.toMap(UserRole::getUserId, UserRole::getRoleId));
        } else {
            userRoleMap = new HashMap<>();
        }

        // 6. 批量查询角色信息
        Map<Integer, Role> roleMap;
        Set<Integer> roleIds = new HashSet<>(userRoleMap.values());
        if (!roleIds.isEmpty()) {
            LambdaQueryWrapper<Role> roleWrapper = new LambdaQueryWrapper<>();
            roleWrapper.in(Role::getRoleId, roleIds);
            List<Role> roles = roleMapper.selectList(roleWrapper);
            roleMap = roles.stream()
                    .collect(Collectors.toMap(Role::getRoleId, role -> role));
        } else {
            roleMap = new HashMap<>();
        }

        // 7. 批量查询用户地址
        Map<Integer, List<UserAddress>> addressMap;
        if (!userIds.isEmpty()) {
            LambdaQueryWrapper<UserAddress> addressWrapper = new LambdaQueryWrapper<>();
            addressWrapper.in(UserAddress::getUserId, userIds);
            List<UserAddress> addresses = userAddressMapper.selectList(addressWrapper);
            addressMap = addresses.stream()
                    .collect(Collectors.groupingBy(UserAddress::getUserId));
        } else {
            addressMap = new HashMap<>();
        }

        // 8. 转换为VO对象
        IPage<UserQueryVO> resultPage = new Page<>(current, size, userPage.getTotal());
        List<UserQueryVO> voList = userPage.getRecords().stream()
                .map(user -> {
                    UserQueryVO vo = new UserQueryVO();
                    vo.setUserId(user.getUserId().longValue());
                    vo.setUsername(user.getUsername());
                    vo.setRealName(user.getFullname());
                    vo.setPhone(user.getPhoneNumber());
                    vo.setEmail(user.getEmail());
                    vo.setGender(user.getGender() == 1 ? "男" : "女");
                    vo.setStatus(user.getUserState() == 1 ? "正常" : "禁用");
                    vo.setCreatedTime(user.getCreatedTime());
                    // 设置角色信息
                    Integer roleId = userRoleMap.get(user.getUserId());
                    if (roleId != null) {
                        Role role = roleMap.get(roleId);
                        if (role != null) {
                            vo.setRole(role.getRoleName());
                            vo.setRoleDescription(role.getRoleDescription());
                        }
                    }

                    // 设置地址列表
                    vo.setAddresses(addressMap.getOrDefault(user.getUserId(), new ArrayList<>()));

                    return vo;
                })
                .collect(Collectors.toList());

        resultPage.setRecords(voList);
        return resultPage;
    }

    @Override
    public UserStatisticsVO getUserStatistics() {
        UserStatisticsVO statistics = new UserStatisticsVO();

        // 1. 获取用户总数
        Long totalUsers = this.count();
        statistics.setTotalUsers(totalUsers.intValue());

        // 2. 获取今日新增用户数
        LocalDateTime todayStart = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0);
        LocalDateTime todayEnd = LocalDateTime.now().withHour(23).withMinute(59).withSecond(59);

        Long todayNewUsers = this.count(new QueryWrapper<User>()
                .between("created_time", todayStart, todayEnd));
        statistics.setTodayNewUsers(todayNewUsers.intValue());

        // 3. 获取活跃用户数（近14天有订单的用户）
        LocalDateTime twoWeeksAgo = LocalDateTime.now().minusDays(14).withHour(0).withMinute(0).withSecond(0);
        LocalDateTime now = LocalDateTime.now();

        // 使用selectObjs来获取去重后的用户ID列表
        LambdaQueryWrapper<GroupBuyingOrder> orderWrapper = new LambdaQueryWrapper<>();
        orderWrapper.select(GroupBuyingOrder::getUserId)
                .between(GroupBuyingOrder::getCreateTime, twoWeeksAgo, now)
                .eq(GroupBuyingOrder::getIsDeleted, 0);

        List<Object> userIds = groupBuyingOrderMapper.selectObjs(orderWrapper);
        // 使用Set去重
        Integer activeUsers = new HashSet<>(userIds).size();
        statistics.setActiveUsers(activeUsers);

        // 4. 获取有地址的用户数并计算完善率
        Integer usersWithAddress = userAddressMapper.selectCount(new QueryWrapper<UserAddress>()
                .select("DISTINCT user_id")).intValue();
        double addressCompletionRate = totalUsers > 0
                ? (double) usersWithAddress / totalUsers * 100
                : 0;
        statistics.setAddressCompletionRate(Math.round(addressCompletionRate * 100.0) / 100.0);

        // 5. 计算性别比例
        UserStatisticsVO.GenderRatio genderRatio = new UserStatisticsVO.GenderRatio();

        // 获取男性用户数量
        Long maleCount = this.count(new LambdaQueryWrapper<User>()
                .eq(User::getGender, 1));
        genderRatio.setMaleCount(Math.toIntExact(maleCount));

        // 获取女性用户数量
        Long femaleCount = this.count(new LambdaQueryWrapper<User>()
                .eq(User::getGender, 0));
        genderRatio.setFemaleCount(Math.toIntExact(femaleCount));

        // 计算比例
        long totalWithGender = maleCount + femaleCount;
        if (totalWithGender > 0) {
            double maleRatio = (double) maleCount / totalWithGender * 100;
            double femaleRatio = (double) femaleCount / totalWithGender * 100;
            genderRatio.setMaleRatio(Math.round(maleRatio * 100.0) / 100.0);
            genderRatio.setFemaleRatio(Math.round(femaleRatio * 100.0) / 100.0);
        } else {
            genderRatio.setMaleRatio(0.0);
            genderRatio.setFemaleRatio(0.0);
        }

        statistics.setGenderRatio(genderRatio);

        // 6. 获取近5日用户增长趋势
        LocalDateTime endDate = LocalDateTime.now().withHour(23).withMinute(59).withSecond(59);
        LocalDateTime startDate = endDate.minusDays(4).withHour(0).withMinute(0).withSecond(0);

        List<UserStatisticsVO.DailyUserGrowth> growthTrend = new ArrayList<>();

        // 查询这5天内注册的所有用户
        List<User> users = this.list(new QueryWrapper<User>()
                .ge("created_time", startDate)
                .le("created_time", endDate)
                .orderByAsc("created_time"));

        // 按日期分组统计
        Map<LocalDate, Long> dailyCounts = users.stream()
                .collect(Collectors.groupingBy(
                        user -> user.getCreatedTime().toLocalDate(),
                        Collectors.counting()));

        // 填充5天的数据（包括没有新用户的日期）
        for (int i = 0; i < 5; i++) {
            LocalDateTime date = startDate.plusDays(i).withHour(0).withMinute(0).withSecond(0);
            UserStatisticsVO.DailyUserGrowth daily = new UserStatisticsVO.DailyUserGrowth();
            daily.setDate(date);
            daily.setCount(dailyCounts.getOrDefault(date.toLocalDate(), 0L).intValue());
            growthTrend.add(daily);
        }

        statistics.setUserGrowthTrend(growthTrend);

        return statistics;
    }
}
