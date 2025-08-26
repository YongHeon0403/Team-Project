package org.zerock.server.service.board;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.zerock.server.domain.board.BoardAttachment;
import org.zerock.server.domain.board.BoardCategory;
import org.zerock.server.domain.board.BoardPost;
import org.zerock.server.domain.user.UserInfo;
import org.zerock.server.dto.board.BoardAttachmentDTO;
import org.zerock.server.dto.board.BoardPostDTO;
import org.zerock.server.dto.board.PageRequestDTO;
import org.zerock.server.dto.board.PageResponseDTO;
import org.zerock.server.repository.user.UserInfoRepository;
import org.zerock.server.repository.board.BoardAttachmentRepository;
import org.zerock.server.repository.board.BoardCategoryRepository;
import org.zerock.server.repository.board.BoardCommentRepository;
import org.zerock.server.repository.board.BoardPostRepository;
import org.zerock.server.util.CustomFileUtil;

import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Transactional
@Log4j2
@RequiredArgsConstructor
public class BoardPostServiceImpl implements BoardPostService {

    private final ModelMapper modelMapper;
    private final BoardPostRepository boardPostRepository;
    private final BoardCategoryRepository boardCategoryRepository;
    private final UserInfoRepository userInfoRepository;
    private final CustomFileUtil customFileUtil;
    private final BoardAttachmentRepository boardAttachmentRepository;
    private final BoardCommentRepository boardCommentRepository;

    @Override
    public Long register(BoardPostDTO boardPostDTO, Long userId) {
        log.info("=======================POST REGISTER=======================");

        // JWT에서 추출된 userID를 사용하여 UserInfo 조회
        UserInfo userInfo = userInfoRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다. User ID: " + userId));

        // 카테고리 조회
        BoardCategory category = boardCategoryRepository.findByCategoryName(boardPostDTO.getCategoryName())
                .orElseThrow(() -> new IllegalArgumentException("카테고리를 찾을 수 없습니다."));

        // DTO로 변환, UserInfo / Category 할당
        BoardPost boardPost = modelMapper.map(boardPostDTO, BoardPost.class);

        boardPost.setUserInfo(userInfo);
        boardPost.changeCategory(category);

        // 4. 게시글 저장
        BoardPost savedPost = boardPostRepository.save(boardPost);

        // 5. 파일 이름 목록을 DTO에서 가져와 첨부파일 엔티티 생성 및 저장
        List<String> fileNames = boardPostDTO.getUploadFileNames();
        if (fileNames != null && !fileNames.isEmpty()) {
            for (String fileName : fileNames) {
                BoardAttachment attachment = BoardAttachment.builder()
                        .boardPost(savedPost)
                        .fileUrl(fileName)
                        .fileType(customFileUtil.getFileType(fileName))
                        .build();

                // 업로드 파일 DB에 저장
                boardAttachmentRepository.save(attachment);
            }
        }
        return savedPost.getPostId();
    }

    // 게시글 조회
    @Override
    public BoardPostDTO get(Long postId) {
        // 게시글 찾기
        Optional<BoardPost> result = boardPostRepository.findByPostIdAndIsDeletedFalse(postId);
        BoardPost boardPost = result.orElseThrow(() -> new IllegalArgumentException("게시글을 찾을 수 없거나 삭제되었습니다."));

        // 조회수 1 증가 (@Modifying 쿼리)
        boardPostRepository.incrementViewCount(postId);

        // DTO 변환
        BoardPostDTO boardPostDTO = modelMapper.map(boardPost, BoardPostDTO.class);

        // 카테고리/작성자 수동 매핑
        if (boardPost.getCategory() != null) {
            boardPostDTO.setCategoryName(boardPost.getCategory().getCategoryName());
        }
        if (boardPost.getUserInfo() != null) {
            boardPostDTO.setNickname(boardPost.getUserInfo().getNickname());
            boardPostDTO.setUserInfo(boardPost.getUserInfo().getUserId());
        }

        // 첨부파일 목록 조회
        List<BoardAttachment> attachments = boardAttachmentRepository.findByBoardPost(boardPost);

        // (하위 호환) 파일명 배열 세팅
        boardPostDTO.setUploadFileNames(
                attachments.stream()
                        .map(BoardAttachment::getFileUrl)
                        .collect(Collectors.toList())
        );

        // ✅ 신규: attachmentId + fileName 세트 세팅
        boardPostDTO.setAttachmentList(
                attachments.stream()
                        .map(a -> BoardAttachmentDTO.builder()
                                .attachmentId(a.getAttachmentId())
                                .fileName(a.getFileUrl())
                                .build())
                        .collect(Collectors.toList())
        );

        return boardPostDTO;
    }


