import { getUserConversations ,createOrGetConversation,deleteConversationById} from "../services/conversationService.js";
import { createGroupConversation } from "../services/conversationService.js";
import { updateGroupConversation } from "../services/conversationService.js";
import { leaveGroupService } from "../services/conversationService.js";
export const getConversations = async (req, res) => {
  try {
    const userId = req.user.id;

    // 🔥 use service
    const conversations = await getUserConversations(userId);

    const result = conversations.map((conv) => {
      let otherUser = conv.users.find((u) => u.id !== userId);

      // self chat
      if (!otherUser) {
        otherUser = conv.users[0];
      }

      return {
        conversationId: conv.id,

        name: conv?.isGroup ? conv.name : conv.users.length === 1 ? "You" : otherUser.firstName,

        profilePic: conv?.isGroup ? conv.profilePic : otherUser.profilePic,

        lastMessage: conv.messages[0]?.content || "",

        lastMessageTime: conv.messages[0]?.createdAt || null,
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

export const createConversation = async (req, res) => {
  try {
    const userId = req.user.id;
    const { otherUserId } = req.body;
    const conversation = await createOrGetConversation(userId, otherUserId);
    res.status(201).json({ success: true, data: conversation });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create or fetch conversations",
    });
  }
};
export const deleteConversation = async (req, res) => {
  try {
    const conversationId = Number(req.params.id);
    const deleted = await deleteConversationById(conversationId);
    if(deleted === false) return res.status(404).json({success:false,message:"Conversation not found"})
    res.status(200).json({
      success: true,
      message: "Conversation deleted successfully",
    });

  } catch (err) {
    console.error("Delete conversation error:", err);

    res.status(500).json({
      success: false,
      message: "Failed to delete conversation",
    });
  }
};


export const createGroupConv = async (req, res) => {
  try {
    const creatorId = req.user.id;
    const { userIds, name } = req.body;

    // 🔥 include creator automatically
    const allUsers = [...new Set([creatorId, ...userIds])];

    if (allUsers.length < 2) {
      return res.status(400).json({
        success: false,
        message: "Group must have at least 3 users",
      });
    }

    const conversation = await createGroupConversation(allUsers, name);

    res.status(201).json({
      success: true,
      data: conversation,
    });

  } catch (err) {
    console.error("Create group error:", err);

    res.status(500).json({
      success: false,
      message: "Failed to create group",
    });
  }
};



export const updateGroupConv = async (req, res) => {
  try {
    const userId = req.user.id;
    const conversationId = Number(req.params.id);

    const {
      name,
      profilePic,
      addUserIds,
      removeUserIds,
    } = req.body;

    const updated = await updateGroupConversation({
      userId,
      conversationId,
      name,
      profilePic,
      addUserIds,
      removeUserIds,
    });

    res.status(200).json({
      success: true,
      data: updated,
    });

  } catch (err) {
    console.error("Update group error:", err);

    res.status(err.status || 500).json({
      success: false,
      message: err.message || "Failed to update group",
    });
  }
};



export const leaveGroup = async (req, res) => {
  try {
    const userId = req.user.id;
    const conversationId = Number(req.params.id);

   let response =  await leaveGroupService({ userId, conversationId });

    res.status(200).json({
      success: response ? true : false,
      message:response ?  "Left group" :"failed",
    });

  } catch (err) {
    console.error("Leave group error:", err);

    res.status(err.status || 500).json({
      success: false,
      message: err.message || "Failed to leave group",
    });
  }
};