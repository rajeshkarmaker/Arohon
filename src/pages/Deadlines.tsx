import { useState } from 'react';
import {
  CalendarClock, Plus, Edit3, Trash2, Check, X,
  AlertCircle, ChevronDown,
} from 'lucide-react';
import { Deadline, COURSES, getCourseName } from '../data/courses';

interface DeadlinesProps {
  deadlines: Deadline[];
  setDeadlines: (deadlines: Deadline[]) => void;
}

export default function Deadlines({ deadlines, setDeadlines }: DeadlinesProps) {
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'done'>('active');

  const [title, setTitle] = useState('');
  const [courseId, setCourseId] = useState('chem-1101');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setDueDate('');
    setPriority('medium');
    setCourseId('chem-1101');
    setEditId(null);
    setShowForm(false);
  };

  const handleSave = () => {
    if (!title.trim() || !dueDate) return;

    if (editId) {
      setDeadlines(deadlines.map(d =>
        d.id === editId
          ? { ...d, title, courseId, description, dueDate: new Date(dueDate).toISOString(), priority }
          : d
      ));
    } else {
      const newDeadline: Deadline = {
        id: `dl_${Date.now()}`,
        title,
        courseId,
        description,
        dueDate: new Date(dueDate).toISOString(),
        priority,
        status: 'not-started',
      };
      setDeadlines([...deadlines, newDeadline]);
    }
    resetForm();
  };

  const handleEdit = (d: Deadline) => {
    setTitle(d.title);
    setCourseId(d.courseId);
    setDescription(d.description);
    setDueDate(new Date(d.dueDate).toISOString().slice(0, 16));
    setPriority(d.priority);
    setEditId(d.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    setDeadlines(deadlines.filter(d => d.id !== id));
  };

  const toggleComplete = (id: string) => {
    setDeadlines(deadlines.map(d =>
      d.id === id
        ? { ...d, status: d.status === 'done' ? 'not-started' : 'done' as any }
        : d
    ));
  };

  const filtered = deadlines
    .filter(d => {
      if (filter === 'active') return d.status !== 'done';
      if (filter === 'done') return d.status === 'done';
      return true;
    })
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  const formatDueDate = (date: string) => {
    const d = new Date(date);
    const diff = d.getTime() - Date.now();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    if (days < 0) return 'Overdue';
    if (days === 0) return 'Due today';
    if (days === 1) return 'Due tomorrow';
    if (days <= 7) return `Due in ${days} days`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      <div className="flex items-center justify-between mb-lg">
        <div className="flex items-center gap-sm">
          <CalendarClock size={20} style={{ color: 'var(--blue)' }} />
          <h2>Deadlines</h2>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          <Plus size={16} /> Add Deadline
        </button>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button className={`tab ${filter === 'active' ? 'active' : ''}`} onClick={() => setFilter('active')}>
          Active ({deadlines.filter(d => d.status !== 'done').length})
        </button>
        <button className={`tab ${filter === 'done' ? 'active' : ''}`} onClick={() => setFilter('done')}>
          Completed ({deadlines.filter(d => d.status === 'done').length})
        </button>
        <button className={`tab ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
          All ({deadlines.length})
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="card" style={{ marginBottom: 'var(--space-lg)' }}>
          <div className="flex items-center justify-between mb-md">
            <h3>{editId ? 'Edit Deadline' : 'New Deadline'}</h3>
            <button className="btn btn-ghost" onClick={resetForm}><X size={16} /></button>
          </div>
          <div className="form-group">
            <label className="form-label">Title</label>
            <input className="form-input" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Chemistry Assignment" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
            <div className="form-group">
              <label className="form-label">Course</label>
              <select className="form-select" value={courseId} onChange={e => setCourseId(e.target.value)}>
                {COURSES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Priority</label>
              <select className="form-select" value={priority} onChange={e => setPriority(e.target.value as any)}>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Due Date</label>
            <input className="form-input" type="datetime-local" value={dueDate} onChange={e => setDueDate(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Description (optional)</label>
            <textarea className="form-textarea" value={description} onChange={e => setDescription(e.target.value)} placeholder="Details…" rows={3} />
          </div>
          <div className="flex gap-sm">
            <button className="btn btn-primary" onClick={handleSave} disabled={!title.trim() || !dueDate}>
              {editId ? 'Update' : 'Add Deadline'}
            </button>
            <button className="btn btn-secondary" onClick={resetForm}>Cancel</button>
          </div>
        </div>
      )}

      {/* List */}
      {filtered.length > 0 ? (
        <div style={{ display: 'grid', gap: 'var(--space-sm)' }}>
          {filtered.map(d => {
            const isUrgent = new Date(d.dueDate).getTime() - Date.now() < 2 * 24 * 60 * 60 * 1000 && d.status !== 'done';
            return (
              <div key={d.id} className={`deadline-item ${d.status === 'done' ? 'completed' : ''}`}>
                <div
                  className={`deadline-status ${d.status === 'done' ? 'done' : ''}`}
                  onClick={() => toggleComplete(d.id)}
                  role="checkbox"
                  aria-checked={d.status === 'done'}
                  tabIndex={0}
                  onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') toggleComplete(d.id); }}
                >
                  {d.status === 'done' && <Check size={12} style={{ color: 'white' }} />}
                </div>
                <div className="deadline-info">
                  <div className="deadline-title">{d.title}</div>
                  <div className="deadline-course">
                    {getCourseName(d.courseId)}
                    {d.priority === 'high' && <span className="badge badge-danger" style={{ marginLeft: 8 }}>High</span>}
                  </div>
                </div>
                <span className={`deadline-due ${isUrgent ? 'urgent' : ''}`}>
                  {formatDueDate(d.dueDate)}
                </span>
                <div className="deadline-actions">
                  <button className="btn btn-ghost btn-sm" onClick={() => handleEdit(d)} aria-label="Edit">
                    <Edit3 size={14} />
                  </button>
                  <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(d.id)} aria-label="Delete">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="empty-state">
          <CalendarClock size={48} />
          <h3>No {filter === 'done' ? 'completed' : 'active'} deadlines</h3>
          <p>{filter === 'active' ? 'Add your first deadline to stay on track.' : 'Completed deadlines will appear here.'}</p>
          {filter === 'active' && (
            <button className="btn btn-primary" onClick={() => setShowForm(true)}>
              <Plus size={16} /> Add Deadline
            </button>
          )}
        </div>
      )}
    </div>
  );
}
