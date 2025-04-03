package org.lt.commushop.domain.Hander;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * 商品行为数据类
 */
@Data
public class ProductBehavior {
    private int purchaseCount; //购买数量
    private boolean favorited; //是否收藏
    private LocalDateTime favoriteTime; //收藏时间
    private Integer rating; //评分
}
