import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import ProductContent from '../../components/ProductContent';
import Head from 'next/head';
import texts from '../../content/texts';
import Loading from '../../components/Loading';
import app from '../../firebase';
import { getFirestore, doc, collection, getDocs, getDoc } from 'firebase/firestore';

export default function Producto({ productData, isProductAvailable }) {
  const router = useRouter();
  const { prod } = router.query;
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (prod) {
      const fetchData = async () => {
        const collections = ['audio', 'headsets', 'notebooks', 'tablets', 'cooks'];
        const db = getFirestore(app);

        for (const collectionName of collections) {
          const productRef = doc(db, collectionName, prod);

          try {
            const productDoc = await getDoc(productRef);

            if (productDoc.exists()) {
              const productDataFromFirebase = productDoc.data();

              if (productDataFromFirebase.published) {
                setLoading(false);
                return;
              } else {
                setIsProductAvailable(false);
              }
            }
          } catch (error) {
            setLoading(false);
          }
        }

        setLoading(false);
        setIsProductAvailable(false);
      };

      fetchData();
    }
  }, [prod]);

  return (
    <>
      {loading ? (
        <Loading />
      ) : isProductAvailable ? (
        productData && productData.sku ? (
          <>
            <Head>
              <title>{productData.sku + texts.spacer + texts.aiwaElec}</title>
            </Head>
            <section className='product-page'>
              <ProductContent prod={productData} productData={productData} />
            </section>
          </>
        ) : (
          <p>Producto no encontrado</p>
        )
      ) : (
        <p>Este producto no está disponible en este momento.</p>
      )}
    </>
  );
}

export async function getStaticPaths() {
  console.log('Ejecutando getStaticPaths');
  const db = getFirestore(app);
  const collections = ['audio', 'headsets', 'notebooks', 'tablets', 'cooks'];
  const allProducts = [];

  for (const collectionName of collections) {
    const collectionRef = collection(db, collectionName);
    const querySnapshot = await getDocs(collectionRef);

    querySnapshot.forEach((doc) => {
      const productId = doc.id;
      allProducts.push({
        params: { prod: productId },
      });
    });
  }

  return {
    paths: allProducts,
    fallback: false,
  };
}

export async function getStaticProps({ params }) {
  const { prod } = params;
  const db = getFirestore(app);
  const collections = ['audio', 'headsets', 'notebooks', 'tablets', 'cooks'];
  let productData = null;

  for (const collectionName of collections) {
    const productRef = doc(db, collectionName, prod);

    try {
      const productDoc = await getDoc(productRef);
      if (productDoc.exists()) {
        productData = productDoc.data();
        break;
      }
    } catch (error) {
      console.error('Error al obtener el producto:', error);
    }
  }

  return {
    props: {
      productData,
      isProductAvailable: productData && productData.published,
    },
    revalidate: 2 * 60, // esto es para que se actualice cada 2 minutos
  };
}
