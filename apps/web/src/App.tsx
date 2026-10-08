export default function App() {
  const navItems = ['Bots', 'Inbox', 'Tasks', 'Computers', 'Files', 'Connected apps', 'Schedules', 'Settings'];

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
            {navItems.map((item) => (
              <li key={item}>
                <button className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors">
                  <span className="h-4 w-4" />
                  {item}
                </button>
              </li>
            ))}
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
            <div className="flex gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-100 text-xs font-semibold text-violet-700">
                A
              </div>
              <div className="rounded-2xl rounded-tl-sm bg-white px-4 py-2.5 shadow-sm border border-gray-100 max-w-lg">
                <p className="text-sm leading-relaxed text-gray-800">
                  Hey! I'm Ana, your research assistant. I can help you draft
                  documents, summarize articles, or brainstorm ideas. Just let me
                  know what you need! 🎉
                </p>
                <p className="mt-2 text-xs text-gray-400">9:41 AM</p>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <div className="rounded-2xl rounded-tr-sm bg-violet-600 px-4 py-2.5 max-w-lg">
                <p className="text-sm leading-relaxed text-white">
                  Can you summarize the latest trends in AI-powered workflows for
                  my next blog post?
                </p>
                <p className="mt-1 text-xs text-right text-violet-200">9:42 AM</p>
              </div>
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-300 text-xs font-semibold text-white">
                U
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-100 text-xs font-semibold text-violet-700">
                A
              </div>
              <div className="rounded-2xl rounded-tl-sm bg-white px-4 py-2.5 shadow-sm border border-gray-100 max-w-lg">
                <p className="text-sm leading-relaxed text-gray-800">
                  Sure! Here's a quick rundown of trends I've spotted:
                </p>
                <ul className="mt-1 list-disc pl-4 text-sm leading-relaxed text-gray-800 space-y-1">
                  <li>
                    <strong>Agentic frameworks</strong> — multi-step autonomous planning is maturing fast.
                  </li>
                  <li>
                    <strong>Tool-use &amp; reasoning</strong> — models are getting better at chaining external APIs.
                  </li>
                  <li>
                    <strong>Personalized memory</strong> — bots are learning from long-term context.
                  </li>
                </ul>
                <p className="mt-2 text-sm leading-relaxed text-gray-800">
                  Want me to expand on any of these?
                </p>
                <p className="mt-2 text-xs text-gray-400">9:43 AM</p>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 bg-white px-6 py-3">
          <div className="mx-auto max-w-3xl flex items-center gap-3 rounded-xl border border-gray-300 bg-white px-4 py-2.5 shadow-sm focus-within:border-violet-400 focus-within:ring-1 focus-within:ring-violet-300 transition">
            <input
              type="text"
              placeholder="Ask Ana anything..."
              className="flex-1 bg-transparent text-sm text-gray-800 placeholder-gray-400 outline-none"
            />
            <button className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-600 text-white hover:bg-violet-700 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
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
