"use client";

export default function ChatPanel({ messages = [] }) {
  return (
    <div className="space-y-3 max-h-[56vh] overflow-auto pr-1">
      {messages.map((m, i) => {
        const me = m.role === "user";
        return (
          <div key={i} className={`flex ${me ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[75%] bubble ${me ? "bubble-user" : "bubble-assistant"}`}>
              <div className="kicker mb-1">{m.role}</div>
              <div>{m.content}</div>
            </div>
          </div>
        );
      })}
      {/* {!messages.length && (
        <div className="text-sm" style={{ color: "var(--muted)" }}>
          Think aloud and type whenever you like. Ask anything about AI adoption or usage.
        </div>
      )} */}
    </div>
  );
}
