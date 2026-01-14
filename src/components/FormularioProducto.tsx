"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

interface OptionA {
    id: number;
    nombre: string;
    codigoHex: string;
}

interface OptionB {
    id: number;
    talla: string;
}

interface Props {
    idGrupo: string;
    colores: OptionA[];
    tallas: OptionB[];
}

export default function FormularioProducto({ idGrupo, colores, tallas }: Props) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);


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

    const handleSubmit = async(e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.currentTarget);

        const data = {
            idGrupoProducto: parseInt(idGrupo),
            idColor: parseInt(formData.get('id_color') as string),
            idTalla: parseInt(formData.get('id_talla') as string),
            precio: parseFloat(formData.get('precio') as string),
            stock: parseInt(formData.get('stock') as string),
            sku: formData.get('sku') || null,
            urlFoto: imageUrl,
        };

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/productos`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if(!res.ok){
                const errorData = await res.json();
                throw new Error(errorData.message || 'Error al crear el producto');
            }
            alert("Producto creado");   
            (e.target as HTMLFormElement).reset();
            setImageUrl(null);
            router.push('/');
            router.refresh();
        } catch(error){
            console.error("Error enviando datos", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg border shadow-sm">
            <div className="grid grid-cols-2 gap-6">
                
                <div>
                    <label className="block text-sm font-medium mb-1"> Color *</label>
                    <select name="id_color" required className="w-full border p-2 rounded">
                        <option value="">Selecciona...</option>
                        {colores.map((colores: any) => <option value={colores.id}>{colores.nombre}</option> )}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1"> Talla *</label>
                    <select name="id_talla" required className="w-full border p-2 rounded">
                        <option value="">Elige una talla</option>
                        {tallas.map((tallas:any) => <option value={tallas.id}>{tallas.talla}</option> )}
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4" >
                
                <div>
                    <label className="block text-sm font-medium mb-1">  Precio *</label>
                    <input name="precio" type="number" required className="w-full border p-2 rounded"/>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">  Stock *</label>
                    <input name="stock" type="number" required className="w-full border p-2 rounded"/>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">  SKU (opcional) </label>
                <input name="sku" type="text" className="w-full border p-2 rounded"/>
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">Foto del Producto</label>
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

            <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 disabled:bg-gray-400"
            > {loading ? "Creando producto..." : "Guardar"}   </button>    
        </form>
    )

}