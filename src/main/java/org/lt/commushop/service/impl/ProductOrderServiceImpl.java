package org.lt.commushop.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import org.lt.commushop.domain.entity.Product;
import org.lt.commushop.domain.entity.ProductOrder;
import org.lt.commushop.domain.entity.User;
import org.lt.commushop.exception.BusinessException;
import org.lt.commushop.mapper.ProductMapper;
import org.lt.commushop.mapper.ProductOrderMapper;
import org.lt.commushop.mapper.UserMapper;
import org.lt.commushop.service.IProductOrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.rmi.dgc.Lease;

@Service
public class ProductOrderServiceImpl extends ServiceImpl<ProductOrderMapper, ProductOrder>
        implements IProductOrderService {
    @Autowired
    private ProductOrderMapper productOrderMapper;
    @Autowired
    private ProductMapper productMapper;
    @Autowired
    private UserMapper userMapper;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public IPage<ProductOrder> getProductOrderPage(Integer current, Integer size, Integer userId) {
        // 1.条件判空
        if (current == null || size == null || userId == null) {
            throw new BusinessException("查询商品订单失败：查询信息不能为空");
        }
        // 2.构造查询条件
        Page<ProductOrder> page = new Page<>(current, size);
        LambdaQueryWrapper<ProductOrder> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(ProductOrder::getUserId, userId)
                .eq(ProductOrder::getIsDeleted, 0);// 过滤掉未删除的订单
        IPage<ProductOrder> productOrderIPage = productOrderMapper.selectPage(page, queryWrapper);

        // 3.查询返回结果
        return productOrderIPage;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public ProductOrder addOrder(ProductOrder productOrder) {
        // 1.参数判空
        if (productOrder == null) {
            throw new BusinessException("下单失败：参数不能为空");
        }
        // 2.检查商品是否存在
        Product product = productMapper.selectById(productOrder.getProductId());
        if (product == null) {
            throw new BusinessException("下单失败：商品不存在");
        }
        // 3.检查团长是否存在
        User existLeader = userMapper.selectById(productOrder.getLeaderId());
        if (existLeader == null) {
            throw new BusinessException("下单失败：团长不存在");
        }
        // 4.更改totalMoney
        Double endPrice = product.getOriginalPrice().doubleValue() * productOrder.getAmount();//计算的是原价
        productOrder.setTotalMoney(endPrice);
        // 4.添加订单
        productOrderMapper.insert(productOrder);
        return productOrder;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Boolean updateOrder(ProductOrder productOrder) {
        // 1.参数判空
        if (productOrder == null) {
            throw new BusinessException("下单失败：参数不能为空");
        }
        // 2.检查订单是否存在
        ProductOrder existProductOrder = productOrderMapper.selectById(productOrder.getPorderId());
        if (existProductOrder == null) {
            throw new BusinessException("更订单失败：订单信息不存在");
        }
        // 3.更新订单信息
        if (productOrder.getUserId() != null)
            existProductOrder.setUserId(productOrder.getUserId());
        if (productOrder.getProductId() != null)
            existProductOrder.setProductId(productOrder.getProductId());
        if (productOrder.getOrderStatus() != null)
            existProductOrder.setOrderStatus(productOrder.getOrderStatus());
        if (productOrder.getTotalMoney() != 0)
            existProductOrder.setTotalMoney(productOrder.getTotalMoney());
        if (productOrder.getAmount() != null)
            existProductOrder.setAmount(productOrder.getAmount());
        if (productOrder.getAddress() != null)
            existProductOrder.setAddress(productOrder.getAddress());
        if (productOrder.getLeaderId() != null)
            existProductOrder.setLeaderId(productOrder.getLeaderId());

        return productOrderMapper.updateById(existProductOrder) > 0;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Boolean softDelete(Integer POrderId) {
        // 1.参数判空
        if (POrderId == null) {
            throw new BusinessException("下单失败：参数不能为空");
        }
        // 2.检查订单是否存在
        ProductOrder existProductOrder = productOrderMapper.selectById(POrderId);
        if (existProductOrder == null) {
            throw new BusinessException("更订单失败：订单信息不存在");
        }
        existProductOrder.setIsDeleted(1);
        return productOrderMapper.updateById(existProductOrder) > 0;
    }
}
