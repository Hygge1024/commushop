package org.lt.commushop.service.UtilsService;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import lombok.extern.slf4j.Slf4j;
import com.baomidou.mybatisplus.core.toolkit.StringUtils;
import org.lt.commushop.domain.entity.Order;
import org.lt.commushop.domain.entity.OrderProducts;
import org.lt.commushop.domain.entity.Product;
import org.lt.commushop.domain.vo.OrderProductVO;
import org.lt.commushop.service.IOrderProductsService;
import org.lt.commushop.service.IOrderService;
import org.lt.commushop.service.IProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 查询执行服务 - 执行数据库查询并格式化结果
 */
@Slf4j
@Service
public class QueryExecutorService {

    @Autowired
    private IOrderProductsService orderProductsService;

    @Autowired
    private IProductService productService;

    @Autowired
    private IOrderService orderService;

    /**
     * 执行查询并返回格式化结果
     * @param intentType 意图类型
     * @param params 查询参数
     * @param userId 用户ID
     * @return 格式化的查询结果
     */
    public String executeQuery(String intentType, Map<String, String> params, Integer userId) {
        try {
            log.info("执行查询 - 意图类型: {}, 参数: {}, 用户ID: {}", intentType, params, userId);
            switch (intentType) {
                case IntentClassifierService.INTENT_ORDER_QUERY:
                    return executeOrderQuery(params, userId);
                case IntentClassifierService.INTENT_PRODUCT_QUERY:
                    return executeProductQuery(params);
                default:
                    return null; // 返回null表示无法处理，交给AI模型
            }
        } catch (Exception e) {
            log.error("执行查询时出错: ", e);
            return "抱歉，查询过程中出现错误: " + e.getMessage();
        }
    }

