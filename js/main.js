"use strict";

/* =====================================
   1. 프로젝트 설정
===================================== */

const GITHUB_USERNAME = "bangahee";

const SCROLL_TOP_VISIBLE_Y = 300;
const HEADER_CHANGE_Y = 60;
const OBSERVER_THRESHOLD = 0.2;

/* =====================================
   2. 상태 객체
===================================== */

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

/* =====================================
   3. DOM 요소 선택
===================================== */

const documentElement = document.documentElement;

const siteHeader = document.querySelector("#site-header");

const menuToggleButton = document.querySelector("#menu-toggle");
const navMenu = document.querySelector("#nav-menu");
const navigationLinks = document.querySelectorAll(".nav-links a");

const themeToggleButton = document.querySelector("#theme-toggle");
const themeIcon = document.querySelector("#theme-icon");
const themeText = document.querySelector("#theme-text");

const scrollTopButton = document.querySelector("#scroll-top");

const projectsStatus = document.querySelector("#projects-status");
const projectsGrid = document.querySelector("#projects-grid");

const contactForm = document.querySelector("#contact-form");
const formInputs = document.querySelectorAll(
  "#contact-form input, #contact-form textarea"
);

const formSuccess = document.querySelector("#form-success");

const currentYear = document.querySelector("#current-year");

const revealElements = document.querySelectorAll(".reveal");

/* =====================================
   4. 다크 모드
   이벤트 → 상태 변경 → 화면 업데이트
===================================== */

const getSavedTheme = () => {
  const savedTheme = localStorage.getItem("portfolio-theme");

  if (savedTheme === "dark" || savedTheme === "light") {
    return savedTheme;
  }

  return "light";
};

const renderTheme = () => {
  const isDark = state.theme === "dark";

  documentElement.dataset.theme = state.theme;

  themeIcon.textContent = isDark ? "☀️" : "🌙";
  themeText.textContent = isDark ? "Light" : "Dark";

  themeToggleButton.setAttribute(
    "aria-label",
    isDark ? "라이트 모드로 전환" : "다크 모드로 전환"
  );
};

const setTheme = (theme) => {
  state.theme = theme;

  localStorage.setItem("portfolio-theme", state.theme);

  renderTheme();
};

const toggleTheme = () => {
  const nextTheme = state.theme === "light" ? "dark" : "light";

  setTheme(nextTheme);
};

/* =====================================
   5. 모바일 햄버거 메뉴
===================================== */

const renderMenu = () => {
  navMenu.classList.toggle("active", state.menuOpen);
  menuToggleButton.classList.toggle("active", state.menuOpen);
  document.body.classList.toggle("menu-open", state.menuOpen);

  menuToggleButton.setAttribute(
    "aria-expanded",
    String(state.menuOpen)
  );

  menuToggleButton.setAttribute(
    "aria-label",
    state.menuOpen ? "메뉴 닫기" : "메뉴 열기"
  );
};

const setMenuOpen = (isOpen) => {
  state.menuOpen = isOpen;

  renderMenu();
};

const toggleMenu = () => {
  setMenuOpen(!state.menuOpen);
};

/* =====================================
   6. 부드러운 스크롤
===================================== */

const handleNavigationClick = (event) => {
  const link = event.currentTarget;
  const targetId = link.getAttribute("href");

  if (!targetId || !targetId.startsWith("#")) {
    return;
  }

  const targetSection = document.querySelector(targetId);

  if (!targetSection) {
    return;
  }

  event.preventDefault();

  targetSection.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });

  setMenuOpen(false);
};

/* =====================================
   7. 스크롤 관련 UI
===================================== */

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

const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
};

/* =====================================
   8. 스크롤 애니메이션
===================================== */

const createScrollObserver = () => {
  const observerOptions = {
    threshold: OBSERVER_THRESHOLD,
  };

  const observerCallback = (entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }

      entry.target.classList.add("visible");
      observer.unobserve(entry.target);
    });
  };

  const observer = new IntersectionObserver(
    observerCallback,
    observerOptions
  );

  revealElements.forEach((element) => {
    observer.observe(element);
  });
};

/* =====================================
   9. GitHub 프로젝트 렌더링
===================================== */

