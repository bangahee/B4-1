"use strict";

/*
  strict mode를 활성화한다.

  장점:
  - 실수로 선언하지 않은 변수를 사용하는 오류를 방지한다.
  - 일부 잘못된 JavaScript 문법을 더 엄격하게 검사한다.
*/


/* =========================================================
   1. 프로젝트 설정값
   ---------------------------------------------------------
   여러 함수에서 반복해서 사용하는 값을 상수로 관리한다.

   상수로 관리하는 이유:
   - 기준값을 한 곳에서 쉽게 변경할 수 있다.
   - 코드 안에 의미 없는 숫자가 반복되는 것을 방지한다.
========================================================= */

/* GitHub API에서 저장소를 가져올 사용자 이름 */
const GITHUB_USERNAME = "bangahee";

/*
  사용자가 페이지를 300px 이상 스크롤하면
  맨 위로 가기 버튼을 표시한다.
*/
const SCROLL_TOP_VISIBLE_Y = 300;

/*
  사용자가 페이지를 60px 이상 스크롤하면
  고정 헤더에 배경색과 그림자를 적용한다.
*/
const HEADER_CHANGE_Y = 60;

/*
  요소의 약 20%가 화면에 들어오면
  Intersection Observer가 애니메이션을 실행한다.
*/
const OBSERVER_THRESHOLD = 0.2;


/* =========================================================
   2. 애플리케이션 상태 객체
   ---------------------------------------------------------
   현재 화면 상태를 하나의 객체에서 관리한다.

   핵심 흐름:
   사용자 이벤트
   → state 값 변경
   → 렌더링 함수 실행
   → DOM과 화면 변경
========================================================= */

const state = {
  /*
    현재 테마 상태

    가능한 값:
    - "light"
    - "dark"
  */
  theme: "light",

  /*
    모바일 햄버거 메뉴의 열림 여부

    false = 닫힘
    true = 열림
  */
  menuOpen: false,

  /*
    GitHub API와 Projects 섹션 관련 상태
  */
  projects: {
    /*
      API 요청 상태

      가능한 값:
      - "idle": 요청 전
      - "loading": 요청 중
      - "success": 요청 성공
      - "error": 요청 실패
    */
    status: "idle",

    /* API에서 가져온 저장소 데이터 배열 */
    data: [],

    /* API 요청 실패 시 사용자에게 보여줄 메시지 */
    errorMessage: "",
  },

  /*
    Contact 폼 관련 상태
  */
  form: {
    /*
      사용자가 입력한 현재 값
    */
    values: {
      name: "",
      email: "",
      message: "",
    },

    /*
      각 입력 필드의 유효성 검사 오류 메시지
      오류가 없으면 빈 문자열을 저장한다.
    */
    errors: {
      name: "",
      email: "",
      message: "",
    },

    /*
      폼 제출 성공 여부
    */
    submitted: false,
  },
};


/* =========================================================
   3. DOM 요소 선택
   ---------------------------------------------------------
   HTML 요소를 JavaScript에서 사용할 수 있도록 선택한다.

   querySelector:
   조건에 맞는 첫 번째 요소 하나를 반환한다.

   querySelectorAll:
   조건에 맞는 여러 요소를 NodeList로 반환한다.
========================================================= */

/*
  문서의 최상위 html 요소를 선택한다.

  다크 모드 전환 시 다음 속성을 변경한다.
  data-theme="light"
  data-theme="dark"
*/
const documentElement = document.documentElement;


/* 고정 헤더 */
const siteHeader =
  document.querySelector("#site-header");


/* 모바일 햄버거 메뉴 버튼 */
const menuToggleButton =
  document.querySelector("#menu-toggle");


/* 모바일 및 데스크톱 네비게이션 메뉴 */
const navMenu =
  document.querySelector("#nav-menu");


/* 네비게이션 안의 모든 앵커 링크 */
const navigationLinks =
  document.querySelectorAll(".nav-links a");


/* 다크 모드 전환 버튼 */
const themeToggleButton =
  document.querySelector("#theme-toggle");


/* 테마 버튼 안의 달 또는 해 아이콘 */
const themeIcon =
  document.querySelector("#theme-icon");


/* 테마 버튼 안의 Dark 또는 Light 문구 */
const themeText =
  document.querySelector("#theme-text");


