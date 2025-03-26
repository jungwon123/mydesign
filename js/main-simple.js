// 간소화된 메인 파일
document.addEventListener("DOMContentLoaded", () => {
  console.log("문서 로드됨");

  // 기본 THREE.js 설정
  const renderer = new THREE.WebGLRenderer({
    canvas: document.getElementById("bg-canvas"),
    antialias: true,
  });
  renderer.setSize(window.innerWidth, window.innerHeight);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x030518);

  const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.z = 5;

  // 간단한 큐브 추가
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshBasicMaterial({ color: 0x00f3ff });
  const cube = new THREE.Mesh(geometry, material);
  scene.add(cube);

  // 기본 조명
  const light = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(light);

  // 로딩 화면 숨기기
  setTimeout(() => {
    const loader = document.querySelector(".loader");
    loader.style.opacity = 0;
    setTimeout(() => {
      loader.style.display = "none";
    }, 500);
  }, 1000);

  // 애니메이션 루프
  function animate() {
    requestAnimationFrame(animate);
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
    renderer.render(scene, camera);
  }

  animate();
});
