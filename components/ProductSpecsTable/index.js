import { Visibility, Check, Close, OpenInNew, QuestionMark, Download, LocalGroceryStore, ArrowDropDown } from '@mui/icons-material';
import AccordionItem from '../AccordionItem';
import LaunchIcon from '@mui/icons-material/Launch';
import { collection, getDocs, where, query } from 'firebase/firestore';
import { db } from '../../firebase';
import IncludesItem from '../IncludesItem';
import ProductCard from '../ProductCard';
import React, { useEffect, useState } from 'react';
import { Image } from 'react-bootstrap';
import Link from 'next/link'

export default function ProductSpecsTable({ prod }) {
  const [firebaseFeatures, setFirebaseFeatures] = useState([]);
  const [includes, setIncludes] = useState([]);
  const [colorProducts, setColorProducts] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch features
        const featuresCollection = collection(db, 'features');
        const featuresSnapshot = await getDocs(featuresCollection);
        const featuresData = featuresSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setFirebaseFeatures(featuresData);

        // Fetch includes
        const includesCollection = collection(db, 'includes');
        const includesSnapshot = await getDocs(includesCollection);
        const includesData = includesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setIncludes(includesData);

        // Fetch color products
        if (prod.colors && prod.colors.length > 0) {
          const colorProductsData = await Promise.all(prod.colors.map(async colorSku => {
            try {
              const productsCollection = collection(db, 'headsets');
              const q = query(productsCollection, where('sku', '==', colorSku));
              const querySnapshot = await getDocs(q);

              if (!querySnapshot.empty) {
                const matchingProduct = querySnapshot.docs[0].data();
                const firstImage = matchingProduct.imgs && matchingProduct.imgs.length > 0
                  ? matchingProduct.imgs[0]
                  : null;

                return {
                  sku: matchingProduct.sku || colorSku, // Use product SKU if available, otherwise use color SKU
                  img: firstImage || null,
                };
              } else {
                console.warn(`No product found for color SKU: ${colorSku}`);
                return null;
              }
            } catch (error) {
              console.error(`Error fetching product for color SKU: ${colorSku}`, error);
              return null;
            }
          }));

          console.log('Color Products:', colorProductsData);
          setColorProducts(colorProductsData.filter(product => product !== null)); // Remove null values
        } else {
          console.warn('No color SKUs provided');
        }
      } catch (error) {
        console.error('Error fetching data from Firebase:', error);
      }
    };

    fetchData();
  }, [prod.colors]);

  const prodFeatures = [];
  firebaseFeatures.forEach(firebaseFeature => {
    const prodFeature = prod.features?.find(prodFeat => prodFeat.id === firebaseFeature.id);
    if (prodFeature) {
      prodFeatures.push({ ...prodFeature, name: firebaseFeature.name });
    }
  });


  const prodIncludes = [];
  prod.includes.forEach(e => {
    prodIncludes.push(includes.find(f => e == f.id))
  })
  return (
    <section id='prod-specs'>
      <AccordionItem classes='prod-specs-table' name='Especificaciones'>
        <div className='table-cell-container'>
          <div className='table-cell sku'>
            <div className='title'>{prod.sku}</div>
          </div>
          {prod.featuresSections && prod.featuresSections.map((e, i) => (
            <React.Fragment key={i}>
              <div className='table-cell sku'>
                <div className='title'>{e.title}</div>
              </div>
              {e.items.map((f, i) => (
                <div className='table-cell' key={i}>
                  <div className='title'>{f.name}</div>
                  <p className='desc'>{f.value}</p>
                </div>
              ))}
            </React.Fragment>
          ))}
          {!prod.featuresSections && prodFeatures.map((e, i) => (
            <div className='table-cell' key={i}>
              <div className='title'>{e.name}</div>
              <p className='desc'>{e.value}</p>
            </div>
          ))}
        </div>
      </AccordionItem>
      <AccordionItem classes='prod-specs-table' name='Incluye'>
        <div className='includes-container'>
          {prodIncludes.map((e, i) => <IncludesItem item={e} key={i} />)}
        </div>
        {prod.certNo && <p><small>*Número de certificado de Seguridad Eléctrica: {prod.certNo}</small></p>}
      </AccordionItem>
      <AccordionItem classes='prod-specs-table' name='Descargas'>
        <div className='download-items'>
          <a href={prod.downloads} target='_blank' rel="noreferrer">
            <LaunchIcon />
            {prod.noManual ? 'Accedé a las imágenes y ficha del producto' : 'Accedé al manual, imágenes y ficha del producto'}
          </a>
        </div>
      </AccordionItem>
      {prod.colors && prod.colors.length > 0 && (
        <AccordionItem classes='prod-specs-table variants' name='Colores' open>
          <div className="wrapper">
            {colorProducts.map((product, i) => (
              <div key={i} className="color-item">

                {product.img && (
                  <Link href={product.sku || '#'}>
                    <div className='image product-card'>
                      <Image width='150' height='150' src={product.img} alt={`Imagen del color ${product.sku}`} placeholder='blur' blurDataURL='/ph.png' priority />
                      <div className='texts'>
                        {product.sku && (
                          <p className=''>{`${product.sku}`}</p>
                        )}
                      </div>

                    </div>
                  </Link>
                )}

              </div>
            ))}
          </div>
        </AccordionItem>
      )}
      {prod.variants && prod.variants.length > 0 && (
        <AccordionItem classes='prod-specs-table variants' name='Generaciones' open>
          <div className="wrapper">
            {prod.variants.map((e, i) => (
              <ProductCard key={i} sku={e} showName showSku showGen showTags showViewing={e == prod.sku} />
            ))}
          </div>
        </AccordionItem>
      )}
    </section>
  )
}