package org.lt.commushop.service.UtilsService;

import com.hankcs.hanlp.HanLP;
import com.hankcs.hanlp.seg.common.Term;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * 意图识别服务 - 识别用户查询意图
 */
@Slf4j
@Service
public class IntentClassifierService {
    // 意图类型常量
    public static final String INTENT_ORDER_QUERY = "order_query";
    public static final String INTENT_PRODUCT_QUERY = "product_query";
    public static final String INTENT_GENERAL_QUERY = "general_query";

    // 订单查询相关的关键词 - 扩展更多常见表达
    private static final Set<String> ORDER_QUERY_KEYWORDS = new HashSet<>(Arrays.asList(
            "订单", "购买", "买了", "下单", "付款", "支付", "物流", "发货", "收货", "退款", "退货",
            "查询", "查看", "查一下", "看看", "我的", "购物", "买过", "交易", "历史", "账单",
            "花了多少", "花了多少钱", "消费", "花费", "花钱", "金额", "价格", "支出", "花销"
    ));

    // 订单状态关键词
    private static final Map<String, String> ORDER_STATUS_KEYWORDS = new HashMap<String, String>() {{
        put("待付款", "0,1");
        put("未支付", "0,1");
        put("已支付", "2");
        put("待发货", "2");
        put("已发货", "3");
        put("运输中", "3");
        put("已送达", "4");
        put("待收货", "4");
        put("已收货", "5");
        put("已完成", "5");
        put("退款申请", "6");
        put("申请退款", "6");
        put("退款中", "6");
        put("退款已批准", "7");
        put("同意退款", "7");
        put("退款被拒", "8");
        put("拒绝退款", "8");
        put("退款成功", "9");
        put("已退款", "9");
    }};

     // 时间范围关键词
    private static final Map<String, String> TIME_RANGE_KEYWORDS = new HashMap<String, String>() {{
        put("今天", "today");
        put("昨天", "yesterday");
        put("本周", "this_week");
        put("上周", "last_week");
        put("一周", "last_week");
        put("7天", "last_week");
        put("本月", "this_month");
        put("上个月", "last_month");
        put("一个月", "last_month");
        put("30天", "last_month");
        put("最近", "recent");
        put("近期", "recent");
        put("全部", "all");
        put("所有", "all");
    }};

    // 商品查询相关的关键词 - 扩展更多常见表达
    private static final Set<String> PRODUCT_QUERY_KEYWORDS = new HashSet<>(Arrays.asList(
            "商品", "产品", "货物", "价格", "多少钱", "库存", "有没有", "有多少", "介绍", "详情", "规格", "参数",
            "还有", "卖", "售", "有", "卖吗", "有吗", "多少库存", "有货吗", "有存货吗", "缺货", "售价",
            "价钱", "报价", "折扣", "优惠", "促销", "特价", "打折", "便宜", "贵", "成分", "材质",
            "功能", "性能", "品牌", "厂家", "产地", "生产日期", "保质期", "使用方法", "说明书"
    ));

    // 商品查询类型关键词
    private static final Map<String, String> PRODUCT_QUERY_TYPE_KEYWORDS = new HashMap<String, String>() {{
        put("价格", "price");
        put("多少钱", "price");
        put("价钱", "price");
        put("售价", "price");
        put("报价", "price");
        put("库存", "stock");
        put("有多少", "stock");
        put("有没有", "stock");
        put("有货", "stock");
        put("还有", "stock");
        put("有卖", "stock");
        put("有吗", "stock");
        put("卖吗", "stock");
        put("详情", "detail");
        put("介绍", "detail");
        put("规格", "detail");
        put("参数", "detail");
        put("功能", "detail");
        put("成分", "detail");
        put("材质", "detail");
        put("品牌", "brand");
        put("厂家", "brand");
        put("产地", "brand");
        put("评价", "review");
        put("评分", "review");
        put("口碑", "review");
        put("好评", "review");
        put("差评", "review");
    }};

     // 非商品词集合 - 避免错误识别
    private static final Set<String> NON_PRODUCT_TERMS = new HashSet<>(Arrays.asList(
            "商品", "产品", "订单", "购买", "查询", "我的", "所有", "全部", "最近",
            "历史", "记录", "信息", "详情", "状态", "物流", "发货", "收货", "退款",
            "的", "含", "是", "有", "在", "了", "吗", "呢", "啊", "哪些", "什么",
            "怎么", "如何", "为什么", "多少", "几个", "一下", "帮我", "请", "麻烦"
    ));

