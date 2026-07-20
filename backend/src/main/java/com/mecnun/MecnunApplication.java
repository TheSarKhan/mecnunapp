package com.mecnun;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Async and scheduling are both here for memory extraction: it runs off the request thread after
 * the reply is committed, plus a periodic sweep for conversations that went quiet mid-chunk.
 */
@EnableAsync
@EnableScheduling
@SpringBootApplication
public class MecnunApplication {

    public static void main(String[] args) {
        SpringApplication.run(MecnunApplication.class, args);
    }
}
