package org.zerock.server.security.filter;

import com.google.gson.Gson;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.log4j.Log4j2;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;
import org.zerock.server.domain.user.UserRole;
import org.zerock.server.dto.UserInfoDTO;
import org.zerock.server.util.JWTUtil;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Log4j2
public class JWTCheckFilter extends OncePerRequestFilter {

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
        //Preflight 요청 ? CORS 에서 브라우저가 실제 요청전에 보내는 사전 점검용 HTTP OPTIONS 요청
        //브라우저가 다른 출처(도메인, 포트, 프로토콜이 다른)에 AJAX 요청을 보내기 전에
        //서버가 해당 요청을 허용하는지 확인하기 위해 보내는 OPTIONS 메서드 요청
        //아래 조건 중 하나라도 해당하면 브라우저는 Preflight 요청을 보냅니다.
        //1. 요청 메서드가 GET, POST, HEAD 가 아닌 경우 (예: PUT, DELETE, PATCH)
        //2.Content-Type 이 application/x-www-form-urlencoded, multipart/form-data, text/plain 이외인 경우 (예: application/json)
        //3.커스텀 헤더가 포함된 경우 (예: Authorization, X-Custom-Header)
        //4.요청에 credentials 포함 시 (쿠키, 인증 헤더)


        //Preflight 요청은 체크하지 않음
        if(request.getMethod().equals("OPTIONS")){
            return true;
        }

        String path = request.getRequestURI();

        log.info("check uri.........." + path);

        // api/auth/ 경로의 호출은 체크하지 않음
        if(path.startsWith("/api/auth/")){
            return true;
        }

        if(path.startsWith("/api/user/")){
            return true;
        }


        return false;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        log.info("-------JWTCheckFilter----------------");

        String authHeaderStr = request.getHeader("Authorization");

        try{
            //Bearer accesstoken..
            // (Bearer 토큰) 형식인데 여기서 토큰만 필요 하다.
            // Bearer + 공백문자1칸 을 빼고 가져 와야 하므로
            // 공백문자1칸의 인덱스 값이 6 이므로 (인덱스는 0부터 시작)
            // substring() 의 매개 변수값을 7로 하였다.
            String accesstoken = authHeaderStr.substring(7);
            //토큰의 유효성 검사
            Map<String, Object> claims = JWTUtil.validateToken(accesstoken);

            log.info("JWT claims: " + claims);


            //JWT 토큰 내에는 인증에 필요한 모든 정보를 가지고 있다.
            //이를 활용해서 시큐리티에 필요한 객체(MemberDTO)를 구성하자.
            // JWT 클레임에서 UserInfoDTO 생성에 필요한 정보들을 추출합니다.
            Long userId = ((Number) claims.get("userId")).longValue(); // Number 타입으로 받아 Long으로 변환
            String email = (String) claims.get("email");
            String password = (String) claims.get("password"); // JWT에 비밀번호를 포함하지 않는 것이 권장되므로 후에 제거
            String nickname = (String) claims.get("nickname");
            String phoneNumber = (String) claims.get("phoneNumber");
            String region = (String) claims.get("region");
            boolean isActive = (Boolean) claims.get("isActive");

            // roleNames는 List<String> 형태로 클레임에 저장되어 있으므로, List<UserRole>로 변환
            List<String> roleNamesStr = (List<String>) claims.get("roleNames");
            List<UserRole> roleNames = roleNamesStr.stream()
                    .map(UserRole::valueOf) // String을 UserRole Enum으로 변환
                    .collect(Collectors.toList());

            UserInfoDTO userInfoDTO = new UserInfoDTO(userId, email, password, nickname,
                    phoneNumber, region, roleNames, isActive);

            log.info("------------------------");
            log.info(userInfoDTO);
            log.info(userInfoDTO.getAuthorities());

            // UsernamePasswordAuthenticationToken: Spring Security에서 사용자 인증 정보를 담기 위한 객체
            // 인증 성공 후 사용자 정보와 권한을 포함해서 생성
            // 첫 번째 파라미터는 principal (인증된 사용자 객체), 두 번째는 credentials (비밀번호 >> 후에 null 처리), 세 번째는 authorities (권한 목록)
            UsernamePasswordAuthenticationToken authenticationToken
                    = new UsernamePasswordAuthenticationToken(userInfoDTO, password, userInfoDTO.getAuthorities()); // <-- userInfoDTO 사용

            //인증 정보(authenticationToken)를 등록한다.
            //인증등록에 성공하면
            //@AuthenticationPrincipal, SecurityContextHolder.getContext().getAuthentication() 등으로 인증 정보에 접근할 수 있다.
            SecurityContextHolder.getContext().setAuthentication(authenticationToken);

            filterChain.doFilter(request, response); // 통과

        }catch (Exception e){
            log.error("JWT Check Error.........");
            log.error(e.getMessage());

            //Gson : java 객체를 JSON 으로 바꾸거나, JSON을 자바 객체로 바꿔주는 도구
            Gson gson = new Gson();
            //자바 객체를 JSON 문자열로 변환(Map -> JSON)
            String msg = gson.toJson(Map.of("error", "ERROR_ACCESS_TOKEN"));

            response.setContentType("application/json; charset=UTF-8");
            PrintWriter printWriter = response.getWriter();
            printWriter.println(msg);
            printWriter.close();
        }
    }
}
