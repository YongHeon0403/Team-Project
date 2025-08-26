package org.zerock.server.util;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import net.coobird.thumbnailator.Thumbnails;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Component
@Log4j2
@RequiredArgsConstructor
public class CustomFileUtil {
    // 업로드 경로
    @Value("${org.zerock.upload.path}")
    private String uploadPath;

    // 의존성 주입 완료된 직후, 빈이 서비스에 사용되기 전에 특정 메서드를 실행하도록 표시
    @PostConstruct
    public void init(){
        // (폴더가 없다면) 서버가 실행될 때 uploadPath 경로에 폴더를 만듦
        File tempFolder = new File(uploadPath);

        if (tempFolder.exists() == false){
            tempFolder.mkdir();         // n초 뒤에 폴더 생성
        }

        uploadPath = tempFolder.getAbsolutePath();

        log.info("======================================");
        log.info(uploadPath);
    }


    // 파일 업로드
    public List<String> saveFiles(List<MultipartFile> files) throws RuntimeException{

        // 업로드 파일이 없거나 비어있는경우 비어있는 리스트 반환
        if (files == null || files.size() == 0){
            return List.of();
        }

        List<String> uploadNames = new ArrayList<>();

        for (MultipartFile multipartFile : files){
            // 중복 방지 위해 UUID.randomUUId() 사용
            String savedName = UUID.randomUUID().toString() + "_" + multipartFile.getOriginalFilename();

            // 문자열 경로들을 결합헤서 Path 객체 (완전한 파일 경로) 생성
            Path savePath = Paths.get(uploadPath, savedName);

            try{
                Files.copy(multipartFile.getInputStream(), savePath);

                String contentType = multipartFile.getContentType();

                // 이미지 업도르
                if (contentType != null && contentType.startsWith("image")){
                    Path thumbnailPath = Paths.get(uploadPath, "s_" + savedName);

                    Thumbnails.of(savePath.toFile())
                            .size(200, 200)
                            .toFile(thumbnailPath.toFile());
                } // 영상 업로드
                else if (contentType != null && contentType.startsWith("video")){
                    // 따로 후처리 당장은 필요 없어서 일단 비워뒀습니다.
                    // 영상 썸네일 처리는 리액트에서 할 예정.
                }
                uploadNames.add(savedName);
            } catch (IOException e){
                throw new RuntimeException(e.getMessage());
            }
        }
        return uploadNames;
    }

    // 특정 파일 조회할 때 사용
    public ResponseEntity<Resource> getFile(String fileName){
        Resource resource = new FileSystemResource(uploadPath + File.separator + fileName);

        // 파일을 읽을 수 없다면(= 존재하지 않는다면)
        if (!resource.isReadable()) {
            log.warn("파일을 찾을 수 없거나 읽을 수 없습니다 : " + fileName);

            // 404 Not Found 반환
            return ResponseEntity.notFound().build();
        }

        HttpHeaders headers = new HttpHeaders();

        try{
            // 파일 종류마다 다르게 Content-Type의 값을 생성해야 함
            // Files.probeContentType으로 헤더 생성
            headers.add("Content-Type",
                    Files.probeContentType(resource.getFile().toPath()));
        } catch (Exception e){
            return ResponseEntity.internalServerError().build();
        }

        return ResponseEntity.ok().headers(headers).body(resource);
    }

    // 파일 삭제
    public void deleteFiles(List<String> fileNames){
        if (fileNames == null || fileNames.size() == 0) {
            return;
        }

        fileNames.forEach(fileName -> {
            // 썸네일 있는지 확인하고 삭제
            String thumbnailFileName = "s_" + fileName;
            Path thumbnailPath = Paths.get(uploadPath, thumbnailFileName);

            // Path 객체 생성
            Path filePath = Paths.get(uploadPath, fileName);

            try{
                // 파일 존재 : 삭제하고 true 반환 / 파일 존재 x : false 반환
                Files.deleteIfExists(filePath);

                // 썸네일 파일 삭제 (이미지 경우만 존재)
                Files.deleteIfExists(thumbnailPath);
            }catch (IOException e){
                throw new RuntimeException("파일 삭제 중 오류 발생: " + e.getMessage());
            }
        });
    }

    // 파일 타입
    public String getFileType(String fileName){
        if (fileName == null || !fileName.contains(".")){
            return "other"; // 확장자가 없으면 other 로 간주
        }

        // .toLowerCase() 사용하여 확장자 정확하게 추출 > 소문자로 변환 (대소문자 관계없이 처리)
        String extension = fileName.substring(fileName.lastIndexOf(".")+1).toLowerCase();

        if (extension.equals("jpg") || extension.equals("jpeg") || extension.equals("png") || extension.equals("gif") || extension.equals("bmp")) {
            return "image";
        } else if (extension.equals("mp4") || extension.equals("avi") || extension.equals("mov") || extension.equals("webm")) {
            return "video";
        } else if (extension.equals("pdf") || extension.equals("doc") || extension.equals("docx") || extension.equals("txt")) {
            return "document";
        }
        return "other";
    }
}
