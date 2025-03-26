// 변수 초기화
let renderer, scene, camera;
let composer;
let scrollY = 0;
let targetScrollY = 0;
let currentSection = 0;
let isSmoothScrolling = false;
let particles = [];
let grid;
let lastTime = 0;
let isLoaded = false;
let hovercar; // 호버카 모델
let loadingManager; // 로딩 매니저
let mixer; // 애니메이션 믹서

// 호버카 관련 전역 변수 수정 - 화면 크기별 설정 추가
const HOVERCAR_CONFIG = {
  // 기본 설정 (데스크탑) - 오른쪽에 배치
  large: {
    scale: 1.2,
    position: { x: 4, y: -0.5, z: -3 },
    rotation: { y: Math.PI / 4, z: 0 },
  },
  // 중간 화면 설정 (태블릿) - 중앙 하단에 배치
  medium: {
    scale: 0.9,
    position: { x: 0, y: -2, z: -3 },
    rotation: { y: 0, z: 0 },
  },
  // 작은 화면 설정 (모바일) - 중앙 하단에 배치, 더 작게
  small: {
    scale: 0.6,
    position: { x: 0, y: -1.8, z: -2.5 },
    rotation: { y: 0, z: 0 },
  },
};

// 현재 호버카 설정을 저장할 변수
let currentHovercarConfig = HOVERCAR_CONFIG.large;

// 섹션 컨텐츠 데이터
const sections = [
  {
    title: "CYBER <br>PUNK",
    description:
      "미래지향적인 디자인으로 당신의 브랜드를 새로운 차원으로 끌어올립니다. 혁신적인 웹 경험을 통해 방문자들에게 강렬한 인상을 남겨보세요.",
    color: "#012a36", // 어두운 청록색
  },
  {
    title: "몰입형 <br>인터랙션",
    description:
      "3D 효과로 사용자 경험을 극대화합니다. 매끄러운 애니메이션과 트렌디한 디자인이 당신의 콘텐츠를 돋보이게 합니다.",
    color: "#1a0933", // 어두운 보라색
  },
  {
    title: "미래지향적 <br>디자인",
    description:
      "최신 웹 트렌드를 반영한 디자인으로 당신의 브랜드를 한 단계 업그레이드하세요.",
    color: "#2d0927", // 어두운 자주색
  },
  {
    title: "COMING SOON",
    description:
      "새로운 프로젝트가 준비 중입니다. 곧 멋진 컨텐츠로 찾아뵙겠습니다.",
    color: "#2a2b0f", // 어두운 올리브색
  },
];

// 초기화 함수
function init() {
  // 혹시 모를 전역 오류 처리
  window.addEventListener("error", function (e) {
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
  });

  try {
    // 로딩 매니저 설정
    setupLoadingManager();

    // 로딩 화면 설정
    setupLoader();

    // Three.js 렌더러 설정
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

    // 포스트 프로세싱 설정
    setupPostProcessing();

    // 조명 설정
    setupLights();

    // 배경 설정
    setupGrid();
    setupParticles();

    // 섹션 내용 생성
    createSections();

    // 호버카 모델 로드 (또는 대체 객체 생성)
    setTimeout(() => {
      loadHoverCar();
    }, 500);

    // 이벤트 리스너 설정
    setupEventListeners();

    // 애니메이션 시작
    animate();
  } catch (error) {
    console.error("초기화 오류:", error);
    // 심각한 오류 - 로딩 화면 강제 종료
    const loader = document.querySelector(".loader");
    loader.style.opacity = 0;
    setTimeout(() => {
      loader.style.display = "none";
      isLoaded = true;

      // 대체 객체 생성
      const geometry = new THREE.BoxGeometry(1, 0.5, 2);
      const material = new THREE.MeshPhongMaterial({
        color: 0x00f3ff,
        emissive: 0x00f3ff,
        emissiveIntensity: 0.5,
      });
      hovercar = new THREE.Mesh(geometry, material);
      hovercar.position.set(3, -1, -2);
      scene.add(hovercar);

      animateHovercar();
      animateSection(0);
    }, 1000);
  }
}

