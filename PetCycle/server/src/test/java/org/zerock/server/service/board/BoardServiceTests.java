package org.zerock.server.service.board;

import lombok.extern.log4j.Log4j2;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.zerock.server.dto.board.BoardPostDTO;
import org.zerock.server.repository.UserInfoRepository;
import org.zerock.server.repository.board.BoardCategoryRepository;
import org.zerock.server.repository.board.BoardPostRepository;

@SpringBootTest
@Log4j2
public class BoardServiceTests {
    @Autowired
    private BoardPostService boardPostService;
    @Autowired
    private BoardCategoryRepository boardCategoryRepository;
    @Autowired
    private BoardPostRepository boardPostRepository;
    @Autowired
    private UserInfoRepository userInfoRepository;

    @Test
    public void testRegister(){
        log.info("=======================REGISTER TEST START=======================");

        // 미리 존재하는 사용자, 카테고리
        Long testUserId = 7L;
        String category = "자유게시판";

        BoardPostDTO boardPostDTO = BoardPostDTO.builder()
                .categoryName(category)
                .title("서비스 테스트")
                .content("서비스 테스트 content")
                .build();

        // service.register 사용해서 게시글 등록
        Long result = boardPostService.register(boardPostDTO, testUserId);

        log.info("POST ID: " + result);

        log.info("=======================REGISTER TEST END=======================");
    }

    @Test
    public void testReadOne(){
        log.info("=======================READ ONE TEST START=======================");

        Long postId = 5L;

        BoardPostDTO boardPostDTO = boardPostService.get(postId);

        log.info(boardPostDTO);

        log.info("=======================READ ONE TEST END=======================");
    }

    @Test
    public void testDeleteOne(){
        log.info("=======================DELETE ONE TEST START=======================");

        Long testUserId = 7L;
        Long postId = 9L;

        try{
            BoardPostDTO postDTO = boardPostService.get(postId);
            log.info("삭제 할 게시글 : " + postDTO);
        }catch (IllegalArgumentException e){
            log.error(postId + "를 찾을 수 없거나 이미 삭제되었습니다.");

            throw new RuntimeException("테스트 실패", e);
        }

        boardPostService.remove(postId, testUserId);
        log.info("게시글 ID: " + postId + " 삭제 처리 완료");

        System.out.println("=======================DELETE ONE TEST END=======================");
    }

    @Test
    public void testModify(){
        log.info("=======================MODIFY TEST START=======================");

        // 존재하는 게시글, user id
        Long postId = 10L;
        Long testUserId = 7L;

        // 게시글 불러오기
        BoardPostDTO postDTO = boardPostService.get(postId);

        // 게시글 수정
        BoardPostDTO modifyDTO = BoardPostDTO.builder()
                .postId(postId)
                .categoryName("Q&A")
                .title("서비스 수정")
                .content("서비스 수정 content")
                .userInfo(testUserId)
                .build();

        boardPostService.modify(postId, modifyDTO, testUserId);

        System.out.println("=======================MODIFY TEST END=======================");

    }
}
