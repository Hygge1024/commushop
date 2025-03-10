package org.lt.commushop.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Mapper;
import org.lt.commushop.domain.entity.Order;
import org.lt.commushop.domain.entity.OrderProducts;

@Mapper
public interface OrderProductsMapper extends BaseMapper<OrderProducts> {
}
