# Retro README Assets

Next.js App Router + TypeScript로 만드는 GitHub README용 동적 SVG 위젯입니다.
설계 문서의 첫 구현 범위인 **Phase 1–2**를 구현했습니다.

## 배포 서비스

- 카탈로그: https://retro-readme-assets.vercel.app
- 위젯 미리보기: https://retro-readme-assets.vercel.app/widgets/retro
- 기본 SVG: https://retro-readme-assets.vercel.app/api/widgets/retro
- 정적 SVG: https://retro-readme-assets.vercel.app/api/widgets/retro?animation=none
- 테마와 연락처 예시: https://retro-readme-assets.vercel.app/api/widgets/retro?theme=peach&name=Minchae&email=hello%40example.com&animation=none

## 로컬 실행

Node.js 20.9 이상을 사용하세요.

```bash
npm ci
npm run dev
```

- 카탈로그: http://localhost:3000
- 위젯 미리보기: http://localhost:3000/widgets/retro
- 기본 SVG: http://localhost:3000/api/widgets/retro
- 정적 SVG: http://localhost:3000/api/widgets/retro?animation=none
- 테마와 연락처: http://localhost:3000/api/widgets/retro?theme=peach&name=Minchae&email=hello%40example.com&animation=none

`/widgets/retro`에서도 같은 쿼리를 사용합니다. 미리보기와 API는 같은
`generateRetroSvg(config)` 함수를 호출합니다. 원본 HTML은 루트와
`reference/retro_readme_widget_compact.html`에 그대로 보존했습니다.

## 파라미터

| 키                      | 최대 글자 수 / 허용값           | 기본값                  |
| ----------------------- | ------------------------------- | ----------------------- |
| title                   | 34                              | CONNECT.EXE             |
| headline                | 48, 최대 2줄                    | Want to build together? |
| cta                     | 28                              | Let's connect!          |
| name                    | 36                              | Suhrin Huh              |
| role                    | 42                              | Backend Developer       |
| about                   | 260, 표시 영역 내 최대 6줄      | 기본 영문 소개          |
| theme                   | mint / peach / lavender / night | mint                    |
| email / blog / linkedin | 각각 72                         | 빈 값, 표시하지 않음    |
| animation               | typing / none                   | typing                  |

누락되거나 공백인 소개 필드는 기본값으로, 잘못된 열거형도 기본값으로 처리합니다.
연락처는 모두 선택이며 전부 비우면 About Me가 확장됩니다. GitHub 연락처는 없습니다.
문자 수는 Unicode 코드 포인트 기준입니다. XML에서 허용되지 않는 문자는 제거하고
특수문자는 이스케이프합니다. 긴 텍스트는 줄바꿈하거나 표시 영역에 맞춰 말줄임합니다.
쿼리는 `URLSearchParams`로 인코딩하세요. 쿼리 정보는 공개됩니다.

API는 `image/svg+xml; charset=utf-8`, `X-Content-Type-Options: nosniff`,
`Cache-Control: public, s-maxage=3600, stale-while-revalidate=86400`을 반환합니다.

## README에 삽입

아래 코드를 README에 붙여 넣고 `name`, `theme` 등의 쿼리를 수정하세요.

```html
<img
  src="https://retro-readme-assets.vercel.app/api/widgets/retro?name=Minchae&amp;theme=mint&amp;animation=none"
  alt="My retro introduction"
  width="100%"
/>
```

페이지 주소가 아닌 `/api/widgets/retro` 이미지 주소를 사용합니다.
SVG SMIL로 타이핑 → 대기 → 역순 삭제 → 대기를 반복합니다.
실제 GitHub README에서의 재생은 아직 검증하지 않았습니다. 정적 이미지는
`animation=none`으로 제공합니다. DB, 계정, GitHub API, 별도 환경변수는 필요 없습니다.

## 파일 구성

- `src/lib/widgets/retro/`: 타입, 기본값, 쿼리 파서, DOM에 의존하지 않는 SVG 렌더러
- `src/lib/themes.ts`, `src/lib/svg-utils.ts`: 테마, XML 처리, 줄바꿈 유틸리티
- `src/app/api/widgets/retro/route.ts`: SVG 응답 엔드포인트
- `src/app/page.tsx`, `src/app/widgets/retro/page.tsx`: 카탈로그와 쿼리 기반 미리보기
- `src/tests/retro.test.ts`: 파싱, 테마/연락처 조합, 보안 입력, 애니메이션, API 계약 테스트

## 검증

```bash
npm test
npm run lint
npm run typecheck
npm run build
npm run start
```

운영 의존성은 `npm audit --omit=dev`로 확인할 수 있습니다. 현재 개발용
`eslint-config-next`의 전이 의존성(`braces` 경유)에서 high 5건이 보고됩니다.
권장 자동 수정은 Next.js 14용 린트 설정으로 내려가므로 적용하지 않았습니다.

다음 범위는 Phase 3의 React 편집 폼, 복사·다운로드·초기화와 Phase 4의
실제 GitHub 애니메이션 검증입니다. Vercel 연결 도메인은
https://retro-readme-assets.vercel.app 입니다.
