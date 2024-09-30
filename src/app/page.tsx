'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Poppins } from 'next/font/google';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, LogOut, Menu, X, BookOpen, Clock, History, Settings, ChevronUp, ChevronDown, Moon, Sun } from 'lucide-react';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { cn } from '@/lib/utils';
import { useTheme } from "next-themes";

const poppins = Poppins({ subsets: ['latin'], weight: ['400', '600', '700'] });

export default function HomePage() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [subjects, setSubjects] = useState<Array<{ id: string, name: string }>>([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [recentQuizzes, setRecentQuizzes] = useState<Array<any>>([]);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const fetchSubjects = async () => {
      const subjectsCollection = collection(db, 'subjects');
      const subjectsSnapshot = await getDocs(subjectsCollection);
      const subjectsList = subjectsSnapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name,
      }));
      setSubjects(subjectsList);
    };

    const fetchRecentQuizzes = async () => {
      const q = query(collection(db, 'quizResults'), orderBy('date', 'desc'), limit(3));
      const querySnapshot = await getDocs(q);
      const quizzes = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          subject: data.subject || 'Unknown',
          year: data.year || 'N/A',
          score: data.score || 0,
          date: data.date,
          course: data.course || 'N/A'
        };
      });
      console.log("Fetched recent quizzes:", quizzes);
      setRecentQuizzes(quizzes);
    };

    fetchSubjects();
    fetchRecentQuizzes();
  }, []);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 2013 }, (_, i) => 2014 + i);

  const handleStartQuiz = () => {
    if (selectedSubject && selectedYear && selectedCourse) {
      router.push(`/quiz?subject=${selectedSubject}&year=${selectedYear}&course=${selectedCourse}`);
    }
  };

  const formatDate = (date: any) => {
    if (date instanceof Date) {
      return date.toLocaleDateString();
    } else if (date && typeof date.toDate === 'function') {
      return date.toDate().toLocaleDateString();
    } else if (date) {
      return new Date(date).toLocaleDateString();
    }
    return 'Unknown Date';
  };

  const handleQuizClick = (quiz: any) => {
    router.push(`/quiz-result?id=${quiz.id}`);
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <div className={`min-h-screen bg-background ${poppins.className}`}>
      <header className="sticky top-0 z-10 glass">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary flex items-center">
            <Heart className="mr-2 h-6 w-6 fill-primary" /> QuizMaster
          </h1>
          <nav className="hidden md:flex space-x-4">
            <Button variant="ghost" className="text-primary hover:text-primary-foreground hover:bg-primary rounded-full transition-colors duration-200">Dashboard</Button>
            <Button variant="ghost" className="text-primary hover:text-primary-foreground hover:bg-primary rounded-full transition-colors duration-200">My Quizzes</Button>
            <Button variant="ghost" className="text-primary hover:text-primary-foreground hover:bg-primary rounded-full transition-colors duration-200">Leaderboard</Button>
          </nav>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="rounded-full" onClick={toggleTheme}>
              {theme === "dark" ? (
                <Sun className="h-5 w-5 text-primary hover:text-primary-foreground transition-colors duration-200" />
              ) : (
                <Moon className="h-5 w-5 text-primary hover:text-primary-foreground transition-colors duration-200" />
              )}
            </Button>
            <Avatar>
              <AvatarImage src="/placeholder.svg?height=32&width=32" alt="User" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <Button variant="ghost" size="icon" className="rounded-full">
              <LogOut className="h-5 w-5 text-primary hover:text-primary-foreground transition-colors duration-200" />
            </Button>
            <Button variant="ghost" size="icon" className="md:hidden rounded-full" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="h-5 w-5 text-primary" /> : <Menu className="h-5 w-5 text-primary" />}
            </Button>
          </div>
        </div>
        {mobileMenuOpen && (
          <nav className="md:hidden flex flex-col space-y-2 p-4 bg-card border-t border-primary">
            <Button variant="ghost" className="text-primary hover:text-primary-foreground justify-start rounded-full">Dashboard</Button>
            <Button variant="ghost" className="text-primary hover:text-primary-foreground justify-start rounded-full">My Quizzes</Button>
            <Button variant="ghost" className="text-primary hover:text-primary-foreground justify-start rounded-full">Leaderboard</Button>
          </nav>
        )}
      </header>

      <main className="container mx-auto px-6 py-16">
        <section className="mb-20 text-center">
          <h2 className="text-5xl font-bold mb-10 text-foreground">Start a New Quiz</h2>
          <Card className="glass border-primary max-w-2xl mx-auto rounded-3xl shadow-lg">
            <CardContent className="p-10">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <Select onValueChange={setSelectedSubject}>
                  <SelectTrigger className="rounded-xl bg-green-700/50 text-green-100 border-green-600 h-14 text-lg">
                    <SelectValue placeholder="Select Subject" />
                  </SelectTrigger>
                  <SelectContent className="bg-green-800 border-green-700">
                    {subjects.map((subject) => (
                      <SelectItem key={subject.id} value={subject.id}>{subject.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select onValueChange={setSelectedYear}>
                  <SelectTrigger className="rounded-xl bg-primary-800/50 text-primary-100 border-primary-700 h-14 text-lg">
                    <SelectValue placeholder="Select Year" />
                  </SelectTrigger>
                  <SelectContent className="dropdown-content">
                    {years.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select onValueChange={setSelectedCourse}>
                  <SelectTrigger className="rounded-xl bg-primary-800/50 text-primary-100 border-primary-700 h-14 text-lg">
                    <SelectValue placeholder="Select Course" />
                  </SelectTrigger>
                  <SelectContent className="dropdown-content">
                    <SelectItem value="first">First Course</SelectItem>
                    <SelectItem value="second">Second Course</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                className="w-full mt-10 bg-green-600 hover:bg-green-500 text-green-100 rounded-xl shadow-lg h-14 text-xl font-semibold transition-colors duration-300"
                onClick={handleStartQuiz}
                disabled={!selectedSubject || !selectedYear || !selectedCourse}
              >
                Start Quiz
              </Button>
            </CardContent>
          </Card>
        </section>

        <section className="mb-20">
          <h2 className="text-4xl font-bold text-primary mb-8">Recent Quizzes</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recentQuizzes.map((quiz) => (
              <Card
                key={quiz.id}
                className="bg-card text-card-foreground hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:scale-105"
                onClick={() => handleQuizClick(quiz)}
              >
                <CardHeader>
                  <CardTitle>{quiz.subject} ({quiz.year})</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-primary mb-2">
                    {quiz.score !== undefined ? `${quiz.score}%` : 'N/A'}
                    {quiz.score > 70 ? <ChevronUp className="inline-block ml-2 text-green-500" /> : <ChevronDown className="inline-block ml-2 text-red-500" />}
                  </p>
                  <p className="text-sm text-muted-foreground">Date: {formatDate(quiz.date)}</p>
                  <p className="text-sm text-muted-foreground">Course: {quiz.course}</p>
                  <p className="text-sm text-muted-foreground">Correct Answers: {quiz.correctAnswers} / {quiz.totalQuestions}</p>
                </CardContent>
                <CardFooter>
                  <Button
                    variant="outline"
                    className="w-full hover:bg-primary hover:text-primary-foreground transition-colors duration-300"
                  >
                    View Results
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </section>

        <section className="text-center mb-20">
          <h2 className="text-4xl font-bold mb-10 text-foreground">Quick Actions</h2>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {[
              { icon: BookOpen, title: 'Study Materials', color: 'bg-blue-100 dark:bg-blue-900' },
              { icon: Clock, title: 'Timed Challenges', color: 'bg-green-100 dark:bg-green-900' },
              { icon: History, title: 'Quiz History', color: 'bg-yellow-100 dark:bg-yellow-900' },
              { icon: Settings, title: 'Account Settings', color: 'bg-purple-100 dark:bg-purple-900' },
            ].map((action, index) => (
              <Card key={index} className="bg-card border-primary hover:shadow-xl transition-shadow duration-300 rounded-3xl overflow-hidden group">
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <div className={`${action.color} p-4 rounded-full mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <action.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-primary group-hover:text-primary-600 transition-colors duration-300">{action.title}</h3>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>

      <footer className="mt-16 py-10 bg-muted border-t border-primary/20">
        <div className="container mx-auto px-6 text-center text-muted-foreground">
          <p>&copy; 2024 QuizMaster. All rights reserved.</p>
          <div className="mt-6 flex justify-center space-x-6">
            <a href="#" className="text-primary hover:text-primary-600 transition-colors duration-200 hover:underline">Terms of Service</a>
            <a href="#" className="text-primary hover:text-primary-600 transition-colors duration-200 hover:underline">Privacy Policy</a>
            <a href="#" className="text-primary hover:text-primary-600 transition-colors duration-200 hover:underline">Contact Us</a>
          </div>
        </div>
      </footer>
    </div>
  );
}