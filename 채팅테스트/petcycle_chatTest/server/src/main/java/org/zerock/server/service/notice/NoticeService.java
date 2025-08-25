package org.zerock.server.service.notice;

import org.zerock.server.dto.notice.NoticeCreateDTO;
import org.zerock.server.dto.notice.NoticePageRequestDTO;
import org.zerock.server.dto.notice.NoticePageResponseDTO;
import org.zerock.server.dto.notice.NoticeResponseDTO;

import java.util.List;

public interface NoticeService {
    NoticePageResponseDTO<NoticeResponseDTO> getNoticeList(NoticePageRequestDTO requestDTO);

    List<NoticeResponseDTO> getPublishedNotices();

    NoticeResponseDTO getNotice(Long noticeId);

    NoticeResponseDTO createNotice(NoticeCreateDTO request, Long userId);

    NoticeResponseDTO updateNotice(Long noticeId, String title, String content, Long userId);

    void deleteNotice(Long noticeId, Long userId);
}
