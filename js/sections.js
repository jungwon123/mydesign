// 섹션 생성 및 관리
import { SECTIONS } from "./config.js";
import { hovercar, currentHovercarConfig } from "./hovercar.js";
import { isLoaded } from "./loader.js";

export let currentSection = 0;
export let scrollY = 0;
export let targetScrollY = 0;
export let isSmoothScrolling = false;

// 섹션 생성 함수
export function createSections() {
  const container = document.querySelector(".sections-container");
  container.innerHTML = "";

  // 섹션 생성
  SECTIONS.forEach((section, index) => {
    const sectionElement = document.createElement("div");
    sectionElement.className = "section";
    sectionElement.id = `section${index + 1}`;

    // Coming Soon 스타일 추가 (마지막 섹션에만)
    let extraContent = "";
    if (index === SECTIONS.length - 1) {
      extraContent = `
        <div class="coming-soon-decoration">
          <div class="cyber-line"></div>
          <div class="cyber-dot"></div>
          <div class="cyber-line"></div>
        </div>
      `;
      sectionElement.classList.add("coming-soon-section");
    }

    // 섹션 내용
    sectionElement.innerHTML = `
      <div class="section-content">
        <h2 class="section-title ${
          index === SECTIONS.length - 1 ? "coming-soon-title" : ""
        }">${section.title}</h2>
        <p class="section-description">${section.description}</p>
        ${extraContent}
      </div>
    `;

    // 섹션 스타일 - 위치, 배경색
    sectionElement.style.top = `${index * 100}vh`;
    sectionElement.style.backgroundColor = section.color;

    // 첫 번째 섹션은 활성화
    if (index === 0) {
      sectionElement.classList.add("active");
    }

    container.appendChild(sectionElement);
  });

  // 스크롤 인디케이터 설정
  setupScrollIndicator();
}

// 스크롤 인디케이터 설정
function setupScrollIndicator() {
  const indicatorContainer = document.createElement("div");
  indicatorContainer.className = "scroll-indicator";

  SECTIONS.forEach((_, index) => {
    const dot = document.createElement("div");
    dot.className = `indicator-dot ${index === 0 ? "active" : ""}`;
    dot.dataset.index = index;

    dot.addEventListener("click", () => {
      if (isLoaded && !isSmoothScrolling) {
        targetScrollY = index * window.innerHeight;
        isSmoothScrolling = true;

        setTimeout(() => {
          currentSection = index;
          animateSection(currentSection);
          isSmoothScrolling = false;
        }, 500);
      }
    });

    indicatorContainer.appendChild(dot);
  });

  document.body.appendChild(indicatorContainer);
}

// 스크롤 인디케이터 업데이트
export function updateScrollIndicator() {
  const dots = document.querySelectorAll(".indicator-dot");

  dots.forEach((dot, index) => {
    if (index === currentSection) {
      dot.classList.add("active");
    } else {
      dot.classList.remove("active");
    }
  });

  // 마지막 섹션에서는 인디케이터 숨김
  const indicator = document.querySelector(".scroll-indicator");
  indicator.style.display =
    currentSection < SECTIONS.length - 1 ? "flex" : "none";
}

// 섹션 애니메이션 설정
export function animateSection(index) {
  const sections = document.querySelectorAll(".section");

  // 모든 섹션 비활성화
  sections.forEach((section) => {
    section.classList.remove("active");
  });

  // 현재 섹션 활성화
  const currentSection = sections[index];
  currentSection.classList.add("active");

  // 인디케이터 업데이트
  updateScrollIndicator();

  // 배경색 변경 애니메이션
  gsap.to(document.body, {
    backgroundColor: SECTIONS[index].color,
    duration: 1,
    ease: "power2.out",
  });

  // 섹션 내용 애니메이션
  const title = currentSection.querySelector(".section-title");
  const description = currentSection.querySelector(".section-description");

  // 타이틀과 설명 리셋
  gsap.set(title, { opacity: 0, y: 20 });
  gsap.set(description, { opacity: 0, y: 20 });

  // 타이틀 애니메이션
  gsap.to(title, {
    opacity: 1,
    y: 0,
    duration: 1,
    ease: "power2.out",
    delay: 0.2,
  });

  // 설명 애니메이션
  gsap.to(description, {
    opacity: 1,
    y: 0,
    duration: 1,
    ease: "power2.out",
    delay: 0.4,
  });

  // 호버카 위치를 항상 고정
  if (hovercar) {
    // 위치를 항상 고정 값으로 설정 (모든 섹션에서 동일)
    gsap.to(hovercar.position, {
      x: currentHovercarConfig.position.x,
      y: currentHovercarConfig.position.y,
      z: currentHovercarConfig.position.z,
      duration: 0.5, // 빠르게 조정
      ease: "power1.out",
    });

    // 회전 애니메이션은 약간만 허용
    gsap.to(hovercar.rotation, {
      z: 0, // 기울임 없음
      duration: 0.5,
      ease: "power1.out",
    });
  }
}

// 스크롤 이벤트 설정
export function setupScrollEvents() {
  let lastScrollTime = 0;

  window.addEventListener(
    "wheel",
    function (e) {
      if (!isLoaded || isSmoothScrolling) return;
      e.preventDefault();

      const currentTime = Date.now();
      if (currentTime - lastScrollTime < 500) return;

      lastScrollTime = currentTime;
      isSmoothScrolling = true;

      // 스크롤 방향 결정
      const scrollDirection = e.deltaY > 0 ? 1 : -1;

      // 다음 섹션 계산
      let nextSection = currentSection + scrollDirection;
      nextSection = Math.max(0, Math.min(nextSection, SECTIONS.length - 1));

      // 섹션 변경 시에만 애니메이션
      if (nextSection !== currentSection) {
        currentSection = nextSection;
        targetScrollY = currentSection * window.innerHeight;

        // 섹션 애니메이션 시작
        animateSection(currentSection);
      }

      // 스크롤 완료 후 플래그 리셋
      setTimeout(() => {
        isSmoothScrolling = false;
      }, 500);
    },
    { passive: false }
  );

  // 모바일 터치 이벤트 처리
  let touchStartY = 0;

  document.addEventListener(
    "touchstart",
    (e) => {
      touchStartY = e.touches[0].clientY;
    },
    { passive: true }
  );

  document.addEventListener(
    "touchend",
    (e) => {
      if (!isLoaded || isSmoothScrolling) return;

      const touchEndY = e.changedTouches[0].clientY;
      const touchDiff = touchStartY - touchEndY;

      // 의미 있는 스와이프인 경우
      if (Math.abs(touchDiff) > 50) {
        const currentTime = Date.now();
        if (currentTime - lastScrollTime < 500) return;

        lastScrollTime = currentTime;
        isSmoothScrolling = true;

        // 스크롤 방향 결정
        const scrollDirection = touchDiff > 0 ? 1 : -1;

        // 다음 섹션 계산
        let nextSection = currentSection + scrollDirection;
        nextSection = Math.max(0, Math.min(nextSection, SECTIONS.length - 1));

        // 섹션 변경 시에만 애니메이션
        if (nextSection !== currentSection) {
          currentSection = nextSection;
          targetScrollY = currentSection * window.innerHeight;

          // 섹션 애니메이션 시작
          animateSection(currentSection);
        }

        // 스크롤 완료 후 플래그 리셋
        setTimeout(() => {
          isSmoothScrolling = false;
        }, 500);
      }
    },
    { passive: true }
  );
}
