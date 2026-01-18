
import { db } from '../firebase';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  onSnapshot,
  query,
  orderBy
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { Product, Order, OrderStatus } from '../types';

const PRODUCTS_COLLECTION = 'products';
const ORDERS_COLLECTION = 'orders';

// منتجات
export const listenToProducts = (callback: (products: Product[]) => void, onError?: (err: any) => void) => {
  if (!db) return () => {};
  const q = query(collection(db, PRODUCTS_COLLECTION));
  return onSnapshot(q, 
    (snapshot) => {
      const products = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Product[];
      callback(products);
    },
    (error) => {
      console.error("Firestore Products Error:", error);
      if (onError) onError(error);
    }
  );
};

export const addProductDB = async (product: Omit<Product, 'id'>) => {
  return await addDoc(collection(db, PRODUCTS_COLLECTION), product);
};

export const updateProductDB = async (id: string, product: Partial<Product>) => {
  const docRef = doc(db, PRODUCTS_COLLECTION, id);
  return await updateDoc(docRef, product);
};

export const deleteProductDB = async (id: string) => {
  return await deleteDoc(doc(db, PRODUCTS_COLLECTION, id));
};

// طلبات
export const listenToOrders = (callback: (orders: Order[]) => void, onError?: (err: any) => void) => {
  if (!db) return () => {};
  const q = query(collection(db, ORDERS_COLLECTION), orderBy('timestamp', 'desc'));
  return onSnapshot(q, 
    (snapshot) => {
      const orders = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Order[];
      callback(orders);
    },
    (error) => {
      console.error("Firestore Orders Error:", error);
      if (onError) onError(error);
    }
  );
};

export const addOrderDB = async (order: Omit<Order, 'id'>) => {
  return await addDoc(collection(db, ORDERS_COLLECTION), {
    ...order,
    timestamp: new Date()
  });
};

export const updateOrderStatusDB = async (id: string, status: OrderStatus) => {
  const docRef = doc(db, ORDERS_COLLECTION, id);
  return await updateDoc(docRef, { status });
};

export const deleteOrderDB = async (id: string) => {
  return await deleteDoc(doc(db, ORDERS_COLLECTION, id));
};