/* 맨 위로 가기 버튼 */
const scrollTopButton =
  document.querySelector("#scroll-top");


/* GitHub API 상태 메시지를 표시할 영역 */
const projectsStatus =
  document.querySelector("#projects-status");


/* GitHub 프로젝트 카드를 표시할 Grid 영역 */
const projectsGrid =
  document.querySelector("#projects-grid");


/* Contact 폼 전체 */
const contactForm =
  document.querySelector("#contact-form");


/*
  Contact 폼 안의 모든 input과 textarea를 선택한다.
  각 입력 요소에 input 이벤트를 연결할 때 사용한다.
*/
const formInputs =
  document.querySelectorAll(
    "#contact-form input, #contact-form textarea"
  );


/* 폼 제출 성공 메시지 영역 */
const formSuccess =
  document.querySelector("#form-success");


/* Footer의 현재 연도 표시 영역 */
const currentYear =
  document.querySelector("#current-year");


/*
  스크롤 애니메이션이 적용될
  모든 reveal 요소를 선택한다.
*/
const revealElements =
  document.querySelectorAll(".reveal");


/* =========================================================
   4. 다크 모드
   ---------------------------------------------------------
   이벤트 → 상태 변경 → 화면 업데이트

   전체 흐름:
   테마 버튼 클릭
   → toggleTheme()
   → state.theme 변경
   → localStorage 저장
   → renderTheme()
   → data-theme 변경
   → CSS 변수 변경
========================================================= */

/*
  localStorage에서 이전에 저장한 테마를 가져온다.

  저장된 값이 dark 또는 light일 때만 사용하고,
  잘못된 값이나 저장값이 없으면 light를 반환한다.
*/
const getSavedTheme = () => {
  const savedTheme =
    localStorage.getItem("portfolio-theme");

  if (
    savedTheme === "dark" ||
    savedTheme === "light"
  ) {
    return savedTheme;
  }

  return "light";
};


/*
  state.theme 값을 기준으로
  실제 HTML 화면을 업데이트한다.
*/
const renderTheme = () => {
  /*
    현재 테마가 dark인지 Boolean 값으로 저장한다.
  */
  const isDark =
    state.theme === "dark";

  /*
    html 요소에 data-theme 속성을 설정한다.

    예:
    <html data-theme="dark">
  */
  documentElement.dataset.theme =
    state.theme;

  /*
    현재 테마에 따라 버튼 아이콘을 변경한다.

    다크 모드일 때는 라이트 모드로 바꾸는 해 아이콘,
    라이트 모드일 때는 다크 모드로 바꾸는 달 아이콘을 표시한다.
  */
  themeIcon.textContent =
    isDark ? "☀️" : "🌙";

  /*
    현재 테마에 따라 버튼 문구를 변경한다.
  */
  themeText.textContent =
    isDark ? "Light" : "Dark";

  /*
    스크린 리더 사용자에게
    버튼을 눌렀을 때 실행될 동작을 설명한다.
  */
  themeToggleButton.setAttribute(
    "aria-label",
    isDark
      ? "라이트 모드로 전환"
      : "다크 모드로 전환"
  );
};


/*
  새로운 테마 상태를 저장하고 화면에 반영한다.
*/
const setTheme = (theme) => {
  /* state 객체의 테마 상태 변경 */
  state.theme = theme;

  /*
    새로고침 후에도 테마가 유지되도록
    브라우저 localStorage에 저장한다.
  */
  localStorage.setItem(
    "portfolio-theme",
    state.theme
  );

  /* 변경된 상태를 화면에 반영 */
  renderTheme();
};


/*
  현재 테마의 반대 테마를 계산한다.
*/
const toggleTheme = () => {
  const nextTheme =
    state.theme === "light"
      ? "dark"
      : "light";

  setTheme(nextTheme);
};


/* =========================================================
   5. 모바일 햄버거 메뉴
   ---------------------------------------------------------
   전체 흐름:
   버튼 클릭
   → toggleMenu()
   → state.menuOpen 변경
   → renderMenu()
   → active 클래스 추가 또는 제거
========================================================= */

