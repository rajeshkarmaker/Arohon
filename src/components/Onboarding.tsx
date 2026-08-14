import { useState } from 'react';
import { UserProfile, COURSES, DEPARTMENTS } from '../data/courses';

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [name, setName] = useState('Rajesh');
  const [department, setDepartment] = useState('CSE');
  const [series, setSeries] = useState('25');
  const [selectedCourses, setSelectedCourses] = useState<string[]>(['chem-1101', 'phy-1101', 'math-1101']);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete({
      name: name || 'Student',
      department: department || 'CSE',
      series: series || '25',
      courses: selectedCourses.length > 0 ? selectedCourses : ['chem-1101'],
    });
  };

  const toggleCourse = (courseId: string) => {
    setSelectedCourses(prev =>
      prev.includes(courseId)
        ? prev.filter(c => c !== courseId)
        : [...prev, courseId]
    );
  };

  const deptCourses = COURSES.filter(c => c.department === department);

  return (
    <div className="onboarding-overlay">
      <div className="onboarding-card">
        <h1>AROHON</h1>
        <p className="tagline">Rise through smarter learning.</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="onboard-name">Your Name</label>
            <input
              id="onboard-name"
              className="form-input"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Enter your name"
              autoFocus
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="onboard-dept">Department</label>
              <select
                id="onboard-dept"
                className="form-select"
                value={department}
                onChange={e => setDepartment(e.target.value)}
              >
                {DEPARTMENTS.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="onboard-series">Series</label>
              <input
                id="onboard-series"
                className="form-input"
                value={series}
                onChange={e => setSeries(e.target.value)}
                placeholder="e.g. 25"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Your Courses</label>
            <div className="checkbox-group">
              {deptCourses.map(course => (
                <label key={course.id} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={selectedCourses.includes(course.id)}
                    onChange={() => toggleCourse(course.id)}
                  />
                  <span>{course.name}</span>
                </label>
              ))}
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-lg w-full" style={{ marginTop: '8px' }}>
            Get Started
          </button>
        </form>

        <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '16px' }}>
          AI-powered academic intelligence for RUET students
        </p>
      </div>
    </div>
  );
}
