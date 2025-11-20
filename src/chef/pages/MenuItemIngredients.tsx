import React, { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, X, Loader2, Package, ChefHat, AlertCircle } from 'lucide-react'
import { getChefMenuItems, type ChefMenuItem } from '../api/chef-api'
import { getIngredients, type Ingredient } from '../../shared/api/ingredients'
import { 
    createMenuItemIngredient, 
    getMenuItemIngredients, 
    deleteMenuItemIngredient,
    type CreateMenuItemIngredientData 
} from '../../shared/api/menu-item-ingredients'
import {
    createMenuItemSizeIngredient,
    getMenuItemSizeIngredients,
    deleteMenuItemSizeIngredient,
    type CreateMenuItemSizeIngredientData
} from '../../shared/api/menu-item-size-ingredients'

export default function MenuItemIngredients() {
    const { menuItemId } = useParams<{ menuItemId: string }>()
    const navigate = useNavigate()
    const [menuItem, setMenuItem] = useState<ChefMenuItem | null>(null)
    const [ingredients, setIngredients] = useState<Ingredient[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    
    // For items with sizes
    const [selectedSize, setSelectedSize] = useState<number | null>(null)
    const [sizeIngredients, setSizeIngredients] = useState<any[]>([])
    
    // For items without sizes
    const [itemIngredients, setItemIngredients] = useState<any[]>([])
    
    // Add ingredient form
    const [isAddingIngredient, setIsAddingIngredient] = useState(false)
    const [newIngredient, setNewIngredient] = useState({ ingredient_id: 0, quantity: 0 })
    
    // hasSizes is calculated dynamically in functions to ensure accuracy

    // Fetch menu item details
    const fetchMenuItem = useCallback(async () => {
        if (!menuItemId) return
        
        try {
            setLoading(true)
            setError(null)
            const menuItems = await getChefMenuItems()
            const item = menuItems.find(m => m.id === Number(menuItemId))
            if (!item) {
                setError('Menu item not found')
                return
            }
            setMenuItem(item)
            
            // Auto-select first size if item has sizes
            if (item.sizes && item.sizes.length > 0) {
                setSelectedSize(item.sizes[0].id)
            }
        } catch (err: any) {
            setError(err.message || 'Failed to fetch menu item')
            console.error('Error fetching menu item:', err)
        } finally {
            setLoading(false)
        }
    }, [menuItemId])

    // Fetch all available ingredients
    const fetchIngredients = useCallback(async () => {
        try {
            const data = await getIngredients()
            setIngredients(data)
        } catch (err: any) {
            console.error('Error fetching ingredients:', err)
        }
    }, [])

    // Fetch ingredients for the menu item or size
    const fetchItemIngredients = useCallback(async () => {
        if (!menuItem) return
        
        try {
            const itemHasSizes = menuItem.sizes && menuItem.sizes.length > 0
            
            if (itemHasSizes && selectedSize) {
                const data = await getMenuItemSizeIngredients(selectedSize)
                setSizeIngredients(data)
            } else {
                const data = await getMenuItemIngredients(menuItem.id)
                setItemIngredients(data)
            }
        } catch (err: any) {
            console.error('Error fetching item ingredients:', err)
        }
    }, [menuItem, selectedSize])

    useEffect(() => {
        fetchMenuItem()
        fetchIngredients()
    }, [fetchMenuItem, fetchIngredients])

    useEffect(() => {
        if (menuItem) {
            fetchItemIngredients()
        }
    }, [menuItem, fetchItemIngredients])

    const handleAddIngredient = async () => {
        if (!menuItem) return
        
        if (!newIngredient.ingredient_id || newIngredient.ingredient_id === 0) {
            alert('Please select an ingredient')
            return
        }
        
        if (!newIngredient.quantity || newIngredient.quantity <= 0) {
            alert('Please enter a quantity greater than 0')
            return
        }

        setIsAddingIngredient(true)
        try {
            // Check if item has sizes and a size is selected
            const itemHasSizes = menuItem.sizes && menuItem.sizes.length > 0
            
            if (itemHasSizes && selectedSize) {
                const result = await createMenuItemSizeIngredient({
                    size_id: selectedSize,
                    ingredient_id: newIngredient.ingredient_id,
                    quantity: newIngredient.quantity
                })
                await fetchItemIngredients()
            } else {
                const result = await createMenuItemIngredient({
                    menu_item_id: menuItem.id,
                    ingredient_id: newIngredient.ingredient_id,
                    quantity: newIngredient.quantity
                })
                await fetchItemIngredients()
            }
            setNewIngredient({ ingredient_id: 0, quantity: 0 })
        } catch (err: any) {
            console.error('Error adding ingredient:', err)
            console.error('Error response:', err.response?.data)
            console.error('Error message:', err.message)
            alert(err.message || 'Failed to add ingredient. Check console for details.')
        } finally {
            setIsAddingIngredient(false)
        }
    }

    const handleDeleteIngredient = async (ingredientId: number) => {
        if (!confirm('Are you sure you want to remove this ingredient?')) return
        if (!menuItem) return
        
        try {
            const itemHasSizes = menuItem.sizes && menuItem.sizes.length > 0
            if (itemHasSizes && selectedSize) {
                await deleteMenuItemSizeIngredient(ingredientId)
            } else {
                await deleteMenuItemIngredient(ingredientId)
            }
            await fetchItemIngredients()
        } catch (err: any) {
            console.error('Error deleting ingredient:', err)
            alert(err.message || 'Failed to delete ingredient')
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Loader2 size={48} className="animate-spin mx-auto mb-4" style={{ color: '#FF8C00' }} />
                    <p className="text-gray-600">Loading menu item...</p>
                </div>
            </div>
        )
    }

    if (error || !menuItem) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle size={48} className="mx-auto mb-4" style={{ color: '#EF4444' }} />
                    <p className="text-gray-600 mb-4">{error || 'Menu item not found'}</p>
                    <button
                        onClick={() => navigate('/menu')}
                        className="px-6 py-2 rounded-lg font-semibold text-white"
                        style={{ background: '#FF8C00' }}
                    >
                        Back to Menu
                    </button>
                </div>
            </div>
        )
    }

    // Determine which ingredients list to show
    const itemHasSizes = menuItem?.sizes && menuItem.sizes.length > 0
    const currentIngredients = (itemHasSizes && selectedSize) ? sizeIngredients : itemIngredients

    return (
        <div className="min-h-screen" style={{ background: '#F9FAFB' }}>
            <div className="max-w-6xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-6">
                    <button
                        onClick={() => navigate('/menu')}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
                    >
                        <ArrowLeft size={20} />
                        <span className="font-medium">Back to Menu</span>
                    </button>
                    
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <div className="flex items-start gap-6">
                            {menuItem.image && (
                                <img
                                    src={menuItem.image}
                                    alt={menuItem.name}
                                    className="w-32 h-32 object-cover rounded-lg"
                                />
                            )}
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <h1 className="text-3xl font-bold" style={{ color: '#1F2937' }}>
                                        {menuItem.name}
                                    </h1>
                                    {menuItem.featured && (
                                        <span className="px-3 py-1 rounded-full text-xs font-semibold"
                                            style={{ background: '#FFD700', color: '#92400E' }}>
                                            Featured
                                        </span>
                                    )}
                                </div>
                                <p className="text-gray-600 mb-3">{menuItem.description}</p>
                                <div className="flex items-center gap-4">
                                    <span className="text-2xl font-bold" style={{ color: '#FF8C00' }}>
                                        ${Number(menuItem.price).toFixed(2)}
                                    </span>
                                    <span className="px-3 py-1 rounded-lg text-sm font-medium"
                                        style={{ background: '#E5E7EB', color: '#6B7280' }}>
                                        {menuItem.category}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Size Selection (if item has sizes) */}
                {menuItem.sizes && menuItem.sizes.length > 1 && (
                    <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                        <h2 className="text-lg font-semibold mb-4" style={{ color: '#1F2937' }}>
                            Select Size
                        </h2>
                        <div className="flex gap-3 flex-wrap">
                            {menuItem.sizes.map(size => (
                                <button
                                    key={size.id}
                                    onClick={() => setSelectedSize(size.id)}
                                    className="px-6 py-3 rounded-lg font-semibold transition-all"
                                    style={{
                                        background: selectedSize === size.id ? '#FF8C00' : '#F3F4F6',
                                        color: selectedSize === size.id ? '#FFFFFF' : '#6B7280'
                                    }}
                                >
                                    {size.size} - ${Number(size.price).toFixed(2)}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Add Ingredient Form */}
                <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                    <h2 className="text-lg font-semibold mb-4" style={{ color: '#1F2937' }}>
                        Add Ingredient
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium mb-2" style={{ color: '#6B7280' }}>
                                Ingredient
                            </label>
                            <select
                                value={newIngredient.ingredient_id}
                                onChange={(e) => setNewIngredient({ ...newIngredient, ingredient_id: Number(e.target.value) })}
                                className="w-full px-4 py-3 rounded-lg border-2"
                                style={{ borderColor: '#FFD700' }}
                            >
                                <option value={0}>Select ingredient</option>
                                {ingredients.map(ing => (
                                    <option key={ing.id} value={ing.id}>
                                        {ing.name} ({ing.unit})
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2" style={{ color: '#6B7280' }}>
                                Quantity
                            </label>
                            <input
                                type="number"
                                min="0.01"
                                step="0.01"
                                value={newIngredient.quantity || ''}
                                onChange={(e) => {
                                    const val = parseFloat(e.target.value)
                                    setNewIngredient({ ...newIngredient, quantity: isNaN(val) ? 0 : val })
                                }}
                                className="w-full px-4 py-3 rounded-lg border-2"
                                style={{ borderColor: '#FFD700' }}
                                placeholder="0.00"
                            />
                        </div>
                    </div>
                    <button
                        onClick={handleAddIngredient}
                        disabled={isAddingIngredient || !newIngredient.ingredient_id || newIngredient.quantity <= 0}
                        className="mt-4 px-6 py-3 rounded-lg font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        style={{ background: '#FF8C00' }}
                    >
                        {isAddingIngredient ? (
                            <>
                                <Loader2 size={20} className="animate-spin" />
                                Adding...
                            </>
                        ) : (
                            <>
                                <Plus size={20} />
                                Add Ingredient
                            </>
                        )}
                    </button>
                </div>

                {/* Current Ingredients */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <h2 className="text-lg font-semibold mb-4" style={{ color: '#1F2937' }}>
                        Current Ingredients
                        {(menuItem.sizes && menuItem.sizes.length > 0 && selectedSize) && (
                            <span className="text-sm font-normal text-gray-500 ml-2">
                                ({menuItem.sizes.find(s => s.id === selectedSize)?.size})
                            </span>
                        )}
                    </h2>
                    
                    {currentIngredients.length === 0 ? (
                        <div className="text-center py-12">
                            <Package size={48} className="mx-auto mb-4 text-gray-400" />
                            <p className="text-gray-500">No ingredients added yet</p>
                            <p className="text-sm text-gray-400 mt-2">Add ingredients using the form above</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {currentIngredients.map((ing) => (
                                <div
                                    key={ing.id}
                                    className="flex items-center justify-between p-4 rounded-lg border-2"
                                    style={{ 
                                        background: '#FFFAF0', 
                                        borderColor: '#FFD700' 
                                    }}
                                >
                                    <div>
                                        <p className="font-semibold" style={{ color: '#FF8C00' }}>
                                            {ing.ingredient.name}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            {ing.quantity}{ing.ingredient.unit}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => handleDeleteIngredient(ing.id)}
                                        className="p-2 rounded-lg hover:bg-red-100 transition-colors"
                                        style={{ color: '#EF4444' }}
                                        title="Remove ingredient"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