    /**
     * 执行订单查询
     */
    private String executeOrderQuery(Map<String, String> params, Integer userId) {
        if (userId == null) {
            return "抱歉，需要登录后才能查询您的订单信息。";
        }

        // 构建查询参数
        Integer current = 1;
        Integer size = 10;
        String orderCode = params.get("orderCode");
        String queryType = params.get("queryType");
        String timeRange = params.get("timeRange");
        String orderStatus = params.get("orderStatus");

        // 记录查询参数
        log.info("订单查询参数 - 订单号: {}, 查询类型: {}, 时间范围: {}, 订单状态: {}",
                orderCode, queryType, timeRange, orderStatus);

        // 处理订单状态
        List<Integer> statusList = new ArrayList<>();
        if (orderStatus != null && !orderStatus.isEmpty()) {
            // 订单状态可能是逗号分隔的多个值
            String[] statusArray = orderStatus.split(",");
            for (String status : statusArray) {
                try {
                    statusList.add(Integer.parseInt(status.trim()));
                } catch (NumberFormatException e) {
                    log.warn("无效的订单状态值: {}", status);
                }
            }
            log.info("订单状态过滤: {}", statusList);
        }

        // 如果是查询特定订单的总金额
        if (orderCode != null && "total_amount".equals(queryType)) {
            return queryOrderTotalAmount(orderCode, userId);
        }

        // 根据商品名称查询
        String productName = params.get("productName");
        List<Integer> productIds = new ArrayList<>();
        if (productName != null && !productName.isEmpty()) {
            // 先查询符合名称的商品ID
            LambdaQueryWrapper<Product> productQueryWrapper = new LambdaQueryWrapper<>();
            productQueryWrapper.like(StringUtils.isNotBlank(productName), Product::getProductName, productName)
                              .eq(Product::getIsDeleted, 0);
            List<Product> products = productService.list(productQueryWrapper);

            if (products.isEmpty()) {
                return "抱歉，没有找到名称包含" + productName + "的商品。";
            }

            // 收集商品ID
            for (Product product : products) {
                productIds.add(product.getProductId());
            }

            log.info("根据商品名称{}找到{}个商品", productName, productIds.size());

            // 如果是查询包含特定商品的订单，直接通过商品ID查询
            if (productIds.size() > 0 && orderCode == null && timeRange.equals("all") && statusList.isEmpty()) {
                return queryOrdersByProductIds(productIds, userId);
            }
        }

        // 处理时间范围
        final LocalDateTime startTime;
        final LocalDateTime endTime;
        if (timeRange != null && !timeRange.equals("all")) {
            LocalDateTime now = LocalDateTime.now();
            switch (timeRange) {
                case "today":
                    startTime = now.toLocalDate().atStartOfDay();
                    endTime = now;
                    break;
                case "yesterday":
                    startTime = now.toLocalDate().minusDays(1).atStartOfDay();
                    endTime = now.toLocalDate().atStartOfDay().minusSeconds(1);
                    break;
                case "this_week":
                    startTime = now.toLocalDate().minusDays(now.getDayOfWeek().getValue() - 1).atStartOfDay();
                    endTime = now;
                    break;
                case "last_week":
                    startTime = now.toLocalDate().minusDays(now.getDayOfWeek().getValue() + 6).atStartOfDay();
                    endTime = now.toLocalDate().minusDays(now.getDayOfWeek().getValue()).atStartOfDay().minusSeconds(1);
                    break;
                case "this_month":
                    startTime = now.toLocalDate().withDayOfMonth(1).atStartOfDay();
                    endTime = now;
                    break;
                case "last_month":
                    startTime = now.toLocalDate().minusMonths(1).withDayOfMonth(1).atStartOfDay();
                    endTime = now.toLocalDate().withDayOfMonth(1).atStartOfDay().minusSeconds(1);
                    break;
                case "recent":
                default:
                    startTime = now.minus(30, ChronoUnit.DAYS);
                    endTime = now;
                    break;
            }
            log.info("时间范围: {} -> 从 {} 到 {}", timeRange, startTime, endTime);
        } else {
            startTime = null;
            endTime = null;
        }

        // 执行查询
        log.info("执行订单查询 - 用户ID: {}, 订单编号: {}, 商品名称: {}, 时间范围: {}, 订单状态: {}",
                userId, orderCode, productName, timeRange, statusList);

        IPage<OrderProductVO> page = orderProductsService.getOrderProductsPage(current, size, orderCode, userId);
        List<OrderProductVO> orderProducts = page.getRecords();

        // 获取订单状态信息
        Map<String, Integer> orderStatusMap = new HashMap<>();
        Map<String, LocalDateTime> orderCreateTimeMap = new HashMap<>();
        if (!orderProducts.isEmpty()) {
            for (OrderProductVO op : orderProducts) {
                if (!orderStatusMap.containsKey(op.getOrderCode())) {
                    // 查询订单状态
                    LambdaQueryWrapper<Order> orderQueryWrapper = new LambdaQueryWrapper<>();
                    orderQueryWrapper.eq(Order::getOrderCode, op.getOrderCode())
                                    .eq(Order::getUserId, userId);
                    Order order = orderService.getOne(orderQueryWrapper);
                    if (order != null) {
                        orderStatusMap.put(op.getOrderCode(), order.getOrderStatus());
                        orderCreateTimeMap.put(op.getOrderCode(), order.getCreateTime());
                    }
                }
            }
        }

        // 过滤结果
        if (!productIds.isEmpty() || !statusList.isEmpty() || startTime != null) {
            final LocalDateTime finalStartTime = startTime;
            final LocalDateTime finalEndTime = endTime;
            orderProducts = orderProducts.stream()
                .filter(op -> {
                    // 商品ID过滤
                    boolean productMatch = productIds.isEmpty() ||
                        (op.getProduct() != null && productIds.contains(op.getProduct().getProductId()));

                    // 订单状态过滤
                    boolean statusMatch = statusList.isEmpty() ||
                        (orderStatusMap.containsKey(op.getOrderCode()) &&
                         statusList.contains(orderStatusMap.get(op.getOrderCode())));

                    // 时间范围过滤
                    boolean timeMatch = finalStartTime == null ||
                        (orderCreateTimeMap.containsKey(op.getOrderCode()) &&
                         !orderCreateTimeMap.get(op.getOrderCode()).isBefore(finalStartTime) &&
                         !orderCreateTimeMap.get(op.getOrderCode()).isAfter(finalEndTime));

                    return productMatch && statusMatch && timeMatch;
                })
                .collect(java.util.stream.Collectors.toList());
        }

        // 格式化结果
        if (orderProducts.isEmpty()) {
            if (productName != null && !productName.isEmpty()) {
                return "您目前没有购买" + productName + "的订单。";
            } else if (orderCode != null && !orderCode.isEmpty()) {
                return "没有找到订单号为" + orderCode + "的订单。";
            } else if (!statusList.isEmpty()) {
                return "您目前没有对应状态的订单。";
            } else if (timeRange != null && !timeRange.equals("all")) {
                return "您在指定时间范围内没有订单记录。";
            } else {
                return "您目前没有符合条件的订单。";
            }
        }

        StringBuilder result = new StringBuilder();
        if (productName != null && !productName.isEmpty()) {
            result.append("您购买").append(productName).append("的订单有：\n\n");
        } else if (orderCode != null && !orderCode.isEmpty()) {
            result.append("订单号为").append(orderCode).append("的信息如下：\n\n");
        } else if (!statusList.isEmpty()) {
            result.append("您的指定状态订单信息如下：\n\n");
        } else if (timeRange != null && !timeRange.equals("all")) {
            String timeRangeDesc = getTimeRangeDescription(timeRange);
            result.append("您").append(timeRangeDesc).append("的订单信息如下：\n\n");
        } else {
            result.append("您的订单信息如下：\n\n");
        }

        // 构建订单信息
        for (int i = 0; i < orderProducts.size(); i++) {
            OrderProductVO orderProduct = orderProducts.get(i);
            Product product = orderProduct.getProduct();
            String productNameStr = product != null ? product.getProductName() : "未知商品";

            result.append(i + 1).append(". 订单号: ").append(orderProduct.getOrderCode())
                  .append("\n   商品: ").append(productNameStr)
                  .append("\n   数量: ").append(orderProduct.getAmount());

            // 添加订单状态
            Integer status = orderStatusMap.get(orderProduct.getOrderCode());
            if (status != null) {
                result.append("\n   状态: ").append(getOrderStatusText(status));
            }

            // 计算总价
            if (product != null && product.getGroupPrice() != null) {
                double totalMoney = product.getGroupPrice().doubleValue() * orderProduct.getAmount();
                result.append("\n   总价: ¥").append(String.format("%.2f", totalMoney));
            }
            result.append("\n\n");
        }

        // 添加分页信息
        if (page.getTotal() > page.getSize()) {
            result.append("共找到 ").append(page.getTotal()).append(" 条订单记录，当前显示第 1 页的 ")
                  .append(orderProducts.size()).append(" 条记录。");
        }

        return result.toString();
    }

