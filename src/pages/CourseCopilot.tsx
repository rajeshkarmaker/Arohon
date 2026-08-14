import { useState, useRef, useEffect } from 'react';
import {
  MessageSquareText, Send, Upload, Loader2, Paperclip,
  BookOpen, HelpCircle, Dumbbell, Lightbulb, ArrowRight,
  X, FileText,
} from 'lucide-react';
import { UserProfile, COURSES } from '../data/courses';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  sources?: string[];
  timestamp: Date;
}

interface CourseCopilotProps {
  user: UserProfile;
}

const SUGGESTIONS = [
  'What is hydrogen bonding?',
  'Explain MO theory for O₂',
  'Compare sp, sp2, sp3 hybridization',
  'How does VSEPR predict molecular shape?',
  'Explain bond order calculation',
];

const FOLLOW_UPS = [
  { label: 'Explain for CT', icon: BookOpen },
  { label: 'Give a practice question', icon: Dumbbell },
  { label: 'Simplify', icon: Lightbulb },
];

export default function CourseCopilot({ user }: CourseCopilotProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [courseId, setCourseId] = useState(user.courses[0] || 'chem-1101');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<{ name: string; base64: string; mimeType: string } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const course = COURSES.find(c => c.id === courseId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text?: string) => {
    const msgText = text || input.trim();
    if (!msgText && !uploadedFile) return;

    const userMessage: Message = {
      role: 'user',
      content: uploadedFile ? `[📎 ${uploadedFile.name}] ${msgText}` : msgText,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      let response;

      if (uploadedFile) {
        response = await fetch('/api/chat/with-file', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: msgText,
            fileBase64: uploadedFile.base64,
            mimeType: uploadedFile.mimeType,
            fileName: uploadedFile.name,
            courseId,
            courseName: course?.name,
          }),
        });
        setUploadedFile(null);
      } else {
        response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: msgText,
            courseId,
            courseName: course?.name,
            courseCode: course?.code,
            conversationId,
            context: `Course topics: ${course?.topics?.join(', ') || 'General'}`,
          }),
        });
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get response');
      }

      if (data.conversationId) setConversationId(data.conversationId);

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.response,
        sources: data.sources,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (err: any) {
      const errorMessage: Message = {
        role: 'assistant',
        content: `⚠️ ${err.message || 'Gemini is temporarily unavailable. Your information is safe. Try again.'}`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      setUploadedFile({
        name: file.name,
        base64,
        mimeType: file.type,
      });
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatMessage = (text: string) => {
    // Basic markdown-like formatting
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
      .replace(/### (.*?)$/gm, '<h3>$1</h3>')
      .replace(/## (.*?)$/gm, '<h2>$1</h2>')
      .replace(/# (.*?)$/gm, '<h1>$1</h1>')
      .replace(/\n- (.*?)$/gm, '\n• $1')
      .replace(/\n\d+\. (.*?)$/gm, (_, p1) => `\n• ${p1}`)
      .replace(/\n/g, '<br/>');
  };

  return (
    <div className="chat-container">
      {/* Course selector */}
      <div style={{ padding: 'var(--space-sm) var(--space-lg)', borderBottom: '1px solid var(--border)', background: 'var(--bg-white)', display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
        <MessageSquareText size={16} style={{ color: 'var(--blue)' }} />
        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Asking about:</span>
        <select
          className="form-select"
          value={courseId}
          onChange={e => { setCourseId(e.target.value); setConversationId(null); }}
          style={{ maxWidth: 200, padding: '4px 28px 4px 10px', fontSize: '0.8rem' }}
        >
          {COURSES.filter(c => user.courses.includes(c.id)).map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Messages */}
      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="empty-state" style={{ marginTop: 'var(--space-2xl)' }}>
            <MessageSquareText size={48} style={{ color: 'var(--blue)', opacity: 0.3 }} />
            <h3>Ask questions about your course materials</h3>
            <p>
              Arohon Course Copilot answers based on {course?.name || 'your course'} materials.
              Upload PDFs, ask about concepts, or get exam-focused explanations.
            </p>
            <div className="chat-suggestions" style={{ justifyContent: 'center', marginTop: 'var(--space-lg)' }}>
              {SUGGESTIONS.map(s => (
                <button key={s} className="chat-suggestion" onClick={() => sendMessage(s)}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`chat-message ${msg.role}`}>
            {msg.role === 'assistant' ? (
              <div dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }} />
            ) : (
              <div>{msg.content}</div>
            )}

            {msg.sources && msg.sources.length > 0 && (
              <div className="chat-sources">
                <div className="chat-sources-label">Sources</div>
                {msg.sources.map((s, j) => (
                  <span key={j} className="chat-source-item">
                    <FileText size={10} />
                    {s}
                  </span>
                ))}
              </div>
            )}

            {msg.role === 'assistant' && i === messages.length - 1 && !loading && (
              <div className="chat-suggestions" style={{ marginTop: 'var(--space-sm)' }}>
                {FOLLOW_UPS.map(f => (
                  <button
                    key={f.label}
                    className="chat-suggestion"
                    onClick={() => sendMessage(f.label)}
                  >
                    <f.icon size={11} style={{ marginRight: 2 }} />
                    {f.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="chat-message assistant">
            <div className="loading-text">
              <Loader2 size={16} className="spin" />
              Thinking…
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* File chip */}
      {uploadedFile && (
        <div style={{ padding: '4px var(--space-lg)', background: 'var(--bg)' }}>
          <span className="file-chip">
            <Paperclip size={12} />
            {uploadedFile.name}
            <button onClick={() => setUploadedFile(null)}>
              <X size={12} />
            </button>
          </span>
        </div>
      )}

      {/* Input */}
      <div className="chat-input-area">
        <div className="chat-input-wrapper">
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.png,.jpg,.jpeg,.txt,.pptx,.docx"
            style={{ display: 'none' }}
            onChange={handleFileUpload}
          />
          <button
            className="btn btn-ghost"
            onClick={() => fileInputRef.current?.click()}
            title="Upload file"
          >
            <Paperclip size={18} />
          </button>
          <textarea
            className="chat-input"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Ask about ${course?.name || 'your course'}…`}
            rows={1}
          />
          <button
            className="btn btn-primary"
            onClick={() => sendMessage()}
            disabled={loading || (!input.trim() && !uploadedFile)}
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
