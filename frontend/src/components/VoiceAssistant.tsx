import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { useLanguage } from '@/contexts/LanguageContext';

export const VoiceAssistant: React.FC = () => {
  const { translateSync } = useLanguage();
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [lastCommand, setLastCommand] = useState<string>('');
  const [isExpanded, setIsExpanded] = useState(false);

  const handleVoiceToggle = () => {
    setIsListening(!isListening);
    // TODO: Implement actual voice recognition
    if (!isListening) {
      // Simulate listening
      setTimeout(() => {
        setIsListening(false);
        setLastCommand('ಈಗಿನ ಟೊಮೇಟೋ ಬೆಲೆ ಏನು?'); // "What is the price of tomatoes today?"
      }, 3000);
    }
  };

  const speakText = (text: string) => {
    setIsSpeaking(true);
    // TODO: Implement actual text-to-speech
    setTimeout(() => {
      setIsSpeaking(false);
    }, 2000);
  };

  return (
    <>
      {/* Main Voice Button */}
      <motion.div
        className="fixed bottom-6 right-6 z-50"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <Button
          onClick={handleVoiceToggle}
          className={`voice-button ${isListening ? 'listening' : ''} h-16 w-16 relative overflow-hidden`}
          disabled={isSpeaking}
        >
          {/* Ripple effect when listening */}
          {isListening && (
            <motion.div
              className="absolute inset-0 border-2 border-accent rounded-full"
              animate={{ scale: [1, 2, 3], opacity: [1, 0.5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          )}
          
          {isListening ? (
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.5, repeat: Infinity }}
            >
              <Mic className="h-8 w-8" />
            </motion.div>
          ) : isSpeaking ? (
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <Volume2 className="h-8 w-8" />
            </motion.div>
          ) : (
            <MicOff className="h-8 w-8" />
          )}
        </Button>
      </motion.div>

      {/* Voice Status Panel */}
      <AnimatePresence>
        {(isListening || isSpeaking || lastCommand) && (
          <motion.div
            initial={{ opacity: 0, y: 100, x: 50 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: 100, x: 50 }}
            className="fixed bottom-24 right-6 z-40"
          >
            <Card className="w-80 shadow-card bg-card/95 backdrop-blur-md">
              <CardContent className="p-4">
                {isListening && (
                  <div className="text-center">
                    <motion.div
                      className="w-16 h-16 mx-auto mb-3 bg-accent/20 rounded-full flex items-center justify-center"
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      <Mic className="h-8 w-8 text-accent" />
                    </motion.div>
                    <p className="text-sm font-medium text-primary">
                      {translateSync('Listening...')}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {translateSync('Speak in Kannada, Hindi, or English')}
                    </p>
                    
                    {/* Voice level animation */}
                    <div className="flex justify-center space-x-1 mt-3">
                      {[...Array(5)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="w-1 bg-accent rounded-full"
                          animate={{
                            height: [4, 20, 4],
                          }}
                          transition={{
                            duration: 0.8,
                            repeat: Infinity,
                            delay: i * 0.1,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {isSpeaking && (
                  <div className="text-center">
                    <motion.div
                      className="w-16 h-16 mx-auto mb-3 bg-primary/20 rounded-full flex items-center justify-center"
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    >
                      <Volume2 className="h-8 w-8 text-primary" />
                    </motion.div>
                    <p className="text-sm font-medium text-primary">
                      {translateSync('Speaking...')}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {translateSync('Playing response in your language')}
                    </p>
                  </div>
                )}

                {lastCommand && !isListening && !isSpeaking && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-primary">
                        {translateSync('Last Command')}
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => speakText(lastCommand)}
                        className="p-1 h-6 w-6"
                      >
                        <Volume2 className="h-3 w-3" />
                      </Button>
                    </div>
                    <p className="text-sm text-foreground bg-accent/10 p-2 rounded">
                      "{lastCommand}"
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {translateSync('Tap the mic to ask another question')}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Voice Commands */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed bottom-32 right-20 z-40"
          >
            <Card className="w-64 shadow-card bg-card/95 backdrop-blur-md">
              <CardContent className="p-3">
                <h4 className="text-sm font-medium mb-2">{translateSync('Quick Commands')}</h4>
                <div className="space-y-1 text-xs">
                  <div className="p-2 bg-accent/10 rounded text-muted-foreground">
                    "{translateSync('Show crop status')}"
                  </div>
                  <div className="p-2 bg-accent/10 rounded text-muted-foreground">
                    "{translateSync('Price information')}"
                  </div>
                  <div className="p-2 bg-accent/10 rounded text-muted-foreground">
                    "{translateSync('Government schemes')}"
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};