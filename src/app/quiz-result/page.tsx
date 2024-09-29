'use client'

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils'; // Add this import

interface QuizResult {
  id: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  subject: string;
  year: string;
  course: string;
  date: string;
  timeTaken: number;
  answers: { [key: string]: string };
}

export default function QuizResultPage() {
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();

  const quizId = searchParams.get('id');

  useEffect(() => {
    async function fetchQuizResult() {
      if (!quizId) {
        setError('Quiz ID is missing');
        setLoading(false);
        return;
      }

      try {
        const quizDoc = await getDoc(doc(db, 'quizResults', quizId));
        if (quizDoc.exists()) {
          setQuizResult({ id: quizDoc.id, ...quizDoc.data() } as QuizResult);
        } else {
          setError('Quiz result not found');
        }
      } catch (err) {
        setError('Error fetching quiz result');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchQuizResult();
  }, [quizId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!quizResult) {
    return <div>No quiz result found</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-primary">Quiz Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center mb-8">
            <p className="text-6xl font-bold text-primary mb-4">{quizResult.score}%</p>
            <p className="text-xl text-foreground mb-2">
              You answered {quizResult.correctAnswers} out of {quizResult.totalQuestions} questions correctly.
            </p>
            <p className="text-lg text-muted-foreground mb-2">
              Time taken: {Math.floor(quizResult.timeTaken / 60)}m {Math.round(quizResult.timeTaken % 60)}s
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div>
              <p className="text-sm text-muted-foreground">Subject</p>
              <p className="font-semibold">{quizResult.subject}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Year</p>
              <p className="font-semibold">{quizResult.year}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Course</p>
              <p className="font-semibold">{quizResult.course}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Date Taken</p>
              <p className="font-semibold">{new Date(quizResult.date).toLocaleDateString()}</p>
            </div>
          </div>
          <ScrollArea className="h-[300px] w-full mb-8">
            <div className="grid grid-cols-5 gap-2">
              {Array.from({ length: quizResult.totalQuestions }, (_, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentQuestionIndex(index)}
                  className={cn(
                    "w-10 h-10 p-0 transition-colors duration-200 rounded-full",
                    quizResult.answers[index.toString()] ? "bg-blue-500 hover:bg-blue-600 text-white" : "bg-gray-300 hover:bg-gray-400",
                    currentQuestionIndex === index && "ring-2 ring-primary"
                  )}
                >
                  {index + 1}
                </Button>
              ))}
            </div>
          </ScrollArea>
          <Button onClick={() => router.push('/')} className="w-full">
            Back to Home
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}