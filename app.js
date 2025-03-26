// 네임스페이스 패턴 사용
window.App = window.App || {};

// 모듈 정의
App.Config = {
  // config.js 내용
  HOVERCAR_CONFIG: {
    large: {
      /* 설정 */
    },
    medium: {
      /* 설정 */
    },
    small: {
      /* 설정 */
    },
  },
  SECTIONS: [
    // 섹션 데이터
  ],
};

App.Scene = {
  renderer: null,
  scene: null,
  camera: null,
  composer: null,

  // scene.js 함수들
  setup: function () {
    // 씬 설정 코드
  },

  handleResize: function () {
    // 리사이즈 처리 코드
  },
};

// 다른 모듈들도 유사하게 정의

// 초기화 함수
App.init = function () {
  // 로딩 매니저 설정
  App.Loader.setupLoadingManager();

  // 씬 초기화
  App.Scene.setup();

  // 나머지 초기화 코드
};

// DOM 로드 완료 시 실행
document.addEventListener("DOMContentLoaded", App.init);
