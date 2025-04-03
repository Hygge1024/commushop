package org.lt.commushop.domain.Hander;

import lombok.Data;

import java.util.HashMap;
import java.util.Map;

/**
 * 用户行为数据类
 */
@Data
public class UserBehaviorData {
    private Map<Integer, ProductBehavior> behaviors = new HashMap<>();

    public boolean isEmpty() {
        return behaviors.isEmpty();
    }
}
