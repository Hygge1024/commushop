package org.lt.commushop.service.UtilsService;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import lombok.extern.slf4j.Slf4j;
import org.lt.commushop.domain.Hander.ProductBehavior;
import org.lt.commushop.domain.Hander.RecommendItem;
import org.lt.commushop.domain.Hander.UserBehaviorData;
import org.lt.commushop.domain.entity.*;
import org.lt.commushop.domain.entity.Collection;
import org.lt.commushop.mapper.ProductCategoryRelationshipMapper;
import org.lt.commushop.mapper.UserMapper;
import org.lt.commushop.service.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@EnableScheduling
@Service
public class ContentBasedService {
    @Autowired
    private IProductService productService;
    @Autowired
    private IOrderProductsService orderProductsService;
    @Autowired
    private ICollectionService collectionService;
    @Autowired
    private IEvaluationService evaluationService;
    @Autowired
    private ProductCategoryRelationshipMapper productCategoryRelationshipMapper;
    @Autowired
    private UserMapper userMapper;
    @Resource
    private RedisTemplate<String, Map<Integer, Map<Integer, Double>>> redisTemplate;
    private static final String CONTENT_SIMILARITY_MATRIX_KEY = "product:content:similarity:matrix";

    // 特征权重配置
    private static final double TEXT_SIMILARITY_WEIGHT = 0.6;  // 文本相似度权重
    private static final double CATEGORY_SIMILARITY_WEIGHT = 0.3;  // 类别相似度权重
    private static final double PRICE_SIMILARITY_WEIGHT = 0.1;  // 价格相似度权重

    // 推荐相关配置
    private static final double SIMILARITY_THRESHOLD = 0.1;  // 相似度阈值
    private static final int DEFAULT_RECOMMEND_SIZE = 10;  // 默认推荐数量
    /**
     * 计算并存储基于内容的商品相似度矩阵
     */
    public void calculateAndStoreContentSimilarityMatrix() {
        log.info("开始计算基于内容的商品相似度矩阵...");

        //1. 获取所有商品
        List<Product> products = productService.list();
        Map<Integer,Map<Integer,Double>> similarityMatrix = new HashMap<>();

        //2.计算商品间的相似度
        for(Product product1 : products){
            Map<Integer,Double> similarities = new HashMap<>();
            for(Product product2 : products){
                if(product1.getProductId().equals(product2.getProductId())){
                    similarities.put(product2.getProductId(),1.0);
                    continue;
                }
                //计算综合相似度
                double similarity = calculateProductSimilarity(product1, product2);
                if(similarity >= SIMILARITY_THRESHOLD){
                    similarities.put(product2.getProductId(),similarity);
                }
            }
            similarityMatrix.put(product1.getProductId(), similarities);
        }
        //打印相似度矩阵
        log.info("基于内容的商品相似度矩阵：\n{}", formatSimilarityMatrix(similarityMatrix));

        //3.存储相似度矩阵到Redis
        redisTemplate.opsForValue().set(CONTENT_SIMILARITY_MATRIX_KEY, similarityMatrix);
        log.info("基于内容的商品相似度矩阵计算完成，共处理{}个商品", products.size());
    }

    /**
     * 格式化相似度矩阵为可读的字符串
     */
    private String formatSimilarityMatrix(Map<Integer, Map<Integer, Double>> matrix) {
        if (matrix == null || matrix.isEmpty()) {
            return "矩阵为空";
        }

        StringBuilder sb = new StringBuilder();
        // 获取所有商品ID并排序
        List<Integer> productIds = new ArrayList<>(matrix.keySet());
        Collections.sort(productIds);

        // 打印列头
        sb.append(String.format("%6s", "ID"));
        for (Integer id : productIds) {
            sb.append(String.format("%6d", id));
        }
        sb.append("\n");

        // 打印矩阵内容
        for (Integer rowId : productIds) {
            sb.append(String.format("%6d", rowId));
            for (Integer colId : productIds) {
                Double similarity = matrix.get(rowId).getOrDefault(colId, 0.0);
                sb.append(String.format("%6.2f", similarity));
            }
            sb.append("\n");
        }
        return sb.toString();
    }