/*
  state.menuOpen 값에 따라
  모바일 메뉴와 햄버거 버튼을 렌더링한다.
*/
const renderMenu = () => {
  /*
    메뉴가 열리면 nav-menu에 active 클래스를 추가한다.
    메뉴가 닫히면 active 클래스를 제거한다.
  */
  navMenu.classList.toggle(
    "active",
    state.menuOpen
  );

  /*
    햄버거 버튼에도 active 클래스를 적용한다.

    CSS에서 햄버거 세 줄을 X 모양으로 변경한다.
  */
  menuToggleButton.classList.toggle(
    "active",
    state.menuOpen
  );

  /*
    메뉴가 열려 있을 때 body에 menu-open 클래스를 추가한다.

    CSS의 overflow: hidden을 적용하여
    메뉴 뒤의 페이지가 스크롤되지 않도록 한다.
  */
  document.body.classList.toggle(
    "menu-open",
    state.menuOpen
  );

  /*
    스크린 리더에 메뉴의 열림 여부를 전달한다.

    setAttribute에는 문자열이 필요하기 때문에
    Boolean을 String으로 변환한다.
  */
  menuToggleButton.setAttribute(
    "aria-expanded",
    String(state.menuOpen)
  );

  /*
    메뉴 상태에 따라 버튼의 접근성 설명을 변경한다.
  */
  menuToggleButton.setAttribute(
    "aria-label",
    state.menuOpen
      ? "메뉴 닫기"
      : "메뉴 열기"
  );
};


/*
  메뉴 상태를 원하는 값으로 직접 설정한다.

  isOpen:
  true  → 메뉴 열기
  false → 메뉴 닫기
*/
const setMenuOpen = (isOpen) => {
  state.menuOpen = isOpen;
  renderMenu();
};


/*
  현재 메뉴 상태의 반대값으로 변경한다.
*/
const toggleMenu = () => {
  setMenuOpen(!state.menuOpen);
};


/* =========================================================
   6. 네비게이션 부드러운 스크롤
========================================================= */

/*
  네비게이션 링크를 클릭했을 때 실행된다.
*/
const handleNavigationClick = (event) => {
  /*
    event.currentTarget은
    이벤트 리스너가 연결된 실제 링크 요소이다.
  */
  const link =
    event.currentTarget;

  /*
    링크의 href 값을 가져온다.

    예:
    #about
    #projects
  */
  const targetId =
    link.getAttribute("href");

  /*
    href가 없거나 페이지 내부 앵커가 아니면
    아래 코드를 실행하지 않는다.
  */
  if (
    !targetId ||
    !targetId.startsWith("#")
  ) {
    return;
  }

  /*
    href 값과 같은 id를 가진 section을 선택한다.
  */
  const targetSection =
    document.querySelector(targetId);

  /*
    대상 section을 찾을 수 없으면 종료한다.
  */
  if (!targetSection) {
    return;
  }

  /*
    앵커 링크가 즉시 이동하는
    브라우저 기본 동작을 막는다.
  */
  event.preventDefault();

  /*
    대상 section으로 부드럽게 이동한다.
  */
  targetSection.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });

  /*
    모바일 메뉴에서 링크를 클릭한 경우
    이동 후 메뉴를 닫는다.
  */
  setMenuOpen(false);
};


/* =========================================================
   7. 스크롤 관련 UI
   ---------------------------------------------------------
   스크롤 위치에 따라:
   - 헤더 스타일 변경
   - 맨 위로 가기 버튼 표시
========================================================= */

/*
  사용자가 스크롤할 때마다 실행된다.
*/
const updateScrollUI = () => {
  /*
    현재 세로 스크롤 위치를 가져온다.
  */
  const scrollY =
    window.scrollY;

  /*
    스크롤 위치가 60px 이상이면
    헤더에 scrolled 클래스를 추가한다.
  */
  siteHeader.classList.toggle(
    "scrolled",
    scrollY >= HEADER_CHANGE_Y
  );

  /*
    스크롤 위치가 300px 이상이면
    맨 위로 버튼에 visible 클래스를 추가한다.
  */
  scrollTopButton.classList.toggle(
    "visible",
    scrollY >= SCROLL_TOP_VISIBLE_Y
  );
};


/*
  페이지 맨 위로 부드럽게 이동한다.
*/
const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
};


/* =========================================================
   8. Intersection Observer 스크롤 애니메이션
   ---------------------------------------------------------
   요소가 화면 안에 들어오면 visible 클래스를 추가한다.
========================================================= */

