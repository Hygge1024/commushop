package org.lt.commushop.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;
import org.lt.commushop.domain.entity.Category;

import java.util.List;

/**
 * <p>
 *  Mapper 接口
 * </p>
 *
 * @author tao
 * @since 2025-01-26
 */
@Mapper
public interface CategoryMapper extends BaseMapper<Category> {
     @Select({
        "<script>",
        "SELECT * FROM category",
        "WHERE category_id IN",
        "<foreach item='id' collection='categoryIds' open='(' separator=',' close=')'>",
        "#{id}",
        "</foreach>",
        "</script>"
    })
    List<Category> selectCategoriesByIds(List<Integer> categoryIds);


}
