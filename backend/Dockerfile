# Build context is the REPO ROOT, not backend/ — the build needs /ai as well as /backend.
# See docker-compose.yml: context "." + dockerfile "backend/Dockerfile".

# ---- build stage ----
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /build

# Dependencies first so they stay cached across source-only changes.
COPY backend/pom.xml backend/pom.xml
RUN mvn -B -q -f backend/pom.xml dependency:go-offline

# Repo layout is preserved because pom.xml reaches ../ai to stage the prompts.
COPY ai ai
COPY backend/src backend/src
RUN mvn -B -q -f backend/pom.xml clean package -DskipTests

# ---- runtime stage ----
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

RUN addgroup -S mecnun && adduser -S mecnun -G mecnun
COPY --from=build /build/backend/target/*.jar app.jar
USER mecnun

EXPOSE 8080
ENV JAVA_OPTS="-XX:MaxRAMPercentage=75"
ENTRYPOINT ["sh", "-c", "exec java $JAVA_OPTS -jar app.jar"]
