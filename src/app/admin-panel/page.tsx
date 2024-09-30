'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminPanel() {
  return (
    <div className='container mx-auto p-4'>
      <h1 className='text-3xl font-bold mb-6'>Admin Panel</h1>
      <Card>
        <CardHeader>
          <CardTitle>Welcome to the Admin Panel</CardTitle>
        </CardHeader>
        <CardContent>
          <p className='mb-4'>
            This is the admin panel for managing the quiz application. Here you
            can:
          </p>
          <ul className='list-disc list-inside mb-4'>
            <li>Add, edit, or delete questions</li>
            <li>Manage subjects, years, and courses</li>
            <li>View and analyze quiz results</li>
            <li>Manage user accounts</li>
          </ul>
          <p>
            Please use the navigation menu to access different admin functions.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
