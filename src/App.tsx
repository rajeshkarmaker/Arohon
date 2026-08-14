import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import ExamIntelligence from './pages/ExamIntelligence';
import CourseCopilot from './pages/CourseCopilot';
import SmartPractice from './pages/SmartPractice';
import Deadlines from './pages/Deadlines';
import ResourceHub from './pages/ResourceHub';
import Settings from './pages/Settings';
import Onboarding from './components/Onboarding';
import { UserProfile, DEMO_DEADLINES, Deadline } from './data/courses';

function App() {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('arohon_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [deadlines, setDeadlines] = useState<Deadline[]>(() => {
    const saved = localStorage.getItem('arohon_deadlines');
    return saved ? JSON.parse(saved) : DEMO_DEADLINES;
  });

  const [analysisCache, setAnalysisCache] = useState<Record<string, any>>(() => {
    const saved = localStorage.getItem('arohon_analysis');
    return saved ? JSON.parse(saved) : {};
  });

  const [practiceHistory, setPracticeHistory] = useState<any[]>(() => {
    const saved = localStorage.getItem('arohon_practice');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    if (user) localStorage.setItem('arohon_user', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem('arohon_deadlines', JSON.stringify(deadlines));
  }, [deadlines]);

  useEffect(() => {
    localStorage.setItem('arohon_analysis', JSON.stringify(analysisCache));
  }, [analysisCache]);

  useEffect(() => {
    localStorage.setItem('arohon_practice', JSON.stringify(practiceHistory));
  }, [practiceHistory]);

  const handleOnboard = (profile: UserProfile) => {
    setUser(profile);
  };

  if (!user) {
    return <Onboarding onComplete={handleOnboard} />;
  }

  return (
    <Routes>
      <Route path="/" element={<Layout user={user} />}>
        <Route index element={
          <Dashboard
            user={user}
            deadlines={deadlines}
            setDeadlines={setDeadlines}
            analysisCache={analysisCache}
            practiceHistory={practiceHistory}
          />
        } />
        <Route path="exam-intelligence" element={
          <ExamIntelligence
            user={user}
            analysisCache={analysisCache}
            setAnalysisCache={setAnalysisCache}
          />
        } />
        <Route path="copilot" element={<CourseCopilot user={user} />} />
        <Route path="practice" element={
          <SmartPractice
            user={user}
            analysisCache={analysisCache}
            practiceHistory={practiceHistory}
            setPracticeHistory={setPracticeHistory}
          />
        } />
        <Route path="deadlines" element={
          <Deadlines deadlines={deadlines} setDeadlines={setDeadlines} />
        } />
        <Route path="resources" element={<ResourceHub user={user} />} />
        <Route path="settings" element={
          <Settings user={user} setUser={setUser} />
        } />
      </Route>
    </Routes>
  );
}

export default App;
