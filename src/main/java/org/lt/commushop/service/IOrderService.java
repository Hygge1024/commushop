package org.lt.commushop.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.service.IService;
import org.lt.commushop.domain.entity.Order;

public interface IOrderService extends IService<Order> {

    /**
     * 创建订单
     *
     * @param order 订单信息
     * @return 创建的订单
     */
    Order createOrder(Order order);

    /**
     * 分页查询订单
     *
     * @param current     当前页
     * @param size        每页大小
     * @param userId      用户ID
     * @param orderStatus 订单状态
     * @param leaderId    团长ID
     * @return 订单分页数据
     */
    IPage<Order> getOrderPage(Integer current, Integer size, Integer userId,
                              Integer orderStatus, Integer leaderId);

    // 更新订单（地址、团长、特别是订单状态）
    /**
     * 更新订单信息
     *
     * @param order 订单信息
     * @return 是否更新成功
     */
    Boolean updateOrder(Order order);

    // 软删除订单
    Boolean softDeleteOrder(Integer orderId);
}
