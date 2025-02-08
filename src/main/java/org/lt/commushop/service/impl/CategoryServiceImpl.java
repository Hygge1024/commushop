package org.lt.commushop.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import org.lt.commushop.domain.entity.Category;

import org.lt.commushop.exception.BusinessException;
import org.lt.commushop.mapper.CategoryMapper;
import org.lt.commushop.service.ICategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * <p>
 *  服务实现类
 * </p>
 *
 * @author tao
 * @since 2025-01-26
 */
@Service
public class CategoryServiceImpl extends ServiceImpl<CategoryMapper, Category> implements ICategoryService {
    @Autowired
    private CategoryMapper categoryMapper;

    @Override
    public List<Category> getAllCategories() {
        return categoryMapper.selectList(null);
    }

    @Override
    public List<Category> getAllCategoriesActive() {
        LambdaQueryWrapper<Category> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(Category::getIsActive,true);
        return this.list(queryWrapper);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Category addCategory(Category category) {
        // 1. 参数校验
        if(category == null){
            throw new BusinessException("添加分类失败：分类信息不能为空");
        }
        //2. 检查分类名称是否已存在
        LambdaQueryWrapper<Category> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(Category::getCategoryName,category.getCategoryName());
        if (this.count(queryWrapper) != 0){
            throw new BusinessException("添加分类失败：分类名称已存在");
        }
        category.setIsActive(true); // 新添加的分类默认为激活状态
        // 3. 保存分类
        if (!this.save(category)){
            throw new BusinessException("添加分类失败：保存分类信息失败");
        }
        return category;
    }
}
