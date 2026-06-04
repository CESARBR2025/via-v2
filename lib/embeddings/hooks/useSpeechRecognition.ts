// hooks/useSpeechRecognition.ts

"use client";

import { useEffect, useRef, useState } from "react";

export function useSpeechRecognition() {
  const recognitionRef = useRef<any>(null);

  const [isListening, setIsListening] = useState(false);

  const [transcript, setTranscript] = useState("");

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.error("SpeechRecognition no soportado");
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.lang = "es-MX";

    recognition.continuous = true;

    recognition.interimResults = true;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onresult = (event: any) => {
      let text = "";

      for (let i = 0; i < event.results.length; i++) {
        text += event.results[i][0].transcript;
      }

      setTranscript(text);
    };

    recognitionRef.current = recognition;
  }, []);

  const start = () => {
    recognitionRef.current?.start();
  };

  const stop = () => {
    recognitionRef.current?.stop();
  };

  return {
    transcript,
    isListening,
    start,
    stop,
  };
}
