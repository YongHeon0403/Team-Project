package org.zerock.server.controller.notice;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.zerock.server.dto.user.UserInfoDTO;
import org.zerock.server.dto.notice.NoticeCreateDTO;
import org.zerock.server.dto.notice.NoticePageRequestDTO;
import org.zerock.server.dto.notice.NoticePageResponseDTO;
import org.zerock.server.dto.notice.NoticeResponseDTO;
import org.zerock.server.service.notice.NoticeService;

@RestController
@RequestMapping("/api/notices")
// * 수정 *
// 클래스 레벨 매핑을 전체 API가 /api/* 을 사용하고 있어서 notice도 /api/notices로 변경.
@RequiredArgsConstructor
@Log4j2
public class NoticeController {
    private final NoticeService noticeService;

    // 공지사항 목록 조회
    @GetMapping({"", "/", "/list"})
    public ResponseEntity<NoticePageResponseDTO<NoticeResponseDTO>> list(NoticePageRequestDTO requestDTO) {
        log.info("공지사항 목록 조회: " + requestDTO);
        return ResponseEntity.ok(noticeService.getNoticeList(requestDTO));
    }

    // 특정 공지사항 조회
    @GetMapping("/{id}")
    public ResponseEntity<NoticeResponseDTO> getNotice(@PathVariable Long id) {
        log.info("특정 공지사항 조회: " + id);
        return ResponseEntity.ok(noticeService.getNotice(id));
    }

     // 공지사항 등록
//     @PostMapping
//     public ResponseEntity<String> createNotice(
//             @Valid @RequestBody NoticeCreateDTO request
//     ) {
//         Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
//
//         // Principal 객체를 UserInfoDTO로 형변환
//         Object principal = authentication.getPrincipal();
//
//         // principal이 UserInfoDTO의 인스턴스인지 확인
//         if (principal instanceof UserInfoDTO) {
//             UserInfoDTO userInfoDTO = (UserInfoDTO) principal;
//             Long userId = userInfoDTO.getUserId(); // UserInfoDTO에서 userId를 가져옴
//
//             log.info("공지사항 등록 요청: " + request + ", 사용자 ID: " + userId);
//             noticeService.createNotice(request, userId);
//             return ResponseEntity.ok("공지사항 등록 완료");
//         }
//
//         return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인 정보가 유효하지 않습니다.");
//     }

    // 공지사항 등록 Long 타입에서 UserInfoDTO로 변환
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    @PostMapping
    public ResponseEntity<String> createNotice(
            @Valid @RequestBody NoticeCreateDTO request
    ) {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            UserInfoDTO userInfo = (UserInfoDTO) authentication.getPrincipal();

            log.info("공지사항 등록 요청: " + request + ", 사용자 ID: " + userInfo.getUserId());

            noticeService.createNotice(request, userInfo.getUserId());

            return ResponseEntity.ok("공지사항 등록 완료");
    }

    // 특정 공지사항 수정
//    @PutMapping("/{id}")
//    public ResponseEntity<?> updateNotice(
//            @PathVariable Long id,
//            @Valid @RequestBody NoticeCreateDTO request
//    ) {
//        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
//        Object principal = authentication.getPrincipal();
//
//        // principal이 UserInfoDTO의 인스턴스인지 확인
//        if (principal instanceof UserInfoDTO) {
//            UserInfoDTO userInfoDTO = (UserInfoDTO) principal;
//            Long userId = userInfoDTO.getUserId();
//
//            log.info("공지사항 수정 요청 ID: " + id + ", 사용자 ID: " + userId);
//            NoticeResponseDTO updatedNotice = noticeService.updateNotice(
//                    id,
//                    request.getTitle(),
//                    request.getContent(),
//                    userId
//            );
//            return ResponseEntity.ok(updatedNotice);
//        }
//        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인 정보가 유효하지 않습니다.");
//    }

    // 공지사항 수정 Long 타입에서 UserInfoDTO로 변환
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<NoticeResponseDTO> updateNotice(
            @PathVariable Long id,
            @Valid @RequestBody NoticeCreateDTO request
    ) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserInfoDTO userInfo = (UserInfoDTO) authentication.getPrincipal();

        log.info("공지사항 수정 요청 ID: " + id + ", 사용자 ID: " + userInfo.getUserId());
        NoticeResponseDTO updatedNotice = noticeService.updateNotice(
                id,
                request.getTitle(),
                request.getContent(),
                userInfo.getUserId()
        );
        return ResponseEntity.ok(updatedNotice);
    }

    // 특정 공지사항 삭제
//    @DeleteMapping("/{id}")
//    public ResponseEntity<Void> deleteNotice(
//            @PathVariable Long id
//    ) {
//        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
//        Object principal = authentication.getPrincipal();
//
//        // principal이 UserInfoDTO의 인스턴스인지 확인
//        if (principal instanceof UserInfoDTO) {
//            UserInfoDTO userInfoDTO = (UserInfoDTO) principal;
//            Long userId = userInfoDTO.getUserId();
//
//            log.info("공지사항 삭제 요청 ID: " + id + ", 사용자 ID: " + userId);
//            noticeService.deleteNotice(id, userId);
//            return ResponseEntity.noContent().build();
//        }
//        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
//    }

    // 공지사항 삭제 Long 타입에서 UserInfoDTO로 변환
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNotice(
            @PathVariable Long id
    ) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserInfoDTO userInfo = (UserInfoDTO) authentication.getPrincipal();

        log.info("공지사항 삭제 요청 ID: " + id + ", 사용자 ID: " + userInfo.getUserId());
        noticeService.deleteNotice(id, userInfo.getUserId());

        return ResponseEntity.noContent().build();
    }
}