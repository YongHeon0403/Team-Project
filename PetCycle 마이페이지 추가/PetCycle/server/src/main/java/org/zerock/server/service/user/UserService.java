package org.zerock.server.service.user;

import org.zerock.server.dto.user.UserProfileResponseDto;
import org.zerock.server.dto.user.UserProfileUpdateRequestDto;

public interface UserService {

    UserProfileResponseDto getMyProfile(Long userId);

    UserProfileResponseDto updateMyProfile(Long userId, UserProfileUpdateRequestDto request);

    void deactivate(Long userId);
}
