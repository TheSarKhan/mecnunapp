# ---- build stage ----
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /build

# Dependencies first so they stay cached across source-only changes.
COPY pom.xml .
RUN mvn -B -q dependency:go-offline

COPY src ./src
RUN mvn -B -q clean package -DskipTests

# ---- runtime stage ----
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

RUN addgroup -S mecnun && adduser -S mecnun -G mecnun
COPY --from=build /build/target/*.jar app.jar
USER mecnun

EXPOSE 8080
ENV JAVA_OPTS="-XX:MaxRAMPercentage=75"
ENTRYPOINT ["sh", "-c", "exec java $JAVA_OPTS -jar app.jar"]
