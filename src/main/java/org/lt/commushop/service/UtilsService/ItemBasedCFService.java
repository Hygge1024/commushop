package org.lt.commushop.service.UtilsService;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import lombok.extern.slf4j.Slf4j;
import org.lt.commushop.domain.Hander.ProductBehavior;
import org.lt.commushop.domain.Hander.RecommendItem;
import org.lt.commushop.domain.Hander.UserBehaviorData;
import org.lt.commushop.domain.entity.Collection;
import org.lt.commushop.domain.entity.Evaluation;
import org.lt.commushop.domain.entity.OrderProducts;
import org.lt.commushop.service.ICollectionService;
import org.lt.commushop.service.IEvaluationService;
import org.lt.commushop.service.IOrderProductsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@EnableScheduling
public class ItemBasedCFService {
    @Autowired
    private IOrderProductsService orderProductsService;

    @Autowired
    private ICollectionService collectionService;

   @Autowired
   private IEvaluationService evaluationService;



    @Resource
    private RedisTemplate<String, Map<Integer, Map<Integer, Double>>> redisTemplate;

    private static final String SIMILARITY_MATRIX_KEY = "product:similarity:matrix";
    private static final double ALPHA = 0.7; // 购买相似度权重

    // 行为权重常量
    private static final double PURCHASE_WEIGHT = 1.0;    // 购买行为权重
    private static final double FAVORITE_WEIGHT = 0.5;    // 收藏行为权重
    private static final double RATING_WEIGHT = 0.8;      // 评分行为权重
    private static final double TIME_DECAY_FACTOR = 0.1;  // 时间衰减因子


    /**
     * 计算并存储商品相似度矩阵
     */
    public void calculateAndStoreSimilarityMatrix() {
        log.info("开始计算商品相似度矩阵...");

        // 1. 获取购买矩阵和收藏矩阵
        Map<Integer, Map<Integer, Integer>> purchaseMatrix = buildProductUserMatrix();
        Map<Integer, Map<Integer, Integer>> favoriteMatrix = buildFavoriteMatrix();

        // 2. 计算相似度矩阵
        Map<Integer, Map<Integer, Double>> similarityMatrix = new HashMap<>();
        Set<Integer> allProductIds = new HashSet<>(purchaseMatrix.keySet());
        allProductIds.addAll(favoriteMatrix.keySet());

         List<Integer> sortedProductIds = new ArrayList<>(allProductIds);
        Collections.sort(sortedProductIds);  // 对商品ID排序，使输出更有序
        log.info("共有 {} 个不同商品需要计算相似度", sortedProductIds.size());

        // 构建并打印表头
        StringBuilder header = new StringBuilder("\n商品ID\t");
        for (Integer id : sortedProductIds) {
            header.append(String.format("P%-8d", id));
        }
        log.info(header.toString());

        int processedCount = 0;
        for (Integer product1 : sortedProductIds) {
            Map<Integer, Double> similarities = new HashMap<>();
            StringBuilder row = new StringBuilder();
            row.append(String.format("P%-7d", product1));

            for (Integer product2 : sortedProductIds) {
                double similarity;
                if (product1.equals(product2)) {
                    similarity = 1.0;
                } else {
                    // 计算购买相似度
                    double cosineSim = calculateCosineSimilarity(
                            purchaseMatrix.getOrDefault(product1, new HashMap<>()),
                            purchaseMatrix.getOrDefault(product2, new HashMap<>())
                    );

                    // 计算收藏相似度
                    double jaccardSim = calculateJaccardSimilarity(
                            favoriteMatrix.getOrDefault(product1, new HashMap<>()),
                            favoriteMatrix.getOrDefault(product2, new HashMap<>())
                    );

                    // 融合相似度
                    similarity = ALPHA * cosineSim + (1 - ALPHA) * jaccardSim;
                    similarities.put(product2, similarity);
                }

                row.append(String.format("%.6f  ", similarity));
            }
            similarityMatrix.put(product1, similarities);
            log.info(row.toString());  // 打印每一行的相似度

            processedCount++;
            if (processedCount % 10 == 0) {
                log.info("已处理 {}/{} 个商品的相似度计算", processedCount, sortedProductIds.size());
            }
        }

        // 3. 存储到Redis
        log.info("开始将相似度矩阵存储到Redis...");
        redisTemplate.opsForValue().set(SIMILARITY_MATRIX_KEY, similarityMatrix);
        log.info("商品相似度矩阵计算完成并已存储到Redis");
    }



