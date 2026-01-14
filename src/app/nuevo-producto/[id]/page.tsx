import FormularioProducto from "@/components/FormularioProducto";

interface Color {
    id: number;
    nombre: string;
    codigoHex: string;
}
interface Talla {
    id: number;
    talla: string;
}

interface Producto {
    id: number;
    precio: number;
    stock: number;
    color: Color;
    talla: Talla;
}

interface GrupoProducto {
    id: number;
    nombre: string;
    urlFoto: string | null;
    grupoVenta: {
        id: number;
        nombre: string;
    }
    productos: Producto[];
}

async function getDatosFormulario(idGrupo: string){
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;
    try{
    const resGrupo = await fetch(`${baseUrl}/api/v1/grupos-producto/${idGrupo}`, { cache: 'no-store'});
    console.log("Buscando en: ", `${baseUrl}/api/v1/grupos-producto/${idGrupo}`);
    if(!resGrupo.ok){
        console.log("Error de api: Status", resGrupo.status);
        return null;
    }
    
    const grupo = await resGrupo.json();
    console.log("Contenido del grupo: ", grupo);
    if(!grupo || !grupo.grupoVenta) {
        console.error("Error: El grupo no tiene grupo venta", grupo);
        return null;
    }

    const idGrupoVenta = grupo.grupoVenta.id;

    const [resColores, resTallas] = await Promise.all([
        fetch(`${baseUrl}/api/v1/colores`, { cache: 'no-store' }),
        fetch(`${baseUrl}/api/v1/tallas?id_grupo_venta=${idGrupoVenta}`, { cache: 'no-store' })
    ]);

    return {
        grupo,
        colores: (await resColores.json()) as Color[],
        tallas: (await resTallas.json()) as Talla[]
    };
    } catch (err){
        console.error("ERROR DE CONEXI´ON: ",err);
        return null;
    }
}

export default async function NuevoProductoPage({params}: { params: Promise<{ id: string }> }) {
    const resolvedParams = await params;
    const id = resolvedParams.id;
    const data = await getDatosFormulario(id);

    if(!data){
        return <div className="p-10 text-red-500"> No se pudo cargar la información del grupo.</div>;
    }

    const {grupo, colores, tallas } = data;

    return (
        <main className="max-w-2xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-2">Añadir Producto a:</h1>
      <p className="text-blue-600 font-semibold mb-8">{grupo.nombre}</p>

      <FormularioProducto 
        idGrupo={id} 
        colores={colores} 
        tallas={tallas} 
      />
    </main>
    );
}