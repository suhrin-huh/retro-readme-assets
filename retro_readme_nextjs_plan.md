# Retro README Assets — Next.js 프로젝트 설계 및 작업 플로우

> **목표:** 기존 `retro_readme_widget_compact.html`을 디자인·동작의 기준으로 삼아, Vercel에 **하나의 Next.js 프로젝트**를 배포하고 여러 개의 GitHub README용 동적 이미지(SVG) 에셋을 제공한다.
>
> **현재 범위(MVP):** `retro` 위젯 한 종류. 추후 terminal, stack, project 등 추가. 별도의 DB·사용자 계정·GitHub API는 필요하지 않다.

## 1. 개발 결과물과 사용 흐름

1. 사용자가 `/widgets/retro`에 접속해서 제목, 소개, 테마, 연락처를 편집한다.
2. 화면의 미리보기가 같은 **SVG 생성 함수**를 사용해 변경된다.
3. 설정 페이지가 쿼리 문자열을 만들고, README용 `<img>` 코드를 생성한다.
4. GitHub README는 `https://YOUR_DOMAIN/api/widgets/retro?...` 주소를 이미지로 불러온다.
5. Vercel의 API가 쿼리를 검증하고 SVG를 만들어 `image/svg+xml`로 응답한다.

**중요:** `page.tsx`는 편집 UI를 표시하는 **HTML 페이지**이고, `route.ts`는 이미지 자체를 반환하는 **API**다. README에는 페이지 URL이 아니라 API URL을 입력한다.

예시 (실제 배포 도메인으로 교체):

```html
<img src="https://YOUR_DOMAIN/api/widgets/retro?name=Suhrin%20Huh&amp;role=Backend%20Developer&amp;theme=mint" alt="My retro introduction" width="100%" />
```

HTML의 `src` 속성에서는 쿼리 구분자 `&`를 `&amp;`로 적는 것이 안전하다. Markdown 이미지 문법이나 브라우저 주소창에서는 일반 `&`를 사용한다.

## 2. 프로젝트 생성 및 초기 설정

필요 도구: Node.js LTS, npm, Git, GitHub 계정, Vercel 계정.

```bash
npx create-next-app@latest retro-readme-assets --typescript --eslint --app --src-dir --import-alias '@/*'
cd retro-readme-assets
npm run dev
```

- 브라우저에서 `http://localhost:3000` 확인.
- 별도의 `vercel.json`은 최초에는 필요하지 않다.
- 정적 SVG 생성을 먼저 구현한다. `next/og`나 브라우저 기반 스크린샷 도구는 현 시점의 필수 의존성이 아니다.
- 로컬에서 이미지를 테스트할 때: `http://localhost:3000/api/widgets/retro?theme=mint`.

## 3. 권장 폴더 구조

