package org.zerock.server.security.handler;

import com.google.gson.Gson;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.log4j.Log4j2;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.AuthenticationFailureHandler;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.Map;

/**
 * APILoginFailHandler는 Spring Security의 AuthenticationFailureHandler를 구현하여
 * API 로그인 인증 실패 시 처리를 담당합니다.
 * 로그인 실패 시 클라이언트에게 JSON 형태의 에러 메시지를 반환합니다.
 */
@Log4j2
public class APILoginFailHandler implements AuthenticationFailureHandler {

    @Override
    public void onAuthenticationFailure(HttpServletRequest request, HttpServletResponse response, AuthenticationException exception) throws IOException, ServletException {
        // 로그인 실패 시 발생한 예외 정보를 로그로 기록합니다.
        log.info("Login fail....." + exception.getMessage()); // exception.getMessage()로 상세 메시지 로깅

        // Gson 객체를 생성하여 Java 객체를 JSON 문자열로 변환합니다.
        Gson gson = new Gson();

        // "ERROR_LOGIN" 메시지를 포함하는 Map을 JSON 문자열로 변환합니다.
        // exception.getMessage()를 포함하여 더 자세한 에러 메시지를 전달할 수 있습니다.
        String jsonStr = gson.toJson(Map.of("error", "ERROR_LOGIN", "message", exception.getMessage()));

        // 응답의 Content-Type을 JSON으로 설정하고 문자셋을 UTF-8로 지정합니다.
        response.setContentType("application/json; charset=UTF-8");
        // 응답 상태 코드를 401 Unauthorized로 설정하는 것이 REST API에서 더 적절합니다.
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED); // 401 Unauthorized

        // 응답 본문에 JSON 문자열을 작성하고 스트림을 닫습니다.
        PrintWriter printWriter = response.getWriter();
        printWriter.println(jsonStr);
        printWriter.close();
    }
}
