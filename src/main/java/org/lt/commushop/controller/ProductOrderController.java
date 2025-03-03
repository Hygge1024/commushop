package org.lt.commushop.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiParam;
import org.lt.commushop.common.Result;
import org.lt.commushop.domain.entity.ProductOrder;
import org.lt.commushop.service.IProductOrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@Api(tags = "商品订单管理模块")
@RestController
@RequestMapping("/porder")
public class ProductOrderController {
    @Autowired
    private IProductOrderService productOrderService;

    @ApiOperation(value = "查询用户订单", notes = "分页查询用户的订单信息")
    @GetMapping("/user")
    public Result<IPage<ProductOrder>> getProductOrderPage(
            @ApiParam(value = "当前页码", defaultValue = "1") @RequestParam(defaultValue = "1") Integer current,
            @ApiParam(value = "每页数量", defaultValue = "10") @RequestParam(defaultValue = "10") Integer size,
            @ApiParam(value = "用户ID") @RequestParam Integer userId) {
        return Result.success(productOrderService.getProductOrderPage(current, size, userId));
    }

    @ApiOperation(value = "创建订单")
    @PostMapping("/add")
    public Result<ProductOrder> addOrder(@RequestBody ProductOrder productOrder) {
        return Result.success(productOrderService.addOrder(productOrder));
    }

    @ApiOperation(value = "更新订单信息")
    @PutMapping("/update")
    public Result<Boolean> updateOrder(@RequestBody ProductOrder productOrder) {
        return Result.success(productOrderService.updateOrder(productOrder));
    }

    @ApiOperation(value = "删除订单")
    @DeleteMapping("/delete/{orderId}")
    public Result<Boolean> deleteOrder(@PathVariable("orderId") Integer orderId) {
        return Result.success(productOrderService.softDelete(orderId));
    }
}
