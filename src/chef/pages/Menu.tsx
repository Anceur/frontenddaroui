import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Utensils, ChefHat, AlertCircle, CheckCircle, Package, Search, Eye, EyeOff, Loader2, RefreshCw, X, ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { getChefMenuItems, type ChefMenuItem } from '../api/chef-api'
import { createMenuItem, getMenuItem, type CreateMenuItemData, type MenuItem } from '../../shared/api/menu-items'
import { getIngredients, createIngredient, type Ingredient, type CreateIngredientData } from '../../shared/api/ingredients'
import { createMenuItemSize, type CreateMenuItemSizeData } from '../../shared/api/menu-item-sizes'
import { createMenuItemSizeIngredient, getMenuItemSizeIngredients, type CreateMenuItemSizeIngredientData } from '../../shared/api/menu-item-size-ingredients'
import { createMenuItemIngredient, getMenuItemIngredients, type CreateMenuItemIngredientData } from '../../shared/api/menu-item-ingredients'

// ============================================
// MAIN MENU COMPONENT
// ============================================

export default function Menu() {
    const navigate = useNavigate()
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedCategory, setSelectedCategory] = useState<string>('all')
    const [menuItems, setMenuItems] = useState<ChefMenuItem[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [refreshing, setRefreshing] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(12)
    
    // Menu item creation state
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [ingredients, setIngredients] = useState<Ingredient[]>([])
    const [menuItemFormData, setMenuItemFormData] = useState<CreateMenuItemData>({
        name: '',
        description: '',
        price: 0,
        cost_price: 0,
        category: 'burger',
        image: '',
        featured: false,
    })
    const [submitting, setSubmitting] = useState(false)
    const [imagePreview, setImagePreview] = useState<string | null>(null)
    const [hasSizes, setHasSizes] = useState(false)
    const [sizes, setSizes] = useState<Array<{ size: 'M' | 'L' | 'Mega', price: number, cost_price: number }>>([])

    // Fetch menu items
    const fetchMenuItems = useCallback(async () => {
        try {
            setError(null);
            const data = await getChefMenuItems();
            setMenuItems(data);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch menu items');
            console.error('Error fetching menu items:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchMenuItems();
    }, [fetchMenuItems]);

    // Get unique categories for filter
    const categories = ['all', ...Array.from(new Set(menuItems.map(item => item.category || 'other')))];

    // Filter menu items
    const filteredItems = menuItems.filter(item => {
        const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                             (item.description || '').toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    })

    // Pagination calculations
    const totalPages = Math.ceil(filteredItems.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const paginatedItems = filteredItems.slice(startIndex, endIndex)

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1)
    }, [searchQuery, selectedCategory])

    // Calculate stats
    const totalItems = menuItems.length
    const availableItems = menuItems.filter(i => i.available !== false).length
    const unavailableItems = totalItems - availableItems

    // Fetch ingredients
    const fetchIngredients = useCallback(async () => {
        try {
            const data = await getIngredients();
            setIngredients(data);
        } catch (err: any) {
            console.error('Error fetching ingredients:', err);
        }
    }, []);

    useEffect(() => {
        fetchIngredients();
    }, [fetchIngredients]);

    // Handle refresh
    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchMenuItems();
    }

    // Handle create menu item
    const handleCreateMenuItem = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);
        
        try {
            // Create the menu item
            const newItem = await createMenuItem(menuItemFormData);
            
            // If sizes are provided, create them
            if (hasSizes && sizes.length > 0) {
                for (const sizeData of sizes) {
                    await createMenuItemSize({
                        menu_item_id: newItem.id,
                        size: sizeData.size,
                        price: sizeData.price,
                        cost_price: sizeData.cost_price || 0
                    });
                }
            }
            
            setIsCreateModalOpen(false);
            setMenuItemFormData({
                name: '',
                description: '',
                price: 0,
                cost_price: 0,
                category: 'burger',
                image: '',
                featured: false,
            });
            setImagePreview(null);
            setHasSizes(false);
            setSizes([]);
            await fetchMenuItems();
        } catch (err: any) {
            setError(err.message || 'Failed to create menu item');
        } finally {
            setSubmitting(false);
        }
    }

    // Handle image change
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setMenuItemFormData({ ...menuItemFormData, image: file });
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    }

    // Navigate to ingredients page
    const handleOpenIngredientsModal = (item: ChefMenuItem) => {
        navigate(`/menu/${item.id}/ingredients`);
    }

    return (
        <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #FFFAF0 0%, #FFFFFF 100%)' }}>
            <div className="max-w-7xl mx-auto px-4 py-6">
                
                {/* Header Section */}
                <div className="mb-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                        <div>
                            <h1 className="text-3xl font-bold mb-1" style={{ color: '#FF8C00' }}>
                                Menu Management
                            </h1>
                            <p className="text-sm" style={{ color: '#999999' }}>
                                View dishes, check ingredients, and manage availability
                            </p>
                        </div>
                        
                        {/* Quick Stats and Add Button */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                            <div className="flex gap-3">
                                <QuickStat label="Total" value={totalItems} color="#FF8C00" />
                                <QuickStat label="Available" value={availableItems} color="#10B981" />
                                <QuickStat label="Unavailable" value={unavailableItems} color="#EF4444" />
                            </div>
                            <button
                                onClick={() => setIsCreateModalOpen(true)}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-white transition-all hover:shadow-lg"
                                style={{ background: '#FF8C00' }}
                            >
                                <Plus size={18} />
                                Add Menu Item
                            </button>
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
                            <AlertCircle size={20} className="text-red-600 flex-shrink-0" />
                            <div className="flex-grow">
                                <p className="text-red-800 font-medium">Error</p>
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

                    {/* Search Bar */}
                    <div className="relative">
                        <Search 
                            size={20} 
                            className="absolute left-4 top-1/2 transform -translate-y-1/2" 
                            style={{ color: '#999999' }}
                        />
                        <input
                            placeholder="Search dishes by name..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-12 py-3 rounded-xl border-2 focus:outline-none transition-all"
                            style={{ 
                                borderColor: searchQuery ? '#FF8C00' : '#FFD700',
                                background: '#FFFFFF'
                            }}
                        />
                        <button
                            onClick={handleRefresh}
                            disabled={refreshing || loading}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 rounded-lg hover:bg-gray-100 transition-all disabled:opacity-50"
                        >
                            <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} style={{ color: '#FF8C00' }} />
                        </button>
                    </div>
                </div>

                {/* Category Filter */}
                <div className="bg-white rounded-xl shadow-md p-4 mb-6 border-2" style={{ borderColor: '#FFD700' }}>
                    <div className="flex items-center gap-3 overflow-x-auto pb-1">
                        <Utensils size={20} style={{ color: '#FF8C00' }} className="flex-shrink-0" />
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className="px-4 py-2 rounded-lg font-semibold text-sm capitalize whitespace-nowrap transition-all"
                                style={{
                                    background: selectedCategory === cat ? '#FF8C00' : '#F9FAFB',
                                    color: selectedCategory === cat ? '#FFFFFF' : '#6B7280',
                                    border: selectedCategory === cat ? 'none' : '1px solid #E5E7EB'
                                }}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Menu Grid */}
                {loading ? (
                    <div className="flex items-center justify-center py-16">
                        <Loader2 size={32} className="animate-spin" style={{ color: '#FF8C00' }} />
                    </div>
                ) : filteredItems.length === 0 ? (
                    <EmptyState searchQuery={searchQuery} />
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                            {paginatedItems.map((item) => (
                                <MenuItem
                                    key={item.id}
                                    item={item}
                                    onManageIngredients={() => handleOpenIngredientsModal(item)}
                                />
                            ))}
                        </div>

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                totalItems={filteredItems.length}
                                itemsPerPage={itemsPerPage}
                                onPageChange={setCurrentPage}
                                onItemsPerPageChange={setItemsPerPage}
                            />
                        )}
                    </>
                )}

                {/* Create Menu Item Modal */}
                {isCreateModalOpen && (
                    <CreateMenuItemModal
                        formData={menuItemFormData}
                        setFormData={setMenuItemFormData}
                        imagePreview={imagePreview}
                        onImageChange={handleImageChange}
                        onSubmit={handleCreateMenuItem}
                        onClose={() => {
                            setIsCreateModalOpen(false);
                            setMenuItemFormData({
                                name: '',
                                description: '',
                                price: 0,
                                cost_price: 0,
                                category: 'burger',
                                image: '',
                                featured: false,
                            });
                            setImagePreview(null);
                            setHasSizes(false);
                            setSizes([]);
                        }}
                        hasSizes={hasSizes}
                        setHasSizes={setHasSizes}
                        sizes={sizes}
                        setSizes={setSizes}
                        submitting={submitting}
                    />
                )}

                {/* Manage Ingredients Modal */}
            </div>
        </div>
    )
}

