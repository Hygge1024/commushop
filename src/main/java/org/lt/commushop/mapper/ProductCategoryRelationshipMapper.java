package org.lt.commushop.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;
import org.lt.commushop.domain.entity.ProductCategoryRelationship;

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
public interface ProductCategoryRelationshipMapper extends BaseMapper<ProductCategoryRelationship> {
    @Select("SELECT category_id FROM product_category_relationship WHERE product_id = #{productId}")
    List<Integer> selectCategoryIdsByProductId(Integer productId);

}
