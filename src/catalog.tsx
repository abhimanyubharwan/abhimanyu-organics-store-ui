import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  mrp?: number;
  image: string;
  subtitle: string;
  badge?: string;
}

export const products: Product[] = [
  {id:'wild-forest',name:'Wild Forest Honey',category:'Honey',price:235,mrp:299,image:'assets/images/rosewood.jpg',subtitle:'Deep, earthy & aromatic',badge:'Bestseller'},
  {id:'jamun',name:'Jamun Honey',category:'Honey',price:240,mrp:299,image:'assets/images/jamun.jpg',subtitle:'Bold floral character'},
  {id:'litchi',name:'Litchi Honey',category:'Honey',price:245,mrp:299,image:'assets/images/beri.jpg',subtitle:'Sweet & aromatic'},
  {id:'mustard',name:'Mustard Honey',category:'Honey',price:215,mrp:275,image:'assets/images/kashmiri.jpg',subtitle:'Rich & floral'},
  {id:'acacia',name:'Kashmiri Acacia',category:'Honey',price:345,mrp:429,image:'assets/images/kashmiri.jpg',subtitle:'Light & delicate',badge:'Premium'},
  {id:'multiflora',name:'Multiflora Honey',category:'Honey',price:235,image:'assets/images/beri.jpg',subtitle:'Everyday floral blend'},
  {id:'eucalyptus',name:'Eucalyptus Honey',category:'Honey',price:220,image:'assets/images/rosewood.jpg',subtitle:'Robust & herbal'},
  {id:'tulsi',name:'Tulsi Honey',category:'Honey',price:240,image:'assets/images/jamun.jpg',subtitle:'Herbal floral notes'},
  {id:'sunflower',name:'Sunflower Honey',category:'Honey',price:220,image:'assets/images/beri.jpg',subtitle:'Mild & smooth'},
  {id:'neem',name:'Neem Honey',category:'Honey',price:235,image:'assets/images/rosewood.jpg',subtitle:'Distinctive & bold'},
  {id:'ajwain',name:'Ajwain Honey',category:'Honey',price:240,image:'assets/images/jamun.jpg',subtitle:'Warm aromatic profile'},
  {id:'ghee',name:'Desi Bilona Ghee',category:'Ghee & Oils',price:650,image:'assets/images/range-reference.jpg',subtitle:'Traditional & pure'},
  {id:'coconut-oil',name:'Cold Pressed Coconut Oil',category:'Ghee & Oils',price:420,image:'assets/images/range-reference.jpg',subtitle:'Cold pressed'},
  {id:'mustard-oil',name:'Cold Pressed Mustard Oil',category:'Ghee & Oils',price:380,image:'assets/images/range-reference.jpg',subtitle:'Kachi ghani style'},
  {id:'bee-pollen',name:'Bee Pollen',category:'Bee Products',price:520,image:'assets/images/dry-fruit.jpg',subtitle:'Nature’s superfood'},
  {id:'gulkand',name:'Honey Gulkand',category:'Speciality',price:320,image:'assets/images/jamun.jpg',subtitle:'Rose petal wellness blend'},
  {id:'ber',name:'Seasonal Ber',category:'Seasonal Fruits',price:180,image:'assets/images/range-reference.jpg',subtitle:'Fresh from farms'},
  {id:'guava',name:'Seasonal Guava',category:'Seasonal Fruits',price:160,image:'assets/images/range-reference.jpg',subtitle:'Naturally sweet'},
];

interface CatalogValue {
  products: Product[];
  cart: Product[];
  wishlist: string[];
  add: (product: Product) => void;
  toggleWish: (id: string) => void;
}

const CatalogContext = createContext<CatalogValue | null>(null);

export function CatalogProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Product[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);

  const add = useCallback((product: Product) => {
    setCart((current) => [...current, product]);
  }, []);

  const toggleWish = useCallback((id: string) => {
    setWishlist((current) =>
      current.includes(id)
        ? current.filter((x) => x !== id)
        : [...current, id],
    );
  }, []);

  const value = useMemo<CatalogValue>(
    () => ({ products, cart, wishlist, add, toggleWish }),
    [cart, wishlist, add, toggleWish],
  );

  return (
    <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>
  );
}

export function useCatalog(): CatalogValue {
  const value = useContext(CatalogContext);
  if (!value) throw new Error("useCatalog must be used inside CatalogProvider");
  return value;
}