```text
retro-readme-assets/
├── reference/
│   └── retro_readme_widget_compact.html  # 기존 HTML 원본, 참고 전용
├── public/
│   └── assets/                            # 선택: 장식 이미지·아이콘 등 정적 파일
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx                        # 에셋 카탈로그/서비스 소개
│   │   ├── globals.css
│   │   ├── widgets/
│   │   │   └── retro/
│   │   │       └── page.tsx                # retro 설정 및 미리보기 페이지
│   │   └── api/
│   │       └── widgets/
│   │           └── retro/
│   │               └── route.ts           # GET: 쿼리 → SVG 이미지 응답
│   ├── components/
│   │   ├── widgets/
│   │   │   ├── RetroEditor.tsx             # 입력 폼 (클라이언트 컴포넌트)
│   │   │   ├── WidgetPreview.tsx           # SVG/이미지 미리보기
│   │   │   └── EmbedCode.tsx               # URL, README 코드 복사
│   │   └── ui/                             # 공용 UI (필요할 때)
│   ├── lib/
│   │   ├── widgets/
│   │   │   └── retro/
│   │   │       ├── types.ts                # RetroConfig 타입
│   │   │       ├── defaults.ts             # 기본값, 파라미터 규칙
│   │   │       ├── render-svg.ts           # 순수 함수: config → SVG string
│   │   │       └── parse-query.ts          # URLSearchParams → 검증된 config
│   │   ├── themes.ts                       # mint/peach/lavender/night
│   │   └── svg-utils.ts                    # XML 이스케이프, 줄바꿈, 숫자 제한
│   └── tests/                              # 선택: 로직 테스트
│       └── retro.test.ts
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

**확장 규칙:** 신규 위젯마다 `src/lib/widgets/<type>/`에 타입·기본값·렌더러를 추가하고, `src/app/api/widgets/<type>/route.ts`에서 이를 호출한다. 편집 화면은 필요에 따라 별도 추가한다. 새 프로젝트나 새 Vercel 배포가 필요하지 않다.

## 4. 기존 HTML에서 옮길 기능 — 정확한 대응표

| 기존 HTML 요소/함수 | 목적지 | 구현 시 주의사항 |
|---|---|---|
| `#title`, `#headline`, `#cta` | `RetroEditor.tsx` + `RetroConfig` | 기본값과 글자 수 제한 유지 |
| `#name`, `#role`, `#about` | `RetroEditor.tsx` + `RetroConfig` | 한글·특수문자 지원, 텍스트 줄바꿈 |
| `#email`, `#blog`, `#linkedin` | `RetroConfig` | 모두 **선택 입력**, 빈 값은 SVG에서 숨김 |
| `themes` 객체 | `src/lib/themes.ts` | mint, peach, lavender, night |
| `getSvg()` | `render-svg.ts`의 `generateRetroSvg(config)` | `document`, DOM 접근, 전역 상태를 제거 |
| `esc()`, `wrap()` | `svg-utils.ts` | XML 문자열 이스케이프 및 문장 줄바꿈 |
| `startTyping()` | 미리보기/렌더러의 애니메이션 설계 | HTML 타이핑과 SVG 애니메이션의 구현 방식은 다름 |
| `update()` | React state 및 이벤트 | 편집 상태를 미리보기·URL에 동일하게 반영 |
| SVG 저장 / 코드 복사 | `EmbedCode.tsx` | SVG 다운로드, 이미지 URL 복사, README 코드 복사 기능 구분 |
| About Me / Contact 창 레이아웃 | `render-svg.ts` | 기존의 컴팩트한 창 높이와 패널 위치 유지 |

**주의:** 기존 HTML의 CSS 기반 미리보기와 `getSvg()`로 만든 SVG는 서로 별도 구현이다. 최종 Next.js 버전은 **`generateRetroSvg(config)`를 미리보기와 API 양쪽에서 공유**해야 디자인 불일치를 최소화할 수 있다.

## 5. 쿼리 파라미터 명세 (MVP)

| Query | 타입 | 기본값/처리 | 규칙 |
|---|---|---|---|
| `title` | string | `CONNECT.EXE` | 최대 34자 |
| `headline` | string | `Want to build together?` | 최대 48자; 2줄 |
| `cta` | string | `Let's connect!` | 최대 28자 |
| `name` | string | `Suhrin Huh` | 최대 36자 |
| `role` | string | `Backend Developer` | 최대 42자 |
| `about` | string | 기본 영문 소개 문구 | 최대 260자; 화면에 맞게 줄바꿈 |
| `theme` | enum | `mint` | `mint`, `peach`, `lavender`, `night` |
| `email` | string | 빈 값 | 선택 항목, 최대 72자 |
| `blog` | string | 빈 값 | 선택 항목, 최대 72자 |
| `linkedin` | string | 빈 값 | 선택 항목, 최대 72자 |
| `animation` | enum | `typing` | `typing` / `none` (실제 GitHub 호환성 검증 필요) |

- **GitHub 연락처 항목은 포함하지 않는다.** (기존 요청 반영)
- `email`, `blog`, `linkedin` 중 값이 있는 항목만 Contact에 표시한다.
- Contact가 전부 비어 있으면 Contact 패널을 숨기고 About Me를 가로로 확장한다.
- 필수 입력값이 빠지면 기본값을 적용한다. 다만 Contact는 누락되면 숨김 처리한다.
- 길거나 이상한 입력은 서버에서 제한한다. 잘못된 테마는 기본 테마로 돌리거나 HTTP 400을 반환하도록 정책을 통일한다.
- `encodeURIComponent()` 또는 `URLSearchParams`로 쿼리를 생성한다. 쿼리에는 비밀값을 넣지 않는다.

## 6. 핵심 API 계약

**요청**

```http
GET /api/widgets/retro?title=ABOUT.EXE&name=Suhrin&role=Backend%20Developer&theme=mint
```

