package org.lt.commushop.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiParam;
import org.lt.commushop.common.Result;
import org.lt.commushop.domain.entity.FixedDeliveryAddress;
import org.lt.commushop.service.IFixedDeliveryAddressService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@Api("tags = 固定提货地址管理")
@RestController
@RequestMapping("/fixed")
public class FixedDeliveryAddressController {
    @Autowired
    private IFixedDeliveryAddressService fixedDeliveryAddressService;

    @ApiOperation(value = "查询固定提货地址", notes = "综合查询固定地址项")
    @GetMapping("/page")
    public Result<IPage<FixedDeliveryAddress>> getFixedPage(
            @ApiParam(value = "当前页码", defaultValue = "1" ) @RequestParam(defaultValue = "1") Integer current,
            @ApiParam(value = "每页数量", defaultValue = "10") @RequestParam(defaultValue = "10") Integer size,
            @ApiParam(value = "地址名称")  @RequestParam(required = false) String Address)
    {
        return Result.success(fixedDeliveryAddressService.getPageFixed(current,size,Address));
    }
    @ApiOperation(value = "新增固定提货地址", notes = "由管理员新增提货地址")
    @PostMapping("/add")
    public Result<FixedDeliveryAddress> addFixed(
           @ApiParam(value = "新增提货地址") @RequestBody FixedDeliveryAddress fixedDeliveryAddress)
    {
        return Result.success(fixedDeliveryAddressService.uploadFixed(fixedDeliveryAddress));
    }
    @ApiOperation(value = "更新固定提货地址", notes = "更新现有的提货地址")
    @PutMapping("update")
    public Result<Boolean> updateFixed(@ApiParam(value = "更新提货地址") @RequestBody FixedDeliveryAddress fixedDeliveryAddress)
    {
        return Result.success(fixedDeliveryAddressService.updateFixed(fixedDeliveryAddress));
    }
    @ApiOperation(value = "删除提货地址", notes = "管理员来删除固定提货地址")
    @DeleteMapping("/delete")
    public Result<Boolean> deleteFixed(
            @ApiParam(value = "固定地址ID", required = true) @RequestParam Integer fixedID){
        return Result.success(fixedDeliveryAddressService.deletedFixed(fixedID));
    }
}
