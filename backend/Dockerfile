FROM openjdk:19-jdk-alpine
ARG JARFILE=target/*.jar
COPY ${JARFILE} app.jar
ENTRYPOINT ["java", "-jar","/app.jar"]