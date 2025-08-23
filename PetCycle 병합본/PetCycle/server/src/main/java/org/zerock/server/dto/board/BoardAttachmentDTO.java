package org.zerock.server.dto.board;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class BoardAttachmentDTO {
    private Long attachmentId; // DB PK
    private String fileName;   // 파일명
}