    /**
     * 构建商品-用户购买矩阵
     * @return Map<商品ID, Map<用户ID, 购买次数>>
     */
    public Map<Integer, Map<Integer, Integer>> buildProductUserMatrix() {
        log.info("开始构建商品-用户购买矩阵...");
        // 1.获取用户所有订单商品记录
        List<OrderProducts> allOrderProducts = orderProductsService.list();
        log.info("获取到 {} 条订单商品记录", allOrderProducts.size());

        // 2.构建商品-用户矩阵
        Map<Integer, Map<Integer, Integer>> productUserMatrix = new HashMap<>();
        // 统计每个用户对每个商品的购买次数
        for (OrderProducts orderProducts : allOrderProducts) {
            Integer productId = orderProducts.getProductId();
            Integer userId = orderProducts.getUserId();
            int amount = orderProducts.getAmount();

            // 获取或创建该商品的用户购买记录映射
            Map<Integer, Integer> userPurchases = productUserMatrix.computeIfAbsent(productId, k -> new HashMap<>());
            // 更新购买次数（累加）
            userPurchases.merge(userId, amount, Integer::sum);
        }

        log.info("商品-用户购买矩阵构建完成，包含 {} 个商品", productUserMatrix.size());
        // 打印购买矩阵
        log.info("商品-用户购买矩阵:");
        Set<Integer> productIds = productUserMatrix.keySet();
        Set<Integer> allUserIds = new HashSet<>();
        for (Map<Integer, Integer> userMap : productUserMatrix.values()) {
            allUserIds.addAll(userMap.keySet());
        }

        List<Integer> sortedProductIds = new ArrayList<>(productIds);
        List<Integer> sortedUserIds = new ArrayList<>(allUserIds);
        Collections.sort(sortedProductIds);
        Collections.sort(sortedUserIds);

        // 打印表头
        StringBuilder header = new StringBuilder("商品/用户\t");
        for (Integer userId : sortedUserIds) {
            header.append(String.format("U%-8d", userId));
        }
        log.info(header.toString());

        // 打印矩阵内容
        for (Integer productId : sortedProductIds) {
            StringBuilder row = new StringBuilder();
            row.append(String.format("P%-7d", productId));

            Map<Integer, Integer> userMap = productUserMatrix.get(productId);
            for (Integer userId : sortedUserIds) {
                int value = userMap.getOrDefault(userId, 0);
                row.append(String.format("%-9d", value));
            }
            log.info(row.toString());
        }
        log.info("矩阵中的用户ID列表：{}", allUserIds);
log.info("矩阵中的商品ID列表：{}", productIds);
        return productUserMatrix;
    }

