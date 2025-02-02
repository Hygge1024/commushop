package org.lt.commushop.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.lt.commushop.domain.entity.Permission;
import org.lt.commushop.domain.entity.User;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.lt.commushop.domain.Hander.UserRoleAddress;
import org.lt.commushop.domain.entity.Role;
import org.lt.commushop.domain.entity.UserAddress;

import java.util.List;

/**
 * <p>
 *  Mapper 接口
 * </p>
 *
 * @author tao
 * @since 2025-01-21
 */
@Mapper
public interface UserMapper extends BaseMapper<User> {
    @Select("SELECT * from user where username = #{username}")
    List<User> getUserList( String username);
    @Select("SELECT\n" +
            "    *\n" +
            "FROM\n" +
            "    permission\n" +
            "WHERE\n" +
            "    permission_id IN (\n" +
            "        SELECT permission_id\n" +
            "        FROM role_permission\n" +
            "        WHERE role_id IN (\n" +
            "            SELECT role_id\n" +
            "            FROM user_role\n" +
            "            WHERE user_id = 1\n" +
            "        )\n" +
            "    );\n")
    List<Permission> getPermissionList( int userid);

    @Select("SELECT * FROM user WHERE user_id = #{userId}")
    User getUserById(Integer userId);

    @Select("SELECT * FROM role WHERE role_id = (SELECT role_id FROM user_role WHERE user_id = #{userId})")
    Role getRoleByUserId(Integer userId);

    @Select("SELECT * FROM user_address WHERE user_id = #{userId}")
    List<UserAddress> getUserAddressesByUserId(Integer userId);
}