    // 게시글 + 업로드파일 한번에 삭제
    @Override
    public void remove(Long postId, Long userId) {
        // 1. 게시글 찾기
        BoardPost boardPost = boardPostRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("게시글을 찾을 수 없습니다"));

        // 2. 권한 확인: 게시글 작성자와 요청한 사용자가 동일한지 확인
        if (!boardPost.getUserInfo().getUserId().equals(userId)) {
            throw new IllegalArgumentException("삭제 권한이 없습니다. (게시글 작성자 불일치)");
        }

        // 3. 해당 게시글에 연결된 모든 업로드파일 정보 가져오기
        List<BoardAttachment> attachments = boardAttachmentRepository.findByBoardPost(boardPost);

        // 4. 파일 시스템에서 실제 파일들 삭제
        List<String> fileNamesToDelete = attachments.stream()
                .map(BoardAttachment::getFileUrl)
                .collect(Collectors.toList());

        if (!fileNamesToDelete.isEmpty()) {
            customFileUtil.deleteFiles(fileNamesToDelete);
            log.info("물리적 파일 삭제 완료: {} ", fileNamesToDelete);
        } else {
            log.info("삭제할 물리적 업로드 파일 없음.");
        }

        // 5. DB에서 첨부파일 레코드 삭제 (게시글 - 소프트 삭제, 첨부파일은 물리적 삭제 >> DB에서도 삭제.)
        boardAttachmentRepository.deleteAll(attachments);

