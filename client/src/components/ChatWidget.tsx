import { useState, useRef, useEffect } from 'react';
import { apiFetch } from '../lib/api';

type Message = { role: 'user' | 'assistant'; content: string };

const PROMPT_PROBES = [
  'What can I do with GrantFlow?',
  'How do I start a new application?',
  'Where do I manage my organisations?',
  'How do I find grants that match my project?',
  'Explain the application workflow',
];

function formatResponse(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>');
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [open, messages]);

  const sendMessage = async (content: string) => {
    const trimmed = content.trim();
    if (!trimmed || loading) return;
    const userMessage: Message = { role: 'user', content: trimmed };
    setMessages((m) => [...m, userMessage]);
    setInput('');
    setLoading(true);
    try {
      const res = await apiFetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMessage] }),
      });
      if (!res.ok) throw new Error('Chat failed');
      const data = (await res.json()) as { message: Message };
      setMessages((m) => [...m, data.message]);
    } catch {
      setMessages((m) => [
        ...m,
        { role: 'assistant', content: "Sorry, I couldn't get a response. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const showProbes = open && messages.length === 0;

  return (
    <>
      {/* Floating chat button */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? 'Close chat' : 'Open chat'}
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 9998,
          width: 56,
          height: 56,
          borderRadius: '50%',
          border: 'none',
          background: 'linear-gradient(135deg, var(--color-accent-start), var(--color-accent-end))',
          color: '#fff',
          cursor: 'pointer',
          boxShadow: '0 4px 20px rgba(99, 102, 241, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'transform 0.2s, box-shadow 0.2s',
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.transform = 'scale(1.05)';
          e.currentTarget.style.boxShadow = '0 6px 24px rgba(99, 102, 241, 0.5)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 4px 20px rgba(99, 102, 241, 0.4)';
        }}
      >
        <ChatIcon />
      </button>

      {/* Chat panel */}
      {open && (
        <div
          style={{
            position: 'fixed',
            bottom: 92,
            right: 24,
            zIndex: 9999,
            width: 380,
            maxWidth: 'calc(100vw - 48px)',
            height: 520,
            maxHeight: 'calc(100vh - 140px)',
            borderRadius: 16,
            background: 'var(--color-bg)',
            border: '1px solid var(--color-border)',
            boxShadow: '0 12px 40px rgba(0,0,0,0.12)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: '1rem 1.25rem',
              borderBottom: '1px solid var(--color-border)',
              background: 'rgba(255,255,255,0.9)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--color-text)' }}>
              GrantFlow guide
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close"
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                border: 'none',
                background: 'transparent',
                color: 'var(--color-text-secondary)',
                cursor: 'pointer',
                fontSize: '1.25rem',
                lineHeight: 1,
              }}
            >
              ×
            </button>
          </div>

          <div
            ref={listRef}
            style={{
              flex: 1,
              overflow: 'auto',
              padding: '1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
            }}
          >
            {messages.length === 0 && (
              <div
                style={{
                  fontSize: '0.875rem',
                  color: 'var(--color-text-secondary)',
                  marginBottom: '0.5rem',
                }}
              >
                Ask anything about the platform. Try one of these:
              </div>
            )}
            {showProbes && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {PROMPT_PROBES.map((probe) => (
                  <button
                    key={probe}
                    type="button"
                    onClick={() => sendMessage(probe)}
                    style={{
                      padding: '0.625rem 0.875rem',
                      borderRadius: 12,
                      border: '1px solid var(--color-border)',
                      background: 'rgba(99, 102, 241, 0.06)',
                      color: 'var(--color-accent-start)',
                      fontSize: '0.8125rem',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'background 0.15s',
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.background = 'rgba(99, 102, 241, 0.12)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.background = 'rgba(99, 102, 241, 0.06)';
                    }}
                  >
                    {probe}
                  </button>
                ))}
              </div>
            )}
            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '90%',
                  padding: '0.75rem 1rem',
                  borderRadius: 12,
                  background:
                    msg.role === 'user'
                      ? 'linear-gradient(135deg, var(--color-accent-start), var(--color-accent-end))'
                      : 'rgba(0,0,0,0.05)',
                  color: msg.role === 'user' ? '#fff' : 'var(--color-text)',
                  fontSize: '0.875rem',
                  lineHeight: 1.5,
                }}
              >
                {msg.role === 'assistant' ? (
                  <span dangerouslySetInnerHTML={{ __html: formatResponse(msg.content) }} />
                ) : (
                  msg.content
                )}
              </div>
            ))}
            {loading && (
              <div
                style={{
                  alignSelf: 'flex-start',
                  padding: '0.75rem 1rem',
                  borderRadius: 12,
                  background: 'rgba(0,0,0,0.05)',
                  fontSize: '0.875rem',
                  color: 'var(--color-text-secondary)',
                }}
              >
                …
              </div>
            )}
          </div>

          <form
            onSubmit={handleSubmit}
            style={{
              padding: '0.75rem 1rem',
              borderTop: '1px solid var(--color-border)',
              background: 'rgba(255,255,255,0.9)',
            }}
          >
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about the platform…"
                disabled={loading}
                style={{
                  flex: 1,
                  padding: '0.625rem 0.875rem',
                  borderRadius: 10,
                  border: '1px solid var(--color-border)',
                  fontSize: '0.875rem',
                  outline: 'none',
                }}
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                style={{
                  padding: '0.625rem 1rem',
                  borderRadius: 10,
                  border: 'none',
                  background:
                    loading || !input.trim()
                      ? 'var(--color-border)'
                      : 'linear-gradient(135deg, var(--color-accent-start), var(--color-accent-end))',
                  color: '#fff',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
                }}
              >
                Send
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

function ChatIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}
