package org.zerock.server.dto.board;

import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
public class BoardPostDTO {
    private Long postId;

    private Long userInfo;

    private String title;

    private String nickname;

    private String content;

    @Builder.Default
    private int viewCount = 0;

    @Builder.Default
    private boolean isDeleted = false;

    // BoardPostDTO에는 BoardCategory 객체 전체 대신 categoryName이라는 String 필드 쓰는 것이 적절
    // Why? 지연 로딩 프록시문제 : Spring Data JPA는 연관 관계를 기본적으로 지연 로딩(FetchType.LAZY)합니다. Post 엔티티를 조회할 때 Category는 실제 데이터가 아닌 프록시(Proxy) 객체로 존재하게 됩니다.
    // JSON 변환 오류 : BoardPostDTO를 클라이언트에게 보내기 위해 JSON으로 변환하는 과정에서, Jackson 라이브러리가 이 프록시 객체를 직렬화하는 방법을 몰라 InvalidDefinitionException 오류를 발생시킵니다.
    private String categoryName;

    // 파일 업로드
    // 업로드가 완료된 파일의 이름만 문자열로 저장한 리스트
    @Builder.Default
    private List<String> uploadFileNames = new ArrayList<>();

    // ✅ 첨부파일 PK + 파일명까지 내려주는 리스트 추가
    @Builder.Default
    private List<BoardAttachmentDTO> attachmentList = new ArrayList<>();

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
