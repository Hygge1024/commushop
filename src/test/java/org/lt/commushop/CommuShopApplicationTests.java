package org.lt.commushop;

import org.junit.jupiter.api.Test;
import org.lt.commushop.service.UtilsService.IndexShowService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class CommuShopApplicationTests {
    @Autowired
    private IndexShowService indexShowService;
    @Test
    void contextLoads() {
        System.out.println(indexShowService.getHomePage());
    }

}
