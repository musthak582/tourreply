"use client";

import { useState, useRef, useEffect } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { sendMessageAction, receiveGuestMessageAction } from "@/actions/message-actions";
import { formatRelative, formatTime, initials } from "@/lib/utils";
import {
  Send,
  MessageSquare,
  Phone,
  Globe,
  Zap,
  ChevronRight,
  Bot,
  User,
  Plus,
  Search,
} from "lucide-react";

type Message = {
  id: string;
  sender: string;
  content: string;
  createdAt: Date;
  type: string;
};

type Guest = {
  id: string;
  name: string;
  phone: string;
  country: string | null;
};

type Conversation = {
  id: string;
  lastMessage: string | null;
  updatedAt: Date;
  status: string;
  guest: Guest;
  messages: Message[];
};

type FAQ = {
  id: string;
  question: string;
  answer: string;
};

interface InboxClientProps {
  conversations: Conversation[];
  faqs: FAQ[];
}

export function InboxClient({ conversations: initialConvs, faqs }: InboxClientProps) {
  const [conversations, setConversations] = useState(initialConvs);
  const [selectedId, setSelectedId] = useState<string | null>(
    initialConvs[0]?.id || null
  );
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const selected = conversations.find((c) => c.id === selectedId);

  const filtered = conversations.filter(
    (c) =>
      c.guest.name.toLowerCase().includes(search.toLowerCase()) ||
      c.lastMessage?.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selected?.messages]);

  async function handleSend() {
    if (!message.trim() || !selectedId || sending) return;
    setSending(true);

    const content = message.trim();
    setMessage("");

    // Optimistic update
    setConversations((prev) =>
      prev.map((c) =>
        c.id === selectedId
          ? {
              ...c,
              lastMessage: content,
              messages: [
                ...c.messages,
                {
                  id: `temp-${Date.now()}`,
                  sender: "hotel",
                  content,
                  createdAt: new Date(),
                  type: "text",
                },
              ],
            }
          : c
      )
    );

    await sendMessageAction(selectedId, content, "hotel");
    setSending(false);
  }

  async function handleQuickReply(faq: FAQ) {
    if (!selectedId) return;
    setMessage(faq.answer);
    textareaRef.current?.focus();
  }

  async function simulateGuestMessage() {
    if (!selected) return;
    const testMessage = "Do you have rooms available for next week?";

    await receiveGuestMessageAction(
      selected.guest.phone,
      selected.guest.name,
      testMessage
    );

    setConversations((prev) =>
      prev.map((c) =>
        c.id === selectedId
          ? {
              ...c,
              lastMessage: testMessage,
              messages: [
                ...c.messages,
                {
                  id: `guest-${Date.now()}`,
                  sender: "guest",
                  content: testMessage,
                  createdAt: new Date(),
                  type: "text",
                },
              ],
            }
          : c
      )
    );
  }

  return (
    <div className="flex h-full bg-white">
      {/* Conversation List */}
      <div className="w-72 border-r border-slate-200 flex flex-col shrink-0">
        <div className="p-3 border-b border-slate-100">
          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-sm font-semibold text-slate-900 flex-1">Inbox</h2>
            <Badge variant="neutral" className="text-xs">
              {conversations.filter((c) => c.status === "open").length}
            </Badge>
          </div>
          <div className="flex items-center gap-2 h-8 bg-slate-50 rounded-lg px-2.5">
            <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <input
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent text-xs text-slate-700 placeholder:text-slate-400 outline-none w-full"
            />
          </div>
        </div>

        <ScrollArea className="flex-1">
          {filtered.length === 0 ? (
            <div className="p-4 text-center">
              <MessageSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs text-slate-500">No conversations</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {filtered.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setSelectedId(conv.id)}
                  className={`w-full text-left p-3 hover:bg-slate-50 transition-colors ${
                    selectedId === conv.id ? "bg-emerald-50 border-l-2 border-emerald-500" : ""
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <Avatar className="w-8 h-8 shrink-0">
                      <AvatarFallback className="text-xs bg-slate-100 text-slate-600 font-semibold">
                        {initials(conv.guest.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <p className="text-xs font-semibold text-slate-900 truncate">
                          {conv.guest.name}
                        </p>
                        <span className="text-xs text-slate-400 shrink-0 ml-1">
                          {formatRelative(conv.updatedAt).replace(" ago", "")}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 truncate">
                        {conv.lastMessage || "No messages yet"}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Chat Area */}
      {selected ? (
        <div className="flex-1 flex flex-col min-w-0">
          {/* Chat header */}
          <div className="h-14 border-b border-slate-200 flex items-center justify-between px-4 shrink-0">
            <div className="flex items-center gap-3">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="text-xs bg-emerald-100 text-emerald-700 font-semibold">
                  {initials(selected.guest.name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-semibold text-slate-900">{selected.guest.name}</p>
                <p className="text-xs text-slate-500">{selected.guest.phone}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={simulateGuestMessage}
                className="text-xs h-7"
              >
                <Bot className="w-3 h-3 mr-1" />
                Simulate guest
              </Button>
              <Badge variant="success" className="text-xs">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5" />
                Active
              </Badge>
            </div>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-3 max-w-2xl mx-auto">
              {selected.messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === "hotel" ? "justify-end" : "justify-start"}`}
                >
                  {msg.sender === "system" ? (
                    <div className="mx-auto flex items-center gap-2 bg-slate-100 rounded-full px-3 py-1.5">
                      <Zap className="w-3 h-3 text-amber-500" />
                      <span className="text-xs text-slate-600 font-medium">Auto-reply sent</span>
                    </div>
                  ) : (
                    <div
                      className={`max-w-xs lg:max-w-md ${
                        msg.sender === "hotel" ? "items-end" : "items-start"
                      } flex flex-col`}
                    >
                      {msg.sender !== "hotel" && (
                        <div className="flex items-center gap-1.5 mb-1">
                          <Avatar className="w-5 h-5">
                            <AvatarFallback className="text-xs bg-slate-200 text-slate-600">
                              {initials(selected.guest.name)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs text-slate-500">{selected.guest.name}</span>
                        </div>
                      )}
                      <div
                        className={`rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                          msg.sender === "hotel"
                            ? "bg-emerald-600 text-white rounded-br-sm"
                            : "bg-slate-100 text-slate-800 rounded-bl-sm"
                        }`}
                      >
                        {msg.content}
                      </div>
                      <span className="text-xs text-slate-400 mt-1 px-1">
                        {formatTime(msg.createdAt)}
                      </span>
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Quick replies */}
          {faqs.length > 0 && (
            <div className="px-4 py-2 border-t border-slate-100 flex gap-1.5 overflow-x-auto scrollbar-thin">
              {faqs.slice(0, 4).map((faq) => (
                <button
                  key={faq.id}
                  onClick={() => handleQuickReply(faq)}
                  className="shrink-0 text-xs px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-full text-slate-700 transition-colors whitespace-nowrap"
                >
                  {faq.question.length > 30 ? faq.question.slice(0, 30) + "..." : faq.question}
                </button>
              ))}
            </div>
          )}

          {/* Message input */}
          <div className="p-3 border-t border-slate-200 shrink-0">
            <div className="flex items-end gap-2 bg-slate-50 rounded-xl border border-slate-200 focus-within:border-emerald-300 transition-colors">
              <textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Type a message... (Enter to send)"
                rows={1}
                className="flex-1 bg-transparent text-sm text-slate-700 placeholder:text-slate-400 outline-none resize-none px-3.5 py-2.5 max-h-32"
              />
              <button
                onClick={handleSend}
                disabled={!message.trim() || sending}
                className="mb-2 mr-2 w-8 h-8 flex items-center justify-center rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900 mb-1">Select a conversation</h3>
            <p className="text-xs text-slate-500">Choose a guest from the list to start messaging</p>
          </div>
        </div>
      )}

      {/* Guest Info Panel */}
      {selected && (
        <div className="w-64 border-l border-slate-200 flex flex-col shrink-0 bg-slate-50">
          <div className="p-4 border-b border-slate-200">
            <h3 className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-3">
              Guest Info
            </h3>
            <div className="flex flex-col items-center">
              <Avatar className="w-14 h-14 mb-2">
                <AvatarFallback className="text-lg font-bold bg-emerald-100 text-emerald-700">
                  {initials(selected.guest.name)}
                </AvatarFallback>
              </Avatar>
              <p className="text-sm font-semibold text-slate-900">{selected.guest.name}</p>
              {selected.guest.country && (
                <p className="text-xs text-slate-500 mt-0.5">{selected.guest.country}</p>
              )}
            </div>
          </div>

          <div className="p-4 space-y-3">
            <div>
              <p className="text-xs text-slate-500 mb-1">Phone</p>
              <div className="flex items-center gap-1.5">
                <Phone className="w-3 h-3 text-slate-400" />
                <p className="text-xs font-medium text-slate-700">{selected.guest.phone}</p>
              </div>
            </div>

            {selected.guest.country && (
              <div>
                <p className="text-xs text-slate-500 mb-1">Country</p>
                <div className="flex items-center gap-1.5">
                  <Globe className="w-3 h-3 text-slate-400" />
                  <p className="text-xs font-medium text-slate-700">{selected.guest.country}</p>
                </div>
              </div>
            )}

            <div>
              <p className="text-xs text-slate-500 mb-1">Messages</p>
              <p className="text-xs font-medium text-slate-700">{selected.messages.length} total</p>
            </div>
          </div>

          <div className="p-4 mt-auto border-t border-slate-200">
            <Button
              size="sm"
              variant="outline"
              className="w-full text-xs h-8"
              asChild
            >
              <a href={`/dashboard/guests`}>
                <User className="w-3 h-3 mr-1.5" />
                View Guest Profile
              </a>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