// ============================================
// QUICK STAT COMPONENT
// ============================================

interface QuickStatProps {
    label: string
    value: number
    color: string
}

function QuickStat({ label, value, color }: QuickStatProps) {
    return (
        <div 
            className="px-4 py-3 rounded-xl border-2 min-w-[100px]"
            style={{ 
                borderColor: '#FFD700',
                background: '#FFFFFF'
            }}
        >
            <p className="text-xs font-medium" style={{ color: '#999999' }}>{label}</p>
            <p className="text-2xl font-bold" style={{ color }}>{value}</p>
        </div>
    )
}

// ============================================
// CATEGORY CARD COMPONENT
// ============================================

interface CategoryCardProps {
    category: { category: string; items: ChefMenuItem[] }
    categoryIndex: number
}

function CategoryCard({ category }: CategoryCardProps) {
    const [isExpanded, setIsExpanded] = useState(true)

    return (
        <div 
            className="bg-white rounded-xl shadow-md border-2 overflow-hidden"
            style={{ borderColor: '#FFD700' }}
        >
            {/* Category Header */}
            <div 
                className="p-4 border-b-2 cursor-pointer"
                style={{ 
                    background: 'linear-gradient(135deg, #FFFAF0, #FFFFFF)',
                    borderColor: '#F3F4F6'
                }}
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div 
                            className="w-10 h-10 rounded-lg flex items-center justify-center"
                            style={{ background: '#FF8C00' }}
                        >
                            <ChefHat size={20} style={{ color: '#FFFFFF' }} />
                        </div>
                        <div>
                            <h2 className="font-bold text-lg capitalize" style={{ color: '#FF8C00' }}>
                                {category.category}
                            </h2>
                            <p className="text-xs" style={{ color: '#999999' }}>
                                {category.items.length} items
                            </p>
                        </div>
                    </div>
                    <div className="text-2xl" style={{ color: '#FF8C00' }}>
                        {isExpanded ? '−' : '+'}
                    </div>
                </div>
            </div>

            {/* Items List */}
            {isExpanded && (
                <div className="p-4 space-y-3">
                    {category.items.map((item) => (
                        <MenuItem
                            key={item.id}
                            item={item}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}

// ============================================
// MENU ITEM COMPONENT
// ============================================

interface MenuItemProps {
    item: ChefMenuItem
    onManageIngredients: () => void
}

function MenuItem({ item, onManageIngredients }: MenuItemProps) {
    const available = item.available !== false

    return (
        <div 
            className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col h-full border-2"
            style={{ 
                borderColor: available ? '#FFD700' : '#EF4444',
            }}
        >
            {/* Product Image */}
            <div className="relative h-48 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                {item.image ? (
                    <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                        onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect fill='%23f3f4f6' width='400' height='300'/%3E%3Ctext fill='%239ca3af' font-family='sans-serif' font-size='20' dy='10.5' font-weight='bold' x='50%25' y='50%25' text-anchor='middle'%3E🍽️%3C/text%3E%3C/svg%3E";
                        }}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                        <div className="text-center">
                            <div className="text-6xl mb-2">🍽️</div>
                            <p className="text-gray-400 text-xs">No Image</p>
                        </div>
                    </div>
                )}
                
                {/* Status Badge - Top Right */}
                <div 
                    className="absolute top-3 right-3 flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-full shadow-lg"
                    style={{
                        background: available ? '#10B981' : '#EF4444',
                        color: '#FFFFFF'
                    }}
                >
                    {available ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                    <span>{available ? 'Available' : 'Out'}</span>
                </div>

                {/* Featured Badge */}
                {item.featured && (
                    <div className="absolute top-3 left-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                        ⭐ Featured
                    </div>
                )}
            </div>

            {/* Product Info */}
            <div className="p-4 flex flex-col flex-grow">
                {/* Name and Category */}
                <div className="mb-2">
                    <h3 className="font-black text-lg mb-1 uppercase tracking-tight" style={{ color: '#333333' }}>
                        {item.name}
                    </h3>
                    <span className="text-xs font-semibold px-2 py-1 rounded-full" style={{ background: '#FFFAF0', color: '#FF8C00' }}>
                        {item.category}
                    </span>
                </div>

                {/* Description */}
                {item.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2 flex-grow">{item.description}</p>
                )}

                {/* Price and Sizes */}
                <div className="mb-3">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-2xl font-black" style={{ color: '#FF8C00' }}>
                            ${Number(item.price).toFixed(2)}
                        </span>
                        {item.sizes && item.sizes.length > 0 && (
                            <span className="text-xs px-2 py-1 rounded-lg font-semibold" style={{ background: '#E5E7EB', color: '#6B7280' }}>
                                {item.sizes.length} size{item.sizes.length > 1 ? 's' : ''}
                            </span>
                        )}
                    </div>
                    
                    {/* Size Options */}
                    {item.sizes && item.sizes.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                            {item.sizes.map((size) => (
                                <span key={size.id} className="text-xs px-2 py-1 rounded-md font-medium" style={{ background: '#F3F4F6', color: '#374151' }}>
                                    {size.size}: {'$'}{Number(size.price).toFixed(2)}
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                {/* Ingredients Section */}
                <div className="mt-auto pt-3 border-t" style={{ borderColor: '#E5E7EB' }}>
                    <button
                        onClick={onManageIngredients}
                        className="flex items-center gap-2 text-xs font-semibold transition-colors hover:opacity-80 w-full text-center justify-center py-2 rounded-lg"
                        style={{ background: '#FFFAF0', color: '#FF8C00', border: '1px solid #FFD700' }}
                    >
                        <Package size={14} />
                        <span>Ingredients{item.ingredients && item.ingredients.length > 0 ? ` (${item.ingredients.length})` : ''}</span>
                    </button>
                </div>
            </div>
        </div>
    )
}

// ============================================
// EMPTY STATE COMPONENT
// ============================================

function EmptyState({ searchQuery }: { searchQuery: string }) {
    return (
        <div className="col-span-full flex flex-col items-center justify-center py-16 px-4">
            <div 
                className="w-24 h-24 rounded-full flex items-center justify-center mb-4"
                style={{ background: 'linear-gradient(135deg, #FFFAF0, #FFD700)' }}
            >
                <Utensils size={48} style={{ color: '#FF8C00' }} />
            </div>
            <h3 className="text-xl font-semibold mb-2" style={{ color: '#333333' }}>
                {searchQuery ? 'No dishes found' : 'No items available'}
            </h3>
            <p className="text-sm" style={{ color: '#999999' }}>
                {searchQuery ? 'Try adjusting your search' : 'Add items to your menu'}
            </p>
        </div>
    )
}

// ============================================
// PAGINATION COMPONENT
// ============================================

interface PaginationProps {
    currentPage: number
    totalPages: number
    totalItems: number
    itemsPerPage: number
    onPageChange: (page: number) => void
    onItemsPerPageChange: (items: number) => void
}

function Pagination({ 
    currentPage, 
    totalPages, 
    totalItems, 
    itemsPerPage, 
    onPageChange, 
    onItemsPerPageChange 
}: PaginationProps) {
    const startItem = (currentPage - 1) * itemsPerPage + 1
    const endItem = Math.min(currentPage * itemsPerPage, totalItems)

    const getPageNumbers = () => {
        const pages: (number | string)[] = []
        const maxVisible = 5

        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i)
            }
        } else {
            if (currentPage <= 3) {
                for (let i = 1; i <= 4; i++) {
                    pages.push(i)
                }
                pages.push('...')
                pages.push(totalPages)
            } else if (currentPage >= totalPages - 2) {
                pages.push(1)
                pages.push('...')
                for (let i = totalPages - 3; i <= totalPages; i++) {
                    pages.push(i)
                }
            } else {
                pages.push(1)
                pages.push('...')
                for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                    pages.push(i)
                }
                pages.push('...')
                pages.push(totalPages)
            }
        }

        return pages
    }

    return (
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white rounded-xl shadow-md p-4 border-2" style={{ borderColor: '#FFD700' }}>
            {/* Items per page selector */}
            <div className="flex items-center gap-2">
                <span className="text-sm" style={{ color: '#6B7280' }}>Items per page:</span>
                <select
                    value={itemsPerPage}
                    onChange={(e) => {
                        onItemsPerPageChange(Number(e.target.value))
                        onPageChange(1)
                    }}
                    className="px-3 py-1.5 rounded-lg border-2 text-sm font-semibold focus:outline-none transition-all"
                    style={{ 
                        borderColor: '#FFD700',
                        color: '#333333',
                        background: '#FFFFFF'
                    }}
                >
                    <option value={6}>6</option>
                    <option value={12}>12</option>
                    <option value={24}>24</option>
                    <option value={48}>48</option>
                </select>
            </div>

            {/* Page info */}
            <div className="text-sm" style={{ color: '#6B7280' }}>
                Showing <span className="font-bold" style={{ color: '#FF8C00' }}>{startItem}</span> to{' '}
                <span className="font-bold" style={{ color: '#FF8C00' }}>{endItem}</span> of{' '}
                <span className="font-bold" style={{ color: '#FF8C00' }}>{totalItems}</span> items
            </div>

            {/* Page navigation */}
            <div className="flex items-center gap-2">
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ 
                        borderColor: currentPage === 1 ? '#E5E7EB' : '#FFD700',
                        color: currentPage === 1 ? '#9CA3AF' : '#FF8C00'
                    }}
                >
                    <ChevronLeft size={20} />
                </button>

                <div className="flex items-center gap-1">
                    {getPageNumbers().map((page, idx) => (
                        page === '...' ? (
                            <span key={`ellipsis-${idx}`} className="px-2 text-sm" style={{ color: '#9CA3AF' }}>
                                ...
                            </span>
                        ) : (
                            <button
                                key={page}
                                onClick={() => onPageChange(page as number)}
                                className="px-3 py-1.5 rounded-lg text-sm font-semibold transition-all min-w-[40px]"
                                style={{
                                    background: currentPage === page ? '#FF8C00' : '#FFFFFF',
                                    color: currentPage === page ? '#FFFFFF' : '#6B7280',
                                    border: currentPage === page ? 'none' : '2px solid #E5E7EB'
                                }}
                            >
                                {page}
                            </button>
                        )
                    ))}
                </div>

                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ 
                        borderColor: currentPage === totalPages ? '#E5E7EB' : '#FFD700',
                        color: currentPage === totalPages ? '#9CA3AF' : '#FF8C00'
                    }}
                >
                    <ChevronRight size={20} />
                </button>
            </div>
        </div>
    )
}