**응답**

- HTTP 200
- `Content-Type: image/svg+xml; charset=utf-8`
- SVG 문자열 본문
- 예: `Cache-Control: public, s-maxage=3600, stale-while-revalidate=86400`
- 예: `X-Content-Type-Options: nosniff`

아래는 **인터페이스 초안**이다. 구현 완료 코드가 아니다.

```ts
// src/lib/widgets/retro/types.ts
export type RetroTheme = 'mint' | 'peach' | 'lavender' | 'night';
export interface RetroConfig {
  title: string;
  headline: string;
  cta: string;
  name: string;
  role: string;
  about: string;
  theme: RetroTheme;
  email: string;
  blog: string;
  linkedin: string;
  animation: 'typing' | 'none';
}

// src/lib/widgets/retro/render-svg.ts
export function generateRetroSvg(config: RetroConfig): string {
  // 기존 getSvg()를 순수 함수로 옮긴다.
  throw new Error('TODO');
}
```

```ts
// src/app/api/widgets/retro/route.ts (구조 예시)
import { generateRetroSvg } from '@/lib/widgets/retro/render-svg';
import { parseRetroQuery } from '@/lib/widgets/retro/parse-query';

export async function GET(req: Request) {
  const config = parseRetroQuery(new URL(req.url).searchParams);
  const svg = generateRetroSvg(config);
  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
```

## 7. 구현 플로우 / 개발 순서

### Phase 0 — 기준 파일 확정

- [ ] `reference/retro_readme_widget_compact.html`에 기존 HTML 저장
- [ ] 현재 HTML에서 적용된 기능 확인: 4가지 테마, 타이핑→삭제 반복, 선택형 Contact, GitHub 항목 없음, 컴팩트 높이
- [ ] 원본 HTML을 변경하지 않고 Git에 보존

**완료 조건:** 브라우저에서 원본 HTML을 열어 최종 디자인 확인.

### Phase 1 — Next.js 프로젝트 생성

- [ ] Next.js / TypeScript / App Router 프로젝트 생성
- [ ] 추천 폴더 생성 및 초기 Git 커밋
- [ ] `/`와 `/widgets/retro` 페이지 만들기

**완료 조건:** `npm run dev`로 두 페이지 정상 접속.

### Phase 2 — SVG 엔진 이식 (가장 중요)

- [ ] `RetroConfig`, 기본값, 테마 정의
- [ ] `getSvg()`의 DOM 접근을 전부 `config` 매개변수로 대체
- [ ] SVG의 레트로 창·About Me·Contact 레이아웃 유지
- [ ] Contact의 선택 노출 / About Me 자동 확장 기능 유지
- [ ] `escapeXml` 및 텍스트 줄바꿈 처리
- [ ] `/api/widgets/retro` GET 엔드포인트 연결

**완료 조건:** API URL을 브라우저에서 열면 HTML이 아닌 SVG 이미지가 보이며, 쿼리 변경 시 결과가 달라진다.

### Phase 3 — 편집 UI 이식

- [ ] 기존 입력 항목 및 테마 선택을 React 상태로 구현
- [ ] 같은 `generateRetroSvg()` 결과로 미리보기 제공
- [ ] 선택 입력 Contact 삭제·수정 테스트
- [ ] 이미지 URL 생성, README HTML/Markdown 코드 복사
- [ ] 초기화 / SVG 다운로드 기능 이식

**완료 조건:** 입력 → 미리보기 → 코드 복사까지 웹페이지에서 수행 가능.

### Phase 4 — 애니메이션 호환성 검증

- [ ] HTML 미리보기의 타이핑→삭제 무한 반복 유지
- [ ] SVG로 반환할 경우 SMIL/SVG 애니메이션 재생 확인
- [ ] GitHub README에서 **실제로 재생되는지** 별도로 테스트
- [ ] 지원되지 않으면 `animation=none` 정적 SVG 또는 추후 GIF/APNG 렌더러 제공

**주의:** SVG `<img>` 안에서는 JavaScript를 실행할 수 없으며 GitHub가 SVG를 프록시·정제하는 과정에서 애니메이션이 제한될 수 있다. HTML 미리보기에서 된다고 README에서도 된다고 가정하지 않는다.

### Phase 5 — 테스트 및 보안

