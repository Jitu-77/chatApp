import { getUserConversations } from "../services/conversationService.js";
export const getConversations = async (req, res) => {
  try {
    const userId = req.user.id;

    const conversations = await getUserConversations(userId);

    const result = conversations.map((conv) => {
      // 👇 find other user
      let otherUser = conv.users.find(
        (u) => u.id !== userId
      );

      // 👇 self chat case
      if (!otherUser) {
        otherUser = conv.users.find(
          (u) => u.id === userId
        );
      }

      return {
        conversationId: conv.id,

        name:
          conv.users.length === 1
            ? "You"
            : otherUser?.firstName,

        profilePic: otherUser?.profilePic,

        lastMessage: conv.messages[0]?.content || "",

        lastMessageTime:
          conv.messages[0]?.createdAt || null,

        isSelfChat: conv.users.length === 1,
      };
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};