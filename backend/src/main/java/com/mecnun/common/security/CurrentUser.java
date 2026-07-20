package com.mecnun.common.security;

import com.mecnun.common.error.ApiException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.UUID;

/** Tiny helper so controllers do not each re-implement "who is calling me". */
public final class CurrentUser {

    private CurrentUser() {
    }

    public static UUID id() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof UUID userId)) {
            throw ApiException.unauthorized("Sessiya tapılmadı. Yenidən daxil olun.");
        }
        return userId;
    }
}