const renderProjectLoading = () => {
  projectsGrid.innerHTML = "";

  projectsStatus.innerHTML = `
    <div class="status-card">
      <div class="spinner" aria-hidden="true"></div>
      <p>GitHub 프로젝트를 불러오는 중입니다...</p>
    </div>
  `;
};

const renderProjectError = () => {
  projectsGrid.innerHTML = "";

  projectsStatus.innerHTML = `
    <div class="status-card">
      <p>${state.projects.errorMessage}</p>
      <button class="retry-button" id="retry-projects" type="button">
        다시 시도
      </button>
    </div>
  `;

  const retryButton = document.querySelector("#retry-projects");

  retryButton.addEventListener("click", fetchProjects);
};

const renderProjectEmpty = () => {
  projectsGrid.innerHTML = "";

  projectsStatus.innerHTML = `
    <div class="status-card">
      <p>표시할 프로젝트가 없습니다.</p>
    </div>
  `;
};

const createProjectCard = (repository) => {
  const {
    name,
    description,
    html_url: repositoryUrl,
    language,
    stargazers_count: starCount,
    updated_at: updatedAt,
  } = repository;

  const safeDescription =
    description || "저장소 설명이 등록되지 않았습니다.";

  const safeLanguage = language || "기타";

  const formattedDate = new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(updatedAt));

  return `
    <article class="project-card">
      <h3>${name}</h3>

      <p class="project-description">
        ${safeDescription}
      </p>

      <div class="project-meta">
        <span>언어: ${safeLanguage}</span>
        <span>별: ${starCount}</span>
        <span>수정: ${formattedDate}</span>
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

const renderProjectSuccess = () => {
  projectsStatus.innerHTML = "";

  const projectCards = state.projects.data
    .map(createProjectCard)
    .join("");

  projectsGrid.innerHTML = projectCards;
};

const renderProjects = () => {
  const { status, data } = state.projects;

  if (status === "loading") {
    renderProjectLoading();
    return;
  }

  if (status === "error") {
    renderProjectError();
    return;
  }

  if (status === "success" && data.length === 0) {
    renderProjectEmpty();
    return;
  }

  if (status === "success") {
    renderProjectSuccess();
  }
};

/* =====================================
   10. GitHub API 호출
   API 호출 → 상태 변경 → 화면 업데이트
===================================== */

async function fetchProjects() {
  state.projects.status = "loading";
  state.projects.errorMessage = "";

  renderProjects();

  try {
    const endpoint =
      `https://api.github.com/users/${GITHUB_USERNAME}/repos` +
      "?sort=updated&direction=desc&per_page=100";

    const response = await fetch(endpoint);

    if (!response.ok) {
      if (response.status === 403) {
        throw new Error(
          "GitHub API 호출 제한에 도달했습니다. 잠시 후 다시 시도해 주세요."
        );
      }

      if (response.status === 404) {
        throw new Error(
          "GitHub 사용자를 찾을 수 없습니다."
        );
      }

      throw new Error(
        `프로젝트 요청에 실패했습니다. 오류 코드: ${response.status}`
      );
    }

    const repositories = await response.json();

    const visibleRepositories = repositories
      .filter((repository) => {
        return !repository.fork && !repository.archived;
      })
      .slice(0, 6);

    state.projects.status = "success";
    state.projects.data = visibleRepositories;
  } catch (error) {
    state.projects.status = "error";
    state.projects.data = [];

    state.projects.errorMessage =
      error instanceof Error
        ? error.message
        : "프로젝트를 불러올 수 없습니다.";
  }

  renderProjects();
}

/* =====================================
   11. 폼 상태 및 유효성 검사
===================================== */

const isValidEmail = (email) => {
  const emailPattern =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  return emailPattern.test(email);
};

const validateField = (fieldName, fieldValue) => {
  const trimmedValue = fieldValue.trim();

  if (fieldName === "name") {
    if (trimmedValue === "") {
      return "이름을 입력해 주세요.";
    }

    if (trimmedValue.length < 2) {
      return "이름은 두 글자 이상 입력해 주세요.";
    }
  }

  if (fieldName === "email") {
    if (trimmedValue === "") {
      return "이메일을 입력해 주세요.";
    }

    if (!isValidEmail(trimmedValue)) {
      return "올바른 이메일 형식을 입력해 주세요.";
    }
  }

  if (fieldName === "message") {
    if (trimmedValue === "") {
      return "메시지를 입력해 주세요.";
    }

    if (trimmedValue.length < 10) {
      return "메시지는 열 글자 이상 입력해 주세요.";
    }
  }

  return "";
};

