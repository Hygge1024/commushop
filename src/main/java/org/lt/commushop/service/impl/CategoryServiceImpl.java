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
        LambdaQueryWrapper<Category> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(Category::getIsDeleted, 0);
        return categoryMapper.selectList(queryWrapper);
    }

    @Override
    public List<Category> getAllCategoriesActive() {
        LambdaQueryWrapper<Category> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(Category::getIsActive, true)
                   .eq(Category::getIsDeleted, 0);
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
        queryWrapper.eq(Category::getCategoryName,category.getCategoryName())
                   .eq(Category::getIsDeleted, 0);
        if (this.count(queryWrapper) != 0){
            throw new BusinessException("添加分类失败：分类名称已存在");
        }
        category.setIsActive(true); // 新添加的分类默认为激活状态
        category.setIsDeleted(0);   // 新添加的分类默认未删除
        // 3. 保存分类
        if (!this.save(category)){
            throw new BusinessException("添加分类失败：保存分类信息失败");
        }
        return category;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Category updateCategory(Category category) {
        // 1. 参数校验
        if (category == null || category.getCategoryId() == null) {
            throw new BusinessException("更新分类失败：分类信息或ID不能为空");
        }

        // 2. 检查分类是否存在
        Category existingCategory = this.getById(category.getCategoryId());
        if (existingCategory == null) {
            throw new BusinessException("更新分类失败：分类不存在");
        }

        // 3. 如果要更新分类名称，检查新名称是否与其他分类重复
        if (category.getCategoryName() != null && !category.getCategoryName().equals(existingCategory.getCategoryName())) {
            LambdaQueryWrapper<Category> queryWrapper = new LambdaQueryWrapper<>();
            queryWrapper.eq(Category::getCategoryName, category.getCategoryName())
                    .ne(Category::getCategoryId, category.getCategoryId())
                    .eq(Category::getIsDeleted, 0);
            if (this.count(queryWrapper) > 0) {
                throw new BusinessException("更新分类失败：新分类名称已存在");
            }
        }

        // 4. 更新分类信息
        existingCategory.setCategoryName(category.getCategoryName() != null ? category.getCategoryName() : existingCategory.getCategoryName());
        existingCategory.setIsActive(category.getIsActive() != null ? category.getIsActive() : existingCategory.getIsActive());
        
        if (!this.updateById(existingCategory)) {
            throw new BusinessException("更新分类失败：保存更新信息失败");
        }

        return existingCategory;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deleteCategory(Integer categoryId) {
        // 1. 参数校验
        if (categoryId == null) {
            throw new BusinessException("删除分类失败：分类ID不能为空");
        }

        // 2. 检查分类是否存在且未被删除
        Category category = this.getById(categoryId);
        if (category == null) {
            throw new BusinessException("删除分类失败：分类不存在");
        }
        if (category.getIsDeleted() == 1) {
            throw new BusinessException("删除分类失败：分类已被删除");
        }

        // 3. 执行软删除
        category.setIsDeleted(1);
        if (!this.updateById(category)) {
            throw new BusinessException("删除分类失败：更新删除状态失败");
        }
    }
}
