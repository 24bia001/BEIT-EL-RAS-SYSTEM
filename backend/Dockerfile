FROM eclipse-temurin:24-jdk
RUN apt-get update && apt-get install -y maven && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn -B clean package -DskipTests
EXPOSE 8080
CMD ["sh","-c","java -jar target/*.jar"]
