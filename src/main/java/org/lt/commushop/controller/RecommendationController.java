package org.lt.commushop.controller;

import org.lt.commushop.common.Result;
import org.lt.commushop.domain.entity.Product;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/recommend")
public class RecommendationController {
//    基于物品的协同过滤 + 基于内容的推荐 = 混合推荐（融合CF和CBR）
    @GetMapping("/{userId}")
    public Result<List<Product>> getRecommendations(@PathVariable Long userId) {
        return Result.success(null);
    }
}