    /**
     * 构建商品-用户收藏矩阵（二元矩阵）
     * @return Map<商品ID, Map<用户ID, 是否收藏(1/0)>>
     */
    public Map<Integer, Map<Integer, Integer>> buildFavoriteMatrix() {
        log.info("开始构建商品-用户收藏矩阵...");
        // 1. 获取所有收藏记录
        List<Collection> collections = collectionService.list();
        log.info("获取到 {} 条收藏记录", collections.size());

        // 2. 构建商品-用户收藏矩阵
        Map<Integer, Map<Integer, Integer>> favoriteMatrix = new HashMap<>();

        // 3. 遍历收藏记录，构建二元矩阵
        for (Collection collection : collections) {
            Integer productId = collection.getProductId();
            Integer userId = collection.getUserId();

            // 获取或创建该商品的用户收藏记录映射
            Map<Integer, Integer> userFavorites = favoriteMatrix.computeIfAbsent(productId, k -> new HashMap<>());
            // 设置收藏状态为1（已收藏）
            userFavorites.put(userId, 1);
        }

        log.info("商品-用户收藏矩阵构建完成，包含 {} 个商品", favoriteMatrix.size());
        // 打印收藏矩阵
        log.info("商品-用户收藏矩阵（1表示已收藏，空白表示未收藏）:");
        Set<Integer> productIds = favoriteMatrix.keySet();
        Set<Integer> allUserIds = new HashSet<>();
        for (Map<Integer, Integer> userMap : favoriteMatrix.values()) {
            allUserIds.addAll(userMap.keySet());
        }

        List<Integer> sortedProductIds = new ArrayList<>(productIds);
        List<Integer> sortedUserIds = new ArrayList<>(allUserIds);
        Collections.sort(sortedProductIds);
        Collections.sort(sortedUserIds);

        // 打印表头
        StringBuilder header = new StringBuilder("商品/用户\t");
        for (Integer userId : sortedUserIds) {
            header.append(String.format("U%-8d", userId));
        }
        log.info(header.toString());

        // 打印矩阵内容
        for (Integer productId : sortedProductIds) {
            StringBuilder row = new StringBuilder();
            row.append(String.format("P%-7d", productId));

            Map<Integer, Integer> userMap = favoriteMatrix.get(productId);
            for (Integer userId : sortedUserIds) {
                int value = userMap.getOrDefault(userId, 0);
                row.append(String.format("%-9d", value));
            }
            log.info(row.toString());
        }

        // 添加调试信息
        log.info("矩阵中的用户ID列表：{}", sortedUserIds);
        log.info("矩阵中的商品ID列表：{}", sortedProductIds);
        return favoriteMatrix;
    }

    /**
     * 计算两个商品向量的余弦相似度
     */
    private double calculateCosineSimilarity(Map<Integer, Integer> productVector1, Map<Integer, Integer> productVector2) {
        double dotProduct = 0.0;
        double norm1 = 0.0;
        double norm2 = 0.0;

        // 计算点积和向量范数
        Set<Integer> allUserIds = new HashSet<>(productVector1.keySet());
        allUserIds.addAll(productVector2.keySet());

        for (Integer userId : allUserIds) {
            int value1 = productVector1.getOrDefault(userId, 0);
            int value2 = productVector2.getOrDefault(userId, 0);
            dotProduct += value1 * value2;
            norm1 += value1 * value1;
            norm2 += value2 * value2;
        }

        // 避免除以零
        if (norm1 == 0 || norm2 == 0) {
            return 0.0;
        }

        return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
    }

    /**
     * 计算两个商品的Jaccard相似度
     */
    private double calculateJaccardSimilarity(Map<Integer, Integer> product1Favorites, Map<Integer, Integer> product2Favorites) {
        Set<Integer> users1 = product1Favorites.entrySet().stream()
                .filter(e -> e.getValue() > 0)
                .map(Map.Entry::getKey)
                .collect(Collectors.toSet());
        Set<Integer> users2 = product2Favorites.entrySet().stream()
                .filter(e -> e.getValue() > 0)
                .map(Map.Entry::getKey)
                .collect(Collectors.toSet());

        if (users1.isEmpty() && users2.isEmpty()) {
            return 0.0;
        }

        Set<Integer> intersection = new HashSet<>(users1);
        intersection.retainAll(users2);

        Set<Integer> union = new HashSet<>(users1);
        union.addAll(users2);

        return (double) intersection.size() / union.size();
    }


