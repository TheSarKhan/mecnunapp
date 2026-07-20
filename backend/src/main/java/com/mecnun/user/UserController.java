package com.mecnun.user;

import com.mecnun.common.security.CurrentUser;
import com.mecnun.user.dto.UserDtos.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Tag(name = "users", description = "Profil, persona seçimi, ayarlar")
@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @Operation(summary = "Cari istifadəçi")
    @GetMapping("/me")
    public MeResponse me() {
        return userService.me(CurrentUser.id());
    }

    @Operation(summary = "Profil yenilə — ad, cinsiyyət, persona, münasibət statusu")
    @PutMapping("/me/profile")
    public MeResponse updateProfile(@Valid @RequestBody UpdateProfileRequest request) {
        return userService.updateProfile(CurrentUser.id(), request);
    }

    @Operation(summary = "Ayarlar — söyüş modu (premium tələb edir)")
    @PatchMapping("/me/settings")
    public MeResponse updateSettings(@Valid @RequestBody UpdateSettingsRequest request) {
        return userService.updateSettings(CurrentUser.id(), request);
    }

    @Operation(summary = "Hesabı və bütün məlumatları sil")
    @DeleteMapping("/me")
    public ResponseEntity<Void> deleteAccount() {
        userService.deleteAccount(CurrentUser.id());
        return ResponseEntity.noContent().build();
    }
}
