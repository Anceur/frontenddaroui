import React, { useState, useEffect } from 'react';
import { Search, RefreshCw, ChevronDown, ChevronLeft, ChevronRight, Edit, Trash2, Phone, Calendar, Clock, User, UserPlus, Loader2, X } from 'lucide-react';
import { getAllStaff, createStaff, updateStaff, deleteStaff } from '../../shared/api/staff';
import type { StaffMember, CreateStaffData } from '../../shared/api/staff';
import { API } from '../../shared/api/API';

interface StaffMemberDisplay {
  id: number;
  name: string;
  role: string;
  phone: string;
  hireDate: string;
  status: 'Active' | 'On Leave' | 'Terminated';
  department: string;
  workHours: string;
  avatar: string;
  hasAccount: boolean;
  username?: string;
}

// Map basic roles to departments
const roleToDepartment: Record<string, string> = {
  'admin': 'Direction',
  'cashier': 'Service',
  'chef': 'Cuisine',
  'waiter': 'Service',
  'cook': 'Cuisine'
};

export default function StaffManagement() {
  const [activeTab, setActiveTab] = useState<string>('Tous');
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
    name: '',
    role: 'cook',
    has_account: false,
    username: '',
    password: '',
    phone: '',
    address: '',
    image: '',
    confirmPassword: ''
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [passwordStrength, setPasswordStrength] = useState<number>(0);

  // Convert backend staff member to display format
  const convertToDisplay = (member: StaffMember): StaffMemberDisplay => {
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
      name: member.name,
      role: member.role,
      phone: member.phone || 'N/A',
      hireDate: member.is_active ? new Date().toISOString().split('T')[0] : 'N/A',
      status: member.is_active ? 'Active' : 'Terminated',
      department: roleToDepartment[member.role.toLowerCase()] || 'Other',
      workHours: 'Shift Basis',
      avatar: imageUrl,
      hasAccount: !!member.user,
      username: member.username
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
      setError(err.response?.data?.error || 'Échec de la récupération des employés');
      console.error('Erreur récupération employés:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const tabs = ['Tous', 'Cuisine', 'Service', 'Bar', 'Direction'];

  const filteredStaff = staff.filter((member: StaffMemberDisplay) => {
    const matchesTab = activeTab === 'Tous' || member.department === activeTab;
    const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.role.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  // Sort staff
  const sortedStaff = [...filteredStaff].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'role':
        return a.role.localeCompare(b.role);
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
    switch (status) {
      case 'Active': return { bg: '#D1FAE5', text: '#10B981', border: '#6EE7B7' };
      case 'On Leave': return { bg: '#FEF3C7', text: '#F59E0B', border: '#FCD34D' };
      case 'Terminated': return { bg: '#FEE2E2', text: '#EF4444', border: '#FCA5A5' };
      default: return { bg: '#F3F4F6', text: '#6B7280', border: '#D1D5DB' };
    }
  };

  const getDepartmentCount = (department: string) => {
    if (department === 'Tous') return staff.length;
    return staff.filter(member => member.department === department).length;
  };

  // Validate form fields
  const validateField = (name: string, value: any) => {
    const errors: Record<string, string> = { ...validationErrors };

    switch (name) {
      case 'name':
        if (!value || value.trim() === '') {
          errors.name = 'Le nom complet est obligatoire';
        } else {
          delete errors.name;
        }
        break;
      case 'username':
        if (formData.has_account) {
          if (!value || value.trim() === '') {
            errors.username = "Le nom d'utilisateur est obligatoire";
          } else if (value.length < 3) {
            errors.username = "Le nom d'utilisateur doit comporter au moins 3 caractères";
          } else {
            delete errors.username;
          }
        } else {
          delete errors.username;
        }
        break;
      case 'password':
        if (formData.has_account && (!editingStaff || value)) {
          if (!value || value.trim() === '') {
            errors.password = 'Le mot de passe est obligatoire';
          } else if (value.length < 6) {
            errors.password = 'Le mot de passe doit comporter au moins 6 caractères';
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
        } else {
          delete errors.password;
        }
        break;
      case 'confirmPassword':
        if (formData.has_account && formData.password !== value) {
          errors.confirmPassword = 'Les mots de passe ne correspondent pas';
        } else {
          delete errors.confirmPassword;
        }
        break;
      case 'phone':
        if (value && !/^[\d\s\-\+\(\)]+$/.test(value)) {
          errors.phone = 'Veuillez entrer un numéro de téléphone valide';
        } else {
          delete errors.phone;
        }
        break;
    }

    setValidationErrors(errors);
  };

  const handleAddStaff = async () => {
    // Validate all fields
    validateField('name', formData.name);
    if (formData.has_account) {
      validateField('username', formData.username);
      validateField('password', formData.password);
      validateField('confirmPassword', formData.confirmPassword);
    }
    if (formData.phone) validateField('phone', formData.phone);

    // Check if there are any errors
    if (Object.keys(validationErrors).length > 0 || !formData.name) {
      setError('Veuillez corriger les erreurs dans le formulaire');
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
        "Échec de la création de l'employé";
      setError(errorMessage);
      console.error('Erreur création personnel:', err);
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
        setError('Les mots de passe ne correspondent pas');
        return;
      }

      if (Object.keys(validationErrors).length > 0) {
        setError('Veuillez corriger les erreurs dans le formulaire');
        return;
      }
    }

    // Validate phone if provided
    if (formData.phone) {
      validateField('phone', formData.phone);
      if (validationErrors.phone) {
        setError('Veuillez corriger les erreurs dans le formulaire');
        return;
      }
    }

    try {
      setLoading(true);
      setError('');
      const updateData: any = {
        name: formData.name,
        role: formData.role,
        phone: formData.phone,
        address: formData.address
      };

      if (formData.image instanceof File) updateData.image = formData.image;
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
      setError(err.response?.data?.error || "Échec de la mise à jour de l'employé");
      console.error('Erreur mise à jour personnel:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStaff = async (id: number) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet employé ?')) {
      return;
    }

    try {
      setLoading(true);
      setError('');
      await deleteStaff(id);
      fetchStaff();
    } catch (err: any) {
      setError(err.response?.data?.error || "Échec de la suppression de l'employé");
      console.error('Erreur suppression personnel:', err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      role: '',
      has_account: false,
      username: '',
      password: '',
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

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  try {
    setError('');
    console.log('📤 بدء رفع صورة Staff:', file.name);
    
    // عرض معاينة محلية فوراً
    const localPreview = URL.createObjectURL(file);
    setImagePreview(localPreview);

    // رفع الصورة إلى Firebase عبر Django Backend
    const formData = new FormData();
    formData.append('image', file);
    formData.append('timestamp', Date.now().toString());

    console.log('🚀 جاري الرفع إلى الخادم...');
    const uploadResponse = await fetch(`${API}/staff/upload-image/`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });

    if (!uploadResponse.ok) {
      const errorData = await uploadResponse.json();
      throw new Error(errorData.error || 'فشل رفع الصورة');
    }

    const uploadData = await uploadResponse.json();
    const imageUrl = uploadData.imageUrl;
    console.log('✅ تم رفع صورة Staff بنجاح:', imageUrl);

    // 🔥 المهم: احفظ رابط URL وليس الملف
    setFormData(prev => ({ ...prev, image: imageUrl }));
    setImagePreview(imageUrl);
    
  } catch (err: any) {
    console.error("❌ خطأ:", err);
    setError("خطأ في رفع الصورة: " + err.message);
    setImagePreview(null);
  }
};

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 2) return '#EF4444'; // red
    if (passwordStrength <= 3) return '#F59E0B'; // orange
    return '#10B981'; // green
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 2) return 'Faible';
    if (passwordStrength <= 3) return 'Moyenne';
    return 'Forte';
  };

  const openEditModal = (member: StaffMemberDisplay) => {
    setEditingStaff(member);
    setFormData({
      name: member.name,
      role: member.role,
      has_account: member.hasAccount,
      username: member.username || '',
      password: '',
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
        <h1 className="text-2xl font-bold mb-4 md:mb-0">Gestion du personnel</h1>
        <button
          className="flex items-center text-white px-4 py-2 rounded-md hover:opacity-90 transition-opacity"
          style={{ backgroundColor: '#FF8C00' }}
          onClick={() => {
            resetForm();
            setShowAddModal(true);
          }}
        >
          <UserPlus size={18} className="mr-2" />
          Ajouter un employé
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
              placeholder="Rechercher par nom, poste ou email..."
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
                <option value="name">Trier par nom</option>
                <option value="position">Trier par poste</option>
                <option value="hireDate">Trier par date d'embauche</option>
                <option value="department">Trier par département</option>
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
              className={`px-4 py-2 rounded-md whitespace-nowrap ${activeTab === tab
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
                        <div>
                          <h3 className="font-bold text-lg">{member.name}</h3>
                          <p className="text-gray-600 font-medium">{member.role}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
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
                          {member.hasAccount && (
                            <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 border border-blue-300">
                              🔐 Compte actif
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
                        {member.hasAccount && member.username && (
                          <div className="flex items-center text-sm text-gray-500">
                            <User size={14} className="mr-1" />
                            <span className="truncate">@{member.username}</span>
                          </div>
                        )}
                        <div className="flex items-center text-sm text-gray-500">
                          <Phone size={14} className="mr-1" />
                          <span>{member.phone}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar size={14} className="mr-1" />
                          <span>Département : {member.department}</span>
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
                      <Edit size={14} className="mr-1" /> Modifier
                    </button>
                    <button
                      className="text-red-500 hover:text-red-700 flex items-center text-sm"
                      onClick={() => handleDeleteStaff(member.id)}
                    >
                      <Trash2 size={14} className="mr-1" /> Supprimer
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Empty State */}
          {paginatedStaff.length === 0 && !loading && (
            <div className="text-center py-12">
              <p className="text-gray-500">Aucun employé trouvé</p>
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
                Page {currentPage} sur {totalPages}
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
              <h2 className="text-2xl font-bold text-gray-800">Ajouter un employé</h2>
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
                      Nom complet <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 transition-all ${validationErrors.name
                        ? 'border-red-300 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-[#FF8C00]'
                        }`}
                      placeholder="Saisir le nom complet"
                      value={formData.name}
                      onChange={(e) => {
                        setFormData({ ...formData, name: e.target.value });
                        validateField('name', e.target.value);
                      }}
                      onBlur={(e) => validateField('name', e.target.value)}
                    />
                    {validationErrors.name && (
                      <p className="text-red-500 text-xs mt-1">{validationErrors.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.has_account}
                        onChange={(e) => setFormData({ ...formData, has_account: e.target.checked, role: 'cashier' })}
                        className="w-4 h-4 text-[#FF8C00] border-gray-300 rounded focus:ring-[#FF8C00]"
                      />
                      <span className="text-sm font-medium text-gray-700">Créer un compte utilisateur (accès de connexion)</span>
                    </label>
                    <p className="text-xs text-gray-500 mt-1 ml-6">Cochez ceci si l'employé a besoin d'un accès au système</p>
                  </div>

                  {formData.has_account && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nom d'utilisateur <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 transition-all ${validationErrors.username
                            ? 'border-red-300 focus:ring-red-500'
                            : 'border-gray-300 focus:ring-[#FF8C00]'
                            }`}
                          placeholder="Saisir le nom d'utilisateur"
                          value={formData.username}
                          onChange={(e) => {
                            setFormData({ ...formData, username: e.target.value });
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
                          Mot de passe <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="password"
                          className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 transition-all ${validationErrors.password
                            ? 'border-red-300 focus:ring-red-500'
                            : 'border-gray-300 focus:ring-[#FF8C00]'
                            }`}
                          placeholder="Saisir le mot de passe"
                          value={formData.password}
                          onChange={(e) => {
                            setFormData({ ...formData, password: e.target.value });
                            validateField('password', e.target.value);
                          }}
                          onBlur={(e) => validateField('password', e.target.value)}
                        />
                        {formData.password && (
                          <div className="mt-2">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs text-gray-600">Robustesse du mot de passe :</span>
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
                          Confirmer le mot de passe <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="password"
                          className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 transition-all ${validationErrors.confirmPassword
                            ? 'border-red-300 focus:ring-red-500'
                            : 'border-gray-300 focus:ring-[#FF8C00]'
                            }`}
                          placeholder="Confirmer le mot de passe"
                          value={formData.confirmPassword}
                          onChange={(e) => {
                            setFormData({ ...formData, confirmPassword: e.target.value });
                            validateField('confirmPassword', e.target.value);
                          }}
                          onBlur={(e) => validateField('confirmPassword', e.target.value)}
                        />
                        {validationErrors.confirmPassword && (
                          <p className="text-red-500 text-xs mt-1">{validationErrors.confirmPassword}</p>
                        )}
                      </div>
                    </>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Rôle <span className="text-red-500">*</span>
                    </label>
                    {formData.has_account ? (
                      <select
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#FF8C00] transition-all"
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      >
                        <option value="cashier">💰 Caissier</option>
                        <option value="admin">👑 Admin</option>
                      </select>
                    ) : (
                      <input
                        type="text"
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#FF8C00] transition-all"
                        placeholder="ex. Serveur, Cuisinier, Agent d'entretien"
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      />
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      {formData.has_account ? 'Sélectionnez un rôle (Admin ou Caissier uniquement)' : 'Saisir un rôle personnalisé'}
                    </p>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                    <input
                      type="tel"
                      className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 transition-all ${validationErrors.phone
                        ? 'border-red-300 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-[#FF8C00]'
                        }`}
                      placeholder="+33 6 12 34 56 78"
                      value={formData.phone}
                      onChange={(e) => {
                        setFormData({ ...formData, phone: e.target.value });
                        validateField('phone', e.target.value);
                      }}
                      onBlur={(e) => validateField('phone', e.target.value)}
                    />
                    {validationErrors.phone && (
                      <p className="text-red-500 text-xs mt-1">{validationErrors.phone}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
                    <textarea
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#FF8C00] transition-all resize-none"
                      placeholder="Saisir l'adresse"
                      rows={3}
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Image de profil</label>
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
                              setFormData({ ...formData, image: null });
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
                              <span className="font-semibold">Cliquez pour téléverser</span> ou glissez-déposez
                            </p>
                            <p className="text-xs text-gray-500">PNG, JPG, GIF (MAX. 5 Mo)</p>
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
                  Annuler
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
                      Ajout en cours...
                    </>
                  ) : (
                    <>
                      <UserPlus size={18} />
                      Ajouter
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
              <h2 className="text-2xl font-bold text-gray-800">Modifier l'employé</h2>
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
                    <p className="text-sm text-gray-500">{editingStaff.department} Département</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Left Column */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nom d'utilisateur
                    </label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-50 cursor-not-allowed"
                      value={formData.username}
                      disabled
                      readOnly
                    />
                    <p className="text-xs text-gray-500 mt-1">Le nom d'utilisateur ne peut pas être modifié</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Rôle <span className="text-red-500">*</span>
                    </label>
                    <select
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#FF8C00] transition-all"
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value as 'admin' | 'cashier' | 'chef' })}
                    >
                      <option value="chef">👨‍🍳 Chef</option>
                      <option value="cashier">💰 Caissier</option>
                      <option value="admin">👑 Admin</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nouveau mot de passe
                    </label>
                    <input
                      type="password"
                      className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 transition-all ${validationErrors.password
                        ? 'border-red-300 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-[#FF8C00]'
                        }`}
                      placeholder="Laisser vide pour conserver le mot de passe actuel"
                      value={formData.password}
                      onChange={(e) => {
                        setFormData({ ...formData, password: e.target.value });
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
                          <span className="text-xs text-gray-600">Robustesse du mot de passe :</span>
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
                      Confirmer le nouveau mot de passe
                    </label>
                    <input
                      type="password"
                      className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 transition-all ${validationErrors.confirmPassword
                        ? 'border-red-300 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-[#FF8C00]'
                        }`}
                      placeholder="Confirmer le nouveau mot de passe"
                      value={formData.confirmPassword}
                      onChange={(e) => {
                        setFormData({ ...formData, confirmPassword: e.target.value });
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                    <input
                      type="tel"
                      className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 transition-all ${validationErrors.phone
                        ? 'border-red-300 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-[#FF8C00]'
                        }`}
                      placeholder="+33 6 12 34 56 78"
                      value={formData.phone}
                      onChange={(e) => {
                        setFormData({ ...formData, phone: e.target.value });
                        validateField('phone', e.target.value);
                      }}
                      onBlur={(e) => validateField('phone', e.target.value)}
                    />
                    {validationErrors.phone && (
                      <p className="text-red-500 text-xs mt-1">{validationErrors.phone}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
                    <textarea
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#FF8C00] transition-all resize-none"
                      placeholder="Saisir l'adresse"
                      rows={3}
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Image de profil</label>
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
                              setFormData({ ...formData, image: null });
                            }}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                          >
                            <X size={16} />
                          </button>
                          <p className="text-xs text-gray-500 mt-1 text-center">
                            {formData.image ? 'Nouvelle image sélectionnée' : 'Image actuelle'}
                          </p>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <User size={32} className="text-gray-400 mb-2" />
                            <p className="text-sm text-gray-500 mb-1">
                              <span className="font-semibold">Cliquez pour téléverser</span> ou glissez-déposez
                            </p>
                            <p className="text-xs text-gray-500">PNG, JPG, GIF (MAX. 5 Mo)</p>
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
                  Annuler
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
                      Mise à jour...
                    </>
                  ) : (
                    <>
                      <Edit size={18} />
                      Mettre à jour
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
