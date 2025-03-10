package org.lt.commushop.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Mapper;
import org.lt.commushop.domain.entity.Order;

@Mapper
public interface OrderMapper extends BaseMapper<Order> {
}
