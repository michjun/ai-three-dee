import { connectToDb } from "@/lib/mongoose";
import Creation from "@/db/Creation";
import { getEmbedding } from "@/utils/embedding";

export default async function (req, res) {
  if (req.method === "POST") {
    await connectToDb();
    try {
      const creations = await Creation.find({ _id: { $in: req.body.ids } });
      creations.forEach(async (creation) => {
        creation.embedding = await getEmbedding(creation.title);
        creation.useAsExample = true;
        creation.save();
      });
      res.status(200).json({ success: true });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        success: false,
        error: "Error fetching creations from MongoDB",
      });
    }
  } else {
    res
      .status(405)
      .json({ success: false, error: "Request Method not allowed" });
  }
}
