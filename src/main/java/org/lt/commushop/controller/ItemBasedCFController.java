package org.lt.commushop.controller;

import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiParam;
import org.lt.commushop.common.Result;
import org.lt.commushop.domain.Hander.RecommendItem;
import org.lt.commushop.service.UtilsService.ItemBasedCFService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.List;

@Api(tags = "商品协同过滤推荐接口")
@RestController
@RequestMapping("/itemcf")
public class ItemBasedCFController {
    @Autowired
    private ItemBasedCFService itemBasedCFService;

    @ApiOperation("获取商品相似度矩阵")
    @GetMapping("/test/similarity-matrix")
    public Result<Map<Integer, Map<Integer, Double>>> testSimilarityMatrix() {
        try {
            Map<Integer, Map<Integer, Double>> matrix = itemBasedCFService.getSimilarityMatrix();
            return Result.success(matrix, "获取商品相似度矩阵成功");
        } catch (Exception e) {
            return Result.error("获取相似度矩阵失败：" + e.getMessage());
        }
    }

    @ApiOperation("打印商品相似度矩阵")
    @GetMapping("/test/print-similarity")
    public Result<String> testPrintSimilarityMatrix() {
        try {
            itemBasedCFService.printSimilarityMatrix();
            return Result.success("相似度矩阵已打印到控制台");
        } catch (Exception e) {
            return Result.error("打印相似度矩阵失败：" + e.getMessage());
        }
    }

    @ApiOperation("强制重新计算商品相似度矩阵")
    @GetMapping("/test/recalculate-similarity")
    public Result<String> testRecalculateSimilarity() {
        try {
            itemBasedCFService.calculateAndStoreSimilarityMatrix();
            return Result.success("商品相似度矩阵重新计算完成");
        } catch (Exception e) {
            return Result.error("重新计算相似度矩阵失败：" + e.getMessage());
        }
    }


    @ApiOperation(value = "获取个性化商品推荐", notes = "基于用户的购买历史、收藏记录和评分数据，推荐相似度最高的商品")
    @GetMapping("/recommend/products")
    public Result<List<RecommendItem>> getRecommendProducts(
        @ApiParam(value = "用户ID", required = true, example = "1")
        @RequestParam Integer userId,
        @ApiParam(value = "推荐商品数量", defaultValue = "10", example = "10")
        @RequestParam(defaultValue = "10") Integer topK
    ) {
        try {
            List<RecommendItem> recommendations = itemBasedCFService.recommendProducts(userId, topK);
            return Result.success(recommendations);
        } catch (Exception e) {
            return Result.error("获取推荐商品失败：" + e.getMessage());
        }
    }
}
