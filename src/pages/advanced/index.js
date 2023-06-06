import Head from "next/head";
import AdvancedDashboard from "@/components/AdvancedDashboard";

export default function Home() {
  return (
    <div>
      <Head>
        <title>Text to 3D with Primitive Shapes</title>
        <link rel="icon" href="/genie2.png" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
        ></meta>
      </Head>
      <AdvancedDashboard />
    </div>
  );
}
