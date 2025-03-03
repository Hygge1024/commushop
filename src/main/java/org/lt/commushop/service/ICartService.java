package org.lt.commushop.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import org.lt.commushop.domain.entity.Cart;
import org.lt.commushop.domain.vo.CartVO;

import java.util.List;

/**
 * 购物车服务
 */
public interface ICartService {
    //分页查询购物车
    IPage<CartVO> getCartPage(Integer current, Integer size, Integer userId);

    //添加购物
    Cart addCart(Cart cart);

    //更新购物车
    Boolean updateCart(Cart cart);

    //删除购物车
    Boolean deleteCart(Integer cid);
}
