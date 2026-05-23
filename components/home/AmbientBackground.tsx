export function AmbientBackground() {
  return (
    <div className="ambient pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
      <div className="ambient-dots absolute inset-0" />
      <svg
        className="ambient-graph absolute inset-0 size-full"
        viewBox="0 0 1600 1000"
        preserveAspectRatio="xMidYMid slice"
      >
        <path className="path l1" pathLength="100" d="M180 60  L 180 940" />
        <path className="path l2" pathLength="100" d="M380 120 L 380 880" />
        <path className="path l3" pathLength="100" d="M620 80  L 620 920" />
        <path className="path l4" pathLength="100" d="M860 140 L 860 860" />
        <path className="path l5" pathLength="100" d="M1080 100 L 1080 900" />
        <path className="path l6" pathLength="100" d="M1300 80 L 1300 940" />
        <path className="path l7" pathLength="100" d="M1480 140 L 1480 880" />
        <path className="path a2" pathLength="100" d="M180 320 C 180 260, 320 260, 380 320" />
        <path className="path a3" pathLength="100" d="M380 540 C 380 600, 540 600, 620 540" />
        <path className="path a4" pathLength="100" d="M620 720 C 620 660, 800 660, 860 720" />
        <path className="path a5" pathLength="100" d="M860 380 C 860 440, 1020 440, 1080 380" />
        <path className="path a6" pathLength="100" d="M1080 620 C 1080 560, 1240 560, 1300 620" />
        <path className="path a7" pathLength="100" d="M1300 240 C 1300 180, 1420 180, 1480 240" />
        <circle className="node n1" cx="180" cy="200" r="3.5" />
        <circle className="node n1" cx="180" cy="520" r="3.5" />
        <circle className="node-accent n1" cx="180" cy="760" r="3.5" />
        <circle className="node n2" cx="380" cy="220" r="3.5" />
        <circle className="node n2" cx="380" cy="440" r="3.5" />
        <circle className="node n2" cx="380" cy="720" r="3.5" />
        <circle className="node n3" cx="620" cy="180" r="3.5" />
        <circle className="node-accent n3" cx="620" cy="420" r="3.5" />
        <circle className="node n3" cx="620" cy="780" r="3.5" />
        <circle className="node n4" cx="860" cy="260" r="3.5" />
        <circle className="node n4" cx="860" cy="500" r="3.5" />
        <circle className="node n4" cx="860" cy="760" r="3.5" />
        <circle className="node n5" cx="1080" cy="220" r="3.5" />
        <circle className="node-accent n5" cx="1080" cy="500" r="3.5" />
        <circle className="node n5" cx="1080" cy="800" r="3.5" />
        <circle className="node n6" cx="1300" cy="180" r="3.5" />
        <circle className="node n6" cx="1300" cy="460" r="3.5" />
        <circle className="node n6" cx="1300" cy="780" r="3.5" />
        <circle className="node n7" cx="1480" cy="240" r="3.5" />
        <circle className="node n7" cx="1480" cy="540" r="3.5" />
        <circle className="node-accent n7" cx="1480" cy="800" r="3.5" />
      </svg>
      <div className="ambient-sweep absolute top-[-10%] bottom-[-10%]" />
    </div>
  )
}