// 로딩 매니저 설정
function setupLoadingManager() {
  loadingManager = new THREE.LoadingManager();
  const progressBar = document.querySelector(".progress-bar-fill");

  // 로딩 시작
  loadingManager.onStart = function () {
    console.log("로딩 시작");
    progressBar.style.width = "5%";
  };

  // 프로그레스 처리 - 일관된 진행 표시
  loadingManager.onProgress = function (url, itemsLoaded, itemsTotal) {
    console.log(`로딩 진행 중: ${itemsLoaded}/${itemsTotal}`);

    // 모델 로딩은 전체 진행의 90%까지만 차지하도록 설정
    const progress = (itemsLoaded / itemsTotal) * 90;
    progressBar.style.width = `${progress}%`;
  };

  // 모든 아이템 로드 완료 시
  loadingManager.onLoad = function () {
    console.log("모든 리소스 로드 완료");

    // 로딩 완료 표시
    progressBar.style.width = "100%";

    // 로딩 화면 숨기기
    setTimeout(() => {
      const loader = document.querySelector(".loader");
      loader.style.opacity = 0;
      setTimeout(() => {
        loader.style.display = "none";
        isLoaded = true;

        // 시작 애니메이션
        gsap.from(".logo", {
          y: -50,
          opacity: 0,
          duration: 1,
          ease: "power3.out",
        });

        gsap.from("nav", {
          y: -50,
          opacity: 0,
          duration: 1,
          delay: 0.3,
          ease: "power3.out",
        });

        // 첫 번째 섹션 활성화
        animateSection(0);
      }, 1000);
    }, 200);
  };

  // 백업 타이머 - 10초 후에도 로딩이 완료되지 않으면 강제로 로딩 화면 종료
  setTimeout(() => {
    if (!isLoaded) {
      console.log("로딩 타임아웃 - 강제 완료");
      const loader = document.querySelector(".loader");
      progressBar.style.width = "100%";

      setTimeout(() => {
        loader.style.opacity = 0;
        setTimeout(() => {
          loader.style.display = "none";
          isLoaded = true;
          animateSection(0);
        }, 1000);
      }, 500);
    }
  }, 10000);
}