/*
  reveal 요소들을 관찰하는
  Intersection Observer를 생성한다.
*/
const createScrollObserver = () => {
  /*
    요소의 20%가 화면에 들어오면
    콜백을 실행하도록 설정한다.
  */
  const observerOptions = {
    threshold: OBSERVER_THRESHOLD,
  };

  /*
    관찰 대상의 화면 진입 상태가 바뀌면 실행된다.
  */
  const observerCallback = (
    entries,
    observer
  ) => {
    /*
      여러 관찰 대상의 상태를 하나씩 확인한다.
    */
    entries.forEach((entry) => {
      /*
        요소가 아직 화면에 들어오지 않았다면
        아무 작업도 하지 않는다.
      */
      if (!entry.isIntersecting) {
        return;
      }

      /*
        요소에 visible 클래스를 추가한다.

        CSS가 opacity와 transform을 변경하여
        등장 애니메이션을 실행한다.
      */
      entry.target.classList.add(
        "visible"
      );

      /*
        애니메이션이 한 번 실행된 요소는
        더 이상 관찰하지 않는다.
      */
      observer.unobserve(
        entry.target
      );
    });
  };

  /*
    옵션과 콜백을 사용해 Observer 객체를 생성한다.
  */
  const observer =
    new IntersectionObserver(
      observerCallback,
      observerOptions
    );

  /*
    모든 reveal 요소를 관찰 대상으로 등록한다.
  */
  revealElements.forEach((element) => {
    observer.observe(element);
  });
};


/* =========================================================
   9. GitHub Projects 상태별 렌더링
   ---------------------------------------------------------
   API 상태에 따라 Projects 섹션에 다른 화면을 표시한다.

   상태:
   - loading
   - success
   - error
   - empty
========================================================= */

/*
  GitHub API 요청 중 화면을 표시한다.
*/
const renderProjectLoading = () => {
  /*
    이전 프로젝트 카드를 제거한다.
  */
  projectsGrid.innerHTML = "";

  /*
    로딩 스피너와 메시지를 표시한다.
  */
  projectsStatus.innerHTML = `
    <div class="status-card">
      <div
        class="spinner"
        aria-hidden="true"
      ></div>

      <p>
        GitHub 프로젝트를 불러오는 중입니다...
      </p>
    </div>
  `;
};


/*
  GitHub API 요청 실패 화면을 표시한다.
*/
const renderProjectError = () => {
  /* 이전 프로젝트 카드를 제거 */
  projectsGrid.innerHTML = "";

  /*
    상태에 저장된 오류 메시지와
    다시 시도 버튼을 표시한다.
  */
  projectsStatus.innerHTML = `
    <div class="status-card">
      <p>
        ${state.projects.errorMessage}
      </p>

      <button
        class="retry-button"
        id="retry-projects"
        type="button"
      >
        다시 시도
      </button>
    </div>
  `;

  /*
    innerHTML로 새로 만든 버튼은
    HTML 생성 후 다시 선택해야 한다.
  */
  const retryButton =
    document.querySelector(
      "#retry-projects"
    );

  /*
    다시 시도 버튼 클릭 시
    GitHub API를 다시 호출한다.
  */
  retryButton.addEventListener(
    "click",
    fetchProjects
  );
};


/*
  API 요청은 성공했지만
  표시할 저장소가 없는 경우의 화면
*/
const renderProjectEmpty = () => {
  projectsGrid.innerHTML = "";

  projectsStatus.innerHTML = `
    <div class="status-card">
      <p>
        표시할 프로젝트가 없습니다.
      </p>
    </div>
  `;
};


