package org.lt.commushop.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import org.lt.commushop.domain.Hander.EvaluationVO;
import org.lt.commushop.domain.entity.Evaluation;
import org.lt.commushop.domain.entity.Product;
import org.lt.commushop.domain.entity.User;
import org.lt.commushop.exception.BusinessException;
import org.lt.commushop.mapper.EvaluationMapper;
import org.lt.commushop.service.IEvaluationService;
import org.lt.commushop.service.IProductService;
import org.lt.commushop.service.IUserService;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * <p>
 * 商品评价服务实现类
 * </p>
 *
 * @author tao
 * @since 2025-02-07
 */
@Service
public class EvaluationServiceImpl extends ServiceImpl<EvaluationMapper, Evaluation> implements IEvaluationService {

    @Autowired
    private IUserService userService;

    @Autowired
    private IProductService productService;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean addEvaluation(Evaluation evaluation) {
        // 1. 校验评价参数
        validateEvaluation(evaluation);

        // 2. 保存评价
        return this.save(evaluation);
    }

    @Override
    public void validateEvaluation(Evaluation evaluation) {
        // 1. 校验评价对象是否为空
        if (evaluation == null) {
            throw new BusinessException("评价信息不能为空");
        }

        // 2. 校验订单ID
        if (evaluation.getOrderId() == null || evaluation.getOrderId() <= 0) {
            throw new BusinessException("订单ID不能为空且必须大于0");
        }

        // 3. 校验用户ID
        if (evaluation.getUserId() == null || evaluation.getUserId() <= 0) {
            throw new BusinessException("用户ID不能为空且必须大于0");
        }

        // 4. 校验商品ID
        if (evaluation.getProductId() == null || evaluation.getProductId() <= 0) {
            throw new BusinessException("商品ID不能为空且必须大于0");
        }

        // 5. 校验评价内容
        if (!StringUtils.hasText(evaluation.getEvaluationContent())) {
            throw new BusinessException("评价内容不能为空");
        }

        // 6. 校验评分
        Integer score = evaluation.getEvaluationScore();
        if (score == null || score < 0 || score > 10) {
            throw new BusinessException("评分必须在0-10分之间");
        }

        // 7. 校验是否重复评价
        LambdaQueryWrapper<Evaluation> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(Evaluation::getUserId, evaluation.getUserId())
                   .eq(Evaluation::getOrderId, evaluation.getOrderId())
                   .eq(Evaluation::getProductId, evaluation.getProductId());

        long count = this.count(queryWrapper);
        if (count > 0) {
            throw new BusinessException("您已经评价过该订单的此商品了");
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean deleteEvaluation(Integer evaluationId) {
        // 1. 参数校验
        if (evaluationId == null || evaluationId <= 0) {
            throw new BusinessException("评价ID不能为空且必须大于0");
        }

        // 2. 检查评价是否存在
        Evaluation evaluation = this.getById(evaluationId);
        if (evaluation == null) {
            throw new BusinessException("评价不存在");
        }

        // 3. 删除评价
        return this.removeById(evaluationId);
    }

    @Override
    public IPage<EvaluationVO> getEvaluationPage(Integer current, Integer size,
                                             Integer userId, Integer productId,
                                             Integer minScore, Integer maxScore) {
        // 1. 创建分页对象
        Page<Evaluation> page = new Page<>(current, size);

        // 2. 构建查询条件
        LambdaQueryWrapper<Evaluation> queryWrapper = new LambdaQueryWrapper<>();

        // 2.1 按用户ID查询
        if (userId != null && userId > 0) {
            queryWrapper.eq(Evaluation::getUserId, userId);
        }

        // 2.2 按商品ID查询
        if (productId != null && productId > 0) {
            queryWrapper.eq(Evaluation::getProductId, productId);
        }

        // 2.3 按评分范围查询
        if (minScore != null && minScore >= 0) {
            queryWrapper.ge(Evaluation::getEvaluationScore, minScore);
        }
        if (maxScore != null && maxScore <= 10) {
            queryWrapper.le(Evaluation::getEvaluationScore, maxScore);
        }

        // 2.4 按评价时间倒序排序
        queryWrapper.orderByDesc(Evaluation::getEvaluationTime);

        // 3. 执行查询
        IPage<Evaluation> evaluationPage = this.page(page, queryWrapper);

        // 4. 获取评价列表
        List<Evaluation> evaluationList = evaluationPage.getRecords();
        if (evaluationList.isEmpty()) {
            return new Page<EvaluationVO>().setRecords(new ArrayList<>());
        }

        // 5. 获取用户ID和商品ID列表
        List<Integer> userIds = evaluationList.stream()
                .map(Evaluation::getUserId)
                .distinct()
                .collect(Collectors.toList());

        List<Integer> productIds = evaluationList.stream()
                .map(Evaluation::getProductId)
                .distinct()
                .collect(Collectors.toList());

        // 6. 批量查询用户和商品信息
        List<User> users = userService.listByIds(userIds);
        List<Product> products = productService.listByIds(productIds);

        // 7. 转换为Map，方便查找
        Map<Integer, User> userMap = users.stream()
                .collect(Collectors.toMap(User::getUserId, user -> user));

        Map<Integer, Product> productMap = products.stream()
                .collect(Collectors.toMap(Product::getProductId, product -> product));

        // 8. 转换为VO对象
        List<EvaluationVO> voList = evaluationList.stream().map(evaluation -> {
            EvaluationVO vo = new EvaluationVO();
            BeanUtils.copyProperties(evaluation, vo);

            // 设置用户信息
            User user = userMap.get(evaluation.getUserId());
            if (user != null) {
                vo.setUsername(user.getUsername());
                vo.setFullname(user.getFullname());
            }

            // 设置商品信息
            Product product = productMap.get(evaluation.getProductId());
            if (product != null) {
                vo.setProductName(product.getProductName());
                vo.setImageUrl(product.getImageUrl());
            }

            return vo;
        }).collect(Collectors.toList());

        // 9. 封装分页结果
        Page<EvaluationVO> voPage = new Page<>(current, size, evaluationPage.getTotal());
        voPage.setRecords(voList);

        return voPage;
    }
}
