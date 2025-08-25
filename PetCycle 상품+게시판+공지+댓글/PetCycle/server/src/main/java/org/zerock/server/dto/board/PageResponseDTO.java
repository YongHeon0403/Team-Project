package org.zerock.server.dto.board;

import lombok.Builder;
import lombok.Data;

import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

@Data
public class PageResponseDTO<E> {
    private List<E> dtoList;
    private List<Integer> pageNumList;
    private PageRequestDTO pageRequestDTO;
    private boolean prev, next;
    private int totalCount, prevPage, nextPage, totalPage, current;


    @Builder(builderMethodName = "withAll")
    public PageResponseDTO(List<E> dtoList, PageRequestDTO pageRequestDTO, long totalCount){

        this.dtoList = dtoList;
        this.pageRequestDTO = pageRequestDTO;
        this.totalCount = (int) totalCount; // 총 게시글 수 설정

        // 1. 가장 중요! 전체 페이지 수를 정확하게 계산합니다.
        // totalCount를 size로 나누어 올림 처리하여 총 페이지 수를 얻습니다.
        this.totalPage = (int) Math.ceil((double)totalCount / pageRequestDTO.getSize());

        // 페이지네이션 블록의 끝 번호 계산 (예: 현재 페이지가 3이면 end는 10, 현재 페이지가 12이면 end는 20)
        int end = (int) (Math.ceil(pageRequestDTO.getPage() / 10.0)) * 10;

        // 페이지네이션 블록의 시작 번호 계산
        int start = end - 9;

        // 2. 실제 마지막 페이지 번호는 위에서 계산된 this.totalPage 입니다.
        // 현재 페이지 블록의 end가 실제 totalPage보다 크면, totalPage로 end를 조정합니다.
        end = Math.min(end, this.totalPage); // this.totalPage를 직접 활용

        // 이전(prev) 버튼 활성화 여부
        this.prev = start > 1;

        // 다음(next) 버튼 활성화 여부
        // 현재 페이지 블록의 끝(end)이 실제 총 페이지(totalPage)보다 작으면 다음 페이지 블록이 존재합니다.
        this.next = end < this.totalPage; // this.totalPage를 직접 활용

        // 페이지 번호 목록 생성
        this.pageNumList = IntStream.rangeClosed(start, end).boxed().collect(Collectors.toList());

        // prevPage (이전 페이지 블록의 마지막 페이지) 계산
        if (prev) {
            this.prevPage = start - 1;
        }

        // nextPage (다음 페이지 블록의 첫 페이지) 계산
        if (next) {
            this.nextPage = end + 1;
        }

        // 현재 페이지 번호 설정
        this.current = pageRequestDTO.getPage();
    }
}
