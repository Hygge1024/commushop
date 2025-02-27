package org.lt.commushop.config;

import org.lt.commushop.utils.JwtTokenUtil;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletResponse;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;

@Configuration
@EnableWebSecurity
@EnableGlobalMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

    @Resource
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Resource
    private JwtTokenUtil jwtTokenUtil;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.cors()
            .and()
            .csrf().disable()
            .sessionManagement().sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            .and()
            .authorizeRequests()
            .antMatchers("/api/auth/**", "/login", "/login-view").permitAll()
            .antMatchers("/swagger-ui/**", "/v2/api-docs/**", "/swagger-resources/**").permitAll()
            .antMatchers("/register/**").permitAll()
            .antMatchers("/api/public/**").permitAll()
            .antMatchers("/admin").hasAnyAuthority("commushop1")
            .antMatchers("/user").hasAnyAuthority("commushop2")
            .anyRequest().authenticated()
            .and()
            .formLogin()
            .loginPage("/login-view")
            .loginProcessingUrl("/login")
            .successHandler((request, response, authentication) -> {
                response.setContentType("application/json;charset=utf-8");
                Map<String, Object> result = new HashMap<>();
                // 生成JWT token
                UserDetails userDetails = (UserDetails) authentication.getPrincipal();
                String token = jwtTokenUtil.generateToken(userDetails);
                String refreshToken = jwtTokenUtil.generateRefreshToken(userDetails);//新增


                result.put("success", true);
                result.put("code", 200);
                Map<String, Object> data = new HashMap<>();
                data.put("token", token);
                data.put("refreshToken", refreshToken); //新增
                data.put("username", userDetails.getUsername());
                data.put("message", "登录成功");
                result.put("data", data);

                response.getWriter().write(new com.fasterxml.jackson.databind.ObjectMapper().writeValueAsString(result));
            })
            .failureHandler((request, response, exception) -> {
                response.setContentType("application/json;charset=utf-8");
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                Map<String, Object> result = new HashMap<>();
                result.put("success", false);
                result.put("code", 401);
                result.put("message", exception.getMessage());
                response.getWriter().write(new com.fasterxml.jackson.databind.ObjectMapper().writeValueAsString(result));
            });

        http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("*"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setExposedHeaders(Arrays.asList("Authorization"));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
