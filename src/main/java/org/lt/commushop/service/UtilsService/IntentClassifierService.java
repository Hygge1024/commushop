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

    // 订单查询相关的关键词
    private static final Set<String> ORDER_QUERY_KEYWORDS = new HashSet<>(Arrays.asList(
            "订单", "购买", "买了", "下单", "付款", "支付", "物流", "发货", "收货", "退款", "退货",
            "查询", "查看", "查一下", "看看", "我的", "购物", "买过", "交易", "历史"
    ));

    // 商品查询相关的关键词
    private static final Set<String> PRODUCT_QUERY_KEYWORDS = new HashSet<>(Arrays.asList(
            "商品", "产品", "货物", "价格", "多少钱", "库存", "有没有", "有多少", "介绍", "详情", "规格", "参数",
            "还有", "卖", "售", "有", "卖吗", "有吗"
    ));

    // 一般问答关键词
    private static final Set<String> GENERAL_QUERY_KEYWORDS = new HashSet<>(Arrays.asList(
            "你好", "您好", "谢谢", "感谢", "请问", "帮助", "能不能", "可以", "怎么样", "如何", "什么是"
    ));

    // 意图分类阈值
    private static final double ORDER_THRESHOLD = 0.4;  // 降低订单查询的阈值
    private static final double PRODUCT_THRESHOLD = 0.3;  // 降低商品查询的阈值

    /**
     * 识别用户消息的意图类型
     * @param message 用户消息
     * @return 意图类型和提取的参数
     */
    public Map<String, Object> classifyIntent(String message) {
        Map<String, Object> result = new HashMap<>();

        // 默认为一般问答意图
        String intentType = "general_query";
        Map<String, String> params = new HashMap<>();

        // 使用HanLP进行分词
        List<Term> terms = HanLP.segment(message);
        List<String> words = new ArrayList<>();
        for (Term term : terms) {
            words.add(term.word);
        }

        log.info("分词结果: {}", words);

        // 计算各意图的得分
        double orderScore = calculateIntentScore(words, ORDER_QUERY_KEYWORDS);
        double productScore = calculateIntentScore(words, PRODUCT_QUERY_KEYWORDS);
        double generalScore = calculateIntentScore(words, GENERAL_QUERY_KEYWORDS);

        log.info("意图得分 - 订单查询: {}, 商品查询: {}, 一般问答: {}",
                String.format("%.2f", orderScore),
                String.format("%.2f", productScore),
                String.format("%.2f", generalScore));

        // 判断是否包含商品名称（引号内的内容）
        boolean hasProductName = message.matches(".*['\"\"].*?['\"\"].*");

        // 首先检查特定模式，这些模式可以直接确定意图
        if (containsSpecificOrderTerms(message)) {
            // 直接识别为订单查询意图，无需检查得分
            intentType = "order_query";
            params = extractOrderQueryParams(message);
            log.info("通过特定模式识别为订单查询意图，参数: {}", params);
        }
        else if (containsSpecificProductTerms(message)) {
            intentType = "product_query";
            params = extractProductQueryParams(message);
            log.info("通过特定模式识别为商品查询意图，参数: {}", params);
        }
        // 然后根据得分和规则确定意图
        else if (orderScore >= ORDER_THRESHOLD && (orderScore > productScore)) {
            intentType = "order_query";
            params = extractOrderQueryParams(message);
            log.info("识别为订单查询意图，参数: {}", params);
        }
        else if (productScore >= PRODUCT_THRESHOLD && (hasProductName || productScore > generalScore)) {
            intentType = "product_query";
            params = extractProductQueryParams(message);
            log.info("识别为商品查询意图，参数: {}", params);
        }
        else {
            log.info("识别为一般问答意图");
        }

        result.put("intentType", intentType);
        result.put("params", params);
        result.put("confidence", getConfidenceScore(intentType, orderScore, productScore, generalScore));

        log.info("最终意图识别结果: {}, 置信度: {}", intentType, result.get("confidence"));
        return result;
    }

    /**
     * 计算意图得分 - 基于关键词匹配
     */
    private double calculateIntentScore(List<String> words, Set<String> keywords) {
        int matchCount = 0;
        for (String word : words) {
            if (keywords.contains(word)) {
                matchCount++;
            } else {
                // 检查部分匹配
                for (String keyword : keywords) {
                    if (keyword.contains(word) || word.contains(keyword)) {
                        matchCount += 0.5; // 部分匹配给予较低的分数
                        break;
                    }
                }
            }
        }

        // 归一化得分
        return matchCount > 0 ? (double) matchCount / Math.max(words.size(), 5) : 0;
    }

    /**
     * 获取意图的置信度得分
     */
    private double getConfidenceScore(String intentType, double orderScore, double productScore, double generalScore) {
        switch (intentType) {
            case "order_query":
                return orderScore;
            case "product_query":
                return productScore;
            default:
                return generalScore;
        }
    }

    /**
     * 检查是否包含特定的订单术语
     */
    private boolean containsSpecificOrderTerms(String message) {
        return message.contains("我的订单") ||
               message.contains("购买记录") ||
               message.contains("买过") ||
               message.contains("订单状态") ||
               message.contains("物流信息") ||
               message.contains("发货状态") ||
               message.contains("查询订单") ||
               message.contains("查看订单") ||
               message.contains("所有订单") ||
               message.contains("我买的") ||
               message.contains("我购买的") ||
               message.contains("我的购买") ||
               // 增加更多匹配模式，特别是针对"查询我的所有订单"这样的表达
               message.contains("我的所有订单") ||
               message.contains("查询") && message.contains("订单") ||
               message.contains("查看") && message.contains("订单") ||
               message.contains("我") && message.contains("订单") ||
               message.matches(".*查.*订单.*") ||
               message.matches(".*我.*订单.*");
    }

    /**
     * 检查是否包含特定的商品术语
     */
    private boolean containsSpecificProductTerms(String message) {
        // 库存查询模式
        if (message.contains("库存") ||
            message.contains("有货") ||
            message.contains("有没有货") ||
            message.contains("还有吗") ||
            message.contains("有卖") ||
            (message.contains("还有") && message.contains("吗"))) {
            log.debug("匹配到库存查询模式");
            return true;
        }

        // 价格查询模式
        if (message.contains("多少钱") ||
            message.contains("价格") ||
            message.contains("价钱") ||
            message.contains("售价") ||
            message.contains("报价")) {
            log.debug("匹配到价格查询模式");
            return true;
        }

        // 商品信息查询模式
        if (message.contains("介绍一下") ||
            message.contains("详细信息") ||
            message.contains("详情") ||
            message.contains("规格") ||
            message.contains("参数") ||
            message.contains("功能")) {
            log.debug("匹配到商品信息查询模式");
            return true;
        }

        return false;
    }

    /**
     * 检查消息是否包含订单查询意图
     */
    private boolean containsOrderQueryIntent(String message) {
        // 使用HanLP分词
        List<Term> terms = HanLP.segment(message);

        // 检查是否包含订单查询关键词
        for (Term term : terms) {
            if (ORDER_QUERY_KEYWORDS.contains(term.word)) {
                log.debug("订单查询关键词匹配: {}", term.word);
                return true;
            }
        }

        // 检查特定订单查询模式
        if (containsSpecificOrderTerms(message)) {
            log.debug("特定订单查询模式匹配");
            return true;
        }

        return false;
    }

    /**
     * 检查消息是否包含商品查询意图
     */
    private boolean containsProductQueryIntent(String message) {
        // 使用HanLP分词
        List<Term> terms = HanLP.segment(message);

        // 检查是否包含商品查询关键词
        for (Term term : terms) {
            if (PRODUCT_QUERY_KEYWORDS.contains(term.word)) {
                log.debug("商品查询关键词匹配: {}", term.word);
                return true;
            }
        }

        // 检查特定商品查询模式
        if (containsSpecificProductTerms(message)) {
            log.debug("特定商品查询模式匹配");
            return true;
        }

        return false;
    }

    /**
     * 从订单查询消息中提取参数
     */
    private Map<String, String> extractOrderQueryParams(String message) {
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

        // 提取商品名称 - 使用单引号或双引号包围的内容作为商品名
        Pattern productNamePattern = Pattern.compile("[''\"\"](.*?)['\"\"]");
        Matcher productNameMatcher = productNamePattern.matcher(message);
        if (productNameMatcher.find()) {
            params.put("productName", productNameMatcher.group(1));
            log.debug("提取到商品名称: {}", productNameMatcher.group(1));
        } else {
            // 尝试从消息中提取可能的商品名称
            extractPossibleProductName(message, params);
        }

        // 检查是否查询总金额
        if (message.contains("总金额") || message.contains("花了多少") || message.contains("花了多少钱") || 
            message.contains("花的总金额") || message.contains("总共花了") || message.contains("一共花了")) {
            params.put("queryType", "total_amount");
            log.debug("提取到查询类型: 总金额查询");
        }

        // 提取时间范围
        if (message.contains("当前") || message.contains("现在")) {
            params.put("timeRange", "current");
            log.debug("提取到时间范围: current");
        } else if (message.contains("最近") || message.contains("近期")) {
            if (message.contains("一周") || message.contains("7天")) {
                params.put("timeRange", "last_week");
                log.debug("提取到时间范围: last_week");
            } else if (message.contains("一个月") || message.contains("30天")) {
                params.put("timeRange", "last_month");
                log.debug("提取到时间范围: last_month");
            } else {
                params.put("timeRange", "recent");
                log.debug("提取到时间范围: recent");
            }
        } else if (message.contains("全部") || message.contains("所有")) {
            params.put("timeRange", "all");
            log.debug("提取到时间范围: all");
        } else {
            params.put("timeRange", "all"); // 默认查询所有时间
            log.debug("默认时间范围: all");
        }

        // 提取订单状态
        if (message.contains("未支付") || message.contains("待支付")) {
            params.put("orderStatus", "unpaid");
            log.debug("提取到订单状态: unpaid");
        } else if (message.contains("已支付") || message.contains("支付成功")) {
            params.put("orderStatus", "paid");
            log.debug("提取到订单状态: paid");
        } else if (message.contains("已发货") || message.contains("运输中")) {
            params.put("orderStatus", "shipped");
            log.debug("提取到订单状态: shipped");
        } else if (message.contains("已送达") || message.contains("待收货")) {
            params.put("orderStatus", "delivered");
            log.debug("提取到订单状态: delivered");
        } else if (message.contains("已收货") || message.contains("已完成")) {
            params.put("orderStatus", "received");
            log.debug("提取到订单状态: received");
        } else if (message.contains("退款")) {
            params.put("orderStatus", "refund");
            log.debug("提取到订单状态: refund");
        }

        return params;
    }

    /**
     * 从商品查询消息中提取参数
     */
    private Map<String, String> extractProductQueryParams(String message) {
        Map<String, String> params = new HashMap<>();

        // 提取商品名称
        Pattern productNamePattern = Pattern.compile("[''\"\"](.*?)['\"\"]");
        Matcher productNameMatcher = productNamePattern.matcher(message);
        if (productNameMatcher.find()) {
            params.put("productName", productNameMatcher.group(1));
            log.debug("提取到商品名称: {}", productNameMatcher.group(1));
        } else {
            // 尝试从消息中提取可能的商品名称
            extractPossibleProductName(message, params);
        }

        // 提取查询类型
        if (message.contains("价格") || message.contains("多少钱") || message.contains("价钱") || message.contains("售价")) {
            params.put("queryType", "price");
            log.debug("提取到查询类型: price");
        } else if (message.contains("库存") || message.contains("有多少") || message.contains("有没有") ||
                   message.contains("有货") || message.contains("还有") || message.contains("有卖")) {
            params.put("queryType", "stock");
            log.debug("提取到查询类型: stock");
        } else if (message.contains("详情") || message.contains("介绍") || message.contains("规格") || message.contains("参数")) {
            params.put("queryType", "detail");
            log.debug("提取到查询类型: detail");
        } else {
            params.put("queryType", "general");
            log.debug("默认查询类型: general");
        }

        return params;
    }

    /**
     * 尝试从消息中提取可能的商品名称
     */
    private void extractPossibleProductName(String message, Map<String, String> params) {
        List<Term> terms = HanLP.segment(message);
        StringBuilder productName = new StringBuilder();
        boolean foundPotentialProduct = false;
        
        // 记录分词结果，便于调试
        log.debug("商品名称提取分词结果: {}", terms);
        
        // 检查是否包含"购买的"、"买的"等模式，这通常暗示后面跟着商品名称
        int startIndex = -1;
        for (int i = 0; i < terms.size() - 1; i++) {
            String word = terms.get(i).word;
            // 检查"购买"或"买"后面是否跟着"的"
            if ((word.equals("购买") || word.equals("买")) && 
                i + 1 < terms.size() && terms.get(i + 1).word.equals("的")) {
                startIndex = i + 2; // 跳过"购买"和"的"
                log.debug("找到'购买的'模式，从索引{}开始提取商品名称", startIndex);
                break;
            }
            // 直接检查"购买的"或"买的"
            else if ((word.equals("购买的") || word.equals("买的")) && i + 1 < terms.size()) {
                startIndex = i + 1;
                log.debug("找到'购买的'模式，从索引{}开始提取商品名称", startIndex);
                break;
            }
        }
        
        // 如果找到了"购买的"等模式，从后面开始提取商品名称
        if (startIndex >= 0 && startIndex < terms.size()) {
            // 从"购买的"后面开始，一直到遇到"的订单"或结束
            for (int i = startIndex; i < terms.size(); i++) {
                Term term = terms.get(i);
                String word = term.word;
                
                // 跳过可能的干扰词
                if (word.equals("的") || word.equals("含") || word.equals("是")) {
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
                foundPotentialProduct = true;
            }
        } 
        // 如果没有找到特定模式，使用原来的启发式方法
        else {
            // 简单的启发式方法：假设商品名称通常是连续的名词或形容词
            for (int i = 0; i < terms.size(); i++) {
                Term term = terms.get(i);
                String nature = term.nature.toString();
                String word = term.word;
                
                // 跳过可能的干扰词
                if (word.equals("的") || word.equals("含") || word.equals("是")) {
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
        }
        
        if (foundPotentialProduct && productName.length() > 0) {
            String extractedName = productName.toString().trim();
            // 过滤掉一些常见的非商品词
            Set<String> nonProductTerms = new HashSet<>(Arrays.asList(
                "商品", "产品", "订单", "购买", "查询", "我的", "所有", "全部", "最近",
                "历史", "记录", "信息", "详情", "状态", "物流", "发货", "收货", "退款",
                "的", "含", "是"
            ));
            
            // 检查提取的名称是否是非商品词
            if (!extractedName.isEmpty() && !nonProductTerms.contains(extractedName)) {
                // 检查提取的名称是否包含订单查询关键词
                boolean containsOrderKeyword = false;
                for (String keyword : ORDER_QUERY_KEYWORDS) {
                    if (extractedName.contains(keyword)) {
                        containsOrderKeyword = true;
                        break;
                    }
                }
                
                if (!containsOrderKeyword) {
                    params.put("productName", extractedName);
                    log.debug("提取到可能的商品名称: {}", extractedName);
                } else {
                    log.debug("提取的名称包含订单查询关键词，不作为商品名称: {}", extractedName);
                }
            } else {
                log.debug("提取的名称是非商品词，不作为商品名称: {}", extractedName);
            }
        }
    }
}
