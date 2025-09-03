package org.zerock.server.dto.board;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@Data
@SuperBuilder
@AllArgsConstructor
@NoArgsConstructor
public class PageRequestDTO {

    @Builder.Default
    private int page = 1;

    @Builder.Default
    private int size = 10;

    // ✨ 카테고리 및 검색을 위한 필드 추가 ✨
    // type: 검색 조건 (예: 'c' for category, 't' for title, 'tc' for title/content)
    // keyword: 검색어 또는 카테고리 이름
    private String type;
    private String keyword;

    // 단순히 필터링하고 보여주는 용도라서 DTO 에다가 메서드 추가했음
    public String getLink() {
        StringBuilder builder = new StringBuilder();
        builder.append("page=" + this.page);
        builder.append("&size=" + this.size);
        if (this.type != null && this.keyword != null) {
            try {
                // 키워드에 특수문자가 있을 경우를 대비해 인코딩 처리
                builder.append("&type=" + this.type);
                builder.append("&keyword=" + java.net.URLEncoder.encode(this.keyword, "UTF-8"));
            } catch (java.io.UnsupportedEncodingException e) {
                // 예외 처리 (로그 등)
            }
        }
        return builder.toString();
    }
}
