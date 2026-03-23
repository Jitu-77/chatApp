import { getUserConversations } from "../services/conversationService.js";

export const getConversations = async (req, res) => {
  try {
    const userId = req.user.id;

    // 🔥 use service
    const conversations = await getUserConversations(userId);

    const result = conversations.map((conv) => {
      let otherUser = conv.users.find(
        (u) => u.id !== userId
      );

      // self chat
      if (!otherUser) {
        otherUser = conv.users[0];
      }

      return {
        conversationId: conv.id,

        name:
          conv.users.length === 1
            ? "You"
            : otherUser.firstName,

        profilePic: otherUser.profilePic,

        lastMessage: conv.messages[0]?.content || "",

        lastMessageTime:
          conv.messages[0]?.createdAt || null,
      };
    });

    // 🔥 SORT (VERY IMPORTANT)
    result.sort((a, b) => {
      return new Date(b.lastMessageTime) - new Date(a.lastMessageTime);
    });

    res.status(200).json({
      success: true,
      data: result,
    });

  } catch (err) {
    console.error("Dashboard error:", err);

    res.status(500).json({
      success: false,
      message: "Failed to fetch conversations",
    });
  }
};