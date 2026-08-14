import { useNavigate } from 'react-router-dom';
import {
  BrainCircuit, MessageSquareText, FolderSearch, Dumbbell,
  CalendarClock, ArrowRight, TrendingUp, AlertCircle, Plus,
  BookOpen, Sparkles, ChevronRight, Target, Check,
} from 'lucide-react';
import { UserProfile, COURSES, getCourseName, Deadline } from '../data/courses';

interface DashboardProps {
  user: UserProfile;
  deadlines: Deadline[];
  setDeadlines: (deadlines: Deadline[]) => void;
  analysisCache: Record<string, any>;
  practiceHistory: any[];
}

export default function Dashboard({ user, deadlines, setDeadlines, analysisCache, practiceHistory }: DashboardProps) {
  const navigate = useNavigate();

  const toggleComplete = (id: string) => {
    setDeadlines(deadlines.map(d =>
      d.id === id
        ? { ...d, status: d.status === 'done' ? 'not-started' : 'done' as any }
        : d
    ));
  };

  const now = new Date();
  const hours = now.getHours();
  const greeting = hours < 12 ? 'Good morning' : hours < 17 ? 'Good afternoon' : 'Good evening';

  const upcomingDeadlines = deadlines
    .filter(d => d.status !== 'done')
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 3);

  const urgentCount = upcomingDeadlines.filter(d => {
    const diff = new Date(d.dueDate).getTime() - Date.now();
    return diff < 2 * 24 * 60 * 60 * 1000;
  }).length;

  const hasAnalysis = Object.keys(analysisCache).length > 0;
  const firstAnalysis = hasAnalysis ? Object.values(analysisCache)[0] : null;
  const firstAnalysisKey = hasAnalysis ? Object.keys(analysisCache)[0] : null;
  const firstAnalysisCourse = firstAnalysisKey ? getCourseName(firstAnalysisKey.split('_')[0]) : '';

  const weakTopics = practiceHistory.filter((p: any) => p.score !== undefined && p.score < 60).length;

  const attentionItems = urgentCount + (hasAnalysis ? 1 : 0) + (weakTopics > 0 ? 1 : 0);

  const formatDueDate = (date: string) => {
    const d = new Date(date);
    const diff = d.getTime() - Date.now();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    if (days < 0) return 'Overdue';
    if (days === 0) return 'Due today';
    if (days === 1) return 'Due tomorrow';
    return `Due in ${days} days`;
  };

  return (
    <div>
      {/* Greeting */}
      <div className="greeting-section">
        <h1>{greeting}, {user.name}.</h1>
        <p className="subtitle">{user.department} · {user.department} {user.series}</p>
      </div>

      <div className="dashboard-grid">
        {/* Academic Pulse */}
        <div className="card pulse-card">
          <div className="flex items-center gap-sm mb-sm">
            <AlertCircle size={18} />
            <h4>Academic Pulse</h4>
          </div>
          <p style={{ fontSize: '1.4rem', fontWeight: 700, color: 'white', marginBottom: 4 }}>
            {attentionItems > 0 ? attentionItems : 'No'} {attentionItems === 1 ? 'thing needs' : 'things need'} attention today.
          </p>
          <p style={{ fontSize: '0.78rem' }}>
            {urgentCount > 0 && `${urgentCount} urgent deadline${urgentCount > 1 ? 's' : ''}`}
            {urgentCount > 0 && weakTopics > 0 && ' · '}
            {weakTopics > 0 && `${weakTopics} weak topic${weakTopics > 1 ? 's' : ''} detected`}
          </p>
        </div>

        {/* Upcoming Assessment */}
        <div className="card">
          <div className="flex items-center gap-sm mb-sm">
            <CalendarClock size={16} style={{ color: 'var(--warning)' }} />
            <h4 style={{ fontSize: '0.82rem' }}>Upcoming Assessment</h4>
          </div>
          {upcomingDeadlines.length > 0 ? (
            <>
              <p style={{ fontWeight: 500, fontSize: '0.95rem', marginBottom: 4 }}>
                {upcomingDeadlines[0].title}
              </p>
              <p className={`mono ${new Date(upcomingDeadlines[0].dueDate).getTime() - Date.now() < 2 * 24 * 60 * 60 * 1000 ? '' : ''}`}
                style={{ fontSize: '0.78rem', color: new Date(upcomingDeadlines[0].dueDate).getTime() - Date.now() < 2 * 24 * 60 * 60 * 1000 ? 'var(--danger)' : 'var(--text-muted)' }}>
                {formatDueDate(upcomingDeadlines[0].dueDate)}
              </p>
            </>
          ) : (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No upcoming assessments</p>
          )}
        </div>

        {/* Exam Intelligence CTA */}
        <div className="card" style={{ borderLeft: '3px solid var(--highlight)', cursor: 'pointer' }} onClick={() => navigate('/exam-intelligence')}>
          <div className="flex items-center gap-sm mb-sm">
            <BrainCircuit size={16} style={{ color: 'var(--highlight)' }} />
            <h4 style={{ fontSize: '0.82rem' }}>Exam Intelligence</h4>
          </div>
          {hasAnalysis && firstAnalysis ? (
            <>
              <p style={{ fontWeight: 500, fontSize: '0.88rem', marginBottom: 4 }}>{firstAnalysisCourse}</p>
              <span className="badge badge-high">
                {firstAnalysis.highYieldTopics?.length || 0} high-yield topics detected
              </span>
            </>
          ) : (
            <>
              <p style={{ fontWeight: 500, fontSize: '0.88rem', marginBottom: 4 }}>Analyze your courses</p>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Discover what to study first</p>
            </>
          )}
          <button className="btn btn-highlight btn-sm" style={{ marginTop: 'var(--space-sm)' }}>
            <Sparkles size={13} /> View Exam Forecast
          </button>
        </div>

        {/* Next Best Action */}
        <div className="card next-action-card span-2">
          <div className="flex items-center gap-sm mb-md">
            <Target size={16} style={{ color: 'var(--highlight)' }} />
            <h4 style={{ fontSize: '0.82rem' }}>Your Next Best Action</h4>
          </div>
          {hasAnalysis && firstAnalysis?.highYieldTopics?.[0] ? (
            <>
              <p className="action-text">
                Review {firstAnalysis.highYieldTopics[0].topic}, then practice recurring question types.
              </p>
              <div className="action-reason">
                <Lightbulb size={13} style={{ marginRight: 4, verticalAlign: 'middle', color: 'var(--text-muted)' }} />
                {firstAnalysis.highYieldTopics[0].rationale || 'Frequently tested historically and currently covered in your course materials.'}
              </div>
              <button className="btn btn-primary btn-sm" onClick={() => navigate(`/practice?topic=${encodeURIComponent(firstAnalysis.highYieldTopics[0].topic)}`)}>
                <ArrowRight size={14} /> Start Now
              </button>
            </>
          ) : (
            <>
              <p className="action-text">
                Run Exam Intelligence analysis to discover what to study first.
              </p>
              <div className="action-reason">
                Arohon analyzes historical question patterns, teacher tendencies, and current course material to recommend your priorities.
              </div>
              <button className="btn btn-primary btn-sm" onClick={() => navigate('/exam-intelligence')}>
                <BrainCircuit size={14} /> Analyze Exam Patterns
              </button>
            </>
          )}
        </div>

        {/* Quick Stats */}
        <div className="card">
          <h4 style={{ fontSize: '0.82rem', marginBottom: 'var(--space-md)' }}>Quick Stats</h4>
          <div style={{ display: 'grid', gap: 'var(--space-sm)' }}>
            <div className="flex items-center justify-between">
              <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Courses enrolled</span>
              <span className="mono" style={{ fontWeight: 600 }}>{user.courses.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Analyses completed</span>
              <span className="mono" style={{ fontWeight: 600 }}>{Object.keys(analysisCache).length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Practice attempts</span>
              <span className="mono" style={{ fontWeight: 600 }}>{practiceHistory.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Pending deadlines</span>
              <span className="mono" style={{ fontWeight: 600 }}>{upcomingDeadlines.length}</span>
            </div>
          </div>
        </div>

        {/* Deadlines */}
        <div className="card span-2">
          <div className="flex items-center justify-between mb-md">
            <h4 style={{ fontSize: '0.82rem' }}>Upcoming Deadlines</h4>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/deadlines')}>
              View All <ChevronRight size={14} />
            </button>
          </div>
          {upcomingDeadlines.length > 0 ? (
            <div style={{ display: 'grid', gap: 'var(--space-sm)' }}>
              {upcomingDeadlines.map(dl => (
                <div key={dl.id} className="deadline-item">
                  <div
                    className={`deadline-status ${dl.status === 'done' ? 'done' : ''}`}
                    onClick={() => toggleComplete(dl.id)}
                    role="checkbox"
                    aria-checked={dl.status === 'done'}
                    tabIndex={0}
                    onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') toggleComplete(dl.id); }}
                    style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    {dl.status === 'done' && <Check size={12} style={{ color: 'white' }} />}
                  </div>
                  <div className="deadline-info">
                    <div className="deadline-title">{dl.title}</div>
                    <div className="deadline-course">{getCourseName(dl.courseId)}</div>
                  </div>
                  <span className={`deadline-due ${new Date(dl.dueDate).getTime() - Date.now() < 2 * 24 * 60 * 60 * 1000 ? 'urgent' : ''}`}>
                    {formatDueDate(dl.dueDate)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>No upcoming deadlines</p>
          )}
        </div>

        {/* Quick Actions */}
        <div className="card">
          <h4 style={{ fontSize: '0.82rem', marginBottom: 'var(--space-md)' }}>Quick Actions</h4>
          <div className="quick-actions" style={{ flexDirection: 'column' }}>
            <button className="quick-action" onClick={() => navigate('/exam-intelligence')}>
              <BrainCircuit size={15} /> Analyze Exam
            </button>
            <button className="quick-action" onClick={() => navigate('/copilot')}>
              <MessageSquareText size={15} /> Ask Course Copilot
            </button>
            <button className="quick-action" onClick={() => navigate('/resources')}>
              <FolderSearch size={15} /> Find Resources
            </button>
            <button className="quick-action" onClick={() => navigate('/practice')}>
              <Dumbbell size={15} /> Practice
            </button>
            <button className="quick-action" onClick={() => navigate('/deadlines')}>
              <Plus size={15} /> Add Deadline
            </button>
          </div>
        </div>
      </div>

      {/* Brand Statement */}
      <div style={{ textAlign: 'center', padding: 'var(--space-2xl) 0 var(--space-lg)', maxWidth: 500, margin: '0 auto' }}>
        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.7 }}>
          <strong style={{ color: 'var(--text-secondary)' }}>Arohon is not another LMS.</strong> It helps you find patterns, understand what matters, prepare intelligently, and know what to do next.
        </p>
      </div>
    </div>
  );
}

function Lightbulb(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 16} height={props.size || 16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={props.style}>
      <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/>
    </svg>
  );
}