        // 6. 게시글 소프트 삭제
        boardPostRepository.updateIsDeletedStatus(postId, true);
    }

    // 업로드파일만 삭제
    @Override
    public void removeAttachment(Long postId, Long attachmentId, Long userId) {
        log.info("게시글 ID: " + postId + "의 첨부파일 ID: " + attachmentId + " 삭제 요청");

        // 1. 첨부파일 엔티티 찾기
        BoardAttachment attachment = boardAttachmentRepository.findById(attachmentId)
                .orElseThrow(() -> new IllegalArgumentException("첨부파일을 찾을 수 없습니다."));

        // 2. 권한 확인
        if (!attachment.getBoardPost().getUserInfo().getUserId().equals(userId)) {
            throw new IllegalArgumentException("삭제권한이 없습니다. (게시글 작성자 불일치)");
        }

        // 3. 파일 시스템에서 파일 삭제
        customFileUtil.deleteFiles(List.of(attachment.getFileUrl()));
        log.info("시스템에서 파일 삭제 완료: " + attachment.getFileUrl());

        // 4. DB에서 첨부파일 레코드 삭제
        boardAttachmentRepository.delete(attachment);
        log.info("DB에서 첨부파일 레코드 삭제 완료: " + attachment);

        log.info("첨부파일 ID: " + attachment + " >>> 삭제 완료 !");
    }

    // 게시글 수정
    @Override
    public void modify(Long postId, BoardPostDTO boardPostDTO, Long userId) {
        // 1. 수정 할 게시글 불러오기
        Optional<BoardPost> result = boardPostRepository.findById(postId);
        BoardPost boardPost = result.orElseThrow(() -> new IllegalArgumentException("게시글을 찾을 수 없습니다."));
        // 2. 권한 확인
        if (!boardPost.getUserInfo().getUserId().equals(userId)) {
            throw new IllegalArgumentException("수정 권한이 없습니다. (게시글 작성자 불일치)");
        }

        // 3. 카테고리 불러오기
        BoardCategory category = boardCategoryRepository.findByCategoryName(boardPostDTO.getCategoryName())
                .orElseThrow(() -> new IllegalArgumentException("카테고리 없음"));

        // 4. 엔티티 필드 업데이트
        boardPost.changeCategory(category);
        boardPost.changeTitle(boardPostDTO.getTitle());
        boardPost.changeContent(boardPostDTO.getContent());

        /// ////////// 업로드 파일 로직 처리 /////////// ///
        // 클라이언트가 수정을 통해 최종적으로 원하는 파일 목록과 현재 DB에 실제로 저장된 파일 목록을 비교하여 첨부 파일 레코드들을 추가하거나 삭제

        // 5-1. 현재 DB에 존재하는 첨부파일 목록 가져오기
        List<BoardAttachment> currentAttachments = boardAttachmentRepository.findByBoardPost(boardPost);
        // 비교 효율성 위해 현재파일들의 이름만 Set으로 변환하여 저장
        Set<String> currentFileUrls = currentAttachments.stream()
                .map(BoardAttachment::getFileUrl)
                .collect(Collectors.toSet());

        // 5-2 DTO에 포함된 최종파일목록 (= 클라이언트가 유지하려는 파일 + 새로 추가된 파일)
        // 컨트롤러에서 처리되어 BoardPost.uploadFileNames에 담겨온
        // 수정 후 최종적으로 이 게시글에 연결되어야 할 파일 이름 목록 가져옴
        List<String> newFileUrls = boardPostDTO.getUploadFileNames();

        // null일 경우를 대비하여 빈 HashSet으로 초기화
        Set<String> newFileUrlsSet = (newFileUrls != null) ? new HashSet<>(newFileUrls) : new HashSet<>();

        // 5-3. 삭제할 첨부 파일 식별 (현재 DB에는 있지만 새 목록에는 없는 파일)
        // currentAttachments(DB에 있는 파일) 중 newFileUrlsSet(최종 목록)에 포함되지 않는 첨부파일 엔티티를 필터링합니다.
        // 이들은 클라이언트가 삭제 요청했거나 새로 업로드된 파일들로 대체되어 더 이상 필요 없는 파일들입니다.
        List<BoardAttachment> attachmentsToDelete = currentAttachments.stream()
                .filter(attachment -> !newFileUrlsSet.contains(attachment.getFileUrl()))
                .collect(Collectors.toList());

        // 5-4. 데이터베이스에서 첨부 파일 레코드 삭제
        // 식별된 attachmentsToDelete 리스트가 비어있지 않다면, 해당 BoardAttachment 엔티티를 DB에서 삭제합니다.
        // (참고: 실제 서버 파일 삭제는 컨트롤러나 별도의 서비스에서 처리되어야 합니다.
        // 이 서비스 메서드에서는 DB 레코드만 관리합니다.)
        if (!attachmentsToDelete.isEmpty()) {
            boardAttachmentRepository.deleteAll(attachmentsToDelete);
            log.info("DB에서 삭제된 첨부 파일 레코드: " + attachmentsToDelete.size() + "개");
        }

        // 5-5. 새로 추가할 첨부파일 식별 (새 목록에는 있지만 현재 DB에는 없는 파일)
        // newFileUrlsSet(최종 목록) 중 currentFileUrls(DB에 있는 파일)에 포함되지 않는 파일 URL들을 필터링합니다.
        // 이들은 새로 업로드된 파일이거나, 기존 파일이지만 DB 레코드가 없는 경우입니다.
        List<String> filesToAddToDb = newFileUrlsSet.stream()
                .filter(fileUrl -> !currentFileUrls.contains(fileUrl))
                .collect(Collectors.toList());

        // 5-6. 데이터베이스에 새로운 첨부 파일 레코드 추가
        // 식별된 filesToAddToDb 리스트가 비어있지 않다면, 각 파일 URL에 대해 새로운 BoardAttachment 엔티티를 생성하고 저장합니다.
        if (!filesToAddToDb.isEmpty()) {
            for (String fileUrl : filesToAddToDb) {
                BoardAttachment attachment = BoardAttachment.builder()
                        .boardPost(boardPost)
                        .fileUrl(fileUrl)
                        .fileType(customFileUtil.getFileType(fileUrl))
                        .build();

                boardAttachmentRepository.save(attachment);
            }
            log.info("DB에 추가된 첨부 파일 레코드: " + filesToAddToDb.size() + "개");
        }

        boardPostRepository.save(boardPost);
    }

    @Override
    public PageResponseDTO<BoardPostDTO> list(PageRequestDTO pageRequestDTO) {
        log.info("BoardPostService list called with: " + pageRequestDTO);

        // 페이지 요청 객체 생성 (페이지 번호는 0부터 시작하므로 page - 1)
        Pageable pageable = PageRequest.of(
                pageRequestDTO.getPage() - 1, // 페이지 번호 (0부터 시작)
                pageRequestDTO.getSize(),     // 페이지 크기
                Sort.by("postId").descending() // 기본 정렬 (최신 게시물부터)
        );

        Page<BoardPost> result;

        // ✨ 검색 조건(type)과 키워드(keyword)에 따라 다른 Repository 메서드 호출 ✨
        if (pageRequestDTO.getType() != null && !pageRequestDTO.getType().isEmpty() &&
                pageRequestDTO.getKeyword() != null && !pageRequestDTO.getKeyword().isEmpty()) {

            // type이 'c' (category)인 경우
            if ("c".equals(pageRequestDTO.getType())) {
                // 카테고리 이름으로 게시글을 조회하는 새로운 쿼리 메서드가 필요
                result = boardPostRepository.findByCategory_CategoryNameAndIsDeletedFalse(pageRequestDTO.getKeyword(), pageable);
            }
            // type이 't' (title)인 경우
            else if ("t".equals(pageRequestDTO.getType())) {
                result = boardPostRepository.findByTitleContainingAndIsDeletedFalse(pageRequestDTO.getKeyword(), pageable);
            }
            // 다른 검색 조건이 있다면 여기에 추가
            else {
                // 정의되지 않은 type이 넘어온 경우 기본 목록 조회
                result = boardPostRepository.findAllByIsDeletedFalse(pageable);
            }
        } else {
            // 검색 조건이 없는 경우 (기존처럼 모든 게시글 조회)
            result = boardPostRepository.findAllByIsDeletedFalse(pageable);
        }

        List<BoardPostDTO> dtoList = result.getContent().stream()
                .map(boardPost -> {
                    BoardPostDTO boardPostDTO = modelMapper.map(boardPost, BoardPostDTO.class);
                    // 카테고리 이름 수동 매핑
                    if (boardPost.getCategory() != null) {
                        boardPostDTO.setCategoryName(boardPost.getCategory().getCategoryName());
                    }
                    // ✨ UserInfo에서 nickname을 가져와 수동 매핑 ✨
                    if (boardPost.getUserInfo() != null) {
                        boardPostDTO.setNickname(boardPost.getUserInfo().getNickname());
                        boardPostDTO.setUserInfo(boardPost.getUserInfo().getUserId()); // userId도 필요하다면 설정
                    }
                    return boardPostDTO;
                })
                .collect(Collectors.toList());

        long totalCount = result.getTotalElements();

        PageResponseDTO<BoardPostDTO> responseDTO = PageResponseDTO.<BoardPostDTO>withAll()
                .dtoList(dtoList)
                .pageRequestDTO(pageRequestDTO)
                .totalCount(totalCount)
                .build();

        return responseDTO;
    }
}
