# Base image
FROM maven:3.8.6-openjdk-11 AS builder
# Copy maven project
WORKDIR /app
COPY cdoc/pom.xml pom.xml
COPY cdoc/src src
COPY .git .git

# Package project to jar
RUN mvn package