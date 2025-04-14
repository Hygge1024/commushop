package org.lt.commushop.controller;

import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import org.lt.commushop.common.Result;
import org.lt.commushop.domain.vo.HomePageInfoVO;
import org.lt.commushop.service.UtilsService.IndexShowService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Api(tags = "可视化展示模块")
@RestController
@RequestMapping("/show")
public class IndexController {
    @Autowired
    private IndexShowService indexShowService;
    @ApiOperation(value = "获取首页展示数据", notes = "获取包含商品总数、评论数、销售统计等数据")
    @GetMapping("/homepage")
    public Result<HomePageInfoVO> getHomePageInfo(){
        return Result.success(indexShowService.getHomePage());
    }

}