const renderFormField = (fieldName) => {
  const inputElement = document.querySelector(`#${fieldName}`);

  const errorElement = document.querySelector(
    `#${fieldName}-error`
  );

  const errorMessage = state.form.errors[fieldName];

  inputElement.classList.toggle(
    "invalid",
    errorMessage !== ""
  );

  inputElement.setAttribute(
    "aria-invalid",
    String(errorMessage !== "")
  );

  errorElement.textContent = errorMessage;
};

const updateFormField = (fieldName, fieldValue) => {
  state.form.values[fieldName] = fieldValue;

  state.form.errors[fieldName] = validateField(
    fieldName,
    fieldValue
  );

  state.form.submitted = false;
  formSuccess.textContent = "";

  renderFormField(fieldName);
};

const validateEntireForm = () => {
  const fieldNames = ["name", "email", "message"];

  fieldNames.forEach((fieldName) => {
    const fieldValue = state.form.values[fieldName];

    state.form.errors[fieldName] = validateField(
      fieldName,
      fieldValue
    );

    renderFormField(fieldName);
  });

  return fieldNames.every((fieldName) => {
    return state.form.errors[fieldName] === "";
  });
};

const resetFormState = () => {
  state.form.values = {
    name: "",
    email: "",
    message: "",
  };

  state.form.errors = {
    name: "",
    email: "",
    message: "",
  };

  formInputs.forEach((inputElement) => {
    inputElement.classList.remove("invalid");
    inputElement.setAttribute("aria-invalid", "false");
  });

  document.querySelectorAll(".error-message").forEach(
    (errorElement) => {
      errorElement.textContent = "";
    }
  );
};

const handleFormInput = (event) => {
  const inputElement = event.target;

  updateFormField(
    inputElement.name,
    inputElement.value
  );
};

const handleFormSubmit = (event) => {
  event.preventDefault();

  const isFormValid = validateEntireForm();

  if (!isFormValid) {
    state.form.submitted = false;
    formSuccess.textContent = "";

    const firstInvalidInput =
      contactForm.querySelector(".invalid");

    if (firstInvalidInput) {
      firstInvalidInput.focus();
    }

    return;
  }

  state.form.submitted = true;

  formSuccess.textContent =
    "입력 내용이 성공적으로 확인되었습니다.";

  contactForm.reset();
  resetFormState();
};

/* =====================================
   12. 기타 초기 화면 설정
===================================== */

const renderCurrentYear = () => {
  currentYear.textContent = String(
    new Date().getFullYear()
  );
};

const closeMenuOnDesktop = () => {
  const isDesktop = window.innerWidth >= 1024;

  if (isDesktop && state.menuOpen) {
    setMenuOpen(false);
  }
};

/* =====================================
   13. 이벤트 연결
===================================== */

const attachEventListeners = () => {
  themeToggleButton.addEventListener(
    "click",
    toggleTheme
  );

  menuToggleButton.addEventListener(
    "click",
    toggleMenu
  );

  navigationLinks.forEach((link) => {
    link.addEventListener(
      "click",
      handleNavigationClick
    );
  });

  window.addEventListener(
    "scroll",
    updateScrollUI
  );

  window.addEventListener(
    "resize",
    closeMenuOnDesktop
  );

  scrollTopButton.addEventListener(
    "click",
    scrollToTop
  );

  formInputs.forEach((inputElement) => {
    inputElement.addEventListener(
      "input",
      handleFormInput
    );
  });

  contactForm.addEventListener(
    "submit",
    handleFormSubmit
  );
};

/* =====================================
   14. 애플리케이션 시작
===================================== */

const initializeApp = () => {
  state.theme = getSavedTheme();

  renderTheme();
  renderMenu();
  renderCurrentYear();
  updateScrollUI();

  attachEventListeners();
  createScrollObserver();
  fetchProjects();
};

initializeApp();