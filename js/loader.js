// 로딩 화면 및 리소스 로딩
import { loadHoverCar } from "./hovercar.js";
import { setupScene } from "./scene.js";
import { setupGrid, setupParticles } from "./effects.js";
import { createSections, animateSection } from "./sections.js";
import { startAnimation } from "./animation.js";
import { setupResponsiveEvents } from "./responsive.js";

// 공유 변수 및 상태
export let loadingManager;
export let isLoaded = false;

// 로딩 매니저 설정
export function setupLoadingManager() {
  loadingManager = new THREE.LoadingManager();

  // 로딩 진행 상태 표시
  const progressBar = document.querySelector(".progress-bar-fill");

  loadingManager.onProgress = function (url, loaded, total) {
    const progress = (loaded / total) * 100;
    progressBar.style.width = `${progress}%`;
  };

  // 모든 리소스 로드 완료 시
  loadingManager.onLoad = function () {
    console.log("모든 리소스 로드 완료");

    // 프로그레스바 100% 설정
    progressBar.style.width = "100%";

    // 로딩 화면 숨기기
    setTimeout(() => {
      const loader = document.querySelector(".loader");
      loader.style.opacity = 0;
      setTimeout(() => {
        loader.style.display = "none";

        // 애니메이션 시작
        if (!isLoaded) {
          isLoaded = true;

          // 첫 번째 섹션 애니메이션 시작
          animateSection(0);
        }
      }, 200); // 200ms로 줄임
    }, 500);
  };

  // 로딩 오류 처리
  loadingManager.onError = function (url) {
    console.error("리소스 로드 오류:", url);

    // 로딩 실패 시에도 애플리케이션 진행
    const loader = document.querySelector(".loader");
    loader.style.opacity = 0;

    setTimeout(() => {
      loader.style.display = "none";
      isLoaded = true;
    }, 1000);
  };
}

// 로딩 화면 설정
export function setupLoader() {
  const loadingText = document.querySelector(".loader-text");
  const originalText = loadingText.textContent;

  // 로딩 텍스트 애니메이션
  let loadingInterval = setInterval(() => {
    if (isLoaded) {
      clearInterval(loadingInterval);
      return;
    }
  }, 500);
}

// 초기화 함수
export function initializeApp() {
  try {
    console.log("앱 초기화 시작");
    console.log("THREE 사용 가능 여부:", typeof THREE !== "undefined");

    // 로딩 매니저 설정
    setupLoadingManager();

    // 로딩 화면 설정
    setupLoader();

    // 씬 초기화
    setupScene();

    // 배경 설정
    setupGrid();
    setupParticles();

    // 섹션 생성
    createSections();

    // 호버카 로드
    loadHoverCar();

    // 반응형 이벤트 설정
    setupResponsiveEvents();

    // 애니메이션 루프 시작
    startAnimation();
  } catch (error) {
    console.error("초기화 오류:", error);
    console.error("스택:", error.stack);
    handleGlobalError({ error });
  }
}

// 전역 오류 처리
function handleGlobalError(e) {
  console.error("전역 오류:", e.error);

  // 오류 발생 시 로딩 화면 강제 종료
  if (!isLoaded) {
    const loader = document.querySelector(".loader");
    loader.style.opacity = 0;
    setTimeout(() => {
      loader.style.display = "none";
      isLoaded = true;
    }, 1000);
  }
}
