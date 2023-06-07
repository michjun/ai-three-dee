import { connectToDb } from "@/lib/mongoose";
import Creation from "@/db/Creation";

export async function getServerSideProps(context) {
  await connectToDb();
  const creation = await Creation.findOne();

  return {
    redirect: {
      destination: `/gallery/${creation._id}`,
      permanent: false,
    },
  };
}

export default async function Home() {
  return null;
}
