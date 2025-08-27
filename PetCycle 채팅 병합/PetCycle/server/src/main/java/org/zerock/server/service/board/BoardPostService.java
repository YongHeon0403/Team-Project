package org.zerock.server.service.board;

import org.zerock.server.dto.board.BoardPostDTO;
import org.zerock.server.dto.board.PageRequestDTO;
import org.zerock.server.dto.board.PageResponseDTO;

public interface BoardPostService {

    // 등록 + 작성자 연결
    Long register(BoardPostDTO boardPostDTO, Long userId);

    // 조회 - 로그인 없이도 조회가능
    BoardPostDTO get(Long postId);

    // 수정 - userId 받아 본인인지 확인 필요
    void modify(Long postId, BoardPostDTO boardPostDTO, Long userId);

    //게시글 삭제 - userId 받아 본인인지 확인 필요
    void remove(Long postId, Long userId);

    // 페이징 처리
    PageResponseDTO<BoardPostDTO> list (PageRequestDTO pageRequestDTO);

    // 업로드 파일만 삭제 - userId 받아 본인인지 확인 필요
    void removeAttachment(Long postId, Long attachmentId, Long userId);

}
