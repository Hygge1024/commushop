package org.lt.commushop.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import org.lt.commushop.domain.entity.Product;
import com.baomidou.mybatisplus.extension.service.IService;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;

/**
 * <p>
 * 服务类
 * </p>
 *
 * @author tao
 * @since 2025-01-21
 */
public interface IProductService extends IService<Product> {
    /**
     * 分页查询商品
     *
     * @param current          当前页
     * @param size             每页大小
     * @param productName      商品名称
     * @param minOriginalPrice 最小原价
     * @param maxOriginalPrice 最大原价
     * @param minGroupPrice    最小团购价
     * @param maxGroupPrice    最大团购价
     * @return 分页结果
     */
    IPage<Product> getProductPage(
            Integer current,
            Integer size,
            String productName,
            BigDecimal minOriginalPrice,
            BigDecimal maxOriginalPrice,
            BigDecimal minGroupPrice,
            BigDecimal maxGroupPrice);

    /**
     * 根据商品ID获取商品详情
     *
     * @param id 商品ID
     * @return 商品详情
     */
    Product getProductDetail(Integer id);

    /**
     * 上传商品
     *
     * @param product 商品对象
     * @return 商品详情
     */
    Product uploadProduct(Product product);

    /**
     * 更新商品
     *
     * @param product 商品对象
     * @return 商品详情
     */
    Product updateProduct(Product product);


    /**
     * 更新商品图片
     *
     * @param productId 商品ID
     * @param fileUrl 文件URL
     * @return 商品详情
     */
    Product updateProductImage(Integer productId, String fileUrl);

}
