import { useState, useRef, useEffect } from 'react';

interface ChatMessage {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  createdAt: string;
}

export default function App() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || sending) return;
    const text = input.trim();
    setInput('');
    setSending(true);

    // Create a conversation if we don't have one yet
    let cid = conversationId;
    if (!cid) {
      const createRes = await fetch('/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'New conversation' }),
      });
      const createData = await createRes.json();
      cid = createData.conversation.id;
      setConversationId(cid);
    }

    // Send user message and get assistant reply
    const msgRes = await fetch(`/conversations/${cid}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: text }),
    });

    if (!msgRes.ok) {
      setSending(false);
      return;
    }
    const data = await msgRes.json();

    // Replace messages with the full list from the API
    setMessages(data.messages as ChatMessage[]);
    setSending(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-screen w-full bg-gray-50 text-gray-900 font-sans">
      <aside className="flex w-56 flex-col border-r border-gray-200 bg-white">
        <div className="flex items-center gap-2 px-4 pt-4 pb-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-violet-600 text-sm font-bold text-white">
            B
          </div>
          <span className="text-lg font-semibold tracking-tight">Bots</span>
        </div>

        <nav className="flex-1 px-2 py-2">
          <ul className="space-y-1">
            {['Bots', 'Inbox', 'Tasks', 'Computers', 'Files', 'Connected apps', 'Schedules', 'Settings'].map(
              (item) => (
                <li key={item}>
                  <button className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors">
                    <span className="h-4 w-4" />
                    {item}
                  </button>
                </li>
              )
            )}
          </ul>
        </nav>

        <div className="border-t border-gray-200 px-3 py-3">
          <div className="flex items-center gap-2 rounded-md px-2 py-2 text-sm text-gray-500 hover:bg-gray-100 cursor-pointer">
            <div className="h-6 w-6 rounded-full bg-gray-300" />
            <span>User</span>
          </div>
        </div>
      </aside>

      <main className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-100 text-lg font-semibold text-violet-700">
              A
            </div>
            <div>
              <h1 className="text-base font-semibold">Ana</h1>
              <p className="text-xs text-gray-500">Research &amp; writing assistant</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 border border-emerald-200">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            idle
          </span>
        </header>

        <div className="flex-1 overflow-y-auto bg-gray-50 px-6 py-4">
          <div className="mx-auto max-w-3xl space-y-4">
            {messages.length === 0 && (
              <div className="flex gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-100 text-xs font-semibold text-violet-700">
                  A
                </div>
                <div className="rounded-2xl rounded-tl-sm bg-white px-4 py-2.5 shadow-sm border border-gray-100 max-w-lg">
                  <p className="text-sm leading-relaxed text-gray-800">
                    Hey! I'm Ana, your research assistant. Just send me a message to get started! 🎉
                  </p>
                </div>
              </div>
            )}

            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}
              >
                {msg.role !== 'user' && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-100 text-xs font-semibold text-violet-700">
                    A
                  </div>
                )}
                <div
                  className={`rounded-2xl px-4 py-2.5 max-w-lg ${
                    msg.role === 'user'
                      ? 'rounded-tr-sm bg-violet-600 text-white'
                      : 'rounded-tl-sm bg-white shadow-sm border border-gray-100 text-gray-800'
                  }`}
                >
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                  <p
                    className={`mt-1 text-xs ${
                      msg.role === 'user' ? 'text-right text-violet-200' : 'text-gray-400'
                    }`}
                  >
                    {new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                {msg.role === 'user' && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-300 text-xs font-semibold text-white">
                    U
                  </div>
                )}
              </div>
            ))}

            {sending && (
              <div className="flex gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-100 text-xs font-semibold text-violet-700">
                  A
                </div>
                <div className="rounded-2xl rounded-tl-sm bg-white px-4 py-2.5 shadow-sm border border-gray-100 max-w-lg">
                  <div className="flex gap-1">
                    <div className="h-2 w-2 animate-bounce rounded-full bg-gray-300" style={{ animationDelay: '0ms' }} />
                    <div className="h-2 w-2 animate-bounce rounded-full bg-gray-300" style={{ animationDelay: '150ms' }} />
                    <div className="h-2 w-2 animate-bounce rounded-full bg-gray-300" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        <div className="border-t border-gray-200 bg-white px-6 py-3">
          <div className="mx-auto max-w-3xl flex items-center gap-3 rounded-xl border border-gray-300 bg-white px-4 py-2.5 shadow-sm focus-within:border-violet-400 focus-within:ring-1 focus-within:ring-violet-300 transition">
            <input
              type="text"
              placeholder="Ask Ana anything..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={sending}
              className="flex-1 bg-transparent text-sm text-gray-800 placeholder-gray-400 outline-none disabled:opacity-50"
            />
            <button
              onClick={handleSend}
              disabled={sending || !input.trim()}
              aria-label="Send message"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-600 text-white hover:bg-violet-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22 2L11 13" />
                <path d="M22 2L15 22L11 13L2 9L22 2Z" />
              </svg>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
