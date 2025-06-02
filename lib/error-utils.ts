// Error handling utilities

export const formatPrice = (price: number | undefined): string => {
  if (typeof price !== 'number') return '0';
  try {
    return price.toLocaleString('en-IN');
  } catch (error) {
    console.error('Error formatting price:', error);
    return price.toString();
  }
}

export const safeNumber = (value: number | string | undefined | null, defaultValue: number): number => {
  if (typeof value === "number" && !isNaN(value)) {
    return value
  }
  if (typeof value === "string") {
    const parsed = parseFloat(value)
    return isNaN(parsed) ? defaultValue : parsed
  }
  return defaultValue
}

interface SafeLocalStorage {
  getItem: (key: string) => unknown
  setItem: (key: string, value: unknown) => boolean
  removeItem: (key: string) => void
}

export const safeLocalStorage: SafeLocalStorage = {
  getItem: (key: string): unknown => {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : null
    } catch (error) {
      console.error(`Error reading ${key} from localStorage:`, error)
      return null
    }
  },
  setItem: (key: string, value: unknown): boolean => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
      return true
    } catch (error) {
      console.error(`Error saving ${key} to localStorage:`, error)
      return false
    }
  },
  removeItem: (key: string): void => {
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.error(`Error removing ${key} from localStorage:`, error)
    }
  }
}

export const handleApiError = (error: Error | unknown): string => {
  if (error instanceof Error) {
    return error.message
  }
  return "An unexpected error occurred"
}

export const validateProduct = (product: any): boolean => {
  return !!(
    product &&
    typeof product === 'object' &&
    product.id &&
    product.title &&
    typeof product.price === 'number'
  );
};

export const validateProducts = (products: Product[]): Product[] => {
  return products.filter((product): product is Product => {
    return (
      typeof product === "object" &&
      product !== null &&
      typeof product.id === "number" &&
      typeof product.title === "string" &&
      typeof product.price === "number" &&
      !isNaN(product.price)
    )
  })
} 