// 호버카 모델 로드
function loadHoverCar() {
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

      // 직접 로딩 진행바를 조작하지 않음 (loadingManager가 처리)
    };

    // 안전 타이머 - 5초 후에도 로드가 안 되면 대체 객체 생성
    const safetyTimer = setTimeout(() => {
      console.log("로드 타임아웃, 대체 객체로 전환");
      createFallbackHovercar();
    }, 5000);

    // 여러 가능한 경로 시도
    const possiblePaths = [
      "free_cyberpunk_hovercar/scene.gltf",
      "./free_cyberpunk_hovercar/scene.gltf",
      "../free_cyberpunk_hovercar/scene.gltf",
      "/free_cyberpunk_hovercar/scene.gltf",
      "scene.gltf",
    ];

    console.log("가능한 경로 시도 중:", possiblePaths);

    // 첫 번째 경로로 시도
    gltfLoader.load(
      possiblePaths[0],
      (gltf) => {
        clearTimeout(safetyTimer);
        console.log("호버카 모델 로드 성공");

        try {
          hovercar = gltf.scene;

          // 화면 크기에 맞는 설정 적용
          updateHovercarResponsiveSize();

          hovercar.rotation.y = Math.PI / 4;
          scene.add(hovercar);

          // 모델의 재질 개선
          gltf.scene.traverse((child) => {
            if (child.isMesh) {
              // 기존 재질 향상
              if (child.material) {
                // 기본 값 향상
                child.material.roughness = 0.3; // 낮은 값은 더 빛나게 보임
                child.material.metalness = 0.1; // 높은 값은 더 금속적으로 보임
                child.material.envMapIntensity = 1.5;

                // 발광 효과 조정 - 더 부드럽게
                child.material.emissive = new THREE.Color(0x00a0cc); // 더 부드러운 청록색
                child.material.emissiveIntensity = 0.08; // 더 약한 발광

                // 미리 설정된 색상 유지를 위한 처리
                if (
                  child.material.name.includes("light") ||
                  child.material.name.includes("glow") ||
                  child.material.name.includes("neon")
                ) {
                  child.material.emissiveIntensity = 1.5; // 네온/조명 부분은 더 강하게 발광
                }

                child.castShadow = true;
                child.receiveShadow = true;
                child.material.needsUpdate = true;
              }
            }
          });

          // 호버카 전용 조명 추가 - 더 강한 조명
          const hovercarLight = new THREE.PointLight(0x00f3ff, 1.5, 8);
          hovercarLight.position.set(0, 0, 0);
          hovercar.add(hovercarLight); // 호버카에 직접 조명 추가

          // 씬에 모델 추가
          scene.add(hovercar);

          // 모델에 애니메이션 추가
          if (gltf.animations && gltf.animations.length) {
            mixer = new THREE.AnimationMixer(hovercar);
            const action = mixer.clipAction(gltf.animations[0]);
            action.play();
          } else {
            // 애니메이션이 없을 경우
            animateHovercar();
          }

          // 직접 로딩 진행바를 조작하지 않음 (loadingManager가 처리)
        } catch (innerError) {
          console.error("모델 처리 중 오류:", innerError);
          createFallbackHovercar();
        }
      },
      // 로드 진행 상황은 loadingManager.onProgress에서 처리
      undefined,
      (error) => {
        console.error("호버카 모델 로드 오류 (첫 번째 경로):", error);

        // 두 번째 경로 시도
        console.log("두 번째 경로 시도:", possiblePaths[1]);
        gltfLoader.load(
          possiblePaths[1],
          (gltf) => {
            // 성공 콜백은 위와 동일
            clearTimeout(safetyTimer);
            console.log("두 번째 경로로 로드 성공");

            try {
              hovercar = gltf.scene;
              hovercar.scale.set(1.2, 1.2, 1.2);
              hovercar.position.set(
                FIXED_HOVERCAR_POSITION.x,
                FIXED_HOVERCAR_POSITION.y,
                FIXED_HOVERCAR_POSITION.z
              );
              hovercar.rotation.y = Math.PI / 4;
              scene.add(hovercar);

              if (gltf.animations && gltf.animations.length) {
                mixer = new THREE.AnimationMixer(hovercar);
                const action = mixer.clipAction(gltf.animations[0]);
                action.play();
              } else {
                animateHovercar();
              }

              // 모델의 재질 향상
              gltf.scene.traverse((child) => {
                if (child.isMesh) {
                  // 재질이 있는 메시에 대해 설정 개선
                  if (child.material) {
                    child.material.envMapIntensity = 1.5;
                    child.material.needsUpdate = true;
                  }
                }
              });

              progressBar.style.width = "100%";
            } catch (innerError) {
              console.error("두 번째 경로 모델 처리 중 오류:", innerError);
              createFallbackHovercar();
            }
          },
          null,
          (secondError) => {
            console.error("두 번째 경로도 실패. 대체 객체 사용:", secondError);
            clearTimeout(safetyTimer);
            createFallbackHovercar();
          }
        );
      }
    );
  } catch (mainError) {
    console.error("모델 로더 초기화 오류:", mainError);
    // 심각한 오류 - 로딩 화면 강제 종료
    const loader = document.querySelector(".loader");
    loader.style.opacity = 0;
    setTimeout(() => {
      loader.style.display = "none";
      isLoaded = true;

      // 대체 객체 생성
      const geometry = new THREE.BoxGeometry(1, 0.5, 2);
      const material = new THREE.MeshPhongMaterial({
        color: 0x00f3ff,
        emissive: 0x00f3ff,
        emissiveIntensity: 0.5,
      });
      hovercar = new THREE.Mesh(geometry, material);
      hovercar.position.set(3, -1, -2);
      scene.add(hovercar);

      animateHovercar();
      animateSection(0);
    }, 1000);
  }
}

