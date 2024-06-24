import React, { useState, useEffect } from 'react';
import { useAuth } from '../../utils/AuthContext';
import { Button, Form } from 'react-bootstrap';
import { doc, getDoc, setDoc, addDoc, collection, getDocs } from 'firebase/firestore';
import app from '../../firebase';
import { getFirestore } from 'firebase/firestore';
import { lvOneCat, lvTwoCat, lvThreeCat } from '../../content/categories';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import Alert from 'react-bootstrap/Alert';
import Admin from '../../pages/admin';
import { useRouter } from 'next/router';
import ProductDataForm from './ProductDataForm';
import BannerForm from './BannerForm';
import IncludesForm from './IncludesForm';
import FeaturesForm from './FeaturesForm';
import FeaturedFeaturesForm from './FeaturedFeatureForm';
import lineas from '../../content/lineas';


const db = getFirestore(app)
const featuredFeaturesCollection = collection(db, 'featuredFeatures');

const AddProduct = () => {
  const router = useRouter();
  const { currentUser } = useAuth();
  const [secondCategories, setSecondCategories] = useState([]);
  const [thirdsCategories, setThirdsCategories] = useState([]);
  const [selectedFeaturedFeatures, setSelectedFeaturedFeatures] = useState([]);
  const [selectedFeatures, setSelectedFeatures] = useState([]);
  const [selectedFeaturesValues, setSelectedFeaturesValues] = useState({});
  const [featureValueInputs, setFeatureValueInputs] = useState({});
  const [colorInput, setColorInput] = useState('');
  const [selectedImagePreviews, setSelectedImagePreviews] = useState([]);
  const [showBannerAddedAlert, setShowBannerAddedAlert] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [showBannerForm, setShowBannerForm] = useState(false);
  const [showCollectionForm, setShowCollectionForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showImgForm, setShowImgForm] = useState(false);
  const [showFeaturedFeatureForm, setShowFeaturedFeatureForm] = useState(false);
  const [newFeaturedFeatureImage, setNewFeaturedFeatureImage] = useState(null);
  const [showFeaturesForm, setShowFeaturesForm] = useState(false);
  const [showIncludesForm, setShowIncludesForm] = useState(false);
  const [showProductDataForm, setShowProductDataForm] = useState(true);
  const [showFileUploadButton, setShowFileUploadButton] = useState(false);
  const [selected360ImagePreviews, setSelected360ImagePreviews] = useState([]);
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
  const [newFeatureId, setNewFeatureId] = useState('');
  const [newFeatureName, setNewFeatureName] = useState('');
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
  const [selectedIncludes, setSelectedIncludes] = useState([]);
  const [allIncludes, setAllIncludes] = useState([]);
  const [newIncludeId, setNewIncludeId] = useState('');
  const [newIncludeName, setNewIncludeName] = useState('');
  const [imageFile, setImageFile] = useState(null);
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
  const [showLineas, setShowLineas] = useState(false);


  // Si el usuario no está autenticado, redirige a la página de inicio de sesión
  if (!currentUser) {
    return <Admin />;
  }



  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === 'checkbox') {
      // Si el campo es un checkbox, actualiza el estado según si está marcado o no
      setProduct((prevProduct) => ({
        ...prevProduct,
        [name]: checked,
      }));

      // Actualiza el estado showFileUploadButton
      setShowFileUploadButton(!checked);
    } else if (name === 'categories') {
      // Si el campo es 'categories', actualiza directamente el valor como una cadena
      setProduct((prevProduct) => ({
        ...prevProduct,
        categories: value, // Almacena el valor de la categoría como una cadena
        // Asegúrate de restablecer la propiedad 'linea' cuando cambias la categoría
        linea: '',
      }));
    } else if (name === 'linea') {
      // Si el campo es 'linea', actualiza directamente el valor como una cadena
      setProduct((prevProduct) => ({
        ...prevProduct,
        linea: value,
      }));
    } else {
      // Para otros campos, maneja como antes
      setProduct((prevProduct) => ({
        ...prevProduct,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const db = getFirestore();

    const selectedFeaturesArr = Object.keys(selectedFeaturesValues).map((featureId) => ({
      id: featureId,
      value: selectedFeaturesValues[featureId],
    }));

    // Nuevo código para agregar los valores de las características a la estructura de datos
    const features = selectedFeatures.map((selectedFeature) => ({
      id: selectedFeature,
      value: featureValueInputs[selectedFeature] || '',
    }));

    // Verifica si el nombre del documento ya existe antes de agregarlo
    if (await isDocumentNameUnique(product.sku)) {
      setShowAlert(false);
      const db = getFirestore();

      // Utiliza el valor del campo "sku" como el ID del documento
      const sku = product.sku;

      try {
        const docRef = doc(db, product.selectedCollection, sku);

        // Cargar la imagen 360 en Firebase solo si se seleccionó una
        if (product.img360) {
          const storageRef = ref(storage, '/images360'); // Cambia 'images' por 'images360' si aún no lo has hecho
          const imageRef = ref(storageRef, `360_${product.sku}.jpg`); // Establece el nombre de archivo deseado aquí

          // Cargar la imagen al almacenamiento de Firebase
          await uploadBytes(imageRef, product.img360);

          // Obtener la URL de descarga de la imagen
          const imageUrl = await getDownloadURL(imageRef);

          // Actualizar la URL de la imagen 360 en el estado o donde sea necesario
          setProduct((prevState) => ({
            ...prevState,
            img360: imageUrl,
          }));
        }
        const selectedFeaturedFeaturesData = selectedFeaturedFeatures.map(id => {
          const featureData = dbFeaturedFeatures.find(feature => feature.id === id);
          return {
            id: featureData.id,
            name: featureData.name,
            desc: featureData.desc,
            imageUrl: featureData.imageUrl,
            // Otros campos si los tienes
          };
        });

        // Ahora, guarda los datos del producto en Firebase
        await setDoc(docRef, {
          ...product,
          featuredFeatures: selectedFeaturedFeaturesData,
          features: features,
          includes: selectedIncludes,
          colors: product.colors,
          banners: product.banners,
          published: product.published, // Agrega el campo de publicación
          linea: product.linea,
        });


        console.log('Document written with ID: ', sku);
      } catch (e) {
        console.error('Error adding document: ', e);
      }

      // Restablece el estado del producto después de guardar
      setProduct({
        name: '',
        sku: '',
        link: '',
        categories: '',
        imgs: [],
        img360: '',
        gen: '',
        banners: [],
        shortDesc: '',
        longDesc: '',
        buyLink: '',
        featuredFeatures: [],
        customFeaturedFeatures: [],
        features: [],
        includes: [],
        noManual: false,
        downloads: '',
        colors: [],
        selectedCollection: '',
        subCollection: '',
        published: true,
        linea: '',
      });

      // Recarga la página para borrar los campos del producto anterior
      window.location.reload();
    } else {
      // Muestra la alerta de error
      setShowAlert(true);
      // Muestra un mensaje de error al usuario o maneja la situación de alguna otra manera
      console.log('El nombre del documento ya existe.');
    }
  };

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
  const handleAddNewFeature = async () => {
    // Validar que se hayan ingresado valores
    if (newFeatureId && newFeatureName) {
      // Verificar si ya existe una característica con el mismo 'id'
      const existingFeature = dbFeatures.find((feature) => feature.id === newFeatureId);

      if (existingFeature) {
        // Mostrar la alerta si el ID ya existe
        setShowAlert(true);
        return;
      }

      try {
        // Construir la referencia al documento con el mismo ID que se completó en el formulario
        const docRef = doc(db, 'features', newFeatureId);

        // Agregar la nueva característica a la colección "features"
        await setDoc(docRef, {
          id: newFeatureId,
          name: newFeatureName,
          // Puedes agregar más campos según sea necesario
        });

        console.log('Nueva característica agregada con ID:', newFeatureId);
      } catch (error) {
        console.error('Error adding new feature:', error);
      }

      // Limpiar los campos después de agregar
      setNewFeatureId('');
      setNewFeatureName('');
      // Ocultar la alerta después de un éxito
      setShowAlert(false);
    } else {
      // Manejar el caso en que no se hayan ingresado valores
      console.log('Ingresa el ID y el nombre de la nueva característica.');
    }
  };

  // Función para verificar si el nombre del documento ya existe
  async function isDocumentNameUnique(name) {
    const docRef = doc(db, product.selectedCollection, name);
    const docSnap = await getDoc(docRef);
    return !docSnap.exists();
  }

  const storage = getStorage();
  const handleImageUpload = async (e) => {
    const { name, files } = e.target;

    const storageRef = ref(storage, '/images'); // Cambia 'images' por la carpeta en tu Storage donde deseas almacenar las imágenes
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const imageRef = ref(storageRef, file.name);

      try {
        // Cargar la imagen al almacenamiento de Firebase
        await uploadBytes(imageRef, file);

        // Obtener la URL de descarga de la imagen
        const imageUrl = await getDownloadURL(imageRef);

        // Agregar la URL de descarga a la lista de imágenes en el estado
        setProduct((prevState) => ({
          ...prevState,
          imgs: [...prevState.imgs, imageUrl],
        }));
      } catch (error) {
        console.error('Error al cargar la imagen: ', error);
      }
    }

    // Ahora imgs contiene las URL de descarga de las imágenes cargadas
    console.log('URLs de imágenes cargadas: ', product.imgs);
  };

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

  const handleFeaturedFeatureChange = (e) => {
    const { value } = e.target;
    setSelectedFeaturedFeatures((prevSelected) => {
      if (prevSelected.includes(value)) {
        // Si ya está seleccionado, quitarlo
        return prevSelected.filter((feature) => feature !== value);
      } else {
        // Si no está seleccionado, agregarlo
        return [...prevSelected, value];
      }
    });
  };
  const handleRemoveFeaturedFeature = (featureId) => {
    setSelectedFeaturedFeatures((prevSelected) =>
      prevSelected.filter((feature) => feature !== featureId)
    );
  };

  const handleFeaturesChange = (event) => {
    const { value } = event.target;

    setSelectedFeatures((prevSelected) => {
      if (prevSelected.includes(value)) {
        return prevSelected.filter((selected) => selected !== value);
      } else {
        return [...prevSelected, value];
      }
    });

    // Si se selecciona una característica, inicializa su valor en blanco
    setSelectedFeaturesValues((prevValues) => ({
      ...prevValues,
      [value]: '',
    }));
  };

  const handleFeatureValueChange = (e, featureId) => {
    const { value } = e.target;

    setFeatureValueInputs((prevValues) => ({
      ...prevValues,
      [featureId]: value,
    }));
  };

  const handleFirstSelectChange = (e) => {
    const selectedCategory = e.target.value;

    // Actualiza el estado de la primera categoría
    handleChange(e);

    // Filtra las categorías para la segunda barra desplegable basándose en el parent de la primera categoría seleccionada
    const filteredCategories = lvTwoCat.filter((category) => category.parent === Number(selectedCategory));

    // Actualiza el estado de la segunda categoría
    setSecondCategories(filteredCategories);

    // Verifica si la primera categoría seleccionada es 'Audio'
    if (selectedCategory === 'Audio') {
      // Muestra las opciones de la tercera categoría (lineas)
      setShowLineas(true);

      // Establece la primera línea como valor predeterminado
      const defaultLinea = lineas[0].name;

      // Actualiza el estado del producto con la línea seleccionada
      setProduct((prevProduct) => ({
        ...prevProduct,
        linea: defaultLinea,
      }));
    } else {
      // Oculta las opciones de la tercera categoría si no es 'Audio'
      setShowLineas(false);

      // Actualiza el estado del producto sin la línea seleccionada
      setProduct((prevProduct) => ({
        ...prevProduct,
        linea: '',
      }));
    }
  };

  const handleSecondSelectChange = (e) => {
    const selectedSecondCategory = e.target.value;

    // Actualiza el estado de la segunda categoría
    handleChange(e);

    // Filtra las categorías para la tercera barra desplegable basándose en la segunda categoría seleccionada
    const filteredCategories = lvThreeCat.filter((category) => category.parent === Number(selectedSecondCategory));

    // Actualiza el estado de la tercera categoría
    setThirdsCategories(filteredCategories);

    // Verifica si la segunda categoría seleccionada es 'Audio'
    setShowLineas(filteredCategories);
  };

  const handleRemoveFeature = (featureId) => {
    setSelectedFeatures((prevSelected) =>
      prevSelected.filter((feature) => feature !== featureId)
    );
  };

  const handleIncludesChange = (e) => {
    const { value } = e.target;
    setSelectedIncludes((prevSelected) => {
      if (prevSelected.includes(value)) {
        // Si ya está seleccionado, quitarlo
        return prevSelected.filter((include) => include !== value);
      } else {
        // Si no está seleccionado, agregarlo
        return [...prevSelected, value];
      }
    });
  };

  const handleRemoveIncludes = (includeId) => {
    setSelectedIncludes((prevSelected) => prevSelected.filter((include) => include !== includeId));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImageFile(file);
  };

  const handleAddNewInclude = async () => {
    try {
      // Validar que se hayan ingresado valores
      if (newIncludeId && newIncludeName && imageFile) {
        const includesCollection = collection(db, 'includes');

        // Verificar si el ID ya existe
        const existingInclude = allIncludes.find((include) => include.id === newIncludeId);
        if (existingInclude) {
          setShowAlert(true);
          return;
        }

        // Subir la imagen a Firebase Storage
        const storageRef = ref(storage, `includesImg/${newIncludeId}`);
        await uploadBytes(storageRef, imageFile);

        // Obtener la URL de la imagen subida
        const imageUrl = await getDownloadURL(storageRef);

        // Agregar nuevo include a la colección "includes" con el ID y otros datos
        await setDoc(doc(includesCollection, newIncludeId), {
          id: newIncludeId,
          name: newIncludeName,
          img: imageUrl,
        });

        // Limpiar los campos después de agregar
        setNewIncludeId('');
        setNewIncludeName('');
        setImageFile(null);
      } else {
        // Manejar el caso en que no se hayan ingresado valores
        console.log('Ingrese el ID, el nombre y la imagen del nuevo include.');
      }
    } catch (error) {
      console.error('Error adding include:', error);
    }
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
  const handleBack = () => {
    router.push('/admin');
  };

  // Cuando se hace clic en el botón del formulario de Banner
  const handleBannerFormClick = () => {
    setShowBannerForm(true);
    setShowCollectionForm(false); // Oculta el formulario de Colección
    setShowCategoryForm(false);
    setShowImgForm(false);
    setShowFeaturesForm(false);
    setShowFeaturedFeatureForm(false);
    setShowIncludesForm(false);
    setShowProductDataForm(false);
  };

  // Cuando se hace clic en el botón del formulario de Colección
  const handleCollectionFormClick = () => {
    setShowBannerForm(false); // Oculta el formulario de Banner
    setShowCategoryForm(false);
    setShowCollectionForm(true);
    setShowImgForm(false);
    setShowFeaturedFeatureForm(false);
    setShowFeaturesForm(false);
    setShowIncludesForm(false);
    setShowProductDataForm(false);
  };

  const handleCategoryFormClick = () => {
    setShowBannerForm(false); // Oculta el formulario de Banner
    setShowCollectionForm(false); // Oculta el formulario de Colección
    setShowCategoryForm(true);
    setShowImgForm(false);
    setShowFeaturedFeatureForm(false);
    setShowFeaturesForm(false);
    setShowIncludesForm(false);
    setShowProductDataForm(false);
  }

  const handleImgFormClick = () => {
    setShowBannerForm(false); // Oculta el formulario de Banner
    setShowCollectionForm(false); // Oculta el formulario de Colección
    setShowCategoryForm(false);
    setShowImgForm(true);
    setShowFeaturedFeatureForm(false);
    setShowFeaturesForm(false);
    setShowIncludesForm(false);
    setShowProductDataForm(false);
  }

  const handleFeaturedFeaturesFormClick = () => {
    setShowBannerForm(false); // Oculta el formulario de Banner
    setShowCollectionForm(false); // Oculta el formulario de Colección
    setShowCategoryForm(false);
    setShowImgForm(false);
    setShowFeaturedFeatureForm(true);
    setShowFeaturesForm(false);
    setShowIncludesForm(false);
    setShowProductDataForm(false);
  }

  const handleFeaturesFormClick = () => {
    setShowBannerForm(false); // Oculta el formulario de Banner
    setShowCollectionForm(false); // Oculta el formulario de Colección
    setShowCategoryForm(false);
    setShowImgForm(false);
    setShowFeaturedFeatureForm(false);
    setShowFeaturesForm(true);
    setShowIncludesForm(false);
    setShowProductDataForm(false);
  }

  const handleIncludesFormClick = () => {
    setShowBannerForm(false); // Oculta el formulario de Banner
    setShowCollectionForm(false); // Oculta el formulario de Colección
    setShowCategoryForm(false);
    setShowImgForm(false);
    setShowFeaturedFeatureForm(false);
    setShowFeaturesForm(false);
    setShowIncludesForm(true);
    setShowProductDataForm(false);
  }

  const handleProductDataFormClick = () => {
    setShowBannerForm(false); // Oculta el formulario de Banner
    setShowCollectionForm(false); // Oculta el formulario de Colección
    setShowCategoryForm(false);
    setShowImgForm(false);
    setShowFeaturedFeatureForm(false);
    setShowFeaturesForm(false);
    setShowIncludesForm(false);
    setShowProductDataForm(true);
  }

  return (
    <div className="mt-4 p-5 bg-primary text-white rounded center">
      {showAlert && (
        <Alert
          message="El producto ya existe. Por favor, elija un nombre de producto único."
          onClose={() => setShowAlert(false)}
        />
      )}

      <div className="app-container">
        <div className="sidebar">
          <div className="sidebar-header">

          </div>
          <ul className="sidebar-list">
            <li className="sidebar-list-item">
              <a href="#" onClick={handleCollectionFormClick}>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-shopping-bag"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" /></svg>
                <span>Colección</span>
              </a>
            </li>
            <li className="sidebar-list-item">
              <a href="#" onClick={handleCategoryFormClick}>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-shopping-bag"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" /></svg>
                <span>Categoria</span>
              </a>
            </li>
            <li className="sidebar-list-item">
              <a href="#" onClick={handleProductDataFormClick}>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-shopping-bag"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" /></svg>
                <span>Datos de producto</span>
              </a>
            </li>
            <li className="sidebar-list-item">
              <a href="#" onClick={handleBannerFormClick}> {/* Agrega un controlador de clic para mostrar el formulario */}
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-shopping-bag"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" /></svg>
                <span>Banner</span>
              </a>
            </li>

            <li className="sidebar-list-item">
              <a href="#" onClick={handleImgFormClick}>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-shopping-bag"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" /></svg>
                <span>Imagenes</span>
              </a>
            </li>
            <li className="sidebar-list-item">
              <a href="#" onClick={handleFeaturedFeaturesFormClick}>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-shopping-bag"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" /></svg>
                <span>Caracteristicas destacadas</span>
              </a>
            </li>
            <li className="sidebar-list-item">
              <a href="#" onClick={handleFeaturesFormClick}>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-shopping-bag"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" /></svg>
                <span>Caracteristicas</span>
              </a>
            </li>
            <li className="sidebar-list-item">
              <a href="#" onClick={handleIncludesFormClick}>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-shopping-bag"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" /></svg>
                <span>Incluye</span>
              </a>
            </li>
            <li className="sidebar-list-item"> <a >

              <span style={{ color: '#151e2f' }}>I</span>
            </a></li>
            <li className="sidebar-list-item"> <a >

              <span style={{ color: '#151e2f' }}>I</span>
            </a></li>
            <li className="sidebar-list-item"> <a >

              <span style={{ color: '#151e2f' }}>I</span>
            </a></li>
            <li className="sidebar-list-item"> <a >

              <span style={{ color: '#151e2f' }}>I</span>
            </a></li>
            <li className="sidebar-list-item"> <a >

              <span style={{ color: '#151e2f' }}>I</span>
            </a></li>
            <li className="sidebar-list-item"> <a >

              <span style={{ color: '#151e2f' }}>I</span>
            </a></li>
            <li className="sidebar-list-item"> <a >

              <span style={{ color: '#151e2f' }}>I</span>
            </a></li>
            <li className="sidebar-list-item"> <a >

              <span style={{ color: '#151e2f' }}>I</span>
            </a></li>
          </ul>
          <div className="account-info">
            <div className="account-info-picture">

            </div>
            <div className="account-info-name">
              User
              <h4>
                {currentUser
                  ? currentUser.email.split('@')[0] // Obtiene la parte antes del '@'
                  : 'Not logged in'}
              </h4>
            </div>
            <button className="account-info-more">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-more-horizontal"><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" /></svg>
            </button>


          </div>
        </div>
        <div className="app-content" >
          <div className="app-content-header">
            <h1 className="app-content-headerText">Agregar producto</h1>

            <button onClick={handleBack} variant="danger" className="app-content-headerButton">Volver</button>


          </div>

          <div className="app-content-actions">

            {showProductDataForm && (
              <ProductDataForm
                product={product}
                handleChange={handleChange}
                handleFileUpload={handleFileUpload}
                handleImageUpload={handleImageUpload}
                selectedImagePreviews={selectedImagePreviews}
                selected360ImagePreviews={selected360ImagePreviews}
                handleAddColor={handleAddColor}
                colorInput={colorInput}
                handleColorInputChange={handleColorInputChange}
                handleRemoveColor={handleRemoveColor}
                showFileUploadButton={showFileUploadButton}
              />
            )}

            {showBannerForm && (
              <BannerForm
                bannerFields={bannerFields}
                handleBannerImageUpload={handleBannerImageUpload}
                handleAddBanner={handleAddBanner}
                showBannerAddedAlert={showBannerAddedAlert}
                setBannerFields={setBannerFields}
              />
            )}

            {showCollectionForm && (
              <Form>
                <Form.Group controlId="selectedCollection" className='nice-form-group'>
                  <Form.Label>Seleccione una colección:</Form.Label>
                  <Form.Control
                    as="select"
                    name="selectedCollection"
                    value={product.selectedCollection}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Seleccione una colección</option>
                    <option value="audio">Audio</option>
                    <option value="headsets">Headsets</option>
                    <option value="notebooks">Notebooks</option>
                    <option value="tablets">Tablets</option>
                    <option value="cooks">Cooks</option>
                  </Form.Control>
                </Form.Group>
              </Form>
            )}

            {showCategoryForm && (
              <Form>
                <Form.Group controlId="categories" className='nice-form-group'>
                  <Form.Label>Categoría</Form.Label>
                  <Form.Control
                    as="select"
                    name="categories"
                    value={product.categories}
                    onChange={handleFirstSelectChange}
                    required
                  >
                    <option value="">Seleccione una categoría</option>
                    {lvOneCat.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.id ? `id=${category.id}` : ''} {category.name}
                      </option>
                    ))}
                  </Form.Control>
                </Form.Group>
                {secondCategories.length > 0 && (
                  <Form.Group controlId="secondCategories" className='nice-form-group'>
                    <Form.Label>Segunda Categoría</Form.Label>
                    <Form.Control
                      as="select"
                      name="secondCategories"
                      value={product.secondCategory}
                      onChange={handleSecondSelectChange}
                      required
                    >
                      <option value="">Seleccione una categoría</option>
                      {secondCategories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.id ? `id=${category.id}` : ''} {category.name}
                        </option>
                      ))}
                    </Form.Control>
                  </Form.Group>
                )}
                {thirdsCategories.length > 0 && (
                  <Form.Group controlId="thirdsCategories" className='nice-form-group'>
                    <Form.Label>Tercera Categoría</Form.Label>
                    <Form.Control
                      as="select"
                      name="thirdsCategories"
                      value={product.thirdCategory}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Seleccione una categoría</option>
                      {thirdsCategories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.id ? `id=${category.id}` : ''} {category.name}
                        </option>
                      ))}
                    </Form.Control>
                  </Form.Group>
                )}
                {showLineas && product.categories === '1' && (
                  <Form.Group controlId="thirdsCategories" className='nice-form-group'>
                    <Form.Label>Linea</Form.Label>
                    <Form.Control
                      as="select"
                      name="linea"
                      value={product.linea}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Seleccione una linea</option>
                      {lineas.map((linea) => (
                        <option key={linea.name} value={linea.name}>
                          {linea.displayName}
                        </option>
                      ))}
                    </Form.Control>
                  </Form.Group>
                )}



              </Form>
            )}


            {showImgForm && (
              <Form.Group controlId="imgs" className='nice-form-group'>
                <Form.Label>Cargar imágenes</Form.Label>
                <Form.Control
                  className='form-title'
                  type="file"
                  name="imgs"
                  onChange={handleImageUpload}
                  multiple // Para permitir la carga de múltiples imágenes
                />
                <div className='image-preview-container'>
                  {selectedImagePreviews.map((imageUrl, index) => (
                    <img className="image-previews" key={index} src={imageUrl} alt={`Imagen ${index}`} />
                  ))}
                </div>
              </Form.Group>
            )}


            {showFeaturedFeatureForm && (
              <FeaturedFeaturesForm
                newFeaturedFeatureId={newFeaturedFeatureId}
                newFeaturedFeatureName={newFeaturedFeatureName}
                newFeaturedFeatureDesc={newFeaturedFeatureDesc}
                newFeaturedFeatureImage={newFeaturedFeatureImage}
                dbFeaturedFeatures={dbFeaturedFeatures}
                handleAddNewFeaturedFeature={handleAddNewFeaturedFeature}
                handleFeaturedFeatureChange={handleFeaturedFeatureChange}
                selectedFeaturedFeatures={selectedFeaturedFeatures}
                handleRemoveFeaturedFeature={handleRemoveFeaturedFeature}
                setNewFeaturedFeatureId={setNewFeaturedFeatureId}
                setNewFeaturedFeatureName={setNewFeaturedFeatureName}
                setNewFeaturedFeatureDesc={setNewFeaturedFeatureDesc}
                setNewFeaturedFeatureImage={setNewFeaturedFeatureImage}
              />
            )}

            {showFeaturesForm && (
              <FeaturesForm
                newFeatureId={newFeatureId}
                setNewFeatureId={setNewFeatureId}
                newFeatureName={newFeatureName}
                setNewFeatureName={setNewFeatureName}
                dbFeatures={dbFeatures}
                handleAddNewFeature={handleAddNewFeature}
                showAlert={showAlert}
                setShowAlert={setShowAlert}
                handleFeaturesChange={handleFeaturesChange}
                selectedFeatures={selectedFeatures}
                handleRemoveFeature={handleRemoveFeature}
                featureValueInputs={featureValueInputs}
                handleFeatureValueChange={handleFeatureValueChange}
              />
            )}

            {showIncludesForm && (
              < IncludesForm
                newIncludeId={newIncludeId}
                setNewIncludeId={setNewIncludeId}
                newIncludeName={newIncludeName}
                setNewIncludeName={setNewIncludeName}
                allIncludes={allIncludes}
                handleImageChange={handleImageChange}
                handleAddNewInclude={handleAddNewInclude}
                handleIncludesChange={handleIncludesChange}
                selectedIncludes={selectedIncludes}
                handleRemoveIncludes={handleRemoveIncludes}
              />
            )}
          </div>
          <Button onClick={handleSubmit} variant="danger" className="app-content-headerButton">
            Guardar Producto
          </Button>
        </div>
      </div>


    </div>
  );
};

export default AddProduct;
