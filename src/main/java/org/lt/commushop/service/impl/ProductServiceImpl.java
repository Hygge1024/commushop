package org.lt.commushop.service.impl;

import org.lt.commushop.domain.entity.Product;
import org.lt.commushop.mapper.ProductMapper;
import org.lt.commushop.service.IProductService;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import org.springframework.stereotype.Service;

/**
 * <p>
 *  服务实现类
 * </p>
 *
 * @author tao
 * @since 2025-01-21
 */
@Service
public class ProductServiceImpl extends ServiceImpl<ProductMapper, Product> implements IProductService {

}
