package org.lt.commushop.domain.Hander;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class CollectionVO {
    private Integer id;
    private Integer userId;
    private Integer productId;
    // 商品信息
    private String productName;
    private String productImage;
    private BigDecimal originalPrice;
    private BigDecimal groupPrice;
    private LocalDateTime createTime;
}