// 호버카 애니메이션
function animateHovercar() {
  // 호버 효과 애니메이션 (상하로 떠다니는 효과)
  gsap.to(hovercar.position, {
    y: hovercar.position.y + 0.5, // 더 넓은 범위로 움직임
    duration: 2,
    yoyo: true,
    repeat: -1,
    ease: "power1.inOut",
  });

  // 약간의 회전 애니메이션
  gsap.to(hovercar.rotation, {
    z: 0.05,
    duration: 3,
    yoyo: true,
    repeat: -1,
    ease: "power1.inOut",
  });
}

// 로딩 화면 설정
function setupLoader() {
  const loader = document.querySelector(".loader");
  const progressBar = document.querySelector(".progress-bar-fill");
  progressBar.style.width = "0%";

  // 로딩 텍스트 애니메이션
  const loadingText = document.querySelector(".loader-text");
  const originalText = loadingText.textContent;

  let dots = 0;
  const loadingInterval = setInterval(() => {
    if (isLoaded) {
      clearInterval(loadingInterval);
      return;
    }
  }, 500);
}

// 포스트 프로세싱 설정
function setupPostProcessing() {
  try {
    // 쉐이더가 로드되었는지 확인
    if (
      THREE.CopyShader &&
      THREE.LuminosityHighPassShader &&
      THREE.FXAAShader
    ) {
      composer = new THREE.EffectComposer(renderer);
      const renderPass = new THREE.RenderPass(scene, camera);
      composer.addPass(renderPass);

      // 블룸 패스 (네온 효과) - 값 조정
      const bloomPass = new THREE.UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        0.8, // strength 증가
        0.3, // radius 감소
        0.7 // threshold 감소 (더 많은 부분이 빛남)
      );
      composer.addPass(bloomPass);

      // FXAA 안티얼리싱 패스 추가
      const fxaaPass = new THREE.ShaderPass(THREE.FXAAShader);
      const pixelRatio = renderer.getPixelRatio();
      fxaaPass.material.uniforms["resolution"].value.x =
        1 / (window.innerWidth * pixelRatio);
      fxaaPass.material.uniforms["resolution"].value.y =
        1 / (window.innerHeight * pixelRatio);
      fxaaPass.renderToScreen = true;
      composer.addPass(fxaaPass);

      console.log("포스트 프로세싱 설정 완료 (안티얼리싱 포함)");
    } else {
      // 쉐이더가 없으면 기본 렌더러만 사용
      console.warn(
        "필요한 쉐이더가 로드되지 않았습니다. 기본 렌더러를 사용합니다."
      );
      composer = {
        render: function () {
          renderer.render(scene, camera);
        },
      };
    }
  } catch (error) {
    console.error("포스트 프로세싱 설정 오류:", error);
    // 오류 발생 시 기본 렌더러로 폴백
    composer = {
      render: function () {
        renderer.render(scene, camera);
      },
    };
  }
}

// 조명 설정
function setupLights() {
  // 기존 조명
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(1, 1, 1);
  scene.add(directionalLight);

  // 호버카를 위한 추가 조명
  const hovercarSpotlight = new THREE.SpotLight(
    0x00f3ff,
    1.5,
    20,
    Math.PI / 4,
    0.3,
    1
  );
  hovercarSpotlight.position.set(5, 5, 5);
  scene.add(hovercarSpotlight);

  // 호버카 주변을 비추는 포인트 라이트 (네온 효과)
  const hovercarPointLight = new THREE.PointLight(0x00f3ff, 1, 10);
  hovercarPointLight.position.set(3, 0, -2);
  scene.add(hovercarPointLight);

  // 부드러운 전체 조명 추가
  const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.8);
  scene.add(hemisphereLight);

  // 조명 헬퍼 (디버깅용, 필요시 주석 해제)
  // const spotLightHelper = new THREE.SpotLightHelper(hovercarSpotlight);
  // scene.add(spotLightHelper);
}

