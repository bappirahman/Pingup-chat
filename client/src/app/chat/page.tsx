"use client";

import ChatSidebar from "@/components/ChatSidebar";
import { useAppData } from "@/context/AppContext";
import { Message, User } from "@/types";
import { redirect } from "next/navigation";
import React, { useEffect, useState } from "react";

const Chat = () => {
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
  const [message, setMessage] = useState<Message | "">("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [messages, setMessages] = useState<Message[] | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [showAllUsers, setshowAllUsers] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeOut, setTypingTimeOut] = useState<NodeJS.Timeout | null>(
    null
  );

  useEffect(() => {
    if (!isAuth && !loading) return redirect("/login");
  }, [isAuth, loading]);

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
      />
    </div>
  );
};

export default Chat;