    /**
     * 计算两个商品的综合相似度
     */
    private double calculateProductSimilarity(Product product1, Product product2) {
        // 1. 计算文本相似度（商品名称和描述）
        double textSimilarity = calculateTextSimilarity(product1, product2);

        // 2. 计算类别相似度
        double categorySimilarity = calculateCategorySimilarity(product1, product2);

        // 3. 计算价格相似度
        double priceSimilarity = calculatePriceSimilarity(product1, product2);

        // 4. 计算加权综合相似度
        return TEXT_SIMILARITY_WEIGHT * textSimilarity +
                CATEGORY_SIMILARITY_WEIGHT * categorySimilarity +
                PRICE_SIMILARITY_WEIGHT * priceSimilarity;
    }
    /**
     * 计算文本相似度（使用简单的关键词匹配方式，后续可以改进为TF-IDF或Word2Vec）
     */
    private double calculateTextSimilarity(Product product1, Product product2) {
        // 将名称和描述分别处理
        String name1 = product1.getProductName().toLowerCase();
        String name2 = product2.getProductName().toLowerCase();
        String desc1 = product1.getProductDesc() != null ? product1.getProductDesc().toLowerCase() : "";
        String desc2 = product2.getProductDesc() != null ? product2.getProductDesc().toLowerCase() : "";

        // 按字符分割（适用于中文）
        Set<String> nameChars1 = name1.chars().mapToObj(ch -> String.valueOf((char)ch)).collect(Collectors.toSet());
        Set<String> nameChars2 = name2.chars().mapToObj(ch -> String.valueOf((char)ch)).collect(Collectors.toSet());
        Set<String> descChars1 = desc1.chars().mapToObj(ch -> String.valueOf((char)ch)).collect(Collectors.toSet());
        Set<String> descChars2 = desc2.chars().mapToObj(ch -> String.valueOf((char)ch)).collect(Collectors.toSet());

        // 分别计算名称和描述的相似度
        double nameSimilarity = calculateJaccardSimilarity(nameChars1, nameChars2);
        double descSimilarity = calculateJaccardSimilarity(descChars1, descChars2);

        // 名称相似度权重更高
        return nameSimilarity * 0.7 + descSimilarity * 0.3;
    }

    private double calculateJaccardSimilarity(Set<String> set1, Set<String> set2) {
        if (set1.isEmpty() && set2.isEmpty()) return 1.0;
        if (set1.isEmpty() || set2.isEmpty()) return 0.0;

        Set<String> union = new HashSet<>(set1);
        union.addAll(set2);

        Set<String> intersection = new HashSet<>(set1);
        intersection.retainAll(set2);

        return (double) intersection.size() / union.size();
    }
    /**
     * 计算类别相似度
     */
    private double calculateCategorySimilarity(Product product1, Product product2) {
        // 获取商品1的所有类别
        LambdaQueryWrapper<ProductCategoryRelationship> wrapper1 = new LambdaQueryWrapper<>();
        wrapper1.eq(ProductCategoryRelationship::getProductId, product1.getProductId());
        List<ProductCategoryRelationship> categories1 = productCategoryRelationshipMapper.selectList(wrapper1);

        // 获取商品2的所有类别
        LambdaQueryWrapper<ProductCategoryRelationship> wrapper2 = new LambdaQueryWrapper<>();
        wrapper2.eq(ProductCategoryRelationship::getProductId, product2.getProductId());
        List<ProductCategoryRelationship> categories2 = productCategoryRelationshipMapper.selectList(wrapper2);

        // 如果任一商品没有类别，返回0
        if (categories1.isEmpty() || categories2.isEmpty()) {
            return 0.0;
        }

        // 计算共同类别的数量
        Set<Integer> categoryIds1 = categories1.stream()
                .map(ProductCategoryRelationship::getCategoryId)
                .collect(Collectors.toSet());
        Set<Integer> categoryIds2 = categories2.stream()
                .map(ProductCategoryRelationship::getCategoryId)
                .collect(Collectors.toSet());

        // 计算Jaccard相似度：交集大小 / 并集大小
        Set<Integer> intersection = new HashSet<>(categoryIds1);
        intersection.retainAll(categoryIds2);

        Set<Integer> union = new HashSet<>(categoryIds1);
        union.addAll(categoryIds2);

        return union.isEmpty() ? 0.0 : (double) intersection.size() / union.size();
    }
    /**
     * 计算价格相似度
     */
    private double calculatePriceSimilarity(Product product1, Product product2) {
        double price1 = product1.getGroupPrice().doubleValue();
        double price2 = product2.getGroupPrice().doubleValue();

        // 使用价格差异比例计算相似度
        double priceDiff = Math.abs(price1 - price2);
        double avgPrice = (price1 + price2) / 2.0;

        // 如果价格差异在平均价格的50%以内，则认为相似
        double similarity = Math.max(0, 1 - (priceDiff / avgPrice));
        return similarity;
    }

