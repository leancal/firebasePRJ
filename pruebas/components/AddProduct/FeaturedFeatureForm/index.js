import React, { useState, useEffect } from 'react';
import { Form, Button } from 'react-bootstrap';
import CloseIcon from '@mui/icons-material/Close';
import { doc, getDoc, setDoc, addDoc, collection, getDocs } from 'firebase/firestore';
import app from '../../../firebase';
import { getFirestore } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';


const db = getFirestore(app)
const featuredFeaturesCollection = collection(db, 'featuredFeatures');

const FeaturedFeaturesForm = ({ handleSubmit, handleFeaturedFeatureChange, setSelectedFeaturedFeatures, selectedFeaturedFeatures }
) => {
    //const [selectedFeaturedFeatures, setSelectedFeaturedFeatures] = useState([]);
    const [newFeaturedFeatureImage, setNewFeaturedFeatureImage] = useState(null);

    const [newFeaturedFeatureId, setNewFeaturedFeatureId] = useState('');
    const [newFeaturedFeatureName, setNewFeaturedFeatureName] = useState('');
    const [newFeaturedFeatureDesc, setNewFeaturedFeatureDesc] = useState('');
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

    const handleAddNewFeaturedFeature = async () => {
        // Validar que se hayan ingresado valores
        if (newFeaturedFeatureId && newFeaturedFeatureName && newFeaturedFeatureDesc && newFeaturedFeatureImage) {
            try {
                // Construir la referencia al documento con el nombre proporcionado
                const docRef = doc(db, 'featuredFeatures', newFeaturedFeatureId);

                // Subir la imagen SVG a Firebase Storage
                const storageRef = ref(storage, '/featuredFeaturesImg');
                const imageRef = ref(storageRef, `${newFeaturedFeatureId}.svg`);
                await uploadBytes(imageRef, newFeaturedFeatureImage);

                // Obtener la URL de descarga de la imagen
                const imageUrl = await getDownloadURL(imageRef);

                // Agregar el nuevo featuredFeature a la colección "featuredFeatures"
                await setDoc(docRef, {
                    id: newFeaturedFeatureId,
                    name: newFeaturedFeatureName,
                    desc: newFeaturedFeatureDesc,
                    imageUrl: imageUrl, // Agregar la URL de la imagen al documento
                });

                console.log('Document written with ID: ', newFeaturedFeatureId);
            } catch (error) {
                console.error('Error adding document: ', error);
            }

            // Limpiar los campos después de agregar
            setNewFeaturedFeatureId('');
            setNewFeaturedFeatureName('');
            setNewFeaturedFeatureDesc('');
            setNewFeaturedFeatureImage(null); // Limpiar el estado de la imagen
        } else {
            // Manejar el caso en que no se hayan ingresado valores
            console.log('Ingresa el ID, el nombre, la descripción y la imagen del nuevo featuredFeature.');
        }

        // Realizar una nueva consulta para obtener la lista actualizada de featuredFeatures
        const querySnapshot = await getDocs(featuredFeaturesCollection);
        const updatedFeaturedFeatures = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));

        // Actualizar el estado con la lista actualizada
        setDbFeaturedFeatures(updatedFeaturedFeatures);
    };


    const storage = getStorage();

    // const handleFeaturedFeatureChange = (e) => {
    //     const { value } = e.target;
    //     setSelectedFeaturedFeatures((prevSelected) => {
    //         if (prevSelected.includes(value)) {
    //             // Si ya está seleccionado, quitarlo
    //             return prevSelected.filter((feature) => feature !== value);
    //         } else {
    //             // Si no está seleccionado, agregarlo
    //             return [...prevSelected, value];
    //         }
    //     });
    // };
    const handleRemoveFeaturedFeature = (featureId) => {
        setSelectedFeaturedFeatures((prevSelected) =>
            prevSelected.filter((feature) => feature !== featureId)
        );
    };

    return (
        <Form.Group controlId="featuredFeature">
            <Form.Group className='nice-form-group' controlId="newFeaturedFeatureId">
                <Form.Label>ID de la nueva característica (solo números)</Form.Label>
                <Form.Control
                    type="text"
                    name="newFeaturedFeatureId"
                    value={newFeaturedFeatureId}
                    onChange={(e) => setNewFeaturedFeatureId(e.target.value.replace(/\D/, ''))}
                />

                <Form.Label>Nombre de la nueva característica</Form.Label>
                <Form.Control
                    type="text"
                    name="newFeaturedFeatureName"
                    value={newFeaturedFeatureName}
                    onChange={(e) => setNewFeaturedFeatureName(e.target.value)}
                />

                <Form.Label>Descripción de la nueva característica</Form.Label>
                <Form.Control
                    as="textarea"
                    rows={3}
                    name="newFeaturedFeatureDesc"
                    value={newFeaturedFeatureDesc}
                    onChange={(e) => setNewFeaturedFeatureDesc(e.target.value)}
                />
                <Form.Label>Imagen de la nueva característica destacada (SVG)</Form.Label>
                <Form.Control
                    style={{ color: 'white' }}
                    type="file"
                    accept=".svg"
                    name="newFeaturedFeatureImage"
                    onChange={(e) => setNewFeaturedFeatureImage(e.target.files[0])}
                />
                <Form.Label>
                    <Button variant="primary" className="app-content-headerButton" onClick={handleAddNewFeaturedFeature} style={{ marginTop: '20px', }}>
                        Agregar nueva característica destacada
                    </Button>
                </Form.Label>
            </Form.Group>
            <Form.Group className='checkForm' controlId="featuredFeatures">
                <Form.Label></Form.Label>
                {dbFeaturedFeatures.map((fFeature) => (
                    <Form.Check
                        key={`${fFeature.id} - ${fFeature.name}`}
                        type="checkbox"
                        label={`${fFeature.id} - ${fFeature.name}`}
                        name="featuredFeatures"
                        value={fFeature.id}
                        onChange={handleFeaturedFeatureChange}
                        checked={selectedFeaturedFeatures.includes(fFeature.id)}
                    />
                ))}
            </Form.Group>

            {selectedFeaturedFeatures.map((selectedFeatureId) => {
                const selectedFeature = dbFeaturedFeatures.find((feature) => feature.id === selectedFeatureId);

                return (
                    <div key={selectedFeatureId} className="featuresSelected">
                        <button
                            variant="danger"
                            className="app-content-headerButton"
                            type="button"
                            onClick={() => handleRemoveFeaturedFeature(selectedFeatureId)}
                        >
                            <CloseIcon fontSize="" />
                        </button>
                        <div style={{ display: 'flex' }}>
                            {selectedFeature.imageUrl && (
                                <div>
                                    <img src={selectedFeature.imageUrl} alt={`Image for ${selectedFeatureId}`} style={{ width: '77px', height: '77px', background: 'white', borderRadius: '10px' }} />
                                </div>
                            )}
                            <div>
                                <div>ID: {selectedFeatureId}</div>
                                <div>Nombre: {selectedFeature.name}</div>
                                <div>Descripción: {selectedFeature.desc}</div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </Form.Group>
    );
};

export default FeaturedFeaturesForm;
