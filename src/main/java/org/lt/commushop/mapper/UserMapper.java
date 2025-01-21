package org.lt.commushop.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.lt.commushop.domain.entity.Permission;
import org.lt.commushop.domain.entity.User;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;

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
}
