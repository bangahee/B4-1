# B4-1 웹 기초 완성, 나만의 포트폴리오 구축

순수 HTML, CSS, JavaScript만으로 구현한 반응형 포트폴리오 웹사이트입니다.

이 프로젝트의 핵심 목표는 화면을 단순히 꾸미는 것이 아니라 다음 흐름을 직접 구현하고 설명하는 것입니다.

```text
사용자 이벤트
→ 상태 변경
→ 렌더링 함수 실행
→ DOM 업데이트
→ 화면 변화
```

---

## 1. 배포 URL

- GitHub Repository: 저장소 업로드 후 URL 입력
- GitHub Pages: 배포 후 URL 입력

---

## 2. 주요 기능

- 모바일, 태블릿, 데스크톱 반응형 레이아웃
- Hero, About, Skills, Projects, Contact, Footer 섹션
- 모바일 햄버거 메뉴
- 부드러운 스크롤
- 스크롤 위치에 따른 헤더 스타일 변경
- 맨 위로 가기 버튼
- 다크 모드 전환
- localStorage를 이용한 테마 유지
- Intersection Observer 기반 스크롤 애니메이션
- GitHub API 연동
- API 로딩, 성공, 에러, 빈 상태 처리
- 이름, 이메일, 메시지 폼 유효성 검사
- 입력창 근처 에러 메시지 표시
- 제출 성공 메시지 표시

---

## 3. 사용 기술

- HTML5
- CSS3
- JavaScript ES6+
- GitHub REST API
- GitHub Pages

외부 프론트엔드 라이브러리나 프레임워크는 사용하지 않았습니다.

---

## 4. 프로젝트 구조

```text
B4-1/
├── index.html
├── README.md
├── .gitignore
├── css/
│   └── style.css
├── js/
│   └── main.js
└── images/
    └── profile.png
```

### 파일 역할

- `index.html`: 페이지 구조와 콘텐츠
- `css/style.css`: 디자인, 반응형 레이아웃, 다크 모드, 애니메이션
- `js/main.js`: DOM 조작, 이벤트 처리, 상태 관리, API 호출, 폼 검사
- `images/`: 프로필 이미지와 스크린샷
- `README.md`: 프로젝트 설명, 실행 방법, 평가 준비 내용

HTML, CSS, JavaScript를 분리한 이유는 구조, 표현, 동작의 역할을 명확히 나누어 관리하기 위해서입니다.

```html
<link rel="stylesheet" href="css/style.css">
<script src="js/main.js" defer></script>
```

`defer`를 사용해 HTML 구조가 만들어진 뒤 JavaScript가 실행되도록 했습니다.

---

## 5. 시맨틱 HTML 구조

페이지 전체를 `div`로만 작성하지 않고 콘텐츠의 역할에 맞는 시맨틱 태그를 사용했습니다.

- `<header>`: 사이트 상단 영역
- `<nav>`: 섹션 이동 메뉴
- `<main>`: 핵심 콘텐츠
- `<section>`: Hero, About, Skills, Projects, Contact
- `<article>`: 독립적인 카드와 콘텐츠
- `<footer>`: 저작권과 외부 링크

```html
<header>
  <nav>...</nav>
</header>

<main>
  <section id="hero">...</section>
  <section id="about">...</section>
  <section id="skills">...</section>
  <section id="projects">...</section>
  <section id="contact">...</section>
</main>

<footer>...</footer>
```

시맨틱 태그는 개발자가 구조를 이해하기 쉽게 하고, 검색 엔진과 스크린 리더가 콘텐츠의 의미를 파악하도록 돕습니다.

---

## 6. 접근성

### 이미지 alt

```html
<img
  src="images/profile.png"
  alt="노트북으로 웹 개발을 공부하는 학생의 일러스트"
>
```

이미지를 볼 수 없는 경우에도 의미가 전달되도록 `alt`를 작성했습니다.

### label 연결

```html
<label for="email">이메일</label>
<input id="email" name="email" type="email">
```

`label`의 `for`와 입력 요소의 `id`를 일치시켰습니다.