/*
  GitHub 저장소 객체 하나를
  프로젝트 카드 HTML 문자열로 변환한다.
*/
const createProjectCard = (repository) => {
  /*
    구조분해 할당을 사용해
    저장소 객체에서 필요한 값만 꺼낸다.

    API 속성 이름을 읽기 쉬운 변수명으로 변경한다.

    html_url → repositoryUrl
    stargazers_count → starCount
    updated_at → updatedAt
  */
  const {
    name,
    description,
    html_url: repositoryUrl,
    language,
    stargazers_count: starCount,
    updated_at: updatedAt,
  } = repository;

  /*
    저장소 설명이 null이면
    기본 설명문을 사용한다.
  */
  const safeDescription =
    description ||
    "저장소 설명이 등록되지 않았습니다.";

  /*
    사용 언어가 null이면
    "기타"를 표시한다.
  */
  const safeLanguage =
    language || "기타";

  /*
    GitHub API의 날짜를
    한국어 형식으로 변환한다.
  */
  const formattedDate =
    new Intl.DateTimeFormat(
      "ko-KR",
      {
        year: "numeric",
        month: "short",
        day: "numeric",
      }
    ).format(
      new Date(updatedAt)
    );

  /*
    템플릿 리터럴을 사용해
    저장소 데이터를 HTML 카드로 변환한다.
  */
  return `
    <article class="project-card">
      <h3>
        ${name}
      </h3>

      <p class="project-description">
        ${safeDescription}
      </p>

      <div class="project-meta">
        <span>
          언어: ${safeLanguage}
        </span>

        <span>
          별: ${starCount}
        </span>

        <span>
          수정: ${formattedDate}
        </span>
      </div>

      <a
        class="project-link"
        href="${repositoryUrl}"
        target="_blank"
        rel="noopener noreferrer"
      >
        GitHub에서 보기 →
      </a>
    </article>
  `;
};


/*
  API 성공 후 프로젝트 카드들을 화면에 표시한다.
*/
const renderProjectSuccess = () => {
  /*
    로딩 또는 에러 메시지를 제거한다.
  */
  projectsStatus.innerHTML = "";

  /*
    map:
    각 저장소 객체를 카드 HTML로 변환한다.

    join(""):
    HTML 문자열 배열을 하나의 문자열로 합친다.
  */
  const projectCards =
    state.projects.data
      .map(createProjectCard)
      .join("");

  /*
    완성된 카드 HTML을 Grid 영역에 삽입한다.
  */
  projectsGrid.innerHTML =
    projectCards;
};


/*
  현재 API 상태에 따라
  알맞은 렌더링 함수를 선택한다.
*/
const renderProjects = () => {
  /*
    구조분해 할당으로
    projects 상태에서 필요한 값만 꺼낸다.
  */
  const { status, data } =
    state.projects;

  /*
    요청 중이면 로딩 UI 표시
  */
  if (status === "loading") {
    renderProjectLoading();
    return;
  }

  /*
    요청 실패이면 에러 UI 표시
  */
  if (status === "error") {
    renderProjectError();
    return;
  }

  /*
    요청은 성공했지만 데이터가 없으면
    빈 상태 UI 표시
  */
  if (
    status === "success" &&
    data.length === 0
  ) {
    renderProjectEmpty();
    return;
  }

  /*
    요청 성공이고 데이터가 있으면
    프로젝트 카드 표시
  */
  if (status === "success") {
    renderProjectSuccess();
  }
};


/* =========================================================
   10. GitHub API 호출
   ---------------------------------------------------------
   API 호출 → 상태 변경 → 화면 업데이트

   전체 흐름:
   fetchProjects()
   → loading
   → fetch 요청
   → 성공 또는 실패
   → success 또는 error
   → renderProjects()
========================================================= */

