package org.lt.commushop.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiParam;
import org.lt.commushop.common.Result;
import org.lt.commushop.domain.entity.GroupBuyingActivity;
import org.lt.commushop.domain.vo.ActivityWithProductsVO;
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

    @ApiOperation(value = "创建团购活动", notes = "管理员创建团购活动并关联多个商品")
    @PostMapping("/create")
    public Result<Boolean> createActivity(
            @ApiParam(value = "团购活动信息", required = true) @RequestBody GroupBuyingActivity activity,
            @ApiParam(value = "关联的商品ID列表", required = true) @RequestParam("productIds") List<Integer> productIds) {
        groupBuyingActivityService.createGroupBuyingActivity(activity, productIds);
        return Result.success(true, "创建团购活动成功");
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
    public Result<Page<GroupBuyingActivity>> getActivityPage(
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
}
