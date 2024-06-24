// components/BannerForm.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../utils/AuthContext';
import { Button, Form } from 'react-bootstrap';
import { doc, getDoc, setDoc, addDoc, collection, getDocs } from 'firebase/firestore';
import app from '../../../firebase';
import { getFirestore } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import Admin from '../../../pages/admin';


const db = getFirestore(app)
const featuredFeaturesCollection = collection(db, 'featuredFeatures');

const BannerForm = () => {
    const { currentUser, setCurrentUser } = useAuth();
    const [showBannerAddedAlert, setShowBannerAddedAlert] = useState(false);
    const [dbFeaturedFeatures, setDbFeaturedFeatures] = useState([]);
    useEffect(() => {
        const fetchFeaturedFeatures = async () => {
            try {
                const featuredFeaturesRef = doc(db, 'featuredFeatures', 'featuredFeaturesDocument');
                const featuredFeaturesSnapshot = await getDoc(featuredFeaturesRef);

                if (featuredFeaturesSnapshot.exists()) {
                    const data = featuredFeaturesSnapshot.data();
                    setDbFeaturedFeatures(data.features || []);
                }
            } catch (error) {
                console.error('Error fetching featuredFeatures:', error);
            }
            const querySnapshot = await getDocs(featuredFeaturesCollection);
            const updatedFeaturedFeatures = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));

            // Actualizar el estado con la lista actualizada
            setDbFeaturedFeatures(updatedFeaturedFeatures);

        };

        fetchFeaturedFeatures();
    }, []);
    const [dbFeatures, setDbFeatures] = useState([]);
    useEffect(() => {
        const fetchFeatures = async () => {
            try {
                const featuresCollection = collection(db, 'features');
                const querySnapshot = await getDocs(featuresCollection);
                const features = querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setDbFeatures(features);
            } catch (error) {
                console.error('Error fetching features:', error);
            }
        };

        fetchFeatures();
    }, []);
    const [allIncludes, setAllIncludes] = useState([]);
    useEffect(() => {
        const fetchIncludes = async () => {
            try {
                const includesCollection = collection(db, 'includes');
                const includesSnapshot = await getDocs(includesCollection);
                const includesData = includesSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
                setAllIncludes(includesData);
            } catch (error) {
                console.error('Error fetching includes:', error);
            }
        };

        fetchIncludes();
    }, []);

    const [product, setProduct] = useState({
        name: '',
        sku: '',
        link: '',
        categories: '',
        imgs: [],
        img360: '',
        selected360Images: [],
        gen: '',
        banners: [],
        shortDesc: '',
        longDesc: '',
        buyLink: '',
        featuredFeatures: [], // Cambia a un arreglo para almacenar múltiples características destacadas
        customFeaturedFeatures: [],  // Un objeto para almacenar descripciones personalizadas por característica destacada
        features: [],
        includes: [],
        noManual: '',
        downloads: '',
        colors: [],
        selectedCollection: '', // Estado para la colección seleccionada
        subCollection: '', // Estado para la subcolección seleccionada
        published: true,
        linea: '',
    });
    const [bannerFields, setBannerFields] = useState({
        title: '',
        img: '',
        desc: '',
    });


    // Si el usuario no está autenticado, redirige a la página de inicio de sesión
    if (!currentUser) {
        return <Admin />;
    }

    const storage = getStorage();


    const handleBannerImageUpload = async (e) => {
        const { files } = e.target;
        const previews = [];

        if (files.length > 0) {
            const file = files[0];
            const storageRef = ref(storage, '/bannerImages'); // Cambia '/bannerImages' al directorio en tu Storage donde deseas almacenar las imágenes de banner

            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const imageRef = ref(storageRef, file.name);
                try {
                    // Cargar la imagen del banner al almacenamiento de Firebase
                    await uploadBytes(imageRef, file);

                    // Obtener la URL de descarga de la imagen del banner
                    const imageUrl = await getDownloadURL(imageRef);

                    // Actualizar el estado del campo de imagen del banner
                    setBannerFields({
                        ...bannerFields,
                        img: imageUrl,
                    });
                    previews.push(imageUrl);
                } catch (error) {
                    console.error('Error al cargar la imagen del banner: ', error);
                }
            }
        }
    };

    const handleAddBanner = () => {
        if (bannerFields.title.trim() !== '') {
            // Agregar el banner al estado de banners en el producto
            setProduct((prevState) => ({
                ...prevState,
                banners: [
                    ...prevState.banners,
                    { ...bannerFields },
                ],
            }));

            // Restablecer los campos de banner después de agregarlo
            setBannerFields({
                title: '',
                img: '',
                desc: '',
            });

            // Mostrar la alerta de banner agregado
            setShowBannerAddedAlert(true);

            // Ocultar la alerta después de unos segundos (opcional)
            setTimeout(() => {
                setShowBannerAddedAlert(false);
            }, 3000); // Cambia la duración deseada en milisegundos
        }
    };

    return (
        <Form>
            <Form.Group controlId="bannerTitle" className='nice-form-group'>
                <Form.Label>Título del Banner</Form.Label>
                <Form.Control
                    type="text"
                    name="bannerTitle"
                    value={bannerFields.title}
                    onChange={(e) => setBannerFields({ ...bannerFields, title: e.target.value })}
                />
            </Form.Group>

            <Form.Group controlId="bannerImage" className='nice-form-group'>
                <Form.Label>Imagen del Banner</Form.Label>
                <Form.Control
                    className='form-title'
                    type="file"
                    name="bannerImage"
                    onChange={handleBannerImageUpload}
                    accept="image/*" // Esto permite solo archivos de imagen
                />
            </Form.Group>
            {bannerFields.img && (
                <div className="banner-image-preview">
                    <img className="image-previews-banner" src={bannerFields.img} alt="" />
                </div>
            )}

            <Form.Group controlId="bannerDesc" className='nice-form-group'>
                <Form.Label>Descripción del Banner</Form.Label>
                <Form.Control
                    as="textarea"
                    name="bannerDesc"
                    value={bannerFields.desc}
                    onChange={(e) => setBannerFields({ ...bannerFields, desc: e.target.value })}
                />
            </Form.Group>

            <Button variant="danger" className="app-content-headerButton" onClick={handleAddBanner}>
                Agregar Banner
            </Button>

            {showBannerAddedAlert && (
                <div className="alert alert-success form-title">
                    Banner agregado con éxito.
                </div>
            )}
        </Form>
    );
};

export default BannerForm;
