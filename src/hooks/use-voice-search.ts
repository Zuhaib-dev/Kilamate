import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";


interface UseVoiceSearchReturn {
  isListening: boolean;
  isSupported: boolean;
  transcript: string;
  startListening: () => void;
  stopListening: () => void;
}

export function useVoiceSearch(onResult: (city: string) => void): UseVoiceSearchReturn {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef<any>(null);

  // Check browser support
  const isSupported = typeof window !== "undefined" && (
    "SpeechRecognition" in window || "webkitSpeechRecognition" in window
  );

  // Extract a city name from raw speech transcript
  const extractCityName = useCallback((raw: string): string => {
    const fillerPhrases = [
      "what's the weather in",
      "what is the weather in",
      "show me weather for",
      "weather in",
      "weather for",
      "search for",
      "search",
      "check weather in",
      "show me",
      "what's it like in",
      "how is the weather in",
      "find",
    ];
    let result = raw.toLowerCase().trim();
    for (const phrase of fillerPhrases) {
      if (result.startsWith(phrase)) {
        result = result.slice(phrase.length).trim();
        break;
      }
    }
    // Capitalize words
    return result
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  }, []);

  useEffect(() => {
    if (!isSupported) return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const raw = event.results[0][0].transcript;
      setTranscript(raw);
      const city = extractCityName(raw);
      if (city.length >= 2) {
        toast.info(`🎙️ Searching for: "${city}"`, { duration: 2000 });
        onResult(city);
      } else {
        toast.warning("Couldn't understand the city name. Please try again.");
      }
    };

    recognition.onerror = (event: any) => {
      setIsListening(false);
      if (event.error === "not-allowed") {
        toast.error("Microphone access denied. Please allow it in your browser settings.");
      } else if (event.error === "no-speech") {
        toast.warning("No speech detected. Try again.");
      } else {
        toast.error(`Voice error: ${event.error}`);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.abort();
    };
  }, [isSupported, extractCityName, onResult]);

  const startListening = useCallback(() => {
    if (!isSupported) {
      toast.error("Voice search is not supported in your browser.");
      return;
    }
    if (recognitionRef.current && !isListening) {
      setTranscript("");
      try {
        recognitionRef.current.start();
      } catch {
        // Already started
      }
    }
  }, [isSupported, isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  }, [isListening]);

  return { isListening, isSupported, transcript, startListening, stopListening };
}
