package org.lt.commushop.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.service.IService;
import org.lt.commushop.domain.entity.ProductOrder;

public interface IProductOrderService extends IService<ProductOrder> {
    //分页查询订单
    IPage<ProductOrder> getProductOrderPage(Integer current,Integer size, Integer userId);

    //添加订单
    ProductOrder addOrder(ProductOrder productOrder);

    //更新订单状态（订单状态，修改地址，修改派送人员）
    Boolean updateOrder(ProductOrder productOrder);

    //软删除订单
    Boolean softDelete(Integer POrderId);

}