    /**
     * 获取商品相似度矩阵
     */
    public Map<Integer, Map<Integer, Double>> getSimilarityMatrix() {
        log.info("尝试从Redis获取商品相似度矩阵...");
        Map<Integer, Map<Integer, Double>> matrix = redisTemplate.opsForValue().get(SIMILARITY_MATRIX_KEY);
        if (matrix == null) {
            log.info("Redis中未找到相似度矩阵，开始重新计算...");
            calculateAndStoreSimilarityMatrix();
            matrix = redisTemplate.opsForValue().get(SIMILARITY_MATRIX_KEY);
        }
        log.info("成功获取商品相似度矩阵，包含 {} 个商品", matrix != null ? matrix.size() : 0);
        return matrix;
    }

    /**
     * 打印商品相似度矩阵（用于调试）
     */
    public void printSimilarityMatrix() {
        log.info("开始打印商品相似度矩阵...");
        Map<Integer, Map<Integer, Double>> matrix = getSimilarityMatrix();
        Set<Integer> productIds = matrix.keySet();

        // 打印表头
        System.out.print("商品ID\t");
        productIds.forEach(id -> System.out.print("P" + id + "\t"));
        System.out.println();

        // 打印矩阵内容
        for (Integer product1 : productIds) {
            System.out.print("P" + product1 + "\t");
            for (Integer product2 : productIds) {
                if (product1.equals(product2)) {
                    System.out.print("1.00\t");
                } else {
                    double similarity = matrix.get(product1).getOrDefault(product2, 0.0);
                    System.out.printf("%.2f\t", similarity);
                }
            }
            System.out.println();
        }
        log.info("商品相似度矩阵打印完成");
    }

    /**
     * 开始推荐
     */

