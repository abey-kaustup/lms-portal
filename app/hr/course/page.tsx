'use client';

import React, { useState, useEffect } from 'react';
import {
  getCourseWithStructure,
  createModule,
  updateModule,
  deleteModule,
  reorderModules,
  saveLesson,
  deleteLesson,
} from '@/actions/course';
import {
  getAssessmentQuestions,
  saveAssessmentQuestion,
  deleteAssessmentQuestion,
} from '@/actions/assessment';
import { useToast } from '@/components/ui/Toast';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import {
  BookOpen,
  Plus,
  Edit2,
  Trash2,
  GripVertical,
  PlayCircle,
  FileText,
  HelpCircle,
  Video,
  FileCheck2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export default function HRCoursePage() {
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);

  // Module Modal state
  const [moduleModalOpen, setModuleModalOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<any>(null);
  const [moduleTitle, setModuleTitle] = useState('');
  const [moduleDesc, setModuleDesc] = useState('');

  // Lesson Modal state
  const [lessonModalOpen, setLessonModalOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<any>(null);
  const [selectedModuleId, setSelectedModuleId] = useState('');
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonDesc, setLessonDesc] = useState('');
  const [contentType, setContentType] = useState<'VIDEO' | 'PDF' | 'VIDEO_PDF'>('VIDEO');
  const [videoUrl, setVideoUrl] = useState('');
  const [pdfUrl, setPdfUrl] = useState('');

  // Question Modal state
  const [questionModalOpen, setQuestionModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<any>(null);
  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState<string[]>(['Option A', 'Option B', 'Option C', 'Option D']);
  const [correctOptionIndex, setCorrectOptionIndex] = useState(0);
  const [explanation, setExplanation] = useState('');
  const [points, setPoints] = useState(1);

  const loadData = async () => {
    setLoading(true);
    try {
      const c = await getCourseWithStructure();
      setCourse(c);
      if (c?.id) {
        const qList = await getAssessmentQuestions(c.id);
        setQuestions(qList);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to load course structure', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Module actions
  const handleOpenAddModule = () => {
    setEditingModule(null);
    setModuleTitle('');
    setModuleDesc('');
    setModuleModalOpen(true);
  };

  const handleOpenEditModule = (mod: any) => {
    setEditingModule(mod);
    setModuleTitle(mod.title);
    setModuleDesc(mod.description || '');
    setModuleModalOpen(true);
  };

  const handleSaveModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!course) return;

    try {
      if (editingModule) {
        await updateModule({
          id: editingModule.id,
          title: moduleTitle,
          description: moduleDesc,
        });
        showToast('Module updated!', 'success');
      } else {
        await createModule({
          courseId: course.id,
          title: moduleTitle,
          description: moduleDesc,
        });
        showToast('Module created!', 'success');
      }
      setModuleModalOpen(false);
      loadData();
    } catch (err: any) {
      showToast('Failed to save module', 'error');
    }
  };

  const handleDeleteModule = async (id: string, title: string) => {
    if (!window.confirm(`Delete module "${title}"?`)) return;
    try {
      await deleteModule(id);
      showToast('Module deleted', 'success');
      loadData();
    } catch (err) {
      showToast('Failed to delete module', 'error');
    }
  };

  // Reorder modules up/down
  const handleMoveModule = async (index: number, direction: 'UP' | 'DOWN') => {
    if (!course?.modules) return;
    const newMods = [...course.modules];
    const targetIdx = direction === 'UP' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= newMods.length) return;

    const temp = newMods[index];
    newMods[index] = newMods[targetIdx];
    newMods[targetIdx] = temp;

    const ids = newMods.map((m) => m.id);
    await reorderModules(ids);
    loadData();
  };

  // Lesson actions
  const handleOpenAddLesson = (moduleId: string) => {
    setEditingLesson(null);
    setSelectedModuleId(moduleId);
    setLessonTitle('');
    setLessonDesc('');
    setContentType('VIDEO');
    setVideoUrl('');
    setPdfUrl('');
    setLessonModalOpen(true);
  };

  const handleOpenEditLesson = (les: any) => {
    setEditingLesson(les);
    setSelectedModuleId(les.moduleId);
    setLessonTitle(les.title);
    setLessonDesc(les.description || '');
    setContentType(les.contentType);
    setVideoUrl(les.videoUrl || '');
    setPdfUrl(les.pdfUrl || '');
    setLessonModalOpen(true);
  };

  const handleSaveLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await saveLesson({
        id: editingLesson?.id,
        moduleId: selectedModuleId,
        title: lessonTitle,
        description: lessonDesc,
        contentType,
        videoUrl,
        pdfUrl,
      });
      showToast(editingLesson ? 'Lesson updated!' : 'Lesson created!', 'success');
      setLessonModalOpen(false);
      loadData();
    } catch (err: any) {
      showToast('Failed to save lesson', 'error');
    }
  };

  const handleDeleteLesson = async (id: string, title: string) => {
    if (!window.confirm(`Delete lesson "${title}"?`)) return;
    try {
      await deleteLesson(id);
      showToast('Lesson deleted', 'success');
      loadData();
    } catch (err) {
      showToast('Failed to delete lesson', 'error');
    }
  };

  // Question actions
  const handleOpenAddQuestion = () => {
    setEditingQuestion(null);
    setQuestionText('');
    setOptions(['Option A', 'Option B', 'Option C', 'Option D']);
    setCorrectOptionIndex(0);
    setExplanation('');
    setPoints(1);
    setQuestionModalOpen(true);
  };

  const handleOpenEditQuestion = (q: any) => {
    setEditingQuestion(q);
    setQuestionText(q.questionText);
    setOptions(q.options || ['Option A', 'Option B', 'Option C', 'Option D']);
    setCorrectOptionIndex(q.correctOptionIndex);
    setExplanation(q.explanation || '');
    setPoints(q.points);
    setQuestionModalOpen(true);
  };

  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!course) return;

    try {
      await saveAssessmentQuestion({
        id: editingQuestion?.id,
        courseId: course.id,
        questionText,
        options,
        correctOptionIndex,
        explanation,
        points,
      });
      showToast('Assessment question saved!', 'success');
      setQuestionModalOpen(false);
      loadData();
    } catch (err: any) {
      showToast('Failed to save question', 'error');
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    if (!window.confirm('Delete this assessment question?')) return;
    try {
      await deleteAssessmentQuestion(id);
      showToast('Question deleted', 'success');
      loadData();
    } catch (err) {
      showToast('Failed to delete question', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold text-slate-500">Loading Course Architecture...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Course Architecture & Content</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure induction modules, attach SharePoint Video & PDF links, and manage assessment questions.
          </p>
        </div>

        <button
          onClick={handleOpenAddModule}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Module</span>
        </button>
      </div>

      {/* Modules List */}
      <div className="space-y-6">
        {course?.modules.map((mod: any, mIdx: number) => (
          <div key={mod.id} className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-4">
            {/* Module Top Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex flex-col gap-1">
                  <button
                    disabled={mIdx === 0}
                    onClick={() => handleMoveModule(mIdx, 'UP')}
                    className="p-1 rounded bg-slate-100 hover:bg-slate-200 disabled:opacity-30 text-slate-600"
                    title="Move Module Up"
                  >
                    <ChevronUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    disabled={mIdx === course.modules.length - 1}
                    onClick={() => handleMoveModule(mIdx, 'DOWN')}
                    className="p-1 rounded bg-slate-100 hover:bg-slate-200 disabled:opacity-30 text-slate-600"
                    title="Move Module Down"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div>
                  <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">
                    Module 0{mIdx + 1}
                  </span>
                  <h3 className="text-base font-bold text-slate-900">{mod.title}</h3>
                  {mod.description && <p className="text-xs text-slate-500 mt-0.5">{mod.description}</p>}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenAddLesson(mod.id)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-xl transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Lesson</span>
                </button>
                <button
                  onClick={() => handleOpenEditModule(mod)}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                  title="Edit Module"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteModule(mod.id, mod.title)}
                  className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 transition-colors"
                  title="Delete Module"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Lessons Table / List */}
            <div className="space-y-2.5">
              {mod.lessons.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-2">No lessons added to this module yet.</p>
              ) : (
                mod.lessons.map((les: any, lIdx: number) => (
                  <div
                    key={les.id}
                    className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-white border border-slate-200 text-blue-600">
                        {les.contentType === 'VIDEO' && <Video className="w-4 h-4" />}
                        {les.contentType === 'PDF' && <FileText className="w-4 h-4" />}
                        {les.contentType === 'VIDEO_PDF' && <PlayCircle className="w-4 h-4" />}
                      </div>

                      <div>
                        <p className="font-bold text-slate-900">{les.title}</p>
                        <p className="text-slate-500 text-[11px] line-clamp-1">{les.description}</p>
                        <div className="flex items-center gap-3 mt-1 text-[10px] text-slate-400 font-mono">
                          {les.videoUrl && <span>Video: {les.videoUrl.substring(0, 45)}...</span>}
                          {les.pdfUrl && <span>PDF: {les.pdfUrl.substring(0, 45)}...</span>}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <Badge variant="info">{les.contentType}</Badge>
                      <button
                        onClick={() => handleOpenEditLesson(les)}
                        className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
                        title="Edit Lesson"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteLesson(les.id, les.title)}
                        className="p-1.5 rounded-lg bg-red-50 border border-red-100 hover:bg-red-100 text-red-600 transition-colors"
                        title="Delete Lesson"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Assessment Questions Management Section */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <span className="text-[11px] font-bold text-purple-600 uppercase tracking-wider">Evaluation</span>
            <h3 className="text-lg font-bold text-slate-900 mt-0.5">Final Assessment Questions</h3>
            <p className="text-xs text-slate-500">Configure MCQ single-correct questions, correct answer options, and points.</p>
          </div>

          <button
            onClick={handleOpenAddQuestion}
            className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add Question</span>
          </button>
        </div>

        <div className="space-y-4">
          {questions.map((q, idx) => (
            <div key={q.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60 space-y-2.5 text-xs">
              <div className="flex items-start justify-between">
                <span className="font-bold text-slate-900">
                  Q{idx + 1}: {q.questionText}
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenEditQuestion(q)}
                    className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-600"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteQuestion(q.id)}
                    className="p-1.5 rounded-lg bg-red-50 border border-red-100 hover:bg-red-100 text-red-600"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pl-2">
                {q.options?.map((opt: string, oIdx: number) => (
                  <div
                    key={oIdx}
                    className={`p-2 rounded-xl border text-[11px] font-semibold ${
                      oIdx === q.correctOptionIndex
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold'
                        : 'bg-white border-slate-200 text-slate-600'
                    }`}
                  >
                    {String.fromCharCode(65 + oIdx)}. {opt}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Module Modal */}
      <Modal
        isOpen={moduleModalOpen}
        onClose={() => setModuleModalOpen(false)}
        title={editingModule ? 'Edit Module' : 'Create Module'}
        maxWidth="md"
      >
        <form onSubmit={handleSaveModule} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Module Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Module 1: Welcome & Corporate Culture"
              value={moduleTitle}
              onChange={(e) => setModuleTitle(e.target.value)}
              className="w-full px-3 py-2 text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Description</label>
            <textarea
              rows={3}
              placeholder="Overview of module learning objectives..."
              value={moduleDesc}
              onChange={(e) => setModuleDesc(e.target.value)}
              className="w-full px-3 py-2 text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
            />
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setModuleModalOpen(false)}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs"
            >
              Save Module
            </button>
          </div>
        </form>
      </Modal>

      {/* Lesson Modal */}
      <Modal
        isOpen={lessonModalOpen}
        onClose={() => setLessonModalOpen(false)}
        title={editingLesson ? 'Edit Lesson' : 'Add Lesson'}
        maxWidth="lg"
      >
        <form onSubmit={handleSaveLesson} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Lesson Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Lesson 1.1: Executive Welcome"
              value={lessonTitle}
              onChange={(e) => setLessonTitle(e.target.value)}
              className="w-full px-3 py-2 text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Content Type</label>
            <select
              value={contentType}
              onChange={(e) => setContentType(e.target.value as any)}
              className="w-full px-3 py-2 text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
            >
              <option value="VIDEO">Video Only</option>
              <option value="PDF">PDF Document Only</option>
              <option value="VIDEO_PDF">Video + PDF Document</option>
            </select>
          </div>

          {(contentType === 'VIDEO' || contentType === 'VIDEO_PDF') && (
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">SharePoint Video URL / Stream Embed Link</label>
              <input
                type="url"
                required
                placeholder="https://corporate.sharepoint.com/:v:/s/learning/video.mp4"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                className="w-full px-3 py-2 text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
              />
            </div>
          )}

          {(contentType === 'PDF' || contentType === 'VIDEO_PDF') && (
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">SharePoint PDF URL / Document Embed Link</label>
              <input
                type="url"
                required
                placeholder="https://corporate.sharepoint.com/:b:/s/learning/handbook.pdf"
                value={pdfUrl}
                onChange={(e) => setPdfUrl(e.target.value)}
                className="w-full px-3 py-2 text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
              />
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Lesson Description</label>
            <textarea
              rows={2}
              placeholder="Brief overview of content..."
              value={lessonDesc}
              onChange={(e) => setLessonDesc(e.target.value)}
              className="w-full px-3 py-2 text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
            />
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setLessonModalOpen(false)}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs"
            >
              Save Lesson
            </button>
          </div>
        </form>
      </Modal>

      {/* Assessment Question Modal */}
      <Modal
        isOpen={questionModalOpen}
        onClose={() => setQuestionModalOpen(false)}
        title={editingQuestion ? 'Edit Question' : 'Add Assessment Question'}
        maxWidth="lg"
      >
        <form onSubmit={handleSaveQuestion} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Question Text</label>
            <textarea
              rows={2}
              required
              placeholder="Enter assessment question..."
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              className="w-full px-3 py-2 text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700">Options (Select radio for correct answer)</label>
            {options.map((opt, oIdx) => (
              <div key={oIdx} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="correctIdx"
                  checked={correctOptionIndex === oIdx}
                  onChange={() => setCorrectOptionIndex(oIdx)}
                  className="w-4 h-4 text-blue-600"
                />
                <input
                  type="text"
                  required
                  placeholder={`Option ${String.fromCharCode(65 + oIdx)}`}
                  value={opt}
                  onChange={(e) => {
                    const newOpts = [...options];
                    newOpts[oIdx] = e.target.value;
                    setOptions(newOpts);
                  }}
                  className="flex-1 px-3 py-1.5 text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                />
              </div>
            ))}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Explanation for Correct Answer</label>
            <input
              type="text"
              placeholder="Why this option is correct..."
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              className="w-full px-3 py-2 text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
            />
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setQuestionModalOpen(false)}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-xs"
            >
              Save Question
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
