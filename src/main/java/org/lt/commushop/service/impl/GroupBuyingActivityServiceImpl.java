package org.lt.commushop.service.impl;

import org.lt.commushop.domain.entity.GroupBuyingActivity;
import org.lt.commushop.domain.entity.ActivityIncludeProduct;
import org.lt.commushop.mapper.GroupBuyingActivityMapper;
import org.lt.commushop.mapper.ActivityIncludeProductMapper;
import org.lt.commushop.service.IGroupBuyingActivityService;
import org.lt.commushop.exception.BusinessException;
import org.lt.commushop.service.IProductService;
import org.lt.commushop.config.ActivityCodeGenerator;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;
import java.util.stream.Collectors;
import java.time.LocalDateTime;

/**
 * <p>
 *  服务实现类
 * </p>
 *
 * @author tao
 * @since 2025-01-21
 */
@Service
public class GroupBuyingActivityServiceImpl extends ServiceImpl<GroupBuyingActivityMapper, GroupBuyingActivity> implements IGroupBuyingActivityService {

    @Autowired
    private ActivityIncludeProductMapper activityIncludeProductMapper;

    @Autowired
    private IProductService productService;

    @Autowired
    private ActivityCodeGenerator activityCodeGenerator;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean createGroupBuyingActivity(GroupBuyingActivity activity, List<Integer> productIds) {
        // 1. 参数校验
        if (activity == null) {
            throw new BusinessException("创建团购活动失败：活动信息不能为空");
        }
        if (productIds == null || productIds.isEmpty()) {
            throw new BusinessException("创建团购活动失败：必须选择至少一个商品");
        }

        // 2. 检查商品是否都存在
        for (Integer productId : productIds) {
            if (!productService.checkProductExists(productId)) {
                throw new BusinessException("创建团购活动失败：商品不存在，商品ID: " + productId);
            }
        }

        // 3. 生成唯一活动编码并验证
        String activityCode;
        int maxRetries = 10;
        int retryCount = 0;

        do {
            if (retryCount >= maxRetries) {
                throw new BusinessException("创建团购活动失败：无法生成唯一的活动编码，请稍后重试");
            }

            activityCode = activityCodeGenerator.generateActivityCode();

            // 检查编码是否已存在
            LambdaQueryWrapper<GroupBuyingActivity> queryWrapper = new LambdaQueryWrapper<>();
            queryWrapper.eq(GroupBuyingActivity::getActivityCode, activityCode);

            if (this.count(queryWrapper) == 0) {
                // 编码不存在，可以使用
                break;
            }

            retryCount++;
        } while (true);

        activity.setActivityCode(activityCode);

        // 4. 保存团购活动信息
        if (!this.save(activity)) {
            throw new BusinessException("创建团购活动失败：保存活动信息失败");
        }

        // 5. 保存活动包含的商品信息
        try {
            List<ActivityIncludeProduct> activityProducts = productIds.stream()
                    .map(productId -> {
                        ActivityIncludeProduct aip = new ActivityIncludeProduct();
                        aip.setPActivityCode(activity.getActivityCode());
                        aip.setProductId(productId);
                        return aip;
                    })
                    .collect(Collectors.toList());

            for (ActivityIncludeProduct activityProduct : activityProducts) {
                if (activityIncludeProductMapper.insert(activityProduct) <= 0) {
                    throw new BusinessException("创建团购活动失败：保存活动商品关联信息失败");
                }
            }
        } catch (Exception e) {
            throw new BusinessException("创建团购活动失败：" + e.getMessage());
        }

        return true;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean deleteActivity(Integer activityId) {
        if (activityId == null) {
            throw new BusinessException("活动ID不能为空");
        }

        // 1. 检查活动是否存在
        GroupBuyingActivity activity = this.getById(activityId);
        if (activity == null) {
            throw new BusinessException("活动不存在");
        }

        // 2. 检查活动是否可以删除（比如已经开始的活动不能删除）
        if (activity.getActivityStartTime().isBefore(LocalDateTime.now())) {
            throw new BusinessException("活动已开始，无法删除");
        }

        // 3. 删除活动相关的商品关联
        LambdaQueryWrapper<ActivityIncludeProduct> productWrapper = new LambdaQueryWrapper<>();
        productWrapper.eq(ActivityIncludeProduct::getPActivityCode, activity.getActivityCode());
        activityIncludeProductMapper.delete(productWrapper);

        // 4. 删除活动
        return this.removeById(activityId);
    }

    @Override
    public Page<GroupBuyingActivity> getActivityPage(Integer current, Integer size,
                                                    String activityCode, String activityName,
                                                    LocalDateTime startTime, LocalDateTime endTime) {
        // 1. 创建分页对象
        Page<GroupBuyingActivity> page = new Page<>(current, size);

        // 2. 构建查询条件
        LambdaQueryWrapper<GroupBuyingActivity> queryWrapper = new LambdaQueryWrapper<>();

        // 2.1 活动编码查询
        if (activityCode != null && !activityCode.trim().isEmpty()) {
            queryWrapper.eq(GroupBuyingActivity::getActivityCode, activityCode);
        }

        // 2.2 活动名称模糊查询
        if (activityName != null && !activityName.trim().isEmpty()) {
            queryWrapper.like(GroupBuyingActivity::getActivityName, activityName);
        }

        // 2.3 活动时间范围查询
        if (startTime != null) {
            queryWrapper.ge(GroupBuyingActivity::getActivityStartTime, startTime);
        }
        if (endTime != null) {
            queryWrapper.le(GroupBuyingActivity::getActivityEndTime, endTime);
        }

        // 2.4 按活动开始时间倒序排序
        queryWrapper.orderByDesc(GroupBuyingActivity::getActivityStartTime);

        // 3. 执行分页查询
        return this.page(page, queryWrapper);
    }
}
