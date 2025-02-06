package org.lt.commushop.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import org.checkerframework.checker.units.qual.A;
import org.lt.commushop.common.Result;
import org.lt.commushop.domain.Hander.CollectionVO;
import org.lt.commushop.domain.entity.Collection;
import org.lt.commushop.domain.entity.Product;
import org.lt.commushop.exception.BusinessException;
import org.lt.commushop.exception.DuplicateProductException;
import org.lt.commushop.mapper.CollectionMapper;
import org.lt.commushop.service.ICollectionService;
import org.lt.commushop.service.IProductService;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

/**
 * <p>
 *  服务实现类
 * </p>
 *
 * @author tao
 * @since 2025-01-21
 */
@Service
public class CollectionServiceImpl extends ServiceImpl<CollectionMapper, Collection> implements ICollectionService {
    @Autowired
    private CollectionMapper collectionMapper;

    @Autowired
    private IProductService productService;

    @Override
    public Collection addCollection(Collection collection) {
        // 检查商品是否存在
        Product product = productService.getById(collection.getProductId());
        if (product == null) {
            throw new BusinessException("添加收藏失败：商品不存在，商品ID: " + collection.getProductId());
        }

        //检查商品是否已被收藏
        LambdaQueryWrapper<Collection> collectionLambdaQueryWrapper = new LambdaQueryWrapper<>();
        collectionLambdaQueryWrapper.eq(Collection::getProductId, collection.getProductId())
                .eq(Collection::getUserId, collection.getUserId());
        Collection existCollection = getOne(collectionLambdaQueryWrapper);
        if(existCollection != null){
            throw new DuplicateProductException("添加收藏失败：该商品已被收藏，ProductID:" + collection.getProductId());
        }
        //插入新商品
        collectionMapper.insert(collection);
        return collection;
    }

    @Override
    public boolean deleteCollection(Integer id) {
        // 检查收藏是否存在
        Collection collection = getById(id);
        if (collection == null) {
            throw new BusinessException("取消收藏失败：收藏记录不存在，收藏ID: " + id);
        }
        return removeById(id);
    }

    @Override
    public boolean checkCollectionStatus(Integer userId, Integer productId) {
        if (userId == null || productId == null) {
            throw new BusinessException("检查收藏状态失败：用户ID和商品ID不能为空");
        }
        // 检查商品是否存在
        Product product = productService.getById(productId);
        if (product == null) {
            throw new BusinessException("检查收藏状态失败：商品不存在，商品ID: " + productId);
        }

        LambdaQueryWrapper<Collection> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(Collection::getUserId, userId)
                   .eq(Collection::getProductId, productId);
        return count(queryWrapper) > 0;
    }

    @Override
    public IPage<CollectionVO> getUserCollections(Integer userId, Integer current, Integer size) {
        if (userId == null) {
            throw new BusinessException("查询收藏列表失败：用户ID不能为空");
        }

        // 创建分页对象
        Page<Collection> page = new Page<>(current, size);

        // 构建查询条件
        LambdaQueryWrapper<Collection> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(Collection::getUserId, userId)
                   .orderByDesc(Collection::getCollectionTime);

        // 执行分页查询
        IPage<Collection> collectionPage = page(page, queryWrapper);

        // 转换为VO对象
        Page<CollectionVO> voPage = new Page<>(current, size, collectionPage.getTotal());
        List<CollectionVO> voList = collectionPage.getRecords().stream().map(collection -> {
            CollectionVO vo = new CollectionVO();
            // 复制基本属性
            vo.setId(collection.getCollectionId());
            vo.setUserId(collection.getUserId());
            vo.setProductId(collection.getProductId());
            vo.setCreateTime(collection.getCollectionTime());

            // 获取商品信息
            Product product = productService.getById(collection.getProductId());
            if (product != null) {
                vo.setProductName(product.getProductName());
                vo.setProductImage(product.getImageUrl());
                vo.setOriginalPrice(product.getOriginalPrice());
                vo.setGroupPrice(product.getGroupPrice());
            } else {
                vo.setProductName("商品已下架");
            }
            return vo;
        }).collect(Collectors.toList());

        voPage.setRecords(voList);
        return voPage;
    }
}