### 모바일 메뉴

```html
<button
  aria-expanded="false"
  aria-controls="nav-menu"
>
```

메뉴의 열림 여부를 스크린 리더가 알 수 있도록 `aria-expanded`를 상태에 따라 변경합니다.

---

## 7. CSS 변수와 다크 모드

반복되는 색상, 간격, 그림자 값을 CSS 변수로 관리했습니다.

```css
:root {
  --color-primary: #5b5bd6;
  --color-background: #f8f9fc;
  --color-surface: #ffffff;
  --color-text: #1f2430;
  --spacing-md: 1rem;
}
```

```css
body {
  color: var(--color-text);
  background-color: var(--color-background);
}
```

다크 모드는 같은 변수 이름의 값만 변경하는 방식으로 구현했습니다.

```css
[data-theme="dark"] {
  --color-background: #11131a;
  --color-surface: #1a1d27;
  --color-text: #f4f5f8;
}
```

JavaScript가 `<html>` 요소의 `data-theme` 값을 변경하면 전체 색상이 자동으로 바뀝니다.

---

## 8. Flexbox와 Grid

### Flexbox

한 방향 정렬에 사용했습니다.

- 네비게이션 로고와 메뉴
- Hero 버튼
- Footer
- 프로젝트 메타 정보

```css
.navigation {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
```

### Grid

행과 열이 필요한 레이아웃에 사용했습니다.

- About 이미지와 설명
- Skills 카드
- Projects 카드
- Contact 설명과 폼

```css
.projects-grid {
  display: grid;
  grid-template-columns:
    repeat(auto-fit, minmax(min(100%, 17rem), 1fr));
  gap: 1.5rem;
}
```

평가 설명:

```text
한 방향 정렬에는 Flexbox를 사용했고,
행과 열이 필요한 카드 레이아웃에는 Grid를 사용했습니다.
```

---

## 9. 모바일 퍼스트 반응형 디자인

기본 CSS를 모바일 기준으로 작성한 뒤 화면이 커질 때 스타일을 추가했습니다.

```css
/* 기본: 모바일 */
.hero-actions {
  flex-direction: column;
}

/* 768px 이상 */
@media (min-width: 48rem) {
  .hero-actions {
    flex-direction: row;
  }
}

/* 1024px 이상 */
@media (min-width: 64rem) {
  .menu-toggle {
    display: none;
  }
}
```

### 화면별 변화

#### 모바일

- 햄버거 버튼 표시
- 카드 한 열
- About와 Contact 세로 배치

#### 768px 이상

- About 두 열
- Contact 두 열
- Skills 세 열

#### 1024px 이상

- 햄버거 버튼 숨김
- 메뉴 가로 배치

모바일 퍼스트를 선택한 이유는 작은 화면의 필수 스타일을 먼저 작성하고, 큰 화면에서 필요한 변화만 점진적으로 추가하기 위해서입니다.

---

## 10. DOM 선택과 이벤트 처리

DOM 요소는 `querySelector`와 `querySelectorAll`로 선택했습니다.

```javascript
const themeToggleButton =
  document.querySelector("#theme-toggle");

const navigationLinks =
  document.querySelectorAll(".nav-links a");
```

HTML의 `onclick` 속성은 사용하지 않고 `addEventListener`를 사용했습니다.

```javascript
themeToggleButton.addEventListener(
  "click",
  toggleTheme
);

navigationLinks.forEach((link) => {
  link.addEventListener(
    "click",
    handleNavigationClick
  );
});
```

`addEventListener`를 사용한 이유는 HTML과 JavaScript의 역할을 분리하고, 여러 요소에 같은 이벤트를 체계적으로 연결하기 위해서입니다.

---

## 11. 상태 관리

현재 화면 상태를 하나의 `state` 객체에서 관리합니다.

```javascript
const state = {
  theme: "light",

  menuOpen: false,

  projects: {
    status: "idle",
    data: [],
    errorMessage: "",
  },

  form: {
    values: {
      name: "",
      email: "",
      message: "",
    },

    errors: {
      name: "",
      email: "",
      message: "",
    },

    submitted: false,
  },
};
```

