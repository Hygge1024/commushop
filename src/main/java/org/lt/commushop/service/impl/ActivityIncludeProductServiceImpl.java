package org.lt.commushop.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import org.lt.commushop.domain.entity.ActivityIncludeProduct;
import org.lt.commushop.mapper.ActivityIncludeProductMapper;
import org.lt.commushop.service.IActivityIncludeProductService;
import org.springframework.stereotype.Service;

/**
 * <p>
 * 活动包含商品关联表 服务实现类
 * </p>
 *
 * @author tao
 * @since 2025-02-07
 */
@Service
public class ActivityIncludeProductServiceImpl extends ServiceImpl<ActivityIncludeProductMapper, ActivityIncludeProduct>
        implements IActivityIncludeProductService {
    
    // list方法已经由ServiceImpl提供，不需要重写
    // 它会自动使用传入的LambdaQueryWrapper进行查询
    // 如果需要自定义查询逻辑，可以在这里添加新的方法
}
