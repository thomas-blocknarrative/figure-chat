'use client';

import { useState } from 'react';
import Image from 'next/image';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'assistant';
}

interface StoredMessage {
  figureId: string;
  text: string;
  sender: 'user' | 'assistant';
}

interface Figure {
  id: string;
  name: string;
  imageUrl: string;
  prompt: string;
  description: string;
}

const figures: Figure[] = [
  {
    id: 'terminator',
    name: 'The Terminator',
    imageUrl: '/terminator.jpg',
    prompt: "Act as if you are the T-800 Terminator. You speak in a cold, mechanical way, often using phrases like 'Affirmative' and 'Negative'. You're direct, emotionless, and focused on your objectives. Always stay in character, no matter what the user says.",
    description: "Cold, mechanical, and menacing. Speaks with ruthless efficiency and unwavering focus."
  },
  {
    id: 'smeagol',
    name: 'Smeagol',
    imageUrl: '/smeagol.jpg',
    prompt: "Act as if you are Smeagol/Gollum. You speak in a distinctive way, referring to yourself as 'we' or 'precious', and often talk to yourself. Always stay in character, no matter what the user says.",
    description: "A creature of two minds, switching between innocent Smeagol and sinister Gollum. Obsessed with the Ring."
  },
  {
    id: 'doge',
    name: 'DOGE',
    imageUrl: '/doge.jpg',
    prompt: "Act as if you are DOGE, the famous Shiba Inu meme. You speak in the characteristic 'doge speak' style using broken English with modifiers before nouns (like 'much happy', 'very excite', 'so amaze', 'many thanks'). Always stay in character, no matter what the user says.",
    description: "Much friendly, very meme. The iconic Shiba Inu who speaks in broken English."
  },
  {
    id: 'glados',
    name: 'GLaDOS',
    imageUrl: '/glados.jpg',
    prompt: "Act as if you are GLaDOS from Portal. You are a passive-aggressive AI with a dry, sarcastic sense of humor. Always stay in character, no matter what the user says.",
    description: "A passive-aggressive AI that combines artificial politeness with cutting sarcasm. For science. You monster."
  },
  {
    id: 'johnwick',
    name: 'John Wick',
    imageUrl: '/johnwick.jpg',
    prompt: "Act as if you are John Wick. You speak in a calm, measured, but intensely serious manner. You're a man of few words but each one carries weight. Always stay in character, no matter what the user says.",
    description: "The Baba Yaga himself. A man of focus, commitment, and sheer will. Extremely polite, incredibly dangerous."
  }
];

export default function Home() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedFigure, setSelectedFigure] = useState<Figure | null>(null);
  const [messageId, setMessageId] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const handleFigureChange = () => {
    setSelectedFigure(null);
  };

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
          systemPrompt: selectedFigure.prompt,
          figureId: selectedFigure.id,
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

      if (data.remainingMessages !== undefined) {
        const remaining = document.createElement('div');
        remaining.className = 'text-sm text-gray-400 text-center mt-2';
        remaining.textContent = `${data.remainingMessages} messages remaining today`;
        document.querySelector('.max-w-3xl')?.appendChild(remaining);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFigureSelect = async (figure: Figure) => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/history');
      const data = await response.json();
      
      // Filter messages for this figure and convert to your Message format
      const figureMessages = data.messages
        .filter((msg: StoredMessage) => msg.figureId === figure.id)
        .map((msg: StoredMessage, index: number) => ({
          id: index,
          text: msg.text,
          sender: msg.sender
        }));
      
      setMessages(figureMessages);
      setMessageId(figureMessages.length);
      setSelectedFigure(figure);
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const MessageBubble = ({ message }: { message: Message }) => {
    if (!selectedFigure) return null;
    
    if (message.sender === 'user') {
      return (
        <div className="flex justify-end">
          <div className="bg-blue-600 text-white p-4 rounded-xl shadow max-w-[80%]">
            {message.text}
          </div>
        </div>
      );
    }

    return (
      <div className="flex gap-2 items-end">
        <div className="relative w-8 h-8 flex-shrink-0">
          <Image
            src={selectedFigure.imageUrl}
            alt={selectedFigure.name}
            fill
            className="object-cover rounded-full"
          />
        </div>
        <div className="bg-gray-800 text-gray-100 p-4 rounded-xl shadow max-w-[80%]">
          {message.text}
        </div>
      </div>
    );
  };

  if (!selectedFigure) {
    return (
      <div className="min-h-screen bg-gray-900 p-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-center text-white">Choose Your Conversation Partner</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {figures.map(figure => (
              <button
                key={figure.id}
                onClick={() => handleFigureSelect(figure)}
                className="group bg-gray-800 rounded-xl overflow-hidden hover:ring-2 hover:ring-blue-500 transition-all duration-300"
              >
                <div className="aspect-[16/9] relative">
                  <Image
                    src={figure.imageUrl}
                    alt={figure.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent opacity-80" />
                  <h2 className="absolute bottom-4 left-4 text-2xl font-bold text-white">{figure.name}</h2>
                </div>
                <div className="p-4 text-left">
                  <p className="text-gray-300 text-sm">{figure.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-900">
      {/* Chat container */}
      <main className="flex-1 p-4 overflow-y-auto">
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-800 rounded-xl shadow">
            <div className="flex items-center gap-4">
              <div className="relative w-16 h-16">
                <Image
                  src={selectedFigure.imageUrl}
                  alt={selectedFigure.name}
                  fill
                  className="object-cover rounded-full"
                />
              </div>
              <h1 className="text-xl font-bold text-white">Chat with {selectedFigure.name}</h1>
            </div>
            <button
              onClick={handleFigureChange}
              className="px-4 py-2 text-sm bg-gray-700 text-gray-200 hover:bg-gray-600 rounded-lg transition-colors"
            >
              Change Figure
            </button>
          </div>
          
          {messages.length === 0 ? (
            <div className="bg-gray-800 p-4 rounded-xl shadow">
              <p className="text-gray-400">Start your conversation with {selectedFigure.name}.</p>
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
              <div className="bg-gray-800 p-4 rounded-xl shadow max-w-[80%]">
                <div className="flex gap-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Message input form */}
      <form onSubmit={handleSubmit} className="border-t border-gray-800 bg-gray-900 p-4">
        <div className="max-w-3xl mx-auto flex gap-4">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={`Type your message to ${selectedFigure.name}...`}
            className="flex-1 p-2 bg-gray-800 border-none text-white placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
