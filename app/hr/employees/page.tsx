'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  getEmployees,
  saveEmployee,
  deleteEmployee,
  exportEmployeesToExcel,
  importEmployeesFromExcel,
  generateEmployeeImportTemplate,
} from '@/actions/employee';
import { useToast } from '@/components/ui/Toast';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/ui/PageHeader';
import { DataTable, Column } from '@/components/ui/DataTable';
import { validateEmployeeData } from '@/lib/validation';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Download,
  Upload,
  Edit2,
  Trash2,
  Eye,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  Building2,
} from 'lucide-react';

export default function HREmployeesPage() {
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);

  const [departmentsList, setDepartmentsList] = useState<any[]>([]);
  const [departmentItems, setDepartmentItems] = useState<{id: number; name: string}[]>([]);
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Employee Add/Edit Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<any>(null);
  const [formLoading, setFormLoading] = useState(false);

  const [formData, setFormData] = useState({
    employeeId: '',
    firstName: '',
    middleName: '',
    lastName: '',
    email: '',
    department: '',
    departmentId: '',
    designation: 'Staff Employee',
    office: 'Corporate HQ',
    joiningDate: new Date().toISOString().split('T')[0],
    status: 'ACTIVE',
  });

  // Excel Import Modal
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);

  const fetchEmployeesList = async () => {
    setLoading(true);
    try {
      const res = await getEmployees({
        search,
        department: departmentFilter,
        status: statusFilter,
        page,
        pageSize: 10,
      });
      setEmployees(res.employees);
      setTotal(res.total);
      setTotalPages(res.totalPages);

      if (res.departments && res.departments.length > 0) {
        setDepartmentsList(res.departments);
      }
      if (res.departmentItems && res.departmentItems.length > 0) {
        setDepartmentItems(res.departmentItems.map((d: any) => ({ id: d.id, name: d.departmentName || d.name })));
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to fetch employee directory', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployeesList();
  }, [search, departmentFilter, statusFilter, page]);

  const handleOpenAddModal = () => {
    setEditingEmployee(null);
    const firstDept = departmentItems[0];
    setFormData({
      employeeId: '',
      firstName: '',
      middleName: '',
      lastName: '',
      email: '',
      department: firstDept?.name || departmentsList[0] || 'Information Technology',
      departmentId: firstDept ? String(firstDept.id) : '1',
      designation: 'Staff Employee',
      office: 'Corporate HQ',
      joiningDate: new Date().toISOString().split('T')[0],
      status: 'ACTIVE',
    });
    setModalOpen(true);
  };

  const handleOpenEditModal = (emp: any) => {
    setEditingEmployee(emp);
    setFormData({
      employeeId: emp.employeeId,
      firstName: emp.firstName,
      middleName: emp.middleName || '',
      lastName: emp.lastName,
      email: emp.email,
      department: emp.department,
      departmentId: emp.departmentId || '1',
      designation: emp.designation,
      office: emp.office,
      joiningDate: new Date(emp.joiningDate).toISOString().split('T')[0],
      status: emp.status,
    });
    setModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = validateEmployeeData({
      firstName: formData.firstName,
      middleName: formData.middleName,
      lastName: formData.lastName,
      email: formData.email,
      department: formData.department,
      joiningDate: formData.joiningDate,
    });

    if (!validation.isValid) {
      showToast(validation.error || 'Please fix form validation errors.', 'error');
      return;
    }

    setFormLoading(true);

    try {
      const res = await saveEmployee({
        id: editingEmployee?.id,
        ...formData,
        departmentId: formData.departmentId || '1',
      });

      if (res.success) {
        showToast(editingEmployee ? 'Employee updated!' : 'New employee added!', 'success');
        setModalOpen(false);
        fetchEmployeesList();
      } else {
        showToast(res.error || 'Failed to save employee', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Error saving employee', 'error');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to remove employee ${name}?`)) return;

    try {
      const res = await deleteEmployee(id);
      if (res.success) {
        showToast('Employee record deleted', 'success');
        fetchEmployeesList();
      } else {
        showToast(res.error || 'Delete failed', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Error deleting employee', 'error');
    }
  };

  const handleExportExcel = async () => {
    try {
      showToast('Generating Excel report...', 'info');
      const base64 = await exportEmployeesToExcel();
      const link = document.createElement('a');
      link.href = `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${base64}`;
      link.download = `Employee_Directory_${new Date().toISOString().split('T')[0]}.xlsx`;
      link.click();
      showToast('Excel downloaded successfully!', 'success');
    } catch (err: any) {
      showToast('Failed to export Excel file', 'error');
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      showToast('Generating import template...', 'info');
      const base64 = await generateEmployeeImportTemplate();
      const link = document.createElement('a');
      link.href = `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${base64}`;
      link.download = `Employee_Import_Template.xlsx`;
      link.click();
      showToast('Import template downloaded successfully!', 'success');
    } catch (err: any) {
      showToast('Failed to download template', 'error');
    }
  };

  const handleImportExcel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!excelFile) return;

    setImporting(true);
    try {
      const reader = new FileReader();
      reader.onload = async (evt) => {
        const base64 = (evt.target?.result as string).split(',')[1];
        const res = await importEmployeesFromExcel(base64);

        if (res.success) {
          showToast(`Imported! Added: ${res.createdCount}, Updated: ${res.updatedCount}`, 'success');
          setImportModalOpen(false);
          setExcelFile(null);
          fetchEmployeesList();
        } else {
          showToast(res.error || 'Import failed', 'error');
        }
        setImporting(false);
      };
      reader.readAsDataURL(excelFile);
    } catch (err: any) {
      showToast(err.message || 'Import failed', 'error');
      setImporting(false);
    }
  };

  // Table Columns Definition
  const columns: Column<any>[] = [
    {
      key: 'employeeId',
      header: 'Employee ID',
      render: (row) => (
        <span className="font-mono font-bold text-slate-900 dark:text-slate-100 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg border border-slate-200/60 dark:border-slate-700/60">
          {row.employeeId}
        </span>
      ),
    },
    {
      key: 'name',
      header: 'Full Name & Email',
      render: (row) => {
        const fullName = `${row.firstName} ${row.middleName ? row.middleName + ' ' : ''}${row.lastName}`;
        return (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-soft-xs">
              {row.firstName.charAt(0)}
            </div>
            <div>
              <Link href={`/hr/employees/${row.id}`} className="font-bold text-slate-900 dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                {fullName}
              </Link>
              <p className="text-[11px] text-slate-400 dark:text-slate-400 font-medium">{row.email}</p>
            </div>
          </div>
        );
      },
    },
    {
      key: 'department',
      header: 'Department',
      render: (row) => <Badge variant="info">{row.department}</Badge>,
    },
    {
      key: 'designation',
      header: 'Designation',
      render: (row) => <span className="font-medium text-slate-700 dark:text-slate-300">{row.designation}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      align: 'center',
      render: (row) => (
        <Badge variant={row.status === 'ACTIVE' ? 'success' : 'danger'}>
          {row.status}
        </Badge>
      ),
    },
    {
      key: 'certificate',
      header: 'Certificate Status',
      align: 'center',
      render: (row) => (
        <Badge variant={row.certificates?.length > 0 ? 'purple' : 'default'}>
          {row.certificates?.length > 0 ? 'Certified' : 'Pending'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (row) => {
        const fullName = `${row.firstName} ${row.lastName}`;
        return (
          <div className="flex items-center justify-end gap-1">
            <Link href={`/hr/employees/${row.id}`}>
              <Button variant="ghost" size="sm" icon={Eye} />
            </Link>
            <Button variant="ghost" size="sm" icon={Edit2} onClick={() => handleOpenEditModal(row)} />
            <Button
              variant="ghost"
              size="sm"
              icon={Trash2}
              className="text-red-600 hover:bg-red-50"
              onClick={() => handleDelete(row.id, fullName)}
            />
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <PageHeader
        title="Employee Directory"
        description="Manage corporate employee profiles, induction status, Excel bulk imports & exports."
        breadcrumbs={[{ label: 'Employees' }]}
        primaryAction={
          <Button variant="primary" icon={UserPlus} onClick={handleOpenAddModal}>
            Add Employee
          </Button>
        }
        secondaryActions={
          <>
            <Button variant="outline" icon={Download} onClick={() => setImportModalOpen(true)}>
              Import Excel
            </Button>
            <Button variant="outline" icon={Upload} onClick={handleExportExcel}>
              Export Excel
            </Button>
          </>
        }
        stats={[
          { title: 'Total Enrolled', value: total, subtitle: 'Corporate Employee Records', icon: Users, color: 'blue' },
          { title: 'Active Staff', value: employees.filter((e) => e.status === 'ACTIVE').length, subtitle: 'Active Induction Profiles', icon: CheckCircle2, color: 'emerald' },
          { title: 'Departments', value: departmentsList.length, subtitle: 'Active Organizational Units', icon: Building2, color: 'purple' },
        ]}
      />

      {/* Enterprise Data Table Component */}
      <DataTable
        columns={columns}
        data={employees}
        loading={loading}
        searchPlaceholder="Search by Employee ID, name, email..."
        searchValue={search}
        onSearchChange={(val) => {
          setSearch(val);
          setPage(1);
        }}
        page={page}
        totalPages={totalPages}
        totalRecords={total}
        onPageChange={(p) => setPage(p)}
        selectedIds={selectedIds}
        onSelectAll={(checked) => {
          if (checked) setSelectedIds(employees.map((e) => e.id));
          else setSelectedIds([]);
        }}
        onSelectRow={(id, checked) => {
          if (checked) setSelectedIds([...selectedIds, id]);
          else setSelectedIds(selectedIds.filter((i) => i !== id));
        }}
        getRowId={(row) => row.id}
        filterControls={
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
              <Filter className="w-3.5 h-3.5" />
              <span>Dept:</span>
              <select
                value={departmentFilter}
                onChange={(e) => {
                  setDepartmentFilter(e.target.value);
                  setPage(1);
                }}
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
              >
                <option value="ALL">All Departments</option>
                {departmentsList.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
              <span>Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
              >
                <option value="ALL">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
          </div>
        }
      />

      {/* Add / Edit Employee Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingEmployee ? 'Edit Employee Profile' : 'Add New Employee'}
        maxWidth="lg"
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Employee ID</label>
              <input
                type="text"
                required
                placeholder="EMP1006"
                value={formData.employeeId}
                onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                className="w-full px-3 py-2 text-xs font-mono font-bold uppercase text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Corporate Email</label>
              <input
                type="email"
                required
                placeholder="john.doe@corporate.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 text-xs font-medium text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">First Name</label>
              <input
                type="text"
                required
                placeholder="John"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full px-3 py-2 text-xs font-medium text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Middle Name (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Ramesh or A."
                value={formData.middleName}
                onChange={(e) => setFormData({ ...formData, middleName: e.target.value })}
                className="w-full px-3 py-2 text-xs font-medium text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
              <p className="text-[10px] text-slate-400 font-medium">Must contain at least one letter (cannot be only dots or special characters)</p>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Last Name</label>
              <input
                type="text"
                required
                placeholder="Doe"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full px-3 py-2 text-xs font-medium text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Department</label>
              <select
                value={formData.departmentId}
                onChange={(e) => {
                  const selected = departmentItems.find(d => String(d.id) === e.target.value);
                  setFormData({ ...formData, departmentId: e.target.value, department: selected?.name || e.target.value });
                }}
                className="w-full px-3 py-2 text-xs font-bold text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
              >
                {departmentItems.length > 0
                  ? departmentItems.map((dept) => (
                      <option key={dept.id} value={String(dept.id)}>
                        {dept.name}
                      </option>
                    ))
                  : departmentsList.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))
                }
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Designation</label>
              <input
                type="text"
                required
                placeholder="Software Engineer"
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                className="w-full px-3 py-2 text-xs font-medium text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Office Location</label>
              <input
                type="text"
                required
                placeholder="Corporate HQ"
                value={formData.office}
                onChange={(e) => setFormData({ ...formData, office: e.target.value })}
                className="w-full px-3 py-2 text-xs font-medium text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={formLoading}>
              {editingEmployee ? 'Update Profile' : 'Create Record'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Excel Import Modal */}
      <Modal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        title="Import Employees from Excel"
        maxWidth="md"
      >
        <form onSubmit={handleImportExcel} className="space-y-4">
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div>
                <p className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                  <FileSpreadsheet className="w-4 h-4 text-blue-600" />
                  <span>Download Excel Import Template</span>
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
                  Pre-formatted Excel sheet with column structure and sample candidate rows.
                </p>
              </div>

              <Button type="button" variant="primary" size="sm" icon={Download} onClick={handleDownloadTemplate}>
                Template
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700">Select .xlsx File</label>
            <input
              type="file"
              accept=".xlsx, .xls"
              required
              onChange={(e) => setExcelFile(e.target.files?.[0] || null)}
              className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-900 file:text-white hover:file:bg-slate-800"
            />
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
            <Button type="button" variant="ghost" onClick={() => setImportModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="success" loading={importing} disabled={!excelFile}>
              Upload & Import
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
