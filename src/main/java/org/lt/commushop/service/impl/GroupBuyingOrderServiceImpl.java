package org.lt.commushop.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.core.toolkit.StringUtils;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import org.lt.commushop.domain.entity.GroupBuyingActivity;
import org.lt.commushop.domain.entity.GroupBuyingOrder;
import org.lt.commushop.domain.entity.ActivityIncludeProduct;
import org.lt.commushop.domain.entity.Product;
import org.lt.commushop.domain.vo.OrderQueryVO;
import org.lt.commushop.domain.vo.OrderStatisticsVO;
import org.lt.commushop.dto.OrderQueryDTO;
import org.lt.commushop.exception.BusinessException;
import org.lt.commushop.mapper.GroupBuyingOrderMapper;
import org.lt.commushop.mapper.ActivityIncludeProductMapper;
import org.lt.commushop.service.IGroupBuyingActivityService;
import org.lt.commushop.service.IProductService;
import org.lt.commushop.service.IGroupBuyingOrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
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
    public Integer createOrder(String activityCode, Integer userId, Integer quantity,String address,Integer leaderId) {
        // 1. 参数校验
        if (activityCode == null || activityCode.trim().isEmpty() || userId == null || quantity == null || quantity <= 0 || address == null || leaderId == null) {
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
                .setCreateTime(LocalDateTime.now())
                .setAddress(address)
                .setLeaderId(leaderId);

        // 计算订单总金额
        order.setOrderAmount(totalUnitPrice.multiply(BigDecimal.valueOf(quantity)));
        order.setIsDeleted(0);

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

        // 5. 检查订单是否已被删除
        if (order.getIsDeleted() == 1) {
            throw new BusinessException("订单已被删除");
        }

        // 6. 软删除订单
        order.setIsDeleted(1);
        return this.updateById(order);
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

        // 3.1 过滤已删除的订单
        queryWrapper.eq(GroupBuyingOrder::getIsDeleted, 0);

        // 3.2 用户ID查询（非必填）
        if (userId != null) {
            queryWrapper.eq(GroupBuyingOrder::getUserId, userId);
        }

        // 3.3 活动ID查询
        if (activityId != null) {
            queryWrapper.eq(GroupBuyingOrder::getActivityId, activityId);
        }

        // 3.4 订单状态查询
        if (orderStatus != null) {
            queryWrapper.eq(GroupBuyingOrder::getOrderStatus, orderStatus);
        }

        // 3.5 订单金额范围查询
        if (minAmount != null) {
            queryWrapper.ge(GroupBuyingOrder::getOrderAmount, minAmount);
        }
        if (maxAmount != null) {
            queryWrapper.le(GroupBuyingOrder::getOrderAmount, maxAmount);
        }

        // 3.6 创建时间范围查询
        if (startTime != null) {
            queryWrapper.ge(GroupBuyingOrder::getCreateTime, startTime);
        }
        if (endTime != null) {
            queryWrapper.le(GroupBuyingOrder::getCreateTime, endTime);
        }

        // 3.7 按创建时间倒序排序
        queryWrapper.orderByDesc(GroupBuyingOrder::getCreateTime);

        // 4. 执行分页查询
        return this.page(page, queryWrapper);
    }

    @Override
    public IPage<OrderQueryVO> getOrderPage(Integer current, Integer size,
                                          Integer userId, String activityName,
                                          Integer orderStatus,
                                          BigDecimal minAmount, BigDecimal maxAmount,Integer leaderId,
                                          LocalDateTime startTime, LocalDateTime endTime) {
        // 1. 创建分页对象
        Page<GroupBuyingOrder> page = new Page<>(current, size);

        // 2. 构建查询条件
        LambdaQueryWrapper<GroupBuyingOrder> orderWrapper = new LambdaQueryWrapper<>();

        // 3. 如果有活动名称，先查询活动ID列表
        if (StringUtils.isNotBlank(activityName)) {
            LambdaQueryWrapper<GroupBuyingActivity> activityWrapper = new LambdaQueryWrapper<>();
            activityWrapper.like(GroupBuyingActivity::getActivityName, activityName);
            List<GroupBuyingActivity> activities = activityService.list(activityWrapper);
            if (!activities.isEmpty()) {
                List<Integer> activityIds = activities.stream()
                        .map(GroupBuyingActivity::getActivityId)
                        .collect(Collectors.toList());
                orderWrapper.in(GroupBuyingOrder::getActivityId, activityIds);
            } else {
                // 如果没找到匹配的活动，返回空结果
                return new Page<>(current, size, 0);
            }
        }

        // 4. 添加其他查询条件
        if (userId != null) {
            orderWrapper.eq(GroupBuyingOrder::getUserId, userId);
        }
        if (orderStatus != null) {
            orderWrapper.eq(GroupBuyingOrder::getOrderStatus, orderStatus);
        }
        if (minAmount != null) {
            orderWrapper.ge(GroupBuyingOrder::getOrderAmount, minAmount);
        }
        if (maxAmount != null) {
            orderWrapper.le(GroupBuyingOrder::getOrderAmount, maxAmount);
        }
        if(leaderId != null){
            orderWrapper.eq(GroupBuyingOrder::getLeaderId, leaderId);
        }
        if (startTime != null) {
            orderWrapper.ge(GroupBuyingOrder::getCreateTime, startTime);
        }
        if (endTime != null) {
            orderWrapper.le(GroupBuyingOrder::getCreateTime, endTime);
        }
        orderWrapper.orderByDesc(GroupBuyingOrder::getCreateTime);

        // 5. 查询订单
        IPage<GroupBuyingOrder> orderPage = this.page(page, orderWrapper);

        // 6. 转换为VO对象
        IPage<OrderQueryVO> resultPage = new Page<>(current, size, orderPage.getTotal());
        List<OrderQueryVO> voList = new ArrayList<>();

        // 7. 获取所有相关的活动ID
        Set<Integer> activityIds = orderPage.getRecords().stream()
                .map(GroupBuyingOrder::getActivityId)
                .collect(Collectors.toSet());

        // 8. 批量查询活动信息和关联的商品
        Map<Integer, GroupBuyingActivity> activityMap = new HashMap<>();
        Map<Integer, List<Product>> activityProductsMap = new HashMap<>();

        if (!activityIds.isEmpty()) {
            // 查询活动信息
            LambdaQueryWrapper<GroupBuyingActivity> activityWrapper = new LambdaQueryWrapper<>();
            activityWrapper.in(GroupBuyingActivity::getActivityId, activityIds);
            List<GroupBuyingActivity> activities = activityService.list(activityWrapper);
            activityMap = activities.stream()
                    .collect(Collectors.toMap(GroupBuyingActivity::getActivityId, activity -> activity));

            // 获取所有活动编码
            Set<String> activityCodes = activities.stream()
                    .map(GroupBuyingActivity::getActivityCode)
                    .collect(Collectors.toSet());

            // 查询活动关联的商品
            LambdaQueryWrapper<ActivityIncludeProduct> productWrapper = new LambdaQueryWrapper<>();
            productWrapper.in(ActivityIncludeProduct::getPActivityCode, activityCodes);
            List<ActivityIncludeProduct> activityProducts = activityIncludeProductMapper.selectList(productWrapper);

            // 获取所有商品ID
            Set<Integer> productIds = activityProducts.stream()
                    .map(ActivityIncludeProduct::getProductId)
                    .collect(Collectors.toSet());

            // 批量查询商品信息
            Map<Integer, Product> productMap;
            if (!productIds.isEmpty()) {
                LambdaQueryWrapper<Product> pWrapper = new LambdaQueryWrapper<>();
                pWrapper.in(Product::getProductId, productIds);
                List<Product> products = productService.list(pWrapper);
                productMap = products.stream()
                        .collect(Collectors.toMap(Product::getProductId, p -> p));
            } else {
                productMap = new HashMap<>();
            }

            // 创建活动编码到活动ID的映射
            Map<String, Integer> codeToIdMap = activities.stream()
                    .collect(Collectors.toMap(GroupBuyingActivity::getActivityCode, GroupBuyingActivity::getActivityId));

            // 按活动编码分组商品
            Map<String, List<ActivityIncludeProduct>> groupedProducts = activityProducts.stream()
                    .collect(Collectors.groupingBy(ActivityIncludeProduct::getPActivityCode));

            // 构建活动-商品映射
            groupedProducts.forEach((activityCode, relations) -> {
                Integer activityId = codeToIdMap.get(activityCode);
                if (activityId != null) {
                    List<Product> products = relations.stream()
                            .map(relation -> productMap.get(relation.getProductId()))
                            .filter(Objects::nonNull)
                            .collect(Collectors.toList());
                    activityProductsMap.put(activityId, products);
                }
            });
        }

        // 9. 组装VO对象
        for (GroupBuyingOrder order : orderPage.getRecords()) {
            OrderQueryVO vo = new OrderQueryVO();
            vo.setOrder(order);
            Integer activityId = order.getActivityId();
            vo.setActivity(activityMap.get(activityId));
            vo.setProducts(activityProductsMap.getOrDefault(activityId, new ArrayList<>()));
            voList.add(vo);
        }

        resultPage.setRecords(voList);
        return resultPage;
    }

    @Override
    public OrderStatisticsVO getOrderStatistics() {
        OrderStatisticsVO statistics = new OrderStatisticsVO();

        // 1. 查询所有未删除的订单
        LambdaQueryWrapper<GroupBuyingOrder> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(GroupBuyingOrder::getIsDeleted, 0);
        List<GroupBuyingOrder> orders = this.list(wrapper);

        // 2. 计算总订单数
        statistics.setTotalOrders((long) orders.size());

        // 3. 计算总金额
        BigDecimal totalAmount = orders.stream()
                .map(GroupBuyingOrder::getOrderAmount)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        statistics.setTotalAmount(totalAmount);

        // 4. 计算下单用户数
        long uniqueUsers = orders.stream()
                .map(GroupBuyingOrder::getUserId)
                .distinct()
                .count();
        statistics.setUniqueUsers(uniqueUsers);

        // 5. 计算订单趋势（按周几分组）
        Map<String, List<GroupBuyingOrder>> dailyOrders = orders.stream()
                .collect(Collectors.groupingBy(order -> {
                    int dayOfWeek = order.getCreateTime().getDayOfWeek().getValue(); // 1-7
                    return "周" + CHINESE_NUMBERS[dayOfWeek - 1];
                }));

        // 计算每日订单数
        Map<String, Long> dailyOrderCounts = new LinkedHashMap<>(); // 保持顺序
        Map<String, BigDecimal> dailyOrderAmounts = new LinkedHashMap<>();

        // 确保所有天都有数据，即使是0
        for (int i = 0; i < 7; i++) {
            String day = "周" + CHINESE_NUMBERS[i];
            List<GroupBuyingOrder> dayOrders = dailyOrders.getOrDefault(day, Collections.emptyList());

            // 订单数
            dailyOrderCounts.put(day, (long) dayOrders.size());

            // 订单金额
            BigDecimal dayAmount = dayOrders.stream()
                    .map(GroupBuyingOrder::getOrderAmount)
                    .filter(Objects::nonNull)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            dailyOrderAmounts.put(day, dayAmount);
        }

        statistics.setDailyOrderCounts(dailyOrderCounts);
        statistics.setDailyOrderAmounts(dailyOrderAmounts);

        // 6. 计算订单状态分布
        Map<Integer, Long> statusCounts = orders.stream()
                .collect(Collectors.groupingBy(
                        GroupBuyingOrder::getOrderStatus,
                        Collectors.counting()
                ));

        // 确保所有状态都有数据，即使是0
        Map<Integer, Long> allStatusCounts = new HashMap<>();
        for (int status = 1; status <= 5; status++) {
            allStatusCounts.put(status, statusCounts.getOrDefault(status, 0L));
        }

        statistics.setOrderStatusCounts(allStatusCounts);

        return statistics;
    }

    @Override
    public boolean shipOrder(Integer orderId,Integer orderStatus) {
        // 1. 查询订单是否存在
        GroupBuyingOrder order = this.getById(orderId);
        if (order == null) {
            throw new BusinessException("订单不存在");
        }

//        // 2. 检查订单状态是否为已支付（3）
//        if (!order.getOrderStatus().equals(3)) {
//            throw new BusinessException("只有已支付的订单才能发货");
//        }

        // 3. 更新订单状态:未支付_1、支付中_2、已支付_3（也就表示待发货）、已发货_4、已完成_5(也就表示已收货完成)
        if(orderStatus != null){
            order.setOrderStatus(orderStatus);
        }
        return this.updateById(order);
    }
    @Override
    public boolean updateAddress(Integer orderId,String newAddress) {
        // 1. 查询订单是否存在
        GroupBuyingOrder order = this.getById(orderId);
        if (order == null) {
            throw new BusinessException("订单不存在");
        }

        // 3. 更新订单地址
        if(newAddress != null){
            order.setAddress(newAddress);
        }
        return this.updateById(order);
    }

    // 用于转换周几的数字
    private static final String[] CHINESE_NUMBERS = {"一", "二", "三", "四", "五", "六", "日"};
}
