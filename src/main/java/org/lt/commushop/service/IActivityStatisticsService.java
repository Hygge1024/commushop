package org.lt.commushop.service;

import org.lt.commushop.domain.vo.ActivityStatisticsVO;

/**
 * 活动统计服务接口
 */
public interface IActivityStatisticsService {
    /**
     * 获取活动统计数据
     * @return 活动统计数据
     */
    ActivityStatisticsVO getActivityStatistics();
}
