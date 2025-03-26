// 호버카 모델 관리
import { scene } from "./scene.js";
import { loadingManager, isLoaded } from "./loader.js";
import { HOVERCAR_CONFIG } from "./config.js";
import { updateSectionContentLayout } from "./responsive.js";

export let hovercar; // 호버카 모델
export let mixer; // 애니메이션 믹서
export let currentHovercarConfig = HOVERCAR_CONFIG.large; // 현재 호버카 설정

// 호버카 모델 로드
export function loadHoverCar() {
  console.log("호버카 로드 시작");

  try {
    const gltfLoader = new THREE.GLTFLoader(loadingManager);

    // 대체 큐브 생성 함수 (오류 시 사용)
    const createFallbackHovercar = () => {
      console.log("대체 호버카 생성");
      const geometry = new THREE.BoxGeometry(2, 1, 4);
      const material = new THREE.MeshPhongMaterial({
        color: 0x00f3ff,
        emissive: 0x00f3ff,
        emissiveIntensity: 0.5,
      });
      hovercar = new THREE.Mesh(geometry, material);

      // 화면 크기에 맞는 설정 적용
      updateHovercarResponsiveSize();

      scene.add(hovercar);
      animateHovercar();
    };

    // 여러 경로 시도 (상대 경로, 절대 경로)
    const possiblePaths = [
      "free_cyberpunk_hovercar/scene.gltf",
      "/free_cyberpunk_hovercar/scene.gltf",
      "./free_cyberpunk_hovercar/scene.gltf",
      "../free_cyberpunk_hovercar/scene.gltf",
    ];

    // 모델 로드 시도
    gltfLoader.load(
      possiblePaths[0],
      (gltf) => {
        console.log("호버카 모델 로드 성공");

        // 애니메이션 믹서 설정
        mixer = new THREE.AnimationMixer(gltf.scene);

        if (gltf.animations && gltf.animations.length) {
          const idleAnimation = mixer.clipAction(gltf.animations[0]);
          idleAnimation.play();
        }

        hovercar = gltf.scene;

        // 화면 크기에 맞는 설정 적용
        updateHovercarResponsiveSize();

        hovercar.rotation.y = Math.PI / 4;
        scene.add(hovercar);

        // 모델의 재질 개선
        gltf.scene.traverse((node) => {
          if (node.isMesh) {
            // 메탈릭/러프니스 재질 개선
            if (node.material.metalness !== undefined) {
              node.material.metalness = 0.8; // 메탈릭 느낌 강화
              node.material.roughness = 0.2; // 반사도 증가
            }

            // 네온 효과가 필요한 부분 식별 (이름에 "light", "neon", "glow" 등이 포함된 경우)
            if (
              node.name.toLowerCase().includes("light") ||
              node.name.toLowerCase().includes("neon") ||
              node.name.toLowerCase().includes("glow") ||
              node.name.toLowerCase().includes("lamp")
            ) {
              // 네온 효과 추가
              node.material.emissive = new THREE.Color(0x00f3ff);
              node.material.emissiveIntensity = 2.0;
            }

            // 그림자 설정
            node.castShadow = true;
            node.receiveShadow = true;
          }
        });

        // 모델 로드 완료 후 애니메이션 시작
        animateHovercar();
      },
      undefined,
      (error) => {
        console.error("호버카 모델 로드 오류:", error);
        createFallbackHovercar();
      }
    );
  } catch (error) {
    console.error("호버카 로드 시도 중 오류:", error);
    createFallbackHovercar();
  }
}

// 화면 크기에 따른 호버카 크기 및 위치 업데이트
export function updateHovercarResponsiveSize() {
  if (!hovercar) return;

  // 화면 너비에 따라 적절한 설정 선택
  const width = window.innerWidth;

  if (width < 768) {
    // 모바일 크기
    currentHovercarConfig = HOVERCAR_CONFIG.small;
  } else if (width < 1200) {
    // 태블릿 크기
    currentHovercarConfig = HOVERCAR_CONFIG.medium;
  } else {
    // 데스크탑 크기
    currentHovercarConfig = HOVERCAR_CONFIG.large;
  }

  // 호버카 모델에 설정 적용
  const { scale, position, rotation } = currentHovercarConfig;

  // 크기 조정
  hovercar.scale.set(scale, scale, scale);

  // 위치 조정 - 애니메이션 없이 즉시 적용
  hovercar.position.set(position.x, position.y, position.z);

  // 회전 조정 - 작은 화면에서는 정면을 바라보도록
  hovercar.rotation.y = rotation.y;
  hovercar.rotation.z = rotation.z;

  // 호버카 위치 변경에 따른 섹션 컨텐츠 스타일 조정
  updateSectionContentLayout(width < 1200);

  console.log(
    `호버카 반응형 크기 조정: ${
      width < 768 ? "모바일" : width < 1200 ? "태블릿" : "데스크탑"
    }`
  );
}

// 호버카 애니메이션 함수
export function animateHovercar() {
  console.log("호버카 애니메이션 시작");

  // 여기에 필요한 추가 애니메이션 설정
}

// 호버카 애니메이션 업데이트
export function updateHovercarAnimation(time) {
  if (!hovercar) return;

  const width = window.innerWidth;
  const isSmallScreen = width < 1200;

  // 회전 - 작은 화면에서는 더 많이 회전
  if (isSmallScreen) {
    // 작은 화면에서는 Y축 회전을 더 크게
    hovercar.rotation.y += 0.001;
  } else {
    // 큰 화면에서는 미세한 회전
    hovercar.rotation.y += 0.0005;
  }

  // 호버링 효과 - 현재 설정 기준
  const hoverAmount = Math.sin(time * 0.001) * 0.02;
  const pos = currentHovercarConfig.position;

  // 위치 유지 - Y값만 약간 호버링
  hovercar.position.x = pos.x;
  hovercar.position.y = pos.y + hoverAmount;
  hovercar.position.z = pos.z;

  // 믹서 업데이트 (애니메이션이 있는 경우)
  if (mixer) {
    mixer.update(1 / 60); // 60fps 기준
  }
}
