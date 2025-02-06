package org.lt.commushop.domain.vo;

import lombok.Data;
import org.lt.commushop.domain.entity.GroupBuyingActivity;
import org.lt.commushop.domain.entity.Product;

import java.util.List;

/**
 * 团购活动及其关联商品VO
 */
@Data
public class ActivityWithProductsVO {
    /**
     * 团购活动信息
     */
    private GroupBuyingActivity activity;
    
    /**
     * 活动关联的商品列表
     */
    private List<Product> products;
}
