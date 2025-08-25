package org.zerock.server.dto.board;

import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class BoardCommentDTO {

    private Long commentId;
    private Long postId;
    private Long parentId;
    private int depth;
    private String nickname;
    private String content;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt; // 추가: 댓글 수정일
    private boolean isDeleted;   // 추가: 삭제 여부

    // 대댓글 목록 (자식 댓글들을 담을 필드)
    private List<BoardCommentDTO> children;
}
