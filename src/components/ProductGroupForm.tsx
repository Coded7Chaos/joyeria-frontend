"use client"
import { useState, useEffect, useRef } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import { ProductGroup, ProductVariant } from "./ProductGroupCard";

interface ProductGroupFormProps {
  group?: ProductGroup;
  category: string;
  onSave: (group: Omit<ProductGroup, 'id'> | ProductGroup) => void;
  onCancel: () => void;
  darkMode: boolean;
}

export function ProductGroupForm({ group, category, onSave, onCancel, darkMode }: ProductGroupFormProps) {
  const [formData, setFormData] = useState<Omit<ProductGroup, 'id'>>({
    name: "",
    description: "",
    category: category,
    image: "",
    material: "Acero inoxidable 316L",
    idGrupoVenta: undefined,
    variants: [
      {
        id: Date.now().toString(),
        color: "",
        colorId: undefined,
        size: category === "Anillos" ? "" : undefined,
        tallaId: undefined,
        length: category === "Collares" ? "" : undefined,
        weight: 0,
        stock: 0,
        price: 0,
        sku: "",
        imageUrl: undefined,
        isNew: true,
      }
    ],
  });
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [tallas, setTallas] = useState<Array<{ id: number; talla: string }>>([]);
  const [tallasLoading, setTallasLoading] = useState(false);
  const [tallasError, setTallasError] = useState<string | null>(null);
  const [colores, setColores] = useState<Array<{ id: number; nombre: string }>>([]);
  const [coloresLoading, setColoresLoading] = useState(false);
  const [coloresError, setColoresError] = useState<string | null>(null);
  const [uploadingVariantId, setUploadingVariantId] = useState<string | null>(null);
  const [variantUploadErrors, setVariantUploadErrors] = useState<Record<string, string>>({});


  useEffect(() => {
    if (group) {
      setFormData({
        name: group.name,
        description: group.description,
        category: group.category,
        image: group.image,
        material: "Acero inoxidable 316L",
        idGrupoVenta: group.idGrupoVenta,
        variants: group.variants.map((variant) => ({
          ...variant,
          colorId: variant.colorId,
          tallaId: variant.tallaId,
          sku: variant.sku ?? "",
          imageUrl: variant.imageUrl,
          isNew: false,
        })),
      });
      setImageUrl(group.image);
    }
  }, [group]);

  useEffect(() => {
    let isActive = true;
    const fetchColores = async () => {
      setColoresLoading(true);
      setColoresError(null);
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/colores`);
        if (!res.ok) {
          throw new Error('No se pudieron cargar los colores');
        }
        const data = await res.json();
        if (isActive) {
          setColores(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        if (isActive) {
          const message = error instanceof Error ? error.message : 'Error al cargar colores';
          setColoresError(message);
          setColores([]);
        }
      } finally {
        if (isActive) {
          setColoresLoading(false);
        }
      }
    };

    fetchColores();

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    const grupoVentaId = group?.idGrupoVenta;
    if (!grupoVentaId) {
      setTallas([]);
      return;
    }

    let isActive = true;
    const fetchTallas = async () => {
      setTallasLoading(true);
      setTallasError(null);
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/tallas?id_grupo_venta=${grupoVentaId}`);
        if (!res.ok) {
          throw new Error('No se pudieron cargar las tallas');
        }
        const data = await res.json();
        if (isActive) {
          setTallas(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        if (isActive) {
          const message = error instanceof Error ? error.message : 'Error al cargar tallas';
          setTallasError(message);
          setTallas([]);
        }
      } finally {
        if (isActive) {
          setTallasLoading(false);
        }
      }
    };

    fetchTallas();

    return () => {
      isActive = false;
    };
  }, [group?.idGrupoVenta]);

  
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const formData = new FormData();
      formData.append('file', file);

      try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/files/upload`, {
              method: 'POST',
              body: formData,
          });

          if (!res.ok) {
              throw new Error('Error al subir la imagen');
          }

          const data = await res.json();
          setImageUrl(data.filePath);
      } catch (error) {
          console.error(error);
          alert("Hubo un error al subir la imagen.");
      }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleVariantChange = (variantId: string, field: string, value: any) => {
    const numericFields = new Set(['stock', 'price']);
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.map(v => 
        v.id === variantId 
          ? { ...v, [field]: numericFields.has(field)
              ? parseFloat(value) || 0 
              : value 
            }
          : v
      )
    }));
  };

  const handleVariantColorChange = (variantId: string, colorIdValue: string) => {
    const colorId = Number(colorIdValue);
    const selected = colores.find((color) => color.id === colorId);
    handleVariantChange(variantId, 'colorId', Number.isNaN(colorId) ? undefined : colorId);
    handleVariantChange(variantId, 'color', selected?.nombre ?? '');
  };

  const handleVariantTallaChange = (variantId: string, tallaIdValue: string) => {
    const tallaId = Number(tallaIdValue);
    const selected = tallas.find((talla) => talla.id === tallaId);
    handleVariantChange(variantId, 'tallaId', Number.isNaN(tallaId) ? undefined : tallaId);
    handleVariantChange(variantId, 'size', selected?.talla);
  };

  const handleVariantFileChange = async (variantId: string, file?: File) => {
    if (!file) return;

    setUploadingVariantId(variantId);
    setVariantUploadErrors(prev => ({ ...prev, [variantId]: '' }));

    const formDataUpload = new FormData();
    formDataUpload.append('file', file);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/files/upload`, {
        method: 'POST',
        body: formDataUpload,
      });

      if (!res.ok) {
        throw new Error('Error al subir la imagen de la variante');
      }

      const data = await res.json();
      handleVariantChange(variantId, 'imageUrl', data.filePath);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al subir la imagen de la variante';
      setVariantUploadErrors(prev => ({ ...prev, [variantId]: message }));
    } finally {
      setUploadingVariantId(null);
    }
  };

  const addVariant = () => {
    const newVariant: ProductVariant = {
      id: Date.now().toString(),
      color: "",
      colorId: undefined,
      size: category === "Anillos" ? "" : undefined,
      tallaId: undefined,
      length: category === "Collares" ? "" : undefined,
      weight: 0,
      stock: 0,
      price: 0,
      sku: "",
      imageUrl: undefined,
      isNew: true,
    };
    setFormData(prev => ({
      ...prev,
      variants: [...prev.variants, newVariant]
    }));
  };

  const removeVariant = (variantId: string) => {
    if (formData.variants.length > 1) {
      setFormData(prev => ({
        ...prev,
        variants: prev.variants.filter(v => v.id !== variantId)
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const dto = {
      nombre: formData.name,
      urlFoto: imageUrl,
      //TODO: add idGrupoVenta when available in the form
    }

    if (group) {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/grupos-producto/${group.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(dto),
        });
        if (!res.ok) {
          throw new Error('Error al actualizar el grupo');
        }
        const updatedGroup = await res.json();
        onSave({ ...formData, id: group.id, image: updatedGroup.urlFoto });

        const groupId = Number(group.id);
        const newVariants = formData.variants.filter((variant) => variant.isNew);
        const existingVariants = formData.variants.filter((variant) => !variant.isNew);
        const creationErrors: string[] = [];

        const createTasks = newVariants.map((variant) => {
          if (!variant.colorId) {
            creationErrors.push(`Selecciona un color para la variante ${variant.color || variant.id}`);
            return null;
          }
          if (category === "Anillos" && !variant.tallaId) {
            creationErrors.push(`Selecciona una talla para la variante ${variant.color || variant.id}`);
            return null;
          }

          const payload: {
            idGrupoProducto: number;
            idColor: number;
            idTalla?: number | null;
            precio: number;
            stock: number;
            sku?: string;
            urlFoto?: string;
          } = {
            idGrupoProducto: groupId,
            idColor: variant.colorId,
            precio: variant.price,
            stock: variant.stock,
            sku: variant.sku || undefined,
            urlFoto: variant.imageUrl || undefined,
          };

          if (category === "Anillos") {
            payload.idTalla = variant.tallaId ?? null;
          } else if (variant.tallaId) {
            payload.idTalla = variant.tallaId;
          }

          return (async () => {
            const createRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/productos`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload),
            });

            if (!createRes.ok) {
              const errorText = await createRes.text();
              throw new Error(errorText || 'Error al crear producto');
            }
            const created = await createRes.json();
            return { tempId: variant.id, created };
          })();
        }).filter(Boolean) as Array<Promise<{ tempId: string; created: any }>>;

        if (creationErrors.length) {
          alert(creationErrors.join('\n'));
          return;
        }

        const updateTasks = existingVariants.map((variant) => (async () => {
          const updatePayload: {
            idColor?: number | null;
            idTalla?: number | null;
            precio?: number;
            stock?: number;
            sku?: string | null;
            urlFoto?: string | null;
          } = {
            precio: variant.price,
            stock: variant.stock,
          };

          if (variant.colorId) {
            updatePayload.idColor = variant.colorId;
          }
          if (category === "Anillos") {
            updatePayload.idTalla = variant.tallaId ?? null;
          }
          if (variant.sku !== undefined) {
            updatePayload.sku = variant.sku || null;
          }
          if (variant.imageUrl !== undefined) {
            updatePayload.urlFoto = variant.imageUrl || null;
          }

          const updateRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/productos/${variant.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatePayload),
          });

          if (!updateRes.ok) {
            const errorText = await updateRes.text();
            throw new Error(errorText || 'Error al actualizar producto');
          }
          const updated = await updateRes.json();
          return { tempId: variant.id, updated };
        })());

        const createResults = createTasks.length ? await Promise.allSettled(createTasks) : [];
        const updateResults = updateTasks.length ? await Promise.allSettled(updateTasks) : [];

        const failedCreates = createResults.filter((result) => result.status === 'rejected');
        const failedUpdates = updateResults.filter((result) => result.status === 'rejected');

        if (failedCreates.length || failedUpdates.length) {
          failedCreates.forEach((result) => {
            if (result.status === 'rejected') {
              console.error('Error creando variante:', result.reason);
            }
          });
          failedUpdates.forEach((result) => {
            if (result.status === 'rejected') {
              console.error('Error actualizando variante:', result.reason);
            }
          });
          alert('Algunas variantes no se pudieron guardar. Revisa los datos e intenta otra vez.');
        }

        if (createResults.length) {
          setFormData(prev => ({
            ...prev,
            variants: prev.variants.map((variant) => {
              if (!variant.isNew) {
                return variant;
              }
              const created = createResults.find((result) =>
                result.status === 'fulfilled' && result.value.tempId === variant.id
              );
              if (created && created.status === 'fulfilled') {
                const createdData = created.value.created;
                return {
                  ...variant,
                  id: createdData?.id ? String(createdData.id) : variant.id,
                  isNew: false,
                };
              }
              return variant;
            }),
          }));
        }

      } catch (error) {
        console.error(error);
        alert('Error al actualizar el grupo');
      }

    } else {
      // onSave(formData);
      console.log("Creation logic not implemented yet")
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center px-4 py-10 z-50 overflow-y-auto">
      <div className={`rounded-lg shadow-xl max-w-4xl w-full flex flex-col overflow-hidden max-h-[calc(100vh-5rem)] ${
        darkMode ? 'bg-gray-800' : 'bg-white'
      }`}>
        <div className={`sticky top-0 z-10 border-b px-6 py-7 flex items-center justify-between ${
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-rose-50 border-rose-100'
        }`}>
          <h2 className={`${darkMode ? 'text-white' : 'text-gray-800'} text-2xl font-semibold`}>
            {group ? "Editar Grupo" : "Nuevo Grupo"} - {category}
          </h2>
          <button
            onClick={onCancel}
            className={darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}
            aria-label="Cerrar"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <form
          onSubmit={handleSubmit}
          className="px-6 pt-6 pb-6 space-y-6 flex-1 overflow-y-auto"
        >
          {/* Información General */}
          <div className="space-y-4">
            <div>
              <label className={`block mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Nombre del Grupo</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:outline-none ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-purple-500' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-blue-500'
                }`}
                placeholder="Ej: Pulsera Corazón"
              />
            </div>

            <div>
              <label className={`block mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Descripción</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={2}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:outline-none ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-purple-500' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-blue-500'
                }`}
                placeholder="Descripción breve del producto"
              />
            </div>

            <div>
              <label className={`block mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Imagen del Grupo</label>
               <input
                  type="file"
                  onChange={handleFileChange}
                  ref={fileInputRef}
                  className="w-full border p-2 rounded"
                  accept="image/png, image/jpeg"
              />
              {imageUrl && (
                  <div className="mt-4">
                      <img 
                          src={imageUrl} 
                          alt="Vista previa" 
                          className="max-w-xs max-h-48 rounded"
                      />
                  </div>
              )}
            </div>
          </div>

          {/* Variantes */}
          <div className={`space-y-4 border-t pt-6 ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <h3 className={darkMode ? 'text-white' : 'text-gray-900'}>Variantes del Producto</h3>
              <button
                type="button"
                onClick={addVariant}
                className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                  darkMode 
                    ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                <Plus className="w-4 h-4" />
                Agregar Variante
              </button>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
              {formData.variants.map((variant, index) => (
                <div key={variant.id} className={`rounded-lg p-4 space-y-3 ${
                  darkMode ? 'bg-gray-700' : 'bg-gray-50'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>Variante {index + 1}</span>
                    {formData.variants.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeVariant(variant.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className={`grid grid-cols-2 ${category === "Anillos" ? 'md:grid-cols-4' : 'md:grid-cols-3'} gap-3`}>
                    <div>
                      <label className={`block mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Color</label>
                      <select
                        value={variant.colorId ?? ''}
                        onChange={(e) => handleVariantColorChange(variant.id, e.target.value)}
                        required
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:outline-none ${
                          darkMode 
                            ? 'bg-gray-600 border-gray-500 text-white focus:ring-purple-500' 
                            : 'bg-white border-gray-300 text-gray-900 focus:ring-blue-500'
                        }`}
                      >
                        <option value="">{coloresLoading ? 'Cargando colores...' : 'Selecciona un color'}</option>
                        {colores.map((color) => (
                          <option key={color.id} value={color.id}>
                            {color.nombre}
                          </option>
                        ))}
                      </select>
                      {coloresError && (
                        <p className="mt-1 text-xs text-red-500">{coloresError}</p>
                      )}
                    </div>

                    {category === "Anillos" && (
                      <div>
                        <label className={`block mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Talla</label>                        
                        <select
                          value={variant.tallaId ?? ''}
                          onChange={(e) => handleVariantTallaChange(variant.id, e.target.value)}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:outline-none ${
                            darkMode 
                              ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400 focus:ring-purple-500' 
                              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-blue-500'
                          }`}
                        >
                          <option value="">{tallasLoading ? 'Cargando tallas...' : 'Selecciona una talla'}</option>
                          {tallas.map((talla) => (
                            <option key={talla.id} value={talla.id}>
                              {talla.talla}
                            </option>
                          ))}
                        </select>
                        {tallasError && (
                          <p className="mt-1 text-xs text-red-500">{tallasError}</p>
                        )}

                      </div>
                    )}

                    {category === "Collares" && (
                      <div>
                        <label className={`block mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Largo</label>
                        <input
                          type="text"
                          value={variant.length || ""}
                          onChange={(e) => handleVariantChange(variant.id, 'length', e.target.value)}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:outline-none ${
                            darkMode 
                              ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400 focus:ring-purple-500' 
                              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-blue-500'
                          }`}
                          placeholder="Ej: 40cm, 45cm"
                        />
                      </div>
                    )}

                    <div>
                      <label className={`block mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>SKU</label>
                      <input
                        type="text"
                        value={variant.sku ?? ""}
                        onChange={(e) => handleVariantChange(variant.id, 'sku', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:outline-none ${
                          darkMode 
                            ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400 focus:ring-purple-500' 
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-blue-500'
                        }`}
                        placeholder="SKU opcional"
                      />
                    </div>

                    <div>
                      <label className={`block mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Foto (opcional)</label>
                      <input
                        type="file"
                        accept="image/png, image/jpeg"
                        onChange={(e) => handleVariantFileChange(variant.id, e.target.files?.[0])}
                        className={`w-full border p-2 rounded ${
                          darkMode 
                            ? 'bg-gray-600 border-gray-500 text-white' 
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      />
                      {uploadingVariantId === variant.id && (
                        <p className="mt-1 text-xs text-gray-500">Subiendo imagen...</p>
                      )}
                      {variantUploadErrors[variant.id] && (
                        <p className="mt-1 text-xs text-red-500">{variantUploadErrors[variant.id]}</p>
                      )}
                      {variant.imageUrl && (
                        <img
                          src={variant.imageUrl}
                          alt="Foto de variante"
                          className="mt-2 h-16 w-16 rounded object-cover"
                        />
                      )}
                    </div>

                    <div>
                      <label className={`block mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Precio (Bs)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={variant.price}
                        onChange={(e) => handleVariantChange(variant.id, 'price', e.target.value)}
                        required
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:outline-none ${
                          darkMode 
                            ? 'bg-gray-600 border-gray-500 text-white focus:ring-purple-500' 
                            : 'bg-white border-gray-300 text-gray-900 focus:ring-blue-500'
                        }`}
                      />
                    </div>

                    <div>
                      <label className={`block mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Stock</label>
                      <input
                        type="number"
                        value={variant.stock}
                        onChange={(e) => handleVariantChange(variant.id, 'stock', e.target.value)}
                        required
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:outline-none ${
                          darkMode 
                            ? 'bg-gray-600 border-gray-500 text-white focus:ring-purple-500' 
                            : 'bg-white border-gray-300 text-gray-900 focus:ring-blue-500'
                        }`}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={`flex gap-3 pt-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <button
              type="submit"
              className={`flex-1 py-3 px-4 rounded-lg transition-colors ${
                darkMode 
                  ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {group ? "Actualizar" : "Crear"} Grupo
            </button>
            <button
              type="button"
              onClick={onCancel}
              className={`flex-1 py-3 px-4 rounded-lg transition-colors ${
                darkMode 
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' 
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              }`}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
