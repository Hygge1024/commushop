package org.lt.commushop.service.UtilsService;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import org.checkerframework.checker.units.qual.C;
import org.lt.commushop.domain.entity.*;
import org.lt.commushop.domain.vo.*;
import org.lt.commushop.mapper.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.text.SimpleDateFormat;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class IndexShowService {
    // 用于转换周几的数字
    private static final String[] CHINESE_NUMBERS = {"一", "二", "三", "四", "五", "六", "日"};
    @Autowired
    private ProductMapper productMapper;
    @Autowired
    private CategoryMapper categoryMapper;
    @Autowired
    private EvaluationMapper evaluationMapper;
    @Autowired
    private PaymentRecordMapper paymentRecordMapper;
    @Autowired
    private OrderMapper orderMapper;
    @Autowired
    private OrderProductsMapper orderProductsMapper;
    @Autowired
    private ProductCategoryRelationshipMapper productCategoryRelationshipMapper;

    //首页综合数据展示
    public HomePageInfoVO getHomePage(){

        HomePageInfoVO homePageInfoVO = new HomePageInfoVO();
        //1.线上商品总数
        LambdaQueryWrapper<Product> productLambdaQueryWrapper = new LambdaQueryWrapper<>();
        productLambdaQueryWrapper.eq(Product::getIsDeleted,0);
        Integer ProductCounts = productMapper.selectList(productLambdaQueryWrapper).size();
        homePageInfoVO.setOnlineProductTotal(ProductCounts);
        //2.线上商品类数量
        LambdaQueryWrapper<Category> categoryLambdaQueryWrapper = new LambdaQueryWrapper<>();
        categoryLambdaQueryWrapper.eq(Category::getIsDeleted,0);
        Integer CategoryCounts = categoryMapper.selectList(categoryLambdaQueryWrapper).size();
        homePageInfoVO.setOnlineProductCategoryCount(CategoryCounts);
        //3.日新增评论
        LambdaQueryWrapper<Evaluation> evaluationLambdaQueryWrapper = new LambdaQueryWrapper<>();
        // 获取今天的起始时间戳
        Calendar calendar = Calendar.getInstance();
        calendar.set(Calendar.HOUR_OF_DAY, 0);
        calendar.set(Calendar.MINUTE, 0);
        calendar.set(Calendar.SECOND, 0);
        Date todayStart = calendar.getTime();
        // 获取今天的结束时间戳
        calendar.set(Calendar.HOUR_OF_DAY, 23);
        calendar.set(Calendar.MINUTE, 59);
        calendar.set(Calendar.SECOND, 59);
        Date todayEnd = calendar.getTime();
        // 获取昨天的时间范围
        calendar.add(Calendar.DAY_OF_MONTH, -1);
        calendar.set(Calendar.HOUR_OF_DAY, 0);
        calendar.set(Calendar.MINUTE, 0);
        calendar.set(Calendar.SECOND, 0);
        Date yesterdayStart = calendar.getTime();

        calendar.set(Calendar.HOUR_OF_DAY, 23);
        calendar.set(Calendar.MINUTE, 59);
        calendar.set(Calendar.SECOND, 59);
        Date yesterdayEnd = calendar.getTime();

        //统计今日新增评论数
        evaluationLambdaQueryWrapper.between(Evaluation::getEvaluationTime,todayStart,todayEnd);
        Long todayComments = evaluationMapper.selectCount(evaluationLambdaQueryWrapper);
//        System.out.println("今日新增评论"+todayComments);

        // 统计昨日新增评论数
        LambdaQueryWrapper<Evaluation> yesterdayWrapper = new LambdaQueryWrapper<>();
        yesterdayWrapper.between(Evaluation::getEvaluationTime, yesterdayStart, yesterdayEnd);
        Long yesterdayComments = evaluationMapper.selectCount(yesterdayWrapper);
//        System.out.println("昨日新增评论"+yesterdayComments);

        //4.计算增长百分比
        double growthRate = 0.0;
        if (yesterdayComments > 0) {
            growthRate = ((double) (todayComments - yesterdayComments) / yesterdayComments) * 100;
        }
        homePageInfoVO.setDailyNewComments(Math.toIntExact(todayComments));
        homePageInfoVO.setCommentGrowthRate(growthRate);

        //5.近七日的成交量数据
        List<TransactionStatisticsVO> transactionStatisticsVOList = new ArrayList<>();
        Calendar calendar1 = Calendar.getInstance();
        //获取仅七天的数据
        for(int i =  6; i >= 0; i--){
            TransactionStatisticsVO vo = new TransactionStatisticsVO();
            //设置日期范围
            calendar.set(Calendar.HOUR_OF_DAY, 0);
            calendar.set(Calendar.MINUTE, 0);
            calendar.set(Calendar.SECOND, 0);
            calendar.add(Calendar.DAY_OF_MONTH, -i);
            Date dayStart = calendar.getTime();


            calendar.set(Calendar.HOUR_OF_DAY, 23);
            calendar.set(Calendar.MINUTE, 59);
            calendar.set(Calendar.SECOND, 59);
            Date dayEnd = calendar.getTime();

            // 查询该日期的订单数量
            LambdaQueryWrapper<Order> orderWrapper = new LambdaQueryWrapper<>();
            orderWrapper.between(Order::getCreateTime, dayStart, dayEnd)
                    .ge(Order::getOrderStatus, 5); // 5表示已完成的订单
            Integer count = Math.toIntExact(orderMapper.selectCount(orderWrapper));
            // 格式化日期（MM-dd格式）
            SimpleDateFormat sdf = new SimpleDateFormat("MM-dd");
            String dateStr = sdf.format(dayStart);
            // 设置VO数据
            vo.setDate(dateStr);
            vo.setTransactionVolume(count);

            transactionStatisticsVOList.add(vo);
            // 重置日历到当前时间
            calendar = Calendar.getInstance();
        }
        // 设置到首页数据中
        homePageInfoVO.setTransactionStatisticsVOList(transactionStatisticsVOList);

        // 6.热门商品列表
        List<PopularProductVO> popularProductVOList = new ArrayList<>();

        //统计每个商品的销售量
        Map<Integer, Integer> productsSalesMap = new HashMap<>();
        List<OrderProducts> orderProductsList = orderProductsMapper.selectList(null);
        //遍历所有订单商品，累加相同的ProductID的amount
        for(OrderProducts orderProducts : orderProductsList){
            Integer productId = orderProducts.getProductId();
            Integer amount = orderProducts.getAmount();
            //如果Map中已存在productId，累加amount，否则新增记录
            productsSalesMap.merge(productId,amount,Integer::sum);
        }
//        System.out.println("商品对应的销售量"+productsSalesMap);
        //将Map转换为List并按销量排序
        List<Map.Entry<Integer,Integer>> sortedProducts = new ArrayList<>(productsSalesMap.entrySet());
        sortedProducts.sort((e1, e2) -> e2.getValue().compareTo(e1.getValue()));

        //获取今天和昨天的时间范围，用于计算增长率
        Calendar calendar3 = Calendar.getInstance();
        calendar3.set(Calendar.HOUR_OF_DAY, 0);
        calendar3.set(Calendar.MINUTE, 0);
        calendar3.set(Calendar.SECOND, 0);
        Date todayStart3 = calendar3.getTime();

        calendar3.set(Calendar.HOUR_OF_DAY, 23);
        calendar3.set(Calendar.MINUTE, 59);
        calendar3.set(Calendar.SECOND, 59);
        Date todayEnd3 = calendar3.getTime();

        calendar3.add(Calendar.DAY_OF_MONTH, -1);
        calendar3.set(Calendar.HOUR_OF_DAY, 0);
        calendar3.set(Calendar.MINUTE, 0);
        calendar3.set(Calendar.SECOND, 0);
        Date yesterdayStart3 = calendar3.getTime();

        calendar3.set(Calendar.HOUR_OF_DAY, 23);
        calendar3.set(Calendar.MINUTE, 59);
        calendar3.set(Calendar.SECOND, 59);
        Date yesterdayEnd3 = calendar3.getTime();

//        System.out.println(todayStart3);
//        System.out.println(todayEnd3);

        //获取今天和昨天的订单
        List<Order> todayOrder = orderMapper.selectList(new LambdaQueryWrapper<Order>()
                .eq(Order::getIsDeleted,0)
                .between(Order::getCreateTime,todayStart3,todayEnd3));
        List<Order> yesterdayOrders = orderMapper.selectList(new LambdaQueryWrapper<Order>()
                .eq(Order::getIsDeleted,0)
                .between(Order::getCreateTime,yesterdayStart3,yesterdayEnd3));

        //统计今天和昨天的销售量
        Map<Integer,Integer> todaySalesMap = new HashMap<>();
        Map<Integer,Integer> yesterdaySalesMap = new HashMap<>();
        for(Order order : todayOrder){
            List<OrderProducts> orderProducts = orderProductsMapper.selectList(
                    new LambdaQueryWrapper<OrderProducts>()
                            .eq(OrderProducts::getOrderCode,order.getOrderCode())
            );
            for(OrderProducts products : orderProducts){
                todaySalesMap.merge(products.getProductId(),products.getAmount(),Integer::sum);
            }
        }
        // 获取昨天订单的商品销量
        for (Order order : yesterdayOrders) {
            List<OrderProducts> orderProducts = orderProductsMapper.selectList(
                    new LambdaQueryWrapper<OrderProducts>()
                            .eq(OrderProducts::getOrderCode, order.getOrderCode())
            );
            for (OrderProducts product : orderProducts) {
                yesterdaySalesMap.merge(product.getProductId(), product.getAmount(), Integer::sum);
            }
        }

        //获取销售量最高的前10个商品的详情
        int limit = Math.min(10,sortedProducts.size());
        for(int i = 0; i < limit; i++){
            Map.Entry<Integer, Integer> entry = sortedProducts.get(i);
            Integer productId = entry.getKey();
            Integer salesVolume = entry.getValue();
            //查询商品详细信息
            Product product = productMapper.selectById(productId);
            if(product != null && product.getIsDeleted() == 0){
                PopularProductVO vo = new PopularProductVO();
                vo.setRank(i + 1); // 设置排名
                vo.setContentTitle(product.getProductName());
                vo.setSellCount(salesVolume);
                //计算日增长效率
                Integer todaySales = todaySalesMap.getOrDefault(productId,0);
                Integer yesterdaySales = yesterdaySalesMap.getOrDefault(productId, 0);
                double growOrderthRate = 0.0;
                if(yesterdaySales > 0){
                    growOrderthRate = ((double) (todaySales - yesterdaySales) / yesterdaySales) * 100;
                }
                vo.setDailyGrowthRate(Double.parseDouble(String.format("%.2f",growOrderthRate)));
                popularProductVOList.add(vo);
            }
        }
        homePageInfoVO.setPopularProductVOList(popularProductVOList);

        //7.类容类比占比
        List<CategoryRatioVO> categoryRatioVOList = new ArrayList<>();
        //查询有效类别
        List<Category> categoryList = categoryMapper.selectList(
                new LambdaQueryWrapper<Category>()
                        .eq(Category::getIsDeleted, 0)
        );
//        统计每个类别下商品的数据
        Map<Integer,Integer> categoryProductCount = new HashMap<>();
        //商品的数量
        int totalProducts = 0;

        //获取所有商品-类别关系
        List<ProductCategoryRelationship> relationshipList = productCategoryRelationshipMapper.selectList(
                new LambdaQueryWrapper<ProductCategoryRelationship>()
        );
        //统计每个类别的数量
        for(ProductCategoryRelationship relationship : relationshipList){
            Integer categoryId = relationship.getCategoryId();
            //确认商品未被删除
            Product product = productMapper.selectById(relationship.getProductId());
            if(product != null && product.getIsDeleted() == 0){
                categoryProductCount.merge(categoryId,1,Integer::sum);//累加该类所对应的商品
                totalProducts ++;
            }
        }
        //计算每个类别的占比并创建VO对象
        for(Category category : categoryList){
            Integer categoryId = category.getCategoryId();
            Integer productCount = categoryProductCount.getOrDefault(categoryId,0);

            if(productCount > 0){//只添加有商品的类别
                CategoryRatioVO cvo = new CategoryRatioVO();
                cvo.setCategoryName(category.getCategoryName());
                double ratio = totalProducts > 0 ? Double.parseDouble(String.format("%.2f", (productCount * 100.0) / totalProducts)) : 0.0;
                cvo.setCategoryRatio(ratio);
                categoryRatioVOList.add(cvo);
            }
        }
        //按占比降序排序
        categoryRatioVOList.sort((v1,v2) -> v2.getCategoryRatio().compareTo(v1.getCategoryRatio()));

        //设置首页数据中
        homePageInfoVO.setCategoryRatioVOList(categoryRatioVOList);
        return homePageInfoVO;
    }

    //订单数据展示
    public OrderStatisticsVO getOrderStatistics(){
        OrderStatisticsVO statisticsVO = new OrderStatisticsVO();
        //1.查询所有未删除的订单
        LambdaQueryWrapper<Order> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Order::getIsDeleted,0);
        List<Order> orders = orderMapper.selectList(wrapper);

        //2.计算总订单数量
        statisticsVO.setTotalOrders((long) orders.size());

        //3.计算订单总金额
        BigDecimal totalAmount = orders.stream()
                .map(Order::getTotalMoney)
                .filter(Objects::nonNull)
                .map(BigDecimal::valueOf)  // 将 double 转换为 BigDecimal
                .reduce(BigDecimal.ZERO,BigDecimal::add);
        statisticsVO.setTotalAmount(totalAmount);

        //4.计算下单用户数
        long uniqueUsers = orders.stream()
                .map(Order::getUserId)
                .distinct()
                .count();
        statisticsVO.setUniqueUsers(uniqueUsers);

        //5.计算订单趋势（按周几分组）
        Map<String, List<Order>> dailyOrders = orders.stream()
                .collect(Collectors.groupingBy(order -> {
                    int dayOfWeek = order.getCreateTime().getDayOfWeek().getValue(); // 1-7
                    return "周" + CHINESE_NUMBERS[dayOfWeek - 1];
                }));
        // 计算每日订单数和金额
        Map<String, Long> dailyOrderCounts = new LinkedHashMap<>();
        Map<String, BigDecimal> dailyOrderAmounts = new LinkedHashMap<>();

        // 确保所有天都有数据
        for (int i = 0; i < 7; i++) {
            String day = "周" + CHINESE_NUMBERS[i];
            List<Order> dayOrders = dailyOrders.getOrDefault(day, Collections.emptyList());

            // 订单数
            dailyOrderCounts.put(day, (long) dayOrders.size());

            // 订单金额
            BigDecimal dayAmount = dayOrders.stream()
                    .map(Order::getTotalMoney)
                    .filter(Objects::nonNull)
                    .map(BigDecimal::valueOf)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            dailyOrderAmounts.put(day, dayAmount);
        }

        statisticsVO.setDailyOrderCounts(dailyOrderCounts);
        statisticsVO.setDailyOrderAmounts(dailyOrderAmounts);
        //6.计算订单状态分布
        Map<Integer, Long> statusCounts = orders.stream()
                .collect(Collectors.groupingBy(
                        Order::getOrderStatus,
                        Collectors.counting()
                ));

        // 确保所有状态都有数据
        Map<Integer, Long> allStatusCounts = new HashMap<>();
        for (int status = 1; status <= 5; status++) {
            allStatusCounts.put(status, statusCounts.getOrDefault(status, 0L));
        }

        statisticsVO.setOrderStatusCounts(allStatusCounts);
        return statisticsVO;
    }


    //支付数据展示
    public PaymentStatisticsVO getPaymentStatistics(LocalDateTime startTime, LocalDateTime endTime) {
        PaymentStatisticsVO statistics = new PaymentStatisticsVO();

        // 1. 构建查询条件
        LambdaQueryWrapper<PaymentRecord> wrapper = new LambdaQueryWrapper<>();
        if (startTime != null) {
            wrapper.ge(PaymentRecord::getPaymentTime, startTime);
        }
        if (endTime != null) {
            wrapper.le(PaymentRecord::getPaymentTime, endTime);
        }
        wrapper.orderByAsc(PaymentRecord::getPaymentTime);
        List<PaymentRecord> payments = paymentRecordMapper.selectList(wrapper);

        // 2. 计算总支付金额
        BigDecimal totalAmount = payments.stream()
                .map(PaymentRecord::getPaymentAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        statistics.setTotalAmount(totalAmount);

        // 3. 设置支付笔数
        statistics.setPaymentCount(payments.size());

        // 4. 计算平均支付金额
        BigDecimal averageAmount = payments.isEmpty() ? BigDecimal.ZERO :
                totalAmount.divide(new BigDecimal(payments.size()), 2, RoundingMode.HALF_UP);
        statistics.setAverageAmount(averageAmount);

        // 5. 计算支付转化率
        // 获取时间范围内的所有订单
        LambdaQueryWrapper<Order> orderWrapper = new LambdaQueryWrapper<>();
        if (startTime != null) {
            orderWrapper.ge(Order::getCreateTime, startTime);
        }
        if (endTime != null) {
            orderWrapper.le(Order::getCreateTime, endTime);
        }
        orderWrapper.eq(Order::getIsDeleted, 0);
        long totalOrders = orderMapper.selectCount(orderWrapper);

        // 计算支付成功的订单数（支付记录数）
        long paidOrders = payments.size();

        // 计算转化率，保留2位小数
        BigDecimal conversionRate = totalOrders == 0 ? BigDecimal.ZERO :
                new BigDecimal(paidOrders)
                        .multiply(new BigDecimal("100"))
                        .divide(new BigDecimal(totalOrders), 2, RoundingMode.HALF_UP);
        statistics.setConversionRate(conversionRate);

        // 6. 按日期分组计算支付金额趋势（取最近5天数据）
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        Map<String, BigDecimal> dailyAmounts = payments.stream()
                .collect(Collectors.groupingBy(
                        payment -> payment.getPaymentTime().format(formatter),
                        Collectors.mapping(
                                PaymentRecord::getPaymentAmount,
                                Collectors.reducing(BigDecimal.ZERO, BigDecimal::add)
                        )
                ));

        // 转换为列表格式并只取最近5天数据
        List<PaymentStatisticsVO.DailyPayment> trend = dailyAmounts.entrySet().stream()
                .map(entry -> {
                    PaymentStatisticsVO.DailyPayment daily = new PaymentStatisticsVO.DailyPayment();
                    daily.setDate(entry.getKey());
                    daily.setAmount(entry.getValue());
                    return daily;
                })
                .sorted(Comparator.comparing(PaymentStatisticsVO.DailyPayment::getDate).reversed()) // 按日期倒序
                .limit(5) // 只取5条
                .sorted(Comparator.comparing(PaymentStatisticsVO.DailyPayment::getDate)) // 再按日期正序
                .collect(Collectors.toList());
        statistics.setPaymentTrend(trend);

        // 7. 计算支付方式分布
        Map<String, Integer> methodDistribution = payments.stream()
                .collect(Collectors.groupingBy(
                        PaymentRecord::getPaymentMethod,
                        Collectors.collectingAndThen(Collectors.counting(), Long::intValue)
                ));
        statistics.setPaymentMethodDistribution(methodDistribution);


        return statistics;
    }
}
