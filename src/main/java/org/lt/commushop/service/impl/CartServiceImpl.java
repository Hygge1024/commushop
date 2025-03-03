package org.lt.commushop.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import org.checkerframework.checker.units.qual.C;
import org.lt.commushop.domain.entity.Cart;
import org.lt.commushop.domain.entity.Product;
import org.lt.commushop.domain.vo.CartVO;
import org.lt.commushop.exception.BusinessException;
import org.lt.commushop.mapper.CartMapper;
import org.lt.commushop.mapper.ProductMapper;
import org.lt.commushop.service.ICartService;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.parameters.P;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CartServiceImpl extends ServiceImpl<CartMapper, Cart> implements ICartService {
    @Autowired
    private CartMapper cartMapper;
    @Autowired
    private ProductMapper productMapper;

    @Transactional(rollbackFor = Exception.class)
    @Override
    public IPage<CartVO> getCartPage(Integer current, Integer size, Integer userId) {
        //1.参数判空
        if (current == null || size == null || userId == null) {
            throw new BusinessException("查询用户购物车失败：查询信息不能为空");
        }
        //2.根据条件userId查询所有的Cart->List
        Page<Cart> page = new Page<>(current,size);
        LambdaQueryWrapper<Cart> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(Cart :: getUserId,userId);
        Page<Cart> cartPage = cartMapper.selectPage(page,queryWrapper);

        //3.将所有Cart转为CartVO
        Page<CartVO> cartVOPage = new Page<>();
        BeanUtils.copyProperties(cartPage,cartVOPage,"records");//复制属性到cartVOPage中

        List<CartVO> cartVOList = cartPage.getRecords().stream().map(cart -> {
            CartVO cartVO = new CartVO();
            cartVO.setCart(cart);
            //查询商品
            Product product = productMapper.selectById(cart.getProductId());
            cartVO.setProduct(product);
            return cartVO;
        }).collect(Collectors.toList());

        cartVOPage.setRecords(cartVOList);
        return cartVOPage;
    }

    @Transactional(rollbackFor = Exception.class)
    @Override
    public Cart addCart(Cart cart) {
        //1.参数判空
        if (cart == null || cart.getUserId() == null || cart.getProductId() == null || cart.getAmount() == null) {
            throw new BusinessException("添加购物车失败：参数不能为空");
        }
        //2.检查商品是否存在
        Product product = productMapper.selectById(cart.getProductId());
        if (product == null) {
            throw new BusinessException("添加购物车失败：商品不存在");
        }
        //3.检查是否已经在购物车中
        LambdaQueryWrapper<Cart> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(Cart::getUserId, cart.getUserId())
                   .eq(Cart::getProductId, cart.getProductId());
        Cart existCart = cartMapper.selectOne(queryWrapper);

        if (existCart != null) {
            //4.如果已存在，更新数量
            existCart.setAmount(existCart.getAmount() + cart.getAmount());
            cartMapper.updateById(existCart);
            return existCart;
        }

        //5.不存在，新增购物车项
        cart.setAddTime(LocalDateTime.now());
        cartMapper.insert(cart);
        return cart;
    }

    @Transactional(rollbackFor = Exception.class)
    @Override
    public Boolean updateCart(Cart cart) {
        //1.参数判空
        if (cart == null || cart.getCartId() == null || cart.getAmount() == null) {
            throw new BusinessException("更新购物车失败：参数不能为空");
        }
        //2.检查购物车项是否存在
        Cart existCart = cartMapper.selectById(cart.getCartId());
        if (existCart == null) {
            throw new BusinessException("更新购物车失败：购物车项不存在");
        }
        //3.更新数量
        existCart.setAmount(cart.getAmount());
        return cartMapper.updateById(existCart) > 0;
    }

    @Transactional(rollbackFor = Exception.class)
    @Override
    public Boolean deleteCart(Integer cid) {
        //1.参数判空
        if (cid == null) {
            throw new BusinessException("删除购物车失败：购物车ID不能为空");
        }
        //2.检查购物车项是否存在
        Cart existCart = cartMapper.selectById(cid);
        if (existCart == null) {
            throw new BusinessException("删除购物车失败：购物车项不存在");
        }
        //3.删除购物车项
        return cartMapper.deleteById(cid) > 0;
    }
}
