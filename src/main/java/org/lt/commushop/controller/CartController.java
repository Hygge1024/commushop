package org.lt.commushop.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiParam;
import org.lt.commushop.common.Result;
import org.lt.commushop.domain.entity.Cart;
import org.lt.commushop.domain.vo.CartVO;
import org.lt.commushop.service.ICartService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Api(tags = "购物车管理模块")
@RestController
@RequestMapping("/cart")
public class CartController {
    @Autowired
    private ICartService cartService;

    @ApiOperation(value = "查询用户收藏的商品", notes = "查询该用户的购物车")
    @GetMapping("/user")
    public Result<IPage<CartVO>> getCartPage(
            @ApiParam(value = "当前页码", defaultValue = "1") @RequestParam(defaultValue = "1") Integer current,
            @ApiParam(value = "每页数量", defaultValue = "10") @RequestParam(defaultValue = "10") Integer size,
            @ApiParam(value = "用户ID") @RequestParam Integer userID
    ){
        return Result.success(cartService.getCartPage(current,size,userID));

    }

    @ApiOperation(value = "添加商品到购物车")
    @PostMapping("/add")
    public Result<Cart> addCart(@RequestBody Cart cart) {
        return Result.success(cartService.addCart(cart));
    }

    @ApiOperation(value = "更新购物车商品数量")
    @PutMapping("/update")
    public Result<Boolean> updateCart(@RequestBody Cart cart) {
        return Result.success(cartService.updateCart(cart));
    }

    @ApiOperation(value = "删除购物车商品")
    @DeleteMapping("/delete/{cid}")
    public Result<Boolean> deleteCart(@PathVariable Integer cid) {
        return Result.success(cartService.deleteCart(cid));
    }
}