// 그리드 배경 설정
function setupGrid() {
  const gridSize = 20;
  const gridDivisions = 20;
  const gridMaterial = new THREE.LineBasicMaterial({
    color: 0x00f3ff,
    transparent: true,
    opacity: 0.15,
  });

  grid = new THREE.Group();

  // 수직 그리드
  for (
    let i = -gridSize / 2;
    i <= gridSize / 2;
    i += gridSize / gridDivisions
  ) {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(
        [i, -gridSize / 2, 0, i, gridSize / 2, 0],
        3
      )
    );
    const line = new THREE.Line(geometry, gridMaterial);
    grid.add(line);
  }

  // 수평 그리드
  for (
    let i = -gridSize / 2;
    i <= gridSize / 2;
    i += gridSize / gridDivisions
  ) {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(
        [-gridSize / 2, i, 0, gridSize / 2, i, 0],
        3
      )
    );
    const line = new THREE.Line(geometry, gridMaterial);
    grid.add(line);
  }

  grid.position.z = -10;
  scene.add(grid);
}

// 파티클 설정
function setupParticles() {
  const particleCount = 200;
  const particleGeometry = new THREE.BufferGeometry();
  const particleMaterial = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.05,
    transparent: true,
    opacity: 0.7,
  });

  const particlePositions = new Float32Array(particleCount * 3);
  const particleVelocities = [];

  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3;
    particlePositions[i3] = (Math.random() - 0.5) * 20;
    particlePositions[i3 + 1] = (Math.random() - 0.5) * 20;
    particlePositions[i3 + 2] = (Math.random() - 0.5) * 20;

    particleVelocities.push({
      x: (Math.random() - 0.5) * 0.01,
      y: (Math.random() - 0.5) * 0.01,
      z: (Math.random() - 0.5) * 0.01,
    });
  }

  particleGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(particlePositions, 3)
  );

  const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
  scene.add(particleSystem);

  particles = {
    system: particleSystem,
    geometry: particleGeometry,
    velocities: particleVelocities,
    positions: particlePositions,
  };
}

