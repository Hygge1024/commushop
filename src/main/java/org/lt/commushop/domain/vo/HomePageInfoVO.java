package org.lt.commushop.domain.vo;

import lombok.Data;

import java.util.List;

@Data
public class HomePageInfoVO {
    //线上商品总数
    private Integer onlineProductTotal;
    //线上商品类数量
    private Integer onlineProductCategoryCount;
    //日新增评论
    private Integer dailyNewComments;
    //较昨日新增评论的涨幅
    private Double commentGrowthRate;
    //近七日的成交量数据
    private List<TransactionStatisticsVO> transactionStatisticsVOList;
    //热门商品列表
    private List<PopularProductVO> popularProductVOList;
    //类容类比占比
    private  List<CategoryRatioVO> categoryRatioVOList;
}
