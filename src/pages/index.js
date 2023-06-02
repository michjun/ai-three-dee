import Head from "next/head";
import Dashboard from "@/components/Dashboard";
import { useRef, useEffect, useState } from "react";

export default function Home() {
  const container = useRef();
  const bgStyle = { backgroundImage: `url('/magic3.png')` };
  const [canvasSize, setCanvasSize] = useState();

  useEffect(() => {
    const handleResize = () => {
      container.current.style.height = `${window.innerHeight}px`;
      const canvasSize = Math.min(
        800,
        window.innerWidth - 8,
        window.innerHeight - 128
      );
      setCanvasSize(canvasSize);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div ref={container} style={bgStyle}>
      <Head>
        <title>Text to 3D with Primitive Shapes</title>
        <link rel="icon" href="/genie2.png" />
      </Head>
      <Dashboard canvasSize={canvasSize} />
    </div>
  );
}