// ============================================
// CREATE MENU ITEM MODAL
// ============================================

interface CreateMenuItemModalProps {
    formData: CreateMenuItemData
    setFormData: (data: CreateMenuItemData) => void
    imagePreview: string | null
    onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    onSubmit: (e: React.FormEvent) => void
    onClose: () => void
    submitting: boolean
    hasSizes: boolean
    setHasSizes: (value: boolean) => void
    sizes: Array<{ size: 'M' | 'L' | 'Mega', price: number, cost_price: number }>
    setSizes: (sizes: Array<{ size: 'M' | 'L' | 'Mega', price: number, cost_price: number }>) => void
}

function CreateMenuItemModal({
    formData,
    setFormData,
    imagePreview,
    onImageChange,
    onSubmit,
    onClose,
    submitting,
    hasSizes,
    setHasSizes,
    sizes,
    setSizes
}: CreateMenuItemModalProps) {
    const categories = ['burger', 'pizza', 'sandwich', 'plat', 'tacos', 'desserts', 'drinks']
    const sizeOptions: Array<'M' | 'L' | 'Mega'> = ['M', 'L', 'Mega']

    const addSize = () => {
        setSizes([...sizes, { size: 'M', price: 0, cost_price: 0 }])
    }

    const removeSize = (index: number) => {
        setSizes(sizes.filter((_, i) => i !== index))
    }

    const updateSize = (index: number, field: 'size' | 'price' | 'cost_price', value: string | number) => {
        const updated = [...sizes]
        updated[index] = { ...updated[index], [field]: value }
        setSizes(updated)
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold" style={{ color: '#FF8C00' }}>
                        Add New Menu Item
                    </h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={onSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold mb-2" style={{ color: '#333333' }}>
                            Name *
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg border-2 focus:outline-none transition-all"
                            style={{ borderColor: '#FFD700' }}
                            placeholder="Enter menu item name"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold mb-2" style={{ color: '#333333' }}>
                            Description
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg border-2 focus:outline-none transition-all"
                            style={{ borderColor: '#FFD700' }}
                            placeholder="Enter description"
                            rows={3}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold mb-2" style={{ color: '#333333' }}>
                                Selling Price *
                            </label>
                            <input
                                type="number"
                                required
                                min="0"
                                step="0.01"
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                                className="w-full px-4 py-2 rounded-lg border-2 focus:outline-none transition-all"
                                style={{ borderColor: '#FFD700' }}
                                placeholder="0.00"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold mb-2" style={{ color: '#333333' }}>
                                Cost Price *
                            </label>
                            <input
                                type="number"
                                required
                                min="0"
                                step="0.01"
                                value={formData.cost_price || 0}
                                onChange={(e) => setFormData({ ...formData, cost_price: parseFloat(e.target.value) || 0 })}
                                className="w-full px-4 py-2 rounded-lg border-2 focus:outline-none transition-all"
                                style={{ borderColor: '#FFD700' }}
                                placeholder="0.00"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold mb-2" style={{ color: '#333333' }}>
                                Category *
                            </label>
                            <select
                                required
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg border-2 focus:outline-none transition-all"
                                style={{ borderColor: '#FFD700' }}
                            >
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold mb-2" style={{ color: '#333333' }}>
                            Image
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={onImageChange}
                            className="w-full px-4 py-2 rounded-lg border-2 focus:outline-none transition-all"
                            style={{ borderColor: '#FFD700' }}
                        />
                        {imagePreview && (
                            <img src={imagePreview} alt="Preview" className="mt-2 w-32 h-32 object-cover rounded-lg" />
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={formData.featured}
                            onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                            className="w-4 h-4"
                            style={{ accentColor: '#FF8C00' }}
                        />
                        <label className="text-sm font-semibold" style={{ color: '#333333' }}>
                            Featured
                        </label>
                    </div>

                    {/* Sizes Section */}
                    <div className="border-t pt-4" style={{ borderColor: '#E5E7EB' }}>
                        <div className="flex items-center gap-2 mb-4">
                            <input
                                type="checkbox"
                                checked={hasSizes}
                                onChange={(e) => {
                                    setHasSizes(e.target.checked)
                                    if (!e.target.checked) {
                                        setSizes([])
                                    } else if (sizes.length === 0) {
                                        setSizes([{ size: 'M', price: formData.price, cost_price: formData.cost_price || 0 }])
                                    }
                                }}
                                className="w-4 h-4"
                                style={{ accentColor: '#FF8C00' }}
                            />
                            <label className="text-sm font-semibold" style={{ color: '#333333' }}>
                                This item has different sizes
                            </label>
                        </div>

                        {hasSizes && (
                            <div className="space-y-3">
                                {sizes.map((size, index) => (
                                    <div key={index} className="flex gap-3 items-center p-3 rounded-lg" style={{ background: '#FFFAF0' }}>
                                        <select
                                            value={size.size}
                                            onChange={(e) => updateSize(index, 'size', e.target.value as 'M' | 'L' | 'Mega')}
                                            className="px-3 py-2 rounded-lg border-2 text-sm font-semibold"
                                            style={{ borderColor: '#FFD700' }}
                                        >
                                            {sizeOptions.map(opt => (
                                                <option key={opt} value={opt}>{opt}</option>
                                            ))}
                                        </select>
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={size.price}
                                            onChange={(e) => updateSize(index, 'price', parseFloat(e.target.value) || 0)}
                                            className="flex-1 px-3 py-2 rounded-lg border-2 text-sm"
                                            style={{ borderColor: '#FFD700' }}
                                            placeholder="Selling Price"
                                        />
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={size.cost_price || 0}
                                            onChange={(e) => updateSize(index, 'cost_price', parseFloat(e.target.value) || 0)}
                                            className="flex-1 px-3 py-2 rounded-lg border-2 text-sm"
                                            style={{ borderColor: '#FFD700' }}
                                            placeholder="Cost Price"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeSize(index)}
                                            className="px-3 py-2 rounded-lg text-white text-sm font-semibold"
                                            style={{ background: '#EF4444' }}
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={addSize}
                                    className="w-full px-4 py-2 rounded-lg font-semibold text-white flex items-center justify-center gap-2"
                                    style={{ background: '#FF8C00' }}
                                >
                                    <Plus size={18} />
                                    Add Size
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 rounded-lg font-semibold transition-all"
                            style={{ background: '#E5E7EB', color: '#6B7280' }}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="flex-1 px-4 py-2 rounded-lg font-semibold text-white transition-all disabled:opacity-50"
                            style={{ background: '#FF8C00' }}
                        >
                            {submitting ? <Loader2 size={20} className="animate-spin mx-auto" /> : 'Create Item'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

// ============================================
// MANAGE INGREDIENTS MODAL - REMOVED
// Now using separate page: MenuItemIngredients.tsx
// ============================================