    @SuppressWarnings("unchecked")//抑制**泛型未检查的转换（Unchecked Cast）**警告。通常在从 Object 类型强制转换成泛型类型时，编译器会警告可能的 ClassCastException，
    public List<RecommendItem> recommendProducts(Integer userId, int topK) {
        log.info("开始为用户userId = {} 推荐商品...", userId);

        //1.获取相似度矩阵
        Map<Integer,Map<Integer,Double>> similarityMatrix =  (Map<Integer, Map<Integer, Double>>) redisTemplate.opsForValue().get(SIMILARITY_MATRIX_KEY);
        if(similarityMatrix == null){
            log.warn("相似度矩阵未找到，需要重新计算");
            calculateAndStoreSimilarityMatrix();
            similarityMatrix = (Map<Integer, Map<Integer, Double>>) redisTemplate.opsForValue().get(SIMILARITY_MATRIX_KEY);
        }
        //2.获取用户的历史行为数据
        UserBehaviorData behaviorData = getUserBehaviorData(userId);
        if(behaviorData.isEmpty()){
            log.info("用户userId = {} 没有历史行为数据", userId);
            return Collections.emptyList();
        }
        // 3. 计算推荐分数
        Map<Integer, Double> recommendScores = calculateRecommendScores(userId, behaviorData, similarityMatrix);

        // 4. 排序并返回TopK推荐结果
        return recommendScores.entrySet().stream()
                .sorted(Map.Entry.<Integer, Double>comparingByValue().reversed())//按照 推荐分数降序排序。
                .limit(topK)//取前 topK 个商品。
                .map(e -> new RecommendItem(e.getKey(), e.getValue()))// // 转换为 RecommendItem 对象
                .collect(Collectors.toList());
    }
    /**
     * 获取用户行为数据
     */
    private UserBehaviorData getUserBehaviorData(Integer userId){
        UserBehaviorData data = new UserBehaviorData();
        LocalDateTime now = LocalDateTime.now();

        //1.获取购买记录
        LambdaQueryWrapper<OrderProducts> orderWrapper = new LambdaQueryWrapper<>();
        orderWrapper.eq(OrderProducts::getUserId , userId);
        List<OrderProducts> purchases = orderProductsService.list(orderWrapper);

        //2.获取收藏记录
        LambdaQueryWrapper<Collection> collectionLambdaQueryWrapper = new LambdaQueryWrapper<>();
        collectionLambdaQueryWrapper.eq(Collection::getUserId , userId);
        List<Collection> collections = collectionService.list(collectionLambdaQueryWrapper);

        //3.获取评分记录
        LambdaQueryWrapper<Evaluation> evaluationLambdaQueryWrapper = new LambdaQueryWrapper<>();
        evaluationLambdaQueryWrapper.eq(Evaluation::getUserId,userId);
        List<Evaluation> evaluations = evaluationService.list(evaluationLambdaQueryWrapper);

        //4.处理购买数据至data中
        for(OrderProducts purchase : purchases){
            ProductBehavior behavior = data.getBehaviors().computeIfAbsent(
                    purchase.getProductId(),
                    k -> new ProductBehavior()
            );
            behavior.setPurchaseCount(behavior.getPurchaseCount() + purchase.getAmount());
        }

        //5.处理收藏数据
        for(Collection collection : collections){
            ProductBehavior behavior = data.getBehaviors().computeIfAbsent(
                    collection.getProductId(),
                    k -> new ProductBehavior()
            );
            behavior.setFavorited(true);
            behavior.setFavoriteTime(collection.getCollectionTime());
        }
        //6.处理评分数据
        for(Evaluation evaluation : evaluations){
            ProductBehavior behavior = data.getBehaviors().computeIfAbsent(
                evaluation.getProductId(),
                k -> new ProductBehavior()
            );
            behavior.setRating(evaluation.getEvaluationScore());
        }
        log.info("用户userId = {} 的行为数据：{}", userId, data);
        return data;
    }
    /**
     * 计算推荐分数
     */
    private Map<Integer,Double> calculateRecommendScores(Integer userId,UserBehaviorData userData,Map<Integer, Map<Integer, Double>> similarityMatrix){
        Map<Integer, Double> scores = new HashMap<>();
        LocalDateTime now = LocalDateTime.now();
        //对每个可能的候选商品计算推荐分数
        /**
         * 大致思路：
         * 1. **第一层循环（遍历候选商品）**：
         *    - 遍历相似度矩阵中的所有商品，作为可能的推荐候选项 `candidateItem`。
         *    - 如果用户已经交互过该商品，则跳过，避免重复推荐。
         *
         * 2. **第二层循环（计算候选商品的推荐分数）**：
         *    - 遍历用户交互过的所有商品 `userItem`，检查其与当前候选商品 `candidateItem` 的相似度。
         *    - 如果两者有相似度数据，则根据用户对 `userItem` 的交互行为计算加权得分：
         *      - **购买行为**：购买次数越多，权重越高，但设定上限（如最多取 5 次）。
         *      - **收藏行为**：收藏时间越久远，影响力越低，使用时间衰减因子计算。
         *      - **评分行为**：评分越高，影响权重越大，归一化到 [0,1] 之间。
         *    - 计算权重后，乘以相似度值，累加到 `candidateItem` 的最终推荐分数。
         *
         * 3. **筛选推荐结果**：
         *    - 如果 `candidateItem` 计算出的推荐分数大于 0，则存入推荐列表，表示该商品值得推荐。
         */

        log.info("开始计算用户userId = {} 的推荐分数...", userId);
        for(Map.Entry<Integer,Map<Integer,Double>> entry : similarityMatrix.entrySet()){
            Integer candidateItem = entry.getKey();// 候选商品 candidateItem。
            //跳过用户已交互过的商品
            if(userData.getBehaviors().containsKey(candidateItem)){
                log.debug("商品ID = {} 是用户已交互过的商品，跳过", candidateItem);
                continue;
            }
            double score = 0.0; //以为交涉商品为主，累加
            Map<Integer,Double> similarities = entry.getValue();//存储 该商品与其他所有商品的相似度。.如：P1与其他商品      1.000000  0.700000  0.300000  0.000000  0.000000  0.300000  0.000000  0.300000  0.313050  0.259973  0.300000  0.313050  0.300000  0.000000  0.626099  0.300000  0.613050  0.000000
            log.debug("开始计算商品ID = {} 的推荐分数", candidateItem);

            //基于用户的每个历史行为计算推荐分数
            for(Map.Entry<Integer,ProductBehavior> behaviorEntry : userData.getBehaviors().entrySet()){
                //遍历用户 userData 里的历史行为，每个 behaviorEntry 代表用户交互过的一个商品。
                Integer userItem = behaviorEntry.getKey();//用户交互过的商品 ID
                ProductBehavior behavior = behaviorEntry.getValue();//用户对 userItem 的交互数据（包含购买次数、收藏、评分等信息）。
                Double similarity = similarities.get(userItem); //candidateItem 和 userItem 的相似度。
                if(similarity == null){
                    continue;
                }
                // 计算行为权重
                double behaviorWeight = 0.0;
                //购买行为权重
                if(behavior.getPurchaseCount() > 0){
                    behaviorWeight += PURCHASE_WEIGHT * Math.min(behavior.getPurchaseCount(), 5);// 限制购买次数的影响，避免单个商品被过度权重化。
                }
                //收藏行为权重
                if(behavior.isFavorited()){
                    double timeDecay = 1.0;
                    if(behavior.getFavoriteTime() != null){
                        long days = ChronoUnit.DAYS.between(behavior.getFavoriteTime(),now);//计算收藏时间与当前时间的时间差 days
                        timeDecay = 1.0 / (1.0 + TIME_DECAY_FACTOR * days);//随着时间推移，收藏行为的影响力逐渐降低。
                    }
                    behaviorWeight += FAVORITE_WEIGHT * timeDecay;
                }

                //评分行为权重
                if(behavior.getRating() != null && behavior.getRating() > 0){
                    behaviorWeight += RATING_WEIGHT * (behavior.getRating() / 10.0);//归一化评分，使其值在 [0, 1] 之间。
                }
                //累加推荐分数
                score += similarity * behaviorWeight;//商品 candidateItem 的推荐分数 score = 其与 userItem 的相似度 × 用户的交互权重
                log.debug("商品ID = {} 与用户交互商品ID = {} 的相似度为{}, 行为权重为{}, 累加分数为{}", 
                    candidateItem, userItem, similarity, behaviorWeight, score);
            }
            if(score > 0){
                scores.put(candidateItem,score);
                log.info("商品ID = {} 的最终推荐分数为{}", candidateItem, score);
            }
        }
        log.info("用户userId = {} 的推荐分数计算完成，共有{}\u4e2a商品被推荐", userId, scores.size());
        return scores;
    }

