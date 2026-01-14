"use client"
import { useState } from "react";
import { Gem, Search, Moon, Sun } from "lucide-react";
import { CategorySection } from "./CategorySection";
import { ProductGroupForm } from "./ProductGroupForm";
import { ProductGroup } from "./ProductGroupCard";

interface CatalogoProps {
    datos: ProductGroup[];
    categorias: string[];
    agrupaciones: any;
}

export function Catalogo({ datos, categorias, agrupaciones }: CatalogoProps) {
  const [groups, setGroups] = useState<ProductGroup[]>(datos);
  const [showForm, setShowForm] = useState(false);
  const [editingGroup, setEditingGroup] = useState<ProductGroup | undefined>();
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [darkMode, setDarkMode] = useState(false);

  const handleSaveGroup = (groupData: Omit<ProductGroup, 'id'> | ProductGroup) => {
    if ('id' in groupData) {
      setGroups(prev => prev.map(g => g.id === groupData.id ? groupData as ProductGroup : g));
    } else {
      const newGroup: ProductGroup = {
        ...groupData,
        id: Date.now().toString()
      };
      setGroups(prev => [...prev, newGroup]);
    }
    setShowForm(false);
    setEditingGroup(undefined);
    setSelectedCategory("");
  };

  const handleEditGroup = (group: ProductGroup) => {
    setEditingGroup(group);
    setSelectedCategory(group.category);
    setShowForm(true);
  };

  const handleDeleteGroup = (id: string) => {
    setGroups(prev => prev.filter(g => g.id !== id));
  };

  const handleAddGroup = (category: string) => {
    setEditingGroup(undefined);
    setSelectedCategory(category);
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingGroup(undefined);
    setSelectedCategory("");
  };

  // Filtrar grupos por búsqueda
  const filteredGroups = groups.filter(group => {
    const matchesSearch = group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         group.description.toLowerCase().includes(searchTerm.toLowerCase()) 
    return matchesSearch;
  });

  // Calcular estadísticas
  const totalProducts = filteredGroups.reduce((sum, g) => sum + g.variants.length, 0);
  const totalStock = filteredGroups.reduce((sum, g) => 
    sum + g.variants.reduce((s, v) => s + v.stock, 0), 0
  );

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <header className={`${darkMode ? 'bg-gradient-to-r from-purple-900 to-blue-900' : 'bg-gradient-to-r from-purple-600 to-blue-600'} text-white shadow-lg`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Gem className="w-8 h-8" />
                <div>
                  <h1>Sistema de Inventario - Joyería</h1>
                  <p className={`${darkMode ? 'text-purple-200' : 'text-purple-100'} mt-1`}>
                    {totalProducts} variantes • {totalStock} unidades en stock
                  </p>
                </div>
              </div>

              {/* Dark Mode Toggle */}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-3 rounded-lg transition-colors ${
                  darkMode 
                    ? 'bg-gray-800 hover:bg-gray-700' 
                    : 'bg-white bg-opacity-20 hover:bg-opacity-30'
                }`}
                title={darkMode ? "Modo claro" : "Modo oscuro"}
              >
                {darkMode ? <Sun className=" w-6 h-6" /> : <Moon className=" text-blue-800 w-6 h-6" />}
              </button>
            </div>

            {/* Búsqueda */}
            <div className="relative w-full">
              <Search className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                darkMode ? 'text-gray-400' : 'text-gray-500'
              }`} />
              <input
                type="text"
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-12 pr-4 py-3 rounded-lg transition-all focus:outline-none focus:ring-2 ${
                  darkMode 
                    ? 'bg-gray-800 text-white placeholder-gray-400 focus:ring-purple-500' 
                    : 'bg-white text-gray-900 placeholder-gray-500 focus:ring-blue-500'
                }`}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {categorias.map(category => {
          const categoryGroups = filteredGroups.filter(g => g.category === category);
          return (
            <CategorySection
              key={category}
              category={category}
              groups={categoryGroups}
              onEdit={handleEditGroup}
              onDelete={handleDeleteGroup}
              onAddGroup={handleAddGroup}
              darkMode={darkMode}
            />
          );
        })}

        {filteredGroups.length === 0 && (
          <div className="text-center py-12">
            <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>No se encontraron productos</p>
          </div>
        )}
      </main>

      {/* Product Group Form Modal */}
      {showForm && (
        <ProductGroupForm
          group={editingGroup}
          category={selectedCategory}
          onSave={handleSaveGroup}
          onCancel={handleCancelForm}
          darkMode={darkMode}
        />
      )}
    </div>
  );
}
