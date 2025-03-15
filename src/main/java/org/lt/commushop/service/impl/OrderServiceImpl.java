package org.lt.commushop.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import org.lt.commushop.config.ActivityCodeGenerator;
import org.lt.commushop.domain.entity.Order;
import org.lt.commushop.domain.entity.User;
import org.lt.commushop.exception.BusinessException;
import org.lt.commushop.mapper.OrderMapper;
import org.lt.commushop.mapper.UserMapper;
import org.lt.commushop.service.IOrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class OrderServiceImpl extends ServiceImpl<OrderMapper, Order> implements IOrderService {
    @Autowired
    private OrderMapper orderMapper;

    @Autowired
    private ActivityCodeGenerator activityCodeGenerator;

    @Autowired
    private UserMapper userMapper;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Order createOrder(Order order) {
        // 1.参数校验
        if (order == null) {
            throw new BusinessException("创建订单失败：参数不能为空");
        }

        // 2.检查用户是否存在
        User user = userMapper.selectById(order.getUserId());
        if (user == null) {
            throw new BusinessException("创建订单失败：用户不存在");
        }

        // 3.生成唯一订单编号（时间戳+用户ID后4位+4位随机数）
        String orderCode;
        int maxRetries = 10;
        int retryCount = 0;
        do {
            if (retryCount >= maxRetries) {
                throw new BusinessException("创建团购活动失败：无法生成唯一的活动编码，请稍后重试");
            }

            orderCode = activityCodeGenerator.generateOrderCode();

            // 检查编码是否已存在
            LambdaQueryWrapper<Order> queryWrapper = new LambdaQueryWrapper<>();
            queryWrapper.eq(Order::getOrderCode, orderCode);

            if (this.count(queryWrapper) == 0) {
                // 编码不存在，可以使用
                break;
            }
            retryCount++;
        } while (true);

        // 4.设置订单信息
        order.setOrderCode(orderCode);
        order.setCreateTime(LocalDateTime.now());
        order.setOrderStatus(1); // 1表示未支付
        order.setIsDeleted(0);

        // 5.保存订单
        orderMapper.insert(order);
        return order;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public IPage<Order> getOrderPage(Integer current, Integer size, Integer userId, Integer orderStatus, Integer leaderId,Integer orderId) {

        // 1.创建分页对象
        Page<Order> page = new Page<>(current, size);

        // 2.构建查询条件
        LambdaQueryWrapper<Order> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(Order::getIsDeleted, 0);

        if (userId != null) {
            queryWrapper.eq(Order::getUserId, userId);
        }
        if (orderStatus != null) {
            queryWrapper.eq(Order::getOrderStatus, orderStatus);
        }
        if (leaderId != null) {
            queryWrapper.eq(Order::getLeaderId, leaderId);
        }
        if(orderId != null){
            queryWrapper.eq(Order::getOrderId,orderId);
        }
        //3.过滤掉被软删除的
        queryWrapper.ne(Order::getIsDeleted, 1);

        // 3.按创建时间倒序排序
        queryWrapper.orderByDesc(Order::getCreateTime);

        // 4.执行查询
        return orderMapper.selectPage(page, queryWrapper);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Boolean updateOrder(Order order) {
        // 1.参数校验
        if (order == null || order.getOrderId() == null) {
            throw new BusinessException("更新订单失败：参数不能为空");
        }

        // 2.检查订单是否存在
        Order existOrder = orderMapper.selectById(order.getOrderId());
        if (existOrder == null) {
            throw new BusinessException("更新订单失败：订单不存在");
        }

        // 3.更新订单信息
        if (order.getOrderStatus() != null) existOrder.setOrderStatus(order.getOrderStatus());
        if (order.getAddress() != null) existOrder.setAddress(order.getAddress());
        if (order.getLeaderId() != null) existOrder.setLeaderId(order.getLeaderId());
        if( order.getTotalMoney() != null) existOrder.setTotalMoney(order.getTotalMoney());


        return orderMapper.updateById(existOrder) > 0;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Boolean softDeleteOrder(Integer orderId) {
        // 1.参数校验
        if (orderId == null) {
            throw new BusinessException("删除订单失败：订单ID不能为空");
        }

        // 2.检查订单是否存在
        Order existOrder = orderMapper.selectById(orderId);
        if (existOrder == null) {
            throw new BusinessException("删除订单失败：订单不存在");
        }

        // 3.软删除订单
        existOrder.setIsDeleted(1);
        return orderMapper.updateById(existOrder) > 0;
    }
}
