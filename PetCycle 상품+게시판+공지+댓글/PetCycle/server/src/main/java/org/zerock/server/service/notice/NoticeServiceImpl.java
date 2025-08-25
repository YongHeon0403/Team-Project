package org.zerock.server.service.notice;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.zerock.server.domain.admin.Notice;
import org.zerock.server.domain.user.UserInfo;
import org.zerock.server.domain.user.UserRole;
import org.zerock.server.dto.notice.NoticeCreateDTO;
import org.zerock.server.dto.notice.NoticePageRequestDTO;
import org.zerock.server.dto.notice.NoticePageResponseDTO;
import org.zerock.server.dto.notice.NoticeResponseDTO;
import org.zerock.server.repository.notice.NoticeRepository;
import org.zerock.server.repository.user.UserInfoRepository;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NoticeServiceImpl implements NoticeService {
    private final NoticeRepository noticeRepository;
    private final UserInfoRepository userInfoRepository;

    //공지사항 목록 조회
    @Override
    public NoticePageResponseDTO<NoticeResponseDTO> getNoticeList(NoticePageRequestDTO requestDTO) {
        Pageable pageable = PageRequest.of(
                requestDTO.getPage() - 1,
                requestDTO.getSize(),
                Sort.by(Sort.Direction.DESC, "createdAt")
        );

        Page<Notice> result = noticeRepository.findAll(pageable);

        List<NoticeResponseDTO> dtoList = result.getContent()
                .stream()
                .map(notice -> new NoticeResponseDTO(
                        notice.getNoticeId(),
                        notice.getTitle(),
                        notice.getWriter().getNickname(),
                        notice.getCreatedAt(),
                        notice.getViewCount()
                ))
                .toList();

        return new NoticePageResponseDTO<>(
                dtoList,
                requestDTO.getPage(),
                requestDTO.getSize(),
                result.getTotalElements(),
                result.getTotalPages()
        );
    }

    // 공지사항 목록 최신순으로 조회
    @Override
    public List<NoticeResponseDTO> getPublishedNotices() {
        return noticeRepository.findByIsPublishedTrueOrderByCreatedAtDesc()
                .stream()
                .map(NoticeResponseDTO::new)
                .collect(Collectors.toList());
    }

    // 특정 ID의 공지사항 조회, 조회수 1씩 증가
    @Override
    @Transactional
    public NoticeResponseDTO getNotice(Long noticeId) {
        Notice notice = noticeRepository.findById(noticeId)
                .orElseThrow(() -> new IllegalArgumentException("공지사항을 찾을 수 없습니다."));

        notice.setViewCount(notice.getViewCount() + 1);

        return new NoticeResponseDTO(notice);
    }

    // 공지사항 등록
    @Override
    public NoticeResponseDTO createNotice(NoticeCreateDTO request, Long userId) {
        UserInfo user = userInfoRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        // MANAGER 또는 ADMIN 권한이 있는지 확인
        if (!user.getUserRoleList().contains(UserRole.MANAGER) && !user.getUserRoleList().contains(UserRole.ADMIN)) {
            throw new SecurityException("공지사항 작성 권한이 없습니다.");
        }

        Notice notice = Notice.builder()
                .title(request.getTitle())
                .content(request.getContent())
                .writer(user)
                .viewCount(0)
                .isPublished(true)
                .build();

        return new NoticeResponseDTO(noticeRepository.save(notice));
    }

    // 공지사항 수정
    // 작성자 본인 뿐만 아니라 MANAGER, ADMIN 사용자가 수정할 수 있게 구현
    @Override
    public NoticeResponseDTO updateNotice(Long noticeId, String title, String content, Long userId) {
        Notice notice = noticeRepository.findById(noticeId)
                .orElseThrow(() -> new IllegalArgumentException("공지사항이 없습니다."));

        UserInfo user = userInfoRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        // MANAGER 또는 ADMIN 권한이 있는지 확인
        boolean isAdminOrManager = user.getUserRoleList().contains(UserRole.ADMIN) || user.getUserRoleList().contains(UserRole.MANAGER);

        // 작성자 본인이 아니면서 관리자 역할도 없을 경우
        if (!notice.getWriter().getUserId().equals(userId) && !isAdminOrManager) {
            throw new SecurityException("공지사항 수정 권한이 없습니다.");
        }

        notice.setTitle(title);
        notice.setContent(content);

        return new NoticeResponseDTO(noticeRepository.save(notice));
    }

    // 공지사항 삭제
    @Override
    public void deleteNotice(Long noticeId, Long userId) {
        Notice notice = noticeRepository.findById(noticeId)
                .orElseThrow(() -> new IllegalArgumentException("공지사항이 없습니다."));

        UserInfo user = userInfoRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        // MANAGER 또는 ADMIN 권한이 있는지 확인
        boolean isAdminOrManager = user.getUserRoleList().contains(UserRole.ADMIN) || user.getUserRoleList().contains(UserRole.MANAGER);

        // 작성자 본인이 아니면서 관리자 역할도 없을 경우
        if (!notice.getWriter().getUserId().equals(userId) && !isAdminOrManager) {
            throw new SecurityException("공지사항 삭제 권한이 없습니다.");
        }

        noticeRepository.delete(notice);
    }
}
