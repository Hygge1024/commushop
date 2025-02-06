package org.lt.commushop.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiParam;
import org.lt.commushop.common.Result;
import org.lt.commushop.domain.Hander.CollectionVO;
import org.lt.commushop.domain.entity.Collection;
import org.lt.commushop.service.ICollectionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@Api(tags = "商品收藏模管理模块", description = "收藏相关API")
@RestController
@RequestMapping("/collection")   // 前缀
public class CollectionController {
    @Autowired
    private ICollectionService collectionService;

    // 添加收藏
    @ApiOperation(value = "添加收藏", notes = "用户收藏指定商品")
    @PostMapping("/add")
    public Result<Collection> addCollection(@ApiParam(value = "收藏请求参数", required = true) @RequestBody Collection collectionRequest) {
        return Result.success(collectionService.addCollection(collectionRequest));
    }

    // 取消收藏
    @ApiOperation(value = "取消收藏", notes = "根据收藏ID取消收藏")
    @DeleteMapping("/cancel/{collectionId}")
    public Result<Boolean> removeCollection(
            @ApiParam(value = "收藏ID", required = true)
            @PathVariable Integer collectionId) {
        return Result.success(collectionService.deleteCollection(collectionId));
    }

    // 用户收藏列表
    @ApiOperation(value = "用户收藏列表", notes = "分页查询用户的收藏记录")
    @GetMapping("/user/page")
    public Result<IPage<CollectionVO>> getUserCollections(
            @ApiParam(value = "用户ID", required = true) @RequestParam Integer userId,
            @ApiParam(value = "当前页码", defaultValue = "1") @RequestParam(defaultValue = "1") Integer current,
            @ApiParam(value = "每页数量", defaultValue = "10") @RequestParam(defaultValue = "10") Integer size) {
        return Result.success(collectionService.getUserCollections(userId, current, size));
    }

    // 检查收藏状态
    @ApiOperation(value = "检查收藏状态", notes = "检查用户是否收藏了指定商品")
    @GetMapping("/check")
    public Result<Boolean> checkCollectionStatus(
            @ApiParam(value = "用户ID", required = true) @RequestParam Integer userId,
            @ApiParam(value = "商品ID", required = true) @RequestParam Integer productId) {
        return Result.success(collectionService.checkCollectionStatus(userId, productId));
    }
}
