package org.lt.commushop.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiParam;
import org.lt.commushop.common.Result;
import org.lt.commushop.domain.entity.GroupBuyingOrder;
import org.lt.commushop.domain.vo.OrderQueryVO;
import org.lt.commushop.domain.vo.OrderStatisticsVO;
import org.lt.commushop.dto.OrderQueryDTO;
import org.lt.commushop.service.IGroupBuyingOrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * <p>
 *  前端控制器
 * </p>
 *
 * @author tao
 * @since 2025-01-21
 */
@Api(tags = "团购订单管理")
@RestController
@RequestMapping("/group-buying-order")
public class GroupBuyingOrderController {

    @Autowired
    private IGroupBuyingOrderService orderService;

    @ApiOperation(value = "创建团购订单", notes = "用户参与团购活动创建订单")
    @PostMapping("/create")
    public Result<Integer> createOrder(
            @ApiParam(value = "活动编码", required = true) @RequestParam String activityCode,
            @ApiParam(value = "用户ID", required = true) @RequestParam Integer userId,
            @ApiParam(value = "购买数量", required = true) @RequestParam Integer quantity) {

        Integer orderId = orderService.createOrder(activityCode, userId, quantity);
        return Result.success(orderId, "创建订单成功");
    }

    @ApiOperation(value = "删除团购订单", notes = "只能删除未支付的订单")
    @DeleteMapping("/{orderId}")
    public Result<Boolean> deleteOrder(
            @ApiParam(value = "订单ID", required = true) @PathVariable Integer orderId,
            @ApiParam(value = "用户ID", required = true) @RequestParam Integer userId) {

        boolean success = orderService.deleteOrder(orderId, userId);
        return Result.success(success, "删除订单成功");
    }

    @ApiOperation(value = "团购订单分页查询", notes = "支持活动ID、订单状态、金额范围、时间范围等多条件筛选")
    @GetMapping("/page")
    public Result<IPage<GroupBuyingOrder>> getOrderPage(
            @ApiParam(value = "当前页码", defaultValue = "1") @RequestParam(defaultValue = "1") Integer current,
            @ApiParam(value = "每页数量", defaultValue = "10") @RequestParam(defaultValue = "10") Integer size,
            @ApiParam(value = "用户ID") @RequestParam(required = false) Integer userId,
            @ApiParam(value = "活动ID") @RequestParam(required = false) Integer activityId,
            @ApiParam(value = "订单状态：1-待支付，2-已支付，3-已取消") @RequestParam(required = false) Integer orderStatus,
            @ApiParam(value = "最小订单金额") @RequestParam(required = false) BigDecimal minAmount,
            @ApiParam(value = "最大订单金额") @RequestParam(required = false) BigDecimal maxAmount,
            @ApiParam(value = "开始时间", example = "2025-02-07 00:00:00")
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime startTime,
            @ApiParam(value = "结束时间", example = "2025-02-07 23:59:59")
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime endTime) {

        return Result.success(orderService.getOrderPage(current, size,
                userId, activityId, orderStatus,
                minAmount, maxAmount,
                startTime, endTime));
    }

    @ApiOperation(value = "订单分页查询", notes = "支持订单ID、活动名称、用户ID、订单状态、创建时间范围等多条件筛选")
    @GetMapping("/order/page")
    public Result<IPage<OrderQueryVO>> getOrderPage(
            @ApiParam(value = "当前页码", defaultValue = "1") @RequestParam(defaultValue = "1") Integer current,
            @ApiParam(value = "每页数量", defaultValue = "10") @RequestParam(defaultValue = "10") Integer size,
            @ApiParam(value = "用户ID") @RequestParam(required = false) Integer userId,
            @ApiParam(value = "活动名称") @RequestParam(required = false) String activityName,
            @ApiParam(value = "订单状态：1-待支付，2-已支付，3-已取消") @RequestParam(required = false) Integer orderStatus,
            @ApiParam(value = "最小订单金额") @RequestParam(required = false) BigDecimal minAmount,
            @ApiParam(value = "最大订单金额") @RequestParam(required = false) BigDecimal maxAmount,
            @ApiParam(value = "开始时间", example = "2025-02-07 00:00:00")
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime startTime,
            @ApiParam(value = "结束时间", example = "2025-02-07 23:59:59")
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime endTime) {

        return Result.success(orderService.getOrderPage(current, size,
                userId, activityName, orderStatus,
                minAmount, maxAmount,
                startTime, endTime));
    }

    @PostMapping("/{orderId}/ship")
    @ApiOperation("订单发货")
    public Result<Boolean> shipOrder(
            @ApiParam(value = "订单ID", required = true)
            @PathVariable Integer orderId) {
        return Result.success(orderService.shipOrder(orderId));
    }

    @GetMapping("/statistics")
    @ApiOperation("获取订单统计信息")
    public Result<OrderStatisticsVO> getOrderStatistics() {
        return Result.success(orderService.getOrderStatistics());
    }
}
