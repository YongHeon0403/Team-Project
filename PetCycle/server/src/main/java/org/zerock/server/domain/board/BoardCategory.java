package org.zerock.server.domain.board;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "tb_board_category")
@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class BoardCategory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer categoryId;

    @Column(unique = true, nullable = false, length = 50)
    private String categoryName;
}