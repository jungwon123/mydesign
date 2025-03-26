// 그리드, 파티클, 후처리 효과
import { scene } from "./scene.js";

export let grid;
export let particles = {};

// 그리드 설정
export function setupGrid() {
  // 그리드 헬퍼 설정
  const size = 20;
  const divisions = 20;
  const gridHelper = new THREE.GridHelper(size, divisions, 0x00f3ff, 0x000a12);
  gridHelper.position.y = -4;

  // 그리드 재질 조정
  if (gridHelper.material instanceof Array) {
    for (let i = 0; i < gridHelper.material.length; i++) {
      gridHelper.material[i].opacity = 0.4;
      gridHelper.material[i].transparent = true;
    }
  } else if (gridHelper.material) {
    gridHelper.material.opacity = 0.4;
    gridHelper.material.transparent = true;
  }

  scene.add(gridHelper);

  // 그리드 선 추가
  const material = new THREE.LineBasicMaterial({
    color: 0x00f3ff,
    transparent: true,
    opacity: 0.2,
  });

  const plane = new THREE.PlaneGeometry(20, 20, 20, 20);
  const wireframe = new THREE.WireframeGeometry(plane);
  const gridLines = new THREE.LineSegments(wireframe, material);

  gridLines.rotation.x = Math.PI / 2;
  gridLines.position.y = -3.9;
  scene.add(gridLines);

  // 그리드 참조 저장
  grid = gridLines;
}

// 파티클 설정
export function setupParticles() {
  // 파티클 수 설정 - 성능에 따라 조정
  const count = 500; // 기본 파티클 수

  // 모바일 기기에서는 파티클 수 감소
  if (window.innerWidth < 768) {
    count = 200;
  }

  // 파티클 위치와 속도 생성
  particles.positions = new Float32Array(count * 3);
  particles.velocities = [];

  for (let i = 0; i < count; i++) {
    // 랜덤 위치 설정
    const i3 = i * 3;
    particles.positions[i3] = (Math.random() - 0.5) * 20;
    particles.positions[i3 + 1] = (Math.random() - 0.5) * 20;
    particles.positions[i3 + 2] = (Math.random() - 0.5) * 20;

    // 랜덤 속도 설정
    particles.velocities.push({
      x: (Math.random() - 0.5) * 0.02,
      y: (Math.random() - 0.5) * 0.02,
      z: (Math.random() - 0.5) * 0.02,
    });
  }

  // 파티클 지오메트리 생성
  particles.geometry = new THREE.BufferGeometry();
  particles.geometry.setAttribute(
    "position",
    new THREE.BufferAttribute(particles.positions, 3)
  );

  // 파티클 텍스처 생성
  const textureLoader = new THREE.TextureLoader();
  const particleTexture = textureLoader.load(
    "./particle.png",
    () => {
      // 텍스처 로드 성공
    },
    undefined,
    () => {
      // 실패 시 기본 원형 텍스처 생성
      const canvas = document.createElement("canvas");
      canvas.width = 64;
      canvas.height = 64;
      const context = canvas.getContext("2d");

      // 원형 그라디언트 그리기
      const gradient = context.createRadialGradient(32, 32, 0, 32, 32, 32);
      gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
      gradient.addColorStop(1, "rgba(255, 255, 255, 0)");

      context.fillStyle = gradient;
      context.fillRect(0, 0, 64, 64);

      // 캔버스를 텍스처로 변환
      const texture = new THREE.CanvasTexture(canvas);
      return texture;
    }
  );

  // 파티클 재질 설정
  const particleMaterial = new THREE.PointsMaterial({
    size: 0.15,
    map: particleTexture,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    vertexColors: false,
    opacity: 0.7,
  });

  // 파티클 색상 설정
  particleMaterial.color.set(0x00f3ff);

  // 파티클 시스템 생성 및 추가
  particles.system = new THREE.Points(particles.geometry, particleMaterial);
  scene.add(particles.system);
}

// 그리드 애니메이션 업데이트
export function updateGridAnimation(time) {
  if (grid) {
    grid.rotation.x = Math.sin(time * 0.0003) * 0.1;
    grid.rotation.y = Math.cos(time * 0.0002) * 0.1;
  }
}

// 파티클 애니메이션 업데이트
export function updateParticlesAnimation(time, delta) {
  if (!particles.system) return;

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
