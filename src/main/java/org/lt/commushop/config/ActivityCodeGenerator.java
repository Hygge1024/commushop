package org.lt.commushop.config;

import org.springframework.stereotype.Component;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.concurrent.ThreadLocalRandom;

@Component
public class ActivityCodeGenerator {

    private static final int RANDOM_NUMBER_LENGTH = 6;
    private static final int MIN_RANDOM = 100000; // 确保6位数的最小值
    private static final int MAX_RANDOM = 999999; // 6位数的最大值

    /**
     * 生成活动编码
     * 格式：ACT + 年月日时分秒 + 6位随机数
     * 示例：ACT20250206215959123456
     *
     * @return 活动编码
     */
    public String generateActivityCode() {
        // 获取当前时间（精确到秒）
        LocalDateTime now = LocalDateTime.now();
        String timeStr = now.format(DateTimeFormatter.ofPattern("yyMMddHHmmss"));
        
        // 生成6位随机数（确保是6位）
        int randomNum = ThreadLocalRandom.current().nextInt(MIN_RANDOM, MAX_RANDOM + 1);
        
        // 组合编码：ACT + 时间 + 随机数
        return String.format("ACT%s%06d", timeStr, randomNum);
    }
}
