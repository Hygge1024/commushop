package org.lt.commushop.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import javax.servlet.http.HttpServletResponse;
import java.util.Arrays;

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
        http .cors()  // 启用CORS.
                .and()
                .csrf().disable()
                .authorizeRequests()
                .antMatchers("/admin").hasAnyAuthority("commushop1")// 管理员权限
                .antMatchers("/user").hasAnyAuthority("commushop2")// 用户权限
                .anyRequest().permitAll()// 其他请求都允许访问
                .and()
                .formLogin()
                .loginPage("/login-view")// 登录页面
                .loginProcessingUrl("/login")// 表示登录处理的URL
                .successHandler((request, response, authentication) -> {
                    response.setContentType("application/json;charset=utf-8");
                    response.getWriter().write("{\"success\":true,\"message\":\"登录成功\"}");
                })
                .failureHandler((request, response, exception) -> {
                    response.setContentType("application/json;charset=utf-8");
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    response.getWriter().write("{\"success\":false,\"message\":\"" + exception.getMessage() + "\"}");
                })
//                .successForwardUrl("/login-success")// 登录成功的页面地址
//                .failureForwardUrl("/login-fail")// 处理登录失败的URL
                // 添加以下配置
                .successHandler((request, response, authentication) -> {
                    response.setContentType("application/json;charset=utf-8");
                    response.getWriter().write("{\"success\":true,\"message\":\"登录成功\"}");
                })
                .failureHandler((request, response, exception) -> {
                    response.setContentType("application/json;charset=utf-8");
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    response.getWriter().write("{\"success\":false,\"message\":\"" + exception.getMessage() + "\"}");
                })
                .and()
                .logout()
                .logoutUrl("/logout")// 表示登出处理的URL
//                .logoutSuccessUrl("/logout-success");// 登出成功的页面地址
                .logoutSuccessHandler((request, response, authentication) -> {
                    response.setContentType("application/json;charset=utf-8");
                    response.getWriter().write("{\"success\":true,\"message\":\"退出成功\"}");
                });
    }
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:3000"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

}
