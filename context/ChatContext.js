import React, { createContext, useContext, useState } from 'react';

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [chats, setChats] = useState([
    {
      id: '1',
      name: 'Sarah Parker',
      avatar: 'https://randomuser.me/api/portraits/women/1.jpg',
      lastMessage: "That sounds great! What time works for you?",
      timestamp: '10:32 AM',
      unread: 2,
      online: true,
      messages: [
        {
          id: '1',
          text: "Hey! How are you doing?",
          sender: 'other',
          timestamp: '10:30 AM',
          avatar: 'https://randomuser.me/api/portraits/women/1.jpg'
        },
        {
          id: '2',
          text: "I'm good! Just wondering if you'd like to meet up at the park tomorrow?",
          sender: 'me',
          timestamp: '10:31 AM'
        },
        {
          id: '3',
          text: "That sounds great! What time works for you?",
          sender: 'other',
          timestamp: '10:32 AM',
          avatar: 'https://randomuser.me/api/portraits/women/1.jpg'
        },
        {
          id: '4',
          text: "How about 3pm? The weather should be perfect then 🌞",
          sender: 'me',
          timestamp: '10:33 AM'
        }
      ]
    }
  ]);

  const addMessage = (chatId, message) => {
    setChats(prevChats => {
      return prevChats.map(chat => {
        if (chat.id === chatId) {
          return {
            ...chat,
            lastMessage: message.text,
            timestamp: message.timestamp,
            messages: [...chat.messages, message]
          };
        }
        return chat;
      });
    });
  };

  const markAsRead = (chatId) => {
    setChats(prevChats => {
      return prevChats.map(chat => {
        if (chat.id === chatId) {
          return {
            ...chat,
            unread: 0
          };
        }
        return chat;
      });
    });
  };

  return (
    <ChatContext.Provider value={{ chats, addMessage, markAsRead }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
