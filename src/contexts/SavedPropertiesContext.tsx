import React, { createContext, useContext, useState, ReactNode } from "react";

interface SavedPropertiesContextType {
  savedPropertyIds: number[];
  toggleSaveProperty: (propertyId: number) => void;
  isPropertySaved: (propertyId: number) => boolean;
  clearAllSaved: () => void;
}

const SavedPropertiesContext = createContext<SavedPropertiesContextType | undefined>(undefined);

export const SavedPropertiesProvider = ({ children }: { children: ReactNode }) => {
  const [savedPropertyIds, setSavedPropertyIds] = useState<number[]>([]);

  const toggleSaveProperty = (propertyId: number) => {
    setSavedPropertyIds((prev) =>
      prev.includes(propertyId)
        ? prev.filter((id) => id !== propertyId)
        : [...prev, propertyId]
    );
  };

  const isPropertySaved = (propertyId: number) => savedPropertyIds.includes(propertyId);

  const clearAllSaved = () => setSavedPropertyIds([]);

  return (
    <SavedPropertiesContext.Provider
      value={{ savedPropertyIds, toggleSaveProperty, isPropertySaved, clearAllSaved }}
    >
      {children}
    </SavedPropertiesContext.Provider>
  );
};

export const useSavedProperties = () => {
  const context = useContext(SavedPropertiesContext);
  if (!context) {
    throw new Error("useSavedProperties must be used within SavedPropertiesProvider");
  }
  return context;
};
