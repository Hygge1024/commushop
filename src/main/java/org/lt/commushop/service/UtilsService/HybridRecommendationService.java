package org.lt.commushop.service.UtilsService;

import lombok.extern.slf4j.Slf4j;
import org.checkerframework.checker.units.qual.A;
import org.lt.commushop.domain.Hander.RecommendItem;
import org.lt.commushop.domain.entity.Product;
import org.lt.commushop.domain.vo.RecommendedProduct;
import org.lt.commushop.service.IProductOrderService;
import org.lt.commushop.service.IProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
public class HybridRecommendationService {
    @Autowired
    private ItemBasedCFService itemBasedCFService;

    @Autowired
    private ContentBasedService contentBasedService;
    @Autowired
    private IProductService productService;

    // 混合推荐权重配置
    private static final double CF_WEIGHT = 0.7;  // 协同过滤权重
    private static final double CB_WEIGHT = 0.3;  // 基于内容权重
    public List<RecommendedProduct> getHybridRecommendations(Integer userId, Integer topK) {
        // 1. 获取两种推荐结果
        List<RecommendItem> cfRecommendations = itemBasedCFService.recommendProducts(userId, topK * 2);
        List<RecommendItem> cbRecommendations = contentBasedService.recommendProducts(userId, topK * 2);
        // 2. 合并推荐结果到一个Map
        Map<Integer, Double> hybridScores = new HashMap<>();
        // 处理协同过滤结果
        for (RecommendItem item : cfRecommendations) {
            hybridScores.merge(item.getProductId(),
                    item.getScore() * CF_WEIGHT,
                    Double::sum);
        }
        // 处理基于内容的结果
        for (RecommendItem item : cbRecommendations) {
            hybridScores.merge(item.getProductId(),
                    item.getScore() * CB_WEIGHT,
                    Double::sum);
        }
        // 3. 获取排序后的商品ID和分数
        List<Map.Entry<Integer, Double>> sortedEntries = hybridScores.entrySet().stream()
                .sorted(Map.Entry.<Integer, Double>comparingByValue().reversed())
                .limit(topK)
                .collect(Collectors.toList());
        // 4. 批量获取商品信息并转换为RecommendedProduct
        List<Integer> productIds = sortedEntries.stream()
                .map(Map.Entry::getKey)
                .collect(Collectors.toList());
        // 获取商品信息
        Map<Integer, Product> productMap = productService.listByIds(productIds).stream()
                .collect(Collectors.toMap(Product::getProductId, p -> p));
        // 5. 组装最终结果
        return sortedEntries.stream()
                .map(entry -> RecommendedProduct.fromProduct(
                        productMap.get(entry.getKey()),
                        entry.getValue()))
                .collect(Collectors.toList());
    }

}
