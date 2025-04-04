package org.lt.commushop.domain.vo;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;
import org.lt.commushop.domain.entity.Product;

import java.math.BigDecimal;

@Data
@ApiModel(description = "推荐商品VO对象")

public class RecommendedProduct {
    @ApiModelProperty("商品ID")
    private Integer productId;

    @ApiModelProperty("商品名称")
    private String productName;

    @ApiModelProperty("商品描述")
    private String description;

    @ApiModelProperty("商品价格")
    private BigDecimal price;

    @ApiModelProperty("库存")
    private Integer stock;

    @ApiModelProperty("商品状态：0-下架，1-上架")
    private Integer status;

    @ApiModelProperty("商品主图")
    private String mainPicture;

    @ApiModelProperty("推荐分数")
    private Double score;

    // 从Product对象创建RecommendedProduct
    public static RecommendedProduct fromProduct(Product product, Double score) {
        RecommendedProduct recommendedProduct = new RecommendedProduct();
        recommendedProduct.setProductId(product.getProductId());
        recommendedProduct.setProductName(product.getProductName());
        recommendedProduct.setDescription(product.getProductDesc());
        recommendedProduct.setPrice(product.getGroupPrice());
        recommendedProduct.setStock(product.getStockQuantity());
        recommendedProduct.setStatus(product.getIsDeleted());
        recommendedProduct.setMainPicture(product.getImageUrl());
        recommendedProduct.setScore(score);
        return recommendedProduct;
    }
}