    /**
     * 获取相似度矩阵
     */
    public Map<Integer, Map<Integer, Double>> getContentSimilarityMatrix() {
        return redisTemplate.opsForValue().get(CONTENT_SIMILARITY_MATRIX_KEY);
    }

    /**
     * 为用户推荐商品
     */
    public List<RecommendItem> recommendProducts(Integer userId, int topK) {
        //1.获取用户行为数据
        UserBehaviorData userData = getUserBehaviorData(userId);
        // 判断是新用户还是老用户
        boolean isNewUser = isNewUser(userData);

        if (isNewUser) {
            log.info("为新用户{}推荐商品", userId);
            return recommendForNewUser(userId, topK);
        } else {
            log.info("为老用户{}推荐商品", userId);
            return recommendForExistingUser(userId, userData, topK);
        }
    }
    /**
     * 判断是否是新用户
     */
    private boolean isNewUser(UserBehaviorData userData) {
        int interactionCount = 0;
        for (ProductBehavior behavior : userData.getBehaviors().values()) {
            if (Objects.nonNull(behavior.getPurchaseCount()) && behavior.getPurchaseCount() > 0) interactionCount++;
            if (behavior.isFavorited()) interactionCount++;
            if (Objects.nonNull(behavior.getRating()) && behavior.getRating() > 0) interactionCount++;
        }
        return interactionCount <= 3;
    }
    /**
     * 给老用户基于内容推荐
     */
    private  List<RecommendItem> recommendForExistingUser(Integer userId, UserBehaviorData userData, Integer topK) {
        // 获取相似度矩阵
        Map<Integer,Map<Integer,Double>> similarityMatrix = getContentSimilarityMatrix();
        if (similarityMatrix == null) {
              log.warn("相似度矩阵未找到，需要重新计算");
            calculateAndStoreContentSimilarityMatrix();
            similarityMatrix = getContentSimilarityMatrix();
        }

        // 计算推荐分数
        Map<Integer, Double> recommendScores = calculateRecommendScores(userId, userData, similarityMatrix);

        // 排序并返回推荐结果
       return recommendScores.entrySet().stream()
                .sorted(Map.Entry.<Integer,Double>comparingByValue().reversed())
                .limit(topK)
                .map(e -> new RecommendItem(e.getKey(),e.getValue()))
                .collect(Collectors.toList());
    }
    /**
     * 给新用户基于内容推荐（基于用户的种子信息）
     */
    private List<RecommendItem> recommendForNewUser(Integer userId, Integer topK) {
        // 获取用户信息
        User user = userMapper.selectById(userId);
        if (user == null) {
            return new ArrayList<>();
        }
        //用户标签 -> 匹配的商品类别 -> 产品

        // 获取用户标签
        Set<String> userTags = getUserTags(user);
        // 获取匹配的商品类别
        Set<Integer> targetCategories = getTargetCategories(userTags);
        // 获取种子商品
        List<Integer> seedProducts = getSeedProducts(targetCategories);
        // 从相似度矩阵中获取推荐

        // 获取相似度矩阵
        Map<Integer,Map<Integer,Double>> similarityMatrix = getContentSimilarityMatrix();
        if (similarityMatrix == null) {
            log.warn("相似度矩阵未找到，需要重新计算");
            calculateAndStoreContentSimilarityMatrix();
            similarityMatrix = getContentSimilarityMatrix();
        }
        // 基于种子商品获取推荐
        return getRecommendationsFromSeeds(seedProducts, similarityMatrix, topK);
    }

