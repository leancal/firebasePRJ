import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../utils/AuthContext';
import { Button, Form } from 'react-bootstrap';
import { doc, getDoc, setDoc, addDoc, collection, getDocs } from 'firebase/firestore';
import app from '../../../firebase';
import { getFirestore } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import Admin from '../../../pages/admin';
import { useRouter } from 'next/router';


const db = getFirestore(app)
const featuredFeaturesCollection = collection(db, 'featuredFeatures');

const ProductDataForm = ({ product, setProduct, handleChange }) => {
    const router = useRouter();
    const { currentUser } = useAuth();
    const [colorInput, setColorInput] = useState('');
    const [selected360ImagePreviews, setSelected360ImagePreviews] = useState([]);
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

    if (!currentUser) {
        return <Admin />;
    }

    const storage = getStorage();

    const handleFileUpload = async (e) => {
        const { name, files } = e.target;
        const storageRef = ref(storage, '/images360'); // Cambia '/images' por la carpeta en tu Storage donde deseas almacenar las imágenes 360

        const previews = [];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const imageRef = ref(storageRef, file.name);

            try {
                // Cargar la imagen 360 al almacenamiento de Firebase
                await uploadBytes(imageRef, file);

                // Obtener la URL de descarga de la imagen 360
                const imageUrl = await getDownloadURL(imageRef);

                // Agregar la URL de descarga a la lista de vistas previas
                previews.push(imageUrl);
            } catch (error) {
                console.error('Error al cargar la imagen 360: ', error);
            }
        }

        // Actualizar la lista de vistas previas
        setSelected360ImagePreviews((prevPreviews) => [...prevPreviews, ...previews]);
    };

    const handleColorInputChange = (e) => {
        setColorInput(e.target.value);
    };

    const handleAddColor = () => {
        if (colorInput.trim() !== '') {
            setProduct({
                ...product,
                colors: [...product.colors, colorInput],
            });
            setColorInput('');
        }
    };

    const handleRemoveColor = (index) => {
        const updatedColors = [...product.colors];
        updatedColors.splice(index, 1);
        setProduct({
            ...product,
            colors: updatedColors,
        });
    };


    return (
        <Form >
            <Form.Group controlId="name" className='nice-form-group'>
                <Form.Label className='form-title'>Nombre del producto</Form.Label>
                <Form.Control
                    type="text"
                    name="name"
                    value={product.name}
                    onChange={handleChange}
                    required
                />
            </Form.Group>
            <Form.Group controlId="sku" className='nice-form-group'>
                <Form.Label className='form-title'>Sku del producto</Form.Label>
                <Form.Control
                    type="text"
                    name="sku"
                    value={product.sku}
                    onChange={handleChange}
                    required
                />
            </Form.Group>
            <Form.Group controlId="link" className='nice-form-group'>
                <Form.Label className='form-title'>Link del producto</Form.Label>
                <Form.Control
                    type="text"
                    name="link"
                    value={product.link}
                    onChange={handleChange}
                    required
                />
            </Form.Group>
            <Form.Group controlId="img360" className='nice-form-group'>
                <Form.Check
                    className='form-title'
                    type="checkbox"
                    label="Sin 360°"
                    name="img360"
                    checked={product.img360}
                    onChange={handleChange}
                />
            </Form.Group>
            {!product.img360 && (
                <Form.Group controlId="fileUpload" className='nice-form-group'>
                    <Form.Label>Cargar Imagenes 360°</Form.Label>
                    <Form.Control
                        className=" form-title"
                        type="file"
                        name="img360"
                        accept="image/*" // Asegúrate de aceptar solo imágenes aquí
                        onChange={handleFileUpload}
                        multiple
                    />
                </Form.Group>
            )}

            {/* Agrega la sección para mostrar las previsualizaciones */}
            <div className="image-360-preview">
                {selected360ImagePreviews.map((imageUrl, index) => (
                    <img
                        key={index}
                        src={imageUrl}
                        alt={`Imagen 360 #${index}`}
                        className="image-previews"
                    />
                ))}
            </div>


            <Form.Group controlId="gen" className='nice-form-group'>
                <Form.Label className='form-title'>Generación del producto</Form.Label>
                <Form.Control
                    type="text"
                    name="gen"
                    value={product.gen}
                    onChange={handleChange}
                    required
                />
            </Form.Group>
            <Form.Group controlId="shortDesc" className='nice-form-group'>
                <Form.Label className='form-title'>Descripción corta</Form.Label>
                <Form.Control
                    type="text"
                    name="shortDesc"
                    value={product.shortDesc}
                    onChange={handleChange}
                    required
                />
            </Form.Group>
            <Form.Group controlId="longDesc" className='nice-form-group'>
                <Form.Label className='form-title'>Descripción larga</Form.Label>
                <Form.Control
                    type="text"
                    name="longDesc"
                    value={product.longDesc}
                    onChange={handleChange}
                    required
                />
            </Form.Group>
            <Form.Group controlId="buyLink" className='nice-form-group'>
                <Form.Label className='form-title'>Link de compra</Form.Label>
                <Form.Control
                    type="text"
                    name="buyLink"
                    value={product.buyLink}
                    onChange={handleChange}
                    required
                />
            </Form.Group>
            <Form.Group controlId="noManual" className='nice-form-group'>
                <Form.Check
                    className='form-title'
                    type="checkbox"
                    label="No Manual"
                    name="noManual"
                    checked={product.noManual}
                    onChange={handleChange}
                />
            </Form.Group>
            <Form.Group controlId="downloads" className='nice-form-group'>
                <Form.Label className='form-title'>Descargas(Link de Drive)</Form.Label>
                <Form.Control
                    type="text"
                    name="downloads"
                    value={product.downloads}
                    onChange={handleChange}
                    required
                />
            </Form.Group>

            <Form.Group controlId="colors" className='nice-form-group'>
                <Form.Label className='form-title '>Colors</Form.Label>
                <Form.Control
                    className='add-color'
                    type="text"
                    name="colorInput"
                    placeholder="Enter color"
                    value={colorInput}
                    onChange={handleColorInputChange}
                />
                <Button
                    variant="danger" className="app-content-headerButton "
                    onClick={handleAddColor}
                >
                    Add Color
                </Button>
            </Form.Group>
            {product.colors.map((color, index) => (
                <div key={index} className="colorItem">
                    <span className='form-title'>{color}</span>
                    <Button
                        variant="danger" className="app-content-headerButton"
                        onClick={() => handleRemoveColor(index)}
                    >
                        Remove
                    </Button>
                </div>
            ))}
            <Form.Group controlId="published" className='nice-form-group'>
                <Form.Check
                    //className='form-title'
                    style={{ fontSize: '20px', color: 'white' }}
                    type="checkbox"
                    label="Publicar producto?"
                    name="published"
                    checked={product.published}
                    onChange={handleChange}
                />
            </Form.Group>

        </Form>
    )

}

export default ProductDataForm