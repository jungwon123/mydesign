// 애니메이션 및 렌더링
import { renderer, scene, camera, composer } from "./scene.js";
import {
  grid,
  updateGridAnimation,
  updateParticlesAnimation,
} from "./effects.js";
import { hovercar, mixer, updateHovercarAnimation } from "./hovercar.js";
import { currentSection, scrollY, targetScrollY } from "./sections.js";

let lastTime = 0;

// 애니메이션 루프 시작
export function startAnimation() {
  animate(0);
}

// 메인 애니메이션 루프
function animate(time) {
  requestAnimationFrame(animate);

  // 델타 시간 계산 (프레임 간 시간)
  const delta = time - lastTime;
  lastTime = time;

  // 부드러운 스크롤 처리
  scrollY += (targetScrollY - scrollY) * 0.1;

  // 그리드 애니메이션
  updateGridAnimation(time);

  // 파티클 애니메이션
  updateParticlesAnimation(time, delta);

  // 호버카 애니메이션
  updateHovercarAnimation(time);

  // 믹서 업데이트 (애니메이션이 있을 경우)
  if (mixer) {
    mixer.update(delta * 0.001);
  }

  // 섹션 스크롤 효과
  document.querySelector(
    ".sections-container"
  ).style.transform = `translateY(-${scrollY}px)`;

  // 씬 렌더링
  composer.render();
}
