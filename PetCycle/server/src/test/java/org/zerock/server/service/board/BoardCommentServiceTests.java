package org.zerock.server.service.board;

import lombok.extern.log4j.Log4j2;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.zerock.server.domain.board.BoardComment;
import org.zerock.server.domain.user.UserInfo;
import org.zerock.server.dto.board.BoardCommentDTO;
import org.zerock.server.dto.board.CommentPageDTO;
import org.zerock.server.dto.board.PageRequestDTO;
import org.zerock.server.dto.board.PageResponseDTO;
import org.zerock.server.repository.UserInfoRepository;
import org.zerock.server.repository.board.BoardCommentRepository;
import org.zerock.server.repository.board.BoardPostRepository;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
@Log4j2
public class BoardCommentServiceTests {

    @Autowired
    private BoardCommentService boardCommentService;
    @Autowired
    private BoardPostRepository boardPostRepository;
    @Autowired
    private UserInfoRepository userInfoRepository;
    @Autowired
    private BoardCommentRepository boardCommentRepository;

    @Test
    public void testInsertParentComment(){

        // 존재하는 ID들
        Long postId = 2L;
        Long userId = 1L;

        // 댓글 등록

        BoardCommentDTO commentDTO = BoardCommentDTO.builder()
                .postId(postId)
                .content("부모댓글 서비스 테스트")
                .build();

        Long savedCommentId = boardCommentService.register(commentDTO, userId);

        log.info("등록된 댓글 ID: " + savedCommentId);

    }

    @Test
    public void testInsertChildComment(){
        Long postId = 2L;
        Long userId = 2L;
        Long parentCommentId = 9L;

        BoardCommentDTO commentDTO = BoardCommentDTO.builder()
                .postId(postId)
                .parentId(parentCommentId)
                .content("대댓글 서비스 테스트2")
                .build();

        Long savedCommentId = boardCommentService.register(commentDTO, userId);

        log.info("등록된 대댓글 ID: " + savedCommentId);

    }

//    @Test
//    // 대댓글의 대댓글 작성 제한 테스트
//    public void testNotRegisterComment(){
//        Long postId = 2L;
//        Long userId = 2L;
//        Long parentCommentId = 12L;
//
//        BoardCommentDTO commentDTO = BoardCommentDTO.builder()
//                .postId(postId)
//                .parentId(parentCommentId)
//                .content("댓글 제한 테스트")
//                .build();
//
//        Long savedCommentId = boardCommentService.register(commentDTO, userId);
//    }


    @Test
    public void testDeleteParentComment(){
        // 존재하는 부모 댓글 , 해당 댓글 작성자
        Long parentCommentId = 1L;
        Long userId = 1L;

        // 삭제 실행
        boardCommentService.removeComment(parentCommentId, userId);

        // 검증
        BoardComment deletedParent = boardCommentRepository.findById(parentCommentId)
                .orElseThrow(() -> new IllegalArgumentException("삭제된 댓글을 찾을 수 없습니다."));

        log.info("부모 댓글 삭제 여부: " + deletedParent.isDeleted());

        List<BoardComment> childComments = boardCommentRepository
                .findByParentCommentAndIsDeletedFalseOrderByCreatedAtAsc(deletedParent);

        log.info("삭제 후 남아있는 자식 댓글 개수: " + childComments.size());
    }


    @Test
    public void testDeleteChildComment(){
        // 대댓글 ID (depth = 1인 댓글)
        Long childCommentId = 13L;
        Long userId = 2L;

        // 삭제 실행
        boardCommentService.removeComment(childCommentId, userId);

    }

    // 게시글 당 총 댓글 개수 테스트
    @Test
    void testTotalCommentCount() {
        Long postId = 2L;

        Long totalCount = boardCommentService.getTotalCommentCount(postId);

        log.info("게시글 총 댓글 수 (부모+대댓글): {}", totalCount);

        assertTrue(totalCount >= 0);
    }

    @Test
    void testGetParentCommentsWithPaging() {
        Long postId = 2L;
        int page = 0;  // 0부터 시작
        int size = 5;  // 한 페이지에 5개씩

        CommentPageDTO commentPageDTO = boardCommentService.getParentCommentsWithPaging(postId, page, size);

        log.info("페이지 번호: {}", commentPageDTO.getPage());
        log.info("페이지 사이즈: {}", commentPageDTO.getSize());
        log.info("총 부모 댓글 수: {}", commentPageDTO.getTotalElements());
        log.info("총 페이지 수: {}", commentPageDTO.getTotalPages());
        log.info("부모 댓글 리스트 크기: {}", commentPageDTO.getParentComments().size());

        for (BoardCommentDTO parent : commentPageDTO.getParentComments()) {
            log.info("부모 댓글 ID: {}, 내용: {}", parent.getCommentId(), parent.getContent());
            log.info("자식 댓글 개수: {}", parent.getChildren().size());

            for (BoardCommentDTO child : parent.getChildren()) {
                log.info("    대댓글 ID: {}, 내용: {}", child.getCommentId(), child.getContent());
            }
        }

        // 검증 예시
        assertTrue(commentPageDTO.getParentComments().size() <= size, "페이지당 부모 댓글 개수 확인");
        assertTrue(commentPageDTO.getTotalElements() >= 0, "총 부모 댓글 개수 확인");
    }

    @Test
    void testUpdateComment() {
        // 사용자 요청 commentId = 17, userId = 1
        Long commentId = 17L; // 수정할 댓글 ID
        Long userId = 1L;     // 댓글 작성자 ID (권한 확인용)
        String updatedContent = "댓글 수정 서비스 테스트 완료!"; // 수정할 새로운 내용

        log.info("댓글 수정 테스트 시작");
        log.info("수정 요청 댓글 ID: {}, 요청 사용자 ID: {}, 새로운 내용: {}", commentId, userId, updatedContent);

        // 댓글 수정 서비스 호출
        boardCommentService.updateComment(commentId, userId, updatedContent);

        // 수정된 댓글을 DB에서 다시 조회하여 검증
        BoardComment updatedComment = boardCommentRepository.findById(commentId)
                .orElseThrow(() -> new IllegalArgumentException("수정된 댓글을 찾을 수 없습니다. Comment ID: " + commentId));

        // 내용이 올바르게 수정되었는지 검증
        assertEquals(updatedContent, updatedComment.getContent(), "댓글 내용이 올바르게 수정되지 않았습니다.");
        log.info("댓글 ID {}의 내용이 성공적으로 수정되었습니다. 새로운 내용: {}", commentId, updatedComment.getContent());
    }



}
