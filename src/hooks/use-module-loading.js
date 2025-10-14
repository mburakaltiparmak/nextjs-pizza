import { useSelector } from "react-redux";
import { useMemo } from "react";

export const useModuleLoading = (module) => {
  return useSelector(state => state.global.moduleLoading[module] || false);
};

export const useMultipleModuleLoading = (modules) => {
  return useSelector(state => {
    const result = {};
    modules.forEach(module => {
      result[module] = state.global.moduleLoading[module] || false;
    });
    return result;
  });
};

export const useAnyModuleLoading = () => {
  return useSelector(state => 
    Object.values(state.global.moduleLoading).some(loading => loading)
  );
};

export const useAnyOfModulesLoading = (modules) => {
  return useSelector(state => 
    modules.some(module => state.global.moduleLoading[module] || false)
  );
};

export const useAllModulesLoading = () => {
  return useSelector(state => state.global.moduleLoading);
};

export const useAllOfModulesLoading = (modules) => {
  return useSelector(state => 
    modules.every(module => state.global.moduleLoading[module] || false)
  );
};

export const useModuleState = (modules) => {
  const isArray = Array.isArray(modules);
  const moduleList = isArray ? modules : [modules];
  
  const loading = useSelector(state => state.global.loading);
  const error = useSelector(state => state.global.error);
  const success = useSelector(state => state.global.success);
  
  const moduleLoading = useSelector(state => {
    if (isArray) {
      const result = {};
      moduleList.forEach(module => {
        result[module] = state.global.moduleLoading[module] || false;
      });
      return result;
    }
    return state.global.moduleLoading[modules] || false;
  });
  
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

export const useLoadingCount = (modules = null) => {
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

export const useAutoCleanupLoading = (module, dispatch) => {
  const { useEffect } = require('react');
  const { setModuleLoading } = require('../store/actions/globalActions');
  
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