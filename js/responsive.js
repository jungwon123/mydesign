// 반응형 기능 관리
import { handleWindowResize } from "./scene.js";
import { updateHovercarResponsiveSize } from "./hovercar.js";

// 섹션 컨텐츠 레이아웃 조정 함수
export function updateSectionContentLayout(isSmallScreen) {
  const sectionContents = document.querySelectorAll(".section-content");

  sectionContents.forEach((content) => {
    if (isSmallScreen) {
      // 작은 화면에서는 패딩 하단 추가 (모델을 위한 공간)
      content.style.paddingBottom = "30vh";
      content.classList.add("centered-content");
    } else {
      // 큰 화면에서는 기본 패딩
      content.style.paddingBottom = "2rem";
      content.classList.remove("centered-content");
    }
  });
}

// 반응형 이벤트 설정
export function setupResponsiveEvents() {
  // 창 크기 변경 이벤트
  window.addEventListener("resize", () => {
    // 창 크기 변경 처리
    handleWindowResize();

    // 호버카 반응형 업데이트
    updateHovercarResponsiveSize();

    // 섹션 크기도 업데이트
    updateSectionsSize();
  });

  // 초기 반응형 설정
  updateHovercarResponsiveSize();
  updateSectionsSize();
}

// 섹션 크기 업데이트
function updateSectionsSize() {
  document.querySelectorAll(".section").forEach((section, index) => {
    section.style.height = `${window.innerHeight}px`;
    section.style.top = `${index * window.innerHeight}px`;
  });
}
