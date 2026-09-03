import { useEffect, useState } from "react";

const ReadingGuide = () => {
  const [y, setY] = useState(-100);

  useEffect(() => {
    const onMove = (e: MouseEvent) => setY(e.clientY);
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <div
      role="presentation"
      aria-hidden="true"
      className="pointer-events-none fixed left-0 right-0 z-[9000]"
      style={{
        top: y - 18,
        height: 36,
        background: "rgba(255, 255, 80, 0.10)",
        borderTop: "2px solid rgba(255, 220, 0, 0.45)",
        borderBottom: "2px solid rgba(255, 220, 0, 0.45)",
        transition: "top 30ms linear",
      }}
    />
  );
};

export default ReadingGuide;
