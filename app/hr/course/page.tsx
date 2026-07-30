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
import { getDepartments } from '@/actions/department';
import { useToast } from '@/components/ui/Toast';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import {
  BookOpen,
  Plus,
  Edit2,
  Trash2,
  PlayCircle,
  FileText,
  Video,
  ChevronDown,
  ChevronUp,
  Building2,
  ShieldCheck,
  Layers,
  HelpCircle,
  CheckCircle2,
} from 'lucide-react';

export default function HRCoursePage() {
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState<any>(null);
  const [departments, setDepartments] = useState<any[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);

  // Module Modal state
  const [moduleModalOpen, setModuleModalOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<any>(null);
  const [moduleTitle, setModuleTitle] = useState('');
  const [moduleDesc, setModuleDesc] = useState('');
  const [moduleType, setModuleType] = useState<'COMMON' | 'DEPARTMENT'>('COMMON');
  const [selectedDeptId, setSelectedDeptId] = useState('');

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
  const [questionModuleId, setQuestionModuleId] = useState<string>('');
  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState<string[]>(['Option A', 'Option B', 'Option C', 'Option D']);
  const [correctOptionIndex, setCorrectOptionIndex] = useState(0);
  const [explanation, setExplanation] = useState('');
  const [points, setPoints] = useState(1);

  const loadData = async () => {
    setLoading(true);
    try {
      const [c, deptList] = await Promise.all([
        getCourseWithStructure(),
        getDepartments(),
      ]);
      setCourse(c);
      setDepartments(deptList);

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

  const handleOpenAddModule = () => {
    setEditingModule(null);
    setModuleTitle('');
    setModuleDesc('');
    setModuleType('COMMON');
    setSelectedDeptId(departments[0]?.id || '');
    setModuleModalOpen(true);
  };

  const handleOpenEditModule = (mod: any) => {
    setEditingModule(mod);
    setModuleTitle(mod.title);
    setModuleDesc(mod.description || '');
    setModuleType(mod.moduleType || 'COMMON');
    setSelectedDeptId(mod.departmentId || departments[0]?.id || '');
    setModuleModalOpen(true);
  };

  const handleSaveModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!course) return;

    try {
      if (moduleType === 'DEPARTMENT' && !selectedDeptId) {
        showToast('Please select a target department', 'error');
        return;
      }

      if (editingModule) {
        await updateModule({
          id: editingModule.id,
          title: moduleTitle,
          description: moduleDesc,
          moduleType,
          departmentId: moduleType === 'DEPARTMENT' ? selectedDeptId : null,
        });
        showToast('Module updated!', 'success');
      } else {
        await createModule({
          courseId: course.id,
          title: moduleTitle,
          description: moduleDesc,
          moduleType,
          departmentId: moduleType === 'DEPARTMENT' ? selectedDeptId : null,
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

  // Lesson Handlers
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

  // Question Handlers
  const handleOpenAddQuestion = () => {
    setEditingQuestion(null);
    setQuestionModuleId(course?.modules[0]?.id || '');
    setQuestionText('');
    setOptions(['Option A', 'Option B', 'Option C', 'Option D']);
    setCorrectOptionIndex(0);
    setExplanation('');
    setPoints(1);
    setQuestionModalOpen(true);
  };

  const handleOpenEditQuestion = (q: any) => {
    setEditingQuestion(q);
    setQuestionModuleId(q.moduleId || course?.modules[0]?.id || '');
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
        moduleId: questionModuleId || null,
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
          <p className="text-xs font-semibold text-slate-500">Loading Curriculum Architecture...</p>
        </div>
      </div>
    );
  }

  const commonModules = course?.modules?.filter((m: any) => m.moduleType === 'COMMON') || [];
  const deptModules = course?.modules?.filter((m: any) => m.moduleType === 'DEPARTMENT') || [];
  const totalLessons = course?.modules?.reduce((acc: number, m: any) => acc + m.lessons.length, 0) || 0;

  return (
    <div className="space-y-8">
      {/* Page Header with Stats */}
      <PageHeader
        title="Curriculum Architecture Builder"
        description="Single course framework supporting Common Modules (mandatory for all) and Department Modules."
        breadcrumbs={[{ label: 'Curriculum Builder' }]}
        primaryAction={
          <Button variant="primary" icon={Plus} onClick={handleOpenAddModule}>
            Add New Module
          </Button>
        }
        stats={[
          { title: 'Total Modules', value: course?.modules?.length || 0, subtitle: 'Common + Department', icon: BookOpen, color: 'blue' },
          { title: 'Common Modules', value: commonModules.length, subtitle: 'Mandatory for All Employees', icon: ShieldCheck, color: 'emerald' },
          { title: 'Department Modules', value: deptModules.length, subtitle: 'Department Specialized', icon: Building2, color: 'purple' },
          { title: 'Assessment Questions', value: questions.length, subtitle: 'Proctored Bank Questions', icon: HelpCircle, color: 'slate' },
        ]}
      />

      {/* 1. Common Modules Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">1. Common Modules</h3>
              <p className="text-xs text-slate-500 font-medium">Mandatory induction modules for every corporate employee</p>
            </div>
          </div>
          <Badge variant="info">Mandatory Core</Badge>
        </div>

        <div className="space-y-4">
          {commonModules.map((mod: any, mIdx: number) => (
            <Card key={mod.id}>
              <CardHeader className="flex-row items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex flex-col gap-1">
                    <button
                      disabled={mIdx === 0}
                      onClick={() => handleMoveModule(mIdx, 'UP')}
                      className="p-1 rounded bg-slate-100 hover:bg-slate-200 disabled:opacity-30 text-slate-600"
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      disabled={mIdx === commonModules.length - 1}
                      onClick={() => handleMoveModule(mIdx, 'DOWN')}
                      className="p-1 rounded bg-slate-100 hover:bg-slate-200 disabled:opacity-30 text-slate-600"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                        Common Module 0{mIdx + 1}
                      </span>
                      <Badge variant="success">COMMON</Badge>
                    </div>
                    <CardTitle className="mt-0.5">{mod.title}</CardTitle>
                    {mod.description && <CardDescription className="mt-0.5">{mod.description}</CardDescription>}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" icon={Plus} onClick={() => handleOpenAddLesson(mod.id)}>
                    Add Lesson
                  </Button>
                  <Button variant="ghost" size="sm" icon={Edit2} onClick={() => handleOpenEditModule(mod)} />
                  <Button variant="ghost" size="sm" icon={Trash2} className="text-red-600 hover:bg-red-50" onClick={() => handleDeleteModule(mod.id, mod.title)} />
                </div>
              </CardHeader>

              <CardContent className="pt-4 space-y-2">
                {mod.lessons.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-2">No lessons added to this module yet.</p>
                ) : (
                  mod.lessons.map((les: any) => (
                    <div
                      key={les.id}
                      className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-white border border-slate-200 text-blue-600 shadow-soft-xs">
                          {les.contentType === 'VIDEO' && <Video className="w-4 h-4" />}
                          {les.contentType === 'PDF' && <FileText className="w-4 h-4" />}
                          {les.contentType === 'VIDEO_PDF' && <PlayCircle className="w-4 h-4" />}
                        </div>

                        <div>
                          <p className="font-bold text-slate-900">{les.title}</p>
                          <p className="text-slate-500 text-[11px] font-medium line-clamp-1">{les.description}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        <Badge variant="info">{les.contentType}</Badge>
                        <Button variant="ghost" size="sm" icon={Edit2} onClick={() => handleOpenEditLesson(les)} />
                        <Button variant="ghost" size="sm" icon={Trash2} className="text-red-600 hover:bg-red-50" onClick={() => handleDeleteLesson(les.id, les.title)} />
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* 2. Department Modules Section */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-purple-50 text-purple-600 rounded-xl border border-purple-100">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">2. Department-Specific Modules</h3>
              <p className="text-xs text-slate-500 font-medium">Unlocked automatically after completing common induction modules</p>
            </div>
          </div>
          <Badge variant="warning">Unlocked Post Common</Badge>
        </div>

        <div className="space-y-4">
          {deptModules.map((mod: any, mIdx: number) => (
            <Card key={mod.id}>
              <CardHeader className="flex-row items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider">
                        Department Training
                      </span>
                      <Badge variant="purple">{mod.department?.name || 'Assigned Dept'}</Badge>
                    </div>
                    <CardTitle className="mt-0.5">{mod.title}</CardTitle>
                    {mod.description && <CardDescription className="mt-0.5">{mod.description}</CardDescription>}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" icon={Plus} onClick={() => handleOpenAddLesson(mod.id)}>
                    Add Lesson
                  </Button>
                  <Button variant="ghost" size="sm" icon={Edit2} onClick={() => handleOpenEditModule(mod)} />
                  <Button variant="ghost" size="sm" icon={Trash2} className="text-red-600 hover:bg-red-50" onClick={() => handleDeleteModule(mod.id, mod.title)} />
                </div>
              </CardHeader>

              <CardContent className="pt-4 space-y-2">
                {mod.lessons.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-2">No lessons added to this department module yet.</p>
                ) : (
                  mod.lessons.map((les: any) => (
                    <div
                      key={les.id}
                      className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-white border border-slate-200 text-purple-600 shadow-soft-xs">
                          {les.contentType === 'VIDEO' && <Video className="w-4 h-4" />}
                          {les.contentType === 'PDF' && <FileText className="w-4 h-4" />}
                          {les.contentType === 'VIDEO_PDF' && <PlayCircle className="w-4 h-4" />}
                        </div>

                        <div>
                          <p className="font-bold text-slate-900">{les.title}</p>
                          <p className="text-slate-500 text-[11px] font-medium line-clamp-1">{les.description}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        <Badge variant="purple">{les.contentType}</Badge>
                        <Button variant="ghost" size="sm" icon={Edit2} onClick={() => handleOpenEditLesson(les)} />
                        <Button variant="ghost" size="sm" icon={Trash2} className="text-red-600 hover:bg-red-50" onClick={() => handleDeleteLesson(les.id, les.title)} />
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Assessment Question Bank Manager */}
      <Card>
        <CardHeader className="flex-row items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider">Evaluation Bank</span>
            <CardTitle className="mt-0.5">Assessment Question Bank</CardTitle>
            <CardDescription>
              Questions linked to Common modules are delivered to all employees. Questions linked to Department modules are delivered only to that department.
            </CardDescription>
          </div>

          <Button variant="primary" icon={Plus} onClick={handleOpenAddQuestion}>
            Add Question
          </Button>
        </CardHeader>

        <CardContent className="space-y-4">
          {questions.map((q, idx) => (
            <div key={q.id} className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/60 space-y-2.5 text-xs">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">
                      Q{idx + 1}: {q.questionText}
                    </span>
                    <Badge variant={q.moduleType === 'DEPARTMENT' ? 'warning' : 'success'}>
                      {q.moduleType === 'DEPARTMENT' ? `Dept: ${q.departmentName}` : 'Common'}
                    </Badge>
                  </div>
                  {q.moduleTitle && (
                    <p className="text-[11px] text-slate-500 font-medium">Linked Module: {q.moduleTitle}</p>
                  )}
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <Button variant="ghost" size="sm" icon={Edit2} onClick={() => handleOpenEditQuestion(q)} />
                  <Button variant="ghost" size="sm" icon={Trash2} className="text-red-600 hover:bg-red-50" onClick={() => handleDeleteQuestion(q.id)} />
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
        </CardContent>
      </Card>

      {/* Module Modal */}
      <Modal
        isOpen={moduleModalOpen}
        onClose={() => setModuleModalOpen(false)}
        title={editingModule ? 'Edit Module' : 'Create Module'}
        maxWidth="md"
      >
        <form onSubmit={handleSaveModule} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Module Category</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setModuleType('COMMON')}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all ${
                  moduleType === 'COMMON'
                    ? 'bg-blue-50 border-blue-600 text-blue-900 ring-2 ring-blue-500/20'
                    : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                Common Module (Mandatory for All)
              </button>
              <button
                type="button"
                onClick={() => setModuleType('DEPARTMENT')}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all ${
                  moduleType === 'DEPARTMENT'
                    ? 'bg-purple-50 border-purple-600 text-purple-900 ring-2 ring-purple-500/20'
                    : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                Department-Specific Module
              </button>
            </div>
          </div>

          {moduleType === 'DEPARTMENT' && (
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Target Department</label>
              <select
                value={selectedDeptId}
                onChange={(e) => setSelectedDeptId(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none font-semibold"
              >
                <option value="">Select Department...</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.code})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Module Title</label>
            <input
              type="text"
              required
              placeholder="e.g. IT Department: Git Workflow & Code Guidelines"
              value={moduleTitle}
              onChange={(e) => setModuleTitle(e.target.value)}
              className="w-full px-3 py-2 text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none font-medium"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Description</label>
            <textarea
              rows={3}
              placeholder="Overview of module learning objectives..."
              value={moduleDesc}
              onChange={(e) => setModuleDesc(e.target.value)}
              className="w-full px-3 py-2 text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none font-medium"
            />
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
            <Button type="button" variant="ghost" onClick={() => setModuleModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save Module
            </Button>
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
              placeholder="e.g. IT Lesson 1: Development Standards"
              value={lessonTitle}
              onChange={(e) => setLessonTitle(e.target.value)}
              className="w-full px-3 py-2 text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none font-medium"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Content Type</label>
            <select
              value={contentType}
              onChange={(e) => setContentType(e.target.value as any)}
              className="w-full px-3 py-2 text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none font-semibold"
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
                className="w-full px-3 py-2 text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none font-mono"
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
                className="w-full px-3 py-2 text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none font-mono"
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
              className="w-full px-3 py-2 text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none font-medium"
            />
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
            <Button type="button" variant="ghost" onClick={() => setLessonModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save Lesson
            </Button>
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
            <label className="text-xs font-bold text-slate-700">Associated Module</label>
            <select
              value={questionModuleId}
              onChange={(e) => setQuestionModuleId(e.target.value)}
              required
              className="w-full px-3 py-2 text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none font-semibold"
            >
              <option value="">Select Associated Module...</option>
              {course?.modules?.map((m: any) => (
                <option key={m.id} value={m.id}>
                  [{m.moduleType}] {m.title} {m.department ? `(${m.department.name})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Question Text</label>
            <textarea
              rows={2}
              required
              placeholder="Enter assessment question..."
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              className="w-full px-3 py-2 text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none font-medium"
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
                  className="flex-1 px-3 py-1.5 text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none font-medium"
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
              className="w-full px-3 py-2 text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none font-medium"
            />
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
            <Button type="button" variant="ghost" onClick={() => setQuestionModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save Question
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
