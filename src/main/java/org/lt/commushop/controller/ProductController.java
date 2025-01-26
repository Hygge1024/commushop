package org.lt.commushop.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import lombok.extern.slf4j.Slf4j;
import org.checkerframework.checker.units.qual.A;
import org.lt.commushop.common.Result;
import org.lt.commushop.config.MinioConfig;
import org.lt.commushop.domain.entity.Product;
import org.lt.commushop.service.IProductService;
import org.lt.commushop.service.UtilsService.MinioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiParam;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.io.InputStream;

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
@Slf4j
public class ProductController {
    @Autowired
    private IProductService productService;
    @Autowired
    private MinioService minioService;

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
        return Result.success(productService.getProductDetail(id));
    }

    @ApiOperation(value = "商品上传", notes = "上传商品")
    @PostMapping("/upload")
    public Result<Product> uploadProduct(@RequestParam("file") MultipartFile file, @ModelAttribute Product product) {
        try {
            // 上传文件并获取访问URL
            String fileUrl = minioService.uploadFile(file);
            product.setImage_url(fileUrl);
            return Result.success(productService.uploadProduct(product));
        } catch (Exception e) {
            log.error("商品上传失败", e);
            return Result.error("商品上传失败: " + e.getMessage());
        }
    }

    @ApiOperation(value = "更新商品", notes = "更新商品")
    @PutMapping("/update")
    public Result<Product> updateProduct(@RequestBody Product product) {
        return Result.success(productService.updateProduct(product));
    }

    @ApiOperation(value = "更新图片", notes = "更新图片")
    @PutMapping("/update-image/{productId}")
    public Result<Product> updateProductImage(
            @PathVariable("productId") Integer productId,
            @RequestParam("file") MultipartFile file) {
        try {
            String fileUrl = minioService.uploadFile(file);
            Product updatedProduct = productService.updateProductImage(productId, fileUrl);
            return Result.success(updatedProduct);
        } catch (Exception e) {
            log.error("商品图片更新失败", e);
            return Result.error("商品图片更新失败: " + e.getMessage());
        }
    }

    @ApiOperation(value = "删除商品", notes = "根据商品ID删除商品")
    @DeleteMapping("/delete/{productId}")
    public Result<String> deleteProduct(@PathVariable("productId") Integer productId) {
        Result<String> result = productService.deleteProduct(productId);
        if (result.isSuccess()) {
            log.info("成功删除商品，ID：" + productId);
        } else {
            log.warn("删除商品失败，ID：" + productId + "，原因：" + result.getMessage());
        }
        return result;
    }
}
