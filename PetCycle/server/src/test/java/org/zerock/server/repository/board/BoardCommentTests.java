package org.zerock.server.repository.board;

import lombok.extern.log4j.Log4j2;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.zerock.server.domain.board.BoardComment;
import org.zerock.server.domain.board.BoardPost;
import org.zerock.server.domain.user.UserInfo;
import org.zerock.server.repository.UserInfoRepository;

@SpringBootTest
@Log4j2
public class BoardCommentTests {

    @Autowired
    private BoardCommentRepository boardCommentRepository;
    @Autowired
    private BoardPostRepository boardPostRepository;
    @Autowired
    private UserInfoRepository userInfoRepository;

    @Test
    public void testInsertComment(){
        // 게시글 조회
        BoardPost post = boardPostRepository.findById(1L)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 게시글입니다."));

        // 작성자 조회
        UserInfo user = userInfoRepository.findByEmail("user00@email.com")
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 유저입니다."));

        // 댓글 작성 (최상위댓글)
        BoardComment comment = BoardComment.builder()
                .post(post)
                .user(user)
                .content("첫번째 댓글 테스트")
                .build();

        BoardComment saved = boardCommentRepository.save(comment);
        log.info("댓글 저장 성공! ID: {}, 내용: {}, 작성자: {}", saved.getCommentId(), saved.getContent(), saved.getUser().getNickname());

    }

    @Test
    public void testInsertComment2(){
        // 게시글 조회
        BoardPost post = boardPostRepository.findById(1L)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 게시글입니다."));

        // 작성자 조회
        UserInfo user = userInfoRepository.findByEmail("user22@email.com")
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 작성자입니다."));

        // 부모 댓글 조회(최상위 댓글)
        BoardComment parentComment = boardCommentRepository.findById(3L)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 부모댓글입니다."));

        // 대댓글 작성
        BoardComment childrenComment = BoardComment.builder()
                .post(post)
                .user(user)
                .content("세번째 댓글 - 첫번째 대댓글 테스트")
                .build();

        // 부모댓글 + 자녀 댓글 연결 > depth 자동계산 (엔티티 메서드 활용)
        childrenComment.setParentComment(parentComment);

        BoardComment saved = boardCommentRepository.save(childrenComment);
        log.info("대댓글 저장 성공! ID: {}, 내용: {}, 작성자: {}, 부모ID: {}",
                saved.getCommentId(),
                saved.getContent(),
                saved.getUser().getNickname(),
                saved.getParentComment().getCommentId());

    }
}
