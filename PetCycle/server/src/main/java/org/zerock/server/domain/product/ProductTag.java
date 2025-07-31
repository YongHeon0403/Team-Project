package org.zerock.server.domain.product;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "tb_product_tag")
@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ProductTag {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer tagId;

    @Column(unique = true, nullable = false, length = 50)
    private String tagName;
}