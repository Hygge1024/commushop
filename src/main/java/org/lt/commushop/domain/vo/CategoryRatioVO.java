package org.lt.commushop.domain.vo;

import lombok.Data;

@Data
public class CategoryRatioVO {
    //种类名称
    private String CategoryName;
    //类别商品占比
    private Double categoryRatio;
}
