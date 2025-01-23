package org.lt.commushop.controller;


import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import org.lt.commushop.domain.entity.User;
import org.lt.commushop.service.IUserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;

import org.springframework.web.bind.annotation.RestController;

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
//@RequestMapping("/user")
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

}
