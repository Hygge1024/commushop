package org.lt.commushop.common;


import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.lt.commushop.domain.entity.Category;
import org.springframework.core.convert.converter.Converter;
import org.springframework.stereotype.Component;

import java.util.List;
/**
 * 将字符串转换为Category列表
 */

@Component
public class StringToCategoryListConverter implements Converter<String, List<Category>> {

    private final ObjectMapper objectMapper = new ObjectMapper();// 使用Jackson库进行JSON转换

    @Override
    public List<Category> convert(String source) {// 将字符串转换为Category列表
        try {
            return objectMapper.readValue(source, new TypeReference<List<Category>>() {});// 
        } catch (Exception e) {
            throw new IllegalArgumentException("Invalid category format: " + source, e);
        }
    }
}
