// 메인 진입점
import { initializeApp } from "./loader.js";
import { setupScrollEvents } from "./sections.js";

// DOM이 준비되면 실행
document.addEventListener("DOMContentLoaded", () => {
  // 앱 초기화
  initializeApp();

  // 스크롤 이벤트 설정
  setupScrollEvents();
});