/*
  async 함수이므로 내부에서 await를 사용할 수 있다.
*/
async function fetchProjects() {
  /*
    API 요청을 시작하기 전에
    상태를 loading으로 변경한다.
  */
  state.projects.status =
    "loading";

  /*
    이전 오류 메시지를 초기화한다.
  */
  state.projects.errorMessage =
    "";

  /*
    변경된 loading 상태를 즉시 화면에 표시한다.
  */
  renderProjects();

  try {
    /*
      GitHub API 주소를 만든다.

      sort=updated:
      최근 수정 순으로 정렬

      direction=desc:
      최신 항목부터 표시

      per_page=100:
      한 번의 요청에서 최대 100개 저장소 요청
    */
    const endpoint =
      `https://api.github.com/users/${GITHUB_USERNAME}/repos` +
      "?sort=updated&direction=desc&per_page=100";

    /*
      fetch로 API 요청을 보내고
      응답이 도착할 때까지 기다린다.
    */
    const response =
      await fetch(endpoint);

    /*
      HTTP 상태 코드가 성공 범위가 아니면
      직접 Error를 발생시킨다.
    */
    if (!response.ok) {
      /*
        403:
        인증하지 않은 GitHub API의
        요청 횟수 제한에 도달한 경우가 많다.
      */
      if (response.status === 403) {
        throw new Error(
          "GitHub API 호출 제한에 도달했습니다. 잠시 후 다시 시도해 주세요."
        );
      }

      /*
        404:
        입력한 GitHub 사용자를 찾을 수 없음
      */
      if (response.status === 404) {
        throw new Error(
          "GitHub 사용자를 찾을 수 없습니다."
        );
      }

      /*
        그 외 HTTP 오류
      */
      throw new Error(
        `프로젝트 요청에 실패했습니다. 오류 코드: ${response.status}`
      );
    }

    /*
      응답 본문을 JSON 데이터로 변환한다.
    */
    const repositories =
      await response.json();

    /*
      filter:
      fork 및 archived 저장소를 제외한다.

      slice(0, 6):
      최대 6개 저장소만 화면에 표시한다.
    */
    const visibleRepositories =
      repositories
        .filter((repository) => {
          return (
            !repository.fork &&
            !repository.archived
          );
        })
        .slice(0, 6);

    /*
      요청 성공 상태로 변경한다.
    */
    state.projects.status =
      "success";

    /*
      화면에 표시할 저장소 데이터를 저장한다.
    */
    state.projects.data =
      visibleRepositories;
  } catch (error) {
    /*
      네트워크 오류, API 오류 등이 발생하면
      error 상태로 변경한다.
    */
    state.projects.status =
      "error";

    /*
      실패했으므로 프로젝트 데이터를 비운다.
    */
    state.projects.data = [];

    /*
      Error 객체라면 실제 message를 사용하고,
      예상하지 못한 값이면 기본 메시지를 사용한다.
    */
    state.projects.errorMessage =
      error instanceof Error
        ? error.message
        : "프로젝트를 불러올 수 없습니다.";
  }

  /*
    최종 상태에 맞는 화면을 렌더링한다.
  */
  renderProjects();
}


/* =========================================================
   11. Contact 폼 상태와 유효성 검사
========================================================= */

/*
  이메일 형식이 기본 패턴과 일치하는지 확인한다.

  검사 형식:
  문자열@문자열.문자열
*/
const isValidEmail = (email) => {
  const emailPattern =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  return emailPattern.test(email);
};


/*
  하나의 입력 필드를 검사하고
  오류 메시지를 문자열로 반환한다.

  오류가 없으면 빈 문자열 ""을 반환한다.
*/
const validateField = (
  fieldName,
  fieldValue
) => {
  /*
    입력 앞뒤의 불필요한 공백을 제거한다.
  */
  const trimmedValue =
    fieldValue.trim();

  /*
    이름 필드 검사
  */
  if (fieldName === "name") {
    /*
      이름이 비어 있는 경우
    */
    if (trimmedValue === "") {
      return "이름을 입력해 주세요.";
    }

    /*
      이름이 두 글자보다 짧은 경우
    */
    if (trimmedValue.length < 2) {
      return "이름은 두 글자 이상 입력해 주세요.";
    }
  }

  /*
    이메일 필드 검사
  */
  if (fieldName === "email") {
    /*
      이메일이 비어 있는 경우
    */
    if (trimmedValue === "") {
      return "이메일을 입력해 주세요.";
    }

    /*
      이메일 형식이 올바르지 않은 경우
    */
    if (!isValidEmail(trimmedValue)) {
      return "올바른 이메일 형식을 입력해 주세요.";
    }
  }

  /*
    메시지 필드 검사
  */
  if (fieldName === "message") {
    /*
      메시지가 비어 있는 경우
    */
    if (trimmedValue === "") {
      return "메시지를 입력해 주세요.";
    }

    /*
      메시지가 열 글자보다 짧은 경우
    */
    if (trimmedValue.length < 10) {
      return "메시지는 열 글자 이상 입력해 주세요.";
    }
  }

  /*
    모든 검사를 통과하면 오류 없음
  */
  return "";
};


