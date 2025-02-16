package org.lt.commushop.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import org.lt.commushop.domain.entity.GroupBuyingActivity;
import org.lt.commushop.domain.entity.GroupBuyingOrder;
import org.lt.commushop.domain.vo.ActivityStatisticsVO;
import org.lt.commushop.mapper.GroupBuyingActivityMapper;
import org.lt.commushop.mapper.GroupBuyingOrderMapper;
import org.lt.commushop.service.IActivityStatisticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ActivityStatisticsServiceImpl implements IActivityStatisticsService {

    @Autowired
    private GroupBuyingActivityMapper activityMapper;

    @Autowired
    private GroupBuyingOrderMapper orderMapper;

    @Override
    public ActivityStatisticsVO getActivityStatistics() {
        ActivityStatisticsVO statistics = new ActivityStatisticsVO();

        // 1. 获取总活动数（排除已删除的活动）
        LambdaQueryWrapper<GroupBuyingActivity> activityWrapper = new LambdaQueryWrapper<>();
        activityWrapper.ne(GroupBuyingActivity::getIsDeleted, 1);
        Long totalActivities = activityMapper.selectCount(activityWrapper);
        statistics.setTotalActivities(totalActivities);

        // 2. 获取总参与人数（通过订单统计）
        LambdaQueryWrapper<GroupBuyingOrder> orderWrapper = new LambdaQueryWrapper<>();
        orderWrapper.ne(GroupBuyingOrder::getIsDeleted, 1);
        Long totalParticipants = orderMapper.selectCount(orderWrapper);
        statistics.setTotalParticipants(totalParticipants);

        // 3. 计算转化率
        if (totalActivities > 0) {
            double conversionRate = Math.min((double) totalParticipants / totalActivities * 100, 100.0);
            statistics.setConversionRate(String.format("%.1f%%", conversionRate));
        } else {
            statistics.setConversionRate("0.0%");
        }

        // 4. 获取每日统计数据
        List<ActivityStatisticsVO.DailyStatistics> dailyStats = orderMapper.selectDailyStatistics();
        statistics.setDailyStatistics(dailyStats);

        return statistics;
    }
}
