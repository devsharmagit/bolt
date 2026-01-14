'use client';
import { useWebContainer } from '@/hooks/useWebcontainer';
import { LlmMessage } from '@/types/chat.type';
import { useEffect, useState } from 'react';
import { Step, FileItem } from '@/types/file.type';
import { parseXml } from '@/utils/step';
import axios from 'axios';

type TemplateResponse = {
    prompts?: string[];
    uiPrompts?: string[];
  };
  type ChatResponse = {
    response: string
  }


export default function ChatPage() {
  const [initialPrompt, setInitialPrompt] = useState('');

  const [laoding, setLoading] = useState(false);
  const [templateSet, setTemplateSet] = useState(false);
  

  const [llmMessages, setLlmMessages] = useState<LlmMessage[]>([]);
  
  const webcontainer = useWebContainer();

  const [steps, setSteps] = useState<Step[]>([]);
  const [selectedFile, setSelectedFile] = useState<string>('src/App.tsx');
  const [activeTab, setActiveTab] = useState<'code' | 'preview'>('code');
  
  const [files, setFiles] = useState<FileItem[]>([]);
  
  useEffect(() => {
    const prompt = sessionStorage.getItem('initialPrompt');
    if (prompt) {
      setInitialPrompt(prompt);
      sessionStorage.removeItem('initialPrompt'); // Clean up
    }
  }, []);
  
  useEffect(() => {
    const init = async (initialPrompt: string) => {
    const response = await axios.post<TemplateResponse>(`${BACKEND_URL}/template`, {
      prompt: initialPrompt
    });
    setTemplateSet(true);
    if (response.data?.prompts && response.data.uiPrompts) {
      const firstSteps = parseXml(response.data.uiPrompts[0])
      setSteps((prev)=>([...prev, ...firstSteps]));
      const userarr :LlmMessage[] = response.data.prompts.map((p: string) => ({
          role: "user",
          content : p
        }))
        setLoading(true);
      const stepsResponse = await axios.post<ChatResponse>(`${BACKEND_URL}/chat`, {
        messages: [...userarr, {role: "user", content: initialPrompt}]
      });
      setLoading(false);
      if(stepsResponse.data?.response){
        const parsedSteps = parseXml(stepsResponse.data.response)
        setSteps((prev)=>([...prev, ...parsedSteps]))

    setLlmMessages([
      ...userarr,
      { role: "user", content: initialPrompt }
    ]);

    setLlmMessages(x => [...x, {role: "assistant", content: stepsResponse.data.response}])
      }
    }
    
  }
    if (initialPrompt) {
    init(initialPrompt);
    }
  }, [initialPrompt]);

  return (
    <div>

    </div>
  )
}