# 🚀 프로젝트 설치 및 실행 가이드

## 📋 사전 준비사항

1. **Node.js 설치** (v18 이상)
   - https://nodejs.org/ 에서 다운로드 및 설치
   - 설치 확인: 터미널에서 `node --version` 실행

2. **코드 에디터**
   - VS Code 권장: https://code.visualstudio.com/

## 📂 1단계: 프로젝트 폴더 생성

```bash
# 새 폴더 생성
mkdir drone-analysis
cd drone-analysis
```

## 📝 2단계: 필수 파일 복사

다음 파일들을 생성하세요:

### 루트 폴더에 생성할 파일들:

```
drone-analysis/
├── index.html
├── main.tsx
├── App.tsx
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tsconfig.node.json
├── .gitignore
├── README.md
└── (나머지 폴더 및 파일들...)
```

### 폴더 구조 생성:

```bash
# components 폴더
mkdir components
mkdir components/ui

# styles 폴더
mkdir styles
```

## 🔧 3단계: package.json 확인

`package.json` 파일이 이렇게 되어있는지 확인:

```json
{
  "name": "drone-segmentation-analysis",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "lucide-react": "^0.552.0",
    "recharts": "^2.12.7"
  },
  "devDependencies": {
    "@types/react": "^18.3.1",
    "@types/react-dom": "^18.3.0",
    "typescript": "^5.6.2",
    "vite": "^6.0.1",
    "@vitejs/plugin-react": "^4.3.4",
    "tailwindcss": "^4.0.0"
  }
}
```

## 📦 4단계: 의존성 설치

터미널에서 프로젝트 폴더로 이동 후:

```bash
npm install
```

⏳ 설치가 완료될 때까지 기다리세요 (1-3분 소요)

## ▶️ 5단계: 개발 서버 실행

```bash
npm run dev
```

성공하면 다음과 같은 메시지가 표시됩니다:

```
VITE v6.0.1  ready in 500 ms

➜  Local:   http://localhost:3000/
➜  Network: use --host to expose
```

## 🌐 6단계: 브라우저에서 확인

브라우저를 열고 `http://localhost:3000` 으로 접속하세요!

---

## ❗ 문제 해결 (Troubleshooting)

### 1. "npm: command not found" 에러

➡️ Node.js가 설치되지 않았습니다. Node.js를 설치하세요.

### 2. 포트 3000이 이미 사용 중

```bash
# 다른 포트로 실행
npm run dev -- --port 3001
```

### 3. "Cannot find module" 에러

```bash
# node_modules 삭제 후 재설치
rm -rf node_modules package-lock.json
npm install
```

### 4. TypeScript 에러

```bash
# TypeScript 캐시 삭제
rm -rf node_modules/.vite
npm run dev
```

### 5. 빈 화면만 보이는 경우

- 브라우저 개발자 도구(F12)를 열어서 콘솔 에러 확인
- `index.html` 파일이 루트에 있는지 확인
- `main.tsx`에서 `./styles/globals.css` 경로 확인

### 6. Figma asset 이미지 에러

- `figma:asset/` 경로는 Figma Make 환경에서만 작동합니다
- 로컬에서는 실제 이미지 파일로 교체 필요:

```typescript
// DroneAnalysis.tsx 수정
// import exampleDrone from 'figma:asset/ed87bd30fc3eed49ce1ebae9834fbac62df79e10.png';
import exampleDrone from "/public/drone-example.png"; // 실제 이미지 경로
```

---

## 🎯 빠른 시작 (한 번에 실행)

```bash
# 1. 폴더 생성 및 이동
mkdir drone-analysis && cd drone-analysis

# 2. (파일들을 모두 복사한 후)

# 3. 의존성 설치
npm install

# 4. 개발 서버 실행
npm run dev
```

---

## 📱 프로덕션 빌드 (배포용)

```bash
# 빌드
npm run build

# 빌드 결과 미리보기
npm run preview
```

빌드된 파일은 `dist/` 폴더에 생성됩니다.

---

## 💡 추가 팁

1. **VS Code 확장 프로그램 추천**
   - ES7+ React/Redux/React-Native snippets
   - Tailwind CSS IntelliSense
   - ESLint
   - Prettier

2. **Hot Reload**
   - 파일을 수정하면 자동으로 브라우저가 새로고침됩니다

3. **디버깅**
   - 브라우저 개발자 도구(F12) → Console 탭에서 에러 확인

---

## 📞 도움이 필요하신가요?

문제가 계속 발생하면:

1. 에러 메시지 전체를 복사
2. 어떤 단계에서 문제가 발생했는지 확인
3. `node --version` 과 `npm --version` 결과 확인