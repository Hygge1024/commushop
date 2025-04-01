package org.lt.commushop.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import org.checkerframework.checker.units.qual.A;
import org.lt.commushop.domain.entity.OrderProducts;
import org.lt.commushop.domain.entity.Product;
import org.lt.commushop.domain.entity.User;
import org.lt.commushop.domain.vo.OrderProductVO;
import org.lt.commushop.exception.BusinessException;
import org.lt.commushop.mapper.OrderProductsMapper;
import org.lt.commushop.mapper.ProductMapper;
import org.lt.commushop.mapper.UserMapper;
import org.lt.commushop.service.IOrderProductsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class OrderProductsServiceImpl extends ServiceImpl<OrderProductsMapper, OrderProducts>
        implements IOrderProductsService {
    @Autowired
    private ProductMapper productMapper;
    @Autowired
    private UserMapper userMapper;

    @Override
    public Double saveBatchOrderProducts(List<OrderProducts> orderProducts) {
        // 1.参数校验
        if (orderProducts == null || orderProducts.isEmpty()) {
            throw new BusinessException("批量添加订单商品失败：参数不能为空");
        }
        double totalAmount = 0.0;
        // 2.校验商品和用户是否存在
        for (OrderProducts orderProduct : orderProducts) {
            // 检查商品是否存在
            Product existproduct = productMapper.selectById(orderProduct.getProductId());
            if (existproduct == null) {
                throw new BusinessException("批量添加订单商品失败：商品不存在，商品ID=" + orderProduct.getProductId());
            }
            // 检查订单商品是否已存在
            LambdaQueryWrapper<OrderProducts> queryWrapper = new LambdaQueryWrapper<>();
            queryWrapper.eq(OrderProducts::getOrderCode, orderProduct.getOrderCode())
                    .eq(OrderProducts::getProductId, orderProduct.getProductId());
            OrderProducts existOrderProduct = this.getOne(queryWrapper);
            if (existOrderProduct != null) {
                throw new BusinessException("批量添加订单商品失败：该订单中已存在此商品，订单编号="
                        + orderProduct.getOrderCode() + "，商品ID=" + orderProduct.getProductId());
            }
            // 计算该商品的总价：团购价 * 数量
            totalAmount += existproduct.getGroupPrice().multiply(new BigDecimal(orderProduct.getAmount()))
                    .doubleValue();
            // 检查用户是否存在
            User existuser = userMapper.selectById(orderProduct.getUserId());
            if (existuser == null) {
                throw new BusinessException("批量添加订单商品失败：用户不存在，用户ID=" + orderProduct.getUserId());
            }
            // 检查商品数量
            if (orderProduct.getAmount() <= 0) {
                throw new BusinessException("批量添加订单商品失败：商品数量必须大于0");
            }
            
            // 检查库存是否充足
            if (existproduct.getStockQuantity() < orderProduct.getAmount()) {
                throw new BusinessException("批量添加订单商品失败：商品库存不足，商品ID=" + orderProduct.getProductId() 
                        + "，当前库存=" + existproduct.getStockQuantity() 
                        + "，需要数量=" + orderProduct.getAmount());
            }
            
            // 预先减少库存（后面如果保存失败会回滚）
            existproduct.setStockQuantity(existproduct.getStockQuantity() - orderProduct.getAmount());
            int updateResult = productMapper.updateById(existproduct);
            if (updateResult <= 0) {
                throw new BusinessException("批量添加订单商品失败：更新商品库存失败，商品ID=" + orderProduct.getProductId());
            }
        }
        // 3.批量保存订单商品
        boolean saveResult = this.saveBatch(orderProducts);
        if (!saveResult) {
            throw new BusinessException("批量添加订单商品失败：保存失败");
        }

        // 4.返回总价
        return totalAmount;
    }

    @Override
    public IPage<OrderProductVO> getOrderProductsPage(Integer current, Integer size, String orderCode, Integer userId) {
        // 1.参数校验
        if (current == null || size == null) {
            throw new BusinessException("查询订单商品失败：参数不能为空");
        }
        // 2.创建分页对象
        Page<OrderProducts> page = new Page<>(current, size);

        // 3.构建查询条件
        LambdaQueryWrapper<OrderProducts> queryWrapper = new LambdaQueryWrapper<>();
        if (orderCode != null) {
            queryWrapper.eq(OrderProducts::getOrderCode, orderCode);
        }
        if (userId != null) {
            queryWrapper.eq(OrderProducts::getUserId, userId);
        }

        queryWrapper.orderByAsc(OrderProducts::getOrderproductId);
        // 4.执行查询
        IPage<OrderProducts> orderProductsPage = this.page(page, queryWrapper);
        // 5.转换为VO对象
        IPage<OrderProductVO> voPage = new Page<>(current, size, orderProductsPage.getTotal());
        List<OrderProductVO> voList = orderProductsPage.getRecords().stream().map(op -> {
            OrderProductVO vo = new OrderProductVO();
            vo.setOrderproductId(op.getOrderproductId());
            vo.setOrderCode(op.getOrderCode());
            vo.setUserId(op.getUserId());
            vo.setAmount(op.getAmount());
            // 获取商品详情
            Product product = productMapper.selectById(op.getProductId());
            vo.setProduct(product);
            return vo;
        }).collect(Collectors.toList());
        voPage.setRecords(voList);
        return voPage;
    }
}
