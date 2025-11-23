/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  // 추가 환경 변수가 있으면 여기에 추가
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
