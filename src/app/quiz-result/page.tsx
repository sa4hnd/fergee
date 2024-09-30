'use client'

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Share2, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import html2canvas from 'html2canvas';

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
  questions: Array<{
    id: string;
    text: string;
    options: string[];
    correctAnswer: string;
  }>;
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

  const handleShare = async () => {
    const websiteUrl = 'https://quizmaster.com'; // Replace with your actual website URL
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Check out my quiz result on QuizMaster!',
          text: `I scored ${quizResult?.score}% on the ${quizResult?.subject} quiz!`,
          url: websiteUrl,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      window.open(`https://twitter.com/intent/tweet?text=I scored ${quizResult?.score}% on the ${quizResult?.subject} quiz at QuizMaster!&url=${websiteUrl}`, '_blank');
    }
  };

  const handleDownload = async () => {
    const resultElement = document.getElementById('quiz-result');
    if (resultElement) {
      const canvas = await html2canvas(resultElement, {
        backgroundColor: null,
        scale: 2,
      });
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Add semi-transparent overlay
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Add watermark
        ctx.font = '20px Arial';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('QuizMaster.com', canvas.width / 2, canvas.height - 30);
      }
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = 'quiz-result.png';
      link.click();
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center p-6">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary mb-4"></div>
            <p className="text-lg font-semibold text-primary">Loading quiz result...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center p-6">
            <p className="text-lg font-semibold text-red-500 mb-4">Error: {error}</p>
            <Button onClick={() => router.push('/')} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!quizResult || !quizResult.questions || quizResult.questions.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center p-6">
            <p className="text-lg font-semibold text-primary mb-4">No quiz result data available</p>
            <Button onClick={() => router.push('/')} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="glass border-primary rounded-3xl" id="quiz-result">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-primary">Quiz Result</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-2">Score: {quizResult.score}%</h2>
            <Progress value={quizResult.score} className="w-full" />
            <p className="mt-2">Correct Answers: {quizResult.correctAnswers} / {quizResult.totalQuestions}</p>
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
          <div className="flex flex-col md:flex-row gap-8">
            <div className="w-full md:w-3/4">
              <h3 className="text-xl font-semibold mb-4">Question Details</h3>
              <div className="bg-card p-4 rounded-lg">
                {quizResult.questions[currentQuestionIndex] && (
                  <>
                    <p className="font-semibold mb-2">Question {currentQuestionIndex + 1}</p>
                    <p className="mb-4">{quizResult.questions[currentQuestionIndex].text}</p>
                    {quizResult.questions[currentQuestionIndex].options.map((option, optionIndex) => (
                      <div
                        key={optionIndex}
                        className={cn(
                          "p-2 rounded-md mb-2",
                          option === quizResult.questions[currentQuestionIndex].correctAnswer
                            ? "bg-green-100 text-green-800"
                            : option === quizResult.answers[currentQuestionIndex.toString()]
                              ? "bg-red-100 text-red-800"
                              : "bg-gray-100 text-gray-800"
                        )}
                      >
                        {option}
                        {option === quizResult.questions[currentQuestionIndex].correctAnswer && " ✓"}
                        {option === quizResult.answers[currentQuestionIndex.toString()] && option !== quizResult.questions[currentQuestionIndex].correctAnswer && " ✗"}
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>
            <div className="w-full md:w-1/4">
              <h3 className="text-xl font-semibold mb-4">Question Navigator</h3>
              <ScrollArea className="h-[300px]">
                <div className="grid grid-cols-5 gap-2">
                  {quizResult.questions.map((question, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="icon"
                      className={cn(
                        "w-10 h-10 p-0 transition-colors duration-200 rounded-full",
                        quizResult.answers[index.toString()] === question.correctAnswer
                          ? "bg-green-500 hover:bg-green-600 text-white"
                          : "bg-red-500 hover:bg-red-600 text-white",
                        currentQuestionIndex === index && "ring-2 ring-primary"
                      )}
                      onClick={() => setCurrentQuestionIndex(index)}
                    >
                      {index + 1}
                    </Button>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>
          <div className="flex justify-between mt-8">
            <Button onClick={() => router.push('/')} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              Back to Home
            </Button>
            <div className="space-x-2">
              <Button onClick={handleShare} className="bg-blue-500 hover:bg-blue-600 text-white">
                <Share2 className="mr-2 h-4 w-4" /> Share
              </Button>
              <Button onClick={handleDownload} className="bg-green-500 hover:bg-green-600 text-white">
                <Download className="mr-2 h-4 w-4" /> Download
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}