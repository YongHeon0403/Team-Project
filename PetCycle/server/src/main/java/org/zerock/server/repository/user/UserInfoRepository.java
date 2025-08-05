package org.zerock.server.repository.user;

import org.springframework.data.jpa.repository.JpaRepository;
import org.zerock.server.domain.user.UserInfo;

// UserInfo 엔티티의 기본 CRUD Repository
public interface UserInfoRepository extends JpaRepository<UserInfo, Long> {
    // 필요하면 커스텀 쿼리 추가 가능
}