- [ ] 파라미터 누락 시 기본 이미지 반환
- [ ] 테마 4종과 Contact 0/1/2/3개 케이스 확인
- [ ] About Me 긴 문구, 영문/한글, 줄바꿈 확인
- [ ] `<`, `>`, `&`, 따옴표 입력 시 SVG 구조가 깨지지 않는지 확인
- [ ] 쿼리의 최대 길이 및 색상/테마 허용 목록 적용
- [ ] 이미지 응답 MIME, HTTP 상태, 캐시 헤더 확인
- [ ] 모바일·데스크톱 설정 화면 레이아웃 확인

### Phase 6 — Vercel 배포

1. 프로젝트를 GitHub 저장소에 Push한다.
2. Vercel에서 **Add New → Project → Import Git Repository**를 선택한다.
3. Framework Preset이 Next.js로 인식되는지 확인한다.
4. 최초에는 추가 환경변수 없이 배포한다.
5. 배포 후 `https://YOUR_DOMAIN/widgets/retro`와 `https://YOUR_DOMAIN/api/widgets/retro?...`를 각각 확인한다.
6. 저장소 README의 `<img>`에 API URL을 넣고 표시 여부 확인.
7. 수정 후 GitHub에 Push하면 Vercel 자동 배포로 반영되는지 확인.

**완료 조건:** 타인이 개인 URL 쿼리를 바꿔 자신의 README에서 위젯을 사용할 수 있다.

## 8. 향후 에셋 추가 규칙

- `/api/widgets/retro` : 레트로 About Me / Contact
- `/api/widgets/terminal` : 터미널 카드
- `/api/widgets/stack` : 기술 스택 카드
- `/api/widgets/project` : 프로젝트 카드

새 위젯은 **설정 타입 → 쿼리 파서 → SVG 렌더러 → API → 설정 UI** 순서로 추가한다. 공통 XML 이스케이프, 테마, 복사 UI는 재사용한다.

## 9. 개발 중 피해야 할 실수

1. **HTML 전체를 API 응답으로 보내면 README 이미지로 사용할 수 없다.** API는 SVG 또는 PNG/GIF 바이트를 반환해야 한다.
2. 브라우저 DOM을 참조하는 `getSvg()`를 서버에서 그대로 실행하면 오류가 난다. 먼저 순수 함수로 분리한다.
3. Contact 필드를 필수 입력으로 바꾸지 않는다. GitHub 필드도 되살리지 않는다.
4. SVG에 쿼리 문자열을 그대로 붙이지 않는다. XML 이스케이프, 길이 제한, 열거형 검증을 적용한다.
5. GitHub README는 페이지의 JS/CSS를 실행하지 않는다. **이미지 파일 자체의 표현 능력** 안에서 구현한다.
6. SVG의 CSS/SMIL 애니메이션과 GitHub 표시 여부는 별개다. 실제 README를 기준으로 테스트한다.
7. README 이미지 URL의 모든 쿼리 정보는 공개된다. 비밀번호·토큰·비공개 개인정보를 전달하지 않는다.

## 10. 첫 작업에서 AI 코딩 도구에 전달할 요청

> 첨부한 `retro_readme_widget_compact.html`을 디자인·기능의 기준으로 삼아 Next.js(App Router) + TypeScript 프로젝트를 구성해 주세요. 위 Markdown의 폴더 구조와 작업 순서를 따르세요. 우선 Phase 1~2만 진행해 주세요. 기존 HTML의 `getSvg()`를 DOM 의존성이 없는 `generateRetroSvg(config)`로 분리하고, `/api/widgets/retro`가 쿼리 파라미터를 검증해 `image/svg+xml`을 반환하게 해 주세요. `mint/peach/lavender/night`, About Me의 타이핑·삭제 반복, 선택형 Email/Blog/LinkedIn, Contact가 비었을 때 About Me 확장, 컴팩트한 창 비율을 유지해야 합니다. GitHub 연락처 항목은 추가하지 마세요. 작성한 파일과 실행 방법 및 API 테스트 URL을 알려 주세요.

---

**추천 착수 순서:** 기존 HTML과 이 문서를 프로젝트에 넣은 뒤 **Phase 1~2(API에서 SVG 정상 출력)**를 먼저 완성한다. 그다음 설정 페이지와 Vercel 배포로 넘어가면 오류를 분리해 해결하기 쉽다.