### 상태 역할

- `theme`: 라이트 또는 다크 모드
- `menuOpen`: 모바일 메뉴 열림 여부
- `projects.status`: API 상태
- `projects.data`: 프로젝트 데이터
- `projects.errorMessage`: API 오류 메시지
- `form.values`: 사용자 입력값
- `form.errors`: 필드별 오류
- `form.submitted`: 제출 성공 상태

상태를 한 객체에서 관리하면 현재 화면이 어떤 데이터에 의해 결정되는지 쉽게 추적할 수 있습니다.

---

## 12. 다크 모드 흐름

```text
테마 버튼 클릭
→ toggleTheme()
→ state.theme 변경
→ localStorage 저장
→ renderTheme()
→ data-theme 변경
→ CSS 변수 변경
→ 전체 화면 테마 변경
```

```javascript
const toggleTheme = () => {
  const nextTheme =
    state.theme === "light"
      ? "dark"
      : "light";

  setTheme(nextTheme);
};
```

```javascript
const setTheme = (theme) => {
  state.theme = theme;

  localStorage.setItem(
    "portfolio-theme",
    state.theme
  );

  renderTheme();
};
```

```javascript
const renderTheme = () => {
  const isDark =
    state.theme === "dark";

  document.documentElement.dataset.theme =
    state.theme;

  themeIcon.textContent =
    isDark ? "☀️" : "🌙";

  themeText.textContent =
    isDark ? "Light" : "Dark";
};
```

새로고침 후에도 테마가 유지되는 이유는 `localStorage`에 저장한 값을 앱 시작 시 다시 읽기 때문입니다.

---

## 13. 햄버거 메뉴 흐름

```text
햄버거 버튼 클릭
→ toggleMenu()
→ state.menuOpen 변경
→ renderMenu()
→ active 클래스 변경
→ 메뉴 표시 또는 숨김
```

```javascript
const renderMenu = () => {
  navMenu.classList.toggle(
    "active",
    state.menuOpen
  );

  menuToggleButton.classList.toggle(
    "active",
    state.menuOpen
  );

  document.body.classList.toggle(
    "menu-open",
    state.menuOpen
  );

  menuToggleButton.setAttribute(
    "aria-expanded",
    String(state.menuOpen)
  );
};
```

`classList.toggle()`을 사용해 상태에 따라 클래스를 추가하거나 제거합니다.

---

## 14. 부드러운 스크롤

네비게이션 링크는 section의 id와 연결되어 있습니다.

```html
<a href="#projects">Projects</a>
<section id="projects">...</section>
```

```javascript
const handleNavigationClick = (event) => {
  const targetId =
    event.currentTarget.getAttribute("href");

  const targetSection =
    document.querySelector(targetId);

  event.preventDefault();

  targetSection.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });

  setMenuOpen(false);
};
```

`event.preventDefault()`로 기본 이동을 막고 `scrollIntoView()`로 부드럽게 이동합니다.

---

## 15. 스크롤 UI

스크롤 이벤트에 따라 헤더와 맨 위로 가기 버튼의 상태를 변경합니다.

```javascript
const HEADER_CHANGE_Y = 60;
const SCROLL_TOP_VISIBLE_Y = 300;
```

```javascript
const updateScrollUI = () => {
  const scrollY = window.scrollY;

  siteHeader.classList.toggle(
    "scrolled",
    scrollY >= HEADER_CHANGE_Y
  );

  scrollTopButton.classList.toggle(
    "visible",
    scrollY >= SCROLL_TOP_VISIBLE_Y
  );
};
```

- 60px 이상: 헤더 배경 변경
- 300px 이상: 맨 위로 버튼 표시

```javascript
const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
};
```

---

## 16. 스크롤 애니메이션

Intersection Observer를 사용해 요소가 화면 안으로 들어오는지 감지합니다.

```javascript
const OBSERVER_THRESHOLD = 0.2;
```

