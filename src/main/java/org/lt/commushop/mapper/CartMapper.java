package org.lt.commushop.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Mapper;
import org.lt.commushop.domain.entity.Cart;

@Mapper
public interface CartMapper extends BaseMapper<Cart> {
}
