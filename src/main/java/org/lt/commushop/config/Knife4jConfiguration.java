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
        Docket docket = new Docket(DocumentationType.SWAGGER_2)
                .apiInfo(new ApiInfoBuilder()
                        .title("CommuShop平台接口测试")
                        .description("用以测试本平台后端系统的API")
                        .termsOfServiceUrl("https://www.cnblogs.com/Hygge1024")
                        .contact("389133390@qq.com")
                        .version("1.0")
                        .build())
                .groupName("1.0X")
                .select()
                .apis(RequestHandlerSelectors.basePackage("org.lt.commushop.controller"))
                .paths(PathSelectors.any())
                .build();
        return docket;
    }
}
