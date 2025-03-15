package org.lt.commushop.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiParam;
import org.lt.commushop.common.Result;
import org.lt.commushop.domain.entity.Order;
import org.lt.commushop.domain.entity.OrderProducts;
import org.lt.commushop.domain.vo.OrderProductVO;
import org.lt.commushop.service.IOrderProductsService;
import org.lt.commushop.service.IOrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Api(tags = "订单管理(投入使用版本)")
@RestController
@RequestMapping("/order")
public class OrderProductsController {
    @Autowired
    private IOrderService orderService;
    @Autowired
    private IOrderProductsService orderProductsService;

    @ApiOperation(value = "创建订单")
    @PostMapping("/create")
    public Result<Order> createOrder(@RequestBody Order order) {
        return Result.success(orderService.createOrder(order));
    }

    @ApiOperation(value = "分页查询订单")
    @GetMapping("/page")
    public Result<IPage<Order>> getOrderPage(
            @ApiParam(value = "当前页码", defaultValue = "1") @RequestParam(defaultValue = "1") Integer current,
            @ApiParam(value = "每页数量", defaultValue = "10") @RequestParam(defaultValue = "10") Integer size,
            @ApiParam(value = "用户ID") @RequestParam(required = false) Integer userId,
            @ApiParam(value = "订单状态") @RequestParam(required = false) Integer orderStatus,
            @ApiParam(value = "团长ID") @RequestParam(required = false) Integer leaderId,
            @ApiParam(value = "订单ID") @RequestParam(required = false) Integer orderId) {
        return Result.success(orderService.getOrderPage(current, size, userId, orderStatus, leaderId,orderId));
    }

    @ApiOperation(value = "更新订单")
    @PutMapping("/update")
    public Result<Boolean> updateOrder(@RequestBody Order order) {
        return Result.success(orderService.updateOrder(order));
    }

    @ApiOperation(value = "删除订单")
    @DeleteMapping("/delete/{orderId}")
    public Result<Boolean> deleteOrder(
            @ApiParam(value = "订单ID", required = true) @PathVariable Integer orderId) {
        return Result.success(orderService.softDeleteOrder(orderId));
    }

    // 订单——商品
    @ApiOperation(value = "批量添加订单商品")
    @PostMapping("/batch")
    public Result<Double> saveBatchOrderProducts(@RequestBody List<OrderProducts> orderProducts) {
        return Result.success(orderProductsService.saveBatchOrderProducts(orderProducts));
    }

    @ApiOperation(value = "分页查询订单商品")
    @GetMapping("/pagedetail")
    public Result<IPage<OrderProductVO>> getOrderProductsPage(
            @ApiParam(value = "当前页码", defaultValue = "1") @RequestParam(defaultValue = "1") Integer current,
            @ApiParam(value = "每页数量", defaultValue = "10") @RequestParam(defaultValue = "100") Integer size,
            @ApiParam(value = "订单编号") @RequestParam(required = false) String orderCode,
            @ApiParam(value = "用户ID") @RequestParam(required = false) Integer userId) {
        return Result.success(orderProductsService.getOrderProductsPage(current, size, orderCode, userId));
    }
}
