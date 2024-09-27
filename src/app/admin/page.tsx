'use client';

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function AdminPanel() {
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctAnswer, setCorrectAnswer] = useState('');

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

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSubject || !selectedYear || !selectedCourse || !questionText || options.some(opt => !opt) || !correctAnswer) {
      alert('Please fill in all fields');
      return;
    }

    try {
      const questionData = {
        subject: selectedSubject,
        year: selectedYear,
        course: selectedCourse,
        questionText,
        options,
        correctAnswer,
      };

      await addDoc(collection(db, 'questions'), questionData);
      alert('Question added successfully');
      // Reset form
      setQuestionText('');
      setOptions(['', '', '', '']);
      setCorrectAnswer('');
    } catch (error) {
      console.error('Error adding question:', error);
      alert('Error adding question');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Add New Question</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Select onValueChange={setSelectedSubject}>
              <SelectTrigger>
                <SelectValue placeholder="Select a subject" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((subject) => (
                  <SelectItem key={subject.id} value={subject.id}>
                    {subject.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select onValueChange={setSelectedYear}>
              <SelectTrigger>
                <SelectValue placeholder="Select a year" />
              </SelectTrigger>
              <SelectContent>
                {['2014', '2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024'].map((year) => (
                  <SelectItem key={year} value={year}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select onValueChange={setSelectedCourse}>
              <SelectTrigger>
                <SelectValue placeholder="Select a course" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="First">First</SelectItem>
                <SelectItem value="Second">Second</SelectItem>
              </SelectContent>
            </Select>

            <Textarea
              placeholder="Enter question text"
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
            />

            {options.map((option, index) => (
              <Input
                key={index}
                placeholder={`Option ${index + 1}`}
                value={option}
                onChange={(e) => handleOptionChange(index, e.target.value)}
              />
            ))}

            <Select onValueChange={setCorrectAnswer}>
              <SelectTrigger>
                <SelectValue placeholder="Select correct answer" />
              </SelectTrigger>
              <SelectContent>
                {options.map((option, index) => (
                  option && (
                    <SelectItem key={index} value={option}>
                      Option {index + 1}: {option}
                    </SelectItem>
                  )
                ))}
              </SelectContent>
            </Select>

            <Button type="submit" className="w-full">Add Question</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}