"use client";

import ChatHeader from "@/components/ChatHeader";
import ChatMessages from "@/components/ChatMessages";
import ChatSidebar from "@/components/ChatSidebar";
import MessageInput from "@/components/MessageInput";
import { useAppData } from "@/context/AppContext";
import { CHAT_CREATE_NEW, CHAT_MESSAGE_URL } from "@/lib/apiEndPoints";
import { Message, User } from "@/types";
import axios from "axios";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

const Chat = () => {
  const router = useRouter();
  const {
    isAuth,
    loading,
    logoutUser,
    chats,
    user: loggedInUser,
    users,
    fetchChats,
    setChats,
  } = useAppData();
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [message, setMessage] = useState<string>("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [messages, setMessages] = useState<Message[] | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [showAllUsers, setshowAllUsers] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeOut, setTypingTimeOut] = useState<NodeJS.Timeout | null>(
    null
  );

  const handleTyping = (value: string) => {
    setMessage(value);
    if (!selectedUser) return;
    // socket setup
  };

  const handleMessageSend = async (e: any, imageFile?: File | null) => {
    e.preventDefault();
    if (!message.toString().trim() && !imageFile) return;
    const token = localStorage.getItem("token");
    try {
      const formData = new FormData();
      if (!selectedUser) return;
      formData.append("chatId", selectedUser);
      if (message.trim()) {
        formData.append("text", message);
      }
      if (imageFile) {
        formData.append("image", imageFile);
      }
      const { data } = await axios.post(CHAT_MESSAGE_URL, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      setMessages((prev) => {
        const currentMessages = prev || [];
        const messageExists = currentMessages.some(
          (msg) => msg._id === data.message._id
        );
        if (!messageExists) return [...currentMessages, data.message];
        return currentMessages;
      });
      setMessage("");
      const displayText = imageFile ? "📷 image" : message;
    } catch (error: any) {
      toast.error(error.response.data.message);
    }
  };

  useEffect(() => {
    if (!isAuth && !loading) return router.push("/login");
  }, [isAuth, loading]);

  useEffect(() => {
    (async () => {
      if (selectedUser) {
        await fetchChat();
      }
    })();
  }, [selectedUser]);

  const fetchChat = async () => {
    const token = localStorage.getItem("token");
    try {
      const { data } = await axios.get(`${CHAT_MESSAGE_URL}/${selectedUser}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setMessages(data.messages);
      setUser(data.user);
      await fetchChats();
    } catch (error) {
      console.error(error);
      toast.error("Failed to load messages");
    }
  };
  const createChat = async (user: User) => {
    try {
      const token = localStorage.getItem("token");
      if (Object.keys(user).length === 0) {
        throw new Error("No user provided");
      }
      const { data } = await axios.post(
        CHAT_CREATE_NEW,
        {
          userId: loggedInUser?._id,
          otherUserId: user._id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!data.chatId) throw new Error("ChatId not found");
      setSelectedUser(data.chatId);
      setshowAllUsers(false);
      await fetchChats();
    } catch (error) {
      toast.error("Failed to start chat");
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-900 text-white relative overflow-hidden">
      <ChatSidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        chats={chats}
        handleLogout={logoutUser}
        loggedInUser={loggedInUser}
        selectedUser={selectedUser}
        setSelectedUser={setSelectedUser}
        setShowAllUsers={setshowAllUsers}
        showAllUsers={showAllUsers}
        users={users}
        createChat={createChat}
      />
      <div className="flex flex-1 flex-col justify-between p-4 backdrop-blur-xl bg-white/5 border-1 border-white/10">
        <ChatHeader
          user={user}
          setSidebarOpen={setSidebarOpen}
          isTyping={isTyping}
        />
        <ChatMessages
          loggedInUser={loggedInUser}
          messages={messages}
          selectedUser={selectedUser}
        />
        <MessageInput
          selectedUser={selectedUser}
          message={message}
          setMessage={setMessage}
          handleMessageSend={handleMessageSend}
        />
      </div>
    </div>
  );
};

export default Chat;