// 섹션 내용 생성
function createSections() {
  const container = document.querySelector(".sections-container");
  container.innerHTML = "";

  // 섹션 생성
  sections.forEach((section, index) => {
    const sectionElement = document.createElement("div");
    sectionElement.className = "section";
    sectionElement.id = `section${index + 1}`;

    // Coming Soon 스타일 추가 (마지막 섹션에만)
    let extraContent = "";
    if (index === sections.length - 1) {
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
          index === sections.length - 1 ? "coming-soon-title" : ""
        }">${section.title}</h2>
        <p class="section-description">${section.description}</p>
        ${extraContent}
      </div>
    `;

    // 수직 섹션은 기본적으로 보이도록 설정
    sectionElement.style.display = "block";

    // 위치 설정
    sectionElement.style.position = "absolute";
    sectionElement.style.width = "100%";
    sectionElement.style.height = "100vh";
    sectionElement.style.top = `${index * 100}vh`;
    sectionElement.style.left = "0";

    container.appendChild(sectionElement);
  });

  // 초기 섹션 활성화
  const firstSection = document.getElementById("section1");
  if (firstSection) {
    firstSection.classList.add("active");
  }
}

// 섹션 애니메이션 함수
function animateSection(index) {
  const section = document.getElementById(`section${index + 1}`);
  if (!section) return;

  // 모든 수직 섹션을 먼저 표시 상태로 변경
  document.querySelectorAll(".section").forEach((s) => {
    s.style.display = "block"; // 디스플레이 속성 복원
    s.classList.remove("active");
    s.style.zIndex = "1";
  });

  // 현재 섹션 표시
  section.classList.add("active");
  section.style.zIndex = "2";

  // 컨테이너 위치 조정
  gsap.to(".sections-container", {
    y: -index * window.innerHeight,
    duration: 1,
    ease: "power2.inOut",
    onStart: function () {
      isSmoothScrolling = true;
    },
    onComplete: function () {
      isSmoothScrolling = false;
      targetScrollY = index * window.innerHeight;
    },
  });

  // 배경 색상 변경 - 더 길고 부드러운 전환
  gsap.to(scene.background || {}, {
    r: parseInt(sections[index].color.slice(1, 3), 16) / 255,
    g: parseInt(sections[index].color.slice(3, 5), 16) / 255,
    b: parseInt(sections[index].color.slice(5, 7), 16) / 255,
    duration: 1.5, // 1초에서 1.5초로 변경
    ease: "power2.inOut", // 더 부드러운 이징 함수
    onUpdate: function () {
      if (!scene.background) {
        scene.background = new THREE.Color();
      }
      scene.background.setRGB(
        this.targets()[0].r,
        this.targets()[0].g,
        this.targets()[0].b
      );
    },
  });

  // 호버카 애니메이션 - 위치를 항상 고정
  if (hovercar) {
    // 위치를 항상 고정 값으로 설정 (모든 섹션에서 동일)
    gsap.to(hovercar.position, {
      x: FIXED_HOVERCAR_POSITION.x,
      y: FIXED_HOVERCAR_POSITION.y,
      z: FIXED_HOVERCAR_POSITION.z,
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

  // 스크롤 인디케이터 업데이트
  updateScrollIndicator();
}

// 스크롤 인디케이터 업데이트 함수
function updateScrollIndicator() {
  const indicator = document.querySelector(".scroll-indicator");

  // 항상 아래쪽 방향 표시
  indicator.innerHTML = `<span>스크롤</span><div class="arrow">↓</div>`;

  // 마지막 섹션에서는 인디케이터 숨김
  indicator.style.display =
    currentSection < sections.length - 1 ? "flex" : "none";
}

// 이벤트 리스너 설정 함수
function setupEventListeners() {
  window.addEventListener("resize", onWindowResize);

  // 마우스 휠 이벤트
  let lastScrollTime = 0;

  window.addEventListener(
    "wheel",
    function (e) {
      if (!isLoaded || isSmoothScrolling) return;
      e.preventDefault();

      const currentTime = Date.now();
      if (currentTime - lastScrollTime < 500) return;

      const scrollDirection = e.deltaY > 0 ? 1 : -1;

      // 수직 스크롤 모드만 처리
      const newSection = Math.max(
        0,
        Math.min(sections.length - 1, currentSection + scrollDirection)
      );

      // 섹션이 변경된 경우에만 애니메이션 실행
      if (newSection !== currentSection) {
        lastScrollTime = currentTime;
        currentSection = newSection;

        console.log(`수직 스크롤: 섹션 ${currentSection + 1}로 이동`);
        animateSection(currentSection);
      }
    },
    { passive: false }
  );

  // 네비게이션 링크 클릭 이벤트
  document.querySelectorAll("nav a").forEach((link, index) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      currentSection = index;
      updateScrollIndicator();
      animateSection(index);
    });
  });

  // 터치 이벤트 설정 (모바일 지원)
  setupTouchEvents();

  // 초기 스크롤 인디케이터 설정
  updateScrollIndicator();
}

// 터치 이벤트 처리 함수
function setupTouchEvents() {
  let touchStartY = 0;
  let touchEndY = 0;
  let lastTouchTime = 0;

  // 터치 시작
  window.addEventListener(
    "touchstart",
    function (e) {
      touchStartY = e.changedTouches[0].screenY;
    },
    { passive: true }
  );

  // 터치 종료
  window.addEventListener(
    "touchend",
    function (e) {
      if (!isLoaded || isSmoothScrolling) return;

      const currentTime = Date.now();
      if (currentTime - lastTouchTime < 500) return;

      touchEndY = e.changedTouches[0].screenY;
      const diffY = touchEndY - touchStartY;

      // 충분한 스와이프 거리가 있을 때만 처리
      if (Math.abs(diffY) > 50) {
        const scrollDirection = diffY < 0 ? 1 : -1;

        // 수직 스크롤 처리 (수평 모드 처리 제거)
        const newSection = Math.max(
          0,
          Math.min(sections.length - 1, currentSection + scrollDirection)
        );

        if (newSection !== currentSection) {
          lastTouchTime = currentTime;
          currentSection = newSection;
          animateSection(currentSection);
        }
      }
    },
    { passive: true }
  );
}

// 윈도우 크기 변경 이벤트 처리
function onWindowResize() {
  const width = window.innerWidth;
  const height = window.innerHeight;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();

  renderer.setSize(width, height);

  // 안티얼리싱 해상도 업데이트
  if (composer.passes) {
    const pixelRatio = renderer.getPixelRatio();
    for (let i = 0; i < composer.passes.length; i++) {
      const pass = composer.passes[i];
      if (
        pass.material &&
        pass.material.uniforms &&
        pass.material.uniforms.resolution
      ) {
        pass.material.uniforms.resolution.value.x = 1 / (width * pixelRatio);
        pass.material.uniforms.resolution.value.y = 1 / (height * pixelRatio);
      }
    }
  }

  composer.setSize(width, height);

  // 호버카 반응형 크기 및 위치 업데이트 추가
  updateHovercarResponsiveSize();

  // 섹션 크기도 업데이트
  document.querySelectorAll(".section").forEach((section, index) => {
    section.style.height = `${window.innerHeight}px`;
    section.style.top = `${index * window.innerHeight}px`;
  });

  // 현재 섹션 위치 업데이트
  targetScrollY = currentSection * window.innerHeight;
}

// 애니메이션 루프
function animate(time) {
  requestAnimationFrame(animate);

  if (!lastTime) lastTime = time;
  const delta = time - lastTime;
  lastTime = time;

  // 호버카 애니메이션 업데이트
  if (mixer) {
    mixer.update(delta / 1000);
  }

  // 호버카 호버링 애니메이션 - 화면 크기에 따라 다른 움직임
  if (hovercar) {
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
  }

  // 스크롤 업데이트 - 수평 스크롤 제거
  scrollY += (targetScrollY - scrollY) * 0.1;

  // 그리드 애니메이션
  if (grid) {
    grid.rotation.x = Math.sin(time * 0.0003) * 0.1;
    grid.rotation.y = Math.cos(time * 0.0002) * 0.1;
  }

  // 파티클 애니메이션
  if (particles.system) {
    const positions = particles.positions;
    const velocities = particles.velocities;

    for (let i = 0; i < positions.length / 3; i++) {
      const i3 = i * 3;

      // 위치 업데이트
      positions[i3] += velocities[i].x * delta * 0.01;
      positions[i3 + 1] += velocities[i].y * delta * 0.01;
      positions[i3 + 2] += velocities[i].z * delta * 0.01;

      // 경계 확인
      if (Math.abs(positions[i3]) > 10) velocities[i].x *= -1;
      if (Math.abs(positions[i3 + 1]) > 10) velocities[i].y *= -1;
      if (Math.abs(positions[i3 + 2]) > 10) velocities[i].z *= -1;
    }

    particles.geometry.attributes.position.needsUpdate = true;

    // 파티클 회전
    particles.system.rotation.y += 0.0001 * delta;
  }

  // 렌더링
  try {
    if (composer) {
      composer.render();
    } else {
      renderer.render(scene, camera);
    }
  } catch (error) {
    console.error("렌더링 오류:", error);
    renderer.render(scene, camera);
  }
}

// 화면 크기에 따른 호버카 크기 및 위치 업데이트 함수 수정
function updateHovercarResponsiveSize() {
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

// 섹션 컨텐츠 레이아웃 조정 함수 추가
function updateSectionContentLayout(isSmallScreen) {
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

// 페이지 로드 시 초기화 실행
window.addEventListener("load", init);
