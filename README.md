# 공통 컴포넌트

SOLMATE FE 프로젝트에서 공통으로 사용되는 UI 컴포넌트 및 레이아웃 컴포넌트 모음입니다.

> **컴포넌트 테스트 페이지** → [http://localhost:5173/components](http://localhost:5173/components)

---

## 디렉토리 구조

```
src/components/
├── ui/
│   ├── Button.tsx    # 버튼
│   ├── Avatar.tsx    # 아바타 (이미지 / 이니셜)
│   ├── Badge.tsx     # 뱃지
│   ├── Input.tsx     # 인풋 필드
│   └── TabBar.tsx    # 탭 바
└── layout/
    ├── Layout.tsx    # 전체 페이지 레이아웃
    └── Sidebar.tsx   # 사이드바 네비게이션
```

---

## 디자인 토큰

### 컬러

#### Primary

| 토큰 | 값 | 용도 |
|---|---|---|
| `primary` | `#0046FF` | 버튼(primary), 활성 탭/네비, 인풋 포커스 테두리, 아바타 기본 배경 |
| `primary-hover` | `#0038CC` | primary 버튼 호버 |
| `primary-border` | `#0046FF` | basic 버튼 테두리·텍스트 |

#### Neutral (Tailwind Gray)

| 토큰 | Tailwind | Hex 근사값 | 용도 |
|---|---|---|---|
| `gray-50` | `bg-gray-50` | `#F9FAFB` | 전체 페이지 배경 |
| `gray-100` | `bg-gray-100` / `border-gray-100` | `#F3F4F6` | 사이드바 구분선, 호버 배경, 탭 비활성 테두리 |
| `gray-200` | `border-gray-200` | `#E5E7EB` | 인풋 기본 테두리 |
| `gray-400` | `text-gray-400` | `#9CA3AF` | 아이콘 비활성, placeholder, 서브타이틀 |
| `gray-600` | `text-gray-600` | `#4B5563` | 네비 레이블 비활성, invalid 버튼 텍스트 |
| `gray-700` | `text-gray-700` | `#374151` | 인풋 레이블 |
| `gray-900` | `text-gray-900` | `#111827` | 본문 텍스트, 앱 이름 |

#### Semantic

| 토큰 | Tailwind / Hex | 용도 |
|---|---|---|
| `error` | `red-400` / `red-500` | 인풋 에러 테두리, 에러 텍스트, 알림 뱃지 |
| `hint` | `green-600` | 인풋 힌트 텍스트 |
| `return-positive` | `red-500` | 수익률 양수 (한국 증시 관례) |
| `return-negative` | `green-600` | 수익률 음수 (한국 증시 관례) |

---

### 폰트 사이즈

| 토큰 | 크기 | 용도 |
|---|---|---|
| `xs` | `12px` | 앱 서브타이틀, 알림 뱃지 숫자 |
| `sm` | `13px` | 에러·힌트 메시지, 로그아웃 버튼, 유저 수익률 |
| `md-sm` | `14px` | 인풋 레이블, 유저 이름 |
| `md` | `15px` | 사이드바 네비게이션 레이블 |
| `base` | `16px` | 인풋 본문, 뱃지 텍스트, 탭 레이블 **(기본)** |
| `lg` | `18px` | 앱 이름(AppLogo) |

---

## UI 컴포넌트

### Button

범용 버튼 컴포넌트입니다. `variant`로 외형을 선택합니다.

| Prop | Type | Default | 설명 |
|---|---|---|---|
| `children` | `ReactNode` | — | 버튼 내용 |
| `variant` | `"primary" \| "basic" \| "invaild"` | `"primary"` | 버튼 스타일 |
| `width` | `number` | — | 픽셀 단위 고정 너비 |
| `className` | `string` | — | 추가 클래스 |
| `onClick` | `() => void` | — | 클릭 핸들러 |

**variant 종류**

- `primary` — 파란 배경 (`#0046FF`), 흰색 텍스트 (기본 CTA)
- `basic` — 흰 배경 + 파란 테두리 / 텍스트 (보조 액션)
- `invaild` — 테두리 없음, 회색 텍스트 (비활성/취소)

```tsx
<Button variant="primary" onClick={handleSubmit}>제출하기</Button>
<Button variant="basic" width={120}>취소</Button>
<Button variant="invaild">건너뛰기</Button>
```

---

### Avatar

사용자 프로필 이미지 또는 이름 이니셜을 표시하는 컴포넌트입니다.
`src`가 전달되면 이미지를, 없으면 이니셜 원형을 렌더링합니다.

| Prop | Type | Default | 설명 |
|---|---|---|---|
| `name` | `string` | — | 사용자 이름 (이니셜 추출 및 alt 텍스트에 사용) |
| `src` | `string` | — | 프로필 이미지 URL |
| `color` | `string` | `"#0046FF"` | 이니셜 아바타 배경색 |
| `size` | `number` | `40` | 픽셀 단위 크기 |
| `className` | `string` | `""` | 추가 클래스 |
| `onClick` | `() => void` | — | 클릭 핸들러 |

**이니셜 추출 규칙**

- 한글 이름: 첫 글자 1자 (`투자왕김철수` → `투`)
- 영문 단어 1개: 앞 2자 대문자 (`apple` → `AP`)
- 영문 2단어 이상: 각 단어 첫 글자 대문자 (`John Doe` → `JD`)

```tsx
<Avatar name="투자왕김철수" />
<Avatar name="John Doe" src="/profile.jpg" size={48} />
<Avatar name="삼성전자" color="#1d4ed8" size={32} onClick={openProfile} />
```

---

### Badge

카테고리, 상태, 태그 등을 표시하는 뱃지 컴포넌트입니다.

| Prop | Type | Default | 설명 |
|---|---|---|---|
| `name` | `string` | — | 뱃지 텍스트 |
| `color` | `string` | — | 배경색 (hex, rgb 등) |
| `className` | `string` | — | 추가 클래스 |

```tsx
<Badge name="주식" color="#0046FF" />
<Badge name="ETF" color="#10b981" />
<Badge name="위험" color="#ef4444" />
```

---

### Input

레이블, 에러 메시지, 힌트 메시지를 지원하는 인풋 필드 컴포넌트입니다.
HTML `<input>`의 모든 네이티브 속성을 그대로 전달할 수 있습니다.

| Prop | Type | 설명 |
|---|---|---|
| `label` | `string` | 인풋 상단에 표시되는 레이블 |
| `error` | `string` | 에러 메시지 (빨간색, 표시 시 포커스 테두리도 빨간색으로 변경) |
| `hint` | `string` | 힌트 메시지 (초록색, `error`가 없을 때만 표시) |
| `...props` | `InputHTMLAttributes` | `placeholder`, `type`, `value`, `onChange` 등 네이티브 속성 |

```tsx
<Input label="이메일" placeholder="example@email.com" type="email" />
<Input label="비밀번호" type="password" error="비밀번호가 일치하지 않습니다." />
<Input label="닉네임" hint="사용 가능한 닉네임입니다." value={nickname} onChange={handleChange} />
```

---

### TabBar

여러 탭 중 하나를 선택하는 수평 탭 바 컴포넌트입니다.

| Prop | Type | 설명 |
|---|---|---|
| `tabs` | `{ id: string; label: string }[]` | 탭 목록 |
| `activeId` | `string` | 현재 활성 탭의 `id` |
| `onChange` | `(id: string) => void` | 탭 변경 핸들러 |

```tsx
const tabs = [
  { id: "diary", label: "매매일지" },
  { id: "analysis", label: "분석" },
  { id: "history", label: "거래내역" },
];

const [activeId, setActiveId] = useState("diary");

<TabBar tabs={tabs} activeId={activeId} onChange={setActiveId} />
```

---

## 레이아웃 컴포넌트

### Layout

사이드바 + 콘텐츠 영역으로 구성된 전체 페이지 레이아웃입니다.
`react-router-dom`의 `<Outlet />`을 활용하여 중첩 라우트의 페이지 콘텐츠를 렌더링합니다.

```
┌──────────────────────────────────────┐
│  Sidebar (w-64)  │  <Outlet />       │
│                  │  (flex-1, scroll) │
└──────────────────────────────────────┘
```

라우터 설정에서 `Layout`을 부모 라우트로 지정하면 모든 자식 라우트에 자동 적용됩니다.

```tsx
// router.tsx 예시
{
  element: <Layout />,
  children: [
    { path: "/", element: <HomePage /> },
    { path: "/invest", element: <InvestPage /> },
  ],
}
```

---

### Sidebar (SidebarNav)

좌측 고정 네비게이션 바입니다. `react-router-dom`의 `useLocation` / `useNavigate`를 사용하여 현재 경로에 맞는 메뉴 항목을 자동으로 활성화합니다.

**포함 요소**

- **AppLogo** — 앱 이름(SOLmate)과 서브타이틀 표시
- **NavItem** — 아이콘 + 레이블 + 알림 뱃지로 구성된 메뉴 항목
- **UserProfile** — 사용자 이름, 수익률, 로그아웃 버튼

**내장 메뉴 목록**

| id | 레이블 | 경로 |
|---|---|---|
| `home` | 홈 | `/` |
| `invest` | 모의투자 | `/invest` |
| `account` | 내 계좌 | `/account` |
| `trade` | 매매일지 | `/trade` |
| `users` | 유저 목록 | `/users` |
| `alarm` | 알림 | `/alarm` |
| `mentor` | 나의 멘토 | `/mentor` |
| `mentee` | 나의 멘티 | `/mentee` |
| `profile` | 프로필 | `/profile` |

> 현재 사용자 정보는 하드코딩되어 있습니다. 추후 Zustand 스토어와 연동 예정입니다.