```javascript
const observerCallback = (
  entries,
  observer
) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) {
      return;
    }

    entry.target.classList.add(
      "visible"
    );

    observer.unobserve(
      entry.target
    );
  });
};
```

CSS는 다음과 같이 작성했습니다.

```css
.reveal {
  opacity: 0;
  transform: translateY(2rem);
}

.reveal.visible {
  opacity: 1;
  transform: translateY(0);
}
```

JavaScript는 클래스만 변경하고, 실제 애니메이션은 CSS transition이 처리합니다.

---

## 17. GitHub API

사용한 API 주소:

```text
https://api.github.com/users/bangahee/repos
```

전체 흐름:

```text
fetchProjects()
→ loading 상태
→ 로딩 UI
→ fetch 요청
→ 성공 또는 실패
→ success/error 상태
→ 프로젝트 카드 또는 에러 UI
```

```javascript
async function fetchProjects() {
  state.projects.status = "loading";
  state.projects.errorMessage = "";

  renderProjects();

  try {
    const response =
      await fetch(endpoint);

    if (!response.ok) {
      throw new Error(
        "프로젝트 요청에 실패했습니다."
      );
    }

    const repositories =
      await response.json();

    state.projects.status =
      "success";

    state.projects.data =
      repositories;
  } catch (error) {
    state.projects.status =
      "error";

    state.projects.data = [];

    state.projects.errorMessage =
      error.message;
  }

  renderProjects();
}
```

`async/await`는 비동기 요청을 위에서 아래로 읽기 쉽게 작성하기 위해 사용했습니다.

`try/catch`는 API 성공과 실패를 나누어 처리하기 위해 사용했습니다.

---

## 18. API 상태별 UI

Projects 섹션은 상태에 따라 다른 UI를 표시합니다.

- `idle`: 요청 전
- `loading`: 로딩 스피너와 문구
- `success`: 프로젝트 카드
- `success + 빈 배열`: 빈 상태 메시지
- `error`: 에러 메시지와 다시 시도 버튼

```javascript
const renderProjects = () => {
  const { status, data } =
    state.projects;

  if (status === "loading") {
    renderProjectLoading();
    return;
  }

  if (status === "error") {
    renderProjectError();
    return;
  }

  if (
    status === "success" &&
    data.length === 0
  ) {
    renderProjectEmpty();
    return;
  }

  if (status === "success") {
    renderProjectSuccess();
  }
};
```

403 응답은 GitHub API 호출 제한으로 처리합니다.

```javascript
if (response.status === 403) {
  throw new Error(
    "GitHub API 호출 제한에 도달했습니다."
  );
}
```

---

## 19. 배열 메서드

### filter

```javascript
const visibleRepositories =
  repositories
    .filter((repository) => {
      return (
        !repository.fork &&
        !repository.archived
      );
    })
    .slice(0, 6);
```

fork와 archived 저장소를 제외합니다.

### map

```javascript
const projectCards =
  state.projects.data
    .map(createProjectCard)
    .join("");
```

저장소 객체를 프로젝트 카드 HTML로 변환합니다.

### forEach

```javascript
navigationLinks.forEach((link) => {
  link.addEventListener(
    "click",
    handleNavigationClick
  );
});
```

여러 DOM 요소를 순회하며 이벤트를 연결합니다.

---

## 20. 구조분해 할당과 템플릿 리터럴

### 구조분해 할당

```javascript
const {
  name,
  description,
  html_url: repositoryUrl,
  language,
  stargazers_count: starCount,
  updated_at: updatedAt,
} = repository;
```

API 객체에서 필요한 값만 꺼내고 읽기 쉬운 변수명으로 변경했습니다.

### 템플릿 리터럴

```javascript
return `
  <article class="project-card">
    <h3>${name}</h3>
    <p>${description}</p>
    <a href="${repositoryUrl}">
      GitHub에서 보기
    </a>
  </article>
`;
```

여러 줄 HTML을 만들고 `${변수}`로 데이터를 삽입합니다.

---

## 21. 폼 유효성 검사

