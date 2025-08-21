package org.zerock.server.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.zerock.server.domain.user.UserInfo;
import org.zerock.server.domain.user.UserRole;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Getter
@Setter
@ToString
public class UserInfoDTO extends User {

    private Long userId;
    private String email;
    private String password;
    private String nickname;
    private String phoneNumber;
    private String region;
    private boolean isActive;

    private List<UserRole> roleNames = new ArrayList<>();


    /**
     * UserInfo 엔티티로부터 UserInfoDTO 객체를 생성하는 주 생성자
     * CustomUserDetailService에서 UserInfo 엔티티를 조회한 후 이 DTO를 생성할 때 사용
     *
     * @param userInfo DB에서 조회된 UserInfo 엔티티 객체
     */
    public UserInfoDTO(UserInfo userInfo) {
        // 부모 클래스 org.springframework.security.core.userdetails.User의 생성자 호출
        super(userInfo.getEmail(), // username (로그인 시 사용될 이메일)
                userInfo.getPassword(), // password (암호화된 비밀번호)
                // UserRole enum 목록을 Spring Security의 GrantedAuthority 컬렉션으로 변환
                userInfo.getUserRoleList().stream()
                        // Enum의 name() 메서드를 사용하여 문자열로 변환하고 "ROLE_" 접두사 추가
                        .map(role -> new SimpleGrantedAuthority("ROLE_" + role.name()))
                        .collect(Collectors.toList()));

        // UserInfo 엔티티의 필드들을 UserInfoDTO의 해당 필드에 할당
        this.userId = userInfo.getUserId();
        this.email = userInfo.getEmail();
        this.password = userInfo.getPassword(); // 해싱된 비밀번호
        this.nickname = userInfo.getNickname();
        this.phoneNumber = userInfo.getPhoneNumber();
        this.region = userInfo.getRegion();
        this.isActive = userInfo.isActive(); // UserInfo 엔티티의 isActive 필드와 연동
        this.roleNames = userInfo.getUserRoleList(); // Enum 리스트를 그대로 할당 (claims 시 String 변환)

    }

    /**
     * 특정 필드들을 직접 받아 UserInfoDTO 객체를 생성하는 보조 생성자
     * 주로 테스트 코드나 특정 유틸리티성 변환에 사용
     */
    public UserInfoDTO(Long userId, String email, String password,
                       String nickname, String phoneNumber,
                       String region, List<UserRole> roleNames, boolean isActive){
        super(email, password, roleNames.stream().map(role ->
                new SimpleGrantedAuthority("ROLE_" + role.name())).collect(Collectors.toList()) );

        this.userId = userId;
        this.email = email;
        this.password = password;
        this.nickname = nickname;
        this.phoneNumber = phoneNumber;
        this.region = region;
        this.roleNames = roleNames;
        this.isActive = isActive;
    }


    /**
     * 현재 사용자의 정보를 Map 타입으로 반환
     * JWT 문자열 생성 시 토큰의 클레임(payload)으로 사용
     * @return JWT 클레임으로 사용될 Map 객체
     */
    public Map<String , Object> getClaims() {
        Map<String, Object> dataMap = new HashMap<>();

        dataMap.put("userId", userId);
        dataMap.put("email", email);
        dataMap.put("password", password); // 보안상 JWT 클레임에 비밀번호(해싱된 값이라도) 포함은 권장하지 않습니다.
        dataMap.put("nickname", nickname);
        dataMap.put("phoneNumber", phoneNumber);
        dataMap.put("region", region);
        dataMap.put("isActive", isActive);
        // Enum 리스트를 String 이름 리스트로 변환하여 클레임에 추가합니다.
        dataMap.put("roleNames", roleNames.stream().map(Enum::name).collect(Collectors.toList()));

        return dataMap;
    }

}
