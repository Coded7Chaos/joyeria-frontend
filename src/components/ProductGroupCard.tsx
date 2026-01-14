"use client"
import { useState } from "react";
import { ArrowLeft, ArrowRight, Edit2, Image as ImageIcon, Trash2, X, ChevronLeft, ChevronRight } from "lucide-react";
import { ImageWithFallback } from "./ImageWithFallback";

export interface ProductVariant {
  id: string;
  color: string;
  colorId?: number;
  size?: string;
  tallaId?: number;
  length?: string;
  weight?: number;
  stock: number;
  price: number;
  imageUrl?: string;
  sku?: string;
  isNew?: boolean;
}

export interface ProductGroup {
  id: string;
  name: string;
  description: string;
  category: string;
  image: string;
  material: string;
  idGrupoVenta?: number;
  variants: ProductVariant[];
}

interface ProductGroupCardProps {
  group: ProductGroup;
  onEdit: (group: ProductGroup) => void;
  onDelete: (id: string) => void;
  darkMode: boolean;
}

export function ProductGroupCard({ group, onEdit, onDelete, darkMode }: ProductGroupCardProps) {
  const totalStock = group.variants.reduce((sum, v) => sum + v.stock, 0);
  const lowStock = totalStock < 10;
  const materialLabel = "Acero inoxidable 316L";
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const variantsWithImages = group.variants.filter((variant) => Boolean(variant.imageUrl));
  const hasMultiple = variantsWithImages.length > 1;
  const activeVariant = activeIndex !== null ? variantsWithImages[activeIndex] : null;

  const goPrev = () => {
    if (!hasMultiple || activeIndex === null) return;
    setActiveIndex((prev) => (prev === null ? 0 : (prev - 1 + variantsWithImages.length) % variantsWithImages.length));
  };

  const goNext = () => {
    if (!hasMultiple || activeIndex === null) return;
    setActiveIndex((prev) => (prev === null ? 0 : (prev + 1) % variantsWithImages.length));
  };

  return (
    <div className={`group rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow ${
      darkMode ? 'bg-gray-800' : 'bg-white'
    }`}>
      {/* Imagen Principal */}
      <div className="relative h-64 bg-gray-100">
        <ImageWithFallback
          src={group.image}
          alt={group.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-3 right-3 flex gap-2">
          <button
            onClick={() => onEdit(group)}
            className={`p-2 rounded-full shadow-lg transition-colors ${
              darkMode 
                ? 'bg-gray-700 hover:bg-gray-600' 
                : 'bg-white hover:bg-gray-100'
            }`}
            title="Editar"
          >
            <Edit2 className="w-4 h-4 text-blue-600" />
          </button>
          <button
            onClick={() => {
              if (window.confirm(`¿Eliminar "${group.name}"?`)) {
                onDelete(group.id);
              }
            }}
            className={`p-2 rounded-full shadow-lg transition-colors ${
              darkMode 
                ? 'bg-gray-700 hover:bg-gray-600' 
                : 'bg-white hover:bg-gray-100'
            }`}
            title="Eliminar"
          >
            <Trash2 className="w-4 h-4 text-red-600" />
          </button>
        </div>
      </div>

      {/* Información del Grupo */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h3 className={`mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{group.name}</h3>
          </div>
          <span className={`ml-2 px-3 py-1 rounded-full text-sm whitespace-nowrap ${
            lowStock 
              ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200' 
              : 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200'
          }`}>
            Stock: {totalStock}
          </span>
        </div>

        <div className="mt-3">
          <span className={`inline-block px-3 py-1 rounded-full ${
            darkMode 
              ? 'bg-purple-900 text-purple-200' 
              : 'bg-purple-100 text-purple-700'
          }`}>
            {materialLabel}
          </span>
        </div>

        {/* Variantes */}
        <div className={`border-t mt-3 pt-3 ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <p className={`mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Variantes disponibles:</p>
          <div className="space-y-2">
            {group.variants.map((variant) => {
              const imageIndex = variantsWithImages.findIndex((item) => item.id === variant.id);
              const hasImage = imageIndex !== -1;
              return (
              <div
                key={variant.id}
                className={`rounded-lg p-3 flex items-center gap-3 ${
                  darkMode ? 'bg-gray-700' : 'bg-gray-50'
                }`}
              >
                <div className="flex-1 transition-all duration-200 group-hover:w-4/5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={darkMode ? 'text-white' : 'text-gray-900'}>{variant.color}</span>
                    {variant.size && (
                      <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>• Talla: {variant.size}</span>
                    )}
                    {variant.length && (
                      <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>• Largo: {variant.length}</span>
                    )}
                    {variant.weight && (
                      <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>• {variant.weight}g</span>
                    )}
                  </div>
                  <div className="mt-1">
                    <span className={darkMode ? 'text-blue-400' : 'text-blue-600'}>${variant.price.toLocaleString()}</span>
                  </div>
                </div>
                <div className="ml-3">
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    variant.stock < 3 
                      ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200' 
                      : variant.stock < 5
                      ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200'
                      : 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200'
                  }`}>
                    {variant.stock} und
                  </span>
                </div>
                <div className="flex justify-end w-0 overflow-hidden opacity-0 transition-all duration-200 group-hover:w-1/5 group-hover:opacity-100">
                  <button
                    type="button"
                    className={`p-2 rounded-md border transition-colors ${
                      darkMode
                        ? 'border-gray-600 text-gray-200 hover:bg-gray-600'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-100'
                    } ${hasImage ? '' : 'opacity-40 cursor-not-allowed'}`}
                    title={hasImage ? "Ver imagen" : "Sin imagen"}
                    onClick={() => {
                      if (hasImage) {
                        setActiveIndex(imageIndex);
                      }
                    }}
                    disabled={!hasImage}
                  >
                    <ImageIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )})}
          </div>
        </div>
      </div>

      {activeVariant && activeIndex !== null && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-[1px] p-[5vh]"
          onClick={() => setActiveIndex(null)}
        >
          <div
            className="relative w-[80vw] max-w-[80vw] h-[85vh] max-h-[85vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="absolute right-2 top-2 text-gray-300 hover:text-gray-100"
              onClick={() => setActiveIndex(null)}
              aria-label="Cerrar"
            >
              <X className="m-2 w-7 h-7" />
            </button>

            {hasMultiple && (
              <button
                type="button"
                className="absolute left-4 top-1/2 -translate-y-1/2 h-16 w-16 rounded-full bg-white/0 text-gray-400 hover:bg-black/15 flex items-center justify-center transition-colors"
                onClick={goPrev}
                aria-label="Anterior"
              >
                <ChevronLeft className="w-8 h-8" strokeWidth={2.5} />
              </button>
            )}

            {hasMultiple && (
              <button
                type="button"
                className="absolute right-4 top-1/2 -translate-y-1/2 h-16 w-16 rounded-full bg-white/0 text-gray-400 hover:bg-black/15 flex items-center justify-center transition-colors"
                onClick={goNext}
                aria-label="Siguiente"
              >
                <ChevronRight className="w-8 h-8" strokeWidth={2.5} />
              </button>
            )}

            <div className="absolute inset-0 overflow-hidden">
              <div
                className="flex h-full transition-transform duration-300 ease-out"
                style={{ transform: `translateX(-${activeIndex * 100}%)` }}
              >
                {variantsWithImages.map((variant) => (
                  <div
                    key={variant.id}
                    className="flex-none w-full h-full flex items-center justify-center"
                  >
                    <ImageWithFallback
                      src={variant.imageUrl || ""}
                      alt={`Imagen de ${group.name}`}
                      className="max-w-[80vw] max-h-[85vh] rounded-lg object-contain shadow-2xl"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
              {variantsWithImages.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  className={`rounded-full transition-all ${
                    index === activeIndex
                      ? 'h-3 w-3 bg-white'
                      : 'h-2 w-2 bg-white/50 hover:bg-white/80'
                  }`}
                  onClick={() => setActiveIndex(index)}
                  aria-label={`Ir a imagen ${index + 1}`}
                />
              ))}
            </div>

            <button
              type="button"
              className="absolute bottom-4 right-4 rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-gray-900 shadow-lg hover:bg-white"
            >
              Comprar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
