cd ./appserver/java-spring/
./gradlew dbTeardown -x test --stacktrace
./gradlew clean -x test --stacktrace