    /**
     * 获取用户标签
     */
    private Set<String> getUserTags(User user) {
        Set<String> tags = new HashSet<>();

        // 添加性别标签
        if (user.getGender() != null) {
            tags.add(user.getGender() == 1 ? "male" : "female");
        }

        // 添加邮箱类型标签
        String email = user.getEmail();
        if (email != null) {
            if (email.endsWith("edu.cn")) tags.add("student");
            else if (email.endsWith("com")) tags.add("general");
            // 可以添加更多邮箱类型判断
        }
        return tags;
    }

     /**
     * 获取匹配的商品类别
     *
     */
    private Set<Integer> getTargetCategories(Set<String> userTags) {
        Set<Integer> categories = new HashSet<>();

        // 男性用户偏好
        if (userTags.contains("male")) {
            categories.addAll(Arrays.asList(
                9,  // 电子产品
                14, // 汽车服务
                11  // 健康保健
            ));
        }

        // 女性用户偏好
        if (userTags.contains("female")) {
            categories.addAll(Arrays.asList(
                4,  // 服装鞋帽
                5,  // 美容护肤
                12  // 节日礼品
            ));
        }

        // 学生用户偏好
        if (userTags.contains("student")) {
            categories.addAll(Arrays.asList(
                8,  // 教育培训
                13, // 即食食品
                1   // 餐饮美食
            ));
        }

        // 普通用户(general)偏好
        if (userTags.contains("general")) {
            categories.addAll(Arrays.asList(
                2,  // 生鲜食品
                3,  // 日用百货
                6,  // 休闲娱乐
                7   // 旅游出行
            ));
        }

        // 如果没有匹配到任何类别，返回一些通用类别
        if (categories.isEmpty()) {
            categories.addAll(Arrays.asList(1, 2, 3, 13)); // 餐饮、生鲜、日用、即食
        }

        return categories;
    }
     /**
     *获取种子商品
     */
    private List<Integer> getSeedProducts(Set<Integer> targetCategories) {
         if (targetCategories == null || targetCategories.isEmpty()) {
            return new ArrayList<>();
        }
        LambdaQueryWrapper<ProductCategoryRelationship> queryWrapper = new LambdaQueryWrapper<>();
        // 查询目标类别的商品
        queryWrapper.in(ProductCategoryRelationship::getCategoryId, targetCategories);
        // 限制返回数量
        queryWrapper.last("LIMIT 10");

        // 获取商品ID列表
        return productCategoryRelationshipMapper.selectList(queryWrapper)
            .stream()
            .map(ProductCategoryRelationship::getProductId)
            .collect(Collectors.toList());
    }

