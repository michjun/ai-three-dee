import { connectToDb } from "@/lib/mongoose";
import Creation from "@/db/Creation";

export default async function (req, res) {
  await connectToDb();
  if (req.method === "GET") {
    const { id } = req.query;
    try {
      const creation = await Creation.findById(id).select("-embedding");
      const prevCreation = await Creation.find({ _id: { $lt: id } })
        .sort({ _id: -1 })
        .limit(1)
        .select("_id");
      const nextCreation = await Creation.find({ _id: { $gt: id } })
        .sort({ _id: 1 })
        .limit(1)
        .select("_id");

      res.status(200).json({
        success: true,
        data: {
          creation: creation,
          prevId: prevCreation[0]?._id,
          nextId: nextCreation[0]?._id,
        },
      });
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
