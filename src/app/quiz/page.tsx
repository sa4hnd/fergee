'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Poppins } from 'next/font/google';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronLeft, ChevronRight, Flag, Clock, CheckCircle } from 'lucide-react';
import { cn } from "@/lib/utils";
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import confetti from 'canvas-confetti';

const poppins = Poppins({ subsets: ['latin'], weight: ['400', '600', '700'] });

interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: string;
}

const motivationalQuotes = [
  "Believe you can and you're halfway there.",
  "Success is not final, failure is not fatal: it is the courage to continue that counts.",
  "The only way to do great work is to love what you do.",
  "Strive not to be a success, but rather to be of value.",
  "The future belongs to those who believe in the beauty of their dreams."
];


export default function QuizPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const subject = searchParams.get('subject');
  const year = searchParams.get('year');
  const course = searchParams.get('course');

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<number>>(new Set());
  const [timeLeft, setTimeLeft] = useState(7200); // 2 hours in seconds
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizResults, setQuizResults] = useState({
    score: 0,
    totalQuestions: 0,
    correctAnswers: 0,
  });

  useEffect(() => {
    const fetchQuestions = async () => {
      if (subject && year && course) {
        const q = query(
          collection(db, 'questions'),
          where('subject', '==', subject),
          where('year', '==', year),
          where('course', '==', course)
        );
        const querySnapshot = await getDocs(q);
        const fetchedQuestions = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Question));
        setQuestions(fetchedQuestions);
        setIsLoading(false);
      }
    };

    fetchQuestions();
  }, [subject, year, course]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (quizCompleted) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [quizCompleted]);

  const handleAnswer = (answer: string) => {
    setAnswers({ ...answers, [currentQuestionIndex]: answer });
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitted(true);

    // Calculate results
    const totalQuestions = questions.length;
    const correctAnswers = questions.reduce((acc, question, index) => {
      return acc + (answers[index] === question.correctAnswer ? 1 : 0);
    }, 0);
    const score = Math.round((correctAnswers / totalQuestions) * 100);

    setQuizResults({
      score,
      totalQuestions,
      correctAnswers,
    });

    // Save results to Firestore
    try {
      await addDoc(collection(db, 'quizResults'), {
        subject,
        year,
        course,
        score,
        totalQuestions,
        correctAnswers,
        date: new Date(),
        // Add user ID here when authentication is implemented
      });
    } catch (error) {
      console.error("Error saving quiz results:", error);
    }

    setQuizCompleted(true);
  };

  const toggleFlagQuestion = (index: number) => {
    setFlaggedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((Object.keys(answers).length) / questions.length) * 100;

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-background">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
        <p className="mt-4 text-xl font-semibold text-primary">{motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]}</p>
      </div>
    );
  }

  if (quizCompleted) {
    return (
      <div className={`min-h-screen bg-background ${poppins.className}`}>
        <div className="container mx-auto px-4 py-8">
          <Card className="glass border-primary rounded-3xl">
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-primary">Quiz Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-8">
                <p className="text-6xl font-bold text-primary mb-4">{quizResults.score}%</p>
                <p className="text-xl text-foreground mb-2">
                  You answered {quizResults.correctAnswers} out of {quizResults.totalQuestions} questions correctly.
                </p>
                <p className="text-lg text-muted-foreground italic">
                  {motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]}
                </p>
              </div>
              <ScrollArea className="h-[300px] w-full">
                <div className="grid grid-cols-5 gap-2">
                  {questions.map((question, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="icon"
                      onClick={() => setCurrentQuestionIndex(index)}
                      className={cn(
                        "w-10 h-10 p-0 transition-colors duration-200 rounded-full",
                        answers[index] === question.correctAnswer
                          ? "bg-green-500 hover:bg-green-600 text-white"
                          : "bg-red-500 hover:bg-red-600 text-white",
                        currentQuestionIndex === index && "ring-2 ring-primary"
                      )}
                    >
                      {index + 1}
                    </Button>
                  ))}
                </div>
              </ScrollArea>
              <div className="mt-8">
                <h3 className="text-xl font-semibold text-primary mb-4">Question Review</h3>
                <div className="bg-card p-4 rounded-lg">
                  <p className="text-lg font-medium text-card-foreground mb-2">{questions[currentQuestionIndex].text}</p>
                  {questions[currentQuestionIndex].options.map((option, index) => (
                    <p
                      key={index}
                      className={cn(
                        "py-2 px-4 rounded-md mb-2",
                        option === questions[currentQuestionIndex].correctAnswer
                          ? "bg-green-100 text-green-800"
                          : option === answers[currentQuestionIndex]
                            ? "bg-red-100 text-red-800"
                            : "bg-secondary text-secondary-foreground"
                      )}
                    >
                      {option}
                    </p>
                  ))}
                </div>
              </div>
              <Button
                className="mt-8 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full"
                onClick={() => router.push('/')}
              >
                Return to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-background ${poppins.className}`}>
      <div className="container mx-auto px-4 py-8">
        <Card className="glass border-primary rounded-3xl">
          <CardHeader className="flex flex-col sm:flex-row justify-between items-center">
            <CardTitle className="text-3xl font-bold text-primary mb-4 sm:mb-0">Quiz: {subject} ({year}, {course})</CardTitle>
            <div className="flex items-center space-x-4">
              <div className="text-lg font-semibold text-primary flex items-center">
                <Clock className="mr-2 h-5 w-5" />
                {formatTime(timeLeft)}
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => toggleFlagQuestion(currentQuestionIndex)}
                className={cn(
                  "transition-colors duration-200 rounded-full",
                  flaggedQuestions.has(currentQuestionIndex) ? "bg-primary text-primary-foreground hover:bg-primary/90" : "bg-secondary text-secondary-foreground hover:bg-secondary/90"
                )}
              >
                <Flag className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col lg:flex-row gap-8">
            <div className="lg:w-3/4">
              <Progress value={progress} className="mb-8 h-2 bg-secondary" />
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentQuestionIndex}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <h2 className="text-2xl font-semibold mb-4 text-primary">{currentQuestion.text}</h2>
                  <div className="space-y-4">
                    {currentQuestion.options.map((option, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left py-6 px-4 rounded-xl transition-colors duration-200",
                          answers[currentQuestionIndex] === option
                            ? "bg-primary text-primary-foreground hover:bg-primary/90"
                            : "bg-secondary text-secondary-foreground hover:bg-secondary/90"
                        )}
                        onClick={() => handleAnswer(option)}
                      >
                        {option}
                      </Button>
                    ))}
                  </div>
                </motion.div>
              </AnimatePresence>
              <div className="flex justify-between mt-8">
                <Button onClick={handlePrevious} disabled={currentQuestionIndex === 0} className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full">
                  <ChevronLeft className="mr-2 h-4 w-4" /> Previous
                </Button>
                {currentQuestionIndex === questions.length - 1 ? (
                  <Button onClick={handleSubmit} className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full">
                    Submit Quiz
                  </Button>
                ) : (
                  <Button onClick={handleNext} className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full">
                    Next <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
            <div className="lg:w-1/4">
              <Card className="glass border-primary rounded-3xl">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-primary">Question Navigator</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[300px] w-full">
                    <div className="grid grid-cols-5 gap-2">
                      {questions.map((_, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="icon"
                          onClick={() => setCurrentQuestionIndex(index)}
                          className={cn(
                            "w-10 h-10 p-0 transition-colors duration-200 rounded-full",
                            currentQuestionIndex === index && "border-primary",
                            answers[index] && "bg-primary hover:bg-primary/90 text-primary-foreground",
                            flaggedQuestions.has(index) && "bg-accent hover:bg-accent/90 text-accent-foreground"
                          )}
                        >
                          {index + 1}
                        </Button>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
                <CardFooter>
                  <div className="w-full text-sm text-muted-foreground">
                    <div className="flex items-center justify-between mb-2">
                      <span>Answered</span>
                      <span>{Object.keys(answers).length} / {questions.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Flagged</span>
                      <span>{flaggedQuestions.size}</span>
                    </div>
                  </div>
                </CardFooter>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
      {isSubmitted && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-background/50 flex items-center justify-center"
        >
          <Card className="glass border-primary max-w-md w-full rounded-3xl">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-primary">Quiz Submitted</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center">
                <CheckCircle className="text-primary w-16 h-16 mb-4" />
                <p className="text-center text-foreground">
                  Your quiz has been successfully submitted. Thank you for completing the test!
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-center">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full">
                Return to Dashboard
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      )}
    </div>
  );
}