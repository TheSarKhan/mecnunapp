package com.mecnun.limits;

import com.mecnun.common.security.CurrentUser;
import com.mecnun.limits.dto.LimitStatusResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "limits", description = "Gündəlik mesaj limiti")
@RestController
@RequestMapping("/api/v1/limits")
@RequiredArgsConstructor
public class LimitController {

    private final LimitService limitService;

    @Operation(summary = "Qalan mesaj sayı və reset vaxtı")
    @GetMapping("/status")
    public LimitStatusResponse status() {
        return limitService.status(CurrentUser.id());
    }
}
