# CSEC — 악성파일 탐지 플랫폼 (Frontend)

머신러닝(CNN · Random Forest) 기반으로 **EXE / PDF 파일의 악성 여부를 정적 분석**하는 CSEC 플랫폼의 웹 프론트엔드입니다. (조선대학교 산학프로젝트1)

업로드한 파일을 분석해 **악성/정상 판정**과 그 **근거(SHAP · Grad-CAM · 공격 체인)**, 분석 기록, 모델 정보를 제공합니다.

- 🔗 **데모(배포):** https://web-front-test.netlify.app
- 🔗 **백엔드 저장소:** https://github.com/chosun-capstone-team-1/web

---

## 주요 기능

- **파일 분석** — 드래그앤드롭 / 클릭으로 파일 업로드 → 악성 판정 · 신뢰도 · 탐지 근거
- **설명가능성(XAI)** — SHAP 막대그래프 · Grad-CAM · 공격 체인(MITRE) · 규칙 기반 근거
- **QR / URL 검사** — PC는 QR **이미지 업로드**, 모바일은 **카메라 스캔** + URL 직접 입력(유효성 검사 포함)
- **분석 기록** — 페이지네이션 · 악성 행 강조 · 검색 / 필터
- **모델 정보** — 활성 모델 목록 · 정확도
- **로그인(JWT)** — 회원은 기록 조회 / 보고서, 익명은 3회까지
- 백엔드 미연동 시 **데모 폴백**으로 UI 흐름 유지

## 기술 스택

React 19 · Vite · React Router v7 · TanStack Query · React Hook Form · axios · js-cookie · uuid · html5-qrcode · @phosphor-icons/react · Tailwind CSS

---

## 프론트엔드 실행

```bash
npm install
npm run dev        # http://localhost:5173
```

- 빌드: `npm run build` · 미리보기: `npm run preview` · 린트: `npm run lint`
- `vite.config.js`가 `/api` 요청을 백엔드(`http://127.0.0.1:8000`)로 프록시합니다. 실제 분석을 보려면 백엔드를 먼저 띄워야 하며(아래 참고), 백엔드 없이도 **데모 폴백**으로 화면은 동작합니다.

## 백엔드 실행 (별도 저장소)

백엔드는 팀 모노레포 **[chosun-capstone-team-1/web](https://github.com/chosun-capstone-team-1/web)** 에 있습니다. (FastAPI + PostgreSQL + Redis, Docker)

```bash
git clone https://github.com/chosun-capstone-team-1/web.git
cd web

# backend/.env 작성
cat > backend/.env <<'EOF'
DATABASE_URL=postgresql+psycopg2://postgres:postgres@db:5432/mld-backend-db
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_DB=0
SECRET_KEY=local-development-secret-key
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
OPENAI_API_KEY=
EOF

docker compose -f docker-compose.yml up -d --build backend db redis
# → http://127.0.0.1:8000   (FastAPI 문서: /docs)
```

> ⚠️ **모델 가중치**(`CNN_exe.pth`, `Randomforest_pdf.pkl`)는 저장소에 포함되어 있지 않습니다(git 제외).
> 팀원 / EC2에서 받아 백엔드의 `Model/` 폴더에 넣어야 실제 추론이 동작합니다.
> 없으면 `POST /analyze-full`이 503을 반환하고, 프론트는 데모 결과로 폴백합니다.

### 백엔드 API 요약

| Method · Path | 설명 |
|---|---|
| `POST /users/register`, `/users/login` | 회원가입 / 로그인 (JWT) |
| `POST /analyze-full` | 파일(EXE/PDF) 분석 |
| `GET /history/my-analyses-full` | 분석 기록 (인증 필요) |
| `GET /limit/upload-remaining` | 익명 업로드 잔여 횟수 |

---

## 디렉토리 구조

```
src/
├─ api/          # 백엔드 호출 + 응답 어댑터(adapt.js)
├─ auth/         # AuthContext (JWT)
├─ components/   # 공통 UI · 결과(SHAP/GradCAM/AttackChain) · 레이아웃
├─ hooks/        # useScan · useHistory · useModels · useUploadLimit ...
├─ pages/        # Upload · Result · Report · History · Models · Login
└─ mocks/        # 데모 폴백 데이터
```
