package org.lt.commushop.domain.vo;

import io.swagger.annotations.Api;
import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;
import org.lt.commushop.domain.entity.Cart;
import org.lt.commushop.domain.entity.Product;

import java.util.List;

@Data
@ApiModel(description = "购物车返回对象")
public class CartVO {
    //其实也就是将Cart中productID换成product对象
    @ApiModelProperty("购物车自身信息")
    private Cart cart;
    @ApiModelProperty("加入购物车的商品信息")
    private Product product;
}
