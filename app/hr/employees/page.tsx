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
import { validateEmployeeData, validateDepartment } from '@/lib/validation';
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
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
} from 'lucide-react';

const DEFAULT_DEPARTMENTS = [
  'Engineering',
  'Human Resources',
  'Product Management',
  'Finance',
  'Marketing',
];

export default function HREmployeesPage() {
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);

  // Departments List dynamically populated from table below
  const [departmentsList, setDepartmentsList] = useState<string[]>(DEFAULT_DEPARTMENTS);
  const [isCustomDept, setIsCustomDept] = useState(false);

  // Search & Filters
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Employee Edit / Add Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<any>(null);
  const [formLoading, setFormLoading] = useState(false);

  // Form Fields
  const [formData, setFormData] = useState({
    employeeId: '',
    firstName: '',
    middleName: '',
    lastName: '',
    email: '',
    department: 'Engineering',
    designation: 'Software Engineer',
    office: 'Corporate HQ',
    joiningDate: new Date().toISOString().split('T')[0],
    status: 'ACTIVE',
  });

  // Excel Import Modal state
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
        const merged = Array.from(new Set([...DEFAULT_DEPARTMENTS, ...res.departments])).sort();
        setDepartmentsList(merged);
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
    setIsCustomDept(false);
    setFormData({
      employeeId: '',
      firstName: '',
      middleName: '',
      lastName: '',
      email: '',
      department: departmentsList[0] || 'Engineering',
      designation: 'Software Engineer',
      office: 'Corporate HQ',
      joiningDate: new Date().toISOString().split('T')[0],
      status: 'ACTIVE',
    });
    setModalOpen(true);
  };

  const handleOpenEditModal = (emp: any) => {
    setEditingEmployee(emp);
    const exists = departmentsList.includes(emp.department);
    setIsCustomDept(!exists);
    setFormData({
      employeeId: emp.employeeId,
      firstName: emp.firstName,
      middleName: emp.middleName || '',
      lastName: emp.lastName,
      email: emp.email,
      department: emp.department,
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

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Employee Directory</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage employee profiles, onboarding status, Excel bulk import & export.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setImportModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold text-xs rounded-xl shadow-2xs transition-colors"
          >
            <Download className="w-4 h-4 text-blue-600" />
            <span>Import Excel</span>
          </button>

          <button
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold text-xs rounded-xl shadow-2xs transition-colors"
          >
            <Upload className="w-4 h-4 text-emerald-600" />
            <span>Export Excel</span>
          </button>

          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Employee</span>
          </button>
        </div>
      </div>

      {/* Filters & Search Controls Bar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by ID, name, email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs font-semibold text-slate-500">Dept:</span>
            <select
              value={departmentFilter}
              onChange={(e) => {
                setDepartmentFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
            >
              <option value="ALL">All Departments</option>
              {departmentsList.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Directory Data Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white text-[11px] font-bold uppercase tracking-wider">
                <th className="py-3.5 px-4">Employee ID</th>
                <th className="py-3.5 px-4">Full Name</th>
                <th className="py-3.5 px-4">Department</th>
                <th className="py-3.5 px-4">Designation</th>
                <th className="py-3.5 px-4">Office</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-center">Certificate</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    Loading Employee Records...
                  </td>
                </tr>
              ) : employees.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No employees matching filter criteria.
                  </td>
                </tr>
              ) : (
                employees.map((emp) => {
                  const fullName = `${emp.firstName} ${emp.middleName ? emp.middleName + ' ' : ''}${emp.lastName}`;
                  const hasCert = emp.certificates?.length > 0;

                  return (
                    <tr key={emp.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{emp.employeeId}</td>
                      <td className="py-3.5 px-4">
                        <Link
                          href={`/hr/employees/${emp.id}`}
                          className="font-bold text-slate-900 hover:text-blue-600"
                        >
                          {fullName}
                        </Link>
                        <p className="text-[11px] text-slate-400">{emp.email}</p>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-700">{emp.department}</td>
                      <td className="py-3.5 px-4 text-slate-600">{emp.designation}</td>
                      <td className="py-3.5 px-4 text-slate-500">{emp.office}</td>
                      <td className="py-3.5 px-4">
                        <Badge variant={emp.status === 'ACTIVE' ? 'success' : 'danger'}>
                          {emp.status}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {hasCert ? (
                          <Badge variant="purple">Issued</Badge>
                        ) : (
                          <Badge variant="default">Pending</Badge>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/hr/employees/${emp.id}`}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                            title="View Profile"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Link>
                          <button
                            onClick={() => handleOpenEditModal(emp)}
                            className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors"
                            title="Edit Employee"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(emp.id, fullName)}
                            className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-colors"
                            title="Delete Employee"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Showing {employees.length} of {total} Records</span>

          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-semibold text-slate-700">
              Page {page} of {totalPages || 1}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 disabled:opacity-40 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

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
                className="w-full px-3 py-2 text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none uppercase"
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
                className="w-full px-3 py-2 text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
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
                className="w-full px-3 py-2 text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Middle Name (Optional)</label>
              <input
                type="text"
                placeholder="M."
                value={formData.middleName}
                onChange={(e) => setFormData({ ...formData, middleName: e.target.value })}
                className="w-full px-3 py-2 text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Last Name</label>
              <input
                type="text"
                required
                placeholder="Doe"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full px-3 py-2 text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700">Department</label>
                <button
                  type="button"
                  onClick={() => {
                    const nextCustom = !isCustomDept;
                    setIsCustomDept(nextCustom);
                    if (nextCustom) {
                      setFormData({ ...formData, department: '' });
                    } else {
                      setFormData({ ...formData, department: departmentsList[0] || 'Engineering' });
                    }
                  }}
                  className="text-[10px] font-bold text-blue-600 hover:text-blue-800 transition-colors"
                >
                  {isCustomDept ? '← Select from List' : '+ Custom Dept'}
                </button>
              </div>

              {!isCustomDept ? (
                <select
                  value={formData.department}
                  onChange={(e) => {
                    if (e.target.value === '__CUSTOM__') {
                      setIsCustomDept(true);
                      setFormData({ ...formData, department: '' });
                    } else {
                      setFormData({ ...formData, department: e.target.value });
                    }
                  }}
                  className="w-full px-3 py-2 text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
                >
                  <option value="" disabled>Select Department</option>
                  {departmentsList.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                  <option value="__CUSTOM__">+ Add New Department...</option>
                </select>
              ) : (
                <input
                  type="text"
                  required
                  placeholder="e.g. Quality Assurance"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className={`w-full px-3 py-2 text-xs text-slate-900 bg-slate-50 border rounded-xl focus:outline-none ${
                    !validateDepartment(formData.department).isValid
                      ? 'border-red-400 focus:ring-2 focus:ring-red-500/20 focus:border-red-500'
                      : 'border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500'
                  }`}
                />
              )}
              {!validateDepartment(formData.department).isValid && (
                <p className="text-[10px] font-semibold text-red-600 mt-0.5">
                  {validateDepartment(formData.department).error}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Designation</label>
              <input
                type="text"
                required
                placeholder="Software Engineer"
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                className="w-full px-3 py-2 text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Office Location</label>
              <input
                type="text"
                required
                placeholder="New York HQ"
                value={formData.office}
                onChange={(e) => setFormData({ ...formData, office: e.target.value })}
                className="w-full px-3 py-2 text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Joining Date</label>
              <input
                type="date"
                required
                max={new Date().toISOString().split('T')[0]}
                value={formData.joiningDate}
                onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                className="w-full px-3 py-2 text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={formLoading}
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-all disabled:opacity-50"
            >
              {formLoading ? 'Saving...' : editingEmployee ? 'Update Profile' : 'Create Record'}
            </button>
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
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Pre-formatted Excel sheet with column structure and sample candidate rows.
                </p>
              </div>

              <button
                type="button"
                onClick={handleDownloadTemplate}
                className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all shrink-0"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Template</span>
              </button>
            </div>

            <div className="pt-2 border-t border-slate-200/80 text-[11px] text-slate-600 space-y-1">
              <p>
                <strong>Required Columns:</strong> EmployeeID, FirstName, MiddleName, LastName, Email, Department, Designation, Office, JoiningDate, Status.
              </p>
              <p className="text-slate-500 italic">
                Format Note: JoiningDate should be YYYY-MM-DD and must not be in the future.
              </p>
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
            <button
              type="button"
              onClick={() => setImportModalOpen(false)}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={importing || !excelFile}
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-all disabled:opacity-50"
            >
              {importing ? 'Processing File...' : 'Upload & Import'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
