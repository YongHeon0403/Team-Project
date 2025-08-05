package org.zerock.server.domain.product;

import jakarta.persistence.*;
import lombok.*;

import java.util.HashSet;
import java.util.Set;

@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Entity
@Table(name = "tb_product_tag")
public class ProductTag {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer tagId; // 태그 PK

    @Column(unique = true, nullable = false, length = 50)
    private String tagName; // 태그명

    // 태그가 달린 상품-태그 조인 리스트 (1:N)
    @OneToMany(mappedBy = "tag", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private Set<ProductTagRelation> tagRelations = new HashSet<>();
}
