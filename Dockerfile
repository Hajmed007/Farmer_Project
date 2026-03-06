# This is a root Dockerfile for the Farmer Project monorepo.
# By default, it builds the backend service.
# If you need to build the frontend, please use -f frontend/Dockerfile

# Build stage
FROM maven:3.8.5-openjdk-17 AS build
WORKDIR /app

# Copy the backend pom and source
COPY backend/pom.xml ./backend/
COPY backend/src ./backend/src/

# Build the backend
WORKDIR /app/backend
RUN mvn clean package -DskipTests

# Run stage
FROM amazoncorretto:17
WORKDIR /app
COPY --from=build /app/backend/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