/*
  하나의 폼 필드 오류 상태를 화면에 반영한다.
*/
const renderFormField = (fieldName) => {
  /*
    fieldName과 같은 id의 입력 요소를 선택한다.

    예:
    fieldName = "email"
    → #email 선택
  */
  const inputElement =
    document.querySelector(
      `#${fieldName}`
    );

  /*
    해당 필드의 오류 메시지 요소를 선택한다.

    예:
    fieldName = "email"
    → #email-error 선택
  */
  const errorElement =
    document.querySelector(
      `#${fieldName}-error`
    );

  /*
    state에 저장된 현재 오류 메시지
  */
  const errorMessage =
    state.form.errors[fieldName];

  /*
    오류가 있으면 invalid 클래스를 추가한다.
    CSS에서 빨간색 테두리를 적용한다.
  */
  inputElement.classList.toggle(
    "invalid",
    errorMessage !== ""
  );

  /*
    스크린 리더에 입력값이 유효한지 전달한다.
  */
  inputElement.setAttribute(
    "aria-invalid",
    String(errorMessage !== "")
  );

  /*
    입력창 아래에 오류 메시지를 표시한다.
  */
  errorElement.textContent =
    errorMessage;
};


/*
  사용자가 입력할 때마다
  해당 필드의 상태를 업데이트한다.
*/
const updateFormField = (
  fieldName,
  fieldValue
) => {
  /*
    사용자가 입력한 값을 state에 저장한다.
  */
  state.form.values[fieldName] =
    fieldValue;

  /*
    입력값을 검사하고 오류 결과를 저장한다.
  */
  state.form.errors[fieldName] =
    validateField(
      fieldName,
      fieldValue
    );

  /*
    사용자가 다시 입력하기 시작하면
    이전 제출 성공 상태를 해제한다.
  */
  state.form.submitted =
    false;

  /*
    이전 성공 메시지를 제거한다.
  */
  formSuccess.textContent = "";

  /*
    해당 입력 필드만 다시 렌더링한다.
  */
  renderFormField(fieldName);
};


/*
  폼의 모든 입력 필드를 검사한다.
*/
const validateEntireForm = () => {
  /*
    검사할 필드 이름 배열
  */
  const fieldNames = [
    "name",
    "email",
    "message",
  ];

  /*
    각 필드의 현재 값을 검사하고
    오류 상태와 화면을 업데이트한다.
  */
  fieldNames.forEach((fieldName) => {
    const fieldValue =
      state.form.values[fieldName];

    state.form.errors[fieldName] =
      validateField(
        fieldName,
        fieldValue
      );

    renderFormField(fieldName);
  });

  /*
    every는 모든 필드의 오류가 빈 문자열일 때만
    true를 반환한다.
  */
  return fieldNames.every(
    (fieldName) => {
      return (
        state.form.errors[fieldName] === ""
      );
    }
  );
};


/*
  폼 제출 성공 후
  폼과 오류 상태를 초기화한다.
*/
const resetFormState = () => {
  /*
    입력값 상태 초기화
  */
  state.form.values = {
    name: "",
    email: "",
    message: "",
  };

  /*
    오류 메시지 상태 초기화
  */
  state.form.errors = {
    name: "",
    email: "",
    message: "",
  };

  /*
    모든 입력 요소에서
    invalid 클래스와 aria-invalid 상태를 제거한다.
  */
  formInputs.forEach(
    (inputElement) => {
      inputElement.classList.remove(
        "invalid"
      );

      inputElement.setAttribute(
        "aria-invalid",
        "false"
      );
    }
  );

  /*
    화면에 표시된 모든 오류 메시지를 제거한다.
  */
  document
    .querySelectorAll(".error-message")
    .forEach((errorElement) => {
      errorElement.textContent = "";
    });
};


/*
  사용자가 input 또는 textarea에 입력할 때 실행된다.
*/
const handleFormInput = (event) => {
  /*
    실제로 입력이 발생한 요소
  */
  const inputElement =
    event.target;

  /*
    input의 name과 value를 사용해
    해당 필드 상태를 업데이트한다.
  */
  updateFormField(
    inputElement.name,
    inputElement.value
  );
};


/*
  Contact 폼 제출 시 실행된다.
*/
const handleFormSubmit = (event) => {
  /*
    브라우저의 기본 폼 제출 및
    페이지 새로고침을 막는다.
  */
  event.preventDefault();

  /*
    전체 폼 유효성 검사 실행
  */
  const isFormValid =
    validateEntireForm();

  /*
    하나라도 유효하지 않은 필드가 있는 경우
  */
  if (!isFormValid) {
    state.form.submitted =
      false;

    formSuccess.textContent =
      "";

    /*
      첫 번째 invalid 입력 요소를 찾는다.
    */
    const firstInvalidInput =
      contactForm.querySelector(
        ".invalid"
      );

    /*
      첫 번째 오류 입력창으로 포커스를 이동하여
      사용자가 바로 수정할 수 있도록 한다.
    */
    if (firstInvalidInput) {
      firstInvalidInput.focus();
    }

    return;
  }

  /*
    모든 필드가 유효하면
    제출 성공 상태로 변경한다.
  */
  state.form.submitted =
    true;

  /*
    사용자에게 성공 메시지를 표시한다.
  */
  formSuccess.textContent =
    "입력 내용이 성공적으로 확인되었습니다.";

  /*
    HTML 폼 입력값을 초기화한다.
  */
  contactForm.reset();

  /*
    JavaScript state와 오류 UI도 초기화한다.
  */
  resetFormState();
};


