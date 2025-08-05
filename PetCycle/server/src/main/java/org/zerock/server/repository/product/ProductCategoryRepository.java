package org.zerock.server.repository.product;

import org.springframework.data.jpa.repository.JpaRepository;
import org.zerock.server.domain.product.ProductCategory;

public interface ProductCategoryRepository extends JpaRepository<ProductCategory, Integer> {
}
