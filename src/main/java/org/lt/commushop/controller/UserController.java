package org.lt.commushop.controller;


import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import lombok.extern.slf4j.Slf4j;
import org.lt.commushop.common.Result;
import org.lt.commushop.domain.Hander.UserRegistrationDTO;
import org.lt.commushop.domain.Hander.UserRoleAddress;
import org.lt.commushop.domain.entity.User;
import org.lt.commushop.domain.entity.UserAddress;
import org.lt.commushop.service.IUserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * <p>
 *  前端控制器
 * </p>
 *
 * @author tao
 * @since 2025-01-21
 */
@RestController
@Api(tags = "用户模块")
// @RequestMapping("/user")
@Slf4j
public class UserController {
    @Autowired
    private IUserService userService;


    @ApiOperation(value = "登录接口")
    @RequestMapping("/login-success")
    public String loginSuccesss(){
        return getUserName() + "登录成功";
    }

    @ApiOperation(value ="根据用户账号查询用户信息")
    @GetMapping("/users/{username}")
    public User getUsers(@PathVariable String username){
        System.out.println("YES");
        return userService.getUserList(username);
    }


    @ApiOperation(value ="权限测试1接口")
    @GetMapping("/admin")
    public String s1(){
        return  getUserName() + "当问管理员资源";
    }
    @ApiOperation(value ="权限测试2接口")
    @GetMapping("/user")
    public String s2(){
        return  getUserName() + "当问用户资源";
    }

    @ApiOperation(value ="登录失败")
    @RequestMapping("/login-fail")
    public String s3(){
        return  "非常抱歉，您的账号或密码错误！！！";
    }


    //获取当前用户的信息
    private String getUserName(){
        String username = null;
        //当前认证通过的用户身份
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        //用户身份
        Object principal = authentication.getPrincipal();
        if(principal == null) {
            username = "匿名";
        }
        if(principal instanceof UserDetails){//如果当前principal是UserDetail类型
            UserDetails userDetails = (UserDetails) principal;
            username = userDetails.getUsername();
        }else{
            username = principal.toString();
        }
        return username;
    }

    @ApiOperation(value ="获取所有用户信息")
    @GetMapping("/userInfo")
    public Result<List<User>> getUserInfo(){
        List<User> users = userService.getUserInfo();
        if (users != null && !users.isEmpty()) {
            return Result.success(users);
        } else {
            return Result.error("未找到用户信息");
        }
    }
    @ApiOperation(value ="获取单个用户信息")
    @GetMapping("/userInfo/{username}")
    public Result<User> getUserInfo(@PathVariable String username) {
        User user = userService.getUserName(username);
        if (user != null) {
            return Result.success(user);
        } else {
            return Result.error("未找到该用户");
        }
    }
    @ApiOperation(value = "获取所有用户及其角色和地址信息")
    @GetMapping("/userDetails")
    public Result<List<UserRoleAddress>> getAllUserDetails() {
        List<UserRoleAddress> userDetails = userService.getAllUserRoleAddresses();
        if (userDetails != null && !userDetails.isEmpty()) {
            return Result.success(userDetails);
        } else {
            return Result.error("未找到all用户详细信息");
        }
    }
    @ApiOperation(value = "根据用户名查询用户及其角色和地址信息")
    @GetMapping("/details/{username}")
    public Result<UserRoleAddress> getUserDetails(@PathVariable String username) {
        UserRoleAddress ura = userService.getUserDetails(username);
        if (ura != null) {
            return Result.success(ura);
        } else {
            return Result.error("未找到该用户的详细信息");
        }
    }
    @ApiOperation(value = "注册用户")
    @PostMapping("/register")
    public Result<User> registerUser(@RequestBody UserRegistrationDTO userRegistrationDTO) {
        try {
            User registeredUser = userService.registerUser(userRegistrationDTO);
            return Result.success(registeredUser);
        } catch (IllegalArgumentException e) {
            return Result.error(e.getMessage()); // 返回错误信息
        }
    }
    @ApiOperation(value = "添加用户地址")
    @PostMapping("/{username}/addAddress")
    public Result<User> addAddress(@PathVariable String username, @RequestBody UserAddress userAddress) {
        User user = userService.addAddress(username, userAddress);
        return Result.success(user);
    }
    @ApiOperation(value = "删除用户地址")
    @DeleteMapping("/{username}/deleteAddress/{addressId}")
    public Result<User> deleteAddress(@PathVariable String username, @PathVariable Integer addressId) {
        User user = userService.deleteAddress(username, addressId);
        return Result.success(user);
    }
    @ApiOperation(value = "更新用户信息")
    @PutMapping("/updateUserInfo")
    public Result<User> updateUserInfo(@RequestBody UserRegistrationDTO userRegistrationDTO) {
        User user = userService.updateUserInfo(userRegistrationDTO);
        return Result.success(user);
    }

}
