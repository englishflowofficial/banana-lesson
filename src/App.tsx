import { Route, Routes } from 'react-router-dom'
import AppShell from './components/AppShell'
import { ProgressProvider } from './hooks/useProgress'
import HomePage from './pages/HomePage'
import LessonPage from './pages/LessonPage'
import LibraryPage from './pages/LibraryPage'
import ProgressPage from './pages/ProgressPage'
import StoryboardPage from './pages/StoryboardPage'
import NotFoundPage from './pages/NotFoundPage'

/**
 * Action English.
 *
 * Routing uses the hash strategy so every deep link keeps working on GitHub
 * Pages, where the server cannot rewrite unknown paths back to index.html.
 */
export default function App() {
  return (
    <ProgressProvider>
      <AppShell>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/lessons" element={<LibraryPage />} />
          <Route path="/lesson/:slug" element={<LessonPage />} />
          <Route path="/progress" element={<ProgressPage />} />
          <Route path="/storyboard" element={<StoryboardPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AppShell>
    </ProgressProvider>
  )
}
