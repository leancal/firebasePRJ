import React, { useState, useEffect } from 'react';
import { getFirestore, collection, getDocs, doc, updateDoc, getDoc, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject, list, getStorage } from 'firebase/storage';
import { lvOneCat, lvTwoCat } from '../../content/categories';
import Admin from '../../pages/admin';
import { Button, Form } from 'react-bootstrap';
import app, { storage } from '../../firebase';
import CloseIcon from '@mui/icons-material/Close';
import { useRouter } from 'next/router';
import { useAuth } from '../../utils/AuthContext';
import { v4 as uuidv4 } from 'uuid';



const EditProduct = () => {
  const router = useRouter();
  const { currentUser } = useAuth();
  const [allFeatures, setAllFeatures] = useState([]);
  const [selectedFeatures, setSelectedFeatures] = useState([]);
  const [editedFeatureValues, setEditedFeatureValues] = useState({});
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedCollection, setSelectedCollection] = useState('headsets');
  const [categories, setCategories] = useState([]);
  const [product, setProduct] = useState({
    categories: lvOneCat[0]?.id || '',
    secondCategory: '',
    gen: '',
  });
  const [secondCategories, setSecondCategories] = useState([]);
  const [selectedProductImages, setSelectedProductImages] = useState([]);
  const [newProductImages, setNewProductImages] = useState([]);
  const [areNewImagesUploaded, setAreNewImagesUploaded] = useState(false);
  const [isUpdateImagesClicked, setIsUpdateImagesClicked] = useState(false);
  const [showBannerAddedAlert, setShowBannerAddedAlert] = useState(false);
  const [editedBanner, setEditedBanner] = useState({
    title: '',
    img: '',
    desc: '',
  });
  const [showNewBannerForm, setShowNewBannerForm] = useState(false);
  const [selectedBannerIndex, setSelectedBannerIndex] = useState(null);
  const [uniqueUpdatedImages, setUniqueUpdatedImages] = useState([])
  const [showBannerEditedAlert, setShowBannerEditedAlert] = useState(false);
  const [deletedImages, setDeletedImages] = useState([]);
  const [newBanner, setNewBanner] = useState({
    title: '',
    img: '',
    desc: '',
  });
  const [isProductPublished, setIsProductPublished] = useState(true);
  const [isPublished, setIsPublished] = useState(selectedProduct ? selectedProduct.published : true);
  const [searchTerm, setSearchTerm] = useState('');
  const [productIncludesData, setProductIncludesData] = useState([]);
  const [includesData, setIncludesData] = useState([]);
  const [allIncludes, setAllIncludes] = useState([]);
  const [selectedInclude, setSelectedInclude] = useState(null);
  const [selectedFeaturedFeatures, setSelectedFeaturedFeatures] = useState([]);
  const [featuredFeatures, setFeaturedFeatures] = useState([]);
  const [allFeaturedFeaturesList, setAllFeaturedFeaturesList] = useState([]);
  const [selectedFeatureToAdd, setSelectedFeatureToAdd] = useState('');



  useEffect(() => {
    if (selectedProduct) {
      setIsPublished(selectedProduct.published);
    }
  }, [selectedProduct]);

  const handleTogglePublished = () => {
    setIsPublished((prevIsPublished) => !prevIsPublished);
  };
  useEffect(() => {
    // Verificar el estado de publicación del producto
    if (selectedProduct && selectedProduct.published === false) {
      setIsProductPublished(false);
    } else {
      setIsProductPublished(true);
    }
  }, [selectedProduct]);


  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );
  useEffect(() => {
    // Obtener todos los productos desde Firebase Firestore
    const fetchProducts = async () => {
      const db = getFirestore(app);
      const productsCollection = collection(db, selectedCollection || 'headsets');
      const querySnapshot = await getDocs(productsCollection);
      const productsData = [];

      querySnapshot.forEach((docSnapshot) => {
        productsData.push({
          id: docSnapshot.id,
          ...docSnapshot.data(),
        });
      });

      setProducts(productsData);
    };

    fetchProducts();
  }, [selectedCollection]);
  useEffect(() => {
    // Obtener las características desde Firebase Firestore
    const fetchFeatures = async () => {
      const db = getFirestore(app);
      const featuresCollection = collection(db, 'features'); // Reemplaza 'features' con la colección real
      const querySnapshot = await getDocs(featuresCollection);
      const featuresData = [];

      querySnapshot.forEach((docSnapshot) => {
        featuresData.push({
          id: docSnapshot.id,
          ...docSnapshot.data(),
        });
      });

      setAllFeatures(featuresData);
    };

    fetchFeatures();
  }, []);
  useEffect(() => {
    // Obtener las características del producto desde Firebase Firestore
    const getFeaturesForProduct = async () => {
      if (!selectedProduct || !selectedCollection) {
        console.error('ID de producto o colección no válidos');
        return;
      }

      const db = getFirestore(app);
      const productRef = doc(db, selectedCollection, selectedProduct.id);

      try {
        const docSnapshot = await getDoc(productRef);

        if (docSnapshot.exists()) {
          const productData = docSnapshot.data();
          setSelectedFeatures(productData.features || []);
        } else {
          console.error('El producto no existe en la base de datos.');
        }
      } catch (error) {
        console.error('Error al obtener las características del producto:', error);
      }
    };

    getFeaturesForProduct();
  }, [selectedProduct, selectedCollection]);
  useEffect(() => {
    // Obtener las categorías disponibles desde Firebase Firestore
    const fetchCategories = async () => {
      const db = getFirestore(app);
      const categoriesCollection = collection(db, 'categories'); // Reemplaza 'categories' con la colección real de categorías
      const querySnapshot = await getDocs(categoriesCollection);
      const categoriesData = [];

      querySnapshot.forEach((docSnapshot) => {
        categoriesData.push({
          id: docSnapshot.id,
          ...docSnapshot.data(),
        });
      });

      setCategories(categoriesData);
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!selectedProduct || !selectedCollection) {
        console.error('ID de producto o colección no válidos');
        return;
      }

      const db = getFirestore(app);
      const productRef = doc(db, selectedCollection, selectedProduct.id);

      try {
        const docSnapshot = await getDoc(productRef);

        if (docSnapshot.exists()) {
          const productData = docSnapshot.data();
          setProductIncludesData(productData.includes || []);
        } else {
          console.error('El producto no existe en la base de datos.');
        }
      } catch (error) {
        console.error('Error al obtener los includes del producto:', error);
      }

      // Obtener datos de la colección 'includes'
      const includesCollectionRef = collection(db, 'includes'); // Reemplaza 'includes' con el nombre real de tu colección
      const includesQuerySnapshot = await getDocs(includesCollectionRef);
      const includesData = [];

      includesQuerySnapshot.forEach((docSnapshot) => {
        includesData.push({
          id: docSnapshot.id,
          ...docSnapshot.data(),
        });
      });

      setIncludesData(includesData);
    };

    fetchData();
  }, [selectedProduct, selectedCollection]);
  useEffect(() => {
    const fetchIncludes = async () => {
      const db = getFirestore(app);
      const includesCollection = collection(db, 'includes');
      const querySnapshot = await getDocs(includesCollection);
      const includesData = [];

      querySnapshot.forEach((docSnapshot) => {
        includesData.push({
          id: docSnapshot.id,
          ...docSnapshot.data(),
        });
      });

      setAllIncludes(includesData);
    };

    fetchIncludes();
  }, []);
  useEffect(() => {
    // Obtener las características destacadas específicas del producto seleccionado desde Firebase Firestore
    const fetchFeaturedFeatures = async () => {
      if (!selectedProduct || !selectedCollection) {
        console.error('ID de producto o colección no válidos');
        return;
      }

      const db = getFirestore(app);
      const productRef = doc(db, selectedCollection, selectedProduct.id);

      try {
        const docSnapshot = await getDoc(productRef);

        if (docSnapshot.exists()) {
          const productData = docSnapshot.data();
          setFeaturedFeatures(productData.featuredFeatures || []);
        } else {
          console.error('El producto no existe en la base de datos.');
        }
      } catch (error) {
        console.error('Error al obtener las características destacadas del producto:', error);
      }
    };

    fetchFeaturedFeatures();
  }, [selectedProduct, selectedCollection]);
  useEffect(() => {
    // Obtener la lista de 'featuredFeatures' desde Firebase Firestore
    const fetchFeaturedFeaturesList = async () => {
      const db = getFirestore(app);
      const featuredFeaturesListCollection = collection(db, 'featuredFeatures'); // Reemplaza 'featuredFeaturesList' con la colección real
      const querySnapshot = await getDocs(featuredFeaturesListCollection);
      const featuredFeaturesListData = [];

      querySnapshot.forEach((docSnapshot) => {
        featuredFeaturesListData.push({
          id: docSnapshot.id,
          ...docSnapshot.data(),
        });
      });

      setAllFeaturedFeaturesList(featuredFeaturesListData);
    };

    fetchFeaturedFeaturesList();
  }, []);


  const handleFeatureDropdownChange = (e) => {
    setSelectedFeatureToAdd(e.target.value);
  };

  const handleAddFeatureToProduct = async () => {
    if (!selectedFeatureToAdd) {
      console.error('Selecciona una característica destacada para agregar.');
      return;
    }

    await addFeatureToProduct(selectedFeatureToAdd);
    setSelectedFeatureToAdd('');
  };

  const addFeatureToProduct = async (featureId) => {
    try {
      // Verifica si featureId está definido
      if (!featureId) {
        console.error('El ID de la característica destacada no está definido.');
        return;
      }

      // Realiza la lógica para agregar la característica destacada al producto
      const db = getFirestore(app);
      const productRef = doc(db, selectedCollection, selectedProduct.id);

      // Obtén las características destacadas actuales del producto desde la base de datos
      const docSnapshot = await getDoc(productRef);
      const currentFeaturedFeatures = docSnapshot.data()?.featuredFeatures || [];

      // Verifica si la característica ya está presente
      const isFeatureAlreadySelected = currentFeaturedFeatures.some(
        (feature) => feature.id === featureId
      );

      if (!isFeatureAlreadySelected) {
        // Busca la característica en la lista de 'featuredFeaturesList'
        const selectedFeature = allFeaturedFeaturesList.find((feature) => feature.id === featureId);

        if (selectedFeature) {
          const updatedFeaturedFeatures = [
            ...currentFeaturedFeatures,
            {
              id: selectedFeature.id,
              name: selectedFeature.name,
              desc: selectedFeature.desc,
              imageUrl: selectedFeature.imageUrl,
            },
          ];

          // Actualiza la base de datos con las nuevas características destacadas
          await updateDoc(productRef, {
            featuredFeatures: updatedFeaturedFeatures,
          });

          console.log('Característica destacada agregada con éxito en la base de datos.');

          // Actualiza el estado local para reflejar el cambio inmediatamente en la interfaz
          setFeaturedFeatures(updatedFeaturedFeatures);
        } else {
          console.error('La característica destacada no se encontró en la lista.');
        }
      } else {
        console.log('La característica destacada ya está presente en el producto.');
      }
    } catch (error) {
      console.error('Error al agregar la característica destacada en la base de datos:', error);
    }
  };


  const getFeaturedFeaturesForProduct = async (productId) => {
    const db = getFirestore(app);
    const productRef = doc(db, selectedCollection, productId);

    try {
      const docSnapshot = await getDoc(productRef);

      if (docSnapshot.exists()) {
        const productData = docSnapshot.data();
        setSelectedFeaturedFeatures(productData.featuredFeatures || []);
      } else {
        console.error('El producto no existe en la base de datos.');
      }
    } catch (error) {
      console.error('Error al obtener las características destacadas del producto:', error);
    }
  };

  useEffect(() => {
    // Llama a la función para obtener las características destacadas cuando cambia el producto seleccionado
    if (selectedProduct) {
      getFeaturedFeaturesForProduct(selectedProduct.id);
    }
  }, [selectedProduct, selectedCollection]);


  const handleSelectProduct = (product) => {
    // Cuando el usuario selecciona un producto para editar, establece el producto seleccionado en el estado
    setSelectedProduct(product);

    // Establece las características destacadas del producto en el estado
    setSelectedFeaturedFeatures(product.featuredFeatures || []);

    getFeaturedFeaturesForProduct(product.id);

    // Establece la primera categoría del producto en el estado de product
    setProduct({
      ...product,
      categories: product.categories || '', // Valor por defecto de categories
    });

    const existingImages = product.imgs || [];
    setSelectedProductImages(existingImages);
  };

  const handleFeatureChange = (e) => {
    const { value, name } = e.target;

    // Actualiza el estado editedFeatureValues con el nuevo valor editado
    setEditedFeatureValues((prevValues) => ({
      ...prevValues,
      [name]: value,
    }));

    setSelectedFeatures((prevSelected) => {
      if (prevSelected.some((feature) => feature.id === name)) {
        // Si ya está seleccionada, actualiza su valor
        const updatedSelected = prevSelected.map((feature) =>
          feature.id === name ? { ...feature, value } : feature
        );
        updateFeaturesInDatabase(updatedSelected); // Actualiza la base de datos
        return updatedSelected;
      } else {
        // Si no está seleccionada, agrégala
        const updatedSelected = [...prevSelected, { id: name, value }];
        updateFeaturesInDatabase(updatedSelected); // Actualiza la base de datos
        return updatedSelected;
      }
    });
  };
  useEffect(() => {
    const fetchData = async () => {
      // ... Código existente
      const db = getFirestore(app);
      // Obtener las características destacadas desde Firebase Firestore
      const featuredFeaturesCollectionRef = collection(db, 'featuredFeatures'); // Reemplaza 'featuredFeatures' con el nombre real de tu colección
      const featuredFeaturesQuerySnapshot = await getDocs(featuredFeaturesCollectionRef);
      const featuredFeaturesData = [];

      featuredFeaturesQuerySnapshot.forEach((docSnapshot) => {
        featuredFeaturesData.push({
          id: docSnapshot.id,
          ...docSnapshot.data(),
        });
      });

      setSelectedFeaturedFeatures(featuredFeaturesData);
    };

    fetchData();
  }, [selectedProduct, selectedCollection]);

  const handleRemoveFeature = (featureId) => {
    setSelectedFeatures((prevSelected) =>
      prevSelected.filter((feature) => feature.id !== featureId)
    );
    updateFeaturesInDatabase(selectedFeatures.filter((feature) => feature.id !== featureId));
  };
  const updateFeaturesInDatabase = async (updatedFeatures) => {
    const db = getFirestore();
    const sku = selectedProduct.sku;

    try {
      const docRef = doc(db, selectedProduct.selectedCollection, sku);

      // Obtén los features actuales del producto desde la base de datos
      const docSnapshot = await getDoc(docRef);
      const currentFeatures = docSnapshot.data()?.features || [];

      // Actualiza los features con los nuevos valores editados
      const updatedFeaturesWithValues = updatedFeatures.map((updatedFeature) => {
        const currentFeature = currentFeatures.find((f) => f.id === updatedFeature.id);
        return {
          id: updatedFeature.id,
          value: editedFeatureValues[updatedFeature.id] || currentFeature?.value || '',
        };
      });

      // Actualiza la base de datos con los nuevos features
      await updateDoc(docRef, {
        features: updatedFeaturesWithValues,
      });

      console.log('Features actualizadas en la base de datos');
    } catch (e) {
      console.error('Error al actualizar features en la base de datos: ', e);
    }
  };

  const handleRemoveInclude = async (includeId) => {
    try {
      // Realiza la lógica para eliminar el include del producto
      const updatedIncludes = productIncludesData.filter((id) => id !== includeId);

      // Actualiza la base de datos
      const db = getFirestore(app);
      const productRef = doc(db, selectedCollection, selectedProduct.id);

      await updateDoc(productRef, {
        includes: updatedIncludes,
      });

      console.log('Include eliminado con éxito');

      // Actualiza el estado local para reflejar el cambio inmediatamente en la interfaz
      setProductIncludesData(updatedIncludes);
    } catch (error) {
      console.error('Error al eliminar el include:', error);
    }
  };

  const saveEditedFeatures = () => {
    // Llama a la función de actualización de la base de datos con las características editadas
    updateFeaturesInDatabase(selectedFeatures);
  };
  useEffect(() => {
    // Filtra las categorías de segundo nivel basándose en el parent de la primera categoría seleccionada
    const filteredSecondCategories = lvTwoCat.filter((category) => category.parent === Number(product.categories));
    setSecondCategories(filteredSecondCategories);
  }, [product.categories]);
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Actualiza la categoría en el estado local
    setProduct({
      ...product,
      [name]: value,
    });

    // Actualiza la categoría en la base de datos
    const db = getFirestore(app);
    const productRef = doc(db, selectedCollection, selectedProduct.id);

    try {
      // Actualiza la categoría en Firestore
      updateDoc(productRef, {
        categories: product.categories,
        secondCategory: product.secondCategory,
      });

      console.log(`Categoría actualizada en la base de datos: ${product.categories}, ${product.secondCategory}`);
    } catch (error) {
      console.error('Error al actualizar la categoría en la base de datos:', error);
    }
  };
  const handleUpdateProduct = async () => {
    console.log('Botón "Guardar Cambios" presionado');
    console.log('Valores del producto y las imágenes en el estado:', product, uniqueUpdatedImages);
    if (!selectedCollection || !selectedProduct) {
      console.error('Selecciona una colección y un producto válidos para editar');
      return;
    }

    console.log('Valores del producto y las imágenes en el estado:', product, uniqueUpdatedImages);

    const db = getFirestore(app);
    const productRef = doc(db, selectedCollection, selectedProduct.id);

    // Asegúrate de que secondCategory tenga un valor definido
    const updatedProductData = {
      name: selectedProduct.name,
      longDesc: selectedProduct.longDesc,
      shortDesc: selectedProduct.shortDesc,
      categories: product.categories,
      secondCategory: product.secondCategory || null, // Usa null si secondCategory es undefined
      gen: product.gen,
      published: isPublished,
      // ...otros campos actualizados
    };

    // Si hay imágenes existentes, inclúyelas en los datos actualizados
    if (selectedProduct.imgs && selectedProduct.imgs.length > 0) {
      updatedProductData.imgs = selectedProduct.imgs;
    }

    try {
      // Actualiza la información del producto
      await updateDoc(productRef, updatedProductData);

      console.log('Documento del producto actualizado con éxito.');

      // ... Resto del código
    } catch (error) {
      console.error('Error al actualizar el documento del producto:', error);
    }

    if (!selectedCollection || !selectedProduct) {
      console.error('Selecciona una colección, un producto válido y al menos una nueva imagen para actualizar');
      return;
    }



    try {
      // Obtén las imágenes existentes desde Firebase Firestore
      const docSnapshot = await getDoc(productRef);
      const existingImages = docSnapshot.data().imgs || [];

      // Combina las imágenes existentes con las nuevas imágenes
      const updatedImages = [...existingImages, ...newProductImages];

      // Elimina las imágenes de la lista `deletedImages` de las imágenes actualizadas
      const imagesToRemove = deletedImages.map((deletedImage) => deletedImage);

      const updatedImagesWithoutDeleted = updatedImages.filter((image) => !imagesToRemove.includes(image));

      // Actualiza el campo 'imgs' en Firebase Firestore con las imágenes actualizadas
      await updateDoc(productRef, {
        imgs: updatedImagesWithoutDeleted,
      });

      console.log('Imágenes actualizadas con éxito.');

      // Actualiza el estado de uniqueUpdatedImages
      setUniqueUpdatedImages(updatedImagesWithoutDeleted);

      // Habilita el botón "Guardar Cambios" después de actualizar las imágenes
      setAreNewImagesUploaded(true);

      // Marca que se ha hecho clic en "Guardar Nuevas Imágenes"
      setIsUpdateImagesClicked(true);

      // Limpia la lista de imágenes eliminadas
      setDeletedImages([]);
    } catch (error) {
      console.error('Error al actualizar las imágenes:', error);
    }
  };
  const handleNewImageUpload = async (e) => {
    const { files } = e.target;
    const previews = [];

    if (files.length > 0) {
      const existingImageNames = selectedProductImages.map((imageUrl) => {
        const urlParts = imageUrl.split('/');
        return urlParts[urlParts.length - 1]; // Obtiene el nombre del archivo de la URL
      });

      const newImages = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileName = file.name;

        if (!existingImageNames.includes(fileName)) {
          newImages.push(file);
        } else {
          // Aquí puedes mostrar una alerta o notificación de que el nombre de la imagen ya existe
          console.log(`La imagen con el nombre ${fileName} ya existe en la base de datos.`);
        }
      }

      const newImageUrls = await uploadImagesToFirebase(newImages);

      if (newImageUrls.length > 0) {
        // Habilitar el botón "Guardar Cambios" solo si se cargaron nuevas imágenes únicas
        setAreNewImagesUploaded(true);
      }

      // Agregar las nuevas URLs de imágenes únicas a la lista de imágenes nuevas
      setNewProductImages([...newProductImages, ...newImageUrls]);
    }
  };
  const uploadImagesToFirebase = async (imageFiles) => {
    const storageRef = ref(storage, '/images');
    const newImageUrls = [];

    for (let i = 0; i < imageFiles.length; i++) {
      const file = imageFiles[i];

      // Genera un nombre único para la imagen
      const uniqueName = uuidv4() + '_' + file.name;

      // Crea una referencia al almacenamiento con el nombre único
      const imageRef = ref(storageRef, uniqueName);

      try {
        // Cargar la imagen al almacenamiento de Firebase
        await uploadBytes(imageRef, file);

        // Obtener la URL de descarga de la imagen
        const imageUrl = await getDownloadURL(imageRef);

        newImageUrls.push(imageUrl);
      } catch (error) {
        console.error('Error al cargar la imagen: ', error);
      }
    }

    return newImageUrls;
  };
  const handleDeleteImage = (index) => {
    const updatedImages = [...selectedProductImages];
    const deletedImage = updatedImages.splice(index, 1)[0];
    setSelectedProductImages(updatedImages);

    // Agregar la imagen eliminada a la lista de imágenes eliminadas
    setDeletedImages([...deletedImages, deletedImage]);
  };
  const handleAddBanner = async () => {
    console.log('Botón "Guardar modificaciones" presionado');
    if (!selectedCollection || !selectedProduct || !newBanner.title || !newBanner.img || !newBanner.desc) {
      console.error('Completa todos los campos para agregar un nuevo banner');
      return;
    }

    // Verifica que newBanner.img contiene la URL de la imagen antes de almacenarlo en Firestore
    if (typeof newBanner.img !== 'string') {
      console.error('El campo img debe contener la URL de la imagen');
      return;
    }

    // Crea una copia del producto para evitar mutar el estado directamente
    const updatedProduct = { ...selectedProduct };

    // Agrega el nuevo banner a la lista de banners del producto
    updatedProduct.banners.push({ ...newBanner });

    // Restablece el estado de newBanner después de agregar el nuevo banner
    setNewBanner({
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

    // Actualiza el estado del producto después de agregar el nuevo banner
    setSelectedProduct(updatedProduct);

    // Actualiza el campo 'banners' en Firestore con los banners actualizados
    const db = getFirestore(app);
    const productRef = doc(db, selectedCollection, selectedProduct.id);

    try {
      await updateDoc(productRef, {
        banners: updatedProduct.banners,
      });

      console.log('Nuevo banner agregado con éxito.');
    } catch (error) {
      console.error('Error al agregar el nuevo banner en Firestore:', error);
    }
  };
  const handleSelectBanner = (index) => {
    if (!selectedProduct.banners || selectedProduct.banners.length === 0) {
      return;
    }

    // Asegúrate de que index esté dentro de los límites
    index = Math.max(0, Math.min(index, selectedProduct.banners.length - 1));

    // Selecciona el banner según el índice
    const selectedBanner = selectedProduct.banners[index];

    // Actualiza el estado de editedBanner con los detalles del banner seleccionado
    setEditedBanner({
      title: selectedBanner?.title || '',
      img: selectedBanner?.img || '',
      desc: selectedBanner?.desc || '',
    });

    // Actualiza el estado local del índice del banner seleccionado
    setSelectedBannerIndex(index);
  };
  const handleNewBannerImageUpload = (e) => {
    const file = e.target.files[0];
    const imageUrl = URL.createObjectURL(file);
    setNewBanner({ ...newBanner, img: imageUrl });
  };
  const storage = getStorage(app);
  const handleEditedBannerImageUpload = async (e) => {
    const file = e.target.files[0];
    //const { files } = e.target;
    const previews = [];

    if (file) {
      try {
        // Genera un nombre único para la imagen
        const uniqueName = uuidv4() + '_' + file.name;

        // Crea una referencia al almacenamiento con el nombre único
        const storageRef = ref(storage, `bannerImages/${uniqueName}`);

        // Sube la imagen al almacenamiento
        await uploadBytes(storageRef, file);

        // Obtén la URL de descarga de la imagen
        const downloadURL = await getDownloadURL(storageRef);

        // Actualiza el estado con la información de la imagen
        setEditedBanner({
          ...editedBanner,
          img: downloadURL,
          // Puedes almacenar el nombre único si es necesario
          // uniqueName: uniqueName,
        });
      } catch (error) {
        console.error('Error al cargar la imagen:', error);
      }
    }
  };
  const handleEditBanner = async () => {
    if (!selectedCollection || !selectedProduct || selectedBannerIndex === null) {
      console.error('Selecciona una colección, un producto válido y un banner válido para editar');
      return;
    }

    // Crea una copia del producto para evitar mutar el estado directamente
    const updatedProduct = { ...selectedProduct };

    // Encuentra el banner seleccionado en la lista de banners del producto
    const editedBannerIndex = selectedBannerIndex;

    if (editedBannerIndex !== null) {
      // Actualiza el banner en la lista de banners del producto con las ediciones
      updatedProduct.banners[editedBannerIndex] = { ...editedBanner };

      // Restablece el estado de editedBanner después de aplicar las ediciones
      setEditedBanner({
        title: '',
        img: '',
        desc: '',
      });

      // Mostrar la alerta de banner editado
      setShowBannerEditedAlert(true);

      // Ocultar la alerta después de unos segundos (opcional)
      setTimeout(() => {
        setShowBannerEditedAlert(false);
      }, 3000); // Cambia la duración deseada en milisegundos

      // Actualiza el estado del producto después de editar el banner
      setSelectedProduct(updatedProduct);
    }

    // Actualiza el campo 'banners' en Firestore con los banners actualizados
    const db = getFirestore(app);
    const productRef = doc(db, selectedCollection, selectedProduct.id);

    try {
      await updateDoc(productRef, {
        banners: updatedProduct.banners,
      });

      console.log('Banner editado con éxito.');
    } catch (error) {
      console.error('Error al editar el banner en Firestore:', error);
    }
  };
  const handleDeleteBanner = async (bannerIndex) => {
    if (!selectedCollection || !selectedProduct || bannerIndex === undefined) {
      console.error('Selecciona una colección, un producto válido y un banner válido para eliminar');
      return;
    }

    // Elimina el banner seleccionado de la lista de banners del producto
    const updatedBanners = [...product.banners];
    const deletedBanner = updatedBanners.splice(bannerIndex, 1)[0];

    // Actualiza el campo 'banners' en Firebase Firestore con los banners actualizados
    const db = getFirestore(app);
    const productRef = doc(db, selectedCollection, selectedProduct.id);

    try {
      await updateDoc(productRef, {
        banners: updatedBanners,
      });

      // Elimina la imagen del banner del almacenamiento de Firebase
      if (deletedBanner.img) {
        const storageRef = ref(storage, 'bannerImages/'); // Asegúrate de usar la instancia correcta de Firebase Storage

        try {
          const imageRef = ref(storageRef, deletedBanner.img);
          await deleteObject(imageRef);
        } catch (storageError) {
          console.error('Error al eliminar la imagen del banner:', storageError);
        }
      }

      console.log('Banner eliminado con éxito.');

      // Actualiza el estado del producto después de la eliminación del banner
      setProduct({
        ...product,
        banners: updatedBanners,
      });
    } catch (error) {
      console.error('Error al eliminar el banner en Firestore:', error);
    }
  };
  const handleToggleNewBannerForm = () => {
    console.log('Botón "Guardar modificaciones" presionado');
    console.log('Valores en newBanner:', newBanner);
    setShowNewBannerForm(!showNewBannerForm);
  };
  const handleBack = () => {
    router.push('/admin');
  };

  if (!currentUser) {
    return <Admin />;
  }

  return (

    <div className="mt-4 p-5 bg-primary text-white rounded center">
      <div className="app-container" >
        <div className="sidebarEdit">
          <div className="sidebar-header">
          </div>
          <ul className="sidebar-list">
            <li className="sidebar-list-item">
              <h2 className="app-content-headerText">Selecciona una colección</h2>

              <div class="containerSelect">
                <div class="select">
                  <select
                    value={selectedCollection}
                    onChange={(e) => setSelectedCollection(e.target.value)}
                  >
                    <option value="">Selecciona una colección</option>
                    <option value="headsets">Headsets</option>
                    <option value="audio">Audio</option>
                    <option value="tablets">Tablets</option>
                    <option value="notebooks">Notebooks</option>
                    <option value="cooks">Cooks</option>
                  </select>
                </div>
              </div>
            </li>
            <li className="sidebar-list-item">
              <Form>
                <Form.Group className="mb-3">
                  <Form.Control
                    className='form-title'
                    style={{ color: 'black' }}
                    type="text"
                    placeholder="Buscar por Nombre o SKU"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </Form.Group>
              </Form>

            </li>
          </ul>
          <ul className="sidebar-list">
            <hr></hr>


            {filteredProducts.map((product) => (
              <li key={product.id}>
                <hr></hr>
                <div className="sidebar-list-itemEdit">
                  {product.imgs.length > 0 && (
                    <img
                      src={product.imgs[0]} // Supongo que product.images es un arreglo de URLs de imágenes del producto
                      alt={`Imagen de ${product.name}`}
                      className="image-previewsEdit"
                    />
                  )}
                  <span className='form-titleEdit'>{product.sku}</span>
                  <button className="app-content-headerButtonEdit" onClick={() => handleSelectProduct(product)}>Editar</button>
                </div>
              </li>
            ))}
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
        <div className="app-contentEdit">
          <div className="app-content-header">

            <h1 className="app-content-headerText">Editar producto</h1>

            <button onClick={handleBack} variant="danger" className="app-content-headerButton">Volver</button>
          </div>
          <div className="app-content-actions">
            {isProductPublished ? (
              // Mostrar el contenido del formulario si el producto está publicado
              <div className="app-contentEdit">
                {/* ... tu código existente */}
              </div>
            ) : (
              // Mostrar la alerta si el producto no está publicado
              <div className="app-content-headerText" style={{ backgroundColor: '#ff000070', textDecoration: 'none' }} role="alert">
                PRODUCTO NO PUBLICADO. Por favor, actualiza el estado de publicación del producto.
              </div>
            )}

            {selectedProduct && (
              <div>
                <Form.Group controlId="published" className="nice-form-group">
                  <p style={{ textDecoration: 'none', fontSize: '40px', fontWeight: 'bold' }}
                    className="app-content-headerText">{selectedProduct.sku}</p>
                  <hr style={{ marginTop: '20px' }} />
                  <Form.Check
                    style={{ textDecoration: 'none', marginTop: '20px' }}
                    className="app-content-headerText"
                    type="switch"
                    id="published-switch"
                    label={`Publicado: ${isPublished ? 'Sí' : 'No'}`}
                    checked={isPublished}
                    onChange={handleTogglePublished}
                  />
                </Form.Group>
                <Form>
                  <Form.Group className="nice-form-group">
                    <Form.Label>
                      Nombre: </Form.Label>
                    <Form.Control
                      type="text"
                      value={selectedProduct.name}
                      onChange={(e) =>
                        setSelectedProduct({
                          ...selectedProduct,
                          name: e.target.value,
                        })
                      }
                    >
                    </Form.Control>
                  </Form.Group>
                </Form>

                <Form>
                  <Form.Group className="nice-form-group">
                    <Form.Label>
                      Descripción Larga:
                    </Form.Label>
                    <textarea
                      value={selectedProduct.longDesc}
                      onChange={(e) =>
                        setSelectedProduct({
                          ...selectedProduct,
                          longDesc: e.target.value,
                        })
                      }
                    />
                  </Form.Group>
                </Form>

                <Form>
                  <Form.Group className="nice-form-group">
                    <Form.Label>Descripción Corta:</Form.Label>
                    <textarea
                      value={selectedProduct.shortDesc}
                      onChange={(e) =>
                        setSelectedProduct({
                          ...selectedProduct,
                          shortDesc: e.target.value,
                        })
                      }
                    />
                  </Form.Group>
                </Form>

                <Form.Group controlId="gen" className='nice-form-group'>
                  <Form.Label className='form-title'>Generación del producto</Form.Label>
                  <Form.Control
                    type="text"
                    name="gen"
                    value={product.gen}
                    onChange={handleChange} // Verifica que handleChange esté manejando los cambios correctamente
                    required
                  />
                </Form.Group>

                {selectedProductImages.length > 0 ? (
                  <div className="nice-form-group">
                    <hr style={{ marginTop: '20px' }} />
                    <h3 className="app-content-headerText" style={{ marginTop: '20px', textDecoration: '1px underline' }}>Imágenes existentes</h3>
                    <ul className='image-container-editImage'>
                      {selectedProductImages.map((imageUrl, index) => (
                        <li key={index}>
                          <img className="image-previewsEdits" src={imageUrl} alt={`Imagen ${index}`} />
                          <button className="app-content-headerButton" onClick={() => handleDeleteImage(index)}>
                            Eliminar
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p className='form-titleEdit'>No hay imágenes cargadas</p>
                )}

                {newProductImages.length > 0 && (
                  <div>
                    <h3 className="app-content-headerText">Nuevas imágenes cargadas</h3>
                    <ul className='image-container-edit'>
                      {newProductImages.map((imageUrl, index) => (
                        <li key={index}>
                          <img className="image-previews" src={imageUrl} alt={`Nueva Imagen ${index}`} />
                          <button className="app-content-headerButton" onClick={() => handleDeleteImage(index)}>
                            Eliminar
                          </button>
                        </li>
                      ))}
                    </ul>
                    {/* <button className="app-content-headerButton" onClick={handleUpdateImages} variant="primary">
                      Guardar Nuevas Imágenes
                    </button> */}
                  </div>
                )}
                <Form.Group controlId="newImages" className='nice-form-group'>
                  <Form.Label >Cargar nuevas imágenes</Form.Label>
                  <Form.Control
                    className='form-title'
                    type="file"
                    name="newImages"
                    onChange={handleNewImageUpload}
                    multiple
                  />
                </Form.Group>

                <Form>
                  <div>
                    <hr style={{ marginTop: '20px' }} />
                    <h2 className="app-content-headerText" style={{ marginTop: '20px', textDecoration: '1px underline' }}>Banners existentes</h2>


                    <Form.Group controlId="selectBanner" className='nice-form-group'>
                      <Form.Label>Selecciona un Banner para Editar</Form.Label>
                      <Form.Control
                        as="select"
                        name="selectBanner"
                        value={selectedBannerIndex !== null ? selectedBannerIndex.toString() : ''}
                        onChange={(e) => handleSelectBanner(parseInt(e.target.value))}
                      >

                        <option value="">Selecciona un Banner</option>
                        {selectedProduct.banners && selectedProduct.banners.map((banner, index) => (
                          <option key={index} value={index.toString()}>
                            {banner.title}
                          </option>
                        ))}
                      </Form.Control>
                      <Form.Group controlId="bannerTitle" className='nice-form-group'>
                        <Form.Label >Título del Banner</Form.Label>
                        <Form.Control
                          type="text"
                          name="bannerTitle"
                          value={editedBanner.title}
                          onChange={(e) => setEditedBanner({ ...editedBanner, title: e.target.value })}
                        />
                      </Form.Group>

                      <Form.Group controlId="bannerImage" className='nice-form-group'>
                        <Form.Label>Imagen del Banner</Form.Label>
                        <Form.Control
                          className='form-title'
                          type="file"
                          name="bannerImage"
                          onChange={handleEditedBannerImageUpload}
                          accept="image/*" // Esto permite solo archivos de imagen
                        />
                      </Form.Group>


                      {editedBanner.img && (
                        <div className="banner-image-preview">
                          <img className="image-previews-banner" src={editedBanner.img} alt="image-banner" />
                        </div>
                      )}

                      <Form.Group controlId="bannerDesc" className='nice-form-group'>
                        <Form.Label>Descripción del Banner</Form.Label>
                        <Form.Control
                          as="textarea"
                          name="bannerDesc"
                          value={editedBanner.desc}
                          onChange={(e) => setEditedBanner({ ...editedBanner, desc: e.target.value })}
                        />
                      </Form.Group>


                      <Button variant="danger" className="app-content-headerButton" onClick={handleEditBanner}>
                        Editar Banner
                      </Button>
                    </Form.Group>
                    {selectedProduct.banners && selectedProduct.banners.length > 0 ? (
                      <ul className='image-container-edit'>
                        {selectedProduct.banners.map((banner, index) => (
                          <li key={index}>
                            <p className="app-content-headerText" style={{ textDecoration: '1px underline' }}>Titulo del Banner </p>
                            <p className="app-content-bannerDesc">{banner.title}</p>
                            <img className="image-previews-banner" src={banner.img} alt={banner.title} />
                            <p className="app-content-bannerDescT">Descripción del Banner:</p>
                            <p className="app-content-bannerDesc">{banner.desc}</p>
                            <Button
                              variant="danger"
                              className="app-content-headerButton"
                              onClick={() => handleDeleteBanner(index)}
                            >
                              Eliminar Banner
                            </Button>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="app-content-headerText">No hay banners existentes.</p>
                    )}
                  </div>


                  <div>
                    <button
                      type="button"  // Agrega esta línea para especificar que el botón no es de tipo "submit"
                      className="app-content-headerButton"
                      onClick={handleToggleNewBannerForm}
                    >
                      {showNewBannerForm ? 'Ocultar Nuevo Banner' : 'Añadir Nuevo Banner'}
                    </button>
                    {showNewBannerForm && (
                      <div>
                        <Form.Group controlId="newBannerTitle" className='nice-form-group'>
                          <Form.Label>Título del Nuevo Banner</Form.Label>
                          <Form.Control
                            type="text"
                            name="newBannerTitle"
                            value={newBanner.title}
                            onChange={(e) => setNewBanner({ ...newBanner, title: e.target.value })}
                          />
                        </Form.Group>

                        <Form.Group controlId="newBannerImage" className='nice-form-group'>
                          <Form.Label>Imagen del Nuevo Banner</Form.Label>
                          <Form.Control
                            className='form-title'
                            type="file"
                            name="newBannerImage"
                            onChange={(e) => handleNewBannerImageUpload(e)}
                            accept="image/*"
                          />
                        </Form.Group>

                        {newBanner.img && (
                          <div className="banner-image-preview">
                            <img className="image-previews-banner" src={newBanner.img} alt="image-banner" />
                          </div>
                        )}

                        <Form.Group controlId="newBannerDesc" className='nice-form-group'>
                          <Form.Label>Descripción del Nuevo Banner</Form.Label>
                          <Form.Control
                            as="textarea"
                            name="newBannerDesc"
                            value={newBanner.desc}
                            onChange={(e) => setNewBanner({ ...newBanner, desc: e.target.value })}
                          />
                        </Form.Group>
                      </div>
                    )}

                  </div>


                  <Button variant="primary"
                    style={{ marginTop: '10px' }} className="app-content-headerButton" onClick={handleAddBanner}>
                    Guardar modificacines
                  </Button>




                </Form>


                <hr style={{ marginTop: '20px', marginBottom: '20px' }} />



                <h2 className="app-content-headerText" style={{ marginTop: '20px', textDecoration: '1px underline' }}>Caracteristicas Destacadas</h2>

                <Form.Group controlId="featuredFeature" className="nice-form-group" >
                  <Form.Label>Seleccionar Característica Destacada:</Form.Label>
                  <Form.Select
                    value={selectedFeatureToAdd}
                    onChange={handleFeatureDropdownChange}
                  >
                    <option value="" disabled>Seleccionar...</option>
                    {allFeaturedFeaturesList.map((feature) => (
                      <option key={feature.id} value={feature.id}>
                        {feature.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
                <button className="app-content-headerButton" variant="primary" onClick={handleAddFeatureToProduct}>
                  Agregar Característica
                </button>

                <Form.Group controlId="featuredFeature" className="nice-form-group">
                  {featuredFeatures.map((feature) => (
                    <div className="featuredFeaturesSelected" key={feature.id}>

                      <div style={{ display: 'flex' }}>
                        <li>
                          <button
                            variant="danger"
                            className="app-content-headerButton"
                            type="button"
                            onClick={() => handleRemoveFeature(feature.id)}
                          >
                            <CloseIcon fontSize="" />
                          </button>
                          {feature.imageUrl && (
                            <div>
                              <p>Imagen:</p>
                              <img
                                src={feature.imageUrl}
                                alt={`Imagen de ${feature.name}`}
                                style={{ width: '77px', height: '77px', borderRadius: '10px', backgroundColor: 'aqua' }}
                              />
                            </div>
                          )}

                          <p>{`ID: ${feature.id}`}</p>
                          <p>{`Nombre: ${feature.name}`}</p>
                          <p>{`Descripción: ${feature.desc}`}</p>

                        </li>
                      </div>
                    </div>
                  ))}
                </Form.Group>

                <hr style={{ marginTop: '20px' }} />
                <h2 className="app-content-headerText" style={{ marginTop: '20px', textDecoration: '1px underline' }}>Caracteristicas</h2>

                <Form.Group controlId="productFeatures">
                  <Form.Group className='checkForm' controlId="features">
                    <Form.Label>Selecciona las características:</Form.Label>
                    {allFeatures.map((feature) => (
                      <Form.Check
                        key={feature.id}
                        type="checkbox"
                        label={`${feature.id} - ${feature.name}`}
                        name={feature.id}
                        value={selectedFeatures.find((selectedFeature) => selectedFeature.id === feature.id)?.value || ''}
                        onChange={handleFeatureChange}
                      />
                    ))}

                  </Form.Group>

                  <div className="featuresSelectedFather" >
                    {selectedFeatures.map((selectedFeature) => (

                      <div key={selectedFeature.id} className="featuresSelected" style={{ color: 'black' }}>
                        <button
                          variant="danger"
                          className="app-content-headerButton"
                          type="button"
                          onClick={() => handleRemoveFeature(selectedFeature.id)}
                        >
                          <CloseIcon fontSize="" />
                        </button>
                        <Form.Group controlId="name" className='nice-form-group' style={{ borderBottom: 'white solid 1px', display: 'flex', alignItems: 'center' }}>
                          <Form.Label className='form-title-features'>{`${selectedFeature.id} - `}</Form.Label>
                          <Form.Control
                            type="text"
                            name="name"
                            value={editedFeatureValues[selectedFeature.id] || selectedFeature.value}
                            onChange={(e) => {
                              const value = e.target.value;
                              setEditedFeatureValues((prev) => ({
                                ...prev,
                                [selectedFeature.id]: value,
                              }));
                            }}
                            required
                          />


                        </Form.Group>

                      </div>

                    ))}
                  </div>
                  <button style={{ marginTop: '10px' }} className="app-content-headerButton" onClick={saveEditedFeatures}>
                    Guardar Características
                  </button>
                </Form.Group>

                <hr style={{ marginTop: '20px' }} />

                <Form.Group controlId="includes" className='nice-form-group'>
                  <h2 className="app-content-headerText" style={{ marginTop: '20px', textDecoration: '1px underline' }}>Incluye:</h2>
                  <Form.Group controlId="selectInclude" className='nice-form-group'>
                    <Form.Label>Seleccionar Include:</Form.Label>
                    <Form.Select
                      value={selectedInclude ? selectedInclude.id : ''}
                      onChange={(e) => {
                        const selectedId = e.target.value;
                        const selectedInclude = allIncludes.find((include) => include.id === selectedId);
                        setSelectedInclude(selectedInclude);
                      }}
                    >
                      <option value="">Selecciona un Include</option>
                      {allIncludes.map((include) => (
                        <option key={include.id} value={include.id}>
                          {include.name}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                  <button
                    className="app-content-headerButton"
                    onClick={async () => {
                      if (selectedInclude) {
                        const updatedIncludes = [...productIncludesData, selectedInclude.id];

                        // Actualizar el estado local
                        setProductIncludesData(updatedIncludes);

                        // Actualizar la base de datos
                        const db = getFirestore(app);
                        const productRef = doc(db, selectedCollection, selectedProduct.id);

                        try {
                          await updateDoc(productRef, {
                            includes: updatedIncludes,
                          });

                          console.log('Include agregado con éxito a la base de datos');
                        } catch (error) {
                          console.error('Error al agregar el include a la base de datos:', error);
                        }
                      }
                    }}
                  >
                    Agregar Include
                  </button>

                  <ul>
                    {productIncludesData.map((includeId, index) => {
                      const matchingInclude = allIncludes.find((include) => include.id === includeId);

                      if (matchingInclude) {
                        return (
                          <div key={index} className="featuredFeaturesSelected">

                            <div style={{ display: 'flex' }}>
                              <li key={index}>
                                <button
                                  variant="danger"
                                  className="app-content-headerButton"
                                  type="button"
                                  onClick={() => handleRemoveInclude(matchingInclude.id)}
                                >
                                  <CloseIcon fontSize="" />
                                </button>
                                {matchingInclude.img && (
                                  <div>
                                    <img src={matchingInclude.img} alt={`Imagen para ${matchingInclude.name}`} style={{ width: '77px', height: '77px', borderRadius: '10px' }} />
                                  </div>
                                )}
                                <div>
                                  <div>ID: {matchingInclude.id}</div>
                                  <div>Nombre: {matchingInclude.name}</div>
                                </div>
                              </li>
                            </div>
                          </div>
                        );
                      } else {
                        return (
                          <li key={index}>
                            <p>&quot;Incluye&quot; no encontrado</p>
                          </li>
                        );
                      }
                    })}
                  </ul>
                </Form.Group>





              </div>
            )}
            <button
              onClick={handleUpdateProduct}
              variant="danger"
              className="app-content-headerButton"
              style={{ marginTop: '20px' }}
            >
              Guardar Cambios
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};

export default EditProduct;