      // 意图分类阈值
    private static final double ORDER_THRESHOLD = 0.3;
    private static final double PRODUCT_THRESHOLD = 0.3;
     /**
     * 识别用户消息的意图类型
     * @param message 用户消息
     * @return 意图类型和提取的参数
     */
    public Map<String, Object> classifyIntent(String message) {
        Map<String, Object> result = new HashMap<>();
        
        // 默认为一般问答意图
        String intentType = INTENT_GENERAL_QUERY;
        Map<String, String> params = new HashMap<>();
        
        // 日志记录原始消息
        log.info("开始处理用户消息: {}", message);
        
        // 使用HanLP进行分词
        List<Term> terms = HanLP.segment(message);
        List<String> words = new ArrayList<>();
        for (Term term : terms) {
            words.add(term.word);
        }
        
        log.debug("分词结果: {}", words);
        
        // 首先检查特定模式，这些模式可以直接确定意图
        if (matchesOrderPattern(message)) {
            intentType = INTENT_ORDER_QUERY;
            params = extractOrderQueryParams(message, terms);
            log.info("通过特定模式识别为订单查询意图");
        }
        else if (matchesProductPattern(message)) {
            intentType = INTENT_PRODUCT_QUERY;
            params = extractProductQueryParams(message, terms);
            log.info("通过特定模式识别为商品查询意图");
        }
        else {
            // 计算各意图的得分
            double orderScore = calculateIntentScore(words, ORDER_QUERY_KEYWORDS);
            double productScore = calculateIntentScore(words, PRODUCT_QUERY_KEYWORDS);
            
            log.debug("意图得分 - 订单查询: {}, 商品查询: {}",
                    String.format("%.2f", orderScore),
                    String.format("%.2f", productScore));
            
            // 基于得分确定意图
            if (orderScore >= ORDER_THRESHOLD && orderScore >= productScore) {
                intentType = INTENT_ORDER_QUERY;
                params = extractOrderQueryParams(message, terms);
                log.info("基于得分识别为订单查询意图");
            }
            else if (productScore >= PRODUCT_THRESHOLD) {
                intentType = INTENT_PRODUCT_QUERY;
                params = extractProductQueryParams(message, terms);
                log.info("基于得分识别为商品查询意图");
            }
            else {
                log.info("识别为一般问答意图");
            }
        }
        
        // 如果是订单查询但没有提取到有效参数，尝试提取商品名称
        if (intentType.equals(INTENT_ORDER_QUERY) && !params.containsKey("productName") && !params.containsKey("orderCode")) {
            Map<String, String> productParams = extractProductNameFromMessage(message, terms);
            if (productParams.containsKey("productName")) {
                params.put("productName", productParams.get("productName"));
                log.debug("从订单查询中提取到商品名称: {}", productParams.get("productName"));
            }
        }
        
        result.put("intentType", intentType);
        result.put("params", params);
        
        log.info("最终意图识别结果: {}, 参数: {}", intentType, params);
        return result;
    }

     /**
     * 检查消息是否匹配订单查询模式
     */
    private boolean matchesOrderPattern(String message) {
        // 订单号模式
        if (message.contains("订单编号") || message.contains("订单号") || 
            message.matches(".*ORD\\d+.*")) {
            return true;
        }
        
        // 订单状态模式
        for (String statusKeyword : ORDER_STATUS_KEYWORDS.keySet()) {
            if (message.contains(statusKeyword)) {
                return true;
            }
        }
        
        // 订单查询特定模式
        String[] orderPatterns = {
            "我的订单", "订单查询", "查询订单", "查看订单", "订单记录", "购买记录", "消费记录",
            "我买的", "我购买的", "我的购买", "我的消费", "我花的钱", "我的花费",
            "我的.*订单", "查.*订单", "看.*订单", ".*订单.*查询", ".*订单.*记录"
        };
        
        for (String pattern : orderPatterns) {
            if (message.matches(".*" + pattern + ".*")) {
                return true;
            }
        }
        
        // 订单金额查询模式
        if (message.contains("总金额") || message.contains("花了多少") || 
            message.contains("花了多少钱") || message.contains("花的总金额") || 
            message.contains("总共花了") || message.contains("一共花了")) {
            return true;
        }
        
        return false;
    }

