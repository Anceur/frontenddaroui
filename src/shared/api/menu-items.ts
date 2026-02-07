import axios from 'axios';
import { API } from './API';

axios.defaults.withCredentials = true;

export type MenuItem = {
  id: number;
  name: string;
  description?: string;
  price: number;
  cost_price?: number;
  category: string;
  image?: string | null;
  featured?: boolean;
  sizes?: Array<{
    id: number;
    size: string;
    price: number;
    cost_price?: number;
  }>;
};

export type PromotionItem = {
  id: number;
  menu_item: number;
  menu_item_size?: number | null;
  menu_item_name: string;
  size_label?: string;
  quantity: number;
};

export type Promotion = {
  id: number;
  name: string;
  description: string;
  promotion_type: 'percentage' | 'fixed_amount' | 'combo_fixed_price';
  value: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
  status: string;
  display_status: string;
  applicable_items: number[];
  applicable_sizes: number[];
  combo_items: PromotionItem[];
};

export type CreateMenuItemData = {
  name: string;
  description?: string;
  price: number;
  cost_price?: number;
  category: string;
  image?: File | string | null;
  featured?: boolean;
};

export type UpdateMenuItemData = {
  name?: string;
  description?: string;
  price?: number;
  cost_price?: number;
  category?: string;
  image?: File | string | null;
  featured?: boolean;
};

// Get all menu items
export async function getMenuItems(): Promise<MenuItem[]> {
  try {
    const response = await axios.get<MenuItem[]>(`${API}/menu-items/`, { withCredentials: true });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching menu items:', error);
    if (error.response) {
      throw new Error(error.response.data?.error || error.response.data?.detail || 'Failed to fetch menu items');
    }
    throw new Error('Network error: Failed to fetch menu items');
  }
}

// Get a single menu item by ID
export async function getMenuItem(itemId: number): Promise<MenuItem> {
  try {
    const response = await axios.get<MenuItem>(`${API}/menu-items/${itemId}/`, { withCredentials: true });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching menu item:', error);
    if (error.response) {
      if (error.response.status === 404) {
        throw new Error('Menu item not found');
      }
      throw new Error(error.response.data?.error || error.response.data?.detail || 'Failed to fetch menu item');
    }
    throw new Error('Network error: Failed to fetch menu item');
  }
}

