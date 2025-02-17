package org.lt.commushop.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiParam;
import org.lt.commushop.common.Result;
import org.lt.commushop.domain.entity.PaymentRecord;
import org.lt.commushop.domain.vo.PaymentQueryVO;
import org.lt.commushop.domain.vo.PaymentStatisticsVO;
import org.lt.commushop.service.IPaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * <p>
 * 支付记录前端控制器
 * </p>
 *
 * @author tao
 * @since 2025-01-21
 */
@Api(tags = "支付记录管理")
@RestController
@RequestMapping("/payment")
public class PaymentController {

    @Autowired
    private IPaymentService paymentService;

    @ApiOperation(value = "创建支付记录")
    @PostMapping("/create")
    public Result<Integer> createPayment(
            @ApiParam(value = "订单ID", required = true) @RequestParam Integer orderId,
            @ApiParam(value = "支付方式", required = true) @RequestParam String paymentMethod) {

        Integer paymentId = paymentService.createPayment(orderId, paymentMethod);
        return Result.success(paymentId, "创建支付记录成功");
    }
    @ApiOperation(value = "支付记录分页查询", notes = "查询指定用户的已支付记录，支持订单ID、金额范围、时间范围等多条件筛选")
    @GetMapping("/page")
    public Result<IPage<PaymentRecord>> getPaymentPage(
            @ApiParam(value = "当前页码", required = true) @RequestParam Integer current,
            @ApiParam(value = "每页数量", required = true) @RequestParam Integer size,
            @ApiParam(value = "用户ID", required = true) @RequestParam Integer userId,
            @ApiParam(value = "订单ID（可选，如果指定则必须是该用户的订单）") @RequestParam(required = false) Integer orderId,
            @ApiParam(value = "最小支付金额") @RequestParam(required = false) BigDecimal minAmount,
            @ApiParam(value = "最大支付金额") @RequestParam(required = false) BigDecimal maxAmount,
            @ApiParam(value = "开始时间", example = "2025-02-07 00:00:00")
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime startTime,
            @ApiParam(value = "结束时间", example = "2025-02-07 23:59:59")
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime endTime) {

        return Result.success(paymentService.getPaymentPage(current, size,
                orderId, userId,
                minAmount, maxAmount,
                startTime, endTime));
    }
    @GetMapping("/pageDetails")
    @ApiOperation("分页查询支付记录")
    public Result<IPage<PaymentQueryVO>> getPaymentPage(
            @RequestParam(value = "current", defaultValue = "1") Integer current,
            @RequestParam(value = "size", defaultValue = "10") Integer size,
            @RequestParam(value = "paymentId", required = false) Integer paymentId,
            @RequestParam(value = "orderId", required = false) Integer orderId,
            @RequestParam(value = "activityName", required = false) String activityName,
            @RequestParam(value = "paymentMethod", required = false) String paymentMethod,
            @RequestParam(value = "startTime", required = false) @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime startTime,
            @RequestParam(value = "endTime", required = false) @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime endTime) {

        IPage<PaymentQueryVO> page = paymentService.getPaymentdetailsPage(
                current, size, paymentId, orderId, activityName, paymentMethod, startTime, endTime);
        
        return Result.success(page);
    }
    @GetMapping("/statistics")
    @ApiOperation("获取支付统计数据")
    public Result<PaymentStatisticsVO> getPaymentStatistics(
            @ApiParam(value = "开始时间", example = "2024-01-01 00:00:00")
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime startTime,
            @ApiParam(value = "结束时间", example = "2024-01-05 23:59:59")
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime endTime) {

        return Result.success(paymentService.getPaymentStatistics(startTime, endTime));
    }
}
