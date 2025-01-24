package org.lt.commushop.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import springfox.documentation.builders.ApiInfoBuilder;
import springfox.documentation.builders.PathSelectors;
import springfox.documentation.builders.RequestHandlerSelectors;
import springfox.documentation.spi.DocumentationType;
import springfox.documentation.spring.web.plugins.ApiSelectorBuilder;
import springfox.documentation.spring.web.plugins.Docket;
import springfox.documentation.swagger2.annotations.EnableSwagger2WebMvc;
@Configuration
@EnableSwagger2WebMvc
public class Knife4jConfiguration {
    @Bean(value = "defaultApi2")
    public Docket defaultApi2(){
        Docket docket = new Docket(DocumentationType.SWAGGER_2) // 创建Docket实例，指定使用Swagger 2.0规范
                .apiInfo(new ApiInfoBuilder()// 设置API文档的基本信息
                        .title("CommuShop平台接口测试")// 设置API文档标题
                        .description("用以测试本平台后端系统的API") // 设置API文档描述
                        .termsOfServiceUrl("https://www.cnblogs.com/Hygge1024")// 设置服务条款URL
                        .contact("389133390@qq.com")// 设置联系方式
                        .version("1.0")// 设置API版本号
                        .build())// 构建ApiInfo对象
                .groupName("1.0X")// 设置API分组名称
                .select()// 开始配置扫描接口的规则
                .apis(RequestHandlerSelectors.basePackage("org.lt.commushop.controller"))// 指定扫描的包路径
                .paths(PathSelectors.any())// 表示扫描所有路径
                .build();// 构建Docket对象
        return docket;
    }
}
