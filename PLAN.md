# 리뉴얼 구현 계획 — "JARVIS 스타일" AI 포트폴리오

> 상태: 초안 (구현 전 검토용)
> 대상 브랜치: `claude/loving-tesla-8gvi1c`

---

## 1. 한 줄 컨셉

**"스크롤해서 읽는 포트폴리오"에서 "말을 거는 포트폴리오"로.**

방문자가 사이트에 들어오면 YK의 AI 비서가 부팅되며 인사합니다. 소개, 경력, 기술 스택은
섹션으로 나열하지 않습니다. 방문자가 물어보면 AI가 답하고, 답에 맞는 **홀로그램 패널**을
화면에 직접 띄웁니다. 사이트 전체가 하나의 HUD 화면입니다.

> 저작권: 아이언맨 영화의 *분위기*(HUD, 리액터 코어, 차분한 집사형 말투)만 참고합니다.
> "JARVIS"라는 이름이나 마블 로고·사운드·이미지는 쓰지 않고 이름은 새로 정합니다(§9 참고).
> 이 문서에서는 임시로 **K.A.I.** (*Kwang's Autonomous Interface*)라고 부릅니다.

---

## 2. 지금 사이트의 문제

| 항목 | 현재 | 문제 |
|---|---|---|
| 구조 | Hero → About → Work → Stack → Contact | 흔한 템플릿형 포트폴리오. 기억에 남지 않음 |
| 콘텐츠 | 카드 3개, 회사 리스트, 기술 태그 | 정보는 있지만 방문자가 끝까지 읽지 않음 |
| 상호작용 | 스크롤과 텍스트 스크램블 | 수동적임 |
| 보안 | `VITE_SLACK_WEBHOOK_URL`이 공개 번들에 들어감 | 누구나 웹훅을 꺼내 스팸을 보낼 수 있음 |

**유지할 것:** 컬러 팔레트, 폰트(Space Grotesk / JetBrains Mono / Pretendard), 다크 톤,
그리드 배경, 스크램블 텍스트 효과(HUD와 잘 어울림), en/ko 이중 언어, SEO 메타데이터.

---

## 3. 화면 설계

### 3.1 레이아웃 (단일 화면, 스크롤 없음)

```
┌──────────────────────────────────────────────────────────────┐
│ K.A.I. v2.6 ● ONLINE            SEOUL 14:32 KST   [EN|KO] 🔊 │  ← 상단 상태 바 (mono)
│                                                              │
│   ┌─ PANEL ──────────┐                                       │
│   │ OUTSCHOOL        │          ╭───────────╮                │
│   │ React · GraphQL  │        ╭─┤  ◉ CORE   ├─╮              │  ← 중앙 리액터 코어
│   │ 2022 — present   │        │ ╰───────────╯ │              │    (상태에 따라 반응)
│   └──────────────────┘        ╰───────────────╯              │
│                                                  ┌─ PANEL ─┐ │  ← AI가 띄운 패널
│   > Who is YK?                                   │ STACK   │ │    (최대 3개, 흐르듯 배치)
│   K.A.I.: YK is a fullstack developer based in…  └─────────┘ │
│                                                              │  ← 대화 로그 (최근 3–4턴만)
│  [경력 요약] [가장 자랑할 프로젝트] [같이 일하려면?]          │  ← 추천 질문 칩
│  ┌──────────────────────────────────────────────── ⏎ 🎙 ┐    │
│  │ Ask me anything about YK…                            │    │  ← 입력창 (항상 하단 고정)
│  └──────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────┘
```

모바일: 코어가 위쪽으로 작아지고, 패널은 입력창 위에 바텀 시트처럼 한 장씩 쌓입니다.

### 3.2 리액터 코어 (메인 비주얼)

SVG 동심원 3–4겹, 회전하는 눈금 링, 중앙 글로우로 구성합니다. 기존 `HeroFX`(캔버스)를 대체합니다.
AI 상태를 그대로 보여주는 것이 핵심입니다.

| 상태 | 표현 |
|---|---|
| `idle` | 느린 회전, 은은한 호흡(opacity pulse) |
| `listening` (입력 중) | 타이핑할 때마다 링에 작은 진동 |
| `thinking` (첫 토큰 전) | 링이 빨라지고 `--acc-b` 보라색이 섞임 |
| `speaking` (스트리밍 중) | 들어오는 토큰 속도에 맞춰 중앙이 맥동 |
| `offline` (API 장애/한도 초과) | 채도를 낮추고 "BACKUP MODE" 표시 |

`prefers-reduced-motion`이면 회전을 끄고 색 변화만 남깁니다.

### 3.3 부팅 시퀀스 (첫 방문 2초 이내)

```
> INITIALIZING K.A.I. ............ OK
> LOADING PROFILE: YK ............ OK
> LINKING NEURAL CORE ............ OK
```

모노 폰트 3줄이 스크램블 효과로 지나간 뒤 코어가 켜지고 첫 인사가 타이핑됩니다.
첫 인사는 시간대에 맞춰 바뀝니다. 예: *"Good evening. I'm K.A.I., YK's assistant. What would you like to know?"*
재방문(`localStorage`)이면 부팅을 건너뛰고 *"Welcome back."*으로 시작합니다. 클릭하면 언제든 스킵됩니다.

### 3.4 컬러 팔레트 (기존 유지 + 상태용 토큰만 추가)

```css
:root {
  --bg: #04050a;          /* 유지 */
  --text: #eef1f7;        /* 유지 */
  --muted: #8b93a3;       /* 유지 */
  --faint: #5a6170;       /* 유지 */
  --line: rgba(255,255,255,.08);
  --acc-a: #9be7ff;       /* 유지 · HUD 메인 시안 (코어, 링, 강조) */
  --acc-b: #b3a6ff;       /* 유지 · thinking 상태, 보조 강조 */
  --grad: linear-gradient(100deg, var(--acc-a), var(--acc-b));

  /* 신규: HUD 전용 */
  --hud-glow: 0 0 24px rgba(155,231,255,.35);
  --hud-panel: rgba(155,231,255,.04);      /* 패널 배경: 시안을 아주 옅게 */
  --hud-edge: rgba(155,231,255,.28);       /* 패널 모서리 브래킷 */
  --warn: #ffcf7a;                          /* offline/rate-limit 상태에만 사용 */
}
```

패널은 사각 테두리 대신 **네 모서리 브래킷**(`⌜ ⌝ ⌞ ⌟`)만 그려 HUD 느낌을 냅니다.
나타날 때는 스캔라인이 위에서 아래로 훑고, 텍스트는 기존 `Scramble` 컴포넌트로 디코딩됩니다.

---

## 4. 핵심 아이디어: "AI가 UI를 조종한다"

일반 챗봇은 텍스트만 돌려줍니다. 여기서는 모델에 **UI 도구(tool)**를 주고, 답하면서 필요한
패널을 직접 띄우게 합니다. 이 프로젝트에서 가장 창의적인 부분입니다.

| 도구 | 입력 | 화면 동작 |
|---|---|---|
| `show_project` | `id` ("outschool", "plang", "markhub", "fave", …) | 프로젝트 홀로그램 카드(역할, 스택, 기간, 링크, 미리보기 이미지) |
| `show_stack` | `focus?` ("frontend" \| "mobile" \| "backend" \| "ai") | 기술 스택을 레이더/링 형태로 표시 |
| `show_timeline` | — | 경력 타임라인 패널 |
| `show_contact` | — | 이메일·GitHub·LinkedIn 카드 |
| `leave_message` | `name?`, `contact?`, `message` | 방문자 메시지를 서버를 통해 YK의 Slack으로 전송 (기존 연락 폼 대체) |

**대화 예시**

> **방문자:** 모바일 앱 만들어본 적 있어?
> **K.A.I.:** Yes. YK built Plang, an AI English-conversation app, with React Native and Ruby on Rails, and shipped it to both app stores. Pulling up the file now.
> *(화면 왼쪽에 `PLANG` 패널이 스캔라인과 함께 나타남)*

> **방문자:** 같이 일하고 싶은데 연락 남겨줘. 나는 Jane, jane@acme.com
> **K.A.I.:** Done. I've passed your message to YK. Expect a reply at jane@acme.com.
> *(`TRANSMISSION SENT` 확인 패널)*

`leave_message`가 연락 폼을 대신하므로 사이트에서 폼 UI를 없앨 수 있습니다.
Slack 웹훅은 서버(Worker)에만 있으므로 §2의 보안 문제도 함께 해결됩니다.

---

## 5. 아키텍처

GitHub Pages는 정적 호스팅이라 API 키를 둘 곳이 없습니다. 그래서 **얇은 서버리스 프록시를 하나** 추가합니다.

```
 Browser (GitHub Pages, React)
   │  POST /chat  { messages[≤10], locale }      ← SSE 스트림 응답
   ▼
 Cloudflare Worker  (무료 플랜으로 충분)
   ├─ Origin 체크 (ykdhan.github.io만 허용)
   ├─ IP별 rate limit + 일일 전체 예산 상한
   ├─ system prompt = 페르소나 + profile.json   ← 캐시 대상
   ├─ Anthropic Messages API (streaming, tools)
   └─ leave_message → Slack webhook (secret)
```

**왜 Cloudflare Worker인가:** 무료 플랜(일 10만 요청), 콜드 스타트가 거의 없고, SSE 스트리밍과
시크릿 관리, rate limit 바인딩을 지원합니다. Vercel Functions도 가능하지만 사이트가 이미 GitHub Pages에 있으니
API만 Worker로 분리하는 편이 가장 단순합니다.

### 5.1 모델: Claude Haiku 5.5 (`claude-haiku-5-5`)

| 항목 | 값 |
|---|---|
| 가격 | 입력 $0.10 / 출력 $0.50 (100만 토큰당, 프롬프트 100K 이하 기준) |
| 프롬프트 캐싱 최소 길이 | 512 토큰. 프로필 system prompt(약 3–5K 토큰)는 충분히 캐시됨 |
| 설정 | `output_config: { effort: "low" }` (짧은 Q&A이므로 지연 최소화), `max_tokens: 600`, streaming |
| 주의 | assistant prefill 불가(400), `temperature` 등 샘플링 파라미터 기본값 외 사용 불가 |

**비용 추정 (질문 1건):**
캐시된 system 약 4K 토큰(캐시 읽기는 입력가의 약 1/10) + 대화 이력 약 1K + 출력 약 250 토큰
→ **약 $0.0003 / 질문.** 질문 1만 건이어도 약 $3입니다. 그래도 남용에 대비해 일일 예산 상한을 둡니다(§5.3).

### 5.2 요청 처리 흐름 (Worker 내부)

1. 요청 검증: Origin 확인, `messages` 최대 10개, 각 메시지 500자 이하
2. rate limit: IP당 분당 6회, 일 40회. 전체 일일 요청 상한(예: 3,000회)을 넘으면 `429`와 함께 클라이언트는 **BACKUP MODE**로 전환
3. Anthropic 호출 (`stream: true`, `tools`, `cache_control`을 system 블록에 지정)
4. `tool_use`가 오면:
   - UI 도구(`show_*`): 클라이언트로 `{type:"ui", tool, input}` 이벤트를 바로 보내고, 서버에서 `tool_result: "displayed"`를 붙여 **한 번 더 호출**해 이어지는 말을 받음 (루프는 최대 2회)
   - `leave_message`: Slack 전송 후 성공/실패를 `tool_result`로 반환
5. 텍스트 델타는 `{type:"text", delta}` SSE 이벤트로 중계, 마지막에 `{type:"done"}`
6. 로그는 남기지 않음(개인정보 최소화). 필요하면 질문 카테고리 집계만 별도로

### 5.3 남용 방지 / 안전장치

- 서버에서 rate limit과 일일 예산 상한 적용 (위 참고)
- Anthropic 콘솔에서 이 프로젝트 전용 API 키를 만들고 **월 사용 한도(spend limit)** 설정
- 필요해지면 Cloudflare Turnstile(보이지 않는 캡차)을 첫 메시지에만 적용 (처음에는 생략)
- 클라이언트에서 대화는 최근 10개 메시지만 전송
- `leave_message`는 세션당 3회로 제한하고, 같은 내용이 반복되면 서버에서 차단

### 5.4 BACKUP MODE (API 없이도 동작)

API 장애, 한도 초과, JS의 `fetch` 실패 시 코어가 회색으로 바뀌고 *"Main core offline. Running on backup power."*를
표시합니다. 이때 추천 질문 칩은 **미리 써둔 정적 답변 + 패널**로 동작합니다.
같은 `profile.json`과 같은 패널 컴포넌트를 쓰므로 추가 비용 없이 사이트가 항상 쓸 만한 상태로 남습니다.

---

## 6. 지식 베이스 & 페르소나

### 6.1 단일 소스: `profile/profile.json`

현재 흩어져 있는 `DATA.json`, `src/data/experience.ts`, `src/i18n/strings.ts`의 프로필 정보를 하나로 합칩니다.

```jsonc
{
  "identity": { "name": "Youngkwang Han", "alias": "YK", "location": "Seoul", "role": "Fullstack Developer", ... },
  "summary": { "en": "...", "ko": "..." },
  "workStyle": [ ... ],                  // 아키텍처 → 꼼꼼함 → 속도
  "projects": [
    { "id": "outschool", "company": "...", "period": "...", "stack": [...],
      "highlights": { "en": [...], "ko": [...] }, "link": "...", "image": "..." }
  ],
  "awards": [ "AWWWARDS Honorable Mention", "GSAP Site of the Day" ],
  "education": [ ... ],
  "contact": { "email": "...", "github": "...", "linkedin": "..." },
  "faq": [                                // YK가 직접 답을 정해두고 싶은 질문
    { "q": "Are you open to new roles?", "a": "..." },
    { "q": "Remote work?", "a": "..." }
  ],
  "offLimits": [ "연봉", "개인 연락처 외 개인정보" ]   // 답하지 않을 주제
}
```

- **클라이언트**는 패널 렌더링과 BACKUP MODE에 사용
- **Worker**는 빌드 시 이 파일을 번들해 system prompt를 만듦
- 콘텐츠 수정은 이 파일 하나만 고치면 끝

> **콘텐츠 작업이 필요합니다.** 지금 문구는 "식상하다"고 하셨으니, 리뉴얼 때 `faq`와 프로젝트별
> "가장 어려웠던 문제 / 내가 한 결정"을 새로 채우면 AI 답변 품질이 크게 좋아집니다. 이 부분은 YK님이 직접 써주셔야 합니다.

### 6.2 페르소나 (system prompt 요지)

- 정체성: YK가 만든 개인 AI 비서. 차분하고 위트 있는 집사형 말투. 짧게 답함(기본 2–4문장)
- 언어: 방문자가 쓴 언어로 답함(한/영 자동). UI 토글은 화면 문구에만 적용
- 사실성: **profile.json에 있는 사실만** 말함. 모르면 *"That's not in my files. Want me to pass the question to YK?"*처럼 답하고 `leave_message`로 유도
- 범위: YK와 무관한 요청(코드 작성, 숙제 등)은 정중하고 재치 있게 거절하고 YK 이야기로 돌아옴
- 도구: 프로젝트나 기술을 언급하면 해당 `show_*` 도구를 함께 호출
- 금지: `offLimits` 주제, YK를 대신한 약속(채용 확정, 일정 확정 등)

캐시가 깨지지 않도록 system prompt에는 현재 시각 같은 변하는 값을 넣지 않습니다.
필요한 맥락(방문자 locale 등)은 첫 user 메시지 쪽에 붙입니다.

---

## 7. 소소한 재미 요소 (선택, P4)

- **음성 모드:** 🎙 버튼은 Web Speech API(STT), 🔊 토글은 `speechSynthesis`(TTS)로 동작합니다. 브라우저 내장 기능이라 추가 비용이 없습니다. 기본은 꺼둠
- **명령어:** `/help`, `/clear`, `/lang ko`, `/resume`(이력서 PDF 패널), `/stats`(이번 세션 토큰 수와 비용을 HUD 스타일로 표시해 "AI-native" 정체성을 보여줌)
- **이스터 에그:** "Who made you?" → *"YK did. With considerable help from other AIs."* / Konami 코드 입력 시 코어 색이 잠깐 `--acc-b`로 바뀌는 "overdrive"
- **세션 브리핑:** 대화를 3턴 이상 하면 *"Shall I compile a briefing?"*을 제안하고, 대화에서 나온 프로젝트들을 한 장의 요약 패널로 정리(링크 공유용)

---

## 8. 코드 구조 변경

```
/                         (Vite + React 그대로)
├─ profile/profile.json   ★ 신규: 단일 지식 소스
├─ src/
│  ├─ App.tsx             단일 HUD 화면으로 교체
│  ├─ hud/
│  │  ├─ BootSequence.tsx ★
│  │  ├─ Core.tsx         ★ 리액터 코어 (SVG, 상태 기반)
│  │  ├─ StatusBar.tsx    ★ (기존 Nav 대체)
│  │  ├─ Console.tsx      ★ 대화 로그 + 입력 + 추천 칩
│  │  └─ panels/          ★ ProjectPanel, StackPanel, TimelinePanel, ContactPanel, MessageSentPanel
│  ├─ ai/
│  │  ├─ useKai.ts        ★ SSE 스트림 파싱, 상태 머신(idle/thinking/speaking/offline)
│  │  └─ backup.ts        ★ 오프라인 정적 답변
│  ├─ components/Scramble.tsx, Background.tsx   유지·재사용
│  └─ styles/global.css   팔레트 유지, HUD 스타일 추가
├─ worker/                ★ 신규: Cloudflare Worker
│  ├─ src/index.ts        라우팅, 검증, rate limit, SSE 중계
│  ├─ src/prompt.ts       페르소나 + profile.json → system prompt
│  ├─ src/tools.ts        도구 정의
│  └─ wrangler.toml
└─ 삭제: Hero, About, Work, Stack, Contact, ContactForm, HeroFX, DATA.json, .env.example(웹훅)
```

- Worker는 `@anthropic-ai/sdk`(TypeScript)를 사용합니다
- 시크릿: `ANTHROPIC_API_KEY`, `SLACK_WEBHOOK_URL`을 `wrangler secret`으로 등록합니다. 프론트엔드에는 `VITE_KAI_ENDPOINT`(공개 URL)만 둡니다
- 배포: 기존 Pages 워크플로는 유지하고, `worker/**` 변경 시 `wrangler deploy`를 실행하는 잡을 추가합니다(`CLOUDFLARE_API_TOKEN` 시크릿 필요)

### SEO / 접근성

- 대화형 UI는 크롤러가 읽기 어렵습니다. 그래서 `profile.json`으로 빌드 시 **정적 요약 HTML**(이름, 직함, 프로젝트 목록, 링크)을 `index.html`에 주입합니다. 화면에서는 시각적으로 숨기고 스크린리더와 크롤러는 읽을 수 있게 합니다. 기존 JSON-LD는 유지합니다
- 대화 로그는 `aria-live="polite"`, 패널은 `role="region"`과 제목을 가집니다. 키보드만으로 모든 칩과 패널을 조작할 수 있게 합니다
- `prefers-reduced-motion`이면 부팅 시퀀스, 스캔라인, 회전을 생략합니다

---

## 9. 구현 단계

| 단계 | 내용 | 완료 기준 |
|---|---|---|
| **P0 데이터** | `profile.json` 작성(기존 데이터 이관 + FAQ 신규 작성) | 모든 프로필 정보가 한 파일에 있음 |
| **P1 Worker** | 프록시, 스트리밍, 캐싱, rate limit, 도구 정의, `leave_message` | `curl`로 질문하면 SSE 응답, 2번째 요청부터 `cache_read_input_tokens > 0` |
| **P2 HUD 셸** | StatusBar, Core(상태 5종), BootSequence, 레이아웃(데스크톱/모바일) | API 없이 목업 상태 전환이 동작 |
| **P3 대화** | `useKai` 훅, Console, 추천 칩, 스트리밍 타이핑, BACKUP MODE | 실제 질문/답변 동작, Worker를 끄면 백업 모드로 전환 |
| **P4 패널** | UI 도구 → 패널 렌더링, 애니메이션, `leave_message` 확인 패널 | "모바일 경험?" 질문에 Plang 패널이 뜸 |
| **P5 마감** | SEO 정적 요약, 접근성, reduced motion, 기존 컴포넌트 삭제, README 갱신 | Lighthouse 접근성/SEO 90+ |
| **P6 재미 (선택)** | 음성, 명령어, 이스터 에그, 브리핑 | — |

P0–P4까지 끝나면 공개할 수 있습니다. P6는 이후에 붙여도 됩니다.

---

## 10. 결정이 필요한 것

1. **AI 이름:** 임시 이름은 K.A.I.입니다. 후보: K.A.I. / Y.K.-OS / VEGA / 직접 제안
2. **인프라:** Cloudflare 계정을 사용해도 되는지(추천), 아니면 Vercel 선호인지
3. **답변 언어 기본값:** 방문자 언어 자동 감지(추천) vs. 토글 언어 고정
4. **음성 기능:** P6로 미룰지, 처음부터 넣을지
5. **콘텐츠:** `faq`와 프로젝트별 "어려웠던 문제 / 내린 결정"을 직접 작성해주실 수 있는지 (AI 답변 품질에 가장 큰 영향)
6. **월 예산 상한:** 예: $5/월 (Anthropic 콘솔 spend limit + Worker 일일 상한)
