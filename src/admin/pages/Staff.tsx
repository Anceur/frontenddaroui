import React, { useState, useEffect } from 'react';
import { Search, RefreshCw, ChevronDown, ChevronLeft, ChevronRight, Plus, Edit, Trash2, Mail, Phone, Calendar, Clock, User, UserPlus, Loader2, X } from 'lucide-react';
import { getAllStaff, createStaff, updateStaff, deleteStaff } from '../../shared/api/staff';
import type { StaffMember, CreateStaffData } from '../../shared/api/staff';
import { API } from '../../shared/api/API';

interface StaffMemberDisplay {
  id: number;
  name: string;
  position: string;
  email: string;
  phone: string;
  hireDate: string;
  status: 'Active' | 'On Leave' | 'Terminated';
  department: string;
  workHours: string;
  avatar: string;
}

// Map backend roles to display names and departments
const roleToPosition: Record<string, string> = {
  'admin': 'Administrator',
  'cashier': 'Cashier',
  'chef': 'Chef'
};

const roleToDepartment: Record<string, string> = {
  'admin': 'Management',
  'cashier': 'Service',
  'chef': 'Kitchen'
};

export default function StaffManagement() {
  const [activeTab, setActiveTab] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('name');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [editingStaff, setEditingStaff] = useState<StaffMemberDisplay | null>(null);
  const [staff, setStaff] = useState<StaffMemberDisplay[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [formData, setFormData] = useState<CreateStaffData & { confirmPassword?: string }>({
    username: '',
    password: '',
    roles: 'chef',
    phone: '',
    address: '',
    image: null
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [passwordStrength, setPasswordStrength] = useState<number>(0);

  // Convert backend staff member to display format
  const convertToDisplay = (member: StaffMember): StaffMemberDisplay => {
    // Handle image URL - if it's a relative URL, prepend API base URL
    let imageUrl = 'https://placehold.co/100x100';
    if (member.image) {
      if (member.image.startsWith('http://') || member.image.startsWith('https://')) {
        imageUrl = member.image;
      } else if (member.image.startsWith('/')) {
        imageUrl = `${API}${member.image}`;
      } else {
        imageUrl = `${API}/media/${member.image}`;
      }
    }
    
    return {
      id: member.id,
      name: member.username,
      position: roleToPosition[member.roles] || member.roles,
      email: `${member.username}@restaurant.com`, // Generate email from username
      phone: member.phone || 'N/A',
      hireDate: new Date().toISOString().split('T')[0], // Use current date as default
      status: 'Active' as const,
      department: roleToDepartment[member.roles] || 'Other',
      workHours: '9:00 AM - 5:00 PM', // Default work hours
      avatar: imageUrl
    };
  };

  // Fetch staff from API
  const fetchStaff = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getAllStaff();
      const displayData = data.map(convertToDisplay);
      setStaff(displayData);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch staff members');
      console.error('Error fetching staff:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const tabs = ['All', 'Kitchen', 'Service', 'Bar', 'Management'];

  const filteredStaff = staff.filter((member: StaffMemberDisplay) => {
    const matchesTab = activeTab === 'All' || member.department === activeTab;
    const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         member.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  // Sort staff
  const sortedStaff = [...filteredStaff].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'position':
        return a.position.localeCompare(b.position);
      case 'hireDate':
        return new Date(b.hireDate).getTime() - new Date(a.hireDate).getTime();
      case 'department':
        return a.department.localeCompare(b.department);
      default:
        return 0;
    }
  });

  const totalPages = Math.ceil(sortedStaff.length / 6);
  const startIndex = (currentPage - 1) * 6;
  const paginatedStaff = sortedStaff.slice(startIndex, startIndex + 6);

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Active': return { bg: '#D1FAE5', text: '#10B981', border: '#6EE7B7' };
      case 'On Leave': return { bg: '#FEF3C7', text: '#F59E0B', border: '#FCD34D' };
      case 'Terminated': return { bg: '#FEE2E2', text: '#EF4444', border: '#FCA5A5' };
      default: return { bg: '#F3F4F6', text: '#6B7280', border: '#D1D5DB' };
    }
  };

  const getDepartmentCount = (department: string) => {
    if (department === 'All') return staff.length;
    return staff.filter(member => member.department === department).length;
  };

  // Validate form fields
  const validateField = (name: string, value: any) => {
    const errors: Record<string, string> = { ...validationErrors };
    
    switch (name) {
      case 'username':
        if (!value || value.trim() === '') {
          errors.username = 'Username is required';
        } else if (value.length < 3) {
          errors.username = 'Username must be at least 3 characters';
        } else if (!/^[a-zA-Z0-9_]+$/.test(value)) {
          errors.username = 'Username can only contain letters, numbers, and underscores';
        } else {
          delete errors.username;
        }
        break;
      case 'password':
        if (!value || value.trim() === '') {
          errors.password = 'Password is required';
        } else if (value.length < 6) {
          errors.password = 'Password must be at least 6 characters';
        } else {
          delete errors.password;
        }
        // Calculate password strength
        let strength = 0;
        if (value.length >= 6) strength++;
        if (value.length >= 8) strength++;
        if (/[a-z]/.test(value) && /[A-Z]/.test(value)) strength++;
        if (/\d/.test(value)) strength++;
        if (/[^a-zA-Z0-9]/.test(value)) strength++;
        setPasswordStrength(strength);
        break;
      case 'confirmPassword':
        if (value !== formData.password) {
          errors.confirmPassword = 'Passwords do not match';
        } else {
          delete errors.confirmPassword;
        }
        break;
      case 'phone':
        if (value && !/^[\d\s\-\+\(\)]+$/.test(value)) {
          errors.phone = 'Please enter a valid phone number';
        } else {
          delete errors.phone;
        }
        break;
    }
    
    setValidationErrors(errors);
  };

  const handleAddStaff = async () => {
    // Validate all fields
    validateField('username', formData.username);
    validateField('password', formData.password);
    validateField('confirmPassword', formData.confirmPassword);
    if (formData.phone) validateField('phone', formData.phone);

    // Check if there are any errors
    if (Object.keys(validationErrors).length > 0 || !formData.username || !formData.password) {
      setError('Please fix the errors in the form');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const { confirmPassword, ...staffData } = formData;
      await createStaff(staffData);
      setShowAddModal(false);
      resetForm();
      setImagePreview(null);
      setValidationErrors({});
      setPasswordStrength(0);
      fetchStaff();
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 
                          err.response?.data?.username?.[0] || 
                          'Failed to create staff member';
      setError(errorMessage);
      console.error('Error creating staff:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditStaff = async () => {
    if (!editingStaff) return;

    // Validate password fields if password is being changed
    if (formData.password) {
      validateField('password', formData.password);
      validateField('confirmPassword', formData.confirmPassword);
      
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      
      if (Object.keys(validationErrors).length > 0) {
        setError('Please fix the errors in the form');
        return;
      }
    }

    // Validate phone if provided
    if (formData.phone) {
      validateField('phone', formData.phone);
      if (validationErrors.phone) {
        setError('Please fix the errors in the form');
        return;
      }
    }

    try {
      setLoading(true);
      setError('');
      const updateData: any = {};
      if (formData.roles) updateData.roles = formData.roles;
      if (formData.phone !== undefined) updateData.phone = formData.phone;
      if (formData.address !== undefined) updateData.address = formData.address;
      if (formData.image) updateData.image = formData.image;
      if (formData.password && formData.password === formData.confirmPassword) {
        updateData.password = formData.password;
      }

      await updateStaff(editingStaff.id, updateData);
      setShowEditModal(false);
      setEditingStaff(null);
      resetForm();
      setImagePreview(null);
      setValidationErrors({});
      setPasswordStrength(0);
      fetchStaff();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update staff member');
      console.error('Error updating staff:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStaff = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this staff member?')) {
      return;
    }

    try {
      setLoading(true);
      setError('');
      await deleteStaff(id);
      fetchStaff();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete staff member');
      console.error('Error deleting staff:', err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      username: '',
      password: '',
      roles: 'chef',
      phone: '',
      address: '',
      image: null,
      confirmPassword: ''
    });
    setError('');
    setImagePreview(null);
    setValidationErrors({});
    setPasswordStrength(0);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB');
        return;
      }
      setFormData({...formData, image: file});
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 2) return '#EF4444'; // red
    if (passwordStrength <= 3) return '#F59E0B'; // orange
    return '#10B981'; // green
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 2) return 'Weak';
    if (passwordStrength <= 3) return 'Medium';
    return 'Strong';
  };

  const openEditModal = (member: StaffMemberDisplay) => {
    setEditingStaff(member);
    setFormData({
      username: member.name,
      password: '',
      roles: member.department === 'Kitchen' ? 'chef' : member.department === 'Service' ? 'cashier' : 'admin',
      phone: member.phone !== 'N/A' ? member.phone : '',
      address: '',
      image: null,
      confirmPassword: ''
    });
    setImagePreview(member.avatar);
    setValidationErrors({});
    setPasswordStrength(0);
    setShowEditModal(true);
  };

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-2xl font-bold mb-4 md:mb-0">Staff Management</h1>
        <button 
          className="flex items-center text-white px-4 py-2 rounded-md hover:opacity-90 transition-opacity"
          style={{ backgroundColor: '#FF8C00' }}
          onClick={() => {
            resetForm();
            setShowAddModal(true);
          }}
        >
          <UserPlus size={18} className="mr-2" />
          Add New Staff
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Search and Filter Bar */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search staff by name, position, or email..."
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-md w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <select
                className="appearance-none bg-white border border-gray-200 rounded-md px-4 py-2 pr-8"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="name">Sort by Name</option>
                <option value="position">Sort by Position</option>
                <option value="hireDate">Sort by Hire Date</option>
                <option value="department">Sort by Department</option>
              </select>
              <ChevronDown size={16} className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
            <button className="p-2 border border-gray-200 rounded-md" onClick={fetchStaff}>
              <RefreshCw size={18} className="text-gray-500" />
            </button>
          </div>
        </div>
      </div>

      {/* Department Tabs */}
      <div className="mb-6 overflow-x-auto">
        <div className="flex space-x-2 min-w-max">
          {tabs.map((tab) => (
            <button
              key={tab}
              className={`px-4 py-2 rounded-md whitespace-nowrap ${
                activeTab === tab
                  ? 'bg-[var(--color-primary)] text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => {
                setActiveTab(tab);
                setCurrentPage(1);
              }}
            >
              {tab} ({getDepartmentCount(tab)})
            </button>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {loading && staff.length === 0 ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="animate-spin text-[var(--color-primary)]" size={32} />
        </div>
      ) : (
        <>
          {/* Staff List */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {paginatedStaff.map((member) => {
              const statusColor = getStatusColor(member.status);
              return (
                <div key={member.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <div className="p-4 flex">
                    <div className="mr-4">
                      <img 
                        src={member.avatar} 
                        alt={member.name} 
                        className="w-16 h-16 rounded-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'https://placehold.co/100x100';
                        }}
                      />
                    </div>
                    <div className="flex-grow">
                      <div className="flex justify-between items-start">
                        <h3 className="font-bold text-lg">{member.name}</h3>
                        <span 
                          className="text-xs px-2 py-1 rounded-full" 
                          style={{ 
                            backgroundColor: statusColor.bg, 
                            color: statusColor.text,
                            borderColor: statusColor.border,
                            borderWidth: '1px'
                          }}
                        >
                          {member.status}
                        </span>
                      </div>
                      <p className="text-gray-600 font-medium">{member.position}</p>
                      <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
                        <div className="flex items-center text-sm text-gray-500">
                          <Mail size={14} className="mr-1" />
                          <span className="truncate">{member.email}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <Phone size={14} className="mr-1" />
                          <span>{member.phone}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar size={14} className="mr-1" />
                          <span>Hired: {new Date(member.hireDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <Clock size={14} className="mr-1" />
                          <span>{member.workHours}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="border-t border-gray-100 p-3 bg-gray-50 flex justify-end space-x-2">
                    <button 
                      className="text-blue-500 hover:text-blue-700 flex items-center text-sm"
                      onClick={() => openEditModal(member)}
                    >
                      <Edit size={14} className="mr-1" /> Edit
                    </button>
                    <button 
                      className="text-red-500 hover:text-red-700 flex items-center text-sm"
                      onClick={() => handleDeleteStaff(member.id)}
                    >
                      <Trash2 size={14} className="mr-1" /> Remove
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Empty State */}
          {paginatedStaff.length === 0 && !loading && (
            <div className="text-center py-12">
              <p className="text-gray-500">No staff members found</p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2">
              <button
                className="p-2 rounded-md border border-gray-200 disabled:opacity-50"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                <ChevronLeft size={18} />
              </button>
              <span className="text-sm">
                Page {currentPage} of {totalPages}
              </span>
              <button
                className="p-2 rounded-md border border-gray-200 disabled:opacity-50"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </>
      )}

      {/* Add Staff Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-lg flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">Add New Staff Member</h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6">
              {error && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Left Column */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Username <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="text" 
                      className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 transition-all ${
                        validationErrors.username 
                          ? 'border-red-300 focus:ring-red-500' 
                          : 'border-gray-300 focus:ring-[#FF8C00]'
                      }`}
                      placeholder="Enter username"
                      value={formData.username}
                      onChange={(e) => {
                        setFormData({...formData, username: e.target.value});
                        validateField('username', e.target.value);
                      }}
                      onBlur={(e) => validateField('username', e.target.value)}
                    />
                    {validationErrors.username && (
                      <p className="text-red-500 text-xs mt-1">{validationErrors.username}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Password <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="password" 
                      className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 transition-all ${
                        validationErrors.password 
                          ? 'border-red-300 focus:ring-red-500' 
                          : 'border-gray-300 focus:ring-[#FF8C00]'
                      }`}
                      placeholder="Enter password"
                      value={formData.password}
                      onChange={(e) => {
                        setFormData({...formData, password: e.target.value});
                        validateField('password', e.target.value);
                      }}
                      onBlur={(e) => validateField('password', e.target.value)}
                    />
                    {formData.password && (
                      <div className="mt-2">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-gray-600">Password strength:</span>
                          <span className="text-xs font-medium" style={{ color: getPasswordStrengthColor() }}>
                            {getPasswordStrengthText()}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="h-2 rounded-full transition-all"
                            style={{ 
                              width: `${(passwordStrength / 5) * 100}%`,
                              backgroundColor: getPasswordStrengthColor()
                            }}
                          />
                        </div>
                      </div>
                    )}
                    {validationErrors.password && (
                      <p className="text-red-500 text-xs mt-1">{validationErrors.password}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm Password <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="password" 
                      className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 transition-all ${
                        validationErrors.confirmPassword 
                          ? 'border-red-300 focus:ring-red-500' 
                          : 'border-gray-300 focus:ring-[#FF8C00]'
                      }`}
                      placeholder="Confirm password"
                      value={formData.confirmPassword}
                      onChange={(e) => {
                        setFormData({...formData, confirmPassword: e.target.value});
                        validateField('confirmPassword', e.target.value);
                      }}
                      onBlur={(e) => validateField('confirmPassword', e.target.value)}
                    />
                    {validationErrors.confirmPassword && (
                      <p className="text-red-500 text-xs mt-1">{validationErrors.confirmPassword}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Role <span className="text-red-500">*</span>
                    </label>
                    <select 
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#FF8C00] transition-all"
                      value={formData.roles}
                      onChange={(e) => setFormData({...formData, roles: e.target.value as 'admin' | 'cashier' | 'chef'})}
                    >
                      <option value="chef">👨‍🍳 Chef</option>
                      <option value="cashier">💰 Cashier</option>
                      <option value="admin">👑 Admin</option>
                    </select>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input 
                      type="tel" 
                      className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 transition-all ${
                        validationErrors.phone 
                          ? 'border-red-300 focus:ring-red-500' 
                          : 'border-gray-300 focus:ring-[#FF8C00]'
                      }`}
                      placeholder="+1 234 567 8900"
                      value={formData.phone}
                      onChange={(e) => {
                        setFormData({...formData, phone: e.target.value});
                        validateField('phone', e.target.value);
                      }}
                      onBlur={(e) => validateField('phone', e.target.value)}
                    />
                    {validationErrors.phone && (
                      <p className="text-red-500 text-xs mt-1">{validationErrors.phone}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <textarea 
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#FF8C00] transition-all resize-none"
                      placeholder="Enter address"
                      rows={3}
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Profile Image</label>
                    <div className="space-y-2">
                      {imagePreview ? (
                        <div className="relative">
                          <img 
                            src={imagePreview} 
                            alt="Preview" 
                            className="w-full h-48 object-cover rounded-md border border-gray-300"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setImagePreview(null);
                              setFormData({...formData, image: null});
                            }}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <User size={32} className="text-gray-400 mb-2" />
                            <p className="text-sm text-gray-500 mb-1">
                              <span className="font-semibold">Click to upload</span> or drag and drop
                            </p>
                            <p className="text-xs text-gray-500">PNG, JPG, GIF (MAX. 5MB)</p>
                          </div>
                          <input 
                            type="file" 
                            accept="image/*"
                            className="hidden"
                            onChange={handleImageChange}
                          />
                        </label>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-6 mt-6 border-t border-gray-200">
                <button 
                  className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors font-medium"
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button 
                  className="px-6 py-2 text-white rounded-md disabled:opacity-50 hover:opacity-90 transition-opacity font-medium flex items-center gap-2"
                  style={{ backgroundColor: '#FF8C00' }}
                  onClick={handleAddStaff}
                  disabled={loading || Object.keys(validationErrors).length > 0}
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" size={18} />
                      Adding...
                    </>
                  ) : (
                    <>
                      <UserPlus size={18} />
                      Add Staff
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Staff Modal */}
      {showEditModal && editingStaff && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-lg flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">Edit Staff Member</h2>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingStaff(null);
                  resetForm();
                  setImagePreview(null);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6">
              {error && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                  {error}
                </div>
              )}

              {/* Staff Info Display */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center space-x-4">
                  <img 
                    src={editingStaff.avatar} 
                    alt={editingStaff.name} 
                    className="w-16 h-16 rounded-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://placehold.co/100x100';
                    }}
                  />
                  <div>
                    <h3 className="font-bold text-lg text-gray-800">{editingStaff.name}</h3>
                    <p className="text-gray-600">{editingStaff.position}</p>
                    <p className="text-sm text-gray-500">{editingStaff.department} Department</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Left Column */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Username
                    </label>
                    <input 
                      type="text" 
                      className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-50 cursor-not-allowed"
                      value={formData.username}
                      disabled
                      readOnly
                    />
                    <p className="text-xs text-gray-500 mt-1">Username cannot be changed</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Role <span className="text-red-500">*</span>
                    </label>
                    <select 
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#FF8C00] transition-all"
                      value={formData.roles}
                      onChange={(e) => setFormData({...formData, roles: e.target.value as 'admin' | 'cashier' | 'chef'})}
                    >
                      <option value="chef">👨‍🍳 Chef</option>
                      <option value="cashier">💰 Cashier</option>
                      <option value="admin">👑 Admin</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      New Password
                    </label>
                    <input 
                      type="password" 
                      className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 transition-all ${
                        validationErrors.password 
                          ? 'border-red-300 focus:ring-red-500' 
                          : 'border-gray-300 focus:ring-[#FF8C00]'
                      }`}
                      placeholder="Leave blank to keep current password"
                      value={formData.password}
                      onChange={(e) => {
                        setFormData({...formData, password: e.target.value});
                        if (e.target.value) {
                          validateField('password', e.target.value);
                        } else {
                          const errors = { ...validationErrors };
                          delete errors.password;
                          setValidationErrors(errors);
                          setPasswordStrength(0);
                        }
                      }}
                      onBlur={(e) => {
                        if (e.target.value) {
                          validateField('password', e.target.value);
                        }
                      }}
                    />
                    {formData.password && (
                      <div className="mt-2">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-gray-600">Password strength:</span>
                          <span className="text-xs font-medium" style={{ color: getPasswordStrengthColor() }}>
                            {getPasswordStrengthText()}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="h-2 rounded-full transition-all"
                            style={{ 
                              width: `${(passwordStrength / 5) * 100}%`,
                              backgroundColor: getPasswordStrengthColor()
                            }}
                          />
                        </div>
                      </div>
                    )}
                    {validationErrors.password && (
                      <p className="text-red-500 text-xs mt-1">{validationErrors.password}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm New Password
                    </label>
                    <input 
                      type="password" 
                      className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 transition-all ${
                        validationErrors.confirmPassword 
                          ? 'border-red-300 focus:ring-red-500' 
                          : 'border-gray-300 focus:ring-[#FF8C00]'
                      }`}
                      placeholder="Confirm new password"
                      value={formData.confirmPassword}
                      onChange={(e) => {
                        setFormData({...formData, confirmPassword: e.target.value});
                        if (e.target.value || formData.password) {
                          validateField('confirmPassword', e.target.value);
                        } else {
                          const errors = { ...validationErrors };
                          delete errors.confirmPassword;
                          setValidationErrors(errors);
                        }
                      }}
                      onBlur={(e) => {
                        if (e.target.value || formData.password) {
                          validateField('confirmPassword', e.target.value);
                        }
                      }}
                    />
                    {validationErrors.confirmPassword && (
                      <p className="text-red-500 text-xs mt-1">{validationErrors.confirmPassword}</p>
                    )}
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input 
                      type="tel" 
                      className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 transition-all ${
                        validationErrors.phone 
                          ? 'border-red-300 focus:ring-red-500' 
                          : 'border-gray-300 focus:ring-[#FF8C00]'
                      }`}
                      placeholder="+1 234 567 8900"
                      value={formData.phone}
                      onChange={(e) => {
                        setFormData({...formData, phone: e.target.value});
                        validateField('phone', e.target.value);
                      }}
                      onBlur={(e) => validateField('phone', e.target.value)}
                    />
                    {validationErrors.phone && (
                      <p className="text-red-500 text-xs mt-1">{validationErrors.phone}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <textarea 
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#FF8C00] transition-all resize-none"
                      placeholder="Enter address"
                      rows={3}
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Profile Image</label>
                    <div className="space-y-2">
                      {imagePreview ? (
                        <div className="relative">
                          <img 
                            src={imagePreview} 
                            alt="Preview" 
                            className="w-full h-48 object-cover rounded-md border border-gray-300"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setImagePreview(editingStaff.avatar);
                              setFormData({...formData, image: null});
                            }}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                          >
                            <X size={16} />
                          </button>
                          <p className="text-xs text-gray-500 mt-1 text-center">
                            {formData.image ? 'New image selected' : 'Current image'}
                          </p>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <User size={32} className="text-gray-400 mb-2" />
                            <p className="text-sm text-gray-500 mb-1">
                              <span className="font-semibold">Click to upload</span> or drag and drop
                            </p>
                            <p className="text-xs text-gray-500">PNG, JPG, GIF (MAX. 5MB)</p>
                          </div>
                          <input 
                            type="file" 
                            accept="image/*"
                            className="hidden"
                            onChange={handleImageChange}
                          />
                        </label>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-6 mt-6 border-t border-gray-200">
                <button 
                  className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors font-medium"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingStaff(null);
                    resetForm();
                    setImagePreview(null);
                  }}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button 
                  className="px-6 py-2 text-white rounded-md disabled:opacity-50 hover:opacity-90 transition-opacity font-medium flex items-center gap-2"
                  style={{ backgroundColor: '#FF8C00' }}
                  onClick={handleEditStaff}
                  disabled={loading || (formData.password && Object.keys(validationErrors).length > 0)}
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" size={18} />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Edit size={18} />
                      Update Staff
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
