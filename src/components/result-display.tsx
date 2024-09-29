import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface ResultDisplayProps {
  score: number;
  totalQuestions: number;
  userAnswers: { [key: string]: string };
  correctAnswers: { [key: string]: string };
  questions: { id: string; text: string; options: string[] }[];
}

const motivationalQuotes = [
  "Believe you can and you're halfway there.",
  "Success is not final, failure is not fatal: it is the courage to continue that counts.",
  "The only way to do great work is to love what you do.",
  "Strive not to be a success, but rather to be of value.",
  "The future belongs to those who believe in the beauty of their dreams."
];

export function ResultDisplay({ score, totalQuestions, userAnswers, correctAnswers, questions }: ResultDisplayProps) {
  const percentage = (score / totalQuestions) * 100;
  const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Quiz Results</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <h3 className="text-lg font-semibold">Score: {score} / {totalQuestions}</h3>
          <Progress value={percentage} className="w-full mt-2" />
        </div>
        <div className="text-center italic text-muted-foreground mb-6">
          "{randomQuote}"
        </div>
        <div className="space-y-4">
          {questions.map((question, index) => (
            <div key={question.id} className="border p-4 rounded-md">
              <h4 className="font-semibold mb-2">Question {index + 1}: {question.text}</h4>
              <p className="text-sm">Your answer: {userAnswers[question.id]}</p>
              <p className="text-sm">Correct answer: {correctAnswers[question.id]}</p>
              <p className={`text-sm font-semibold ${userAnswers[question.id] === correctAnswers[question.id] ? 'text-green-500' : 'text-red-500'}`}>
                {userAnswers[question.id] === correctAnswers[question.id] ? 'Correct' : 'Incorrect'}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}