package org.lt.commushop.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.core.toolkit.StringUtils;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import org.lt.commushop.domain.entity.Product;
import org.lt.commushop.exception.DuplicateProductException;
import org.lt.commushop.mapper.ProductMapper;
import org.lt.commushop.service.IProductService;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;

/**
 * <p>
 * 服务实现类
 * </p>
 *
 * @author tao
 * @since 2025-01-21
 */
@Service
public class ProductServiceImpl extends ServiceImpl<ProductMapper, Product> implements IProductService {
    @Override
    public IPage<Product> getProductPage(
            Integer current,
            Integer size,
            String productName,
            BigDecimal minOriginalPrice,
            BigDecimal maxOriginalPrice,
            BigDecimal minGroupPrice,
            BigDecimal maxGroupPrice) {
        // 创建分页对象
        Page<Product> page = new Page<>(current, size);

        // 构建查询条件
        LambdaQueryWrapper<Product> wrapper = buildQueryWrapper(
                productName, minOriginalPrice, maxOriginalPrice,
                minGroupPrice, maxGroupPrice);

        // 执行查询
        return baseMapper.selectPage(page, wrapper);
    }

    /**
     * 构建查询条件
     */
    private LambdaQueryWrapper<Product> buildQueryWrapper(
            String productName,
            BigDecimal minOriginalPrice,
            BigDecimal maxOriginalPrice,
            BigDecimal minGroupPrice,
            BigDecimal maxGroupPrice) {
        LambdaQueryWrapper<Product> wrapper = new LambdaQueryWrapper<>();

        // 添加查询条件
        wrapper.like(StringUtils.isNotBlank(productName), Product::getProductName, productName)
                .ge(minOriginalPrice != null, Product::getOriginalPrice, minOriginalPrice)
                .le(maxOriginalPrice != null, Product::getOriginalPrice, maxOriginalPrice)
                .ge(minGroupPrice != null, Product::getGroupPrice, minGroupPrice)
                .le(maxGroupPrice != null, Product::getGroupPrice, maxGroupPrice)
                .orderByDesc(Product::getProductId);
        return wrapper;
    }

    @Override
    public Product getProductDetail(Integer id) {
        return baseMapper.selectById(id);
    }

    @Override
    public Product uploadProduct(Product product) {
        // 检查商品名称是否已存在
        LambdaQueryWrapper<Product> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(Product::getProductName, product.getProductName());

        // 查询是否存在同名商品
        Product existingProduct = baseMapper.selectOne(queryWrapper);
        if (existingProduct != null) {
            throw new DuplicateProductException("商品名称已被添加：" + product.getProductName());
        }

        // 插入新商品
        baseMapper.insert(product);
        return product;
    }
}
