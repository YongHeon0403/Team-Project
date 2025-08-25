package org.zerock.server.controller.board;


import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.zerock.server.dto.user.UserInfoDTO;
import org.zerock.server.dto.board.BoardPostDTO;
import org.zerock.server.dto.board.PageRequestDTO;
import org.zerock.server.dto.board.PageResponseDTO;
import org.zerock.server.service.board.BoardPostService;
import org.zerock.server.util.CustomFileUtil;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequiredArgsConstructor
@Log4j2
@RequestMapping("/api/board")
public class BoardPostController {

    private final BoardPostService boardPostService;
    private final CustomFileUtil customFileUtil;

    // 게시글 단일 조회
    @GetMapping("/{postId}")
    public ResponseEntity<BoardPostDTO> get(@PathVariable(name = "postId") Long postId) {
        log.info("READ.......................................");

        try{
            BoardPostDTO boardPostDTO = boardPostService.get(postId);
            return ResponseEntity.ok(boardPostDTO);
        } catch (IllegalArgumentException e){
            log.warn("게시글을 찾을 수 없거나 삭제되었습니다: " + e.getMessage());
            return ResponseEntity.notFound().build();
        } catch (Exception e){
            log.error("게시글 조회 중 오류 발생: " + e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    // 특정 파일 조회
    @GetMapping("/files/view/{fileName:.+}")
    public ResponseEntity<Resource> viewFileGet(@PathVariable String fileName) {
        return customFileUtil.getFile(fileName);
    }

    // 게시글 목록 조회
    @GetMapping("/list")
    // @ModelAttribute는 GET 요청의 쿼리 파라미터를 DTO 객체로 깔끔하게 변환해주는 역할
    public PageResponseDTO<BoardPostDTO> list (@ModelAttribute PageRequestDTO pageRequestDTO){
        log.info("LIST: " + pageRequestDTO);

        return boardPostService.list(pageRequestDTO);
    }

    // 게시글 등록 + 파일 업로드 포함
    @PostMapping("/")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Long>> register(
            @RequestPart("boardPostDTO") BoardPostDTO boardPostDTO,  // 게시글 내용은 JSON 형태로 받음
            @RequestPart(value = "files", required = false) List<MultipartFile> files, // 파일 리스트를 받음 (필수 아님)
            @AuthenticationPrincipal UserInfoDTO userInfoDTO){

        log.info("게시글 등록 요청: " + boardPostDTO);
        log.info("요청 사용자 ID (JWT에서 추출): " + userInfoDTO.getUserId());
        log.info("업로드된 파일 수: " + (files != null ? files.size() : 0));


        try{
            // 1. 파일 시스템에 파일 저장하고 파일 이름 목록을 가져옴
            List<String> uploadFileNames = new ArrayList<>();
            if (files != null && !files.isEmpty()) {
                uploadFileNames = customFileUtil.saveFiles(files);
                log.info("실제 업로드된 파일 이름들: " + uploadFileNames);
            }

            // 2. DTO에 업로드된 파일 이름 목록 설정
            boardPostDTO.setUploadFileNames(uploadFileNames);

            // 3. 서비스 계층으로 게시글 DTO와 사용자 ID 전달
            Long postId = boardPostService.register(boardPostDTO, userInfoDTO.getUserId());

            return ResponseEntity.ok(Map.of("postId", postId));
        }catch (IllegalArgumentException e){
            log.warn("게시글 등록 실패 (클라이언트 오류): " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", -1L));
        }catch (Exception e){
            log.error("게시글 등록 중 서버 오류 발생: " + e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    // 게시글 삭제기능
    @PreAuthorize("isAuthenticated()")
    @DeleteMapping("/{postId}")
    public ResponseEntity<Map<String, String>> remove(
            @PathVariable("postId") Long postId,
            @AuthenticationPrincipal UserInfoDTO userInfoDTO){

        log.info("게시글 삭제 요청: 게시글 ID = {}, 요청 사용자 ID = {}", postId, userInfoDTO.getUserId());

        try {
            // boardPostService의 remove 메서드는 postId와 userId를 두 번째 인자로 받습니다.
            boardPostService.remove(postId, userInfoDTO.getUserId());

            return ResponseEntity.ok(Map.of("message", "게시글이 성공적으로 삭제되었습니다.")); // 성공 메시지를 Map으로 반환
        } catch (IllegalArgumentException e) {
            // 게시글을 찾을 수 없거나, 이미 삭제되었거나, 권한이 없는 경우
            log.warn("게시글 삭제 실패 (클라이언트 오류): " + e.getMessage());
            // 클라이언트에게 좀 더 명확한 메시지를 전달하기 위해 Map 형태로 반환
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            // 예상치 못한 서버 오류 발생 시
            log.error("게시글 삭제 중 서버 오류 발생: " + e.getMessage(), e);
            // 서버 오류 시에도 Map 형태로 메시지 반환
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "서버 내부 오류가 발생했습니다."));
        }
    }

    // 첨부파일 개별 삭제
    @PreAuthorize("isAuthenticated()")
    @DeleteMapping("/files/{postId}/{attachmentId}")
    public ResponseEntity<Map<String, String>> removeAttachment(
            @PathVariable("postId") Long postId,
            @PathVariable("attachmentId") Long attachmentId,
            @AuthenticationPrincipal UserInfoDTO userInfoDTO){

        log.info("첨부파일 삭제 요청: 게시글 ID = {}, 첨부파일 ID = {}, 요청 사용자 ID = {}",
                postId, attachmentId, userInfoDTO.getUserId());

        try {
            // 서비스 계층에서 첨부파일 삭제 로직 처리. 권한 검증 및 파일 시스템 삭제 포함.
            boardPostService.removeAttachment(postId, attachmentId, userInfoDTO.getUserId());
            return ResponseEntity.ok(Map.of("message", "첨부파일이 성공적으로 삭제되었습니다."));
        } catch (IllegalArgumentException e) {
            log.warn("첨부파일 삭제 실패 (클라이언트 오류): " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("첨부파일 삭제 중 서버 오류 발생: " + e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "서버 내부 오류가 발생했습니다."));
        }
    }

    // 게시글 수정 : 글 내용(JSON)과 파일(multipart)을 한 번에 받음
    @PutMapping("/{postId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, String>> modify(
            @PathVariable Long postId,
            @RequestPart("boardPostDTO") BoardPostDTO boardPostDTO,
            @RequestPart(value = "files", required = false) List<MultipartFile> files,
            @AuthenticationPrincipal UserInfoDTO userInfoDTO) {

        boardPostDTO.setPostId(postId);
        log.info("MODIFY: " + boardPostDTO);

        try {
            // --- 새로 업로드된 파일 저장 ---
            List<String> newlyUploadedFileNames = (files != null && !files.isEmpty())
                    ? customFileUtil.saveFiles(files)
                    : new ArrayList<>();

            // --- 기존 DTO 파일 목록 + 새로 업로드된 파일 합치기 ---
            List<String> finalUploadedFileNames = new ArrayList<>();
            if (boardPostDTO.getUploadFileNames() != null) {
                finalUploadedFileNames.addAll(boardPostDTO.getUploadFileNames());
            }
            finalUploadedFileNames.addAll(newlyUploadedFileNames);
            boardPostDTO.setUploadFileNames(finalUploadedFileNames);

            // --- 기존 DB 파일 목록 가져오기 ---
            BoardPostDTO oldBoardPostDTO = boardPostService.get(postId);
            List<String> oldFileNamesInDb = oldBoardPostDTO.getUploadFileNames();

            // --- 서비스 호출 (DB 수정) ---
            boardPostService.modify(postId, boardPostDTO, userInfoDTO.getUserId());

            // --- 서버에서 삭제할 파일 처리 ---
            if (oldFileNamesInDb != null && !oldFileNamesInDb.isEmpty()) {
                List<String> filesToDeleteFromServer = oldFileNamesInDb.stream()
                        .filter(fileName -> !finalUploadedFileNames.contains(fileName))
                        .collect(Collectors.toList());
                if (!filesToDeleteFromServer.isEmpty()) {
                    customFileUtil.deleteFiles(filesToDeleteFromServer);
                    log.info("서버에서 삭제된 파일들: " + filesToDeleteFromServer);
                }
            }

            return ResponseEntity.ok(Map.of("RESULT", "SUCCESS"));

        } catch (IllegalArgumentException e){
            log.warn("게시글 수정 실패 (게시글 없음): " + postId + ", " + e.getMessage());
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("게시글 수정 중 오류 발생: " + e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }


}
