'use client';

import { useState } from 'react';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'assistant';
}

export default function Home() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    const newMessage: Message = {
      id: Date.now(),
      text: message.trim(),
      sender: 'user',
    };
    
    setMessages(prev => [...prev, newMessage]);
    setMessage('');
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Chat container */}
      <main className="flex-1 p-4 overflow-y-auto">
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.length === 0 ? (
            <div className="bg-white p-4 rounded-lg shadow">
              <p className="text-gray-500">Welcome to Figure Chat! Start a conversation.</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`p-4 rounded-lg shadow ${
                  msg.sender === 'user'
                    ? 'bg-blue-500 text-white ml-auto'
                    : 'bg-white mr-auto'
                } max-w-[80%]`}
              >
                {msg.text}
              </div>
            ))
          )}
        </div>
      </main>

      {/* Message input form */}
      <form onSubmit={handleSubmit} className="border-t bg-white p-4">
        <div className="max-w-3xl mx-auto flex gap-4">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
