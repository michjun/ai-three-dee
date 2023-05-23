import Head from "next/head";
import Gallery from "@/components/Gallery";
import { useRef, useEffect, useState } from "react";

export default function Home() {
  const container = useRef();
  const bgStyle = { backgroundImage: `url('/magic3.png')` };
  const [canvasSize, setCavasSize] = useState();

  useEffect(() => {
    const handleResize = () => {
      container.current.style.height = `${window.innerHeight}px`;
      const canvasSize = Math.min(
        800,
        window.innerWidth - 8,
        window.innerHeight - 128
      );
      setCavasSize(canvasSize);
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
      <Gallery canvasSize={canvasSize} />
    </div>
  );
}