폼의 상태 흐름:

```text
사용자 입력
→ input 이벤트
→ form.values 변경
→ validateField()
→ form.errors 변경
→ renderFormField()
→ 에러 메시지 표시 또는 숨김
```

```javascript
const handleFormInput = (event) => {
  updateFormField(
    event.target.name,
    event.target.value
  );
};
```

```javascript
const updateFormField = (
  fieldName,
  fieldValue
) => {
  state.form.values[fieldName] =
    fieldValue;

  state.form.errors[fieldName] =
    validateField(
      fieldName,
      fieldValue
    );

  renderFormField(fieldName);
};
```

검사 항목:

- 이름 필수값
- 이름 최소 길이
- 이메일 필수값
- 이메일 형식
- 메시지 필수값
- 메시지 최소 길이

---

## 22. 이메일 검사

```javascript
const isValidEmail = (email) => {
  const emailPattern =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  return emailPattern.test(email);
};
```

기본적인 `문자열@문자열.문자열` 형식을 검사합니다.

```javascript
errorElement.textContent =
  errorMessage;

inputElement.classList.toggle(
  "invalid",
  errorMessage !== ""
);
```

에러 메시지는 입력창 근처에 표시됩니다.

---

## 23. 폼 제출

```javascript
const handleFormSubmit = (event) => {
  event.preventDefault();

  const isFormValid =
    validateEntireForm();

  if (!isFormValid) {
    return;
  }

  formSuccess.textContent =
    "입력 내용이 성공적으로 확인되었습니다.";

  contactForm.reset();
  resetFormState();
};
```

`event.preventDefault()`를 사용해 폼 제출 시 페이지가 새로고침되는 기본 동작을 막았습니다.

모든 필드가 유효하면 성공 메시지를 표시합니다.

---

## 24. DOM 업데이트 방식

### textContent

텍스트를 변경할 때 사용합니다.

```javascript
themeText.textContent = "Dark";
```

### innerHTML

여러 HTML 요소를 한 번에 렌더링할 때 사용합니다.

```javascript
projectsGrid.innerHTML =
  projectCards;
```

### classList

클래스를 추가하거나 제거해 화면 상태를 변경합니다.

```javascript
siteHeader.classList.toggle(
  "scrolled",
  condition
);
```

---

## 25. 앱 초기화

```javascript
const initializeApp = () => {
  state.theme =
    getSavedTheme();

  renderTheme();
  renderMenu();
  renderCurrentYear();
  updateScrollUI();

  attachEventListeners();
  createScrollObserver();
  fetchProjects();
};

initializeApp();
```

초기화 순서:

1. localStorage에서 테마 읽기
2. 초기 테마와 메뉴 렌더링
3. 현재 연도 표시
4. 스크롤 상태 반영
5. 이벤트 연결
6. Intersection Observer 시작
7. GitHub API 호출

---

## 26. 평가 시 기능 시연 순서

### 반응형

- 375px: 햄버거 메뉴, 한 열 카드
- 768px: About와 Contact 두 열
- 1024px 이상: 가로 메뉴

### 다크 모드

- 테마 전환
- 새로고침
- localStorage 유지 확인

### 스크롤

- 부드러운 섹션 이동
- 60px 헤더 변경
- 300px 맨 위 버튼
- reveal 애니메이션

### GitHub API

- 로딩 상태
- 프로젝트 카드
- 잘못된 사용자명으로 에러 상태
- 재시도 버튼
- 빈 배열로 빈 상태

### 폼

- 빈 필드 제출
- 잘못된 이메일
- 짧은 입력값
- 정상 입력과 성공 메시지

---

## 27. 평가 핵심 설명

### HTML, CSS, JavaScript 분리

```text
HTML은 구조,
CSS는 표현,
JavaScript는 동작을 담당합니다.
```

### 시맨틱 태그

```text
디자인을 위한 태그가 아니라
콘텐츠의 역할과 의미에 따라 선택했습니다.
```

### CSS 변수