    /**
     * 检查消息是否匹配商品查询模式
     */
    private boolean matchesProductPattern(String message) {
        // 商品价格查询模式
        if (message.contains("多少钱") || message.contains("价格") || 
            message.contains("价钱") || message.contains("售价") || 
            message.contains("报价")) {
            return true;
        }
        
        // 商品库存查询模式
        if (message.contains("库存") || message.contains("有货") || 
            message.contains("有没有货") || message.contains("还有吗") || 
            message.contains("有卖") || (message.contains("还有") && message.contains("吗"))) {
            return true;
        }
        
        // 商品详情查询模式
        if (message.contains("介绍") || message.contains("详情") || 
            message.contains("规格") || message.contains("参数") || 
            message.contains("功能") || message.contains("成分") || 
            message.contains("材质")) {
            return true;
        }
        
        // 商品品牌查询模式
        if (message.contains("品牌") || message.contains("厂家") || 
            message.contains("产地")) {
            return true;
        }
        
        // 商品评价查询模式
        if (message.contains("评价") || message.contains("评分") || 
            message.contains("口碑") || message.contains("好评") || 
            message.contains("差评")) {
            return true;
        }
        
        return false;
    }

    /**
     * 计算意图得分 - 基于关键词匹配
     */
    private double calculateIntentScore(List<String> words, Set<String> keywords) {
        int matchCount = 0;
        double score = 0.0;
        
        for (String word : words) {
            if (keywords.contains(word)) {
                matchCount++;
                score += 1.0;
            } else {
                // 检查部分匹配
                for (String keyword : keywords) {
                    if (keyword.contains(word) || word.contains(keyword)) {
                        matchCount++;
                        score += 0.5; // 部分匹配给予较低的分数
                        break;
                    }
                }
            }
        }
        
        // 归一化得分，考虑消息长度的影响
        return score > 0 ? score / Math.max(words.size(), 3) : 0;
    }
     /**
     * 从订单查询消息中提取参数
     */
    private Map<String, String> extractOrderQueryParams(String message, List<Term> terms) {
        Map<String, String> params = new HashMap<>();
        
        // 提取订单编号 - 使用正则表达式匹配"订单编号"、"订单号"后面的数字和字母组合
        Pattern orderCodePattern = Pattern.compile("(?:订单编号|订单号|编号)[为是:]?\\s*([A-Za-z0-9]+)");
        Matcher orderCodeMatcher = orderCodePattern.matcher(message);
        if (orderCodeMatcher.find()) {
            params.put("orderCode", orderCodeMatcher.group(1));
            log.debug("提取到订单编号: {}", orderCodeMatcher.group(1));
        }
        
        // 如果上面的模式没匹配到，尝试匹配消息中的订单号格式（ORD开头的数字）
        if (!params.containsKey("orderCode")) {
            Pattern ordPattern = Pattern.compile("(ORD\\d+)");
            Matcher ordMatcher = ordPattern.matcher(message);
            if (ordMatcher.find()) {
                params.put("orderCode", ordMatcher.group(1));
                log.debug("提取到订单编号: {}", ordMatcher.group(1));
            }
        }
        
        // 提取商品名称 - 使用引号包围的内容作为商品名
        Pattern productNamePattern = Pattern.compile("[''\"\"](.*?)['\"\"]");
        Matcher productNameMatcher = productNamePattern.matcher(message);
        if (productNameMatcher.find()) {
            params.put("productName", productNameMatcher.group(1));
            log.debug("提取到商品名称: {}", productNameMatcher.group(1));
        } else {
            // 尝试从消息中提取可能的商品名称
            Map<String, String> productParams = extractProductNameFromMessage(message, terms);
            if (productParams.containsKey("productName")) {
                params.put("productName", productParams.get("productName"));
            }
        }
        
        // 检查是否查询总金额
        if (message.contains("总金额") || message.contains("花了多少") || 
            message.contains("花了多少钱") || message.contains("花的总金额") || 
            message.contains("总共花了") || message.contains("一共花了")) {
            params.put("queryType", "total_amount");
            log.debug("提取到查询类型: 总金额查询");
        }
        
        // 提取时间范围
        for (Map.Entry<String, String> entry : TIME_RANGE_KEYWORDS.entrySet()) {
            if (message.contains(entry.getKey())) {
                params.put("timeRange", entry.getValue());
                log.debug("提取到时间范围: {}", entry.getValue());
                break;
            }
        }
        
        // 如果没有提取到时间范围，默认为"all"
        if (!params.containsKey("timeRange")) {
            params.put("timeRange", "all");
            log.debug("默认时间范围: all");
        }
        
        // 提取订单状态
        for (Map.Entry<String, String> entry : ORDER_STATUS_KEYWORDS.entrySet()) {
            if (message.contains(entry.getKey())) {
                params.put("orderStatus", entry.getValue());
                log.debug("提取到订单状态: {}", entry.getValue());
                break;
            }
        }
        
        return params;
    }
     /**
     * 从商品查询消息中提取参数
     */
    private Map<String, String> extractProductQueryParams(String message, List<Term> terms) {
        Map<String, String> params = new HashMap<>();
        
        // 提取商品名称 - 使用引号包围的内容作为商品名
        Pattern productNamePattern = Pattern.compile("[''\"\"](.*?)['\"\"]");
        Matcher productNameMatcher = productNamePattern.matcher(message);
        if (productNameMatcher.find()) {
            params.put("productName", productNameMatcher.group(1));
            log.debug("提取到商品名称: {}", productNameMatcher.group(1));
        } else {
            // 处理特殊模式：有没有XX的库存/有没有XX卖
            Pattern stockPattern = Pattern.compile("有没有(.*?)(的库存|卖|吗|有货)");
            Matcher stockMatcher = stockPattern.matcher(message);
            if (stockPattern.matcher(message).find()) {
                stockMatcher.reset();
                if (stockMatcher.find()) {
                    String productName = stockMatcher.group(1).trim();
                    if (isValidProductName(productName)) {
                        params.put("productName", productName);
                        params.put("queryType", "stock");
                        log.debug("通过'有没有X'模式提取到商品名称: {}", productName);
                    }
                }
            } 
            // 处理特殊模式：XX多少钱/XX价格
            else if (message.contains("多少钱") || message.contains("价格") || message.contains("价钱") || message.contains("售价")) {
                // 尝试匹配"XX多少钱"模式
                Pattern pricePattern = Pattern.compile("(.*?)(多少钱|价格是多少|价钱|售价|报价)");
                Matcher priceMatcher = pricePattern.matcher(message);
                if (priceMatcher.find()) {
                    String potentialProductName = priceMatcher.group(1).trim();
                    // 移除问号和其他标点符号
                    potentialProductName = potentialProductName.replaceAll("[?？,，。.!！]", "");
                    if (isValidProductName(potentialProductName)) {
                        params.put("productName", potentialProductName);
                        params.put("queryType", "price");
                        log.debug("通过'X多少钱'模式提取到商品名称: {}", potentialProductName);
                    }
                }
            }
            else {
                // 尝试从消息中提取可能的商品名称
                Map<String, String> productParams = extractProductNameFromMessage(message, terms);
                if (productParams.containsKey("productName")) {
                    params.put("productName", productParams.get("productName"));
                }
            }
        }
        
        // 提取查询类型
        for (Map.Entry<String, String> entry : PRODUCT_QUERY_TYPE_KEYWORDS.entrySet()) {
            if (message.contains(entry.getKey())) {
                params.put("queryType", entry.getValue());
                log.debug("提取到查询类型: {}", entry.getValue());
                break;
            }
        }
        
        // 如果没有提取到查询类型，默认为"general"
        if (!params.containsKey("queryType")) {
            params.put("queryType", "general");
            log.debug("默认查询类型: general");
        }
        
        return params;
    }
    /**
     * 从消息中提取商品名称
     * 使用多种策略提取可能的商品名称
     */
    private Map<String, String> extractProductNameFromMessage(String message, List<Term> terms) {
        Map<String, String> params = new HashMap<>();
        StringBuilder productName = new StringBuilder();
        boolean foundPotentialProduct = false;
        
        // 记录分词结果，便于调试
        log.debug("商品名称提取分词结果: {}", terms);
        
        // 策略1: 基于购买模式提取
        int startIndex = findProductNameStartIndex(terms);
        
        // 如果找到了起始索引，从后面开始提取商品名称
        if (startIndex >= 0 && startIndex < terms.size()) {
            extractProductNameFromStartIndex(terms, startIndex, productName);
            foundPotentialProduct = productName.length() > 0;
        } 
        // 策略2: 基于词性的启发式提取
        else {
            foundPotentialProduct = extractProductNameByNature(terms, productName);
        }
        
        // 验证和过滤提取的商品名称
        if (foundPotentialProduct && productName.length() > 0) {
            String extractedName = productName.toString().trim();
            if (isValidProductName(extractedName)) {
                params.put("productName", extractedName);
                log.debug("提取到商品名称: {}", extractedName);
            } else {
                log.debug("提取的名称无效，不作为商品名称: {}", extractedName);
            }
        }
        
        return params;
    }
     /**
     * 查找商品名称的起始索引
     */
    private int findProductNameStartIndex(List<Term> terms) {
        // 检查是否包含"购买的"、"买的"等模式，这通常暗示后面跟着商品名称
        for (int i = 0; i < terms.size() - 1; i++) {
            String word = terms.get(i).word;
            
            // 检查"购买"或"买"后面是否跟着"的"
            if ((word.equals("购买") || word.equals("买")) && 
                i + 1 < terms.size() && terms.get(i + 1).word.equals("的")) {
                log.debug("找到'购买的'模式，从索引{}开始提取", i + 2);
                return i + 2; // 跳过"购买"和"的"
            }
            // 直接检查"购买的"或"买的"
            else if ((word.equals("购买的") || word.equals("买的")) && i + 1 < terms.size()) {
                log.debug("找到'购买的'模式，从索引{}开始提取", i + 1);
                return i + 1;
            }
            // 检查"包含"后面的内容
            else if (word.equals("包含") && i + 1 < terms.size()) {
                log.debug("找到'包含'模式，从索引{}开始提取", i + 1);
                return i + 1;
            }
            // 检查"关于"后面的内容
            else if (word.equals("关于") && i + 1 < terms.size()) {
                log.debug("找到'关于'模式，从索引{}开始提取", i + 1);
                return i + 1;
            }
            // 检查"有没有"后面的内容
            else if ((word.equals("有没有") || (word.equals("有") && i + 1 < terms.size() && terms.get(i + 1).word.equals("没有"))) && i + 1 < terms.size()) {
                int startIdx = word.equals("有没有") ? i + 1 : i + 2;
                log.debug("找到'有没有'模式，从索引{}开始提取", startIdx);
                return startIdx;
            }
        }
        
        return -1;
    }
    /**
     * 从起始索引开始提取商品名称
     */
    private void extractProductNameFromStartIndex(List<Term> terms, int startIndex, StringBuilder productName) {
        // 从起始索引开始，一直到遇到"的订单"或结束
        for (int i = startIndex; i < terms.size(); i++) {
            Term term = terms.get(i);
            String word = term.word;
            
            // 跳过可能的干扰词
            if (NON_PRODUCT_TERMS.contains(word)) {
                continue;
            }
            
            // 如果遇到"的"和"订单"连在一起，停止提取
            if (word.equals("的") && i + 1 < terms.size() && terms.get(i + 1).word.equals("订单")) {
                break;
            }
            // 如果遇到"订单"，停止提取
            if (word.equals("订单")) {
                break;
            }
            
            if (productName.length() > 0) {
                productName.append("");
            }
            productName.append(word);
        }
    }

