import { put, list, del } from '@vercel/blob';

// Define the structure of a stored message
interface StoredMessage {
  text: string;          // The content of the message
  sender: 'user' | 'assistant';  // Who sent the message
  timestamp: number;     // When the message was sent
  figureId: string;     // Which character (Terminator, Smeagol, etc.)
}

// Retrieve all messages for a specific user
export async function getMessages(userId: string): Promise<StoredMessage[]> {
  try {
    // List all files in the user's chat directory
    const { blobs } = await list({ prefix: `chats/${userId}/` });
    
    // For each file (blob), fetch its contents and parse as JSON
    const messages = await Promise.all(
      blobs.map(async (blob) => {
        const response = await fetch(blob.url);
        return response.json() as Promise<StoredMessage>;
      })
    );
    
    // Sort messages by timestamp to show them in order
    return messages.sort((a, b) => a.timestamp - b.timestamp);
  } catch (error) {
    console.error('Error getting messages:', error);
    return [];
  }
}

// Save a new message for a specific user
export async function saveMessage(userId: string, message: StoredMessage): Promise<void> {
  try {
    // Create a unique filename using timestamp and sender
    const filename = `chats/${userId}/${message.timestamp}-${message.sender}.json`;
    
    // Save the message as a JSON file in Blob storage
    await put(filename, JSON.stringify(message), {
      access: 'public', // Make the file publicly readable
      contentType: 'application/json',
      addRandomSuffix: false // Use exact filename
    });
  } catch (error) {
    console.error('Error saving message:', error);
  }
}