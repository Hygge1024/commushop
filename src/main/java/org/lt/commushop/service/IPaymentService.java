package org.lt.commushop.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.service.IService;
import org.lt.commushop.domain.entity.PaymentRecord;
import org.lt.commushop.domain.vo.PaymentQueryVO;
import org.lt.commushop.domain.vo.PaymentStatisticsVO;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * <p>
 * 支付服务接口
 * </p>
 *
 * @author tao
 * @since 2025-01-21
 */
public interface IPaymentService extends IService<PaymentRecord> {

    /**
     * 创建订单支付记录
     *
     * @param orderId 订单ID
     * @param paymentMethod 支付方式
     * @return 支付记录ID
     */
    Integer createPayment(Integer orderId, String paymentMethod);

    /**
     * 分页查询支付记录（只查询已支付的记录）
     *
     * @param current 当前页码
     * @param size 每页数量
     * @param orderId 订单ID
     * @param userId 用户ID
     * @param minAmount 最小支付金额
     * @param maxAmount 最大支付金额
     * @param startTime 开始时间
     * @param endTime 结束时间
     * @return 分页结果
     */
    IPage<PaymentRecord> getPaymentPage(Integer current, Integer size,
                                      Integer orderId, Integer userId,
                                      BigDecimal minAmount, BigDecimal maxAmount,
                                      LocalDateTime startTime, LocalDateTime endTime);
    /**
     * 分页查询支付记录
     * @param current 当前页
     * @param size 每页大小
     * @param paymentId 支付ID
     * @param orderId 订单ID
     * @param activityId 活动ID
     * @param paymentMethod 支付方式
     * @param startTime 开始时间
     * @param endTime 结束时间
     * @return 支付记录分页数据
     */
    IPage<PaymentQueryVO> getPaymentPage(Integer current, Integer size,
                                         Integer paymentId, Integer orderId,
                                         Integer activityId, String paymentMethod,
                                         LocalDateTime startTime, LocalDateTime endTime);
    /**
     * 获取支付统计数据
     * @param startTime 开始时间，如果为空则不限制开始时间
     * @param endTime 结束时间，如果为空则不限制结束时间
     * @return 支付统计数据
     */
    PaymentStatisticsVO getPaymentStatistics(LocalDateTime startTime, LocalDateTime endTime);
}
