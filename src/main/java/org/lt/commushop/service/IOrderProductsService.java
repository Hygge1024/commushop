package org.lt.commushop.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.service.IService;
import org.lt.commushop.domain.entity.OrderProducts;
import org.lt.commushop.domain.vo.OrderProductVO;

import java.util.List;

public interface IOrderProductsService extends IService<OrderProducts> {
    /**
     * 无须更新和删除
     */

    /**
     * 批量添加订单商品
     *
     * @param orderProducts 订单商品列表
     * @return 是否添加成功
     */
    Double saveBatchOrderProducts(List<OrderProducts> orderProducts);

    /**
     * 分页查询订单商品信息
     *
     * @param current   当前页
     * @param size      每页大小
     * @param orderCode 订单编号
     * @param userId    用户ID（可选）
     * @return 分页结果
     */
    IPage<OrderProductVO> getOrderProductsPage(Integer current, Integer size, String orderCode,
                                               Integer userId);

}