    /**
     * 获取时间范围的描述文本
     */
    private String getTimeRangeDescription(String timeRange) {
        switch (timeRange) {
            case "today": return "今天";
            case "yesterday": return "昨天";
            case "this_week": return "本周";
            case "last_week": return "上周";
            case "this_month": return "本月";
            case "last_month": return "上个月";
            case "recent": return "最近30天";
            default: return "所有时间";
        }
    }

    /**
     * 获取订单状态的文本描述
     */
    private String getOrderStatusText(Integer status) {
        if (status == null) return "未知状态";

        switch (status) {
            case 0:
            case 1: return "待付款";
            case 2: return "已支付，待发货";
            case 3: return "已发货，运输中";
            case 4: return "已送达，待收货";
            case 5: return "已收货，完成";
            case 6: return "退款申请中";
            case 7: return "退款已批准";
            case 8: return "退款已拒绝";
            case 9: return "退款成功";
            default: return "未知状态(" + status + ")";
        }
    }

    /**
     * 查询订单总金额
     */
    private String queryOrderTotalAmount(String orderCode, Integer userId) {
        log.info("查询订单总金额 - 订单号: {}, 用户ID: {}", orderCode, userId);

        // 查询订单产品信息
        LambdaQueryWrapper<OrderProductVO> queryWrapper = new LambdaQueryWrapper<>();
        if (userId != null) {
            queryWrapper.eq(OrderProductVO::getUserId, userId);
        }
        queryWrapper.eq(OrderProductVO::getOrderCode, orderCode);

        IPage<OrderProductVO> page = orderProductsService.getOrderProductsPage(1, 100, orderCode, userId);
        List<OrderProductVO> orderProducts = page.getRecords();

        if (orderProducts.isEmpty()) {
            return "没有找到订单号为" + orderCode + "的订单信息。";
        }

        // 计算总金额
        double totalAmount = 0.0;
        for (OrderProductVO orderProduct : orderProducts) {
            Product product = orderProduct.getProduct();
            if (product != null && product.getGroupPrice() != null) {
                totalAmount += product.getGroupPrice().doubleValue() * orderProduct.getAmount();
            }
        }

        StringBuilder result = new StringBuilder();
        result.append("订单号为").append(orderCode).append("的总金额为: ¥").append(String.format("%.2f", totalAmount));

        return result.toString();
    }

