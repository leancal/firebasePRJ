import { getFirestore, collection, getDocs } from "firebase/firestore";
import app from "../firebase"; // Importa tu instancia de Firebase aquí

export const getProductsFromFirestore = async () => {
    const db = getFirestore(app); // Reemplaza "app" con tu instancia de Firebase
    const productsCollection = collection(db, "headsets"); // Reemplaza con el nombre de tu colección

    try {
        const querySnapshot = await getDocs(productsCollection);
        const products = [];

        querySnapshot.forEach((doc) => {
            const productData = doc.data();
            products.push(productData);
        });

        return products;
    } catch (error) {
        console.error("Error al obtener productos:", error);
        return [];
    }
};
