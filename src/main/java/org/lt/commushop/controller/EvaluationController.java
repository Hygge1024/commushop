package org.lt.commushop.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiParam;
import org.lt.commushop.common.Result;
import org.lt.commushop.domain.entity.Evaluation;
import org.lt.commushop.domain.vo.EvaluationVO;
import org.lt.commushop.service.IEvaluationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

/**
 * <p>
 * 商品评价控制器
 * </p>
 *
 * @author tao
 * @since 2025-02-07
 */
@Api(tags = "商品评价模块")
@RestController
@RequestMapping("/evaluation")
public class EvaluationController {
    
    @Autowired
    private IEvaluationService evaluationService;
    
    @ApiOperation(value = "添加商品评价", notes = "用户对已购买的商品进行评价")
    @PostMapping("/add")
    public Result<Boolean> addEvaluation(@RequestBody Evaluation evaluation) {
        // 添加评价
        boolean success = evaluationService.addEvaluation(evaluation);
        
        // 返回结果
        return success ? Result.success(true, "评价成功") : Result.error("评价失败");
    }

    @ApiOperation(value = "删除商品评价", notes = "根据评价ID删除评价")
    @DeleteMapping("/{evaluationId}")
    public Result<Boolean> deleteEvaluation(
            @ApiParam(value = "评价ID", required = true)
            @PathVariable Integer evaluationId) {
        
        // 删除评价
        boolean success = evaluationService.deleteEvaluation(evaluationId);
        
        // 返回结果
        return success ? Result.success(true, "删除成功") : Result.error("删除失败");
    }

    @ApiOperation(value = "分页查询评价", notes = "支持按用户ID、商品ID、评分范围查询")
    @GetMapping("/page")
    public Result<IPage<EvaluationVO>> getEvaluationPage(
            @ApiParam(value = "当前页码", defaultValue = "1") 
            @RequestParam(defaultValue = "1") Integer current,
            @ApiParam(value = "每页大小", defaultValue = "10") 
            @RequestParam(defaultValue = "10") Integer size,
            @ApiParam(value = "用户ID") 
            @RequestParam(required = false) Integer userId,
            @ApiParam(value = "商品ID") 
            @RequestParam(required = false) Integer productId,
            @ApiParam(value = "最低评分", example = "0") 
            @RequestParam(required = false) Integer minScore,
            @ApiParam(value = "最高评分", example = "10") 
            @RequestParam(required = false) Integer maxScore) {
        
        // 执行分页查询
        IPage<EvaluationVO> page = evaluationService.getEvaluationPage(
                current, size, userId, productId, minScore, maxScore);
        
        // 返回结果
        return Result.success(page);
    }
}
