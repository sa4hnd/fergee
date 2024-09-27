'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface Question {
  id: string;
  questionText: string;
  options: string[];
  correctAnswer: string;
}

export default function QuizPage() {
  const searchParams = useSearchParams();
  const subject = searchParams.get('subject');
  const year = searchParams.get('year');
  const course = searchParams.get('course');

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [userAnswers, setUserAnswers] = useState<string[]>([]);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    const fetchQuestions = async () => {
      if (!subject || !year || !course) return;

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
      })) as Question[];

      setQuestions(fetchedQuestions);
    };

    fetchQuestions();
  }, [subject, year, course]);

  const handleAnswerSelect = (value: string) => {
    setSelectedAnswer(value);
  };

  const handleNextQuestion = () => {
    if (selectedAnswer) {
      setUserAnswers([...userAnswers, selectedAnswer]);
      setSelectedAnswer('');

      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
        completeQuiz();
      }
    }
  };

  const completeQuiz = () => {
    const finalAnswers = [...userAnswers, selectedAnswer];
    const finalScore = questions.reduce((acc, question, index) => {
      return acc + (question.correctAnswer === finalAnswers[index] ? 1 : 0);
    }, 0);

    setScore(finalScore);
    setQuizCompleted(true);
  };

  if (questions.length === 0) {
    return <div className="text-center mt-8">Loading questions...</div>;
  }

  if (quizCompleted) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="w-full max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Quiz Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold mb-4">Your Score: {score} / {questions.length}</p>
            <p className="mb-4">Percentage: {((score / questions.length) * 100).toFixed(2)}%</p>
            {questions.map((question, index) => (
              <div key={question.id} className="mb-4">
                <p className="font-semibold">{index + 1}. {question.questionText}</p>
                <p className="text-green-500">Correct Answer: {question.correctAnswer}</p>
                <p className={userAnswers[index] === question.correctAnswer ? "text-green-500" : "text-red-500"}>
                  Your Answer: {userAnswers[index]}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Question {currentQuestionIndex + 1} of {questions.length}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg mb-4">{currentQuestion.questionText}</p>
          <RadioGroup onValueChange={handleAnswerSelect} value={selectedAnswer}>
            {currentQuestion.options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2 mb-2">
                <RadioGroupItem value={option} id={`option-${index}`} />
                <Label htmlFor={`option-${index}`}>{option}</Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={handleNextQuestion} 
            disabled={!selectedAnswer}
            className="w-full"
          >
            {currentQuestionIndex === questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}