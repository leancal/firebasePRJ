import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import Head from 'next/head';
import Image from 'next/image';
import { SvgIcon } from '@mui/material'

export default function ProductFeatures({ prod }) {
  const [activeFeature, setActiveFeature] = useState(null);
  const [featuresFeatured, setFeaturesFeatured] = useState([]);

  useEffect(() => {
    const fetchFeaturesFeatured = async () => {
      try {
        const featuresSnapshot = await getDocs(collection(db, 'featuredFeatures'));
        const featuresData = featuresSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log('Datos obtenidos de Firebase (featuredFeatures):', featuresData);
        setFeaturesFeatured(featuresData);
        if (featuresData.length > 0) {
          setActiveFeature(featuresData[0].id);
        }
      } catch (error) {
        console.error('Error al obtener datos de featuredFeatures:', error);
      }
    };

    fetchFeaturesFeatured();
  }, []);

  const handleFeatureClick = (featureId) => {
    setActiveFeature(featureId);
  };

  // Filtra las características destacadas para mostrar solo las asociadas al producto actual
  const prodFeatures = featuresFeatured.filter(feature => prod.featuredFeatures.some(prodFeature => prodFeature.id === feature.id));

  const activeFeatObject = prodFeatures.find(feature => feature.id === activeFeature);

  return (
    <section className='product-features' id='product-features'>
      <a className="anchor" id="product-features-anchor"></a>
      <Head>
        <meta name="viewport" content="width=device-width, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no" key="no-scale" />
      </Head>
      <div className='left'>
        <p>Seleccioná una característica</p>
        <div className='icons'>
          {prodFeatures.map((feature) => (
            <div className='button-wrapper' key={feature.id}>
              {console.log('Current Feature:', feature)}

              <button className={activeFeature == feature.id ? 'active' : undefined} onClick={() => handleFeatureClick(feature.id)}>
                <div className='background'>
                  <img src={feature.imageUrl} alt={feature.name} width={40} height={40} />
                </div>
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className='right'>
        {activeFeatObject && (
          <div className='icon-shadow'>
            <img src={activeFeatObject.imageUrl} alt={activeFeatObject.name} width={400} height={400} />
          </div>
        )}
        <div className='content'>
          {activeFeatObject ? (
            <>
              <img
                src={activeFeatObject.imageUrl}
                alt={activeFeatObject.name}
                width={140}
                height={140}
                style={{ filter: `brightness(0) invert(1) sepia(100%) saturate(10000%) hue-rotate(0deg)`, borderColor: '#e02327' }}
              />
              <div className='text'>
                <h2>{activeFeatObject.name && activeFeatObject.name.toUpperCase()}</h2>
                <p>{activeFeatObject.desc ? activeFeatObject.desc : activeFeatObject.name}</p>
              </div>
            </>
          ) : (
            <h2>Hacé click en uno de los iconos de la izquierda</h2>
          )}
        </div>



      </div>
    </section>
  );
}
