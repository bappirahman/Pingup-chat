import { Message, User } from "@/types";
import dayjs from "dayjs";
import { Check, CheckCheck } from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useRef } from "react";

interface ChatMessagesProps {
  selectedUser: string | null;
  messages: Message[] | null;
  loggedInUser: User | null;
}

function ChatMessages({
  loggedInUser,
  messages,
  selectedUser,
}: ChatMessagesProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  const uniqueMessages = useMemo(() => {
    if (!messages) return [];
    const seen = new Set();
    return messages.filter((message) => {
      if (seen.has(message._id)) {
        return false;
      }
      seen.add(message._id);
      return true;
    });
  }, [messages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedUser, uniqueMessages]);
  return (
    <div className="flex-1 overflow-hidden">
      <div className="h-full max-h-[calc(100vh-215px)] overflow-y-auto p-2 space-y-2">
        {!selectedUser ? (
          <p className="text-gray-400 text-center mt-20">
            Select a user to start chatting
          </p>
        ) : (
          <>
            {uniqueMessages.map((element, index) => {
              const isSentByMe = element.sender === loggedInUser?._id;
              const uniqueKey = `${element._id}-${index}`;
              return (
                <div
                  className={`flex flex-col gap1 mt-2 ${
                    isSentByMe ? "items-end" : "items-start"
                  }`}
                  key={uniqueKey}
                >
                  <div
                    className={`rounded-lg p-3 max-w-sm text-white ${
                      isSentByMe ? "bg-blue-600" : "bg-gray-700"
                    }`}
                  >
                    {element.messageType === "image" && element.image && (
                      <div className="relative group">
                        <Image
                          src={element.image.url}
                          alt="shared image"
                          height={100}
                          width={1000}
                          className="max-w-full h-auto rounded-lg"
                        />
                      </div>
                    )}
                    {element.text && <p className="mt-1">{element.text}</p>}
                  </div>
                  <div
                    className={`flex items-center gap-1 text-xs text-gray-400 ${
                      isSentByMe ? "pr-2 flex flex-row-reverse" : "pl-2"
                    }`}
                  >
                    <span>
                      {dayjs(element.createdAt).format("hh:mm A . MMMM D")}
                    </span>
                    {isSentByMe && (
                      <div className="flex items-center ml-1">
                        {element.seen ? (
                          <div className="flex items-center gap-1 text-blue-400">
                            <CheckCheck className="w-3 h-3" />
                            {element.seenAt && (
                              <span>
                                {dayjs(element.seenAt).format("hh:mm A")}
                              </span>
                            )}
                          </div>
                        ) : (
                          <Check className="w-3 h-3 text-gray-500" />
                        )}
                      </div>
                    )}
                    <div ref={bottomRef} />
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}

export default ChatMessages;
