import { collection, getDocs } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';
import { app } from '../firebase'; // Importa la instancia de Firebase inicializada en firebase.js

// Función para obtener las colecciones desde Firebase Firestore
async function getCollections() {
    const db = getFirestore(app); // Obtén una referencia a Firestore desde la instancia de Firebase
    const collectionNames = ['audio', 'headsets', 'notebooks', 'tablets', 'cooks']; // Nombres de las colecciones que deseas obtener

    const collections = [];

    try {
        for (const collectionName of collectionNames) {
            const querySnapshot = await getDocs(collection(db, collectionName));

            querySnapshot.forEach((doc) => {
                collections.push(doc.data()); // Agrega los datos de cada documento de la colección a la matriz 'collections'
            });
        }

        return collections;
    } catch (error) {
        console.error('Error al obtener colecciones desde Firestore: ', error);
        return [];
    }
}

export { getCollections };
