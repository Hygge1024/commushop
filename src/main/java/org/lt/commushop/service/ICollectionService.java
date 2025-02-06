package org.lt.commushop.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import org.lt.commushop.domain.Hander.CollectionVO;
import org.lt.commushop.domain.entity.Collection;
import com.baomidou.mybatisplus.extension.service.IService;

/**
 * <p>
 *  服务类
 * </p>
 *
 * @author tao
 * @since 2025-01-21
 */
public interface ICollectionService extends IService<Collection> {
    /**
     * 添加收藏
     * @param collection 收藏类
     * @return 是否添加成功
     */
    Collection addCollection(Collection collection);
    boolean deleteCollection(Integer collectionId);
    IPage<CollectionVO> getUserCollections(Integer userId, Integer current, Integer size);
    boolean checkCollectionStatus(Integer userId, Integer productId);

}
