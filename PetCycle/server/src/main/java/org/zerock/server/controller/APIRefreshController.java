package org.zerock.server.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.zerock.server.util.CustomJWTException;
import org.zerock.server.util.JWTUtil;

import java.util.Date;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@Log4j2
public class APIRefreshController {

    @RequestMapping("/api/user/refresh")
    public Map<String, String> refresh(
            @RequestHeader("Authorization") String authHeader, String refreshToken){

        if (refreshToken == null){
            throw new CustomJWTException("NULL_REFRESH");
        }

        //authHeader = Bearer + 공백문자1개 가 들어있다.(그 뒤에 토큰의 값이 저장된다.)
        if(authHeader == null || authHeader.length() < 7) {
            throw new CustomJWTException("INVALID_STRING");
        }

        //authHeader = Bearer + 공백문자1개 + token
        // accessToken 에는 token 만 저장된다.
        String accessToken = authHeader.substring(7);

        //Access 토큰이 만료되지 않았다면
        if(checkExpiredToken(accessToken) == false){
            return Map.of("accessToken", accessToken, "refreshToken", refreshToken);
        }

        //Refresh 토큰 검증
        Map<String, Object> claims = JWTUtil.validateToken(refreshToken);

        log.info("refresh ... claims: " + claims);

        //accessToken 이 만료 되었다면 새로운 accessToken을 생성
        String newAccessToken = JWTUtil.generateToken(claims, 10);  //10분
        //checkTime 이 true 이면 시간이 1시간도 안남은 거니까 refreshToken 을 만든다. 24시간 짜리
        String newRefreshToken = checkTime((Integer)claims.get("exp")) == true ?
                JWTUtil.generateToken(claims, 60*24) : refreshToken;

        return Map.of("accessToken", newAccessToken,
                "refreshToken", newRefreshToken);
    }

    //시간이 1시간 미만으로 남았다면
    private boolean checkTime(Integer exp){
        //JWT exp 를 날짜로 변환
        //Date 생성자는 밀리초 단위값을 받는다.
        //따라서 초 단위를 밀리초 단위로 변경 하려면 1000을 곱해줘야 한다.
        Date expDate = new Date((long)exp * (1000));

        //현재 시간과의 차이 계산 - 밀리 세컨즈
        long gap = expDate.getTime() - System.currentTimeMillis();

        //분단위 계산
        long leftMin = gap / (1000 * 60);

        //1시간도 안남앗는지..
        return leftMin < 60;
    }

    private boolean checkExpiredToken(String token) {
        try{
            JWTUtil.validateToken(token);
        }catch (CustomJWTException ex){
            if(ex.getMessage().equals("Expired")) {
                return true;
            }
        }

        return false;
    }
}
