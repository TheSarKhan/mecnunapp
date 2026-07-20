package com.mecnun.user.repository;

import com.mecnun.user.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByIdentifier(String identifier);

    boolean existsByIdentifier(String identifier);

    Optional<User> findByGoogleSub(String googleSub);

    Optional<User> findByEmail(String email);
}
