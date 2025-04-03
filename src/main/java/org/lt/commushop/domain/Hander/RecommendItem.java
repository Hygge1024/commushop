package org.lt.commushop.domain.Hander;

import lombok.AllArgsConstructor;
import lombok.Data;
/**
 * 推荐结果类
 */
@Data
@AllArgsConstructor

public class RecommendItem {
    private Integer productId;
    private Double score;
}