    // 基于种子商品获取推荐
    private List<RecommendItem> getRecommendationsFromSeeds(List<Integer> seedProducts,
                                                      Map<Integer, Map<Integer, Double>> similarityMatrix, Integer count) {
        if (seedProducts == null || seedProducts.isEmpty() || similarityMatrix == null) {
            return new ArrayList<>();
        }
        // 存储所有候选商品的累计相似度
        Map<Integer,Double> candidateScores = new HashMap<>();

        //对每个种子商品
        for(Integer seedId : seedProducts){
            //获取于该种子商品相似的所有商品（用于对相似值累加）
            Map<Integer, Double> similarities = similarityMatrix.getOrDefault(seedId, new HashMap<>());
            //累加相似度分数
            for(Map.Entry<Integer,Double> entry : similarities.entrySet()){
                Integer candidateId = entry.getKey();//1:
                Double similarity = entry.getValue();//{  // 手机1的相似商品3: 0.8,  // 手机3，相似度0.8 4: 0.6   // 耳机4，相似度0.6},

                //排除种子商品自身
                if(!seedProducts.contains(candidateId)){
                    candidateScores.merge(candidateId,similarity,Double::sum);
                }
            }
        }

        // 转换为RecommendItem列表并排序
        return candidateScores.entrySet().stream()
                .map(e -> new RecommendItem(e.getKey(),e.getValue()))
                .sorted(Comparator.comparing(RecommendItem::getScore).reversed())
                .limit(count)
                .collect(Collectors.toList());
    }
    /**
     * 计算推荐分数
     */
    private Map<Integer, Double> calculateRecommendScores(Integer userId, UserBehaviorData userData,
                                                          Map<Integer, Map<Integer, Double>> similarityMatrix) {
        Map<Integer,Double> scores = new HashMap<>();
        Set<Integer> userItems = userData.getBehaviors().keySet();
        //获取所有商品
        List<Product> allProducts = productService.list();
        for(Product product : allProducts){
            Integer candidateItem = product.getProductId();
            // 跳过用户已交互的商品
            if (userItems.contains(candidateItem)) {
                continue;
            }
            double score = 0.0;
            Map<Integer, Double> similarities = similarityMatrix.get(candidateItem);
            if (similarities == null) continue;

            // 基于用户的历史行为计算推荐分数
            for (Map.Entry<Integer, ProductBehavior> behaviorEntry : userData.getBehaviors().entrySet()) {
                Integer userItem = behaviorEntry.getKey();
                Double similarity = similarities.get(userItem);
                if (similarity == null) continue;

                ProductBehavior behavior = behaviorEntry.getValue();
                double behaviorWeight = calculateBehaviorWeight(behavior);
                score += similarity * behaviorWeight;
            }

            if (score > 0) {
                scores.put(candidateItem, score);
            }
        }
        return scores;
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
        LambdaQueryWrapper<org.lt.commushop.domain.entity.Collection> collectionLambdaQueryWrapper = new LambdaQueryWrapper<>();
        collectionLambdaQueryWrapper.eq(org.lt.commushop.domain.entity.Collection::getUserId , userId);
        List<org.lt.commushop.domain.entity.Collection> collections = collectionService.list(collectionLambdaQueryWrapper);

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
     * 计算行为权重
     */
    private double calculateBehaviorWeight(ProductBehavior behavior) {
        double weight = 0.0;
        // 购买行为权重
        if (behavior.getPurchaseCount() > 0) {
            weight += Math.min(behavior.getPurchaseCount(), 5);
        }
        // 收藏行为权重
        if (behavior.isFavorited()) {
            weight += 0.5;
        }
        // 评分行为权重
        if (behavior.getRating() != null && behavior.getRating() > 0) {
            weight += 0.8 * (behavior.getRating() / 10.0);
        }
        return weight;
    }

    /**
     * 定时更新商品相似度矩阵
     */
    @Scheduled(cron = "0 0 3 * * ?")  // 每天凌晨3点执行
    public void scheduledUpdateSimilarityMatrix() {
        try {
            log.info("开始定时更新基于内容的商品相似度矩阵...");
            calculateAndStoreContentSimilarityMatrix();
            log.info("基于内容的商品相似度矩阵定时更新完成");
        } catch (Exception e) {
            log.error("定时更新基于内容的商品相似度矩阵失败：{}", e.getMessage(), e);
        }
    }

    /**
     * 手动触发更新相似度矩阵
     */
    public void manualUpdateSimilarityMatrix() {
        try {
            log.info("开始手动更新基于内容的商品相似度矩阵...");
            calculateAndStoreContentSimilarityMatrix();
            log.info("基于内容的商品相似度矩阵手动更新完成");
        } catch (Exception e) {
            log.error("手动更新基于内容的商品相似度矩阵失败：{}", e.getMessage(), e);
            throw new RuntimeException("更新基于内容的商品相似度矩阵失败", e);
        }
    }


}
