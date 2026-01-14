"use client"
import { Plus } from "lucide-react";
import { ProductGroup } from "./ProductGroupCard";
import { ProductGroupCard } from "./ProductGroupCard";

interface CategorySectionProps {
  category: string;
  groups: ProductGroup[];
  onEdit: (group: ProductGroup) => void;
  onDelete: (id: string) => void;
  onAddGroup: (category: string) => void;
  darkMode: boolean;
}

export function CategorySection({ category, groups, onEdit, onDelete, onAddGroup, darkMode }: CategorySectionProps) {
  if (groups.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className={`flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          {category}
          <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>({groups.length})</span>
        </h2>
        <button
          onClick={() => onAddGroup(category)}
          className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 shadow-sm ${
            darkMode 
              ? 'bg-purple-600 hover:bg-purple-700 text-white' 
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          <Plus className="w-5 h-5" />
          <span className="hidden sm:inline">Agregar en {category}</span>
          <span className="sm:hidden">Agregar</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groups.map(group => (
          <ProductGroupCard
            key={group.id}
            group={group}
            onEdit={onEdit}
            onDelete={onDelete}
            darkMode={darkMode}
          />
        ))}
      </div>
    </div>
  );
}
