package org.lt.commushop.service;

import org.lt.commushop.domain.entity.Product;
import org.lt.commushop.mapper.ProductMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class RecommendationService {

    @Autowired
    private ProductMapper productMapper;

    /**
     * 基于协同过滤的产品推荐（示例：基于物品的推荐）
     *
     * @param userId 当前用户ID
     * @return 推荐的产品列表
     */
    public List<Product> recommendProductsForUser(Integer userId) {
        // 1. 获取当前用户的历史交互记录（如购买记录、评分或浏览记录）
        // 注意：这里需要替换为真实的数据接口
        Map<Integer, Double> userHistory = getUserProductInteractions(userId);
        
        if (userHistory.isEmpty()) {
            // 若无行为记录，可以返回热门产品或其它默认推荐
            return productMapper.selectList(null);
        }

        // 2. 获取全部产品（或者候选推荐范围内的产品）
        List<Product> allProducts = productMapper.selectList(null);

        // 3. 计算每个产品与用户历史产品的相似度得分
        Map<Product, Double> productScoreMap = new HashMap<>();
        for (Product product : allProducts) {
            // 假设获取产品与用户交互产品之间的相似度
            double score = calcAggregatedSimilarity(product.getProductId(), userHistory);
            productScoreMap.put(product, score);
        }

        // 4. 按相似度得分排序，取前N个产品作为推荐结果
        List<Map.Entry<Product, Double>> sortedList = new ArrayList<>(productScoreMap.entrySet());
        sortedList.sort((e1, e2) -> Double.compare(e2.getValue(), e1.getValue()));

        List<Product> recommendedProducts = new ArrayList<>();
        int topN = 5; // 比如推荐前5个
        for (int i = 0; i < Math.min(topN, sortedList.size()); i++) {
            recommendedProducts.add(sortedList.get(i).getKey());
        }
        return recommendedProducts;
    }

    /**
     * 伪函数：获取用户与产品的交互数据（例如：评分值、点击次数、购买记录等）
     * 实际应用中需要根据实际数据表进行查询
     */
    private Map<Integer, Double> getUserProductInteractions(Integer userId) {
        // 这里返回的Map键为产品ID，值为评分或权重
        // 示例返回伪数据，实际应从数据库获取用户历史数据
        Map<Integer, Double> interactions = new HashMap<>();
        // 假设用户购买或点击的记录：产品ID及相应的交互权重
        interactions.put(101, 1.0);
        interactions.put(102, 1.0);
        return interactions;
    }

    /**
     * 计算当前产品与用户历史产品之间的聚合相似度
     * 这里采用简单的累加相似度作为示例
     */
    private double calcAggregatedSimilarity(Integer productId, Map<Integer, Double> userHistory) {
        double aggregatedScore = 0.0;
        for (Map.Entry<Integer, Double> entry : userHistory.entrySet()) {
            Integer historicalProductId = entry.getKey();
            Double interactionWeight = entry.getValue();
            // 计算两个产品之间的相似度（这里使用伪数据，需要替换为真实计算方法）
            double similarity = calcProductSimilarity(productId, historicalProductId);
            aggregatedScore += similarity * interactionWeight;
        }
        return aggregatedScore;
    }

    /**
     * 计算两个产品之间的余弦相似度（示例伪代码）
     * 实际上需要根据产品的特征向量或用户行为数据构建矩阵后计算
     */
    private double calcProductSimilarity(Integer productId1, Integer productId2) {
        // 这里返回伪随机数据表示相似度，范围应在0～1之间
        if (Objects.equals(productId1, productId2)) {
            return 1.0;
        }
        return new Random().nextDouble();
    }
} 