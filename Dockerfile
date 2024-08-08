# 베이스 이미지 설정
FROM node:20.11.1-slim

# 작업 디렉토리 설정
WORKDIR /usr/src/app

# 종속성 파일 복사 및 설치
COPY package*.json ./
RUN npm install

# 불필요한 캐시 제거
RUN npm install && npm cache clean --force

# 소스 파일 복사
COPY . .

# 애플리케이션 실행
# CMD ["npm", "run", "start"]