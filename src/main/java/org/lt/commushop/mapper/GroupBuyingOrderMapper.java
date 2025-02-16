package org.lt.commushop.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Results;
import org.apache.ibatis.annotations.Result;
import org.lt.commushop.domain.entity.GroupBuyingOrder;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.lt.commushop.domain.vo.ActivityStatisticsVO.DailyStatistics;
import java.util.List;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import org.apache.ibatis.annotations.Param;
import org.lt.commushop.domain.vo.OrderQueryVO;
import org.lt.commushop.dto.OrderQueryDTO;

/**
 * <p>
 *  Mapper 接口
 * </p>
 *
 * @author tao
 * @since 2025-01-21
 */
@Mapper
public interface GroupBuyingOrderMapper extends BaseMapper<GroupBuyingOrder> {
    
    /**
     * 查询每日订单统计数据
     * @return 每日统计数据列表
     */
    @Results({
        @Result(column = "day_of_week", property = "dayOfWeek"),
        @Result(column = "participants", property = "participants"),
        @Result(column = "sales_amount", property = "salesAmount")
    })
    @Select("SELECT " +
            "DAYOFWEEK(create_time) as day_of_week, " +
            "COUNT(*) as participants, " +
            "SUM(order_amount) as sales_amount " +
            "FROM group_buying_order " +
            "WHERE is_deleted = 0 " +
            "GROUP BY DAYOFWEEK(create_time) " +
            "ORDER BY day_of_week")
    List<DailyStatistics> selectDailyStatistics();

    // @Select({"<script>",
    //         "SELECT o.order_id, o.activity_code, a.activity_name, o.user_id, ",
    //         "o.order_status, o.order_amount, o.create_time, ",
    //         "a.start_time as activity_start_time, a.end_time as activity_end_time, ",
    //         "a.activity_status, a.activity_description ",
    //         "FROM group_buying_order o ",
    //         "LEFT JOIN group_buying_activity a ON o.activity_code = a.activity_code ",
    //         "WHERE 1=1 ",
    //         "<if test='query.orderId != null and query.orderId != \"\"'>",
    //         "AND o.order_id = #{query.orderId} ",
    //         "</if>",
    //         "<if test='query.activityName != null and query.activityName != \"\"'>",
    //         "AND a.activity_name LIKE CONCAT('%', #{query.activityName}, '%') ",
    //         "</if>",
    //         "<if test='query.userId != null and query.userId != \"\"'>",
    //         "AND o.user_id = #{query.userId} ",
    //         "</if>",
    //         "<if test='query.orderStatus != null'>",
    //         "AND o.order_status = #{query.orderStatus} ",
    //         "</if>",
    //         "<if test='query.startTime != null'>",
    //         "AND o.create_time >= #{query.startTime} ",
    //         "</if>",
    //         "<if test='query.endTime != null'>",
    //         "AND o.create_time &lt;= #{query.endTime} ",
    //         "</if>",
    //         "ORDER BY o.create_time DESC",
    //         "</script>"})
    // IPage<OrderQueryVO> queryOrderPage(@Param("page") Page<OrderQueryVO> page, @Param("query") OrderQueryDTO query);
}