    /**
     * 执行商品查询
     */
    private String executeProductQuery(Map<String, String> params) {
        String productName = params.get("productName");
        if (productName == null || productName.isEmpty()) {
            log.warn("商品查询缺少商品名称参数");
            return "抱歉，请告诉我您想查询哪个商品的信息？";
        }

        String queryType = params.get("queryType");
        if (queryType == null) {
            queryType = "general"; // 默认为一般查询
        }

        log.info("执行商品查询 - 商品名称: {}, 查询类型: {}", productName, queryType);

        // 构建查询条件 - 使用与ProductServiceImpl相同的查询方式
        LambdaQueryWrapper<Product> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.like(StringUtils.isNotBlank(productName), Product::getProductName, productName)
                   .eq(Product::getIsDeleted, 0)
                   .orderByDesc(Product::getProductId);

        // 执行查询
        List<Product> products = productService.list(queryWrapper);
        log.info("查询到 {} 个商品", products.size());

        // 格式化结果
        if (products.isEmpty()) {
            return "抱歉，没有找到名称包含" + productName + "的商品。";
        }

        StringBuilder result = new StringBuilder();

        switch (queryType) {
            case "price":
                result.append("以下是").append(productName).append("相关商品的价格信息：\n\n");
                for (int i = 0; i < Math.min(products.size(), 5); i++) {
                    Product product = products.get(i);
                    result.append(i + 1).append(". ").append(product.getProductName())
                          .append("\n   原价: ¥").append(product.getOriginalPrice());

                    if (product.getGroupPrice() != null) {
                        result.append("\n   优惠价: ¥").append(product.getGroupPrice());
                    }

                    result.append("\n\n");
                }
                break;

            case "stock":
                result.append("以下是").append(productName).append("相关商品的库存信息：\n\n");
                for (int i = 0; i < Math.min(products.size(), 5); i++) {
                    Product product = products.get(i);
                    result.append(i + 1).append(". ").append(product.getProductName());

                    Integer stock = product.getStockQuantity();
                    if (stock != null && stock > 0) {
                        result.append("\n   库存: ").append(stock).append(" 件");
                        result.append("\n   状态: 有货");
                    } else {
                        result.append("\n   库存: 0 件");
                        result.append("\n   状态: 无货");
                    }

                    result.append("\n\n");
                }

                // 直接回答是否有库存的问题
                if (products.size() == 1) {
                    Product product = products.get(0);
                    Integer stock = product.getStockQuantity();
                    if (stock != null && stock > 0) {
                        result.append(product.getProductName()).append("目前有库存，库存数量为 ").append(stock).append(" 件。");
                    } else {
                        result.append(product.getProductName()).append("目前无库存。");
                    }
                } else {
                    boolean hasStock = false;
                    for (Product product : products) {
                        Integer stock = product.getStockQuantity();
                        if (stock != null && stock > 0) {
                            hasStock = true;
                            break;
                        }
                    }

                    if (hasStock) {
                        result.append("有部分").append(productName).append("相关商品有库存。");
                    } else {
                        result.append("所有").append(productName).append("相关商品均无库存。");
                    }
                }
                break;

            case "detail":
                result.append("以下是").append(productName).append("相关商品的详细信息：\n\n");
                for (int i = 0; i < Math.min(products.size(), 5); i++) {
                    Product product = products.get(i);
                    result.append(i + 1).append(". ").append(product.getProductName());

                    if (product.getProductDesc() != null && !product.getProductDesc().isEmpty()) {
                        result.append("\n   描述: ").append(product.getProductDesc());
                    }

                    result.append("\n   原价: ¥").append(product.getOriginalPrice());

                    if (product.getGroupPrice() != null) {
                        result.append("\n   优惠价: ¥").append(product.getGroupPrice());
                    }

                    Integer stock = product.getStockQuantity();
                    if (stock != null && stock > 0) {
                        result.append("\n   库存: ").append(stock).append(" 件 (有货)");
                    } else {
                        result.append("\n   库存: 0 件 (无货)");
                    }

                    result.append("\n\n");
                }
                break;
            case "review":
                // 注意：这里假设没有评价相关的字段，返回一个提示信息
                result.append("抱歉，目前暂无").append(productName).append("相关商品的评价信息。");
                break;

            case "general":
            default:
                result.append("以下是").append(productName).append("相关商品的信息：\n\n");
                for (int i = 0; i < Math.min(products.size(), 5); i++) {
                    Product product = products.get(i);
                    result.append(i + 1).append(". ").append(product.getProductName());

                    if (product.getProductDesc() != null && !product.getProductDesc().isEmpty()) {
                        result.append("\n   描述: ").append(product.getProductDesc());
                    }

                    result.append("\n   原价: ¥").append(product.getOriginalPrice());

                    if (product.getGroupPrice() != null) {
                        result.append("\n   优惠价: ¥").append(product.getGroupPrice());
                    }

                    Integer stock = product.getStockQuantity();
                    if (stock != null && stock > 0) {
                        result.append("\n   库存: ").append(stock).append(" 件 (有货)");
                    } else {
                        result.append("\n   库存: 0 件 (无货)");
                    }

                    result.append("\n\n");
                }
                break;
        }

        // 如果结果太长，添加提示
        if (products.size() > 5) {
            result.append("共找到 ").append(products.size()).append(" 个相关商品，仅显示前 5 个。");
        }

        return result.toString();
    }

