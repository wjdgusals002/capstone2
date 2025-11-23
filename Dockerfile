# Python 3.10 이미지 사용
FROM python:3.10-slim

# 작업 디렉토리 설정
WORKDIR /app

# 시스템 패키지 업데이트 및 필수 라이브러리 설치
RUN apt-get update && apt-get install -y \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# backend 폴더로 이동
WORKDIR /app/backend

# requirements.txt 복사 및 의존성 설치
COPY backend/requirements.txt .
RUN pip install --no-cache-dir "numpy>=1.21.0,<1.27.0"
RUN pip install --no-cache-dir -r requirements.txt

# 전체 backend 코드 복사
COPY backend/ .

# 포트 노출
EXPOSE 8000

# 서버 실행 (Railway의 PORT 환경 변수 사용)
CMD sh -c "uvicorn app:app --host 0.0.0.0 --port ${PORT:-8000}"
