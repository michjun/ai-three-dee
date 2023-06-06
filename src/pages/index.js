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
      const width = Math.min(800, window.innerWidth - 8);
      const height = window.innerHeight - 128;
      setCanvasSize({ width, height });
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
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
        ></meta>
      </Head>
      <Dashboard canvasSize={canvasSize} />
    </div>
  );
}
