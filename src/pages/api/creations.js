import { connectToDb } from "@/lib/mongoose";
import Creation from "src/db/Creation";

export default async function (req, res) {
  await connectToDb();
  if (req.method === "GET") {
    try {
      const creations = await Creation.find({});
      res.status(200).json({ success: true, data: creations });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        success: false,
        error: "Error fetching creations from MongoDB",
      });
    }
  } else if (req.method === "POST") {
    try {
      const creation = await Creation.create(req.body);
      res.status(200).json({ success: true, data: creation });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        success: false,
        error: "Error creating creation in MongoDB",
      });
    }
  } else {
    res
      .status(405)
      .json({ success: false, error: "Request Method not allowed" });
  }
}
