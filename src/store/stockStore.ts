import { create } from "zustand";
import type { StockItem } from "@/api/stockApi";

interface StockState {
  // 목록에서 상세로 넘어갈 때 기본 정보 유지  
  selectedStock: StockItem | null;
  setSelectedStock: (stock: StockItem) => void;
  clearSelectedStock: () => void;
}

export const useStockStore = create<StockState>((set) => ({
  selectedStock: null,
  setSelectedStock: (stock) => set({ selectedStock: stock }),
  clearSelectedStock: () => set({ selectedStock: null }),
}));