/* =========================================================
   12. 기타 초기 화면 설정
========================================================= */

/*
  Footer에 현재 연도를 자동으로 표시한다.

  예:
  2026
*/
const renderCurrentYear = () => {
  currentYear.textContent =
    String(
      new Date().getFullYear()
    );
};


/*
  화면 크기가 데스크톱으로 바뀌었을 때
  모바일 메뉴가 열린 상태로 남지 않도록 닫는다.
*/
const closeMenuOnDesktop = () => {
  /*
    CSS의 데스크톱 기준인 1024px과 맞춘다.
  */
  const isDesktop =
    window.innerWidth >= 1024;

  /*
    데스크톱 화면이고 모바일 메뉴가 열려 있다면
    메뉴 상태를 false로 변경한다.
  */
  if (
    isDesktop &&
    state.menuOpen
  ) {
    setMenuOpen(false);
  }
};


/* =========================================================
   13. 이벤트 리스너 연결
   ---------------------------------------------------------
   HTML에 onclick을 작성하지 않고
   addEventListener를 사용해 이벤트를 연결한다.
========================================================= */

const attachEventListeners = () => {
  /*
    다크 모드 버튼 클릭
  */
  themeToggleButton.addEventListener(
    "click",
    toggleTheme
  );

  /*
    햄버거 메뉴 버튼 클릭
  */
  menuToggleButton.addEventListener(
    "click",
    toggleMenu
  );

  /*
    모든 네비게이션 링크에
    부드러운 스크롤 이벤트 연결
  */
  navigationLinks.forEach((link) => {
    link.addEventListener(
      "click",
      handleNavigationClick
    );
  });

  /*
    페이지 스크롤 시
    헤더와 맨 위 버튼 상태 업데이트
  */
  window.addEventListener(
    "scroll",
    updateScrollUI
  );

  /*
    브라우저 크기 변경 시
    데스크톱에서 모바일 메뉴 닫기
  */
  window.addEventListener(
    "resize",
    closeMenuOnDesktop
  );

  /*
    맨 위로 가기 버튼 클릭
  */
  scrollTopButton.addEventListener(
    "click",
    scrollToTop
  );

  /*
    각 폼 입력 요소에 input 이벤트 연결
  */
  formInputs.forEach(
    (inputElement) => {
      inputElement.addEventListener(
        "input",
        handleFormInput
      );
    }
  );

  /*
    Contact 폼 제출 이벤트 연결
  */
  contactForm.addEventListener(
    "submit",
    handleFormSubmit
  );
};


/* =========================================================
   14. 애플리케이션 초기화
   ---------------------------------------------------------
   페이지가 처음 실행될 때 필요한 작업을
   순서대로 실행한다.
========================================================= */

const initializeApp = () => {
  /*
    1. localStorage에서 저장된 테마를 가져온다.
  */
  state.theme =
    getSavedTheme();

  /*
    2. 현재 테마를 화면에 적용한다.
  */
  renderTheme();

  /*
    3. 초기 메뉴 상태를 화면에 적용한다.
  */
  renderMenu();

  /*
    4. Footer의 현재 연도를 표시한다.
  */
  renderCurrentYear();

  /*
    5. 현재 스크롤 위치에 맞게
       헤더와 맨 위 버튼을 설정한다.
  */
  updateScrollUI();

  /*
    6. 모든 사용자 이벤트를 연결한다.
  */
  attachEventListeners();

  /*
    7. 스크롤 애니메이션 관찰을 시작한다.
  */
  createScrollObserver();

  /*
    8. GitHub API 요청을 시작한다.
  */
  fetchProjects();
};


/*
  애플리케이션 실행 시작
*/
initializeApp();