    /**
     * 根据商品ID列表获取商品映射
     */
    private Map<Integer, Product> getProductMapByIds(List<Integer> productIds) {
        Map<Integer, Product> productMap = new java.util.HashMap<>();
        if (productIds.isEmpty()) {
            return productMap;
        }

        LambdaQueryWrapper<Product> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.in(Product::getProductId, productIds);
        List<Product> products = productService.list(queryWrapper);

        for (Product product : products) {
            productMap.put(product.getProductId(), product);
        }

        return productMap;
    }

    /**
     * 通过商品ID列表查询订单
     */
    private String queryOrdersByProductIds(List<Integer> productIds, Integer userId) {
        if (productIds.isEmpty() || userId == null) {
            return "抱歉，无法查询订单信息。";
        }

        log.info("通过商品ID查询订单 - 商品IDs: {}, 用户ID: {}", productIds, userId);

        // 1. 通过商品ID查询OrderProducts表，获取订单编号
        LambdaQueryWrapper<OrderProducts> opQueryWrapper = new LambdaQueryWrapper<>();
        opQueryWrapper.in(OrderProducts::getProductId, productIds)
                     .eq(OrderProducts::getUserId, userId);
        List<OrderProducts> orderProductsList = orderProductsService.list(opQueryWrapper);

        if (orderProductsList.isEmpty()) {
            return "您没有购买过包含这些商品的订单。";
        }

        // 2. 收集订单编号
        List<String> orderCodes = orderProductsList.stream()
                                                  .map(OrderProducts::getOrderCode)
                                                  .distinct()
                                                  .collect(Collectors.toList());

        log.info("找到{}个相关订单", orderCodes.size());

        // 3. 查询订单详情和状态
        Map<String, Order> orderMap = new HashMap<>();
        for (String code : orderCodes) {
            LambdaQueryWrapper<Order> orderQueryWrapper = new LambdaQueryWrapper<>();
            orderQueryWrapper.eq(Order::getOrderCode, code)
                            .eq(Order::getUserId, userId);
            Order order = orderService.getOne(orderQueryWrapper);
            if (order != null) {
                orderMap.put(code, order);
            }
        }

        // 4. 查询订单中的所有商品
        IPage<OrderProductVO> page = orderProductsService.getOrderProductsPage(1, 100, null, userId);
        List<OrderProductVO> allOrderProducts = page.getRecords();

        // 按订单编号分组
        Map<String, List<OrderProductVO>> orderProductsMap = allOrderProducts.stream()
                                                                           .filter(op -> orderCodes.contains(op.getOrderCode()))
                                                                           .collect(Collectors.groupingBy(OrderProductVO::getOrderCode));

        // 5. 格式化结果
        StringBuilder result = new StringBuilder();
        result.append("您购买包含指定商品的订单有：\n\n");

        int count = 1;
        for (String orderCode : orderCodes) {
            Order order = orderMap.get(orderCode);
            if (order == null) continue;

            result.append(count++).append(". 订单号: ").append(orderCode);
            result.append("\n   状态: ").append(getOrderStatusText(order.getOrderStatus()));

            // 添加创建时间
            if (order.getCreateTime() != null) {
                result.append("\n   创建时间: ").append(
                    order.getCreateTime().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
            }

            // 添加订单中的商品信息
            List<OrderProductVO> products = orderProductsMap.getOrDefault(orderCode, new ArrayList<>());
            if (!products.isEmpty()) {
                result.append("\n   包含商品:");

                double totalMoney = 0.0;
                for (OrderProductVO op : products) {
                    Product product = op.getProduct();
                    if (product != null) {
                        result.append("\n     - ").append(product.getProductName())
                              .append(" x").append(op.getAmount());

                        // 计算该商品的金额
                        if (product.getGroupPrice() != null) {
                            double itemTotal = product.getGroupPrice().doubleValue() * op.getAmount();
                            totalMoney += itemTotal;
                            result.append(" (¥").append(String.format("%.2f", itemTotal)).append(")");
                        }
                    }
                }

                // 添加订单总金额
                result.append("\n   总金额: ¥").append(String.format("%.2f", totalMoney));
            }

            result.append("\n\n");
        }

        // 添加总数信息
        if (orderCodes.size() > 0) {
            result.append("共找到 ").append(orderCodes.size()).append(" 个包含指定商品的订单。");
        }

        return result.toString();
    }
}