     /**
     * 基于词性提取商品名称
     */
    private boolean extractProductNameByNature(List<Term> terms, StringBuilder productName) {
        boolean foundPotentialProduct = false;
        
        // 简单的启发式方法：假设商品名称通常是连续的名词或形容词
        for (int i = 0; i < terms.size(); i++) {
            Term term = terms.get(i);
            String nature = term.nature.toString();
            String word = term.word;
            
            // 跳过可能的干扰词
            if (NON_PRODUCT_TERMS.contains(word)) {
                continue;
            }
            
            // 如果是名词、形容词或未知词性（可能是新词或专有名词）
            if (nature.startsWith("n") || nature.startsWith("a") || nature.equals("w")) {
                if (productName.length() > 0) {
                    productName.append("");
                }
                productName.append(word);
                foundPotentialProduct = true;
            } 
            // 如果已经找到了可能的商品名称，并且遇到了动词、副词等，则停止
            else if (foundPotentialProduct && (nature.startsWith("v") || nature.startsWith("d") || nature.startsWith("p"))) {
                break;
            }
        }
        
        return foundPotentialProduct;
    }
    /**
     * 验证提取的商品名称是否有效
     */
    private boolean isValidProductName(String name) {
        // 检查是否为空
        if (name.isEmpty()) {
            return false;
        }
        
        // 检查是否是非商品词
        if (NON_PRODUCT_TERMS.contains(name)) {
            log.debug("名称是非商品词: {}", name);
            return false;
        }
        
        // 检查是否包含订单查询关键词
        for (String keyword : ORDER_QUERY_KEYWORDS) {
            if (name.contains(keyword)) {
                log.debug("名称包含订单查询关键词: {}", name);
                return false;
            }
        }
        
        // 检查长度是否合理（避免过短或过长的名称）
        if (name.length() < 2 || name.length() > 20) {
            log.debug("名称长度不合理: {}", name);
            return false;
        }
        
        return true;
    }
}
