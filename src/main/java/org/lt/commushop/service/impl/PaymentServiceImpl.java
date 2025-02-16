package org.lt.commushop.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import org.lt.commushop.domain.entity.GroupBuyingActivity;
import org.lt.commushop.domain.entity.GroupBuyingOrder;
import org.lt.commushop.domain.entity.PaymentRecord;
import org.lt.commushop.domain.vo.PaymentQueryVO;
import org.lt.commushop.domain.vo.PaymentStatisticsVO;
import org.lt.commushop.exception.BusinessException;
import org.lt.commushop.mapper.PaymentRecordMapper;
import org.lt.commushop.service.IGroupBuyingActivityService;
import org.lt.commushop.service.IGroupBuyingOrderService;
import org.lt.commushop.service.IPaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
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

    @Autowired
    private IGroupBuyingActivityService activityService;

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

        // 6. 更新订单状态为已支付（状态码3）
        order.setOrderStatus(3);
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

    @Override
    public IPage<PaymentQueryVO> getPaymentPage(Integer current, Integer size,
                                                Integer paymentId, Integer orderId,
                                                Integer activityId, String paymentMethod,
                                                LocalDateTime startTime, LocalDateTime endTime) {
        // 1. 创建分页对象
        Page<PaymentRecord> page = new Page<>(current, size);

        // 2. 构建查询条件
        LambdaQueryWrapper<PaymentRecord> wrapper = new LambdaQueryWrapper<>();

        if (paymentId != null) {
            wrapper.eq(PaymentRecord::getPaymentId, paymentId);
        }
        if (orderId != null) {
            wrapper.eq(PaymentRecord::getOrderId, orderId);
        }
        if (StringUtils.hasText(paymentMethod)) {
            wrapper.eq(PaymentRecord::getPaymentMethod, paymentMethod);
        }
        if (startTime != null) {
            wrapper.ge(PaymentRecord::getPaymentTime, startTime);
        }
        if (endTime != null) {
            wrapper.le(PaymentRecord::getPaymentTime, endTime);
        }

        // 3. 查询支付记录
        IPage<PaymentRecord> paymentPage = this.page(page, wrapper);

        // 4. 获取所有关联的订单ID
        Set<Integer> orderIds = paymentPage.getRecords().stream()
                .map(PaymentRecord::getOrderId)
                .collect(Collectors.toSet());

        // 5. 批量查询订单信息
        Map<Integer, GroupBuyingOrder> orderMap = new HashMap<>();
        Set<Integer> activityIds = new HashSet<>();

        if (!orderIds.isEmpty()) {
            LambdaQueryWrapper<GroupBuyingOrder> orderWrapper = new LambdaQueryWrapper<>();
            orderWrapper.in(GroupBuyingOrder::getOrderId, orderIds);
            if (activityId != null) {
                orderWrapper.eq(GroupBuyingOrder::getActivityId, activityId);
            }
            List<GroupBuyingOrder> orders = orderService.list(orderWrapper);
            orderMap = orders.stream()
                    .collect(Collectors.toMap(GroupBuyingOrder::getOrderId, order -> order));

            // 收集活动ID
            activityIds = orders.stream()
                    .map(GroupBuyingOrder::getActivityId)
                    .collect(Collectors.toSet());
        }

        // 6. 批量查询活动信息
        Map<Integer, GroupBuyingActivity> activityMap = new HashMap<>();
        if (!activityIds.isEmpty()) {
            LambdaQueryWrapper<GroupBuyingActivity> activityWrapper = new LambdaQueryWrapper<>();
            activityWrapper.in(GroupBuyingActivity::getActivityId, activityIds);
            List<GroupBuyingActivity> activities = activityService.list(activityWrapper);
            activityMap = activities.stream()
                    .collect(Collectors.toMap(GroupBuyingActivity::getActivityId, activity -> activity));
        }

        // 7. 组装VO对象
        IPage<PaymentQueryVO> resultPage = new Page<>(current, size, paymentPage.getTotal());
        List<PaymentQueryVO> voList = new ArrayList<>();

        for (PaymentRecord payment : paymentPage.getRecords()) {
            PaymentQueryVO vo = new PaymentQueryVO();
            vo.setPayment(payment);

            // 设置订单信息
            GroupBuyingOrder order = orderMap.get(payment.getOrderId());
            vo.setOrder(order);

            // 设置活动信息
            if (order != null) {
                vo.setActivity(activityMap.get(order.getActivityId()));
            }

            voList.add(vo);
        }

        resultPage.setRecords(voList);
        return resultPage;
    }

    @Override
    public PaymentStatisticsVO getPaymentStatistics(LocalDateTime startTime, LocalDateTime endTime) {
        PaymentStatisticsVO statistics = new PaymentStatisticsVO();

        // 1. 构建查询条件
        LambdaQueryWrapper<PaymentRecord> wrapper = new LambdaQueryWrapper<>();
        if (startTime != null) {
            wrapper.ge(PaymentRecord::getPaymentTime, startTime);
        }
        if (endTime != null) {
            wrapper.le(PaymentRecord::getPaymentTime, endTime);
        }
        wrapper.orderByAsc(PaymentRecord::getPaymentTime);
        List<PaymentRecord> payments = this.list(wrapper);

        // 2. 计算总支付金额
        BigDecimal totalAmount = payments.stream()
                .map(PaymentRecord::getPaymentAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        statistics.setTotalAmount(totalAmount);

        // 3. 设置支付笔数
        statistics.setPaymentCount(payments.size());

        // 4. 计算平均支付金额
        BigDecimal averageAmount = payments.isEmpty() ? BigDecimal.ZERO :
                totalAmount.divide(new BigDecimal(payments.size()), 2, RoundingMode.HALF_UP);
        statistics.setAverageAmount(averageAmount);

        // 5. 计算支付转化率（假设每个订单都有对应的支付记录）
        // TODO: 实际项目中需要根据订单总数来计算
        statistics.setConversionRate(new BigDecimal("88.5"));

        // 6. 按日期分组计算支付金额趋势（取最近5天数据）
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        Map<String, BigDecimal> dailyAmounts = payments.stream()
                .collect(Collectors.groupingBy(
                        payment -> payment.getPaymentTime().format(formatter),
                        Collectors.mapping(
                                PaymentRecord::getPaymentAmount,
                                Collectors.reducing(BigDecimal.ZERO, BigDecimal::add)
                        )
                ));

        // 转换为列表格式并只取最近5天数据
        List<PaymentStatisticsVO.DailyPayment> trend = dailyAmounts.entrySet().stream()
                .map(entry -> {
                    PaymentStatisticsVO.DailyPayment daily = new PaymentStatisticsVO.DailyPayment();
                    daily.setDate(entry.getKey());
                    daily.setAmount(entry.getValue());
                    return daily;
                })
                .sorted(Comparator.comparing(PaymentStatisticsVO.DailyPayment::getDate).reversed()) // 按日期倒序
                .limit(5) // 只取5条
                .sorted(Comparator.comparing(PaymentStatisticsVO.DailyPayment::getDate)) // 再按日期正序
                .collect(Collectors.toList());
        statistics.setPaymentTrend(trend);

        // 7. 计算支付方式分布
        Map<String, Integer> methodDistribution = payments.stream()
                .collect(Collectors.groupingBy(
                        PaymentRecord::getPaymentMethod,
                        Collectors.collectingAndThen(Collectors.counting(), Long::intValue)
                ));
        statistics.setPaymentMethodDistribution(methodDistribution);

        return statistics;
    }
}
