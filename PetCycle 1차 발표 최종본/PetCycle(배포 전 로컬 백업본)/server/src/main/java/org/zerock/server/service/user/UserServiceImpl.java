package org.zerock.server.service.user;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponents;
import org.springframework.web.util.UriComponentsBuilder;
import org.zerock.server.domain.user.UserInfo;
import org.zerock.server.domain.user.UserRole;
import org.zerock.server.dto.user.UserInfoDTO;
import org.zerock.server.dto.user.UserModifyDTO;
import org.zerock.server.dto.user.UserProfileResponseDto;
import org.zerock.server.dto.user.UserProfileUpdateRequestDto;
import org.zerock.server.repository.user.UserInfoRepository;

import java.util.LinkedHashMap;
import java.util.Optional;
import java.util.UUID;

@Service
@Log4j2
@RequiredArgsConstructor
@Transactional
public class UserServiceImpl implements UserService {

    private final UserInfoRepository userInfoRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    @Override
    public UserProfileResponseDto getMyProfile(Long userId) {
        UserInfo user = userInfoRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
        return UserProfileResponseDto.from(user);
    }

    @Override
    public UserProfileResponseDto updateMyProfile(Long userId, UserProfileUpdateRequestDto req) {
        UserInfo user = userInfoRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        // 닉네임 중복 체크 (자기 자신 제외)
        if (req.getNickname() != null && !req.getNickname().isBlank()) {
            boolean exists = userInfoRepository.existsByNickname(req.getNickname());
            if (exists && !req.getNickname().equals(user.getNickname())) {
                throw new IllegalArgumentException("이미 사용 중인 닉네임입니다.");
            }
            user.setNickname(req.getNickname());
        }

        if (req.getRegion() != null) {
            user.setRegion(req.getRegion());
        }

        if (req.getPhoneNumber() != null) {
            user.setPhoneNumber(req.getPhoneNumber());
        }

        // 비밀번호 변경
        if (req.getNewPassword() != null && !req.getNewPassword().isBlank()) {
            if (req.getCurrentPassword() == null || req.getCurrentPassword().isBlank()) {
                throw new IllegalArgumentException("현재 비밀번호를 입력해주세요.");
            }
            if (!passwordEncoder.matches(req.getCurrentPassword(), user.getPassword())) {
                throw new IllegalArgumentException("현재 비밀번호가 일치하지 않습니다.");
            }
            user.setPassword(passwordEncoder.encode(req.getNewPassword()));
        }

        // 변경감지에 의해 저장됨
        return UserProfileResponseDto.from(user);
    }

    @Override
    public void deactivate(Long userId) {
        UserInfo user = userInfoRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
        // Lombok boolean 필드명 isActive => setter 는 setActive(...) 형태
        user.setActive(false);
    }

    @Override
    public UserInfoDTO getKakaoUser(String accessToken) {

        // 카카오에 accessToken 을 전송하고 사용자 정보 받아온다
        String email = getEmailFromKakaoAccessToken(accessToken);

        log.info("email: " + email);

        Optional<UserInfo> result = userInfoRepository.findByEmail(email);

        if (result.isPresent()){
            UserInfoDTO userInfoDTO = entityToDTO(result.get());

            return userInfoDTO;
        }

        // 회원이 아니었다면,
        // 닉네임은 '소셜회원'으로
        // 패스워드는 임의로 생성
        UserInfo socialUser = makeSocialUser(email); // DB에 없는 유저인 경우 소셜유저를 하나 생성
        userInfoRepository.save(socialUser); // 소셜 유저를 DB에 저장

        UserInfoDTO userInfoDTO = entityToDTO(socialUser);

        return userInfoDTO;
    }

