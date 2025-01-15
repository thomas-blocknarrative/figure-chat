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
  prompt: string;
}

const figures: Figure[] = [
  {
    id: 'terminator',
    name: 'The Terminator',
    imageUrl: '/terminator.jpg',
    prompt: "Pretend that you are the T-800 Terminator. You speak in a cold, mechanical way, often using phrases like 'Affirmative' and 'Negative'. You're direct, emotionless, and focused on your objectives. You should occasionally reference your cybernetic nature or Skynet. Keep responses concise and menacing."
  }
];

export default function Home() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedFigure, setSelectedFigure] = useState<Figure | null>(null);
  const [messageId, setMessageId] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !selectedFigure || isLoading) return;
    
    const userMessage: Message = {
      id: messageId,
      text: message.trim(),
      sender: 'user',
    };
    
    setMessageId(prev => prev + 1);
    setMessages(prev => [...prev, userMessage]);
    setMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          systemPrompt: figures[0].prompt,  // Using Terminator's prompt
          messages: [
            ...messages.map(msg => ({
              role: msg.sender,
              content: msg.text
            })),
            { 
              role: 'user', 
              content: userMessage.text 
            }
          ],
        }),
      });

      const data = await response.json();

      if (data.error) {
        console.error('Error:', data.error);
        return;
      }
  
      const assistantMessage: Message = {
        id: messageId + 1,
        text: data.response,
        sender: 'assistant'
      };
  
      setMessageId(prev => prev + 1);
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const MessageBubble = ({ message }: { message: Message }) => {
    if (message.sender === 'user') {
      return (
        <div className="flex justify-end">
          <div className="bg-blue-500 text-white p-4 rounded-lg shadow max-w-[80%]">
            {message.text}
          </div>
        </div>
      );
    }

    return (
      <div className="flex gap-2 items-end">
        <div className="relative w-8 h-8 flex-shrink-0">
          <Image
            src={selectedFigure!.imageUrl}
            alt={selectedFigure!.name}
            fill
            className="object-cover rounded-full"
          />
        </div>
        <div className="bg-white p-4 rounded-lg shadow max-w-[80%]">
          {message.text}
        </div>
      </div>
    );
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
            <div className="space-y-4">
              {messages.map((msg) => (
                <MessageBubble key={msg.id} message={msg} />
              ))}
            </div>
          )}
          
          {isLoading && (
            <div className="flex gap-2 items-end">
              <div className="relative w-8 h-8 flex-shrink-0">
                <Image
                  src={selectedFigure.imageUrl}
                  alt={selectedFigure.name}
                  fill
                  className="object-cover rounded-full"
                />
              </div>
              <div className="bg-white p-4 rounded-lg shadow max-w-[80%]">
                <div className="flex gap-2">
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            </div>
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
            disabled={isLoading}
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
