import Image from "next/image";

export default function IncludesItem({ item }) {
  // Verificar si item y item.img son valores definidos
  if (!item || !item.img) {
    return null; // O muestra un componente de carga, un marcador de posición, o simplemente no renderiza nada
  }

  return (
    <div className='includes-item'>
      <Image src={item.img} alt={item.name} width='100' height='100' />
      <p>{item.name}</p>
    </div>
  );
}
