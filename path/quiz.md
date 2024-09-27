Here’s the refined prompt that includes Firebase for storage, authentication, and Firestore database:

---

# Quiz Application with Firebase Integration

## Path System Prompt:

You are an expert in TypeScript, Node.js, Next.js App Router, React, Shadcn UI, Radix UI, and Tailwind CSS. Follow the Next.js documentation for Data Fetching, Rendering, and Routing.

## App Description:

You will create a modern quiz application that utilizes Firebase for storage and authentication, allowing users to select subjects, years, and courses, take quizzes with multiple-choice questions, and view their results at the end, simulating a real exam environment. The application will feature a dark theme with a stylish grid dotted background.

## App Flow and Functionality:

1. **User Interface:**

   - The app opens with a homepage featuring a list of available subjects for quizzes, displayed as clickable buttons.

2. **Subject Selection:**

   - When a user clicks on a subject, they are directed to a page where they must select the year (2014 to present) and the course (first or second).

3. **Year and Course Selection:**

   - After selecting a subject, users choose the year and course from dropdown menus or buttons.
   - Once selections are made, users can navigate to the quiz page.

4. **Quiz Taking:**

   - Present a series of multiple-choice questions, one at a time, with clear answer options.
   - Include a timer to simulate a real exam environment.
   - Users can mark questions for review and navigate between questions.

5. **Submission and Results:**

   - Upon completing the quiz, users submit their answers.
   - Display a results page showing the total score, correct answers, user’s answers for comparison, and explanations for each question.

6. **Quiz History:**

   - Users can view their quiz history stored in Firebase Firestore, showing past quizzes taken, scores, and completion dates.

7. **Admin Panel:**
   - An admin interface for managing questions and user access.
   - Admins can add, edit, or delete questions and view a list of registered users.

### Key Features to Implement:

- **Firebase Authentication:**

  - Implement user authentication using Firebase Authentication to secure access for students and admins.

- **Cloud Firestore for Data Storage:**

  - Use Firestore to store questions, quiz details, user scores, and quiz history.
  - Organize data into collections for subjects, questions, and users.

- **Dynamic Quiz Loading:**

  - Implement dynamic loading of quizzes based on user-selected subjects, years, and courses from Firestore.

- **Admin Interface:**

  - Create a dedicated admin panel with forms for adding and editing questions in Firestore.
  - Implement validation for input fields.

- **Timer and Navigation:**

  - Include a countdown timer for quizzes and allow navigation between questions.

- **Comprehensive Results Display:**

  - After submission, provide a results page that shows:
    - Total score and percentage.
    - Detailed comparison of the user’s answers versus the correct answers.
    - Feedback on each question.

- **Dark Theme and Stylish Background:**

  - Implement a modern dark theme throughout the application.
  - Use a grid-looking dotted background for a contemporary feel.

- **Responsive Design:**

  - Use Shadcn UI, Radix UI, and Tailwind CSS for responsive and visually appealing design.

- **Error Handling:**
  - Ensure robust error handling for quiz loading, question management, and answer submissions.

### Required Components:

Create all necessary components for the quiz application, including but not limited to:

- `subject-list.tsx` for displaying available subjects.
- `year-selector.tsx` for selecting the year.
- `course-selector.tsx` for selecting the course.
- `quiz-selection.tsx` for presenting available quizzes based on selections.
- `quiz.tsx` for displaying questions and answer options, including a timer.
- `result-display.tsx` for showing final scores and comparisons after quiz submission.
- `quiz-history.tsx` for displaying user quiz history.
- `admin-panel.tsx` for managing questions and users.
- `question-form.tsx` for adding/editing questions in the admin interface.
- `error-display.tsx` for handling errors.
- `loading-indicator.tsx` for displaying loading states.

### Code Style and Structure

- Write concise, technical TypeScript code with accurate examples.
- Use functional and declarative programming patterns; avoid classes.
- Favor iteration and modularization over code duplication.
- Use descriptive variable names (e.g., `isLoading`, `hasError`).
- Structure files for exported components, subcomponents, helpers, static content, and types.

### Naming Conventions

- Use lowercase with dashes for directories (e.g., `components/subject-list`).
- Favor named exports for components.

### TypeScript Usage

- Use TypeScript for all code; prefer interfaces over types.
- Avoid enums; use maps instead.
- Use functional components with TypeScript interfaces.

### Performance Optimization

- Minimize `use client`, `useEffect`, and `setState`; favor React Server Components (RSC).
- Wrap client components in Suspense with a fallback.
- Use dynamic loading for non-critical components.
- Optimize images: use WebP format, include size data, and implement lazy loading.

### Additional Considerations

- Ensure a user-friendly experience with clear feedback throughout the quiz process.
- Implement security rules in Firestore to restrict admin functions to authenticated users with the admin role.

By following this structure and guidelines, you'll create a modern quiz application that provides an engaging exam-like experience for students while allowing administrators to manage content effectively in Firebase.

for every needed dependiencies to install tell me the command and addd needed files for firebase to

this is for firebase
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
apiKey: "AIzaSyDA3x_PxP24hWUIDZgJohTpXyxfxk4Mouo",
authDomain: "quiz-a8740.firebaseapp.com",
projectId: "quiz-a8740",
storageBucket: "quiz-a8740.appspot.com",
messagingSenderId: "739525484124",
appId: "1:739525484124:web:df249a7b6a38a0ba685099",
measurementId: "G-TDEXJ87YJY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
