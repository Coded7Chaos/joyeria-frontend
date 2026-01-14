"use client";
import { useState } from 'react';
import Link from 'next/link';

interface Props {
    grupo: any;
}

export default function GrupoCard({grupo}: Props){
    const [isOpen, setIsOpen] = useState(false);
    return(    
    <div className="bg-white border border-gray-100 shadow-sm rounded-[2.5rem] w-full transition-all duration-300 overflow-hidden">
      {/* Cabecera de la Card */}
      <div className='bg-blue-500 h-52 flex items-center justify-center'>
        <span className='text-black text-xs font-bold tracking-widest'>Foto del grupo</span>
      </div>
      <div className="p-8">    
        <h2 className="text-2xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
          {grupo.nombre}
        </h2>
        
        <div className="mt-6 flex gap-3">
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="flex-1 bg-gray-900 text-white py-3 rounded-xl font-semibold text-sm hover:bg-gray-800 transition-all active:scale-95"
          >
            {isOpen ? '🔼 Ocultar' : '📦 Ver Productos'}
          </button>
          
          <Link 
            href={`/nuevo-producto/${grupo.id}`}
            className="px-4 py-3 bg-green-50 text-green-600 rounded-xl hover:bg-green-100 transition-all flex items-center justify-center border border-green-100"
            title="Añadir producto"
          >
            <span className="text-xl font-bold">+</span>
          </Link>
        </div>
      </div>

      {/* Panel Desplegable */}
      {isOpen && (
        <div className="bg-gray-50 border-t border-gray-100 p-6 animate-in slide-in-from-top-4 duration-300">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Existencias</h3>
            <span className="text-xs text-gray-500">{grupo.productos?.length || 0} variantes</span>
          </div>

          <div className="space-y-3">
            {grupo.productos && grupo.productos.length > 0 ? (
              grupo.productos.map((prod: any) => (
                <div key={prod.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex justify-between items-center hover:border-blue-200 transition-colors">
                  <div>
                    <p className="text-sm font-bold text-gray-700">{prod.sku || 'S/N'}</p>
                    <div className="flex gap-2 mt-1">
                      <span className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-600 rounded uppercase font-medium">
                        🎨 {prod.color?.nombre}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-600 rounded uppercase font-medium">
                        📏 {prod.talla?.nombre}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black text-blue-600">${Number(prod.precio).toFixed(2)}</p>
                    <p className={`text-[10px] font-bold ${prod.stock > 0 ? 'text-green-500' : 'text-red-400'}`}>
                      {prod.stock > 0 ? `${prod.stock} disponibles` : 'Sin stock'}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 border-2 border-dashed border-gray-200 rounded-2xl">
                <p className="text-sm text-gray-400 italic">No hay productos aún</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
    )
}