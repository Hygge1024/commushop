package org.lt.commushop.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.IService;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import org.lt.commushop.domain.entity.FixedDeliveryAddress;
import org.lt.commushop.exception.BusinessException;
import org.lt.commushop.mapper.FixedDeliveryAddressMapper;
import org.lt.commushop.service.IFixedDeliveryAddressService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
public class IFixedDeliveryAddressServiceImpl extends ServiceImpl<FixedDeliveryAddressMapper,FixedDeliveryAddress> implements IFixedDeliveryAddressService {
    @Autowired
    private FixedDeliveryAddressMapper fixedDeliveryAddressMapper;

    @Override
    public IPage<FixedDeliveryAddress> getPageFixed(Integer current, Integer size, String addresName) {
        //1. 创建分页对象
        Page<FixedDeliveryAddress> page = new Page<>(current,size);

        //2. 构建查询条件
        LambdaQueryWrapper<FixedDeliveryAddress>  wrapper = new LambdaQueryWrapper<>();
        if(StringUtils.hasText(addresName)){
            wrapper.like(FixedDeliveryAddress::getFixedAddress,addresName);
        }
        //3. 执行分页查询
        IPage<FixedDeliveryAddress> fixedDeliveryAddressIPage = this.page(page,wrapper);

        return fixedDeliveryAddressIPage;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Boolean updateFixed(FixedDeliveryAddress fixedDeliveryAddress) {
        // 首先检查给地址是否存在
        FixedDeliveryAddress fixedDeliveryAddress1 = fixedDeliveryAddressMapper.selectOne(new LambdaQueryWrapper<FixedDeliveryAddress>()
                .eq(FixedDeliveryAddress::getLocationId,fixedDeliveryAddress.getLocationId()));
        if(fixedDeliveryAddress1 == null){
            throw new BusinessException("更新失败，传入地址项不存在");
        }
        boolean update =  this.updateById(fixedDeliveryAddress);
//        boolean update =  this.updateById(fixedDeliveryAddress);
        if(!update){
            throw new BusinessException("更新提货地址失败");
        }
        return true;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public FixedDeliveryAddress uploadFixed(FixedDeliveryAddress fixedDeliveryAddress) {
        // 首先要检查该地址是否存在
        FixedDeliveryAddress existedFixed = fixedDeliveryAddressMapper.selectOne(new LambdaQueryWrapper<FixedDeliveryAddress>()
                .eq(FixedDeliveryAddress::getFixedAddress,fixedDeliveryAddress.getFixedAddress())
        );
        if(existedFixed != null){
            throw new BusinessException("该地址已存在，请重新填写地址");
        }
//        this.uploadFixed(fixedDeliveryAddress);
        fixedDeliveryAddressMapper.insert(fixedDeliveryAddress);
        return fixedDeliveryAddress;
    }

    @Override
    public boolean deletedFixed(Integer fixedID) {
        // 首先检查给地址是否存在
        FixedDeliveryAddress fixedDeliveryAddress1 = fixedDeliveryAddressMapper.selectOne(new LambdaQueryWrapper<FixedDeliveryAddress>()
                .eq(FixedDeliveryAddress::getLocationId,fixedID));
        if(fixedDeliveryAddress1 == null){
            throw new BusinessException("删除失败，该地址不存在");
        }
        int deleted = fixedDeliveryAddressMapper.deleteById(fixedDeliveryAddress1);
        if(deleted != 1){
            throw new BusinessException("删除操作失败");
        }
        return true;
    }
}
