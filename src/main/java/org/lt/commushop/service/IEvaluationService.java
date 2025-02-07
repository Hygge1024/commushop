package org.lt.commushop.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.service.IService;
import org.lt.commushop.domain.entity.Evaluation;
import org.lt.commushop.domain.vo.EvaluationVO;

/**
 * <p>
 * 商品评价服务接口
 * </p>
 *
 * @author tao
 * @since 2025-02-07
 */
public interface IEvaluationService extends IService<Evaluation> {
    
    /**
     * 添加商品评价
     *
     * @param evaluation 评价信息
     * @return 是否添加成功
     */
    boolean addEvaluation(Evaluation evaluation);
    
    /**
     * 校验评价参数
     *
     * @param evaluation 评价信息
     * @throws BusinessException 业务异常
     */
    void validateEvaluation(Evaluation evaluation);

    /**
     * 删除评价
     *
     * @param evaluationId 评价ID
     * @return 是否删除成功
     */
    boolean deleteEvaluation(Integer evaluationId);

    /**
     * 分页查询评价
     *
     * @param current 当前页码
     * @param size 每页大小
     * @param userId 用户ID（可选）
     * @param productId 商品ID（可选）
     * @param minScore 最低评分（可选）
     * @param maxScore 最高评分（可选）
     * @return 评价分页结果
     */
    IPage<EvaluationVO> getEvaluationPage(Integer current, Integer size,
                                         Integer userId, Integer productId,
                                         Integer minScore, Integer maxScore);
}
