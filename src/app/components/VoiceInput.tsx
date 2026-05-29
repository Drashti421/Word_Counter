import { useState, useEffect } from "react";
import { Mic, MicOff } from "lucide-react";
import { Button } from "./ui/button";
import { toast } from "sonner";

interface VoiceInputProps {
  onTranscript: (text: string) => void;
}

export function VoiceInput({ onTranscript }: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);

  useEffect(() => {
    // Check if browser supports speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = 'en-US';

      recognitionInstance.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result: any) => result.transcript)
          .join('');
        
        onTranscript(transcript);
      };

      recognitionInstance.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        toast.error('Voice input error: ' + event.error);
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
      };

      setRecognition(recognitionInstance);
    }
  }, [onTranscript]);

  const toggleListening = () => {
    if (!recognition) {
      toast.error('Voice input is not supported in your browser');
      return;
    }

    if (isListening) {
      recognition.stop();
      setIsListening(false);
      toast.info('Voice input stopped');
    } else {
      recognition.start();
      setIsListening(true);
      toast.success('Voice input started - speak now');
    }
  };

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleListening}
      className={isListening ? 'bg-red-50 dark:bg-red-950 border-red-500' : ''}
    >
      {isListening ? (
        <MicOff className="h-[1.2rem] w-[1.2rem] text-red-600" />
      ) : (
        <Mic className="h-[1.2rem] w-[1.2rem]" />
      )}
      <span className="sr-only">Toggle voice input</span>
    </Button>
  );
}
