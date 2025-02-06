package org.lt.commushop.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import org.lt.commushop.domain.entity.GroupBuyingOrder;
import org.lt.commushop.domain.entity.PaymentRecord;
import org.lt.commushop.exception.BusinessException;
import org.lt.commushop.mapper.PaymentRecordMapper;
import org.lt.commushop.service.IGroupBuyingOrderService;
import org.lt.commushop.service.IPaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * <p>
 * 支付服务实现类
 * </p>
 *
 * @author tao
 * @since 2025-01-21
 */
@Service
public class PaymentServiceImpl extends ServiceImpl<PaymentRecordMapper, PaymentRecord> implements IPaymentService {

    @Autowired
    private IGroupBuyingOrderService orderService;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Integer createPayment(Integer orderId, String paymentMethod) {
        // 1. 参数校验
        if (orderId == null || paymentMethod == null || paymentMethod.trim().isEmpty()) {
            throw new BusinessException("参数错误");
        }

        // 2. 检查订单是否存在
        GroupBuyingOrder order = orderService.getById(orderId);
        if (order == null) {
            throw new BusinessException("订单不存在");
        }

        // 3. 检查订单状态
        if (order.getOrderStatus() != 1) {
            throw new BusinessException("订单状态异常，不能支付");
        }

        // 4. 创建支付记录
        PaymentRecord paymentRecord = new PaymentRecord()
                .setOrderId(orderId)
                .setPaymentAmount(order.getOrderAmount())
                .setPaymentMethod(paymentMethod)
                .setPaymentTime(LocalDateTime.now());

        // 5. 保存支付记录
        this.save(paymentRecord);

        // 6. 更新订单状态为已支付（状态码2）
        order.setOrderStatus(2);
        orderService.updateById(order);

        return paymentRecord.getPaymentId();
    }

    @Override
    public IPage<PaymentRecord> getPaymentPage(Integer current, Integer size,
                                             Integer orderId, Integer userId,
                                             BigDecimal minAmount, BigDecimal maxAmount,
                                             LocalDateTime startTime, LocalDateTime endTime) {
        // 1. 参数校验
        if (current == null || current < 1) {
            throw new BusinessException("当前页码不能小于1");
        }
        if (size == null || size < 1) {
            throw new BusinessException("每页数量不能小于1");
        }
        if (userId == null) {
            throw new BusinessException("用户ID不能为空");
        }

        // 2. 创建分页对象
        Page<PaymentRecord> page = new Page<>(current, size);

        // 3. 查询用户的已支付订单
        LambdaQueryWrapper<GroupBuyingOrder> orderWrapper = new LambdaQueryWrapper<>();
        orderWrapper.eq(GroupBuyingOrder::getUserId, userId);
        // 只查询已支付的订单
        orderWrapper.eq(GroupBuyingOrder::getOrderStatus, 2); // 假设2表示已支付状态
        List<GroupBuyingOrder> userOrders = orderService.list(orderWrapper);
        
        // 如果用户没有已支付的订单，直接返回空分页结果
        if (userOrders.isEmpty()) {
            return page;
        }

        // 获取已支付订单的ID列表
        List<Integer> orderIds = userOrders.stream()
                .map(GroupBuyingOrder::getOrderId)
                .collect(Collectors.toList());

        // 4. 构建支付记录查询条件
        LambdaQueryWrapper<PaymentRecord> queryWrapper = new LambdaQueryWrapper<>();
        
        // 4.1 订单ID查询（必须是用户的已支付订单）
        if (orderId != null) {
            // 如果指定了订单ID，验证该订单是否属于当前用户且已支付
            if (!orderIds.contains(orderId)) {
                throw new BusinessException("无权查看该订单的支付记录或该订单未支付");
            }
            queryWrapper.eq(PaymentRecord::getOrderId, orderId);
        } else {
            // 如果没有指定订单ID，则查询用户所有已支付订单的支付记录
            queryWrapper.in(PaymentRecord::getOrderId, orderIds);
        }
        
        // 4.2 支付金额范围查询
        if (minAmount != null) {
            queryWrapper.ge(PaymentRecord::getPaymentAmount, minAmount);
        }
        if (maxAmount != null) {
            queryWrapper.le(PaymentRecord::getPaymentAmount, maxAmount);
        }
        
        // 4.3 支付时间范围查询
        if (startTime != null) {
            queryWrapper.ge(PaymentRecord::getPaymentTime, startTime);
        }
        if (endTime != null) {
            queryWrapper.le(PaymentRecord::getPaymentTime, endTime);
        }
        
        // 4.4 按支付时间倒序排序
        queryWrapper.orderByDesc(PaymentRecord::getPaymentTime);

        // 5. 执行分页查询
        return this.page(page, queryWrapper);
    }
}
