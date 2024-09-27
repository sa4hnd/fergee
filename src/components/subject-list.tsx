'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";

interface Subject {
  id: string;
  name: string;
}

interface SubjectListProps {
  subjects: Subject[];
}

export default function SubjectList({ subjects }: SubjectListProps) {
  const router = useRouter();

  const handleSubjectClick = (subjectId: string) => {
    router.push(`/subject/${encodeURIComponent(subjectId)}`);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {subjects.map((subject) => (
        <Button
          key={subject.id}
          onClick={() => handleSubjectClick(subject.id)}
          className="p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {subject.name}
        </Button>
      ))}
    </div>
  );
}