import Head from "next/head";
import Dashboard from "@/components/Dashboard";

export default function Home() {
  return (
    <div>
      <Head>
        <title>Text to 3D with Primitive Shapes</title>
        <link rel="icon" href="/logo.png" />
      </Head>
      <Dashboard />
    </div>
  );
}
