'use client';

import { useState } from 'react';
import Image from 'next/image';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'assistant';
}

interface Figure {
  id: string;
  name: string;
  imageUrl: string;
}

const figures: Figure[] = [
  {
    id: 'terminator',
    name: 'The Terminator',
    imageUrl: '/terminator.jpg'
  }
];

export default function Home() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedFigure, setSelectedFigure] = useState<Figure | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !selectedFigure) return;
    
    const newMessage: Message = {
      id: Date.now(),
      text: message.trim(),
      sender: 'user',
    };
    
    setMessages(prev => [...prev, newMessage]);
    setMessage('');
  };

  if (!selectedFigure) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
        <div className="bg-white rounded-lg shadow p-6 max-w-md w-full">
          <h1 className="text-xl font-bold mb-4 text-center">Who would you like to talk to?</h1>
          <div className="space-y-2">
            {figures.map(figure => (
              <button
                key={figure.id}
                onClick={() => setSelectedFigure(figure)}
                className="w-full p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {figure.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Chat container */}
      <main className="flex-1 p-4 overflow-y-auto">
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow">
            <div className="relative w-16 h-16">
              <Image
                src={selectedFigure.imageUrl}
                alt={selectedFigure.name}
                fill
                className="object-cover rounded-full"
              />
            </div>
            <h1 className="text-xl font-bold">Chat with {selectedFigure.name}</h1>
          </div>
          
          {messages.length === 0 ? (
            <div className="bg-white p-4 rounded-lg shadow">
              <p className="text-gray-500">Start your conversation with {selectedFigure.name}.</p>
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
            placeholder={`Type your message to ${selectedFigure.name}...`}
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
