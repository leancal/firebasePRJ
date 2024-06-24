import React, { useState, useEffect } from 'react';
import ProductCard from '../ProductCard';
import { db } from '../../firebase';

export default function Discontinuous() {
  const [discontinuedProducts, setDiscontinuedProducts] = useState([]);

  useEffect(() => {
    const fetchDiscontinuedProducts = async () => {
      try {
        // Hacer la consulta a Firebase para obtener los productos descontinuados
        const discontinuedProductsData = await Promise.all(
          ['headsets', 'audio', 'tablets', 'notebooks', 'cooks'].map(async (collection) => {
            const collectionRef = db.collection(collection);
            const snapshot = await collectionRef.where('secondCategories', '==', "110").get();
            return snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
          })
        );

        // Mapear los datos de Firebase a un formato que pueda ser utilizado por tu componente
        const formattedDiscontinuedProducts = discontinuedProductsData.flat();

        setDiscontinuedProducts(formattedDiscontinuedProducts);
      } catch (error) {
        console.error('Error fetching discontinued products:', error);
      }
    };

    fetchDiscontinuedProducts();
  }, []);

  return (
    <section className="discontinuos">
      <div className="title">
        <h1>Discontinuos</h1>
        <h2>Productos que ya no se distribuyen comercialmente</h2>
      </div>
      <div className="wrapper">
        {discontinuedProducts.map((product, index) => (
          <ProductCard
            key={index}
            product={product}
            showName
            showSku
            showDownload
          />
        ))}
      </div>
    </section>
  );
}
