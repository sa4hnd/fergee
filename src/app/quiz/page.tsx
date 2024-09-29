'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
import { useLocalStorage } from '@/hooks/useLocalStorage';

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
  const [currentQuestionIndex, setCurrentQuestionIndex] = useLocalStorage<number>(`currentQuestionIndex-${subject}-${year}-${course}`, 0);
  const [answers, setAnswers] = useLocalStorage<{ [key: number]: string }>(`quizAnswers-${subject}-${year}-${course}`, {});
  const [flaggedQuestions, setFlaggedQuestions] = useLocalStorage<number[]>(`flaggedQuestions-${subject}-${year}-${course}`, []);
  const [timeLeft, setTimeLeft] = useLocalStorage<number>(`timeLeft-${subject}-${year}-${course}`, 7200); // 2 hours in seconds
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizResults, setQuizResults] = useState({
    score: 0,
    totalQuestions: 0,
    correctAnswers: 0,
  });
  const [quizStarted, setQuizStarted] = useLocalStorage<boolean>(`quizStarted-${subject}-${year}-${course}`, false);
  const [startTime, setStartTime] = useLocalStorage<string | null>(`startTime-${subject}-${year}-${course}`, null);

  const progress = useMemo(() => {
    return questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;
  }, [currentQuestionIndex, questions.length]);

  const currentQuestion = useMemo(() => {
    return questions[currentQuestionIndex] || null;
  }, [questions, currentQuestionIndex]);

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
    if (quizStarted && startTime) {
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
    }
  }, [quizStarted, startTime]);

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
    setAnswers(prev => ({ ...prev, [currentQuestionIndex]: answer }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const toggleFlagQuestion = () => {
    setFlaggedQuestions(prev => {
      if (prev.includes(currentQuestionIndex)) {
        return prev.filter(index => index !== currentQuestionIndex);
      } else {
        return [...prev, currentQuestionIndex];
      }
    });
  };

  const handleSubmit = async () => {
    const score = questions.reduce((acc, question, index) => {
      return acc + (answers[index] === question.correctAnswer ? 1 : 0);
    }, 0);

    const totalQuestions = questions.length;
    const correctAnswers = score;

    const quizResult = {
      subject,
      year,
      course,
      score: Math.round((score / totalQuestions) * 100),
      totalQuestions,
      correctAnswers,
      date: new Date().toISOString(),
      timeTaken: 7200 - timeLeft,
      answers
    };

    try {
      const docRef = await addDoc(collection(db, 'quizResults'), quizResult);
      setQuizResults({
        score: Math.round((score / totalQuestions) * 100),
        totalQuestions,
        correctAnswers
      });
      setQuizCompleted(true);
      setIsSubmitted(true);

      // Clear local storage after successful submission
      localStorage.removeItem(`currentQuestionIndex-${subject}-${year}-${course}`);
      localStorage.removeItem(`quizAnswers-${subject}-${year}-${course}`);
      localStorage.removeItem(`flaggedQuestions-${subject}-${year}-${course}`);
      localStorage.removeItem(`timeLeft-${subject}-${year}-${course}`);
      localStorage.removeItem(`quizStarted-${subject}-${year}-${course}`);
      localStorage.removeItem(`startTime-${subject}-${year}-${course}`);

      router.push(`/quiz-result?id=${docRef.id}`);
    } catch (error) {
      console.error("Error submitting quiz: ", error);
    }
  };

  const startQuiz = () => {
    setQuizStarted(true);
    setStartTime(new Date().toISOString());
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-background">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
        <p className="mt-4 text-xl font-semibold text-primary">{motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]}</p>
      </div>
    );
  }

  if (!quizStarted) {
    return (
      <div className={`min-h-screen bg-background ${poppins.className} flex items-center justify-center`}>
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">Ready to Start?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center mb-4">You're about to start a quiz on {subject} ({year}, {course}).</p>
            <p className="text-center mb-4">You'll have 2 hours to complete the quiz.</p>
          </CardContent>
          <CardFooter>
            <Button onClick={startQuiz} className="w-full">Start Quiz</Button>
          </CardFooter>
        </Card>
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
                <p className="text-lg text-muted-foreground mb-2">
                  Time taken: {Math.floor(quizResults.timeTaken / 60)}m {Math.round(quizResults.timeTaken % 60)}s
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

  if (!currentQuestion) {
    return <div>No questions available</div>;
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
                onClick={() => toggleFlagQuestion()}
                className={cn(
                  "transition-colors duration-200 rounded-full",
                  flaggedQuestions.includes(currentQuestionIndex)
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/90"
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
                            flaggedQuestions.includes(index) && "bg-accent hover:bg-accent/90 text-accent-foreground"
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
                      <span>{flaggedQuestions.length}</span>
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