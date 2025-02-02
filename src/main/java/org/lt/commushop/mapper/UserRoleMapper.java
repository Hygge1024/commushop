package org.lt.commushop.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.lt.commushop.domain.entity.UserRole;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

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
public interface UserRoleMapper extends BaseMapper<UserRole> {

    @Select("SELECT role_id FROM user_role WHERE user_id = #{userId}")
    List<Integer> getRoleIdsByUserId(Integer userId);

    @Select("SELECT role_id FROM user_role WHERE user_id IN (#{userIds})")
    List<Integer> getRoleIdsByUserIds(List<Integer> userIds);
}
