package org.lt.commushop.service.UtilsService;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import lombok.extern.slf4j.Slf4j;
import com.baomidou.mybatisplus.core.toolkit.StringUtils;
import org.lt.commushop.domain.entity.Product;
import org.lt.commushop.domain.vo.OrderProductVO;
import org.lt.commushop.service.IOrderProductsService;
import org.lt.commushop.service.IProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

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
                case "order_query":
                    return executeOrderQuery(params, userId);
                case "product_query":
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

            // 注意：这里不直接使用productIds进行查询，因为OrderProducts没有直接的in查询
            // 而是在后续处理结果时进行过滤
        }

        // 执行查询
        log.info("执行订单查询 - 用户ID: {}, 订单编号: {}, 商品名称: {}, 时间范围: {}", 
                userId, orderCode, productName, timeRange);
        IPage<OrderProductVO> page = orderProductsService.getOrderProductsPage(current, size, orderCode, userId);
        List<OrderProductVO> orderProducts = page.getRecords();

        // 如果指定了商品名称，过滤结果
        if (!productIds.isEmpty()) {
            orderProducts = orderProducts.stream()
                .filter(op -> op.getProduct() != null && productIds.contains(op.getProduct().getProductId()))
                .collect(java.util.stream.Collectors.toList());
        }

        // 格式化结果
        if (orderProducts.isEmpty()) {
            if (productName != null && !productName.isEmpty()) {
                return "您目前没有购买" + productName + "的订单。";
            } else if (orderCode != null && !orderCode.isEmpty()) {
                return "没有找到订单号为" + orderCode + "的订单。";
            } else {
                return "您目前没有符合条件的订单。";
            }
        }

        StringBuilder result = new StringBuilder();
        if (productName != null && !productName.isEmpty()) {
            result.append("您购买").append(productName).append("的订单有：\n\n");
        } else if (orderCode != null && !orderCode.isEmpty()) {
            result.append("订单号为").append(orderCode).append("的信息如下：\n\n");
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

            // 计算总价
            if (product != null && product.getGroupPrice() != null) {
                double totalMoney = product.getGroupPrice().doubleValue() * orderProduct.getAmount();
                result.append("\n   总价: ¥").append(String.format("%.2f", totalMoney));
            }

            // 添加创建时间（如果有）
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
        result.append("订单号为 ").append(orderCode).append(" 的总金额为: ¥").append(String.format("%.2f", totalAmount));
        
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

        log.info("执行商品查询 - 商品名称: {}, 查询类型: {}", productName, params.get("queryType"));

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

        String queryType = params.get("queryType");
        if (queryType == null) {
            queryType = "general"; // 默认为一般查询
            log.info("未指定查询类型，使用默认类型: general");
        }

        StringBuilder result = new StringBuilder();

        switch (queryType) {
            case "price":
                result.append("以下是").append(productName).append("相关商品的价格信息：\n\n");
                for (int i = 0; i < products.size(); i++) {
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
                for (int i = 0; i < products.size(); i++) {
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
            case "general":
            default:
                result.append("以下是").append(productName).append("相关商品的信息：\n\n");
                for (int i = 0; i < products.size(); i++) {
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
}