    /**
     * 定时更新商品相似度矩阵
     * cron表达式说明：
     * "0 0 3 * * ?" = 每天凌晨3点执行
     * "0 0 3 * * MON" = 每周一凌晨3点执行
     * "0 0 3 1 * ?" = 每月1号凌晨3点执行
     */
    @Scheduled(cron = "0 0 3 * * ?")  // 每天凌晨3点执行
    public void scheduledUpdateSimilarityMatrix() {
        try {
            log.info("开始定时更新商品相似度矩阵...");
            calculateAndStoreSimilarityMatrix();
            log.info("商品相似度矩阵定时更新完成");
        } catch (Exception e) {
            log.error("定时更新商品相似度矩阵失败：{}", e.getMessage(), e);
        }
    }

    /**
     * 手动触发更新相似度矩阵
     * 可以在特定事件发生时调用，如：
     * 1. 商品数据发生大量变化
     * 2. 用户行为数据发生显著变化
     * 3. 系统维护时
     */
    public void manualUpdateSimilarityMatrix() {
        try {
            log.info("开始手动更新商品相似度矩阵...");
            calculateAndStoreSimilarityMatrix();
            log.info("商品相似度矩阵手动更新完成");
        } catch (Exception e) {
            log.error("手动更新商品相似度矩阵失败：{}", e.getMessage(), e);
            throw new RuntimeException("更新商品相似度矩阵失败", e);
        }
    }
}
