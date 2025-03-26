// Three.js 씬 설정
// 글로벌 THREE를 직접 사용

export let renderer, scene, camera, composer;

// 씬 초기화
export function setupScene() {
  // THREE 네임스페이스 사용
  renderer = new THREE.WebGLRenderer({
    canvas: document.getElementById("bg-canvas"),
    antialias: true,
    alpha: true,
    powerPreference: "high-performance",
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // 그림자 품질 향상
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  // 색상 설정 개선 - 밝기 향상을 위해 노출값 증가
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.5; // 노출값 증가하여 전체적인 밝기 향상

  // 씬 설정
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x030518); // 더 어두운 배경색

  // 카메라 설정
  const fov = 60;
  const aspect = window.innerWidth / window.innerHeight;
  const near = 0.1;
  const far = 1000;
  camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.set(0, 0, 5);

  // 조명 설정
  setupLights();

  // 포스트 프로세싱 설정
  setupPostProcessing();
}

// 조명 설정
function setupLights() {
  // 주변광
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);

  // 주요 조명 (전방)
  const mainLight = new THREE.DirectionalLight(0xffffff, 1);
  mainLight.position.set(2, 5, 3);
  mainLight.castShadow = true;

  // 그림자 품질 향상
  mainLight.shadow.mapSize.width = 2048;
  mainLight.shadow.mapSize.height = 2048;
  mainLight.shadow.camera.near = 0.5;
  mainLight.shadow.camera.far = 20;
  mainLight.shadow.normalBias = 0.05;

  scene.add(mainLight);

  // 보조 조명 (후방)
  const backLight = new THREE.DirectionalLight(0x2020ff, 0.7);
  backLight.position.set(-2, 3, -5);
  scene.add(backLight);

  // 모델 하이라이트용 포인트 라이트
  const pointLight = new THREE.PointLight(0x00f3ff, 1, 10);
  pointLight.position.set(2, 1, 2);
  scene.add(pointLight);
}

// 포스트 프로세싱 설정
function setupPostProcessing() {
  try {
    composer = new THREE.EffectComposer(renderer);

    // 렌더 패스
    const renderPass = new THREE.RenderPass(scene, camera);
    composer.addPass(renderPass);

    // 언리얼 블룸 패스 (있을 경우에만)
    if (THREE.UnrealBloomPass) {
      const bloomPass = new THREE.UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        0.5,
        0.4,
        0.85
      );
      composer.addPass(bloomPass);
    }

    // 색수차 패스 (있을 경우에만)
    if (THREE.ChromaticAberrationShader) {
      const chromaticAberration = new THREE.ShaderPass(
        THREE.ChromaticAberrationShader
      );
      chromaticAberration.uniforms.offset.value = new THREE.Vector2(
        0.001,
        0.001
      );
      composer.addPass(chromaticAberration);
    }

    // FXAA 셰이더 (있을 경우에만)
    if (THREE.FXAAShader) {
      const fxaaPass = new THREE.ShaderPass(THREE.FXAAShader);
      fxaaPass.uniforms.resolution.value.set(
        1 / (window.innerWidth * renderer.getPixelRatio()),
        1 / (window.innerHeight * renderer.getPixelRatio())
      );
      composer.addPass(fxaaPass);
    }
  } catch (error) {
    // 포스트 프로세싱 설정 실패 시 기본 렌더러만 사용
    console.error("포스트 프로세싱 설정 실패:", error);
    composer = { render: () => renderer.render(scene, camera) };
  }
}

// 창 크기 변경 처리
export function handleWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);

  // FXAA 해상도 업데이트
  const passes = composer.passes;
  for (let i = 0; i < passes.length; i++) {
    const pass = passes[i];
    if (pass.isShaderPass && pass.material.uniforms.resolution) {
      pass.material.uniforms.resolution.value.set(
        1 / (window.innerWidth * renderer.getPixelRatio()),
        1 / (window.innerHeight * renderer.getPixelRatio())
      );
    }
  }
}
