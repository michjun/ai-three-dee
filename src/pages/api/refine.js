import { connectToDb } from "@/lib/mongoose";
import ChatThread from "@/db/ChatThread";
import { getOpenAI } from "@/lib/openai";
import { maxRefineCount } from "@/lib/constants";

export default async function (req, res) {
  const { threadId, refineInstructions } = req.body;
  if (!threadId || !refineInstructions) {
    res.status(400).json({
      error: {
        message: "Invalid Data.",
      },
    });
    return;
  }
  await connectToDb();
  const chatThread = await ChatThread.findById(threadId);
  if (!chatThread) {
    res.status(404).json({
      error: {
        message: "Data not found.",
      },
    });
    return;
  }
  if (chatThread.refineCount > maxRefineCount) {
    res.status(400).json({
      error: {
        message: "Too many refinements.",
      },
    });
    return;
  }
  chatThread.messages.push({ role: "user", content: refineInstructions });
  const messages = chatThread.messages.map(({ role, content }) => ({
    role,
    content,
  }));
  try {
    const { openAI } = getOpenAI();
    const completion = await openAI.createChatCompletion({
      model: "gpt-4",
      messages: messages,
    });
    const result = completion.data.choices[0].message;
    chatThread.messages.push(result);
    chatThread.refineCount += 1;
    chatThread.save();
    res.status(200).json({
      result: result,
      threadId: chatThread._id,
      refinesLeft: maxRefineCount - chatThread.refineCount,
    });
  } catch (error) {
    // Consider adjusting the error handling logic for your use case
    if (error.response) {
      console.error(error.response.status, error.response.data);
      res.status(error.response.status).json(error.response.data);
    } else {
      console.error(`Error with OpenAI API request: ${error.message}`);
      res.status(500).json({
        error: {
          message: "An error occurred during your request.",
        },
      });
    }
  }
}
