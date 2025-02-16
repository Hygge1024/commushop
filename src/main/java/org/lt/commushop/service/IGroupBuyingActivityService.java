package org.lt.commushop.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.IService;
import org.lt.commushop.domain.entity.GroupBuyingActivity;
import org.lt.commushop.domain.Hander.ActivityWithProductsVO;
import org.lt.commushop.dto.UpdateGroupBuyingActivityDTO;

import java.time.LocalDateTime;
import java.util.List;

/**
 * <p>
 * 团购活动服务接口
 * </p>
 *
 * @author tao
 * @since 2025-01-21
 */
public interface IGroupBuyingActivityService extends IService<GroupBuyingActivity> {

    /**
     * 创建团购活动
     * @param activity 团购活动信息
     * @param productIds 包含的商品ID列表
     * @return 是否创建成功
     */
    boolean createGroupBuyingActivity(GroupBuyingActivity activity, List<Integer> productIds);

    /**
     * 删除团购活动
     * @param activityId 活动ID
     * @return 是否删除成功
     */
    boolean deleteActivity(Integer activityId);

    /**
     * 分页查询团购活动（包含活动关联的商品信息）
     *
     * @param current 当前页码
     * @param size 每页数量
     * @param activityCode 活动编码
     * @param activityName 活动名称（支持模糊查询）
     * @param startTime 活动开始时间
     * @param endTime 活动结束时间
     * @return 分页结果，包含活动信息和关联的商品列表
     */
    Page<ActivityWithProductsVO> getActivityPage(Integer current, Integer size,
                                             String activityCode, String activityName,
                                             LocalDateTime startTime, LocalDateTime endTime);

    /**
     * 更新团购活动及其关联商品
     * @param updateDTO 更新请求DTO
     * @return 更新是否成功
     */
    boolean updateGroupBuyingActivity(UpdateGroupBuyingActivityDTO updateDTO);

    /**
     * 删除活动关联的商品
     * @param activityCode 活动编码
     * @param productId 商品ID
     * @return 删除是否成功
     */
    boolean removeActivityProduct(String activityCode, Integer productId);
}
