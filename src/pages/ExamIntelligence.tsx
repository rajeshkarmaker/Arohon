import { useState, useEffect, useCallback, useRef } from 'react';
import {
  BrainCircuit, Sparkles, BookOpen, TrendingUp, Target,
  ChevronRight, Loader2, Check, RotateCcw, Play, AlertCircle,
} from 'lucide-react';
import {
  COURSES, getCourse, DEMO_SUBJECT_DATA,
  UserProfile,
} from '../data/courses';
import { useNavigate } from 'react-router-dom';

interface ExamIntelligenceProps {
  user: UserProfile;
  analysisCache: Record<string, any>;
  setAnalysisCache: (cache: Record<string, any>) => void;
}

const ANALYSIS_STEPS = [
  'Reading historical question papers',
  'Extracting concepts and topics',
  'Identifying recurring question structures',
  'Comparing similar questions across years',
  'Detecting teacher tendencies',
  'Comparing with current lecture material',
  'Ranking high-yield topics',
  'Building your study plan',
  'Generating practice recommendations',
];

export default function ExamIntelligence({ user, analysisCache, setAnalysisCache }: ExamIntelligenceProps) {
  const navigate = useNavigate();
  const [courseId, setCourseId] = useState(user.courses[0] || 'chem-1101');
  const [examType, setExamType] = useState('CT');
  const [teacher, setTeacher] = useState('');
  const [studyHours, setStudyHours] = useState('6');
  const [activeTab, setActiveTab] = useState<'archive' | 'ocr'>('archive');
  const [ocrFile, setOcrFile] = useState<{ name: string; base64: string; mimeType: string } | null>(null);
  const [ocrAnalyzing, setOcrAnalyzing] = useState(false);
  const [ocrResults, setOcrResults] = useState<any>(null);
  const [ocrError, setOcrError] = useState<string | null>(null);

  const [analyzing, setAnalyzing] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const course = getCourse(courseId);
  const cacheKey = `${courseId}_${examType}`;

  // Load cached results
  useEffect(() => {
    if (analysisCache[cacheKey]) {
      setResults(analysisCache[cacheKey]);
    } else {
      setResults(null);
    }
  }, [cacheKey]);

  const runAnalysis = useCallback(async () => {
    setAnalyzing(true);
    setCurrentStep(0);
    setCompletedSteps([]);
    setError(null);
    setResults(null);

    // Progress through steps with real timing
    const stepInterval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev < ANALYSIS_STEPS.length - 1) {
          setCompletedSteps(p => [...p, prev]);
          return prev + 1;
        }
        return prev;
      });
    }, 1800);

    try {
      const subjectData = DEMO_SUBJECT_DATA[courseId] || { historicalQuestions: '', lectureContent: '' };
      const response = await fetch('/api/exam-intelligence/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId,
          courseName: course?.name || courseId,
          examType,
          teacher: teacher || undefined,
          topics: course?.topics || [],
          historicalQuestions: subjectData.historicalQuestions,
          lectureContent: subjectData.lectureContent,
          studyHours: parseInt(studyHours) || 6,
        }),
      });

      clearInterval(stepInterval);

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Analysis failed');
      }

      const data = await response.json();

      // Complete all steps
      setCompletedSteps(ANALYSIS_STEPS.map((_, i) => i));
      setCurrentStep(ANALYSIS_STEPS.length);

      setTimeout(() => {
        setResults(data);
        setAnalyzing(false);
        // Cache results
        setAnalysisCache({ ...analysisCache, [cacheKey]: data });
      }, 600);
    } catch (err: any) {
      clearInterval(stepInterval);
      setError(err.message || 'Gemini is temporarily unavailable. Try again.');
      setAnalyzing(false);
    }
  }, [courseId, examType, teacher, studyHours, course]);

  const ocrFileInputRef = useRef<HTMLInputElement>(null);

  const handleOcrFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      setOcrFile({
        name: file.name,
        base64,
        mimeType: file.type,
      });
    };
    reader.readAsDataURL(file);
  };

  const runOcrAnalysis = async () => {
    if (!ocrFile) return;
    setOcrAnalyzing(true);
    setOcrError(null);
    setOcrResults(null);

    try {
      const response = await fetch('/api/exam-intelligence/ocr-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileBase64: ocrFile.base64,
          mimeType: ocrFile.mimeType,
          fileName: ocrFile.name,
          courseName: course?.name || courseId,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'OCR Analysis failed');

      setOcrResults(data);
    } catch (err: any) {
      setOcrError(err.message || 'Failed to analyze question paper. Try again.');
    } finally {
      setOcrAnalyzing(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    if (priority === 'high') return 'var(--highlight)';
    if (priority === 'medium') return 'var(--blue)';
    return 'var(--border)';
  };

  return (
    <div>
      {/* Header */}
      <div className="exam-intel-header">
        <div className="flex items-center gap-sm mb-sm">
          <BrainCircuit size={24} />
          <span className="highlight-badge">
            <Sparkles size={12} />
            AI-Powered Analysis
          </span>
        </div>
        <h1>Exam Intelligence</h1>
        <p style={{ maxWidth: 600, marginTop: 4 }}>
          Analyze historical question patterns, understand teacher tendencies, and discover what to study first.
        </p>
      </div>

      {/* Tabs */}
      {!analyzing && !results && !ocrAnalyzing && !ocrResults && (
        <div className="tabs" style={{ marginBottom: 'var(--space-md)' }}>
          <button
            className={`tab ${activeTab === 'archive' ? 'active' : ''}`}
            onClick={() => setActiveTab('archive')}
          >
            Archive Pattern Analysis
          </button>
          <button
            className={`tab ${activeTab === 'ocr' ? 'active' : ''}`}
            onClick={() => setActiveTab('ocr')}
          >
            OCR Question Paper Analysis
          </button>
        </div>
      )}

      {/* Config Panel for Archive */}
      {activeTab === 'archive' && !analyzing && !results && (
        <div className="card" style={{ marginBottom: 'var(--space-xl)' }}>
          <h3 style={{ marginBottom: 'var(--space-lg)' }}>Configure Analysis</h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
            <div className="form-group">
              <label className="form-label">Course</label>
              <select className="form-select" value={courseId} onChange={e => setCourseId(e.target.value)}>
                {COURSES.filter(c => user.courses.includes(c.id)).map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Exam Type</label>
              <select className="form-select" value={examType} onChange={e => setExamType(e.target.value)}>
                <option value="CT">Class Test (CT)</option>
                <option value="Final">Final Exam</option>
                <option value="Quiz">Quiz</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Teacher (optional)</label>
              <input
                className="form-input"
                value={teacher}
                onChange={e => setTeacher(e.target.value)}
                placeholder="Teacher name"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Available Study Time (hours)</label>
              <input
                className="form-input"
                type="number"
                min="1"
                max="72"
                value={studyHours}
                onChange={e => setStudyHours(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginTop: 'var(--space-sm)' }}>
            <label className="form-label">Analysis Sources</label>
            <div className="checkbox-group">
              <label className="checkbox-label">
                <input type="checkbox" defaultChecked /> Historical question papers
              </label>
              <label className="checkbox-label">
                <input type="checkbox" defaultChecked /> Lecture slides
              </label>
              <label className="checkbox-label">
                <input type="checkbox" defaultChecked /> Course notes
              </label>
              <label className="checkbox-label">
                <input type="checkbox" defaultChecked /> Reference materials
              </label>
            </div>
          </div>

          {course && (
            <div style={{ marginTop: 'var(--space-md)', padding: 'var(--space-md)', background: 'var(--bg)', borderRadius: 'var(--radius-sm)' }}>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 4 }}>
                Topics to analyze in {course.name}:
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {course.topics.map(t => (
                  <span key={t} className="badge badge-medium" style={{ fontSize: '0.7rem' }}>{t}</span>
                ))}
              </div>
            </div>
          )}

          <button
            className="btn btn-highlight btn-lg"
            style={{ marginTop: 'var(--space-lg)', width: '100%' }}
            onClick={runAnalysis}
          >
            <BrainCircuit size={18} />
            Analyze Exam Patterns
          </button>

          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: 'var(--space-sm)' }}>
            Analysis uses demo seed data clearly labeled for demonstration
          </p>
        </div>
      )}

      {/* Config Panel for OCR File Upload */}
      {activeTab === 'ocr' && !ocrAnalyzing && !ocrResults && (
        <div className="card" style={{ marginBottom: 'var(--space-xl)' }}>
          <h3 style={{ marginBottom: 'var(--space-lg)' }}>Upload Previous Year Question Paper</h3>
          <p className="card-subtitle" style={{ marginBottom: 'var(--space-lg)' }}>
            Upload an image or PDF of a past exam. Gemini will extract the questions using OCR and suggest targeted practice recommendations.
          </p>

          <div className="form-group">
            <label className="form-label">Associated Course</label>
            <select className="form-select" value={courseId} onChange={e => setCourseId(e.target.value)} style={{ marginBottom: 'var(--space-md)' }}>
              {COURSES.filter(c => user.courses.includes(c.id)).map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <input
            ref={ocrFileInputRef}
            type="file"
            accept="image/*,.pdf"
            style={{ display: 'none' }}
            onChange={handleOcrFileChange}
          />

          {!ocrFile ? (
            <div
              className="file-upload-area"
              onClick={() => ocrFileInputRef.current?.click()}
              style={{ marginBottom: 'var(--space-lg)' }}
            >
              <Sparkles size={32} style={{ color: 'var(--highlight)', marginBottom: 'var(--space-sm)' }} />
              <p style={{ fontWeight: 500, marginBottom: 4 }}>Select past paper image or PDF</p>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Supports JPG, PNG, WEBP, PDF up to 20MB</p>
            </div>
          ) : (
            <div style={{ padding: 'var(--space-md)', background: 'var(--blue-light)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyBetween: 'space-between', marginBottom: 'var(--space-lg)' }}>
              <div className="flex items-center gap-sm">
                <span className="badge badge-medium">Ready</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>{ocrFile.name}</span>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setOcrFile(null)}>
                Change File
              </button>
            </div>
          )}

          <button
            className="btn btn-highlight btn-lg w-full"
            onClick={runOcrAnalysis}
            disabled={!ocrFile}
          >
            <BrainCircuit size={18} />
            Analyze & Extract Questions
          </button>
        </div>
      )}

      {/* Analysis Progress */}
      {analyzing && (
        <div className="card">
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-lg)' }}>
            <h3>Analyzing your course materials…</h3>
            <p style={{ fontSize: '0.82rem' }}>Gemini is processing {course?.name || 'your course'} data</p>
          </div>
          <div className="analysis-progress">
            {ANALYSIS_STEPS.map((step, i) => {
              const isDone = completedSteps.includes(i);
              const isActive = currentStep === i;
              return (
                <div key={i} className={`analysis-step ${isDone ? 'done' : ''} ${isActive ? 'active' : ''}`}>
                  <div className="analysis-step-icon">
                    {isDone ? <Check size={14} /> : isActive ? <Loader2 size={14} className="spin" /> : null}
                  </div>
                  <span className="analysis-step-text">
                    {isDone ? '✓' : ''} {step}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="error-state">
          <AlertCircle size={24} style={{ color: 'var(--danger)', marginBottom: 8 }} />
          <p>{error}</p>
          <button className="btn btn-secondary" onClick={runAnalysis}>
            <RotateCcw size={16} /> Try Again
          </button>
        </div>
      )}

      {/* OCR Analysis Progress */}
      {ocrAnalyzing && (
        <div className="card" style={{ textAlign: 'center', padding: 'var(--space-2xl)' }}>
          <Loader2 size={36} className="spin" style={{ color: 'var(--blue)', marginBottom: 'var(--space-md)', marginInline: 'auto' }} />
          <h3>Gemini is reading the question paper…</h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: 4 }}>
            Performing OCR, extracting questions, mapping topics, and designing targeted practices
          </p>
        </div>
      )}

      {/* OCR Error */}
      {ocrError && (
        <div className="error-state">
          <AlertCircle size={24} style={{ color: 'var(--danger)', marginBottom: 8 }} />
          <p>{ocrError}</p>
          <button className="btn btn-secondary" onClick={runOcrAnalysis}>
            <RotateCcw size={16} /> Try Again
          </button>
        </div>
      )}

      {/* OCR Results */}
      {ocrResults && !ocrAnalyzing && (
        <div>
          <div className="card" style={{ marginBottom: 'var(--space-lg)' }}>
            <div className="flex items-center justify-between mb-md">
              <h3>OCR Question Paper Analysis</h3>
              <button className="btn btn-secondary btn-sm" onClick={() => { setOcrResults(null); setOcrFile(null); }}>
                <RotateCcw size={14} /> Analyze Another Paper
              </button>
            </div>
            
            <div style={{ marginBottom: 'var(--space-lg)' }}>
              <span className="badge badge-medium" style={{ marginBottom: 'var(--space-sm)' }}>Extracted Questions</span>
              <ul style={{ paddingLeft: 'var(--space-lg)', marginTop: 4 }}>
                {ocrResults.extractedQuestions?.map((q: string, idx: number) => (
                  <li key={idx} style={{ fontSize: '0.85rem', color: 'var(--text-primary)', marginBottom: '6px', lineHeight: 1.5 }}>
                    {q}
                  </li>
                ))}
              </ul>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--space-md)', marginTop: 'var(--space-md)' }}>
              <div>
                <span className="badge badge-low" style={{ marginBottom: 'var(--space-xs)' }}>Identified Topics</span>
                <div className="flex gap-xs" style={{ flexWrap: 'wrap', marginTop: 4 }}>
                  {ocrResults.mainTopics?.map((t: string) => (
                    <span key={t} className="badge badge-medium">{t}</span>
                  ))}
                </div>
              </div>
              <div style={{ padding: 'var(--space-md)', background: 'var(--highlight-light)', borderRadius: 'var(--radius-sm)', borderLeft: '3px solid var(--highlight)', marginTop: 'var(--space-sm)' }}>
                <span style={{ fontWeight: 600, fontSize: '0.82rem', color: 'var(--text-primary)' }}>💡 Study Strategy: </span>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{ocrResults.studyTip}</span>
              </div>
            </div>
          </div>

          {/* Suggested Practice */}
          <div className="card">
            <h3 style={{ marginBottom: 'var(--space-lg)' }}>Targeted Practice Recommendations</h3>
            {ocrResults.suggestedPractice?.map((p: any, idx: number) => (
              <div key={idx} className="archetype-card" style={{ borderLeft: '3px solid var(--blue)', paddingLeft: 'var(--space-md)' }}>
                <div style={{ fontSize: '0.88rem', fontWeight: 500, marginBottom: '4px' }}>Practice Question {idx + 1}</div>
                <div className="archetype-question" style={{ background: 'var(--bg)', padding: 'var(--space-md)', borderRadius: 'var(--radius-sm)', fontStyle: 'normal', fontSize: '0.88rem', marginBlock: 'var(--space-sm)', lineHeight: 1.6 }}>
                  {p.question}
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-sm)', flexWrap: 'wrap', marginBottom: 'var(--space-md)' }}>
                  <span className="badge badge-low">{p.topic}</span>
                  {p.hint && <span className="badge badge-medium">Hint available</span>}
                </div>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => navigate(`/practice?topic=${encodeURIComponent(p.topic)}&course=${courseId}`)}
                >
                  <Play size={13} /> Start Practice Session
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      {results && !analyzing && (
        <div>
          {/* Summary */}
          <div className="card" style={{ marginBottom: 'var(--space-lg)' }}>
            <div className="flex items-center justify-between mb-md">
              <h3>Analysis Complete — {results.course || course?.name}</h3>
              <button className="btn btn-secondary btn-sm" onClick={() => { setResults(null); setCompletedSteps([]); }}>
                <RotateCcw size={14} /> New Analysis
              </button>
            </div>
            <p style={{ fontSize: '0.88rem', lineHeight: 1.65 }}>
              {results.summary}
            </p>
            {results.sourcesAnalyzed && (
              <div className="flex gap-md mt-md" style={{ flexWrap: 'wrap' }}>
                <span className="badge badge-medium">
                  {results.sourcesAnalyzed.historicalPapers || '5+'} historical papers
                </span>
                <span className="badge badge-medium">
                  {results.sourcesAnalyzed.totalQuestionsAnalyzed || '20+'} questions analyzed
                </span>
                <span className="badge badge-medium">
                  {results.sourcesAnalyzed.lectureResources || '8+'} lecture resources
                </span>
              </div>
            )}
          </div>

          {/* High-Yield Topics — SIGNATURE VISUAL */}
          <div className="card" style={{ marginBottom: 'var(--space-lg)' }}>
            <div className="card-header">
              <div>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Target size={18} style={{ color: 'var(--highlight)' }} />
                  What should I study first?
                </h3>
                <p className="card-subtitle">Topics ranked by historical recurrence and current relevance</p>
              </div>
            </div>

            {/* Topic Frequency Bars */}
            <div style={{ marginBottom: 'var(--space-xl)' }}>
              {(results.highYieldTopics || []).map((topic: any, i: number) => {
                const ratio = topic.frequencyRatio || (topic.priority === 'high' ? 0.8 : topic.priority === 'medium' ? 0.5 : 0.3);
                return (
                  <div key={i} className="topic-bar">
                    <div className="topic-bar-header">
                      <span className="topic-bar-name">
                        {topic.topic}
                        {topic.priority === 'high' && (
                          <span className="badge badge-high" style={{ marginLeft: 8 }}>High Yield</span>
                        )}
                        {topic.priority === 'medium' && (
                          <span className="badge badge-medium" style={{ marginLeft: 8 }}>Medium</span>
                        )}
                      </span>
                      <span className="topic-bar-freq">{topic.historicalFrequency}</span>
                    </div>
                    <div className="topic-bar-track">
                      <div
                        className={`topic-bar-fill ${topic.priority}`}
                        style={{ width: `${ratio * 100}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Forecast Cards */}
            {(results.highYieldTopics || []).map((topic: any, i: number) => (
              <div key={i} className={`forecast-card ${topic.priority}`}>
                <div className="forecast-rank">#{String(i + 1).padStart(2, '0')}</div>
                <div className="forecast-topic">{topic.topic}</div>
                <div className="forecast-meta">
                  <span className={`badge badge-${topic.priority}`}>{topic.priority} yield</span>
                  <span className="forecast-meta-item">
                    <BookOpen size={13} />
                    {topic.historicalFrequency}
                  </span>
                  {topic.questionPatterns && (
                    <span className="forecast-meta-item">
                      <Target size={13} />
                      {Array.isArray(topic.questionPatterns) ? topic.questionPatterns.join(', ') : topic.questionPatterns}
                    </span>
                  )}
                </div>
                <div className="forecast-rationale">
                  <strong>Why: </strong>{topic.rationale}
                </div>
                {topic.evidence && topic.evidence.length > 0 && (
                  <div style={{ marginBottom: 'var(--space-sm)' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)' }}>Evidence:</span>
                    <ul style={{ paddingLeft: 16, marginTop: 4 }}>
                      {topic.evidence.slice(0, 3).map((ev: string, j: number) => (
                        <li key={j} style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: 2 }}>{ev}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => navigate(`/practice?topic=${encodeURIComponent(topic.topic)}&course=${courseId}`)}
                >
                  <Play size={13} /> Practice This
                </button>
              </div>
            ))}
          </div>

          {/* Teacher Pattern */}
          {results.teacherPattern && (
            <div className="card" style={{ marginBottom: 'var(--space-lg)' }}>
              <h3 style={{ marginBottom: 'var(--space-md)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <TrendingUp size={18} style={{ color: 'var(--blue)' }} />
                Teacher Pattern Intelligence
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 'var(--space-md)', marginBottom: 'var(--space-lg)' }}>
                <div style={{ padding: 'var(--space-md)', background: 'var(--bg)', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Style</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 500, marginTop: 4 }}>{results.teacherPattern.style}</div>
                </div>
                <div style={{ padding: 'var(--space-md)', background: 'var(--bg)', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Repetition</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 500, marginTop: 4 }}>{results.teacherPattern.repetitionTendency || 'Moderate'}</div>
                </div>
                <div style={{ padding: 'var(--space-md)', background: 'var(--bg)', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Lecture Dependency</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 500, marginTop: 4 }}>{results.teacherPattern.lectureDependency || 'High'}</div>
                </div>
              </div>

              {/* Question Type Distribution */}
              {results.teacherPattern.questionTypes && (
                <div className="pattern-distribution">
                  {Object.entries(results.teacherPattern.questionTypes).map(([type, value]: [string, any]) => (
                    <div key={type} className="pattern-bar-wrapper">
                      <div className="pattern-bar-container">
                        <div
                          className="pattern-bar"
                          style={{
                            height: `${Math.max(value, 5)}%`,
                            background: type === 'conceptual' ? 'var(--blue)' :
                              type === 'numerical' ? 'var(--highlight)' :
                              type === 'application' ? 'var(--success)' :
                              type === 'recall' ? 'var(--text-muted)' :
                              'var(--warning)',
                          }}
                        />
                      </div>
                      <div className="pattern-label">{type}</div>
                      <div className="pattern-value">{value}%</div>
                    </div>
                  ))}
                </div>
              )}

              {results.teacherPattern.observations && (
                <div style={{ marginTop: 'var(--space-lg)' }}>
                  <h4 style={{ fontSize: '0.82rem', marginBottom: 'var(--space-sm)' }}>Key Observations</h4>
                  <ul style={{ paddingLeft: 'var(--space-lg)' }}>
                    {results.teacherPattern.observations.map((obs: string, i: number) => (
                      <li key={i} style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 4 }}>{obs}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Likely Question Archetypes */}
          {results.likelyQuestionArchetypes && results.likelyQuestionArchetypes.length > 0 && (
            <div className="card" style={{ marginBottom: 'var(--space-lg)' }}>
              <h3 style={{ marginBottom: 'var(--space-md)' }}>Likely Question Archetypes</h3>
              <p className="card-subtitle" style={{ marginBottom: 'var(--space-lg)' }}>
                Question structures based on historical patterns
              </p>

              {results.likelyQuestionArchetypes.map((arch: any, i: number) => (
                <div key={i} className="archetype-card">
                  <div className="archetype-question">"{arch.archetype}"</div>
                  <div className="archetype-tags">
                    {arch.topic && <span className="badge badge-medium">{arch.topic}</span>}
                    {arch.type && <span className="badge badge-low">{arch.type}</span>}
                  </div>
                  <p className="archetype-reason">
                    <strong>Why:</strong> {arch.rationale}
                  </p>
                  {arch.relatedHistorical && arch.relatedHistorical.length > 0 && (
                    <div style={{ marginTop: 'var(--space-sm)', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      <strong>Related historical:</strong> {arch.relatedHistorical.join(' | ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Study Plan */}
          {results.studyPlan && results.studyPlan.length > 0 && (
            <div className="card" style={{ marginBottom: 'var(--space-lg)' }}>
              <h3 style={{ marginBottom: 'var(--space-md)' }}>Your Revision Plan</h3>
              <p className="card-subtitle" style={{ marginBottom: 'var(--space-md)' }}>
                Optimized for {studyHours} hours of study time
              </p>

              {results.studyPlan.map((step: any, i: number) => (
                <div key={i} className="study-plan-item">
                  <div className="study-plan-order">{step.order || i + 1}</div>
                  <div className="study-plan-content" style={{ flex: 1 }}>
                    <h4>{step.topic}</h4>
                    <p>{step.action}</p>
                    {step.reason && (
                      <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                        {step.reason}
                      </p>
                    )}
                  </div>
                  {step.timeEstimate && (
                    <span className="study-plan-time">{step.timeEstimate}</span>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Readiness */}
          {results.readiness && (
            <div className="card">
              <h3 style={{ marginBottom: 'var(--space-md)' }}>Exam Readiness</h3>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 'var(--space-sm)' }}>
                Demo readiness — based on available analysis data
              </p>
              <div className="readiness-gauge">
                <div className="gauge-ring">
                  <svg viewBox="0 0 80 80" width="80" height="80">
                    <circle className="gauge-bg" cx="40" cy="40" r="34" />
                    <circle
                      className="gauge-fill"
                      cx="40" cy="40" r="34"
                      stroke={results.readiness.topicsCovered / results.readiness.totalTopics > 0.6 ? 'var(--success)' : 'var(--warning)'}
                      strokeDasharray={`${2 * Math.PI * 34}`}
                      strokeDashoffset={`${2 * Math.PI * 34 * (1 - (results.readiness.topicsCovered || 0) / (results.readiness.totalTopics || 1))}`}
                    />
                  </svg>
                  <div className="gauge-value">
                    {Math.round(((results.readiness.topicsCovered || 0) / (results.readiness.totalTopics || 1)) * 100)}%
                  </div>
                </div>
                <div>
                  <p style={{ fontSize: '0.88rem', fontWeight: 500 }}>
                    {results.readiness.topicsCovered} of {results.readiness.totalTopics} key topics covered
                  </p>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    {results.readiness.overallAssessment}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
