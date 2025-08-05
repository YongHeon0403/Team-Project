package org.zerock.server.domain.product;

import jakarta.persistence.*;
import lombok.*;
import org.zerock.server.domain.user.PetTypeCategory;

@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Entity
@Table(name = "tb_product_category")
public class ProductCategory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer categoryId; // PK, 자동 증가

    @Column(nullable = false, length = 100)
    private String categoryName; // 카테고리 이름

    // (Optional) 계층형 구조 지원, 상위 카테고리 참조. 없으면 null
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_category_id")
    private ProductCategory parentCategory;

    // 어떤 반려동물용 카테고리인지(강아지/고양이 등)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pet_type_id")
    private PetTypeCategory petTypeCategory;
}
