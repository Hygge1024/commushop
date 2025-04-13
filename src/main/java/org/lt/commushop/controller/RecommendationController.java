package org.lt.commushop.controller;

import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import org.lt.commushop.common.Result;
import org.lt.commushop.domain.Hander.RecommendItem;
import org.lt.commushop.domain.entity.Product;
import org.lt.commushop.domain.vo.RecommendedProduct;
import org.lt.commushop.service.IProductService;
import org.lt.commushop.service.UtilsService.ContentBasedService;
import org.lt.commushop.service.UtilsService.HybridRecommendationService;
import org.lt.commushop.service.UtilsService.ItemBasedCFService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Api(tags = "商品推荐系统接口")
@RestController
@RequestMapping("/recommend")
public class RecommendationController {
    //    基于物品的协同过滤 + 基于内容的推荐 = 混合推荐（融合CF和CBR）

    @Autowired
    private ItemBasedCFService itemBasedCFService;

    @Autowired
    private ContentBasedService contentBasedService;
    @Autowired
    private HybridRecommendationService hybridRecommendationService;
    @Autowired
    private IProductService productService;

    // 基于协同过滤的接口
    @ApiOperation("强制重新计算协同过滤相似度矩阵")
    @GetMapping("/cf/recalculate")
    public Result<String> recalculateCFSimilarity() {
        try {
            itemBasedCFService.calculateAndStoreSimilarityMatrix();
            return Result.success("协同过滤相似度矩阵重新计算完成");
        } catch (Exception e) {
            return Result.error("重新计算相似度矩阵失败：" + e.getMessage());
        }
    }

    @ApiOperation(value = "获取基于协同过滤的个性化商品推荐", notes = "基于用户的购买历史、收藏记录和评分数据")
    @GetMapping("/cf/products/{userId}")
    public Result<List<RecommendedProduct>> getCFRecommendations(
            @PathVariable Integer userId,
            @RequestParam(defaultValue = "10") Integer topK) {
        try {
            List<RecommendItem> recommendItems = itemBasedCFService.recommendProducts(userId, topK);
            
            // 转换为RecommendedProduct类型，与hybrid接口保持一致
            List<Integer> productIds = recommendItems.stream()
                    .map(RecommendItem::getProductId)
                    .collect(Collectors.toList());
            
            // 获取商品信息
            Map<Integer, Product> productMap = productService.listByIds(productIds).stream()
                    .collect(Collectors.toMap(Product::getProductId, p -> p));
            
            // 组装最终结果
            List<RecommendedProduct> recommendations = recommendItems.stream()
                    .map(item -> RecommendedProduct.fromProduct(
                            productMap.get(item.getProductId()),
                            item.getScore()))
                    .collect(Collectors.toList());
                    
            return Result.success(recommendations, "获取推荐商品成功");
        } catch (Exception e) {
            return Result.error("获取推荐商品失败：" + e.getMessage());
        }
    }

    // 基于内容的接口
    @ApiOperation("强制重新计算基于内容的相似度矩阵")
    @GetMapping("/content/recalculate")
    public Result<String> recalculateContentSimilarity() {
        try {
            contentBasedService.calculateAndStoreContentSimilarityMatrix();
            return Result.success("基于内容的相似度矩阵重新计算完成");
        } catch (Exception e) {
            return Result.error("重新计算相似度矩阵失败：" + e.getMessage());
        }
    }

    @ApiOperation(value = "获取基于内容的个性化商品推荐", notes = "基于用户标签和商品特征")
    @GetMapping("/content/products/{userId}")
    public Result<List<RecommendedProduct>> getContentBasedRecommendations(
            @PathVariable Integer userId,
            @RequestParam(defaultValue = "10") Integer topK) {
        try {
            List<RecommendItem> recommendItems = contentBasedService.recommendProducts(userId, topK);
            
            // 转换为RecommendedProduct类型，与hybrid接口保持一致
            List<Integer> productIds = recommendItems.stream()
                    .map(RecommendItem::getProductId)
                    .collect(Collectors.toList());
            
            // 获取商品信息
            Map<Integer, Product> productMap = productService.listByIds(productIds).stream()
                    .collect(Collectors.toMap(Product::getProductId, p -> p));
            
            // 组装最终结果
            List<RecommendedProduct> recommendations = recommendItems.stream()
                    .map(item -> RecommendedProduct.fromProduct(
                            productMap.get(item.getProductId()),
                            item.getScore()))
                    .collect(Collectors.toList());
                    
            return Result.success(recommendations, "获取推荐商品成功");
        } catch (Exception e) {
            return Result.error("获取推荐商品失败：" + e.getMessage());
        }
    }



    // 可选：用于测试的接口
    @ApiOperation("获取相似度矩阵(测试用)")
    @GetMapping("/test/similarity-matrix")
    public Result<Map<Integer, Map<Integer, Double>>> getSimilarityMatrix(
            @RequestParam(defaultValue = "cf") String type) {
        try {
            Map<Integer, Map<Integer, Double>> matrix;
            if ("cf".equals(type)) {
                matrix = itemBasedCFService.getSimilarityMatrix();
            } else {
                matrix = contentBasedService.getContentSimilarityMatrix();
            }
            return Result.success(matrix, "获取相似度矩阵成功");
        } catch (Exception e) {
            return Result.error("获取相似度矩阵失败：" + e.getMessage());
        }
    }
    @ApiOperation(value = "获取混合推荐商品", notes = "结合协同过滤和基于内容的推荐结果")
    @GetMapping("/hybrid/products/{userId}")
    public Result<List<RecommendedProduct>> getHybridRecommendations(
            @PathVariable Integer userId,
            @RequestParam(defaultValue = "10") Integer topK) {
        try {
            List<RecommendedProduct> recommendations =
                    hybridRecommendationService.getHybridRecommendations(userId, topK);
            return Result.success(recommendations, "获取推荐商品成功");
        } catch (Exception e) {
            return Result.error("获取推荐商品失败：" + e.getMessage());
        }
    }
}
