package com.mecnun.common.error;

import lombok.Getter;
import org.springframework.http.HttpStatus;

/** Business-level failure that maps straight onto an RFC 7807 ProblemDetail. */
@Getter
public class ApiException extends RuntimeException {

    private final HttpStatus status;
    private final String code;

    public ApiException(HttpStatus status, String code, String message) {
        super(message);
        this.status = status;
        this.code = code;
    }

    public static ApiException notFound(String message) {
        return new ApiException(HttpStatus.NOT_FOUND, "not_found", message);
    }

    public static ApiException conflict(String message) {
        return new ApiException(HttpStatus.CONFLICT, "conflict", message);
    }

    public static ApiException badRequest(String message) {
        return new ApiException(HttpStatus.BAD_REQUEST, "bad_request", message);
    }

    public static ApiException unauthorized(String message) {
        return new ApiException(HttpStatus.UNAUTHORIZED, "unauthorized", message);
    }

    public static ApiException premiumRequired(String message) {
        return new ApiException(HttpStatus.PAYMENT_REQUIRED, "premium_required", message);
    }

    public static ApiException limitReached(String message) {
        return new ApiException(HttpStatus.TOO_MANY_REQUESTS, "daily_limit_reached", message);
    }
}
