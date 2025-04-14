package org.lt.commushop.domain.vo;

import lombok.Data;

@Data
public class TransactionStatisticsVO {
    //日期
    private String date;
    //成交量
    private Integer transactionVolume;
}
