
'use client';

import { useState, type FormEvent, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot, Sparkles, User, Loader2, SendHorizonal, AlertTriangle } from 'lucide-react';
// import { babyverseChatbot, type BabyverseChatbotInput, type BabyverseChatbotOutput } from '@/ai/flows/babyverse-chatbot'; // No longer direct import
import type { BabyverseChatbotInput, BabyverseChatbotOutput } from '@/ai/flows/babyverse-chatbot'; // Keep types
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

interface ChatMessage {
  id: string;
  sender: 'user' | 'zizi';
  text: string;
  babyInfo?: BabyverseChatbotInput; // Optional, only for user messages if context is sent
}

export default function ChatbotPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [mockBabyContext] = useState<Partial<BabyverseChatbotInput>>({
    babyName: 'Orion',
    babyAgeMonths: 8,
    babyWeightLbs: 18,
    babyAllergies: 'None known',
    babyPreferences: 'Loves soft textures, dislikes loud noises',
  });

  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSubmit = async (event?: FormEvent<HTMLFormElement | HTMLButtonElement>) => {
    event?.preventDefault();
    if (!userInput.trim()) return;

    const newUserMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: userInput,
    };
    setMessages(prev => [...prev, newUserMessage]);
    
    setIsLoading(true);
    setError(null);
    const currentInputText = userInput; // Capture current input before clearing
    setUserInput('');

    try {
      const apiInput: BabyverseChatbotInput = {
        question: currentInputText,
        ...mockBabyContext,
      };

      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apiInput),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to get response from Zizi API');
      }
      
      const result: BabyverseChatbotOutput = await response.json();
      
      const ziziResponse: ChatMessage = {
        id: `zizi-${Date.now()}`,
        sender: 'zizi',
        text: result.answer,
      };
      setMessages(prev => [...prev, ziziResponse]);

    } catch (e: any) {
      console.error('Error with Zizi:', e);
      const errorMsg = e.message || 'Zizi seems to be on a coffee break in another galaxy. Please try again later.';
      setError(errorMsg);
      setMessages(prev => [...prev, { id: `error-${Date.now()}`, sender: 'zizi', text: errorMsg }]);
      toast({
        title: "Chatbot Error",
        description: "Failed to get a response from Zizi.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-2 md:px-4 flex flex-col h-[calc(100vh-10rem)]">
      <Card className="flex-1 flex flex-col shadow-glow-lg border-accent/30 overflow-hidden">
        <CardHeader className="text-center border-b">
          <div className="mx-auto mb-2 p-2 bg-accent/20 rounded-full w-fit animate-pulse-glow">
            <Bot size={32} className="text-accent" />
          </div>
          <CardTitle className="text-2xl font-headline text-primary">Chat with Zizi</CardTitle>
          <CardDescription className="text-muted-foreground">
            Your AI Baby Assistant is ready to help! (Using mock baby: {mockBabyContext.babyName}, {mockBabyContext.babyAgeMonths}mo)
          </CardDescription>
        </CardHeader>
        
        <CardContent className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-muted/10">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] p-3 rounded-xl shadow ${
                msg.sender === 'user' 
                  ? 'bg-primary text-primary-foreground rounded-br-none' 
                  : 'bg-card text-card-foreground border border-border rounded-bl-none'
              } ${msg.text.includes("coffee break") ? 'bg-destructive/20 text-destructive-foreground' : ''}`}>
                {msg.sender === 'zizi' && (
                    <div className="flex items-center mb-1">
                        <Bot size={16} className="mr-2 text-accent"/>
                        <span className="text-xs font-semibold text-accent">Zizi</span>
                    </div>
                )}
                <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
           {isLoading && (
            <div className="flex justify-start">
                 <div className="max-w-[75%] p-3 rounded-xl shadow bg-card text-card-foreground border border-border rounded-bl-none">
                    <div className="flex items-center mb-1">
                        <Bot size={16} className="mr-2 text-accent"/>
                        <span className="text-xs font-semibold text-accent">Zizi is thinking...</span>
                    </div>
                    <Loader2 className="h-5 w-5 animate-spin text-accent" />
                </div>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="p-4 border-t bg-card">
          <form onSubmit={handleSubmit} className="w-full flex items-center gap-2">
            <Input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Ask Zizi anything about baby care or products..."
              className="flex-1 focus:ring-accent focus:border-accent"
              disabled={isLoading}
            />
            <Button type="submit" disabled={isLoading || !userInput.trim()} className="bg-accent hover:bg-accent/90 text-accent-foreground">
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <SendHorizonal className="h-5 w-5" />}
              <span className="sr-only">Send</span>
            </Button>
          </form>
        </CardFooter>
      </Card>
       {error && !isLoading && ( 
        <div className="mt-4 p-3 bg-destructive/10 border border-destructive text-destructive rounded-md flex items-center">
          <AlertTriangle className="h-5 w-5 mr-2"/>
          <p className="text-sm">{error}</p>
        </div>
      )}
    </div>
  );
}
