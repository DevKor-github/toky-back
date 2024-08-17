# 1. Build stage
FROM node:18-alpine AS build

WORKDIR /app

# package.json / package-lock.json / 소스코드 복사
ADD package*.json /app/

# 의존성 설치
RUN npm install

# 나머지 소스코드 복사
ADD . /app/

# 애플리케이션 빌드
RUN npm run build

# 2. Production stage
FROM node:18-alpine

WORKDIR /app

# 빌드 단계에서 생성된 빌드 아티팩트만 복사
COPY --from=build /app/dist /app/dist
COPY --from=build /app/package*.json /app/

# 프로덕션 의존성만 설치
RUN npm install --production

# 포트 번호 노출
EXPOSE 3080

# 애플리케이션 시작
ENTRYPOINT ["npm", "run", "start:prod"]
