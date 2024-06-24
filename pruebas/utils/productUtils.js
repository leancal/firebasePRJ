import { getFirestore, doc, collection, getDocs, getDoc } from 'firebase/firestore';
import app from '../firebase';

export async function getStaticPaths() {
    console.log('Ejecutando getStaticPaths'); // Agregar esta línea

    const db = getFirestore(app);
    const collections = ['audio', 'headsets', 'notebooks', 'tablets', 'cooks'];
    const allProducts = [];

    for (const collectionName of collections) {
        const collectionRef = collection(db, collectionName);
        const querySnapshot = await getDocs(collectionRef);

        querySnapshot.forEach((doc) => {
            const productId = doc.id;
            console.log(`Product ID: ${productId}`);
            allProducts.push({
                params: { prod: productId },
            });
        });
    }

    console.log('getStaticPaths ejecutado con allProducts:', allProducts); // Agregar esta línea

    return {
        paths: allProducts,
        fallback: false,
    };
}


export async function getStaticProps({ params }) {
    const productId = doc.id;
    console.log(`Product ID: ${productId}`);

    console.log('Ejecutando getStaticProps'); // Agregar esta línea

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

    console.log('getStaticProps ejecutado con productData:', productData); // Agregar esta línea

    return {
        props: {
            productData,
        },
        revalidate: 2 * 60, // esto es para que se actualice cada 2 minutos
    };
}

