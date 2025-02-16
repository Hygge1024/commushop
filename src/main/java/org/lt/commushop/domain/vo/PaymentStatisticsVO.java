package org.lt.commushop.domain.vo;

import lombok.Data;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
public class PaymentStatisticsVO {
    // 今日支付总额
    private BigDecimal TotalAmount;
    
    // 今日支付笔数
    private Integer PaymentCount;
    
    // 平均支付金额
    private BigDecimal averageAmount;
    
    // 支付转化率
    private BigDecimal conversionRate;
    
    // 支付金额趋势 - 按日期分组的支付金额
    private List<DailyPayment> paymentTrend;
    
    // 支付方式分布
    private Map<String, Integer> paymentMethodDistribution;
    
    @Data
    public static class DailyPayment {
        private String date;
        private BigDecimal amount;
    }
}
