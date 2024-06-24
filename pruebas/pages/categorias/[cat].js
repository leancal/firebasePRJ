import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import CategoryMainBanner from "../../components/CategoryMainBanner";
import { db } from "../../firebase";
import NotFound from "../../components/NotFound";
import Head from "next/head";
import CategoryLineSwiper from "../../components/CategoryLineSwiper";
import CategorySwiper from "../../components/CategorySwiper";
import { lvTwoCat, lvOneCat } from "../../content/categories";
import MultipleProdContainer from "../../components/MultipleProdContainer";
import lineas from '../../content/lineas';

export default function Category({ lvTwoCat, lvOneCat }) {
  const url = useRouter();
  const { cat } = url.query;
  const category = lvTwoCat.find((e) => e.route === `/categorias/${cat}`);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [products, setProducts] = useState([]);
  const [cooksProducts, setCooksProducts] = useState([]);
  const [cooksLoading, setCooksLoading] = useState(true);
  const isLvOneCategory = lvOneCat.some((lvOneCategory) => cat === lvOneCategory.route.replace('/categorias/', ''));
  let lvOneCategory = null;

  if (isLvOneCategory) {
    lvOneCategory = lvOneCat.find((lvOneCategory) => cat === lvOneCategory.route.replace('/categorias/', ''));
  }


  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Obtén todas las colecciones relevantes ('headsets', 'audio', 'tablets', 'notebooks')
        const collectionNames = ['headsets', 'audio', 'tablets', 'notebooks', 'cooks'];
        const productsData = [];

        // Realiza consultas para cada colección y agrega los resultados a productsData
        for (const collectionName of collectionNames) {
          const snapshot = await db.collection(collectionName).get();
          const collectionProducts = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          productsData.push(...collectionProducts);
        }

        // Filtra productos que coinciden con la categoría y están publicados
        const filteredProducts = productsData.filter(
          (product) =>
            product.secondCategories &&
            product.secondCategories.includes(`${category?.id}`) &&
            product.published === true
        );

        setProducts(filteredProducts);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching products:", error);
        setError("Error al obtener los productos");
        setLoading(false);
      }
    };

    const fetchCooksProducts = async () => {
      try {
        const cooksSnapshot = await db.collection('cooks').get();
        const cooksProducts = cooksSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        console.log("Products from Firebase (cooks):", cooksProducts);
        setCooksProducts(cooksProducts);
        setCooksLoading(false);
      } catch (error) {
        console.error("Error fetching products (cooks):", error);
        setError("Error al obtener los productos");
        setCooksLoading(false);
      }
    };

    fetchProducts();
    fetchCooksProducts();
  }, [category?.id]); // Dependencia adicional para el efecto secundario de la categoría 'cooks'
  if (loading || cooksLoading) {
    return <p>Cargando productos...</p>;
  }



  // Dentro del bloque que maneja las categorías de nivel 1
  if (isLvOneCategory) {


    if (cooksLoading) {
      return <p>Cargando productos...</p>;
    }

    return (
      <>
        <Head>
          <title>{`Cooks | Aiwa Electronics`}</title>
        </Head>
        <main id={`categorias ${cat}`}>
          <CategoryMainBanner
            banner={{
              img: lvOneCategory.img,
              alt: lvOneCategory.name,
              noText: lvOneCategory.noTextOnCategoryBanner,
              text: {
                title: lvOneCategory.name,
                subtitle: lvOneCategory.desc,
                align: lvOneCategory.categoryBannerTextPos?.[1] || 'left',
                valign: lvOneCategory.categoryBannerTextPos?.[0] || 'center',
              },
            }}
            isFirst={true}
          />
          <section className="product-list">
            <ul>
              <MultipleProdContainer products={cooksProducts} />
            </ul>
          </section>
        </main>
      </>
    );
  }



  if (!category) {
    return <NotFound desc={`No se ha encontrado la categoría "${cat}"`} />;
  }
  if (error) {
    return <p>Error: {error}</p>;
  }
  const prod = products.filter(
    (e) => e.secondCategories && e.secondCategories.includes(category.id)
  );

  const categoryObj = {
    // Formatea la data para el componente MainBanner
    img: category.img,
    alt: category.name,
    noText: category.noTextOnCategoryBanner,
    text: {
      title: category.name,
      subtitle: category.desc,
      align: category.categoryBannerTextPos ? category.categoryBannerTextPos[1] : "left",
      valign: category.categoryBannerTextPos ? category.categoryBannerTextPos[0] : "center",
    },
  };


  const lineArr = prod.map((e) => e.linea).filter(Boolean);
  const uniqueLines = [...new Set(lineArr)];
  if (prod.every((e) => e.line)) {
    prod.forEach((e) => {
      const line = lineArr.find((f) => f == e.line);
      if (!line) {
        lineArr.push(e.line);
      }
    });
  }
  function chunkArrayForSwiper(arr, chunkSize) {
    const result = [];
    for (let i = 0; i < arr.length; i += chunkSize) {
      result.push(arr.slice(i, i + chunkSize));
    }
    return result;
  }
  function chunkArray(arr, chunkSize) {
    const result = [];
    for (let i = 0; i < arr.length; i += chunkSize) {
      result.push(arr.slice(i, i + chunkSize));
    }
    return result;
  }

  const hasLinea = prod.some((e) => e.line);


  // Renderiza contenido para categorías de nivel 2
  console.log('Current Category:', category.name);

  return (
    <>
      <Head>
        <title>{`${category.name} | Aiwa Electronics`}</title>
      </Head>
      <main id={`categorias ${cat}`}>
        <CategoryMainBanner banner={categoryObj} />
        <section className="swiper-categorias">
          {prod.length > 0 ? (
            category.name.toLowerCase() === 'torres de sonido' || category.name.toLowerCase() === 'parlantes' ? (
              chunkArray(prod, 50).map((group, index) => {
                const i = index + 1;
                const categoryLineSwiper = (
                  <CategoryLineSwiper products={group} lineNames={uniqueLines} key={index} />
                );
                return (
                  <div key={i}>
                    {categoryLineSwiper}
                  </div>
                );
              })
            ) : (
              chunkArrayForSwiper(prod, 3).map((group, index) => {
                const i = index + 1;
                const categorySwiper = (
                  <CategorySwiper products={group} key={index} />
                );
                return (
                  <div key={i}>
                    {categorySwiper}
                  </div>
                );
              })
            )
          ) : (
            <p>No se ha encontrado el producto</p>
          )}
        </section>
      </main>
    </>
  );

}

export async function getStaticProps() {
  return {
    props: { lvTwoCat, lvOneCat }, // se pasará al componente de la página como props
  };
}

export async function getStaticPaths() {
  return {
    paths: [
      { params: { cat: 'parlantes' } },
      { params: { cat: 'torres-de-sonido' } },
      { params: { cat: 'in-ear' } },
      { params: { cat: 'on-ear' } },
      { params: { cat: 'tablets' } },
      { params: { cat: 'notebooks' } },
      { params: { cat: 'discontinuos' } },
      { params: { cat: 'yogurteras' } },
      { params: { cat: 'cooks' } },
    ],
    fallback: false, // también puede ser true o 'blocking'
  };
}