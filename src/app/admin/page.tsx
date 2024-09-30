'use client';

import React, { useState, useEffect } from 'react';
import { Poppins } from 'next/font/google';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  collection,
  getDocs,
  addDoc,
  query,
  where,
  deleteDoc,
  doc,
  updateDoc,
  orderBy,
  writeBatch,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

const poppins = Poppins({ subsets: ['latin'], weight: ['400', '600', '700'] });

interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: string;
  subject: string;
  year: string;
  course: string;
  order: number;
}

export default function AdminPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [newQuestion, setNewQuestion] = useState({
    text: '',
    options: ['', '', '', ''],
    correctAnswer: '',
  });
  const [subjects, setSubjects] = useState<string[]>([]);
  const [years] = useState<string[]>(
    Array.from({ length: new Date().getFullYear() - 2013 }, (_, i) =>
      (2014 + i).toString(),
    ),
  );
  const [courses] = useState<string[]>(['first', 'second']);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [mode, setMode] = useState<'add' | 'manage'>('add');

  useEffect(() => {
    fetchSubjects();
  }, []);

  useEffect(() => {
    if (
      mode === 'manage' &&
      selectedSubject &&
      selectedYear &&
      selectedCourse
    ) {
      fetchQuestions();
    }
  }, [mode, selectedSubject, selectedYear, selectedCourse]);

  const fetchSubjects = async () => {
    const subjectsCollection = collection(db, 'subjects');
    const subjectsSnapshot = await getDocs(subjectsCollection);
    const subjectsList = subjectsSnapshot.docs.map((doc) => doc.data().name);
    setSubjects(subjectsList);
  };

  const fetchQuestions = async () => {
    if (!selectedSubject || !selectedYear || !selectedCourse) return;

    const q = query(
      collection(db, 'questions'),
      where('subject', '==', selectedSubject),
      where('year', '==', selectedYear),
      where('course', '==', selectedCourse),
      orderBy('order'),
    );
    const questionsSnapshot = await getDocs(q);
    const questionsList = questionsSnapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() }) as Question,
    );
    setQuestions(questionsList);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index?: number,
  ) => {
    const { name, value } = e.target;
    if (name === 'options' && index !== undefined) {
      const updatedOptions = [...newQuestion.options];
      updatedOptions[index] = value;
      setNewQuestion({ ...newQuestion, options: updatedOptions });
    } else {
      setNewQuestion({ ...newQuestion, [name]: value });
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    if (name === 'subject') setSelectedSubject(value);
    if (name === 'year') setSelectedYear(value);
    if (name === 'course') setSelectedCourse(value);
    if (name === 'correctAnswer')
      setNewQuestion({ ...newQuestion, correctAnswer: value });
  };

  const handleAddQuestion = async () => {
    try {
      if (
        !newQuestion.text ||
        newQuestion.options.some((option) => !option) ||
        !newQuestion.correctAnswer ||
        !selectedSubject ||
        !selectedYear ||
        !selectedCourse
      ) {
        alert('Please fill in all fields');
        return;
      }

      const lastQuestion = questions[questions.length - 1];
      const newOrder = lastQuestion ? lastQuestion.order + 1 : 1;
      await addDoc(collection(db, 'questions'), {
        ...newQuestion,
        subject: selectedSubject,
        year: selectedYear,
        course: selectedCourse,
        order: newOrder,
      });

      setNewQuestion({
        text: '',
        options: ['', '', '', ''],
        correctAnswer: '',
      });
      alert('Question added successfully!');
    } catch (error) {
      console.error('Error adding question:', error);
      alert('Failed to add question. Please try again.');
    }
  };

  const handleEditQuestion = (question: Question) => {
    setEditingQuestion(question);
  };

  const handleUpdateQuestion = async () => {
    if (!editingQuestion) return;
    try {
      await updateDoc(
        doc(db, 'questions', editingQuestion.id),
        editingQuestion,
      );
      setEditingQuestion(null);
      fetchQuestions();
      alert('Question updated successfully!');
    } catch (error) {
      console.error('Error updating question:', error);
      alert('Failed to update question. Please try again.');
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    if (confirm('Are you sure you want to delete this question?')) {
      try {
        await deleteDoc(doc(db, 'questions', id));
        fetchQuestions();
        alert('Question deleted successfully!');
      } catch (error) {
        console.error('Error deleting question:', error);
        alert('Failed to delete question. Please try again.');
      }
    }
  };

  const handleMoveQuestion = async (id: string, direction: 'up' | 'down') => {
    const index = questions.findIndex((q) => q.id === id);
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === questions.length - 1)
    )
      return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const [movedQuestion] = questions.splice(index, 1);
    questions.splice(newIndex, 0, movedQuestion);

    const batch = writeBatch(db);
    questions.forEach((q, i) => {
      const ref = doc(db, 'questions', q.id);
      batch.update(ref, { order: i + 1 });
    });

    try {
      await batch.commit();
      fetchQuestions();
    } catch (error) {
      console.error('Error reordering questions:', error);
      alert('Failed to reorder questions. Please try again.');
    }
  };

  return (
    <div className={`min-h-screen bg-gray-900 ${poppins.className}`}>
      <main className='container mx-auto px-4 py-12'>
        <h1 className='text-4xl font-bold mb-8 text-green-100'>Admin Panel</h1>
        <div className='mb-8'>
          <Button
            onClick={() => setMode('add')}
            className={`mr-4 ${mode === 'add' ? 'bg-primary' : 'bg-secondary'}`}
          >
            Add Questions
          </Button>
          <Button
            onClick={() => setMode('manage')}
            className={`${mode === 'manage' ? 'bg-primary' : 'bg-secondary'}`}
          >
            Manage Questions
          </Button>
        </div>

        <Card className='bg-gray-800/50 backdrop-filter backdrop-blur-lg border-green-700 mb-8 rounded-3xl'>
          <CardHeader>
            <CardTitle className='text-green-100'>
              Select Subject, Year, and Course
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-4'>
              <Select
                onValueChange={(value) => handleSelectChange('subject', value)}
                value={selectedSubject}
              >
                <SelectTrigger className='w-full'>
                  <SelectValue placeholder='Select Subject' />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subject) => (
                    <SelectItem key={subject} value={subject}>
                      {subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                onValueChange={(value) => handleSelectChange('year', value)}
                value={selectedYear}
              >
                <SelectTrigger className='w-full'>
                  <SelectValue placeholder='Select Year' />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                onValueChange={(value) => handleSelectChange('course', value)}
                value={selectedCourse}
              >
                <SelectTrigger className='w-full'>
                  <SelectValue placeholder='Select Course' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='first'>First</SelectItem>
                  <SelectItem value='second'>Second</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {mode === 'add' &&
          selectedSubject &&
          selectedYear &&
          selectedCourse && (
            <Card className='bg-gray-800/50 backdrop-filter backdrop-blur-lg border-green-700 mb-8 rounded-3xl'>
              <CardHeader>
                <CardTitle className='text-green-100'>
                  Add New Question
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Input
                  className='mb-4'
                  placeholder='Question Text'
                  name='text'
                  value={newQuestion.text}
                  onChange={handleInputChange}
                />
                {newQuestion.options.map((option, index) => (
                  <Input
                    key={index}
                    className='mb-2'
                    placeholder={`Option ${index + 1}`}
                    name='options'
                    value={option}
                    onChange={(e) => handleInputChange(e, index)}
                  />
                ))}
                <Select
                  onValueChange={(value) =>
                    handleSelectChange('correctAnswer', value)
                  }
                  value={newQuestion.correctAnswer}
                >
                  <SelectTrigger className='w-full mb-4'>
                    <SelectValue placeholder='Select Correct Answer' />
                  </SelectTrigger>
                  <SelectContent>
                    {newQuestion.options.map(
                      (option, index) =>
                        option && (
                          <SelectItem key={index} value={option}>
                            {option}
                          </SelectItem>
                        ),
                    )}
                  </SelectContent>
                </Select>
                <Button
                  onClick={handleAddQuestion}
                  className='mt-4 bg-green-600 text-green-100 hover:bg-green-500'
                >
                  Add Question
                </Button>
              </CardContent>
            </Card>
          )}

        {mode === 'manage' &&
          selectedSubject &&
          selectedYear &&
          selectedCourse && (
            <Card className='bg-gray-800/50 backdrop-filter backdrop-blur-lg border-green-700 rounded-3xl'>
              <CardHeader>
                <CardTitle className='text-green-100'>
                  Manage Questions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul>
                  {questions.map((question, index) => (
                    <li
                      key={question.id}
                      className='mb-4 p-4 bg-gray-700 rounded-lg'
                    >
                      <p className='font-semibold text-green-100'>
                        {question.text}
                      </p>
                      <p className='text-sm text-green-300'>
                        Options: {question.options.join(', ')}
                      </p>
                      <p className='text-sm text-green-300'>
                        Correct Answer: {question.correctAnswer}
                      </p>
                      <div className='mt-2 flex space-x-2'>
                        <Button
                          onClick={() => handleEditQuestion(question)}
                          className='bg-blue-600 text-blue-100 hover:bg-blue-500'
                        >
                          Edit
                        </Button>
                        <Button
                          onClick={() => handleDeleteQuestion(question.id)}
                          className='bg-red-600 text-red-100 hover:bg-red-500'
                        >
                          Delete
                        </Button>
                        <Button
                          onClick={() => handleMoveQuestion(question.id, 'up')}
                          disabled={index === 0}
                          className='bg-gray-600 text-gray-100 hover:bg-gray-500'
                        >
                          Move Up
                        </Button>
                        <Button
                          onClick={() =>
                            handleMoveQuestion(question.id, 'down')
                          }
                          disabled={index === questions.length - 1}
                          className='bg-gray-600 text-gray-100 hover:bg-gray-500'
                        >
                          Move Down
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

        {editingQuestion && (
          <Card className='bg-gray-800/50 backdrop-filter backdrop-blur-lg border-green-700 mt-8 rounded-3xl'>
            <CardHeader>
              <CardTitle className='text-green-100'>Edit Question</CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                className='mb-4'
                placeholder='Question Text'
                name='text'
                value={editingQuestion.text}
                onChange={(e) =>
                  setEditingQuestion({
                    ...editingQuestion,
                    text: e.target.value,
                  })
                }
              />
              {editingQuestion.options.map((option, index) => (
                <Input
                  key={index}
                  className='mb-2'
                  placeholder={`Option ${index + 1}`}
                  value={option}
                  onChange={(e) => {
                    const newOptions = [...editingQuestion.options];
                    newOptions[index] = e.target.value;
                    setEditingQuestion({
                      ...editingQuestion,
                      options: newOptions,
                    });
                  }}
                />
              ))}
              <Select
                onValueChange={(value) =>
                  setEditingQuestion({
                    ...editingQuestion,
                    correctAnswer: value,
                  })
                }
                value={editingQuestion.correctAnswer}
              >
                <SelectTrigger className='w-full mb-4'>
                  <SelectValue placeholder='Select Correct Answer' />
                </SelectTrigger>
                <SelectContent>
                  {editingQuestion.options.map(
                    (option, index) =>
                      option && (
                        <SelectItem key={index} value={option}>
                          {option}
                        </SelectItem>
                      ),
                  )}
                </SelectContent>
              </Select>
              <Button
                onClick={handleUpdateQuestion}
                className='mt-4 bg-green-600 text-green-100 hover:bg-green-500'
              >
                Update Question
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
