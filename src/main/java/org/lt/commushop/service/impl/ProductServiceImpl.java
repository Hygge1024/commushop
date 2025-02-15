package org.lt.commushop.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.core.toolkit.StringUtils;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import lombok.extern.slf4j.Slf4j;
import org.lt.commushop.common.Result;
import org.lt.commushop.domain.entity.Product;
import org.lt.commushop.domain.entity.ProductCategoryRelationship;
import org.lt.commushop.domain.entity.Category;
import org.lt.commushop.exception.DuplicateProductException;
import org.lt.commushop.mapper.ProductMapper;
import org.lt.commushop.mapper.ProductCategoryRelationshipMapper;
import org.lt.commushop.mapper.CategoryMapper;
import org.lt.commushop.service.IProductService;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import org.lt.commushop.service.UtilsService.MinioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

/**
 * <p>
 * 服务实现类
 * </p>
 *
 * @author tao
 * @since 2025-01-21
 */
@Service
@Slf4j
public class ProductServiceImpl extends ServiceImpl<ProductMapper, Product> implements IProductService {
    @Autowired
    private MinioService minioService;

    @Autowired
    private ProductCategoryRelationshipMapper productCategoryRelationshipMapper;

    @Autowired
    private CategoryMapper categoryMapper;

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
        IPage<Product> productPage = baseMapper.selectPage(page, wrapper);

        // 查询每个产品的类别
        for (Product product : productPage.getRecords()) {
            List<Integer> categoryIds = productCategoryRelationshipMapper.selectCategoryIdsByProductId(product.getProductId());
            if (!categoryIds.isEmpty()) {
                log.info(categoryIds.toString());
                List<Category> categories = categoryMapper.selectCategoriesByIds(categoryIds);
                product.setCategories(categories); // 设置类别
            }
        }

        return productPage;
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

    // 获取商品详情
    @Override
    public Product getProductDetail(Integer id) {
        // 查询产品信息
        Product product = baseMapper.selectById(id);
        if (product != null) {
            // 查询与该产品相关的所有 categoryId
            log.info("查询与该产品相关的所有 categoryId: " + id);
            List<Integer> categoryIds = productCategoryRelationshipMapper.selectCategoryIdsByProductId(id);
            log.info(categoryIds.toString());
            if (!categoryIds.isEmpty()) {
                // 查询所有类别信息
                List<Category> categories = categoryMapper.selectCategoriesByIds(categoryIds);
                product.setCategories(categories); // 设置类别
            }
        }
        return product;
    }

    // 上传商品
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

        // 获取插入后的商品 ID
        Integer productId = product.getProductId();

        // 插入中间表，存储商品与类别的关系
        if (product.getCategories() != null) {
            for (Category category : product.getCategories()) {
                ProductCategoryRelationship relationship = new ProductCategoryRelationship();
                relationship.setProductId(productId);
                relationship.setCategoryId(category.getCategoryId());
                productCategoryRelationshipMapper.insert(relationship);
            }
        }

        return product; // 返回新商品
    }

    // 更新商品
    @Override
    public Product updateProduct(Product product) {
        // 更新商品信息
        baseMapper.updateById(product);

        // 删除旧的类别关系
        productCategoryRelationshipMapper.deleteById(product.getProductId());

        // 插入新的类别关系
        if (product.getCategories() != null) {
            for (Category category : product.getCategories()) {
                ProductCategoryRelationship relationship = new ProductCategoryRelationship();
                relationship.setProductId(product.getProductId());
                relationship.setCategoryId(category.getCategoryId());
                productCategoryRelationshipMapper.insert(relationship);
            }
        }

        return product; // 返回更新后的商品
    }

    // 更新商品图片
    @Override
    public Product updateProductImage(Integer productId, String fileUrl) {
        Product product = baseMapper.selectById(productId);
        product.setImageUrl(fileUrl);
        baseMapper.updateById(product);
        return product;// 返回更新后的商品
    }

    // 删除商品
    @Override
    public Result<String> deleteProduct(Integer productId) {
        // 检查商品是否存在
        Product existingProduct = baseMapper.selectById(productId);
        if (existingProduct == null) {
            log.warn("尝试删除不存在的商品，ID: {}", productId);
            return Result.error("商品不存在");
        }
        try {
            // 删除与该商品相关的类别关系
            productCategoryRelationshipMapper.deleteById(productId);

            // 获取图片URL并从中提取对象名称
            String imageUrl = existingProduct.getImageUrl();
            if (imageUrl != null && !imageUrl.isEmpty()) {
                // URL格式为 http://8.137.53.253:9000/commoshop/product/1882865666625691648.png
                String prefix = minioService.getEndpoint() + "/" + minioService.getBucketName() + "/";
                if (imageUrl.startsWith(prefix)) {
                    String objectName = imageUrl.substring(prefix.length());
                    minioService.deleteFile(objectName);
                    log.info("成功删除 MinIO 中的图片，objectName: {}", objectName);
                } else {
                    log.error("图片URL格式不符合预期，无法提取 objectName。URL: {}", imageUrl);
                }
            }

            // 删除数据库中的商品记录
            int deleteCount = baseMapper.deleteById(productId);
            if (deleteCount > 0) {
                log.info("成功删除商品，ID: {}", productId);
                return Result.success("商品删除成功");
            } else {
                log.error("删除商品失败，ID: {}", productId);
                return Result.error("删除商品失败，可能商品不存在");
            }
        } catch (Exception e) {
            log.error("删除商品失败，ID: {}", productId, e);
            return Result.error("删除商品失败: " + e.getMessage());
        }
    }

    @Override
    public Result<String> deleteProductSoft(Integer productId) {
        // 检查商品是否存在
        Product existingProduct = baseMapper.selectById(productId);
        if (existingProduct == null) {
            log.warn("尝试删除不存在的商品，ID: {}", productId);
            return Result.error("商品不存在");
        }
        if(existingProduct.getIsDeleted() != null && existingProduct.getIsDeleted() == 1){
            return Result.error("商品已删除");
        }
        //软删除
        existingProduct.setIsDeleted(1);

        return this.updateById(existingProduct) ? Result.success("商品删除成功") : Result.error("商品删除失败");
    }

    @Override
    public boolean checkProductExists(Integer productId) {
        if (productId == null) {
            return false;
        }
        Product product = this.getById(productId);
        return product != null;
    }
}
