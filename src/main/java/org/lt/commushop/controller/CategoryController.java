package org.lt.commushop.controller;

import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import org.lt.commushop.common.Result;
import org.lt.commushop.domain.entity.Category;
import org.lt.commushop.domain.entity.Collection;
import org.lt.commushop.service.ICategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Api(tags = "商品类型管理模块")
@RestController
@RequestMapping("/category")   // 前缀
public class CategoryController {
    @Autowired
    private ICategoryService categoryService;

    @ApiOperation(value = "查询所有商品种类", notes = "查询所有商品种类列表")
    @GetMapping("/all")
    public Result<List<Category>> getCategory() {
        return Result.success(categoryService.getAllCategories());
    }
    @ApiOperation(value = "查询有效商品种类", notes = "查询有效商品种类列表")
    @GetMapping("/active")
    public Result<List<Category>> getCategoryActive() {
        return Result.success(categoryService.getAllCategoriesActive());
    }
    @ApiOperation(value = "添加商品种类", notes = "添加新的商品种类")
    @PostMapping("/add")
    public Result<Category> addCategory(@RequestBody Category category) {
        return Result.success(categoryService.addCategory(category));
    }
}
