// 전역 설정 및 상수
export const HOVERCAR_CONFIG = {
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

// 섹션 컨텐츠 데이터
export const SECTIONS = [
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