// Create a new menu item
export async function createMenuItem(itemData: CreateMenuItemData): Promise<MenuItem> {
  try {
    const formData = new FormData();
    formData.append('name', itemData.name);
    if (itemData.description) formData.append('description', itemData.description);
    formData.append('price', itemData.price.toString());
    if (itemData.cost_price !== undefined) {
      formData.append('cost_price', itemData.cost_price.toString());
    }
    formData.append('category', itemData.category);
    
    if (itemData.image) {
      formData.append('image', itemData.image);
      console.log('🖼️ إرسال رابط الصورة:', itemData.image);
    }
    
    if (itemData.featured !== undefined) {
      formData.append('featured', itemData.featured.toString());
    }

    console.log('📤 إرسال إلى:', `${API}/menu-items/`);
    
    // طباعة محتويات FormData
    console.log('📋 محتويات FormData:');
    for (let [key, value] of formData.entries()) {
      console.log(`  ${key}: ${value}`);
    }

    console.log('⏳ انتظار الاستجابة...');

    const response = await axios.post<MenuItem>(`${API}/menu-items/`, formData, {
      withCredentials: true,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    console.log('🎉 نجح الطلب!');
    console.log('✅ استجابة الخادم:', response.data);
    console.log('🖼️ الصورة المحفوظة في قاعدة البيانات:', response.data.image);
    console.log('🆔 معرف المنتج:', response.data.id);
    
    return response.data;
    
  } catch (error: any) {
    console.error('❌❌❌ حدث خطأ! ❌❌❌');
    console.error('نوع الخطأ:', error.message);
    
    if (error.response) {
      // الخادم رد بخطأ
      console.error('📛 Status Code:', error.response.status);
      console.error('📛 استجابة الخادم:', error.response.data);
      console.error('📛 Headers:', error.response.headers);
      
      const errorMessage = error.response.data?.error 
        || error.response.data?.detail 
        || error.response.data?.message
        || 'فشل إنشاء المنتج';
      
      const details = error.response.data?.details;
      if (details) {
        console.error('📋 تفاصيل الخطأ:', details);
        throw new Error(`${errorMessage}: ${JSON.stringify(details)}`);
      }
      
      throw new Error(errorMessage);
    } else if (error.request) {
      // الطلب تم إرساله لكن لا توجد استجابة
      console.error('📛 لا توجد استجابة من الخادم');
      console.error('📛 Request:', error.request);
      throw new Error('لا يمكن الوصول إلى الخادم. تحقق من الاتصال بالإنترنت.');
    } else {
      // خطأ في إعداد الطلب
      console.error('📛 خطأ في إعداد الطلب:', error.message);
      throw new Error('خطأ في إرسال البيانات');
    }
  }
  }

// Update a menu item (full update)
export async function updateMenuItem(itemId: number, itemData: UpdateMenuItemData): Promise<MenuItem> {
  try {
    const formData = new FormData();
    if (itemData.name) formData.append('name', itemData.name);
    if (itemData.description !== undefined) formData.append('description', itemData.description);
    if (itemData.price !== undefined) formData.append('price', itemData.price.toString());
    if (itemData.cost_price !== undefined) formData.append('cost_price', itemData.cost_price.toString());
    if (itemData.category) formData.append('category', itemData.category);
    if (itemData.image && itemData.image instanceof File) {
      formData.append('image', itemData.image);
    }
    if (itemData.featured !== undefined) {
      formData.append('featured', itemData.featured.toString());
    }

    const response = await axios.put<MenuItem>(`${API}/menu-items/${itemId}/`, formData, {
      withCredentials: true,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error: any) {
    console.error('Error updating menu item:', error);
    if (error.response) {
      if (error.response.status === 404) {
        throw new Error('Menu item not found');
      }
      const errorMessage = error.response.data?.error || 'Failed to update menu item';
      const details = error.response.data?.details;
      if (details) {
        throw new Error(`${errorMessage}: ${JSON.stringify(details)}`);
      }
      throw new Error(errorMessage);
    }
    throw new Error('Network error: Failed to update menu item');
  }
}

// Partially update a menu item
export async function patchMenuItem(itemId: number, itemData: UpdateMenuItemData): Promise<MenuItem> {
  try {
    console.log('🔧 PATCH MenuItem - ID:', itemId);
    console.log('🔧 البيانات:', itemData);
    
    const formData = new FormData();
    if (itemData.name) formData.append('name', itemData.name);
    if (itemData.description !== undefined) formData.append('description', itemData.description);
    if (itemData.price !== undefined) formData.append('price', itemData.price.toString());
    if (itemData.cost_price !== undefined) formData.append('cost_price', itemData.cost_price.toString());
    if (itemData.category) formData.append('category', itemData.category);
    
    if (itemData.image) {
      formData.append('image', itemData.image);
      console.log('🖼️ PATCH - إرسال رابط الصورة:', itemData.image);
    } else if (itemData.image === null) {
      formData.append('image', '');
    }
    
    if (itemData.featured !== undefined) {
      formData.append('featured', itemData.featured.toString());
    }

    console.log('📤 PATCH إرسال إلى:', `${API}/menu-items/${itemId}/`);
    console.log('⏳ انتظار الاستجابة...');

    const response = await axios.patch<MenuItem>(`${API}/menu-items/${itemId}/`, formData, {
      withCredentials: true,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    console.log('✅ PATCH نجح!');
    console.log('✅ النتيجة:', response.data);
    return response.data;
    
  } catch (error: any) {
    console.error('❌ خطأ في PATCH:', error);
    if (error.response) {
      console.error('📛 Status:', error.response.status);
      console.error('📛 الاستجابة:', error.response.data);
      
      if (error.response.status === 404) {
        throw new Error('المنتج غير موجود');
      }
      const errorMessage = error.response.data?.error || 'فشل تحديث المنتج';
      const details = error.response.data?.details;
      if (details) {
        throw new Error(`${errorMessage}: ${JSON.stringify(details)}`);
      }
      throw new Error(errorMessage);
    }
    throw new Error('خطأ في الشبكة: فشل تحديث المنتج');
  }
}
// Delete a menu item
export async function deleteMenuItem(itemId: number): Promise<void> {
  try {
    await axios.delete(`${API}/menu-items/${itemId}/`, { withCredentials: true });
  } catch (error: any) {
    console.error('Error deleting menu item:', error);
    if (error.response) {
      if (error.response.status === 404) {
        throw new Error('Menu item not found');
      }
      throw new Error(error.response.data?.error || error.response.data?.detail || 'Failed to delete menu item');
    }
    throw new Error('Network error: Failed to delete menu item');
  }
}

// Get live promotions
export async function getPublicPromotions(): Promise<Promotion[]> {
  try {
    const response = await axios.get<Promotion[]>(`${API}/promotions/public/`, { withCredentials: true });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching promotions:', error);
    if (error.response) {
      throw new Error(error.response.data?.error || error.response.data?.detail || 'Failed to fetch promotions');
    }
    throw new Error('Network error: Failed to fetch promotions');
  }
}

