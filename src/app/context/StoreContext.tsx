import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import localConfig from '../../data/storeConfig.json';

interface StoreContextType {
  config: any;
  isLoading: boolean;
  refreshConfig: () => Promise<void>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<any>(localConfig);
  const [isLoading, setIsLoading] = useState(true);

  const fetchConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('store_config')
        .select('config_data')
        .eq('id', 'main')
        .single();
      
      if (data && data.config_data) {
        setConfig({
           ...localConfig,
           ...data.config_data,
           // Kunci ke list yang sesuai dengan Admin Dashboard secara permanen
           productCategories: [
             { id: 'all', name: 'SEMUA KATEGORI' },
             { id: 'new', name: 'NEW DROP' },
             { id: 'football', name: 'FOOTBALL CULTURE' },
             { id: 'regional', name: 'REGIONAL SERIES' },
             { id: 'sale', name: 'PENAWARAN SPESIAL' },
             { id: 'accessories', name: 'AKSESORIS' }
           ]
        });
      }
    } catch (e) {
      console.error('Error fetching config from cloud:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  return (
    <StoreContext.Provider value={{ config, isLoading, refreshConfig: fetchConfig }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}
