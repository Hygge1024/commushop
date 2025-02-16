package org.lt.commushop.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import org.lt.commushop.domain.Hander.ActivityWithProductsVO;
import org.lt.commushop.domain.entity.GroupBuyingActivity;
import org.lt.commushop.domain.entity.ActivityIncludeProduct;
import org.lt.commushop.domain.entity.Product;
import org.lt.commushop.dto.UpdateGroupBuyingActivityDTO;
import org.lt.commushop.mapper.GroupBuyingActivityMapper;
import org.lt.commushop.mapper.ActivityIncludeProductMapper;
import org.lt.commushop.service.IActivityIncludeProductService;
import org.lt.commushop.service.IGroupBuyingActivityService;
import org.lt.commushop.exception.BusinessException;
import org.lt.commushop.service.IProductService;
import org.lt.commushop.config.ActivityCodeGenerator;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

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

    @Autowired
    private IActivityIncludeProductService activityIncludeProductService;

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

        // 1.1 检查活动名称是否已存在（排除已删除的活动）
        LambdaQueryWrapper<GroupBuyingActivity> nameCheckWrapper = new LambdaQueryWrapper<>();
        nameCheckWrapper.eq(GroupBuyingActivity::getActivityName, activity.getActivityName())
                .ne(GroupBuyingActivity::getIsDeleted, 1);
        if (this.count(nameCheckWrapper) > 0) {
            throw new BusinessException("创建团购活动失败：活动名称已存在");
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
        // 设置删除标记的默认值为0（未删除）
        activity.setIsDeleted(0);

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

        // 3. 检查活动是否已被删除
        if (activity.getIsDeleted() != null && activity.getIsDeleted() == 1) {
            throw new BusinessException("活动已被删除");
        }

        // 4. 软删除活动
        activity.setIsDeleted(1);
        return this.updateById(activity);
    }

    @Override
    public Page<ActivityWithProductsVO> getActivityPage(Integer current, Integer size,
                                                        String activityCode, String activityName,
                                                        LocalDateTime startTime, LocalDateTime endTime) {
        // 1. 创建分页对象
        Page<GroupBuyingActivity> activityPage = new Page<>(current, size);

        // 2. 构建查询条件
        LambdaQueryWrapper<GroupBuyingActivity> queryWrapper = new LambdaQueryWrapper<>();

        // 2.0 过滤已删除的活动（isDeleted = 1）
        queryWrapper.ne(GroupBuyingActivity::getIsDeleted, 1);

        // 2.1 活动编码查询
        if (org.springframework.util.StringUtils.hasText(activityCode)) {// 如果activityCode不为空
            queryWrapper.eq(GroupBuyingActivity::getActivityCode, activityCode);
        }

        // 2.2 活动名称模糊查询
        if (org.springframework.util.StringUtils.hasText(activityName)) {// 如果activityName不为空
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

        // 3. 执行活动分页查询
        Page<GroupBuyingActivity> activityResult = this.page(activityPage, queryWrapper);

        // 4. 转换为VO对象，并查询关联的商品
        Page<ActivityWithProductsVO> voPage = new Page<>(current, size, activityResult.getTotal());
        List<ActivityWithProductsVO> voList = activityResult.getRecords().stream().map(activity -> {
            ActivityWithProductsVO vo = new ActivityWithProductsVO();
            vo.setActivity(activity);

            // 4.1 查询活动关联的商品ID
            LambdaQueryWrapper<ActivityIncludeProduct> productWrapper = new LambdaQueryWrapper<>();
            productWrapper.eq(ActivityIncludeProduct::getPActivityCode, activity.getActivityCode());
            List<ActivityIncludeProduct> relations = activityIncludeProductService.list(productWrapper);

            if (!relations.isEmpty()) {
                // 4.2 获取所有商品ID
                List<Integer> productIds = relations.stream()
                        .map(ActivityIncludeProduct::getProductId)
                        .collect(Collectors.toList());

                // 4.3 查询商品详情
                List<Product> products = productService.listByIds(productIds);
                vo.setProducts(products);
            } else {
                vo.setProducts(Collections.emptyList());
            }

            return vo;
        }).collect(Collectors.toList());

        voPage.setRecords(voList);
        return voPage;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean removeActivityProduct(String activityCode, Integer productId) {
        if (StringUtils.isEmpty(activityCode)) {
            throw new BusinessException("删除活动商品失败：活动编码不能为空");
        }
        if (productId == null) {
            throw new BusinessException("删除活动商品失败：商品ID不能为空");
        }

        // 1. 检查活动是否存在
        LambdaQueryWrapper<GroupBuyingActivity> activityWrapper = new LambdaQueryWrapper<>();
        activityWrapper.eq(GroupBuyingActivity::getActivityCode, activityCode)
                .ne(GroupBuyingActivity::getIsDeleted, 1);
        if (this.count(activityWrapper) == 0) {
            throw new BusinessException("删除活动商品失败：活动不存在或已删除");
        }

        // 2. 检查商品关联是否存在
        LambdaQueryWrapper<ActivityIncludeProduct> productWrapper = new LambdaQueryWrapper<>();
        productWrapper.eq(ActivityIncludeProduct::getPActivityCode, activityCode)
                .eq(ActivityIncludeProduct::getProductId, productId);
        if (activityIncludeProductMapper.selectCount(productWrapper) == 0) {
            throw new BusinessException("删除活动商品失败：该活动未关联此商品");
        }

        // 3. 删除商品关联
        return activityIncludeProductMapper.delete(productWrapper) > 0;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean updateGroupBuyingActivity(UpdateGroupBuyingActivityDTO updateDTO) {
        if (updateDTO == null) {
            throw new BusinessException("更新团购活动失败：更新信息不能为空");
        }

        // 1. 检查活动是否存在
        GroupBuyingActivity existingActivity = this.getById(updateDTO.getActivityId());
        if (existingActivity == null || existingActivity.getIsDeleted() == 1) {
            throw new BusinessException("更新团购活动失败：活动不存在");
        }

        // 2. 检查活动名称是否重复（排除自身）
        if (!StringUtils.isEmpty(updateDTO.getActivityName())
            && !updateDTO.getActivityName().equals(existingActivity.getActivityName())) {
            LambdaQueryWrapper<GroupBuyingActivity> nameCheckWrapper = new LambdaQueryWrapper<>();
            nameCheckWrapper.eq(GroupBuyingActivity::getActivityName, updateDTO.getActivityName())
                    .ne(GroupBuyingActivity::getActivityId, updateDTO.getActivityId())
                    .ne(GroupBuyingActivity::getIsDeleted, 1);
            if (this.count(nameCheckWrapper) > 0) {
                throw new BusinessException("更新团购活动失败：活动名称已存在");
            }
        }

        // 3. 检查新增商品是否都存在
        if (updateDTO.getProductIds() != null && !updateDTO.getProductIds().isEmpty()) {
            for (Integer productId : updateDTO.getProductIds()) {
                if (!productService.checkProductExists(productId)) {
                    throw new BusinessException("更新团购活动失败：商品不存在，商品ID: " + productId);
                }
            }

            // 4. 添加新的商品关联（如果商品关联已存在则跳过）
            for (Integer productId : updateDTO.getProductIds()) {
                LambdaQueryWrapper<ActivityIncludeProduct> existWrapper = new LambdaQueryWrapper<>();
                existWrapper.eq(ActivityIncludeProduct::getPActivityCode, existingActivity.getActivityCode())
                        .eq(ActivityIncludeProduct::getProductId, productId);
                if (activityIncludeProductMapper.selectCount(existWrapper) == 0) {
                    ActivityIncludeProduct aip = new ActivityIncludeProduct();
                    aip.setPActivityCode(existingActivity.getActivityCode());
                    aip.setProductId(productId);
                    activityIncludeProductMapper.insert(aip);
                }
            }
        }

        // 5. 更新活动基本信息
        GroupBuyingActivity activity = new GroupBuyingActivity();
        activity.setActivityId(updateDTO.getActivityId());
        activity.setActivityName(updateDTO.getActivityName());
        activity.setActivityStartTime(updateDTO.getActivityStartTime());
        activity.setActivityEndTime(updateDTO.getActivityEndTime());
        activity.setMinGroupSize(updateDTO.getMinGroupSize());
        activity.setMaxGroupSize(updateDTO.getMaxGroupSize());

        boolean updated = this.updateById(activity);
        if (!updated) {
            throw new BusinessException("更新团购活动失败：更新活动基本信息失败");
        }

        return true;
    }
}
