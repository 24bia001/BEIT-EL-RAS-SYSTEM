FROM maven:3.9.16-eclipse-temurin-24
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn -B clean package -DskipTests
EXPOSE 8080
CMD ["sh","-c","java -jar target/*.jar"]
