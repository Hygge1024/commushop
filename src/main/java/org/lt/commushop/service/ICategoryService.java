package org.lt.commushop.service;

import com.baomidou.mybatisplus.extension.service.IService;
import org.lt.commushop.domain.entity.Category;

import java.util.List;

/**
 * <p>
 *  服务类
 * </p>
 *
 * @author tao
 * @since 2025-01-26
 */
public interface ICategoryService extends IService<Category> {
    List<Category> getAllCategories();
    List<Category> getAllCategoriesActive();
    Category addCategory(Category category);

}
