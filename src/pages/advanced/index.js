import Head from "next/head";
import AdvancedDashboard from "@/components/AdvancedDashboard";

export default function Home() {
  return (
    <div>
      <Head>
        <title>Text to 3D with Primitive Shapes</title>
        <link rel="icon" href="/genie2.png" />
      </Head>
      <AdvancedDashboard />
    </div>
  );
}
