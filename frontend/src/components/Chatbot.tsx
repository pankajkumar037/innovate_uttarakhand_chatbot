import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  CircularProgress,
  IconButton,
  Divider,
  Chip,
  Alert,
} from '@mui/material';
import {
  Send as SendIcon,
  SmartToy as BotIcon,
  Person as PersonIcon,
  Upload as UploadIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import ReactMarkdown from 'react-markdown';
import { chatAPI } from '../services/api';

const ChatContainer = styled(Paper)(({ theme }) => ({
  height: '70vh',
  display: 'flex',
  flexDirection: 'column',
  borderRadius: theme.spacing(2),
  overflow: 'hidden',
  backgroundColor: '#ffffff',
  border: '3px solid #FF6B6B',
  boxShadow: '0 8px 32px rgba(255, 107, 107, 0.3)',
}));

const MessagesContainer = styled(Box)({
  flex: 1,
  overflow: 'auto',
  padding: 16,
  backgroundColor: '#fafafa',
  border: '2px solid #4ECDC4',
  margin: '4px',
  borderRadius: '12px',
  '&::-webkit-scrollbar': {
    width: '8px',
  },
  '&::-webkit-scrollbar-track': {
    background: '#f1f1f1',
    borderRadius: '10px',
  },
  '&::-webkit-scrollbar-thumb': {
    background: 'linear-gradient(45deg, #FF6B6B, #4ECDC4)',
    borderRadius: '10px',
    '&:hover': {
      background: 'linear-gradient(45deg, #FF5252, #26A69A)',
    },
  },
});

const InputContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  borderTop: `3px solid #FFD93D`,
  backgroundColor: 'white',
  display: 'flex',
  gap: theme.spacing(1),
  alignItems: 'flex-end',
  border: '2px solid #6BCF7F',
  margin: '4px',
  borderRadius: '12px',
}));

const MessageBubble = styled(Box)<{ isUser: boolean }>(({ theme, isUser }) => ({
  maxWidth: '70%',
  marginBottom: theme.spacing(1),
  alignSelf: isUser ? 'flex-end' : 'flex-start',
  backgroundColor: isUser ? theme.palette.primary.main : 'white',
  color: isUser ? 'white' : theme.palette.text.primary,
  padding: theme.spacing(1.5),
  borderRadius: theme.spacing(2),
  boxShadow: theme.shadows[1],
  border: isUser ? '2px solid #FF6B6B' : '2px solid #4ECDC4',
  '& .markdown-content': {
    '& p': {
      margin: 0,
      marginBottom: theme.spacing(0.5),
      '&:last-child': {
        marginBottom: 0,
      },
    },
    '& ul, & ol': {
      margin: 0,
      paddingLeft: theme.spacing(2),
    },
    '& code': {
      backgroundColor: isUser ? 'rgba(255,255,255,0.2)' : theme.palette.grey[200],
      padding: '2px 4px',
      borderRadius: '4px',
      fontSize: '0.9em',
    },
    '& pre': {
      backgroundColor: isUser ? 'rgba(255,255,255,0.2)' : theme.palette.grey[200],
      padding: theme.spacing(1),
      borderRadius: theme.spacing(1),
      overflow: 'auto',
      margin: theme.spacing(1, 0),
    },
  },
}));

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const Chatbot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'How can I help you today?',
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await chatAPI.sendMessage(inputValue, sessionId);
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.response,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botMessage]);
      setSessionId(response.session_id);
    } catch (err) {
      setError('Failed to get response from the chatbot. Please try again.');
      console.error('Chat error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: '1',
        text: 'How can I help you today?',
        isUser: false,
        timestamp: new Date(),
      },
    ]);
    setSessionId(null);
    setError(null);
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          AI Assistant
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton onClick={handleClearChat} color="primary">
            <RefreshIcon />
          </IconButton>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <ChatContainer elevation={3}>
        <MessagesContainer>
          <List sx={{ p: 0 }}>
            {messages.map((message) => (
              <ListItem
                key={message.id}
                sx={{
                  flexDirection: message.isUser ? 'row-reverse' : 'row',
                  alignItems: 'flex-start',
                  px: 0,
                }}
              >
                <ListItemAvatar sx={{ minWidth: 40 }}>
                  <Avatar
                    sx={{
                      bgcolor: message.isUser ? 'primary.main' : 'secondary.main',
                      width: 32,
                      height: 32,
                      border: message.isUser ? '2px solid #FF6B6B' : '2px solid #4ECDC4',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                    }}
                  >
                    {message.isUser ? <PersonIcon /> : <BotIcon />}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  sx={{
                    ml: message.isUser ? 0 : 1,
                    mr: message.isUser ? 1 : 0,
                    '& .MuiListItemText-primary': {
                      display: 'flex',
                      justifyContent: message.isUser ? 'flex-end' : 'flex-start',
                    },
                  }}
                  primary={
                    <MessageBubble isUser={message.isUser}>
                      <ReactMarkdown className="markdown-content">
                        {message.text}
                      </ReactMarkdown>
                    </MessageBubble>
                  }
                />
              </ListItem>
            ))}
            {isLoading && (
              <ListItem sx={{ justifyContent: 'center' }}>
                <CircularProgress size={24} />
                <Typography variant="body2" sx={{ ml: 1 }}>
                  AI is thinking...
                </Typography>
              </ListItem>
            )}
          </List>
          <div ref={messagesEndRef} />
        </MessagesContainer>

        <Divider />

        <InputContainer>
          <TextField
            fullWidth
            multiline
            maxRows={4}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything..."
            variant="outlined"
            size="small"
            disabled={isLoading}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 3,
                border: '2px solid #FFD93D',
                '&:hover': {
                  border: '2px solid #FF6B6B',
                },
                '&.Mui-focused': {
                  border: '2px solid #4ECDC4',
                },
              },
            }}
          />
          <Button
            variant="contained"
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            sx={{
              minWidth: 48,
              height: 48,
              borderRadius: '50%',
              border: '2px solid #6BCF7F',
              background: 'linear-gradient(45deg, #FF6B6B, #4ECDC4)',
              '&:hover': {
                background: 'linear-gradient(45deg, #FF5252, #26A69A)',
                border: '2px solid #FFD93D',
              },
              '&:disabled': {
                background: '#E0E0E0',
                border: '2px solid #BDBDBD',
              },
            }}
          >
            <SendIcon />
          </Button>
        </InputContainer>
      </ChatContainer>

      <Box sx={{ mt: 2, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          All rights reserved to innovateuttarakhand.com
        </Typography>
      </Box>
    </Box>
  );
};

export default Chatbot;
