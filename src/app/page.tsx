import { Catalogo } from "@/components/Catalogo";
import { ProductGroup } from "@/components/ProductGroupCard";

async function getCatalogo(): Promise<ProductGroup[]> {
  
  const url = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/grupos-producto`;
  console.log(`Conectando a ${url}`);
  const response = await fetch(url, { cache: 'no-store'});
  
  if (!response.ok){
    throw new Error('Error al obtener los datos');
  }
  const data = await response.json();

  // Adapt the data to the format expected by the components
  return data.map((item: any) => ({
    id: item.id.toString(),
    name: item.nombre,
    description: item.nombre,
    category: item.grupoVenta?.nombre || 'Otros',
    image: item.urlFoto || '',
    material: 'Acero inoxidable 316L',
    idGrupoVenta: item.grupoVenta?.id,
    variants: item.productos.map((p: any) => ({
      id: p.id.toString(),
      color: p.color?.nombre || '',
      colorId: p.color?.id,
      size: p.talla?.nombre,
      tallaId: p.talla?.id,
      length: undefined,
      weight: p.peso,
      stock: p.stock,
      price: typeof p.precio === 'number' ? p.precio : Number(p.precio),
      imageUrl: p.urlFoto || undefined,
      sku: p.sku || undefined,
      isNew: false,
    })),
  }));
}

export default async function Page() {
  const datos = await getCatalogo();

  const agrupaciones = datos.reduce((acc: any, grupo) => {
    const categoria = grupo.category || 'Otros';
    if(!acc[categoria]){
      acc[categoria] = [];
    }
    acc[categoria].push(grupo);
    return acc;
  }, {});

  const categorias = Object.keys(agrupaciones);

  return(
    <Catalogo datos={datos} categorias={categorias} agrupaciones={agrupaciones} />
  );
}
