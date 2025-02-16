package org.lt.commushop.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiParam;
import org.lt.commushop.common.Result;
import org.lt.commushop.domain.Hander.ActivityWithProductsVO;
import org.lt.commushop.domain.entity.GroupBuyingActivity;
import org.lt.commushop.domain.vo.ActivityStatisticsVO;
import org.lt.commushop.dto.UpdateGroupBuyingActivityDTO;
import org.lt.commushop.service.IActivityStatisticsService;
import org.lt.commushop.service.IGroupBuyingActivityService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

/**
 * <p>
 * 团购活动前端控制器
 * </p>
 *
 * @author tao
 * @since 2025-01-21
 */
@Api(tags = "团购活动管理")
@RestController
@RequestMapping("/activity")
public class GroupBuyingActivityController {

    @Autowired
    private IGroupBuyingActivityService groupBuyingActivityService;

    @Autowired
    private IActivityStatisticsService activityStatisticsService;

    @ApiOperation(value = "创建团购活动", notes = "管理员创建团购活动并关联多个商品")
    @PostMapping("/create")
    public Result<Boolean> createActivity(
            @ApiParam(value = "团购活动信息", required = true) @RequestBody GroupBuyingActivity activity,
            @ApiParam(value = "关联的商品ID列表", required = true) @RequestParam("productIds") List<Integer> productIds) {
        boolean result = groupBuyingActivityService.createGroupBuyingActivity(activity, productIds);
        return Result.success(result, "创建团购活动成功");
    }

    @ApiOperation(value = "删除团购活动", notes = "管理员删除团购活动")
    @DeleteMapping("/{activityId}")
    public Result<Boolean> deleteActivity(
            @ApiParam(value = "活动ID", required = true) @PathVariable Integer activityId) {
        boolean result = groupBuyingActivityService.deleteActivity(activityId);
        return Result.success(result, "删除团购活动成功");
    }

    @ApiOperation(value = "团购活动分页查询", notes = "支持活动编码、名称、时间范围等多条件筛选，返回结果包含活动关联的商品信息")
    @GetMapping("/page")
    public Result<Page<ActivityWithProductsVO>> getActivityPage(
            @ApiParam(value = "当前页码", defaultValue = "1") @RequestParam(defaultValue = "1") Integer current,
            @ApiParam(value = "每页数量", defaultValue = "10") @RequestParam(defaultValue = "10") Integer size,
            @ApiParam(value = "活动编码") @RequestParam(required = false) String activityCode,
            @ApiParam(value = "活动名称（支持模糊查询）") @RequestParam(required = false) String activityName,
            @ApiParam(value = "活动开始时间", example = "2025-02-07 00:00:00")
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime startTime,
            @ApiParam(value = "活动结束时间", example = "2025-02-07 23:59:59")
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime endTime) {

        return Result.success(groupBuyingActivityService.getActivityPage(current, size,
                activityCode, activityName,
                startTime, endTime));
    }

    @ApiOperation(value = "更新团购活动", notes = "更新团购活动信息及其关联的商品")
    @PutMapping("/update")
    public Result<Boolean> updateActivity(
            @ApiParam(value = "更新团购活动请求", required = true) @RequestBody UpdateGroupBuyingActivityDTO updateDTO) {
        boolean result = groupBuyingActivityService.updateGroupBuyingActivity(updateDTO);
        return Result.success(result, "更新团购活动成功");
    }

    @ApiOperation(value = "删除活动关联商品", notes = "删除活动关联的指定商品")
    @DeleteMapping("/{activityCode}/product/{productId}")
    public Result<Boolean> removeActivityProduct(
            @ApiParam(value = "活动编码", required = true) @PathVariable String activityCode,
            @ApiParam(value = "商品ID", required = true) @PathVariable Integer productId) {
        boolean result = groupBuyingActivityService.removeActivityProduct(activityCode, productId);
        return Result.success(result, "删除活动商品成功");
    }

    @ApiOperation(value = "获取活动统计数据", notes = "获取活动总数、参与人数、转化率和每日统计数据")
    @GetMapping("/statistics")
    public Result<ActivityStatisticsVO> getActivityStatistics() {
        ActivityStatisticsVO statistics = activityStatisticsService.getActivityStatistics();
        return Result.success(statistics);
    }
}
