package org.lt.commushop.domain.vo;

import lombok.Data;

@Data
public class PopularProductVO {
    //排名
    private Integer rank;
    //内容标题
    private String contentTitle;
    //销售量
    private Integer sellCount;
    //日张福
    private Double dailyGrowthRate;
}
