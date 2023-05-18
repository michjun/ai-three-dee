import Head from "next/head";
import Gallery from "@/components/Gallery";

export default function Home() {
  const bgStyle = { backgroundImage: `url('/magic3.png')` };
  return (
    <div style={bgStyle}>
      <Head>
        <title>Text to 3D with Primitive Shapes</title>
        <link rel="icon" href="/genie2.png" />
      </Head>
      <Gallery />
    </div>
  );
}
