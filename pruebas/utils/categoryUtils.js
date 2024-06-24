// categoryUtils.js

import { lvTwoCat } from "../content/categories";
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import app from '../firebase';

export async function getStaticProps({ params }) {
    const { cat } = params;
    const category = lvTwoCat.find((e) => e.route === `/categorias/${cat}` || e.route === `/categorias/${cat}/`);

    if (!category) {
        return {
            notFound: true,
        };
    }

    const db = getFirestore(app);
    const productsCollection = collection(db, 'audio'); // Reemplaza 'audio' con el nombre real de tu colección en Firebase

    const querySnapshot = await getDocs(productsCollection);

    const prod = [];
    querySnapshot.forEach((doc) => {
        const data = doc.data();
        console.log('Firebase Product Data:', data);
        prod.push(data);
    });

    return {
        props: { lvTwoCat, category, prod },
    };
}

export async function getStaticPaths() {
    const paths = lvTwoCat.map((category) => ({
        params: { cat: category.route.replace('/categorias/', '') },
    }));

    return {
        paths,
        fallback: false,
    };
}
