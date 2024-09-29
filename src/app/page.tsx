'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Poppins } from 'next/font/google';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BookOpen, Clock, History, Settings, LogOut, Menu, Heart, X } from 'lucide-react';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const poppins = Poppins({ subsets: ['latin'], weight: ['400', '600', '700'] });

export default function HomePage() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [subjects, setSubjects] = useState<Array<{ id: string, name: string }>>([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [recentQuizzes, setRecentQuizzes] = useState<Array<any>>([]);

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

  const handleQuizClick = (quiz: { id: string }) => {
    router.push(`/quiz-result?id=${quiz.id}`);
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

      <main className="container mx-auto px-4 py-12">
        <section className="mb-16 text-center">
          <h2 className="text-4xl font-bold mb-8 text-foreground">Start a New Quiz</h2>
          <Card className="glass border-primary max-w-2xl mx-auto rounded-3xl">
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Select onValueChange={setSelectedSubject}>
                  <SelectTrigger className="rounded-full bg-green-700/50 text-green-100 border-green-600">
                    <SelectValue placeholder="Select Subject" />
                  </SelectTrigger>
                  <SelectContent className="bg-green-800 border-green-700">
                    {subjects.map((subject) => (
                      <SelectItem key={subject.id} value={subject.id}>{subject.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select onValueChange={setSelectedYear}>
                  <SelectTrigger className="rounded-full bg-primary-800/50 text-primary-100 border-primary-700">
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
                  <SelectTrigger className="rounded-full bg-primary-800/50 text-primary-100 border-primary-700">
                    <SelectValue placeholder="Select Course" />
                  </SelectTrigger>
                  <SelectContent className="dropdown-content">
                    <SelectItem value="first">First Course</SelectItem>
                    <SelectItem value="second">Second Course</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                className="w-full mt-8 bg-green-600 hover:bg-green-500 text-green-100 rounded-full shadow-lg"
                onClick={handleStartQuiz}
                disabled={!selectedSubject || !selectedYear || !selectedCourse}
              >
                Start Quiz
              </Button>
            </CardContent>
          </Card>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-bold text-primary mb-6">Recent Quizzes</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recentQuizzes.map((quiz) => (
              <div key={quiz.id} className="bg-card text-card-foreground p-4 rounded-lg shadow" onClick={() => router.push(`/quiz-result?id=${quiz.id}`)}>
                <p className="text-lg font-semibold">{quiz.subject} ({quiz.year})</p>
                <p className="text-3xl font-bold text-primary">
                  {quiz.score !== undefined ? `${quiz.score}%` : 'N/A'}
                </p>
                <p className="text-sm text-muted-foreground">{formatDate(quiz.date)}</p>
                <p className="text-sm text-muted-foreground">Course: {quiz.course}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="text-center">
          <h2 className="text-4xl font-bold mb-8 text-foreground">Quick Actions</h2>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {[
              { icon: BookOpen, title: 'Study Materials', color: 'bg-input' },
              { icon: Clock, title: 'Timed Challenges', color: 'bg-input' },
              { icon: History, title: 'Quiz History', color: 'bg-input' },
              { icon: Settings, title: 'Account Settings', color: 'bg-input' },
            ].map((action, index) => (
              <Card key={index} className="bg-card border-primary hover:shadow-lg transition-shadow duration-300 rounded-3xl">
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <div className={`${action.color} p-3 rounded-full mb-4`}>
                    <action.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-primary">{action.title}</h3>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>

      <footer className="mt-16 py-8 bg-muted">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2024 QuizMaster. All rights reserved.</p>
          <div className="mt-4 flex justify-center space-x-4">
            <a href="#" className="text-primary hover:text-primary/80 transition-colors duration-200">Terms of Service</a>
            <a href="#" className="text-primary hover:text-primary/80 transition-colors duration-200">Privacy Policy</a>
            <a href="#" className="text-primary hover:text-primary/80 transition-colors duration-200">Contact Us</a>
          </div>
        </div>
      </footer>
    </div>
  );
}