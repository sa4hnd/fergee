'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { motion } from 'framer-motion';
import { Share2, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import dynamic from 'next/dynamic';

const Html2Canvas = dynamic(() => import('html2canvas'), { ssr: false });

// Client-side only wrapper
const ClientOnly = ({ children }) => {
  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => {
    setHasMounted(true);
  }, []);
  if (!hasMounted) {
    return null;
  }
  return children;
};

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
          const data = { id: quizDoc.id, ...quizDoc.data() } as QuizResult;
          setQuizResult(data);
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
    // Implement share functionality
  };

  const handleDownload = async () => {
    if (quizResult) {
      try {
        const element = document.getElementById('quiz-result');
        if (element) {
          const canvas = await Html2Canvas(element);
          const dataURL = canvas.toDataURL('image/png');
          const link = document.createElement('a');
          link.href = dataURL;
          link.download = `quiz_result_${quizResult.id}.png`;
          link.click();
        }
      } catch (error) {
        console.error('Failed to generate image:', error);
      }
    }
  };

  const handleNextQuestion = () => {
    if (quizResult && currentQuestionIndex < quizResult.totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className='flex justify-center items-center h-screen'>
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex justify-center items-center h-screen text-red-500'>
        {error}
      </div>
    );
  }

  if (!quizResult) {
    return (
      <div className='flex justify-center items-center h-screen'>
        No quiz result found
      </div>
    );
  }

  return (
    <ClientOnly>
      <div className='min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-white p-8 flex items-center justify-center font-sans'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className='w-full max-w-4xl bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden'
          id='quiz-result'
        >
          <div className='p-8'>
            <h1 className='text-5xl font-bold mb-8 text-center bg-gradient-to-r from-green-400 to-blue-500 text-transparent bg-clip-text'>
              Quiz Result
            </h1>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-8 mb-8'>
              <motion.div
                className='bg-gray-100 dark:bg-gray-700 rounded-2xl p-6 shadow-lg'
                whileHover={{ scale: 1.05 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <p className='text-xl font-semibold mb-2'>Score</p>
                <div className='text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500'>
                  {quizResult.score.toFixed(2)}%
                </div>
              </motion.div>
              <motion.div
                className='bg-gray-100 dark:bg-gray-700 rounded-2xl p-6 shadow-lg'
                whileHover={{ scale: 1.05 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <p className='text-xl font-semibold mb-2'>Correct Answers</p>
                <div className='text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500'>
                  {quizResult.correctAnswers} / {quizResult.totalQuestions}
                </div>
              </motion.div>
            </div>
            <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-8'>
              {[
                { label: 'Subject', value: quizResult.subject },
                { label: 'Year', value: quizResult.year },
                { label: 'Course', value: quizResult.course },
                { label: 'Date Taken', value: formatDate(quizResult.date) },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  className='bg-gray-100 dark:bg-gray-700 rounded-xl p-4 shadow-md'
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <p className='text-sm text-gray-500 dark:text-gray-400'>
                    {item.label}
                  </p>
                  <p className='text-lg font-semibold'>{item.value}</p>
                </motion.div>
              ))}
            </div>
            <motion.div
              className='mb-8 bg-gray-100 dark:bg-gray-700 rounded-2xl p-6 shadow-lg'
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className='text-2xl font-bold mb-4'>Question Details</h2>
              <div className='space-y-4'>
                <p className='text-xl font-semibold'>
                  Question {currentQuestionIndex + 1}
                </p>
                <p className='text-lg mb-4'>
                  {quizResult.questions[currentQuestionIndex].text}
                </p>
                <div className='space-y-3'>
                  {quizResult.questions[currentQuestionIndex].options.map(
                    (option, index) => (
                      <motion.div
                        key={index}
                        className={`p-3 rounded-lg ${
                          option ===
                          quizResult.questions[currentQuestionIndex]
                            .correctAnswer
                            ? 'bg-green-500 text-white'
                            : option ===
                                quizResult.answers[
                                  currentQuestionIndex.toString()
                                ]
                              ? 'bg-red-500 text-white'
                              : 'bg-gray-200 dark:bg-gray-600'
                        }`}
                        whileHover={{ scale: 1.02 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                      >
                        {option}
                        {option ===
                          quizResult.questions[currentQuestionIndex]
                            .correctAnswer && (
                          <motion.span
                            className='ml-2 inline-block'
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{
                              type: 'spring',
                              stiffness: 500,
                              delay: 0.2,
                            }}
                          >
                            ✓
                          </motion.span>
                        )}
                        {option ===
                          quizResult.answers[currentQuestionIndex.toString()] &&
                          option !==
                            quizResult.questions[currentQuestionIndex]
                              .correctAnswer && (
                            <motion.span
                              className='ml-2 inline-block'
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{
                                type: 'spring',
                                stiffness: 500,
                                delay: 0.2,
                              }}
                            >
                              ✗
                            </motion.span>
                          )}
                      </motion.div>
                    ),
                  )}
                </div>
              </div>
            </motion.div>
            <div className='flex justify-between items-center mb-8'>
              <motion.button
                onClick={handlePrevQuestion}
                disabled={currentQuestionIndex === 0}
                className='p-2 rounded-full bg-gray-200 dark:bg-gray-700 disabled:opacity-50 shadow-md'
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <ChevronLeft size={24} />
              </motion.button>
              <div className='flex space-x-2'>
                {Array.from({ length: quizResult.totalQuestions }).map(
                  (_, index) => (
                    <motion.button
                      key={index}
                      onClick={() => setCurrentQuestionIndex(index)}
                      className={`w-10 h-10 rounded-full shadow-md ${
                        currentQuestionIndex === index
                          ? 'bg-gradient-to-r from-green-400 to-blue-500'
                          : quizResult.answers[index.toString()] ===
                              quizResult.questions[index].correctAnswer
                            ? 'bg-green-500'
                            : quizResult.answers[index.toString()] !== undefined
                              ? 'bg-red-500'
                              : 'bg-gray-200 dark:bg-gray-700'
                      }`}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      {index + 1}
                    </motion.button>
                  ),
                )}
              </div>
              <motion.button
                onClick={handleNextQuestion}
                disabled={
                  currentQuestionIndex === quizResult.totalQuestions - 1
                }
                className='p-2 rounded-full bg-gray-200 dark:bg-gray-700 disabled:opacity-50 shadow-md'
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <ChevronRight size={24} />
              </motion.button>
            </div>
            <div className='flex flex-col sm:flex-row justify-between items-center'>
              <motion.button
                onClick={() => router.push('/')}
                className='px-6 py-3 bg-gray-200 dark:bg-gray-700 rounded-lg shadow-md mb-4 sm:mb-0 w-full sm:w-auto'
                whileHover={{ scale: 1.05, backgroundColor: '#4A5568' }}
                whileTap={{ scale: 0.95 }}
              >
                Back to Home
              </motion.button>
              <div className='flex space-x-4 w-full sm:w-auto'>
                <motion.button
                  onClick={handleShare}
                  className='px-6 py-3 bg-blue-600 rounded-lg shadow-md flex items-center justify-center w-full sm:w-auto'
                  whileHover={{ scale: 1.05, backgroundColor: '#3182CE' }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Share2 size={20} className='mr-2' /> Share
                </motion.button>
                <motion.button
                  onClick={handleDownload}
                  className='px-6 py-3 bg-green-600 rounded-lg shadow-md flex items-center justify-center w-full sm:w-auto'
                  whileHover={{ scale: 1.05, backgroundColor: '#38A169' }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Download size={20} className='mr-2' /> Download
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </ClientOnly>
  );
}
