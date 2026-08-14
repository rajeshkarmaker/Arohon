import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  FolderSearch, Search, BookOpen, FileText,
  MessageSquareText, BrainCircuit, ExternalLink,
  Folder, FolderOpen, Library, CheckCircle2, CloudDownload,
  CloudLightning, AlertCircle, Info,
} from 'lucide-react';
import { UserProfile, DEMO_RESOURCES, COURSES, RESOURCE_TYPES, Resource, getCourseName } from '../data/courses';

interface ResourceHubProps {
  user: UserProfile;
}

const ARCHIVE_DIRECTORIES = {
  '1-1': {
    name: '1st Year (1-1) drive',
    driveId: '1l7a6E_dt9Jg4woxOiW8EnzHtRGTo0EbP',
    files: [
      { id: 'arc-1', title: 'Chem 1101 - Lecture Slides (Full Set)', courseId: 'chem-1101', type: 'lecture-slides', topic: 'Chemical Bonding & Hybridization', size: '12.4 MB' },
      { id: 'arc-2', title: 'Chem 1101 - CT Questions 2020-2023', courseId: 'chem-1101', type: 'ct-questions', topic: 'Exam Papers', size: '2.1 MB' },
      { id: 'arc-3', title: 'Phy 1101 - Wave Optics Lecture Notes', courseId: 'phy-1101', type: 'lecture-slides', topic: 'Interference & Diffraction', size: '8.7 MB' },
      { id: 'arc-4', title: 'Phy 1101 - Einstein Photoelectric Sheet', courseId: 'phy-1101', type: 'exercises', topic: 'Quantum Physics', size: '1.2 MB' },
      { id: 'arc-5', title: 'Math 1101 - Successive Differentiation Solved Problems', courseId: 'math-1101', type: 'senior-notes', topic: 'Calculus', size: '4.5 MB' },
      { id: 'arc-6', title: 'EEE 1101 - Nodal & Mesh Analysis Slides', courseId: 'eee-1101', type: 'lecture-slides', topic: 'Circuit Theory', size: '6.3 MB' },
      { id: 'arc-7', title: 'EEE 1101 - Lab Manual', courseId: 'eee-1101', type: 'lab-manual', topic: 'Circuit Experiments', size: '3.1 MB' },
      { id: 'arc-8', title: 'CSE 1101 - K-Map Simplification Guide', courseId: 'cse-1101', type: 'senior-notes', topic: 'Logic Gates', size: '5.2 MB' }
    ]
  },
  '1-2': {
    name: '1st Year (1-2) drive',
    driveId: '1ANRGpNCCFHhsQk8MnjHs_cT6Jl4zkcLT',
    files: [
      { id: 'arc-9', title: 'CSE 1201 - Data Structures Lecture Slides', courseId: 'cse-1101', type: 'lecture-slides', topic: 'Data Structures', size: '10.1 MB' },
      { id: 'arc-10', title: 'CSE 1201 - Array & Linked List Problems', courseId: 'cse-1101', type: 'exercises', topic: 'Data Structures Practice', size: '1.8 MB' },
      { id: 'arc-11', title: 'Math 1201 - Coordinate Geometry Formulas', courseId: 'math-1101', type: 'reference', topic: 'Geometry', size: '2.7 MB' }
    ]
  },
  '2-1': {
    name: '2nd Year (2-1) drive',
    driveId: '1zxDdCdFiquVKO86oOLXKxMsSCJalHld_',
    files: [
      { id: 'arc-12', title: 'CSE 2101 - Object Oriented Programming Guide', courseId: 'cse-1101', type: 'reference', topic: 'OOP Java/C++', size: '14.2 MB' },
      { id: 'arc-13', title: 'CSE 2101 - CT Papers 2021-2023', courseId: 'cse-1101', type: 'ct-questions', topic: 'OOP Exam', size: '3.4 MB' }
    ]
  },
  'books': {
    name: 'Digital Bookshelf drive',
    driveId: '1eV35EzY4CCWv4lu5BWYmAOn3vcV0LWiX',
    files: [
      { id: 'arc-14', title: 'University Physics - Sears & Zemansky', courseId: 'phy-1101', type: 'reference', topic: 'Reference Book', size: '48.5 MB' },
      { id: 'arc-15', title: 'Organic Chemistry - Morrison & Boyd', courseId: 'chem-1101', type: 'reference', topic: 'Reference Book', size: '36.8 MB' },
      { id: 'arc-16', title: 'Higher Engineering Mathematics - B.S. Grewal', courseId: 'math-1101', type: 'reference', topic: 'Reference Book', size: '52.1 MB' }
    ]
  }
};

