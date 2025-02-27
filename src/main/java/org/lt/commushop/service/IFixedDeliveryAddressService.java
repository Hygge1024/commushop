package org.lt.commushop.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.service.IService;
import io.swagger.models.auth.In;
import org.lt.commushop.domain.entity.FixedDeliveryAddress;

public interface IFixedDeliveryAddressService extends IService<FixedDeliveryAddress> {

    /**
     * 分页查询地址
     * @param current 当前页
     * @param size 页大小
     * @param addresName 地址名称（支持模糊查询）
     * @return 查询结果
     */
    IPage<FixedDeliveryAddress> getPageFixed(Integer current, Integer size,String addresName);

    /**
     * 上传固定地址
     * @param fixedDeliveryAddress 地址对象
     * @return 返回上传对象
     */
    FixedDeliveryAddress uploadFixed(FixedDeliveryAddress fixedDeliveryAddress);

    /**
     * 更新固定地址
     * @param fixedDeliveryAddress 更新对象
     * @return 返回更新后的地址
     */
    Boolean updateFixed(FixedDeliveryAddress fixedDeliveryAddress);

    /**
     * 删除固定地址
     * @param fixedID 地址项ID
     * @return 返回操作结果
     */
    boolean deletedFixed(Integer fixedID);
}
