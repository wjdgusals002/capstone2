#!/bin/bash

# 드론 세그멘테이션 앱 실행 스크립트

echo "🚀 드론 부품 세그멘테이션 애플리케이션 시작..."
echo ""

# 터미널 색상
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 백엔드 실행 함수
start_backend() {
    echo -e "${YELLOW}📦 백엔드 서버 시작 중...${NC}"
    cd backend
    
    # Python 의존성 확인
    if ! pip list | grep -q fastapi; then
        echo -e "${RED}⚠️  FastAPI가 설치되지 않았습니다. 의존성을 설치합니다...${NC}"
        pip install -r requirements.txt --break-system-packages
    fi
    
    # 모델 파일 확인
    if [ ! -f "../models/best_model_v2.pth" ]; then
        echo -e "${RED}⚠️  경고: models/best_model_v2.pth 파일을 찾을 수 없습니다.${NC}"
        echo "   모델 파일을 배치한 후 다시 실행해주세요."
    fi
    
    # 백엔드 실행
    echo -e "${GREEN}✅ 백엔드 서버 실행: http://localhost:8000${NC}"
    uvicorn app:app --reload --host 0.0.0.0 --port 8000 &
    BACKEND_PID=$!
    
    cd ..
}

# 프론트엔드 실행 함수
start_frontend() {
    echo -e "${YELLOW}🎨 프론트엔드 서버 시작 중...${NC}"
    
    # Node 모듈 확인
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}📦 의존성 설치 중...${NC}"
        npm install
    fi
    
    # 프론트엔드 실행
    echo -e "${GREEN}✅ 프론트엔드 서버 실행: http://localhost:5173${NC}"
    npm run dev &
    FRONTEND_PID=$!
}

# 종료 핸들러
cleanup() {
    echo ""
    echo -e "${YELLOW}🛑 서버 종료 중...${NC}"
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo -e "${GREEN}✅ 모든 서버가 종료되었습니다.${NC}"
    exit 0
}

trap cleanup SIGINT SIGTERM

# 메인 실행
echo "=========================================="
echo "  드론 부품 세그멘테이션 애플리케이션"
echo "=========================================="
echo ""

start_backend
sleep 3  # 백엔드가 시작될 때까지 대기

start_frontend
sleep 2

echo ""
echo -e "${GREEN}=========================================="
echo "✅ 애플리케이션이 실행되었습니다!"
echo "=========================================="
echo ""
echo "📍 백엔드 API:  http://localhost:8000"
echo "📍 API 문서:    http://localhost:8000/docs"
echo "📍 프론트엔드:  http://localhost:5173"
echo ""
echo "🛑 종료하려면 Ctrl+C를 누르세요"
echo -e "==========================================${NC}"
echo ""

# 서버들이 계속 실행되도록 대기
wait
