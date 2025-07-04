# 냥쿤OS 💕

픽셀 아트 스타일의 개인용 웹 데스크탑으로, 커플을 위한 추억 관리 시스템입니다.

## ✨ 주요 기능

- 🖥️ **픽셀 데스크탑**: 90년대 스타일의 GUI 인터페이스
- 📷 **사진첩**: Vercel Blob을 이용한 사진 업로드/관리 시스템
- 🗓️ **타임라인**: 중요한 순간들을 시간순으로 기록하는 월드맵
- 💌 **편지함**: 서로에게 보내는 편지 관리 시스템
- 🤖 **냥GPT**: Claude API를 이용한 AI 챗봇
- 🔐 **관리자 시스템**: Firebase 인증을 통한 보안 관리

## 🚀 기술 스택

- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Backend**: Vercel Serverless Functions
- **Storage**: Vercel Blob (파일), Firebase Firestore (메타데이터)
- **Authentication**: Firebase Auth
- **AI**: Anthropic Claude API
- **Deployment**: Vercel

## 📦 설치 및 실행

### 환경변수 설정

`.env` 파일을 생성하고 다음 내용을 추가:

```env
# Vercel Blob 토큰
BLOB_READ_WRITE_TOKEN=your_blob_token_here

# Claude API 키
ANTHROPIC_API_KEY=your_claude_api_key_here
```

### 로컬 개발

```bash
# 의존성 설치
npm install

# 개발 서버 실행
vercel dev
```

### 배포

```bash
# Vercel CLI 설치
npm install -g vercel

# 배포
vercel --prod
```

## 📁 파일 구조

```
nyangOS/
├── index.html              # 메인 데스크탑
├── package.json            # 의존성 관리
├── vercel.json             # Vercel 배포 설정
├── api/                    # 서버리스 함수
│   ├── claude.js           # 챗봇 API
│   ├── upload.js           # 파일 업로드
│   ├── delete.js           # 파일 삭제
│   └── data/
│       ├── load.js         # 데이터 로드
│       └── upload.js       # 데이터 저장
├── apps/                   # 개별 앱들
│   ├── admin.html          # 관리자 페이지
│   ├── login.html          # 로그인 페이지
│   ├── photos.html         # 사진첩
│   ├── timeline.html       # 타임라인
│   ├── chatbot.html        # 챗봇
│   ├── lettersTo.html      # 보낸 편지함
│   └── lettersFrom.html    # 받은 편지함
└── style/                  # CSS 스타일시트
    └── *.css
```

## 🎮 사용법

1. **메인 데스크탑**: 아이콘을 더블클릭하여 앱 실행
2. **관리자 로그인**: `/apps/login.html`에서 Firebase 인증
3. **데이터 관리**: 관리자 페이지에서 사진, 타임라인, 편지 관리
4. **실시간 동기화**: 모든 데이터는 Vercel Blob에 저장되어 실시간 동기화

🔧 API 엔드포인트

- `POST /api/upload` - 파일 업로드
- `DELETE /api/delete` - 파일 삭제
- `GET /api/data/load` - 데이터 로드
- `POST /api/data/upload` - 데이터 저장
- `POST /api/claude` - 챗봇 대화


🎨 디자인 컨셉

90년대 윈도우 95 스타일의 픽셀 아트 GUI를 현대적으로 재해석했습니다. Press Start 2P 폰트와 네온 그린 컬러로 레트로 감성을 극대화했습니다.

📝 라이센스

개인 프로젝트용으로 제작되었습니다.


Made for 냥쿤