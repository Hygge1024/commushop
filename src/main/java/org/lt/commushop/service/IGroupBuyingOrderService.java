package org.lt.commushop.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.service.IService;
import org.lt.commushop.domain.entity.GroupBuyingOrder;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * <p>
 * 团购订单服务接口
 * </p>
 *
 * @author tao
 * @since 2025-01-21
 */
public interface IGroupBuyingOrderService extends IService<GroupBuyingOrder> {
    
    /**
     * 创建团购订单
     *
     * @param activityCode 活动编码
     * @param userId 用户ID
     * @param quantity 购买数量
     * @return 订单ID
     */
    Integer createOrder(String activityCode, Integer userId, Integer quantity);

    /**
     * 删除团购订单
     * 只有未支付的订单才能删除
     *
     * @param orderId 订单ID
     * @param userId 用户ID（用于验证订单所属权）
     * @return 是否删除成功
     */
    boolean deleteOrder(Integer orderId, Integer userId);

    /**
     * 分页查询团购订单
     *
     * @param current 当前页码
     * @param size 每页数量
     * @param userId 用户ID（必填）
     * @param activityId 活动ID
     * @param orderStatus 订单状态
     * @param minAmount 最小订单金额
     * @param maxAmount 最大订单金额
     * @param startTime 开始时间
     * @param endTime 结束时间
     * @return 分页结果
     */
    IPage<GroupBuyingOrder> getOrderPage(Integer current, Integer size,
                                       Integer userId, Integer activityId,
                                       Integer orderStatus,
                                       BigDecimal minAmount, BigDecimal maxAmount,
                                       LocalDateTime startTime, LocalDateTime endTime);
}
