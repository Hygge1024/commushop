package org.lt.commushop.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class WebSecurityConfig extends WebSecurityConfigurerAdapter {

    // 密码编辑器
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // 安全拦截机制
    @Override
    protected void configure(HttpSecurity http) throws Exception {
//        http.csrf().disable()
//                .authorizeRequests()
//                .antMatchers("/api/admin").hasAnyAuthority("commushop1")
//                .antMatchers("/api/user").hasAnyAuthority("commushop2")
//                .anyRequest().permitAll()
//                .and()
//                .formLogin()
//                .loginPage("/api/login-view")// 登录页面
//                .loginProcessingUrl("/api/login")// 表示登录处理的URL
//                .successForwardUrl("/api/login-success")// 登录成功的页面地址
//                .failureForwardUrl("/api/login-fail")// 处理登录失败的URL
//                .and()
//                .logout()
//                .logoutUrl("/api/logout")
//                .logoutSuccessUrl("/api/logout-success");
//    }
        http.csrf().disable()
                .authorizeRequests()
                .antMatchers("/admin").hasAnyAuthority("commushop1")
                .antMatchers("/user").hasAnyAuthority("commushop2")
                .anyRequest().permitAll()
                .and()
                .formLogin()
                .loginPage("/login-view")// 登录页面
                .loginProcessingUrl("/login")// 表示登录处理的URL
                .successForwardUrl("/login-success")// 登录成功的页面地址
                .failureForwardUrl("/login-fail")// 处理登录失败的URL
                .and()
                .logout()
                .logoutUrl("/logout")
                .logoutSuccessUrl("/logout-success");
    }

}
