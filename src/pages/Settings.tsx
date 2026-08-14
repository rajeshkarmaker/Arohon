import { useState } from 'react';
import { Settings as SettingsIcon, User, BookOpen, Save, Check } from 'lucide-react';
import { UserProfile, COURSES, DEPARTMENTS } from '../data/courses';

interface SettingsProps {
  user: UserProfile;
  setUser: (user: UserProfile) => void;
}

export default function Settings({ user, setUser }: SettingsProps) {
  const [name, setName] = useState(user.name);
  const [department, setDepartment] = useState(user.department);
  const [series, setSeries] = useState(user.series);
  const [courses, setCourses] = useState(user.courses);
  const [studyHours, setStudyHours] = useState(user.studyHoursPerDay || 4);
  const [saved, setSaved] = useState(false);

  const toggleCourse = (courseId: string) => {
    setCourses(prev =>
      prev.includes(courseId)
        ? prev.filter(c => c !== courseId)
        : [...prev, courseId]
    );
  };

  const handleSave = () => {
    setUser({
      ...user,
      name,
      department,
      series,
      courses,
      studyHoursPerDay: studyHours,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const clearData = () => {
    if (window.confirm('Clear all local data? This will reset analysis cache, practice history, and deadlines.')) {
      localStorage.removeItem('arohon_analysis');
      localStorage.removeItem('arohon_practice');
      localStorage.removeItem('arohon_deadlines');
      window.location.reload();
    }
  };

  const resetProfile = () => {
    if (window.confirm('Reset your profile? You will see the onboarding screen again.')) {
      localStorage.removeItem('arohon_user');
      window.location.reload();
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <div className="flex items-center gap-sm mb-lg">
        <SettingsIcon size={20} style={{ color: 'var(--blue)' }} />
        <h2>Settings</h2>
      </div>

      <div className="card" style={{ marginBottom: 'var(--space-lg)' }}>
        <h3 style={{ marginBottom: 'var(--space-lg)' }}>
          <User size={16} style={{ marginRight: 8, verticalAlign: 'middle' }} />
          Profile
        </h3>

        <div className="form-group">
          <label className="form-label">Name</label>
          <input className="form-input" value={name} onChange={e => setName(e.target.value)} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
          <div className="form-group">
            <label className="form-label">Department</label>
            <select className="form-select" value={department} onChange={e => setDepartment(e.target.value)}>
              {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Series</label>
            <input className="form-input" value={series} onChange={e => setSeries(e.target.value)} />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Study Hours per Day</label>
          <input className="form-input" type="number" min="1" max="16" value={studyHours} onChange={e => setStudyHours(parseInt(e.target.value) || 4)} />
        </div>
      </div>

      <div className="card" style={{ marginBottom: 'var(--space-lg)' }}>
        <h3 style={{ marginBottom: 'var(--space-md)' }}>
          <BookOpen size={16} style={{ marginRight: 8, verticalAlign: 'middle' }} />
          Courses
        </h3>
        <div className="checkbox-group">
          {COURSES.filter(c => c.department === department).map(course => (
            <label key={course.id} className="checkbox-label">
              <input
                type="checkbox"
                checked={courses.includes(course.id)}
                onChange={() => toggleCourse(course.id)}
              />
              {course.name} ({course.code})
            </label>
          ))}
        </div>
      </div>

      <div className="flex gap-sm mb-lg">
        <button className="btn btn-primary" onClick={handleSave}>
          {saved ? <><Check size={16} /> Saved!</> : <><Save size={16} /> Save Changes</>}
        </button>
      </div>

      <div className="card" style={{ borderColor: 'var(--danger-light)' }}>
        <h4 style={{ fontSize: '0.85rem', marginBottom: 'var(--space-md)', color: 'var(--danger)' }}>Danger Zone</h4>
        <div className="flex gap-sm">
          <button className="btn btn-secondary btn-sm" onClick={clearData}>
            Clear Analysis & Practice Data
          </button>
          <button className="btn btn-secondary btn-sm" onClick={resetProfile} style={{ color: 'var(--danger)' }}>
            Reset Profile
          </button>
        </div>
      </div>
    </div>
  );
}
