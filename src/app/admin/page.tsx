'use client';

import React, { useState, useEffect } from 'react';
import { Poppins } from 'next/font/google';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { collection, getDocs, addDoc, query, where, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Note: Using Poppins font for the admin page
const poppins = Poppins({ subsets: ['latin'], weight: ['400', '600', '700'] });

// Note: Interface for the Question type
interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: string;
  subject: string;
  year: string;
  course: string;
}

export default function AdminPage() {
  // Note: State management for questions, new question form, and filters
  const [questions, setQuestions] = useState<Question[]>([]);
  const [newQuestion, setNewQuestion] = useState({
    text: '',
    options: ['', '', '', ''],
    correctAnswer: '',
    subject: '',
    year: '',
    course: '',
  });
  const [subjects, setSubjects] = useState<string[]>([]);
  const [years] = useState<string[]>(Array.from({ length: new Date().getFullYear() - 2013 }, (_, i) => (2014 + i).toString()));
  const [courses] = useState<string[]>(['first', 'second']);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');

  // Note: Fetch questions and subjects on component mount
  useEffect(() => {
    fetchQuestions();
    fetchSubjects();
  }, []);

  // Note: Function to fetch questions from Firestore
  const fetchQuestions = async () => {
    const questionsCollection = collection(db, 'questions');
    const questionsSnapshot = await getDocs(questionsCollection);
    const questionsList = questionsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Question));
    setQuestions(questionsList);
  };

  // Note: Function to fetch subjects from Firestore
  const fetchSubjects = async () => {
    const subjectsCollection = collection(db, 'subjects');
    const subjectsSnapshot = await getDocs(subjectsCollection);
    const subjectsList = subjectsSnapshot.docs.map(doc => doc.data().name);
    setSubjects(subjectsList);
  };

  // Note: Handle input changes for the new question form
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, index?: number) => {
    const { name, value } = e.target;
    if (name === 'options' && index !== undefined) {
      const updatedOptions = [...newQuestion.options];
      updatedOptions[index] = value;
      setNewQuestion({ ...newQuestion, options: updatedOptions });
    } else {
      setNewQuestion({ ...newQuestion, [name]: value });
    }
  };

  // Note: Handle select changes for the new question form
  const handleSelectChange = (name: string, value: string) => {
    setNewQuestion({ ...newQuestion, [name]: value });
  };

  // Note: Function to add a new question to Firestore
  const handleAddQuestion = async () => {
    try {
      // Validate all fields are filled
      if (!newQuestion.text || newQuestion.options.some(option => !option) || !newQuestion.correctAnswer || !newQuestion.subject || !newQuestion.year || !newQuestion.course) {
        alert("Please fill in all fields");
        return;
      }

      // Add the new question to Firestore
      await addDoc(collection(db, 'questions'), newQuestion);

      // Reset the form
      setNewQuestion({
        text: '',
        options: ['', '', '', ''],
        correctAnswer: '',
        subject: '',
        year: '',
        course: '',
      });

      // Refresh the questions list
      fetchQuestions();

      alert("Question added successfully!");
    } catch (error) {
      console.error("Error adding question:", error);
      alert("Error adding question. Please try again.");
    }
  };

  // Note: Function to delete a question from Firestore
  const handleDeleteQuestion = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'questions', id));
      fetchQuestions();
    } catch (error) {
      console.error("Error deleting question: ", error);
    }
  };

  // Note: Function to edit a question in Firestore
  const handleEditQuestion = async (question: Question) => {
    try {
      await updateDoc(doc(db, 'questions', question.id), question);
      fetchQuestions();
    } catch (error) {
      console.error("Error updating question: ", error);
    }
  };

  // Note: Function to filter questions based on selected criteria
  const filterQuestions = async () => {
    if (selectedSubject && selectedYear && selectedCourse) {
      const q = query(
        collection(db, 'questions'),
        where('subject', '==', selectedSubject),
        where('year', '==', selectedYear),
        where('course', '==', selectedCourse)
      );
      const querySnapshot = await getDocs(q);
      const filteredQuestions = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Question));
      setQuestions(filteredQuestions);
    } else {
      fetchQuestions();
    }
  };

  // Note: JSX for the admin page UI
  return (
    <div className={`min-h-screen bg-gray-900 ${poppins.className}`}>
      <main className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8 text-green-100">Admin Panel</h1>
        {/* Note: Form for adding new questions */}
        <Card className="bg-gray-800/50 backdrop-filter backdrop-blur-lg border-green-700 mb-8 rounded-3xl">
          <CardHeader>
            <CardTitle className="text-green-100">Add New Question</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Note: Subject, Year, and Course selection */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {/* ... (Select components for subject, year, and course) ... */}
            </div>
            {/* Note: Question text input */}
            <Input
              className="mb-4"
              placeholder="Question Text"
              name="text"
              value={newQuestion.text}
              onChange={handleInputChange}
            />
            {/* Note: Options inputs */}
            {newQuestion.options.map((option, index) => (
              <Input
                key={index}
                className="mb-2"
                placeholder={`Option ${index + 1}`}
                name="options"
                value={option}
                onChange={(e) => handleInputChange(e, index)}
              />
            ))}
            {/* Note: Correct answer selection */}
            <Select onValueChange={(value) => handleSelectChange('correctAnswer', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select Correct Answer" />
              </SelectTrigger>
              <SelectContent>
                {newQuestion.options.map((option, index) => (
                  option && <SelectItem key={index} value={option}>{option}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {/* Note: Add Question button */}
            <Button onClick={handleAddQuestion} className="mt-4 bg-green-600 text-green-100 hover:bg-green-500">Add Question</Button>
          </CardContent>
        </Card>
        {/* Note: Section for managing existing questions */}
        <Card className="bg-gray-800/50 backdrop-filter backdrop-blur-lg border-green-700 rounded-3xl">
          <CardHeader>
            <CardTitle className="text-green-100">Manage Questions</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Note: Filter options for questions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {/* ... (Select components for filtering) ... */}
            </div>
            <Button onClick={filterQuestions} className="mb-4">Apply Filters</Button>
            {/* Note: List of questions with edit and delete options */}
            <ul>
              {questions.map((question) => (
                <li key={question.id} className="mb-4 p-4 bg-gray-700 rounded-lg">
                  <p className="font-semibold text-green-100">{question.text}</p>
                  <p className="text-sm text-green-300">
                    Subject: {question.subject}, Year: {question.year}, Course: {question.course}
                  </p>
                  {/* Note: Edit and Delete buttons for each question */}
                  <div className="mt-2">
                    <Button onClick={() => handleEditQuestion(question)} className="mr-2 bg-blue-600 text-blue-100 hover:bg-blue-500">Edit</Button>
                    <Button onClick={() => handleDeleteQuestion(question.id)} className="bg-red-600 text-red-100 hover:bg-red-500">Delete</Button>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}