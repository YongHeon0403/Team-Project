package org.zerock.server.repository.board;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;
import org.zerock.server.domain.board.BoardPost;

import java.util.Optional;

public interface BoardPostRepository extends JpaRepository<BoardPost, Long> {

    // 조회수만 증가 (수정 시간 업데이트 되지 않도록)
    @Modifying
    @Query("update BoardPost p set p.viewCount = p.viewCount + 1 where p.postId = :postId")
    void incrementViewCount(@Param("postId") Long postId);

    // 삭제 대신 isDeleted = true 로 변경하는 쿼리
    @Modifying
    @Transactional
    @Query("update BoardPost p set p.isDeleted = :isDeleted where p.postId = :postId")
    void updateIsDeletedStatus(@Param("postId") Long postId, @Param("isDeleted") boolean isDeleted);

    // 게시글 ID와 isDeleted 가 false 인 게시글을 찾아오는 메서드
    Optional<BoardPost> findByPostIdAndIsDeletedFalse(Long postId);

    // isDeleted 가 false 인 게시글만 조회하는 쿼리
    // 페이징 처리 위해 Pageable 파라미터 Page 반환 타입 사용
    Page<BoardPost> findAllByIsDeletedFalse(Pageable pageable);

    // ✨ 카테고리 이름으로 게시글 조회 (추가) ✨
    // Spring Data JPA의 쿼리 메서드 기능을 활용하여
    // BoardPost 엔티티 내부의 category 필드의 categoryName으로 검색하고,
    // isDeleted가 false인 게시글만 가져오도록 합니다.
    Page<BoardPost> findByCategory_CategoryNameAndIsDeletedFalse(String categoryName, Pageable pageable);

    // 제목으로 검색 (ServiceImpl에서 사용될 수 있는 추가 쿼리 메서드)
    Page<BoardPost> findByTitleContainingAndIsDeletedFalse(String title, Pageable pageable);

    // (추가)
    // 작성자 userId로 검색 (삭제글 제외)
    Page<BoardPost> findByUserInfo_UserIdAndIsDeletedFalse(Long userId, Pageable pageable);


}
