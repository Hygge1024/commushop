package org.lt.commushop.service.UtilsService;

import cn.hutool.core.util.IdUtil;
import com.baomidou.mybatisplus.core.toolkit.StringUtils;
import io.minio.*;
import io.minio.http.Method;
import lombok.Getter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.TimeUnit;

@Service
@Slf4j
public class MinioService {
    @Autowired
    private MinioClient minioClient;
    /**
     * -- GETTER --
     *  获取Minio的bucketName
     *
     * @return
     */
    @Getter
    @Value("${minio.bucketName}")
    private String bucketName;
    /**
     * -- GETTER --
     *  获取Minio的endpoint和bucketName
     *
     * @return
     */
    @Getter
    @Value("${minio.endpoint}")
    private String endpoint;

    public String uploadFile(MultipartFile file) {
        String originalFilename = file.getOriginalFilename();
        if (StringUtils.isBlank(originalFilename)) {
            throw new RuntimeException("文件名不能为空");
        }

        try {
            // 生成唯一文件名
            String extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            String fileName = "product/" + IdUtil.getSnowflake().nextIdStr() + extension;//这里Product是文件夹（代表商品图片的存放位置）

            // 上传文件
            try (InputStream inputStream = file.getInputStream()) {
                PutObjectArgs objectArgs = PutObjectArgs.builder()
                        .bucket(bucketName)
                        .object(fileName)
                        .stream(inputStream, file.getSize(), -1)
                        .contentType(file.getContentType())
                        .build();
                minioClient.putObject(objectArgs);
            }

            // 组装完整URL
            String url = String.format("%s/%s/%s", endpoint, bucketName, fileName);
            log.info("文件上传成功，访问URL: {}", url);
            return url;

        } catch (Exception e) {
            log.error("文件上传失败", e);
            throw new RuntimeException("文件上传失败: " + e.getMessage());
        }
    }

    // 新增方法：获取文件访问URL
    public String getFileUrl(String fileName) {
        try {
            return endpoint + "/" + bucketName + "/" + fileName;
        } catch (Exception e) {
            log.error("获取文件URL失败", e);
            throw new RuntimeException("获取文件URL失败: " + e.getMessage());
        }
    }
    /**
     * 删除文件
     *
     * @param objectName 对象名称
     */
    public void deleteFile(String objectName) {
        try {
            RemoveObjectArgs removeObjectArgs = RemoveObjectArgs.builder()
                    .bucket(bucketName)
                    .object(objectName)
                    .build();
            minioClient.removeObject(removeObjectArgs);
            log.info("文件删除成功，objectName: {}", objectName);
        } catch (Exception e) {
            log.error("文件删除失败，objectName: {}", objectName, e);
            throw new RuntimeException("文件删除失败: " + e.getMessage());
        }
    }

}
