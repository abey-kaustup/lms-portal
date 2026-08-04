'use client';

import React, { useState, useEffect } from 'react';
import { getDepartments, saveDepartment, deleteDepartment } from '@/actions/department';
import { useToast } from '@/components/ui/Toast';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { PageHeader } from '@/components/ui/PageHeader';
import { Building2, Plus, Edit2, Trash2, Users, BookOpen, Search } from 'lucide-react';
import { DepartmentSkeleton } from '@/components/ui/SkeletonLoader';

export default function HRDepartmentsPage() {
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [departments, setDepartments] = useState<any[]>([]);
  const [search, setSearch] = useState('');

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<any>(null);
  const [deptName, setDeptName] = useState('');
  const [deptCode, setDeptCode] = useState('');
  const [deptDesc, setDeptDesc] = useState('');
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getDepartments();
      setDepartments(data);
    } catch (err: any) {
      showToast(err.message || 'Failed to load departments', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAdd = () => {
    setEditingDept(null);
    setDeptName('');
    setDeptCode('');
    setDeptDesc('');
    setModalOpen(true);
  };

  const handleOpenEdit = (dept: any) => {
    setEditingDept(dept);
    setDeptName(dept.name);
    setDeptCode(dept.code);
    setDeptDesc(dept.description || '');
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await saveDepartment({
        id: editingDept?.id,
        name: deptName,
        code: deptCode,
        description: deptDesc,
      });

      if (res.success) {
        showToast(editingDept ? 'Department updated successfully!' : 'Department created successfully!', 'success');
        setModalOpen(false);
        loadData();
      } else {
        showToast(res.error || 'Failed to save department', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Error saving department', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete department "${name}"?`)) return;

    try {
      const res = await deleteDepartment(id);
      if (res.success) {
        showToast('Department deleted successfully', 'success');
        loadData();
      } else {
        showToast(res.error || 'Failed to delete department', 'error');
      }
    } catch (err: any) {
      showToast('Error deleting department', 'error');
    }
  };

  const filteredDepts = departments.filter((d) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      d.name.toLowerCase().includes(q) ||
      d.code.toLowerCase().includes(q) ||
      (d.description && d.description.toLowerCase().includes(q))
    );
  });

  const totalStaff = departments.reduce((acc, curr) => acc + (curr._count?.employees || 0), 0);
  const totalModules = departments.reduce((acc, curr) => acc + (curr._count?.modules || 0), 0);

  if (loading) {
    return <DepartmentSkeleton />;
  }

  return (
    <div className="space-y-8">
      {/* Page Header with Stats */}
      <PageHeader
        title="Department Management"
        description="Configure corporate departments, view assigned induction modules, and manage staff allocation."
        breadcrumbs={[{ label: 'Departments' }]}
        primaryAction={
          <Button variant="primary" icon={Plus} onClick={handleOpenAdd}>
            Add New Department
          </Button>
        }
        stats={[
          { title: 'Total Departments', value: departments.length, subtitle: 'Active Organizational Units', icon: Building2, color: 'blue' },
          { title: 'Allocated Staff', value: totalStaff, subtitle: 'Employees Across Departments', icon: Users, color: 'emerald' },
          { title: 'Department Modules', value: totalModules, subtitle: 'Specialized Curriculum Modules', icon: BookOpen, color: 'purple' },
        ]}
      />

      {/* Filter & Search Bar */}
      <div className="p-4 bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-soft-xs flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" />
        <input
          type="text"
          placeholder="Search by department name, code (e.g. IT, HR, SURVEY), or description..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-transparent text-xs text-slate-900 dark:text-slate-100 font-medium focus:outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500"
        />
      </div>

      {/* Widescreen Department Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDepts.map((dept) => (
          <Card key={dept.id} hoverable={true} className="flex flex-col justify-between">
            <CardHeader className="border-b-0 pb-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 rounded-2xl bg-blue-50 text-blue-600 font-bold border border-blue-100/80 shadow-soft-xs">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <Badge variant="info">{dept.code}</Badge>
                </div>

                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" onClick={() => handleOpenEdit(dept)}>
                    <Edit2 className="w-3.5 h-3.5" />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50" onClick={() => handleDelete(dept.id, dept.name)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>

              <div className="pt-3">
                <CardTitle>{dept.name}</CardTitle>
                <CardDescription className="mt-1 line-clamp-2">
                  {dept.description || 'Standard corporate department profile.'}
                </CardDescription>
              </div>
            </CardHeader>

            <CardFooter className="pt-4 border-t border-slate-100">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                <Users className="w-4 h-4 text-blue-500" />
                <span>{dept._count?.employees || 0} Staff Members</span>
              </div>

              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                <BookOpen className="w-4 h-4 text-purple-500" />
                <span>{dept._count?.modules || 0} Module(s)</span>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Department Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingDept ? 'Edit Department' : 'Create New Department'}
        maxWidth="md"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Department Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Information Technology"
              value={deptName}
              onChange={(e) => setDeptName(e.target.value)}
              className="w-full px-3 py-2 text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none font-medium"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Department Code (Unique Identifier)</label>
            <input
              type="text"
              required
              placeholder="e.g. IT, HR, FINANCE, SURVEY"
              value={deptCode}
              onChange={(e) => setDeptCode(e.target.value.toUpperCase())}
              className="w-full px-3 py-2 text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none uppercase font-mono font-bold"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Description</label>
            <textarea
              rows={3}
              placeholder="Responsibilities and department overview..."
              value={deptDesc}
              onChange={(e) => setDeptDesc(e.target.value)}
              className="w-full px-3 py-2 text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none font-medium"
            />
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={saving}>
              Save Department
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
