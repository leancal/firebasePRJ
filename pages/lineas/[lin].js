import Image from "next/image";
import { useRouter } from "next/router";
import NotFound from "../../components/NotFound";
import Head from "next/head";
import LineBanner from "../../components/LineBanner";
import LineProductCard from "../../components/LineProductCard";
import { getDocs, collection, query, where } from "firebase/firestore";
import { db } from "../../firebase";
import lineas from "../../content/lineas";

export default function Lines({ linea, products }) {
  console.log("PRODUCTOS:", products);
  const url = useRouter();
  const { lin } = url.query;

  // Simula la consulta a Firebase para obtener información de la línea
  const lineaData = lineas.find((linea) => linea.link === `/lineas/${lin}`);
  console.log("Línea actual:", lineaData);

  // Verifica si `lineaData` contiene la información esperada
  if (!lineaData) {
    return <NotFound desc={`No se ha encontrado la línea "${lin}"`} />;
  }

  // Verifica si `lineaData.name` tiene el valor esperado
  console.log("lineaData.name:", lineaData.name);

  // Filtra los productos según la línea actual y otros criterios
  const prod = products.filter((e) => {
    console.log("Producto a filtrar:", e);
    return e.linea === lineaData.name;
  });
  console.log("Productos filtrados:", prod);

  return (
    <>
      <Head>
        <title>{`Línea ${lineaData.displayName} | Aiwa Electronics`}</title>
      </Head>
      <main className={`linea ${lin}`}>
        <LineBanner line={lineaData} />
        <section className='line-products'>
          {prod.map((e, i) => <LineProductCard prod={e} key={i} />)}
          <div className="section-bg">
            <Image src={lineaData.background} fill />
          </div>
        </section>
      </main>
    </>
  );
}

export async function getStaticProps({ params }) {
  const { lin } = params;

  // Realiza una consulta a la base de datos de Firebase para obtener productos de la línea
  const productsCollectionRef = collection(db, "audio");
  const productsQuery = query(productsCollectionRef, where("linea", "in", ["infinit", "flama", "ring", "party", "waterproof"]));
  const productsSnapshot = await getDocs(productsQuery);
  console.log("Snapshot de productos desde Firebase:", productsSnapshot);

  const productsData = productsSnapshot.docs.map((doc) => {
    const data = doc.data();
    console.log("Producto desde Firestore:", data);
    return data;
  });
  console.log("Productos desde Firebase:", productsData);

  // Simula la consulta a Firebase para obtener información de la línea
  const lineaData = lineas.find((linea) => linea.link === `/lineas/${lin}`);

  return {
    props: {
      linea: lineaData,
      products: productsData,
    },
  };
}

export async function getStaticPaths() {
  const paths = [
    { params: { lin: "infinit" } },
    { params: { lin: "flama" } },
    { params: { lin: "ring" } },
    { params: { lin: "party" } },
    { params: { lin: "waterproof" } },
  ];

  return {
    paths,
    fallback: false, // puede ser true o 'blocking'
  };
}
