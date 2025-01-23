package org.lt.commushop.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import org.lt.commushop.common.Result;
import org.lt.commushop.domain.entity.Product;
import org.lt.commushop.service.IProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiParam;

import java.math.BigDecimal;

/**
 * <p>
 * 前端控制器
 * </p>
 *
 * @author tao
 * @since 2025-01-21
 */
@Api(tags = "商品管理模块")
@RestController
@RequestMapping("/product")
public class ProductController {
    @Autowired
    private IProductService productService;

    @ApiOperation(value = "商品分页查询", notes = "支持商品名称模糊搜索和价格区间筛选")
    @GetMapping("/page")
    public Result<IPage<Product>> getProductPage(
            @ApiParam(value = "当前页码", defaultValue = "1") @RequestParam(defaultValue = "1") Integer current,
            @ApiParam(value = "每页数量", defaultValue = "10") @RequestParam(defaultValue = "10") Integer size,
            @ApiParam(value = "商品名称（支持模糊查询）") @RequestParam(required = false) String productName,
            @ApiParam(value = "最低原价") @RequestParam(required = false) BigDecimal minOriginalPrice,
            @ApiParam(value = "最高原价") @RequestParam(required = false) BigDecimal maxOriginalPrice,
            @ApiParam(value = "最低团购价") @RequestParam(required = false) BigDecimal minGroupPrice,
            @ApiParam(value = "最高团购价") @RequestParam(required = false) BigDecimal maxGroupPrice) {
        return Result.success(productService.getProductPage(current, size,
                productName, minOriginalPrice, maxOriginalPrice,
                minGroupPrice, maxGroupPrice));
    }

    @ApiOperation(value = "商品详情", notes = "根据商品ID获取商品详情")
    @GetMapping("/{id}")
    public Result<Product> getProductDetail(@PathVariable Integer id) {
        return Result.success(productService.getById(id));
    }

    @ApiOperation(value = "商品上传", notes = "上传商品")
    @PostMapping("/upload")
    public Result<Product> uploadProduct(@RequestBody Product product) {
        return Result.success(productService.uploadProduct(product));
    }

}
