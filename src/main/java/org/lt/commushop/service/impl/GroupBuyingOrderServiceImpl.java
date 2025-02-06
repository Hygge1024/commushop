package org.lt.commushop.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import org.lt.commushop.domain.entity.GroupBuyingActivity;
import org.lt.commushop.domain.entity.GroupBuyingOrder;
import org.lt.commushop.domain.entity.ActivityIncludeProduct;
import org.lt.commushop.domain.entity.Product;
import org.lt.commushop.exception.BusinessException;
import org.lt.commushop.mapper.GroupBuyingOrderMapper;
import org.lt.commushop.mapper.ActivityIncludeProductMapper;
import org.lt.commushop.service.IGroupBuyingActivityService;
import org.lt.commushop.service.IProductService;
import org.lt.commushop.service.IGroupBuyingOrderService;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * <p>
 *  服务实现类
 * </p>
 *
 * @author tao
 * @since 2025-01-21
 */
@Service
public class GroupBuyingOrderServiceImpl extends ServiceImpl<GroupBuyingOrderMapper, GroupBuyingOrder> implements IGroupBuyingOrderService {

    @Autowired
    private IGroupBuyingActivityService activityService;

    @Autowired
    private ActivityIncludeProductMapper activityIncludeProductMapper;

    @Autowired
    private IProductService productService;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Integer createOrder(String activityCode, Integer userId, Integer quantity) {
        // 1. 参数校验
        if (activityCode == null || activityCode.trim().isEmpty() || userId == null || quantity == null || quantity <= 0) {
            throw new BusinessException("参数错误");
        }

        // 2. 检查活动是否存在且有效
        LambdaQueryWrapper<GroupBuyingActivity> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(GroupBuyingActivity::getActivityCode, activityCode);
        GroupBuyingActivity activity = activityService.getOne(queryWrapper);
        
        if (activity == null) {
            throw new BusinessException("活动不存在");
        }

        LocalDateTime now = LocalDateTime.now();
        if (now.isBefore(activity.getActivityStartTime())) {
            throw new BusinessException("活动尚未开始");
        }
        if (now.isAfter(activity.getActivityEndTime())) {
            throw new BusinessException("活动已结束");
        }

        // 3. 获取活动包含的所有商品及其团购价格
        LambdaQueryWrapper<ActivityIncludeProduct> productWrapper = new LambdaQueryWrapper<>();
        productWrapper.eq(ActivityIncludeProduct::getPActivityCode, activityCode);
        List<ActivityIncludeProduct> activityProducts = activityIncludeProductMapper.selectList(productWrapper);
        
        if (activityProducts.isEmpty()) {
            throw new BusinessException("活动未关联任何商品");
        }

        // 4. 计算所有商品的团购价格总和
        BigDecimal totalUnitPrice = activityProducts.stream()
                .map(ap -> {
                    Product product = productService.getById(ap.getProductId());
                    return product != null ? product.getGroupPrice() : BigDecimal.ZERO;
                })
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        if (totalUnitPrice.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException("商品价格异常");
        }

        // 5. 创建订单
        GroupBuyingOrder order = new GroupBuyingOrder()
                .setActivityId(activity.getActivityId())
                .setUserId(userId)
                .setQuantity(quantity)
                .setOrderStatus(1) // 1表示未支付
                .setCreateTime(LocalDateTime.now());
        
        // 计算订单总金额
        order.setOrderAmount(totalUnitPrice.multiply(BigDecimal.valueOf(quantity)));

        // 6. 保存订单
        this.save(order);

        return order.getOrderId();
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean deleteOrder(Integer orderId, Integer userId) {
        // 1. 参数校验
        if (orderId == null || userId == null) {
            throw new BusinessException("参数错误");
        }

        // 2. 查询订单
        GroupBuyingOrder order = this.getById(orderId);
        if (order == null) {
            throw new BusinessException("订单不存在");
        }

        // 3. 验证订单所属权
        if (!order.getUserId().equals(userId)) {
            throw new BusinessException("无权操作此订单");
        }

        // 4. 检查订单状态
        if (order.getOrderStatus() != 1) {
            throw new BusinessException("只能删除未支付的订单");
        }

        // 5. 删除订单
        return this.removeById(orderId);
    }

    @Override
    public IPage<GroupBuyingOrder> getOrderPage(Integer current, Integer size,
                                              Integer userId, Integer activityId,
                                              Integer orderStatus,
                                              BigDecimal minAmount, BigDecimal maxAmount,
                                              LocalDateTime startTime, LocalDateTime endTime) {
        // 1. 参数校验
        if (current == null || current < 1) {
            throw new BusinessException("当前页码不能小于1");
        }
        if (size == null || size < 1) {
            throw new BusinessException("每页数量不能小于1");
        }

        // 2. 创建分页对象
        Page<GroupBuyingOrder> page = new Page<>(current, size);

        // 3. 构建查询条件
        LambdaQueryWrapper<GroupBuyingOrder> queryWrapper = new LambdaQueryWrapper<>();
        
        // 3.1 用户ID查询（非必填）
        if (userId != null) {
            queryWrapper.eq(GroupBuyingOrder::getUserId, userId);
        }
        
        // 3.2 活动ID查询
        if (activityId != null) {
            queryWrapper.eq(GroupBuyingOrder::getActivityId, activityId);
        }
        
        // 3.3 订单状态查询
        if (orderStatus != null) {
            queryWrapper.eq(GroupBuyingOrder::getOrderStatus, orderStatus);
        }
        
        // 3.4 订单金额范围查询
        if (minAmount != null) {
            queryWrapper.ge(GroupBuyingOrder::getOrderAmount, minAmount);
        }
        if (maxAmount != null) {
            queryWrapper.le(GroupBuyingOrder::getOrderAmount, maxAmount);
        }
        
        // 3.5 创建时间范围查询
        if (startTime != null) {
            queryWrapper.ge(GroupBuyingOrder::getCreateTime, startTime);
        }
        if (endTime != null) {
            queryWrapper.le(GroupBuyingOrder::getCreateTime, endTime);
        }
        
        // 3.6 按创建时间倒序排序
        queryWrapper.orderByDesc(GroupBuyingOrder::getCreateTime);

        // 4. 执行分页查询
        return this.page(page, queryWrapper);
    }
}
