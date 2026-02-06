import React, { useState, useEffect, useCallback } from 'react';
import { Search, RefreshCw, ChevronDown, ChevronLeft, ChevronRight, Plus, Edit, Trash2, Tag, X, Save, Loader2, AlertCircle, Package, Sparkles } from 'lucide-react';
import { getMenuItems, createMenuItem, patchMenuItem, deleteMenuItem } from '../../shared/api/menu-items';
import type { MenuItem, CreateMenuItemData } from '../../shared/api/menu-items';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../../firebase";


export default function MenuProducts() {
  const [activeTab, setActiveTab] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('name');
  const [currentPage, setCurrentPage] = useState<number>(1);


  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [generatingDescription, setGeneratingDescription] = useState<boolean>(false);

  const [formData, setFormData] = useState<CreateMenuItemData>({
    name: '',
    description: '',
    price: 0,
    cost_price: 0,
    category: 'burger',
    image: '',
    featured: false,
  });


  const categories = ['All', 'burger', 'pizza', 'sandwich', 'plat', 'tacos', 'desserts', 'drinks'];

  const categoryLabels: Record<string, string> = {
    'All': 'Tous',
    'burger': 'Burger',
    'pizza': 'Pizza',
    'sandwich': 'Sandwich & Spéciaux',
    'plat': 'Plat',
    'tacos': 'Tacos',
    'desserts': 'Desserts',
    'drinks': 'Boissons',
  };

  // Fetch menu items
  const fetchMenuItems = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getMenuItems();
      setMenuItems(data);
    } catch (err: any) {
      setError(err.message || 'Échec du chargement des articles du menu');
      console.error('Error fetching menu items:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);


  useEffect(() => {
    fetchMenuItems();
  }, [fetchMenuItems]);

  // Filter and sort items
  const filteredItems = menuItems
    .filter(item => {
      const matchesTab = activeTab === 'All' || item.category === activeTab;
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description || '').toLowerCase().includes(searchQuery.toLowerCase());
      return matchesTab && matchesSearch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'price':
          return Number(a.price) - Number(b.price);
        case 'category':
          return a.category.localeCompare(b.category);
        case 'popular':
          return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
        default:
          return 0;
      }
    });

  const totalPages = Math.ceil(filteredItems.length / 6);
  const startIndex = (currentPage - 1) * 6;
  const paginatedItems = filteredItems.slice(startIndex, startIndex + 6);

  const getCategoryCount = (category: string) => {
    if (category === 'All') return menuItems.length;
    return menuItems.filter(item => item.category === category).length;
  };

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchMenuItems();
  };

  // Reset to page 1 when tab or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery]);

  // Convert File to base64

  // Generate description from image using Claude API
 

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError(null);

      if (editingItem) {
        // Update existing item
        await patchMenuItem(editingItem.id, formData);
      } else {
        // Create new item
        await createMenuItem(formData);
      }

      setFormData({
        name: '',
        description: '',
        price: 0,
        cost_price: 0,
        category: 'burger',
        image: '',
        featured: false,
      });
      setImagePreview(null);
      setEditingItem(null);
      setIsModalOpen(false);

      // Refresh menu items
      await fetchMenuItems();
    } catch (err: any) {
      setError(err.message || "Échec de l'enregistrement de l'article du menu");
      console.error('Error saving menu item:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle edit
  const handleEdit = (item: MenuItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description || '',
      price: Number(item.price),
      cost_price: Number(item.cost_price || 0),
      category: item.category,
      image: item.image || '',
      featured: item.featured || false,
    });
    setImagePreview(item.image || null);
    setIsModalOpen(true);
  };

  // Handle delete
  const handleDelete = async (id: number) => {
    try {
      setError(null);
      await deleteMenuItem(id);
      setDeleteConfirm(null);
      await fetchMenuItems();
    } catch (err: any) {
      setError(err.message || "Échec de la suppression de l'article du menu");
      console.error('Error deleting menu item:', err);
    }
  };
 

 const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  try {
    const localPreview = URL.createObjectURL(file);
    setImagePreview(localPreview);

   
    const imageRef = ref(storage, `menu/${Date.now()}-${file.name}`);
    await uploadBytes(imageRef, file);

    const imageURL = await getDownloadURL(imageRef);
    setFormData(prev => ({ ...prev, image: imageURL }));
    setImagePreview(imageURL);

  } catch (err) {
    console.error(err);
    setError("Erreur lors du téléchargement de l'image");
  }
};



  // Open modal for new item
  const openNewModal = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      description: '',
      price: 0,
      cost_price: 0,
      category: 'burger',
      image: '',
      featured: false,
    });
    setImagePreview(null);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 lg:mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold mb-2 text-gray-800">
          Produits du menu
        </h1>
        <p className="text-gray-500 font-medium tracking-wide">Gérez vos articles et produits du menu</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle size={20} className="text-red-600 flex-shrink-0" />
          <div className="flex-grow">
            <p className="text-red-800 font-medium">Erreur</p>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-red-600 hover:text-red-800"
          >
            <X size={20} />
          </button>
        </div>
      )}

      {/* Actions Bar */}
      <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-sm border border-gray-100 p-6 mb-8 flex flex-col lg:flex-row gap-4 items-center transition-all">
        <div className="relative flex-grow w-full">
          <Search size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher dans votre menu..."
            className="pl-12 pr-4 py-3 bg-gray-50 border-none rounded-xl w-full focus:ring-2 focus:ring-orange-500/20 transition-all outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-3 w-full lg:w-auto items-stretch">
          <div className="relative min-w-[140px]">
            <select
              className="appearance-none bg-gray-50 border border-transparent rounded-xl px-5 py-3 pr-10 w-full cursor-pointer focus:ring-2 focus:ring-orange-500/20 focus:bg-white outline-none transition-all font-bold text-gray-700 hover:bg-gray-100"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="name">Nom</option>
              <option value="price">Prix</option>
              <option value="category">Catégorie</option>
              <option value="popular">Popularité</option>
            </select>
            <ChevronDown size={18} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
          <button
            onClick={handleRefresh}
            className="px-4 bg-gray-50 border border-transparent rounded-xl hover:bg-gray-100 transition-all active:scale-95 flex items-center justify-center"
            disabled={refreshing || loading}
          >
            <RefreshCw size={20} className={refreshing || loading ? 'animate-spin' : ''} style={{ color: '#FF8C00' }} />
          </button>
          <button
            onClick={openNewModal}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-white font-bold shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 hover:-translate-y-0.5 transition-all whitespace-nowrap"
            style={{ backgroundColor: '#FF8C00' }}
          >
            <Plus size={20} />
            <span>Ajouter un article</span>
          </button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="mb-8 overflow-x-auto pb-2 scrollbar-hide">
        <div className="flex space-x-3 min-w-max">
          {categories.map((category) => {
            const isActive = activeTab === category;
            return (
              <button
                key={category}
                className={`px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 ${isActive
                  ? 'text-white shadow-lg shadow-orange-500/20'
                  : 'bg-white text-gray-500 border border-gray-100 hover:border-orange-200 hover:text-orange-500'
                  }`}
                style={isActive ? { backgroundColor: '#FF8C00' } : {}}
                onClick={() => setActiveTab(category)}
              >
                <span>{categoryLabels[category]}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${isActive ? 'bg-white/20' : 'bg-gray-100 text-gray-500'}`}>
                  {getCategoryCount(category)}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Menu Items Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-white rounded-3xl h-80 animate-pulse border border-gray-100" />
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-gray-200 p-20 text-center">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search size={32} className="text-gray-300" />
          </div>
          <p className="text-gray-400 font-medium">Aucun résultat trouvé dans cette catégorie</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-10">
            {paginatedItems.map((item) => (
              <div key={item.id} className="group bg-white rounded-3xl overflow-hidden border border-gray-100 hover:border-orange-200 hover:shadow-2xl hover:shadow-orange-500/5 transition-all duration-300">
                <div className="h-56 bg-gray-100 relative overflow-hidden">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-50">
                      <Package size={48} className="text-gray-200" />
                    </div>
                  )}
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1.5 bg-white/90 backdrop-blur-md rounded-full text-xs font-bold text-gray-700 shadow-sm border border-gray-100">
                      {categoryLabels[item.category] || item.category}
                    </span>
                  </div>
                  {item.featured && (
                    <div className="absolute top-4 right-4 bg-orange-500 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg">
                      À la une
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-bold text-xl text-gray-800 leading-tight">{item.name}</h3>
                  </div>
                  <p className="text-gray-500 text-sm mb-6 line-clamp-2 min-h-[40px] italic">
                    {item.description || 'Une recette secrète de Nostalgie...'}
                  </p>

                  <div className="flex justify-between items-center pt-5 border-t border-gray-50">
                    <span className="text-2xl font-bold text-orange-600">
                      {Number(item.price).toFixed(2)} <span className="text-sm font-semibold text-orange-400">DA</span>
                    </span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleEdit(item)}
                        className="p-3 text-blue-500 hover:bg-blue-50 rounded-xl transition-all active:scale-90"
                        title="Modifier le produit"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(item.id)}
                        className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-all active:scale-90"
                        title="Supprimer le produit"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 py-8">
              <button
                className="p-3 rounded-xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all disabled:opacity-30 disabled:hover:shadow-sm"
                disabled={currentPage === 1 || loading}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                <ChevronLeft size={20} style={{ color: '#FF8C00' }} />
              </button>
              <div className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-100 rounded-xl shadow-sm">
                <span className="text-sm font-semibold text-gray-400">Page</span>
                <span className="text-sm font-bold text-orange-600">{currentPage}</span>
                <span className="text-sm font-semibold text-gray-400">sur {totalPages}</span>
              </div>
              <button
                className="p-3 rounded-xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all disabled:opacity-30 disabled:hover:shadow-sm"
                disabled={currentPage === totalPages || loading}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                <ChevronRight size={20} style={{ color: '#FF8C00' }} />
              </button>
            </div>
          )}
        </>
      )
      }

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50 p-4 transition-all animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-orange-100">
            <div className="sticky top-0 bg-white/80 backdrop-blur-md px-8 py-6 border-b border-gray-100 flex justify-between items-center z-10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-50 rounded-lg">
                  <Plus size={24} style={{ color: '#FF8C00' }} />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">
                  {editingItem ? 'Modifier le produit' : 'Créer un nouveau produit'}
                </h2>
              </div>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingItem(null);
                  setImagePreview(null);
                  setFormData({
                    name: '',
                    description: '',
                    price: 0,
                    cost_price: 0,
                    category: 'burger',
                    image: '',
                    featured: false,
                  });
                }}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Info Section */}
                <div className="md:col-span-2 space-y-4">
                  <div className="group">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                      Nom <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="ex. Burger Royal au Fromage"
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                      Description
                      {generatingDescription && (
                        <span className="flex items-center gap-1 text-orange-500 text-xs">
                          <Sparkles size={12} className="animate-pulse" />
                          Génération en cours...
                        </span>
                      )}
                    </label>
                    <textarea
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all resize-none"
                      rows={3}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Décrivez les saveurs, les ingrédients et la magie..."
                      disabled={generatingDescription}
                    />
                    {generatingDescription && (
                      <p className="text-xs text-orange-500 mt-2 flex items-center gap-1">
                        <Loader2 size={12} className="animate-spin" />
                        L'IA analyse votre image et génère une description appétissante...
                      </p>
                    )}
                  </div>
                </div>

                {/* Categories & Price Section */}
                <div className="space-y-4">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                      <Tag size={16} className="text-orange-500" /> Catégorie <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all appearance-none cursor-pointer"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    >
                      {categories.filter(c => c !== 'All').map(cat => (
                        <option key={cat} value={cat}>{categoryLabels[cat]}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-orange-50/50 rounded-xl border border-orange-100">
                    <input
                      type="checkbox"
                      id="featured-check"
                      className="w-5 h-5 rounded border-orange-300 text-orange-500 focus:ring-orange-500 cursor-pointer"
                      checked={formData.featured}
                      onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    />
                    <label htmlFor="featured-check" className="text-sm font-semibold text-orange-800 cursor-pointer select-none">
                      Marquer comme vedette / Produit populaire
                    </label>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                        Prix de vente (DA)
                      </label>
                      <input
                        type="number"
                        required
                        min="0"
                        step="0.01"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all font-bold text-orange-600"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                        placeholder="0,00"
                      />
                    </div>
                    <div>
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                        Prix de revient (DA)
                      </label>
                      <input
                        type="number"
                        required
                        min="0"
                        step="0.01"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all font-bold text-gray-600"
                        value={formData.cost_price || 0}
                        onChange={(e) => setFormData({ ...formData, cost_price: parseFloat(e.target.value) || 0 })}
                        placeholder="0,00"
                      />
                    </div>
                  </div>
                  <p className="text-[11px] text-gray-400 italic">Saisissez les prix en dinar algérien (DA)</p>
                </div>

                {/* Image Section */}
                <div className="md:col-span-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-4">
                    Image du produit
                    <span className="flex items-center gap-1 text-orange-500 text-xs">
                      <Sparkles size={12} />
                      Description auto-générée par IA
                    </span>
                  </label>
                  <div className="flex flex-col md:flex-row gap-6 items-center">
                    <div className="relative group w-40 h-40">
                      {imagePreview ? (
                        <>
                          <img 
                            src={imagePreview} 
                            alt="Aperçu" 
                            className="w-40 h-40 object-cover rounded-2xl border-2 border-orange-100 shadow-md"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setImagePreview(null);
                              setFormData({ ...formData, image: '' });
                            }}
                            className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-colors"
                          >
                            <X size={14} />
                          </button>
                        </>
                      ) : (
                        <div className="w-40 h-40 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 flex flex-col items-center justify-center text-gray-400 gap-2 group-hover:bg-orange-50 group-hover:border-orange-200 transition-all">
                          <Plus size={24} />
                          <span className="text-xs font-medium">Aucune image</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 w-full">
                      <div className="relative">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                          id="image-upload"
                          disabled={generatingDescription}
                        />
                        <label
                          htmlFor="image-upload"
                          className={`flex flex-col items-center justify-center w-full p-6 border-2 border-dashed border-gray-200 rounded-2xl cursor-pointer hover:bg-gray-50 hover:border-orange-400 transition-all ${generatingDescription ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <span className="text-sm font-bold text-orange-600 mb-1">
                            {generatingDescription ? 'Traitement en cours...' : 'Cliquez pour téléverser la photo'}
                          </span>
                          <span className="text-xs text-gray-400">PNG, JPG ou WebP (Max. 5 Mo)</span>
                          <span className="text-xs text-orange-500 mt-2 flex items-center gap-1">
                            <Sparkles size={10} />
                            Description générée automatiquement
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-6 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingItem(null);
                    setImagePreview(null);
                    setFormData({
                      name: '',
                      description: '',
                      price: 0,
                      cost_price: 0,
                      category: 'burger',
                      image: '',
                      featured: false,
                    });
                  }}
                  className="flex-1 px-6 py-3 border border-gray-200 rounded-xl text-gray-600 font-bold hover:bg-gray-50 transition-all"
                  disabled={submitting || generatingDescription}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-[2] px-6 py-3 rounded-xl text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-orange-500/30 hover:shadow-orange-500/40 hover:-translate-y-0.5 transition-all"
                  style={{ backgroundColor: '#FF8C00' }}
                  disabled={submitting || generatingDescription}
                >
                  {submitting ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      Enregistrement en cours...
                    </>
                  ) : (
                    <>
                      <Save size={20} />
                      {editingItem ? 'Mettre à jour le produit' : 'Créer le produit'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 backdrop-blur-md bg-white/30 flex items-center justify-center z-[60] p-4 transition-all">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 border border-red-50 text-center">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Trash2 size={40} className="text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">Supprimer le produit ?</h2>
            <p className="text-gray-500 mb-8 leading-relaxed">
              Êtes-vous sûr de vouloir supprimer cet article ? Cette action supprimera définitivement le produit de votre menu.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-6 py-4 bg-gray-100 rounded-2xl text-gray-600 font-bold hover:bg-gray-200 transition-all"
              >
                Annuler
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 px-6 py-4 bg-red-500 rounded-2xl text-white font-bold hover:bg-red-600 shadow-lg shadow-red-500/30 transition-all"
              >
                Oui, supprimer
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}