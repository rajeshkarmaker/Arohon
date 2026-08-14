import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Dumbbell, Loader2, Send, RotateCcw, Eye, Lightbulb,
  ChevronRight, AlertTriangle, CheckCircle, BookOpen,
} from 'lucide-react';
import { UserProfile, COURSES } from '../data/courses';

interface SmartPracticeProps {
  user: UserProfile;
  analysisCache: Record<string, any>;
  practiceHistory: any[];
  setPracticeHistory: (history: any[]) => void;
}

export default function SmartPractice({ user, analysisCache, practiceHistory, setPracticeHistory }: SmartPracticeProps) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [courseId, setCourseId] = useState(searchParams.get('course') || user.courses[0] || 'chem-1101');
  const [topic, setTopic] = useState(searchParams.get('topic') || '');
  const [questionStyle, setQuestionStyle] = useState('mixed');
  const [difficulty, setDifficulty] = useState('medium');

  const [question, setQuestion] = useState<any>(null);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const course = COURSES.find(c => c.id === courseId);

  const generateQuestion = async () => {
    setLoading(true);
    setQuestion(null);
    setAnswer('');
    setFeedback(null);
    setShowSolution(false);
    setShowHint(false);

    try {
      const response = await fetch('/api/practice/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topic || course?.topics?.[0] || 'General',
          courseName: course?.name || 'Chemistry',
          questionStyle,
          difficulty,
          historicalContext: analysisCache[`${courseId}_CT`]
            ? `Based on high-yield topics: ${analysisCache[`${courseId}_CT`].highYieldTopics?.slice(0, 3).map((t: any) => t.topic).join(', ')}`
            : undefined,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setQuestion(data);
    } catch (err: any) {
      setQuestion({ error: err.message || 'Failed to generate question. Try again.' });
    } finally {
      setLoading(false);
    }
  };

  const evaluateAnswer = async () => {
    if (!answer.trim()) return;
    setEvaluating(true);

    try {
      const response = await fetch('/api/practice/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: question.question,
          studentAnswer: answer,
          topic: question.topic || topic,
          courseName: course?.name,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setFeedback(data);

      // Save to practice history
      setPracticeHistory([...practiceHistory, {
        topic: question.topic || topic,
        courseId,
        question: question.question,
        answer,
        score: data.score,
        timestamp: new Date().toISOString(),
      }]);
    } catch (err: any) {
      setFeedback({ error: err.message || 'Failed to evaluate. Try again.' });
    } finally {
      setEvaluating(false);
    }
  };

  // Get weak topics from practice history
  const weakTopics = practiceHistory.reduce((acc: Record<string, { total: number; correct: number }>, p: any) => {
    if (!p.topic) return acc;
    if (!acc[p.topic]) acc[p.topic] = { total: 0, correct: 0 };
    acc[p.topic].total++;
    if (p.score >= 60) acc[p.topic].correct++;
    return acc;
  }, {});

  const weakTopicList = Object.entries(weakTopics)
    .filter(([_, v]) => v.total >= 2 && (v.correct / v.total) < 0.6)
    .map(([topic, v]) => ({ topic, accuracy: Math.round((v.correct / v.total) * 100) }));

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      <div className="flex items-center gap-sm mb-lg">
        <Dumbbell size={20} style={{ color: 'var(--blue)' }} />
        <h2>Smart Practice</h2>
      </div>

      {/* Config */}
      {!question && (
        <div className="card" style={{ marginBottom: 'var(--space-lg)' }}>
          <h3 style={{ marginBottom: 'var(--space-md)' }}>Generate Practice Question</h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
            <div className="form-group">
              <label className="form-label">Course</label>
              <select className="form-select" value={courseId} onChange={e => setCourseId(e.target.value)}>
                {COURSES.filter(c => user.courses.includes(c.id)).map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Topic</label>
              <select className="form-select" value={topic} onChange={e => setTopic(e.target.value)}>
                <option value="">Any topic</option>
                {course?.topics.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Question Style</label>
              <select className="form-select" value={questionStyle} onChange={e => setQuestionStyle(e.target.value)}>
                <option value="mixed">Mixed</option>
                <option value="conceptual">Conceptual</option>
                <option value="numerical">Numerical</option>
                <option value="application">Application</option>
                <option value="derivation">Derivation</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Difficulty</label>
              <select className="form-select" value={difficulty} onChange={e => setDifficulty(e.target.value)}>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>

          <button className="btn btn-primary btn-lg w-full" style={{ marginTop: 'var(--space-md)' }} onClick={generateQuestion} disabled={loading}>
            {loading ? <><Loader2 size={16} className="spin" /> Generating…</> : <><Dumbbell size={16} /> Generate Question</>}
          </button>
        </div>
      )}

      {/* Question */}
      {question && !question.error && (
        <div className="card" style={{ marginBottom: 'var(--space-lg)' }}>
          <div className="flex items-center justify-between mb-md">
            <div className="flex items-center gap-sm">
              {question.topic && <span className="badge badge-medium">{question.topic}</span>}
              {question.type && <span className="badge badge-low">{question.type}</span>}
              {question.marks && <span className="mono" style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{question.marks} marks</span>}
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => { setQuestion(null); setFeedback(null); }}>
              <RotateCcw size={14} /> New Question
            </button>
          </div>

          {question.basis && (
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: 'var(--space-md)', padding: '4px 12px', background: 'var(--bg)', borderRadius: 'var(--radius-sm)' }}>
              {question.basis}
            </p>
          )}

          <div style={{ fontSize: '0.95rem', lineHeight: 1.7, marginBottom: 'var(--space-lg)', padding: 'var(--space-md)', background: 'var(--bg)', borderRadius: 'var(--radius-sm)', borderLeft: '3px solid var(--blue)' }}>
            {question.question}
          </div>

          {/* Hint */}
          {showHint && question.hint && (
            <div style={{ padding: 'var(--space-md)', background: 'var(--highlight-light)', borderRadius: 'var(--radius-sm)', marginBottom: 'var(--space-md)', fontSize: '0.85rem' }}>
              <strong>💡 Hint:</strong> {question.hint}
            </div>
          )}

          {/* Answer input */}
          {!feedback && (
            <>
              <div className="form-group">
                <label className="form-label">Your Answer</label>
                <textarea
                  className="form-textarea"
                  value={answer}
                  onChange={e => setAnswer(e.target.value)}
                  placeholder="Type your answer here…"
                  rows={5}
                />
              </div>

              <div className="flex gap-sm">
                <button className="btn btn-primary" onClick={evaluateAnswer} disabled={evaluating || !answer.trim()}>
                  {evaluating ? <><Loader2 size={14} className="spin" /> Evaluating…</> : <><Send size={14} /> Submit Answer</>}
                </button>
                {!showHint && question.hint && (
                  <button className="btn btn-secondary" onClick={() => setShowHint(true)}>
                    <Lightbulb size={14} /> Show Hint
                  </button>
                )}
              </div>
            </>
          )}

          {/* Feedback */}
          {feedback && !feedback.error && (
            <div style={{ marginTop: 'var(--space-md)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-md)' }}>
                {feedback.isCorrect ? (
                  <CheckCircle size={20} style={{ color: 'var(--success)' }} />
                ) : (
                  <AlertTriangle size={20} style={{ color: 'var(--warning)' }} />
                )}
                <span style={{ fontWeight: 600, fontSize: '1rem' }}>
                  Score: {feedback.score}%
                </span>
                {feedback.encouragement && (
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>— {feedback.encouragement}</span>
                )}
              </div>

              <div style={{ padding: 'var(--space-md)', background: 'var(--bg)', borderRadius: 'var(--radius-sm)', marginBottom: 'var(--space-md)', fontSize: '0.85rem', lineHeight: 1.65 }}>
                {feedback.feedback}
              </div>

              {feedback.missingConcepts && feedback.missingConcepts.length > 0 && (
                <div style={{ marginBottom: 'var(--space-md)' }}>
                  <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4 }}>Missing concepts:</p>
                  <div className="flex gap-xs" style={{ flexWrap: 'wrap' }}>
                    {feedback.missingConcepts.map((c: string, i: number) => (
                      <span key={i} className="badge badge-warning">{c}</span>
                    ))}
                  </div>
                </div>
              )}

              {feedback.suggestion && (
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontStyle: 'italic', marginBottom: 'var(--space-md)' }}>
                  💡 {feedback.suggestion}
                </p>
              )}

              <div className="flex gap-sm">
                <button className="btn btn-primary btn-sm" onClick={() => { setFeedback(null); setAnswer(''); }}>
                  <RotateCcw size={14} /> Try Again
                </button>
                <button className="btn btn-secondary btn-sm" onClick={() => setShowSolution(!showSolution)}>
                  <Eye size={14} /> {showSolution ? 'Hide' : 'Show'} Solution
                </button>
                <button className="btn btn-secondary btn-sm" onClick={() => { setQuestion(null); setFeedback(null); setAnswer(''); }}>
                  Next Question
                </button>
              </div>

              {showSolution && question.sampleAnswer && (
                <div style={{ marginTop: 'var(--space-md)', padding: 'var(--space-md)', background: 'var(--success-light)', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', lineHeight: 1.65, borderLeft: '3px solid var(--success)' }}>
                  <strong>Model Answer:</strong><br />{question.sampleAnswer}
                </div>
              )}
            </div>
          )}

          {feedback?.error && (
            <div className="error-state" style={{ marginTop: 'var(--space-md)' }}>
              <p>{feedback.error}</p>
              <button className="btn btn-secondary btn-sm" onClick={evaluateAnswer}>
                <RotateCcw size={14} /> Retry
              </button>
            </div>
          )}
        </div>
      )}

      {question?.error && (
        <div className="error-state" style={{ marginBottom: 'var(--space-lg)' }}>
          <p>{question.error}</p>
          <button className="btn btn-secondary" onClick={generateQuestion}>
            <RotateCcw size={14} /> Try Again
          </button>
        </div>
      )}

      {/* Weak Topics */}
      {weakTopicList.length > 0 && (
        <div className="card">
          <h3 style={{ marginBottom: 'var(--space-md)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertTriangle size={18} style={{ color: 'var(--warning)' }} />
            Weak Topics Detected
          </h3>
          {weakTopicList.map((wt, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--space-sm) 0', borderBottom: i < weakTopicList.length - 1 ? '1px solid var(--border-light)' : 'none' }}>
              <div>
                <span style={{ fontWeight: 500, fontSize: '0.88rem' }}>{wt.topic}</span>
                <span className="badge badge-danger" style={{ marginLeft: 8 }}>Accuracy: {wt.accuracy}%</span>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={() => { setTopic(wt.topic); setQuestion(null); setFeedback(null); generateQuestion(); }}>
                Practice
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