export default function ResourceHub({ user }: ResourceHubProps) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'local' | 'archive'>('local');
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [courseFilter, setCourseFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => {
    const q = searchParams.get('search') || '';
    setSearch(q);
  }, [searchParams]);
  
  // Loaded active resources
  const [localResources, setLocalResources] = useState<Resource[]>(() => {
    const saved = localStorage.getItem('arohon_resources');
    return saved ? JSON.parse(saved) : DEMO_RESOURCES;
  });

  // Archive state
  const [selectedDir, setSelectedDir] = useState<keyof typeof ARCHIVE_DIRECTORIES>('1-1');
  const [syncingAll, setSyncingAll] = useState(false);

  useEffect(() => {
    localStorage.setItem('arohon_resources', JSON.stringify(localResources));
  }, [localResources]);

  const filtered = localResources.filter(r => {
    const matchesSearch = !search ||
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.topic?.toLowerCase().includes(search.toLowerCase()) ||
      r.summary?.toLowerCase().includes(search.toLowerCase());
    const matchesCourse = courseFilter === 'all' || r.courseId === courseFilter;
    const matchesType = typeFilter === 'all' || r.type === typeFilter;
    return matchesSearch && matchesCourse && matchesType;
  });

  const getTypeLabel = (type: string) => {
    return RESOURCE_TYPES.find(t => t.value === type)?.label || type;
  };

  const getTypeColor = (type: string): string => {
    const colors: Record<string, string> = {
      'ct-questions': 'var(--highlight)',
      'final-questions': 'var(--danger)',
      'lecture-slides': 'var(--blue)',
      'senior-notes': 'var(--success)',
      'reference': 'var(--text-muted)',
      'lab-manual': 'var(--warning)',
    };
    return colors[type] || 'var(--text-muted)';
  };

  const isIngested = (fileId: string) => {
    return localResources.some(r => r.id === fileId);
  };

  const ingestFile = (file: any) => {
    if (isIngested(file.id)) return;
    const newResource: Resource = {
      id: file.id,
      title: file.title,
      courseId: file.courseId,
      type: file.type,
      topic: file.topic,
      source: 'RUET CSE Archive Drive',
      summary: `Imported resource covering ${file.topic}. File Size: ${file.size}. Ready for AI grounded queries.`
    };
    setLocalResources(prev => [newResource, ...prev]);
  };

  const syncAllFiles = () => {
    setSyncingAll(true);
    const directory = ARCHIVE_DIRECTORIES[selectedDir];
    setTimeout(() => {
      directory.files.forEach(f => {
        ingestFile(f);
      });
      setSyncingAll(false);
    }, 1200);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-lg" style={{ flexWrap: 'wrap', gap: 'var(--space-md)' }}>
        <div className="flex items-center gap-sm">
          <FolderSearch size={20} style={{ color: 'var(--blue)' }} />
          <h2>Resource Hub</h2>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs" style={{ marginBottom: 'var(--space-md)' }}>
        <button
          className={`tab ${activeTab === 'local' ? 'active' : ''}`}
          onClick={() => setActiveTab('local')}
        >
          My Ingested Materials ({localResources.length})
        </button>
        <button
          className={`tab ${activeTab === 'archive' ? 'active' : ''}`}
          onClick={() => setActiveTab('archive')}
        >
          RUET CSE Archive Google Drive
        </button>
      </div>

      {activeTab === 'local' ? (
        <>
          {/* Filters */}
          <div className="card" style={{ marginBottom: 'var(--space-lg)', padding: 'var(--space-md)' }}>
            <div style={{ display: 'flex', gap: 'var(--space-md)', flexWrap: 'wrap', alignItems: 'center' }}>
              <div className="search-wrapper" style={{ flex: 1, minWidth: 200 }}>
                <Search />
                <input
                  className="search-input"
                  value={search}
                  onChange={e => { setSearch(e.target.value); setSearchParams(e.target.value ? { search: e.target.value } : {}); }}
                  placeholder="Search local resources, topics, questions…"
                />
              </div>
              <select className="form-select" value={courseFilter} onChange={e => setCourseFilter(e.target.value)} style={{ maxWidth: 180 }}>
                <option value="all">All Courses</option>
                {COURSES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <select className="form-select" value={typeFilter} onChange={e => setTypeFilter(e.target.value)} style={{ maxWidth: 180 }}>
                <option value="all">All Types</option>
                {RESOURCE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
          </div>

          {/* Results */}
          {filtered.length > 0 ? (
            <div className="grid grid-2">
              {filtered.map(resource => (
                <div key={resource.id} className="resource-card">
                  <div className="flex items-center justify-between mb-sm">
                    <span className="resource-type-badge" style={{ borderLeft: `3px solid ${getTypeColor(resource.type)}`, paddingLeft: 8 }}>
                      {getTypeLabel(resource.type)}
                    </span>
                    {resource.year && <span className="mono" style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{resource.year}</span>}
                  </div>
                  <h4 style={{ fontSize: '0.88rem', marginBottom: 4 }}>{resource.title}</h4>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 8 }}>
                    {getCourseName(resource.courseId)}{resource.topic ? ` · ${resource.topic}` : ''}
                  </p>
                  {resource.summary && (
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: 'var(--space-md)' }}>
                      {resource.summary}
                    </p>
                  )}
                  {resource.source && (
                    <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: 'var(--space-sm)' }}>
                      Source: {resource.source}
                    </p>
                  )}
                  <div className="flex gap-xs">
                    <button className="btn btn-ghost btn-sm" onClick={() => navigate('/copilot')}>
                      <MessageSquareText size={13} /> Ask AI
                    </button>
                    <button className="btn btn-ghost btn-sm" onClick={() => navigate('/exam-intelligence')}>
                      <BrainCircuit size={13} /> Analyze Exam
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <FolderSearch size={48} />
              <h3>No resources found</h3>
              <p>Try adjusting your search or filters. Sync materials from the RUET CSE Archive Drive tab to load study templates.</p>
              <button className="btn btn-primary" onClick={() => setActiveTab('archive')}>
                <CloudLightning size={16} /> Sync from RUET Drive
              </button>
            </div>
          )}
        </>
      ) : (
        /* RUET ARCHIVE DRIVE VIEWER */
        <div>
          {/* Connection Card */}
          <div className="card" style={{ marginBottom: 'var(--space-lg)', background: 'linear-gradient(135deg, #14212b 0%, #1e3647 100%)', color: 'white' }}>
            <div className="flex items-center justify-between" style={{ flexWrap: 'wrap', gap: 'var(--space-sm)' }}>
              <div>
                <h3 style={{ color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CloudLightning style={{ color: 'var(--highlight)' }} />
                  RUET CSE Archive Drive Connector
                </h3>
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.82rem', marginTop: 4 }}>
                  Browse folders hosted in the official RUET csearchive Drive.
                </p>
              </div>
              <a
                href={`https://ruetcsearchive.app/drive/${ARCHIVE_DIRECTORIES[selectedDir].driveId}`}
                target="_blank"
                rel="noreferrer"
                className="btn btn-highlight btn-sm"
              >
                Open in Web <ExternalLink size={12} />
              </a>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 'var(--space-lg)', alignItems: 'start' }}>
            {/* Folder list */}
            <div className="card" style={{ padding: 'var(--space-sm)' }}>
              <div style={{ padding: '8px 12px', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                Folders
              </div>
              {Object.entries(ARCHIVE_DIRECTORIES).map(([key, dir]) => {
                const isActive = selectedDir === key;
                return (
                  <button
                    key={key}
                    onClick={() => setSelectedDir(key as any)}
                    className="nav-item"
                    style={{
                      color: isActive ? 'var(--blue)' : 'var(--text-secondary)',
                      background: isActive ? 'var(--blue-light)' : 'transparent',
                      fontWeight: isActive ? 600 : 400,
                      borderRadius: 'var(--radius-sm)',
                      padding: '8px 12px',
                      marginBottom: 2
                    }}
                  >
                    {isActive ? <FolderOpen size={16} /> : <Folder size={16} />}
                    <span style={{ fontSize: '0.82rem' }}>{key === 'books' ? 'Bookshelf' : key} Resources</span>
                  </button>
                );
              })}
            </div>

            {/* Folder Contents */}
            <div className="card">
              <div className="flex items-center justify-between mb-lg" style={{ flexWrap: 'wrap', gap: 'var(--space-sm)' }}>
                <div>
                  <h3 style={{ fontSize: '1.05rem' }}>{ARCHIVE_DIRECTORIES[selectedDir].name}</h3>
                  <span className="mono" style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    Drive ID: {ARCHIVE_DIRECTORIES[selectedDir].driveId}
                  </span>
                </div>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={syncAllFiles}
                  disabled={syncingAll}
                >
                  <CloudDownload size={14} />
                  {syncingAll ? 'Ingesting...' : 'Import All Folder Files'}
                </button>
              </div>

              <div style={{ display: 'grid', gap: 'var(--space-sm)' }}>
                {ARCHIVE_DIRECTORIES[selectedDir].files.map(file => {
                  const ingested = isIngested(file.id);
                  return (
                    <div
                      key={file.id}
                      style={{
                        padding: '12px var(--space-md)',
                        border: '1px solid var(--border-light)',
                        borderRadius: 'var(--radius-sm)',
                        background: 'var(--bg-white)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 'var(--space-md)'
                      }}
                    >
                      <div className="flex items-center gap-sm">
                        <FileText size={18} style={{ color: getTypeColor(file.type), flexShrink: 0 }} />
                        <div>
                          <div style={{ fontSize: '0.85rem', fontWeight: 500 }}>{file.title}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                            {file.topic} · {file.size}
                          </div>
                        </div>
                      </div>
                      <button
                        className={`btn btn-sm ${ingested ? 'btn-ghost' : 'btn-secondary'}`}
                        onClick={() => ingestFile(file)}
                        disabled={ingested}
                        style={{ minWidth: 100 }}
                      >
                        {ingested ? (
                          <span style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <CheckCircle2 size={13} /> Ingested
                          </span>
                        ) : (
                          <>
                            <CloudDownload size={13} /> Import
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
