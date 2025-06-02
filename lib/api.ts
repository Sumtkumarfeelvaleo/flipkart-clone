import { safeNumber } from './error-utils';

const BASE_URL = "https://dummyjson.com"

export interface Product {
  id: number
  title: string
  description: string
  price: number
  discountPercentage: number
  rating: number
  stock: number
  brand: string
  category: string
  thumbnail: string
  images: string[]
  tags: string[]
  reviews?: Review[]
}

export interface Review {
  rating: number
  comment: string
  date: string
  reviewerName: string
  reviewerEmail: string
}

export interface ProductsResponse {
  products: Product[]
  total: number
  skip: number
  limit: number
}

export interface Category {
  name: string
  slug: string
  image: string
}

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(
      errorData?.message || `API Error: ${response.status} ${response.statusText}`
    );
  }
  return response.json();
};

interface RawProduct {
  id?: number;
  title?: string;
  description?: string;
  price?: number;
  discountPercentage?: number;
  rating?: number;
  stock?: number;
  brand?: string;
  category?: string;
  thumbnail?: string;
  images?: string[];
  tags?: string[];
}

// Cache for product data
const productCache = new Map<number, Promise<Product>>();

// Fetch all products with pagination
export const fetchProducts = async (limit: number = 10, skip: number = 0): Promise<ProductsResponse> => {
  try {
    const response = await fetch(
      `${BASE_URL}/products?limit=${limit}&skip=${skip}`,
      {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      }
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data || !Array.isArray(data.products)) {
      throw new Error('Invalid response format from API');
    }
    
    // Transform the data to ensure all products have required fields
    const transformedProducts = data.products.map((product: RawProduct) => ({
      id: product.id || 0,
      title: product.title || 'Untitled Product',
      description: product.description || '',
      price: product.price || 0,
      discountPercentage: product.discountPercentage || 0,
      rating: product.rating || 4.5,
      stock: product.stock || 100,
      brand: product.brand || 'Generic Brand',
      category: product.category || 'uncategorized',
      thumbnail: product.thumbnail || '/placeholder.jpg',
      images: Array.isArray(product.images) ? product.images : [product.thumbnail || '/placeholder.jpg'],
      tags: Array.isArray(product.tags) ? product.tags : [],
    }));

    return {
      products: transformedProducts,
      total: data.total || transformedProducts.length,
      skip: data.skip || 0,
      limit: data.limit || limit,
    };
  } catch (error) {
    console.error('Error fetching products:', error);
    // Return empty response instead of throwing
    return {
      products: [],
      total: 0,
      skip: 0,
      limit: limit,
    };
  }
}

// Fetch single product by ID
export async function fetchProduct(id: number): Promise<Product> {
  // Check cache first
  if (productCache.has(id)) {
    return productCache.get(id)!;
  }

  // If not in cache, create a new promise and cache it
  const fetchPromise = (async () => {
    try {
      console.log(`Fetching product with ID: ${id}`)
      const response = await fetch(`${BASE_URL}/products/${id}`)

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`Product with ID ${id} not found`)
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log("Product data received:", data)
      return data
    } catch (error) {
      console.error("Error fetching product:", error)
      // Remove failed requests from cache
      productCache.delete(id);
      throw error
    }
  })();

  productCache.set(id, fetchPromise);
  return fetchPromise;
}

// Search products
export async function searchProducts(query: string, limit = 30): Promise<ProductsResponse> {
  const response = await fetch(`${BASE_URL}/products/search?q=${encodeURIComponent(query)}&limit=${limit}`)
  if (!response.ok) throw new Error("Failed to search products")
  return response.json()
}

// Fetch all categories
export const fetchCategories = async (): Promise<Category[]> => {
  try {
    const response = await fetch(`${BASE_URL}/products/categories`);
    const categories = await handleResponse(response);
    
    return categories.map((category: string) => ({
      name: formatCategoryName(category),
      slug: typeof category === 'string' ? category : String(category),
      image: `/categories/placeholder.svg`,
    }));
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
}

// Fetch products by category
export const fetchProductsByCategory = async (category: string, limit: number = 10): Promise<ProductsResponse> => {
  try {
    const response = await fetch(
      `${BASE_URL}/products/category/${category}?limit=${limit}`
    );
    const data = await handleResponse(response);
    return {
      products: data.products || [],
      total: data.total || 0,
      skip: data.skip || 0,
      limit: data.limit || 0,
    };
  } catch (error) {
    console.error(`Error fetching products for category ${category}:`, error);
    throw error;
  }
}

// Get featured/flash sale products (using high discount percentage)
export async function fetchFlashSaleProducts(): Promise<Product[]> {
  const response = await fetchProducts(100, 0)
  return response.products
    .filter((product) => product.discountPercentage > 15)
    .sort((a, b) => b.discountPercentage - a.discountPercentage)
    .slice(0, 6)
}

// Get recommended products (using high ratings)
export async function fetchRecommendedProducts(): Promise<Product[]> {
  const response = await fetchProducts(100, 0)
  return response.products
    .filter((product) => product.rating > 4.5)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 8)
}

// Calculate discounted price with proper rounding
export const getDiscountedPrice = (price: number, discountPercentage: number): number => {
  try {
    const safePrice = safeNumber(price, 0);
    const safeDiscount = safeNumber(discountPercentage, 0);
    
    if (safePrice <= 0) return 0;
    if (safeDiscount <= 0) return safePrice;
    
    const discountAmount = (safePrice * safeDiscount) / 100;
    const discountedPrice = safePrice - discountAmount;
    
    // Ensure the price is not negative and round to 2 decimal places
    return Math.max(0, Math.round(discountedPrice * 100) / 100);
  } catch (error) {
    console.error('Error calculating discounted price:', error);
    return price;
  }
}

// Convert USD to INR (approximate conversion)
export function convertToINR(usdPrice: number): number {
  // Using a more realistic conversion rate
  return Math.round(usdPrice * 83) // 1 USD ≈ 83 INR
}

// Format price in Indian Rupees with proper formatting
export function formatPrice(usdPrice: number): string {
  const inrPrice = convertToINR(usdPrice)
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(inrPrice)
}

// Format category name for display
export const formatCategoryName = (category: unknown): string => {
  try {
    if (typeof category !== 'string') {
      console.warn('Invalid category type received:', typeof category);
      return 'Unknown Category';
    }
    
    if (!category.trim()) {
      return 'Unknown Category';
    }

    return category
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  } catch (error) {
    console.error('Error formatting category name:', error);
    return 'Unknown Category';
  }
}