    private String getEmailFromKakaoAccessToken(String accessToken){
        // accessToken을 전송할 Kakao 주소
        String kakaoGetUserURL = "https://kapi.kakao.com/v2/user/me";

        if (accessToken == null){
            throw new RuntimeException("Access Token is null");
        }

        RestTemplate restTemplate = new RestTemplate();

        HttpHeaders headers = new HttpHeaders();
        headers.add("Authorization", "Bearer " + accessToken);
        // 카카오 같은 OAuth2.0 서버는 JSON 이 아니라 폼 데이터를 원한다.
        // RestTemplate 은 java 객체 -> JSON 으로 변환해서 전송한다. 타입이 맞지 않다.
        // 그래서 application/x-www-form-urlencoded 로 직접 지정했다.
        headers.add("Content-Type", "application/x-www-form-urlencoded");
        //HttpEntity ? HTTP 메세지의 헤더와 바디를 함께 묶는 객체입니다.

        HttpEntity<String> entity = new HttpEntity<>(headers);

        //fromHttpUrl(String httpUrl)은 "http://" 또는 "https://" 로 시작하는 절대 URL 을 기반으로 UriComponentsBuilder 객체를 생성합니다.
        UriComponents uriBuilder = UriComponentsBuilder.fromHttpUrl(kakaoGetUserURL).build();

        //restTemplate.exchange() ?
        //GET, POST, PUT, DELETE 등 다양한 HTTP 메서드와 요청 헤더, 바디 응답 타입을 자유롭게 설정할수 있다.
        //카카오에 accessToken 을 전송하고 response 로 결과를 받음
        //그런데 왜 LinkedHashMap 타입을 사용하나?
        //카카오에서 반환하는 정보를 LinkedHashMap 을 사용하면 큰 변환 없이 그대로 사용 가능
        //HashMap 은 순서를 보장 하지 않지만, LinkedHashMap 은 입력 순서를 유지한다.
        ResponseEntity<LinkedHashMap> response = restTemplate.exchange( //exchange : 교환하다.
                uriBuilder.toString(),  // 요청할 URL
                HttpMethod.GET,         // GET 방식
                entity,                 // 요청 헤더 + 바디를 포함한 객체(여기서는 accessToken)
                LinkedHashMap.class);   // 응답으로 기대하는 타입(예: String.class, User.class)

        log.info(response);
        LinkedHashMap<String,LinkedHashMap> bodyMap = response.getBody();

        log.info("-------------------------------");
        log.info(bodyMap);

        LinkedHashMap<String,String> kakaoAccount = bodyMap.get("kakao_account");

        log.info("kakaoAccount: " + kakaoAccount);

        return kakaoAccount.get("email");
    }

    //소셜 로그인 후 임시 비밀번호를 랜덤으로 생성 (pw를 모르니까 일반 로그인이 안됨)
    //소셜 로그인 후 회원 정보를 수정할 수 있도록 구성하고 사용자가 원하는 pw로 변경 해야 한다.)
    private String makeTempPassword(){
        StringBuffer buffer = new StringBuffer();

        for (int i = 0; i < 10; i++) {
            buffer.append((char) ((int)(Math.random()*55) + 65));
        }

        return buffer.toString();
    }

    //소셜 로그인을 했는데 기존 유저(DB에 있는 유저)가 아닌경우 소셜회원을 하나 만든다.

    private String generateSocialNickname() {
        return "소셜회원-" + UUID.randomUUID().toString().substring(0, 8);
    }

    private UserInfo makeSocialUser(String email){
        String tempPassword = makeTempPassword();

        log.info("tempPassword: " + tempPassword);

        String nickname = generateSocialNickname();

        UserInfo userInfo = UserInfo.builder()
                .email(email)
                .password(passwordEncoder.encode(tempPassword))
                .nickname(nickname)
                .social(true)
                .build();

        userInfo.addRole(UserRole.USER);

        return userInfo;
    }

    @Override
    public void modifyUser(UserModifyDTO userModifyDTO) {
        Optional<UserInfo> result = userInfoRepository.findByEmail(userModifyDTO.getEmail());

        UserInfo userInfo = result.orElseThrow();

        userInfo.changePassword(passwordEncoder.encode(userModifyDTO.getPw()));
        userInfo.changeSocial(false);
        userInfo.changeNickname(userModifyDTO.getNickname());

        userInfoRepository.save(userInfo);
    }
}
