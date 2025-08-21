package org.zerock.server.repository.board;

import lombok.extern.log4j.Log4j2;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.zerock.server.domain.board.BoardCategory;
import org.zerock.server.domain.board.BoardPost;
import org.zerock.server.domain.user.UserInfo;
import org.zerock.server.repository.UserInfoRepository;

@SpringBootTest
@Log4j2
public class BoardRepositoryTests {

    @Autowired
    private BoardCategoryRepository boardCategoryRepository;

    @Autowired
    private BoardPostRepository boardPostRepository;

    @Autowired
    private UserInfoRepository userInfoRepository;

    // 카테고리 삽입
    @Test
    public void testInsertCategory(){
        BoardCategory category1 = BoardCategory.builder().categoryName("자유게시판").build();
        BoardCategory category2 = BoardCategory.builder().categoryName("정보공유게시판").build();
        BoardCategory category3 = BoardCategory.builder().categoryName("Q&A").build();

        boardCategoryRepository.save(category1);
        boardCategoryRepository.save(category2);
        boardCategoryRepository.save(category3);
    }

    @Test
    public void testInsertPost(){

        // 카테고리 선택
        BoardCategory category = boardCategoryRepository.findByCategoryName("Q&A")
                .orElseThrow(()-> new IllegalArgumentException("존재하지 않는 카테고리입니다."));

        // user 조회
        UserInfo existingUser = userInfoRepository.findByEmail("user00@email.com")
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 계정입니다."));


        // 게시글 등록
        BoardPost insertPostOne = BoardPost.builder()
                .category(category)
                .userInfo(existingUser)
                .title("첫 번째 글 테스트")
                .content("첫 번째 글 내용")
                .build();

        BoardPost saved = boardPostRepository.save(insertPostOne);

        log.info("게시글 저장 성공! User Email: {}, Post ID: {}", saved.getUserInfo().getEmail(), saved.getPostId());
    }
}
