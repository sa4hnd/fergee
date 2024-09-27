'use client';

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BookOpen, Clock, History, Settings, LogOut } from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [subjects, setSubjects] = useState([]);
  const [years, setYears] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const router = useRouter();

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

    fetchSubjects();
  }, []);

  useEffect(() => {
    if (selectedSubject) {
      // Fetch years based on selected subject
      // This is a placeholder. Implement actual fetching logic.
      setYears(['2021', '2022', '2023', '2024']);
    }
  }, [selectedSubject]);

  useEffect(() => {
    if (selectedYear) {
      // Update courses to only include 'First' and 'Second'
      setCourses(['First', 'Second']);
    }
  }, [selectedSubject, selectedYear]);

  const handleStartQuiz = () => {
    if (selectedSubject && selectedYear && selectedCourse) {
      router.push(`/quiz?subject=${selectedSubject}&year=${selectedYear}&course=${selectedCourse}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100" style={{backgroundImage: 'radial-gradient(circle, #ffffff0a 1px, transparent 1px)', backgroundSize: '20px 20px'}}>
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-blue-400">QuizMaster</h1>
          <nav className="hidden md:flex space-x-4">
            <Button variant="ghost" className="text-gray-300 hover:text-blue-400 rounded-md">Dashboard</Button>
            <Button variant="ghost" className="text-gray-300 hover:text-blue-400 rounded-md">My Quizzes</Button>
            <Button variant="ghost" className="text-gray-300 hover:text-blue-400 rounded-md">Leaderboard</Button>
          </nav>
          <div className="flex items-center space-x-4">
            <Avatar>
              <AvatarImage src="/placeholder.svg?height=32&width=32" alt="User" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <Button variant="ghost" size="icon" className="rounded-md">
              <LogOut className="h-5 w-5 text-gray-300 hover:text-blue-400" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <section className="mb-12 text-center">
          <h2 className="text-3xl font-bold mb-6 text-blue-400">Start a New Quiz</h2>
          <Card className="bg-gray-900/50 backdrop-blur-sm border-gray-800 max-w-2xl mx-auto">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Select onValueChange={setSelectedSubject}>
                  <SelectTrigger className="rounded-md">
                    <SelectValue placeholder="Select Subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((subject) => (
                      <SelectItem key={subject.id} value={subject.id}>
                        {subject.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select onValueChange={setSelectedYear} disabled={!selectedSubject}>
                  <SelectTrigger className="rounded-md">
                    <SelectValue placeholder="Select Year" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((year) => (
                      <SelectItem key={year} value={year}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select onValueChange={setSelectedCourse} disabled={!selectedYear}>
                  <SelectTrigger className="rounded-md">
                    <SelectValue placeholder="Select Course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((course) => (
                      <SelectItem key={course} value={course}>
                        {course}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button 
                onClick={handleStartQuiz} 
                disabled={!selectedSubject || !selectedYear || !selectedCourse}
                className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
              >
                Start Quiz
              </Button>
            </CardContent>
          </Card>
        </section>

        <section className="mb-12 text-center">
          <h2 className="text-3xl font-bold mb-6 text-blue-400">Recent Quizzes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {[
              { title: 'Mathematics 2023', score: '85%', date: '2023-09-15' },
              { title: 'Science 2022', score: '92%', date: '2023-09-10' },
              { title: 'History 2021', score: '78%', date: '2023-09-05' },
            ].map((quiz, index) => (
              <Card key={index} className="bg-gray-900/50 backdrop-blur-sm border-gray-800">
                <CardHeader>
                  <CardTitle className="text-blue-400">{quiz.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-green-500">{quiz.score}</p>
                  <p className="text-sm text-gray-400">{quiz.date}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="text-center">
          <h2 className="text-3xl font-bold mb-6 text-blue-400">Quick Actions</h2>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {[
              { icon: BookOpen, title: 'Study Materials', color: 'bg-purple-600' },
              { icon: Clock, title: 'Timed Challenges', color: 'bg-green-600' },
              { icon: History, title: 'Quiz History', color: 'bg-yellow-600' },
              { icon: Settings, title: 'Account Settings', color: 'bg-red-600' },
            ].map((action, index) => (
              <Card key={index} className="bg-gray-900/50 backdrop-blur-sm border-gray-800">
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <div className={`${action.color} p-3 rounded-full mb-4`}>
                    <action.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-200">{action.title}</h3>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-gray-800 mt-12 py-6 bg-gray-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 text-center text-gray-400">
          &copy; 2024 QuizMaster. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
