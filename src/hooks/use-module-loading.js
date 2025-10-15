import { useSelector } from "react-redux";
import { useEffect, useMemo } from "react";
import { setModuleLoading } from "@/lib/store/actions/globalActions";

/**
 * Tek bir modülün loading durumunu döndürür
 */
export const useModuleLoading = (module) => {
  return useSelector(state => state.global.moduleLoading[module] || false);
};

/**
 * Birden fazla modülün loading durumlarını object olarak döndürür
 * ✅ DÜZELTME: Shallow equality ile memoize edildi
 */
export const useMultipleModuleLoading = (modules) => {
  return useSelector(
    state => {
      const result = {};
      modules.forEach(module => {
        result[module] = state.global.moduleLoading[module] || false;
      });
      return result;
    },
    // ✅ Shallow equality check - sadece değerler değişirse yeni object döner
    (left, right) => {
      if (!left || !right) return false;
      const leftKeys = Object.keys(left);
      const rightKeys = Object.keys(right);
      if (leftKeys.length !== rightKeys.length) return false;
      return leftKeys.every(key => left[key] === right[key]);
    }
  );
};

/**
 * Herhangi bir modül loading durumundaysa true döner
 */
export const useAnyModuleLoading = () => {
  return useSelector(state => 
    Object.values(state.global.moduleLoading).some(loading => loading)
  );
};

/**
 * Belirtilen modüllerden herhangi biri loading durumundaysa true döner
 */
export const useAnyOfModulesLoading = (modules) => {
  return useSelector(state => 
    modules.some(module => state.global.moduleLoading[module] || false)
  );
};

/**
 * Tüm moduleLoading object'ini döndürür
 */
export const useAllModulesLoading = () => {
  return useSelector(state => state.global.moduleLoading);
};

/**
 * Belirtilen modüllerin hepsi loading durumundaysa true döner
 */
export const useAllOfModulesLoading = (modules) => {
  return useSelector(state => 
    modules.every(module => state.global.moduleLoading[module] || false)
  );
};

/**
 * ✅ DÜZELTME: Modül durumlarını döndürür (shallow equality ile optimize edildi)
 * 
 * @param {string|string[]} modules - Tek modül adı veya modül adları array'i
 * @returns {Object} loading, error, success, moduleLoading, anyModuleLoading
 */
export const useModuleState = (modules) => {
  const isArray = Array.isArray(modules);
  const moduleList = isArray ? modules : [modules];
  
  // Module list'i string'e çevir (dependency için)
  const modulesKey = useMemo(() => 
    moduleList.sort().join(','), 
    [moduleList.length] // ✅ length ile karşılaştır (daha stabil)
  );
  
  const loading = useSelector(state => state.global.loading);
  const error = useSelector(state => state.global.error);
  const success = useSelector(state => state.global.success);
  
  // ✅ Memoized selector with shallow equality
  const moduleLoading = useSelector(
    state => {
      if (isArray) {
        const result = {};
        moduleList.forEach(module => {
          result[module] = state.global.moduleLoading[module] || false;
        });
        return result;
      }
      return state.global.moduleLoading[modules] || false;
    },
    // ✅ Shallow equality check - yeni object sadece değer değişirse döner
    (left, right) => {
      // Primitive type kontrolü
      if (typeof left !== 'object' || typeof right !== 'object') {
        return left === right;
      }
      
      // Null kontrolü
      if (!left || !right) return false;
      
      // Key sayısı kontrolü
      const leftKeys = Object.keys(left);
      const rightKeys = Object.keys(right);
      
      if (leftKeys.length !== rightKeys.length) return false;
      
      // Her key'in değeri aynı mı kontrol et
      return leftKeys.every(key => left[key] === right[key]);
    }
  );
  
  // ✅ anyModuleLoading'i useMemo ile hesapla
  const anyModuleLoading = useMemo(() => {
    if (isArray) {
      return Object.values(moduleLoading).some(loading => loading);
    }
    return moduleLoading;
  }, [moduleLoading, isArray]);
  
  return {
    loading,
    error,
    success,
    moduleLoading,
    anyModuleLoading,
  };
};

/**
 * Loading durumundaki modül sayısını ve yüzdesini döndürür
 */
export const useLoadingCount = (modules = null) => {
  // ✅ useMemo ile modules array'ini stabilize et
  const modulesKey = useMemo(() => 
    modules ? modules.sort().join(',') : null, 
    [modules ? modules.length : null]
  );
  
  return useSelector(state => {
    const moduleLoading = state.global.moduleLoading;
    const modulesToCheck = modules || Object.keys(moduleLoading);
    
    const loadingModules = modulesToCheck.filter(
      module => moduleLoading[module] === true
    );
    
    const count = loadingModules.length;
    const total = modulesToCheck.length;
    const percentage = total > 0 ? (count / total) * 100 : 0;
    
    return {
      count,
      total,
      percentage: parseFloat(percentage.toFixed(2)),
      loadingModules,
    };
  });
};

/**
 * Component unmount olduğunda belirtilen modülün loading'ini temizler
 */
export const useAutoCleanupLoading = (module, dispatch) => {
  useEffect(() => {
    return () => {
      dispatch(setModuleLoading(module, false));
    };
  }, [module, dispatch]);
};

export default {
  useModuleLoading,
  useMultipleModuleLoading,
  useAnyModuleLoading,
  useModuleState,
};