```text
반복되는 색상과 간격을 한 곳에서 관리하고,
다크 모드에서는 같은 변수의 값만 교체합니다.
```

### addEventListener

```text
HTML과 JavaScript의 역할을 분리하기 위해
onclick 대신 addEventListener를 사용했습니다.
```

### Flexbox와 Grid

```text
한 방향 정렬에는 Flexbox,
행과 열이 필요한 카드 배치에는 Grid를 사용했습니다.
```

### 상태 객체

```text
현재 화면 상태를 한 곳에서 관리하고
상태 변경과 렌더링의 관계를 명확하게 하기 위해 사용했습니다.
```

### 모바일 퍼스트

```text
작은 화면의 필수 스타일을 기본으로 작성하고
큰 화면에서 필요한 변화만 추가했습니다.
```

### API 처리

```text
loading, success, error, empty 상태를
state.projects.status로 구분해 렌더링했습니다.
```

### 폼 처리

```text
input 이벤트로 상태를 변경하고,
유효성 검사 결과에 따라 에러 UI를 업데이트했습니다.
```

---

## 28. 실행 방법

1. 저장소를 내려받습니다.

```bash
git clone 저장소URL
```

2. VS Code에서 프로젝트 폴더를 엽니다.

3. Live Server 확장 프로그램을 설치합니다.

4. `index.html`에서 `Open with Live Server`를 실행합니다.

---

## 29. GitHub Pages 배포

GitHub 저장소에서 다음 경로로 이동합니다.

```text
Settings
→ Pages
→ Deploy from a branch
→ main
→ / (root)
```

배포 후 README의 URL을 수정합니다.

```text
https://bangahee.github.io/B4-1/
```

---

## 30. 스크린샷

### Desktop

```markdown
![Desktop](images/desktop.png)
```

### Mobile

```markdown
![Mobile](images/mobile.png)
```

### Dark Mode

```markdown
![Dark Mode](images/dark-mode.png)
```

---

## 31. 최종 체크리스트

### 구조

- [ ] HTML, CSS, JavaScript 파일 분리
- [ ] `defer` 사용
- [ ] Hero, About, Skills, Projects, Contact, Footer 존재
- [ ] 시맨틱 태그 사용
- [ ] 이미지 alt 작성
- [ ] label과 input 연결

### CSS

- [ ] CSS 변수
- [ ] 다크 모드 변수
- [ ] Flexbox
- [ ] Grid
- [ ] 모바일 퍼스트
- [ ] 768px 브레이크포인트
- [ ] 1024px 브레이크포인트
- [ ] hover
- [ ] transition
- [ ] box-shadow

### JavaScript

- [ ] `const`, `let`만 사용
- [ ] `addEventListener`
- [ ] `querySelector`
- [ ] `querySelectorAll`
- [ ] `textContent`
- [ ] `innerHTML`
- [ ] `classList`
- [ ] click 이벤트
- [ ] input 이벤트
- [ ] submit 이벤트
- [ ] scroll 이벤트
- [ ] `event.preventDefault()`
- [ ] 화살표 함수
- [ ] 구조분해 할당
- [ ] 템플릿 리터럴
- [ ] `map`
- [ ] `filter`
- [ ] `forEach`

### 기능

- [ ] 햄버거 메뉴
- [ ] 부드러운 스크롤
- [ ] 헤더 스타일 변경
- [ ] 맨 위로 버튼
- [ ] 다크 모드
- [ ] localStorage 유지
- [ ] Intersection Observer
- [ ] 폼 유효성 검사
- [ ] 에러 메시지
- [ ] 성공 메시지

### GitHub API

- [ ] `fetch`
- [ ] `async/await`
- [ ] `try/catch`
- [ ] 로딩 상태
- [ ] 성공 상태
- [ ] 에러 상태
- [ ] 빈 상태
- [ ] 재시도 버튼
- [ ] 403 처리

### 제출

- [ ] GitHub 저장소 URL
- [ ] GitHub Pages URL
- [ ] 데스크톱 스크린샷
- [ ] 모바일 스크린샷
- [ ] 다크 모드 스크린샷