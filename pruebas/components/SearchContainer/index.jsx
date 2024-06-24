import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
//import features from '../../content/features';
import { lvOneCat, lvTwoCat } from '../../content/categories';
import ProductCard from '../ProductCard';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import Button from '@mui/material/Button';

export default function SearchContainer() {
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedFeature, setSelectedFeature] = useState('');
  const [selectedValue, setSelectedValue] = useState('');
  const [showDiscontinued, setShowDiscontinued] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(true);
  const [skuInput, setSkuInput] = useState('');
  const [collections, setCollections] = useState([]);
  const [selectedCollections, setSelectedCollections] = useState([]);
  const [allCollections, setAllCollections] = useState([
    { id: 'headsets', name: 'Headsets' },
    { id: 'audio', name: 'Audio' },
    { id: 'notebooks', name: 'Notebooks' },
    { id: 'tablets', name: 'Tablets' },
    { id: 'cooks', name: 'Cooks' },
  ]);

  const [discontinuedProducts, setDiscontinuedProducts] = useState([]);
  const [discontinuedProductsForAutocomplete, setDiscontinuedProductsForAutocomplete] = useState([]);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [appliedFilters, setAppliedFilters] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const collections = ['headsets', 'audio', 'notebooks', 'tablets', 'cooks'];

        const productsData = await Promise.all(
          collections.map(async (collection) => {
            const collectionRef = db.collection(collection);
            const snapshot = await collectionRef.get();
            return snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
          })
        );

        // Flatten the array of arrays
        const allProducts = productsData.flat();

        setProducts(allProducts);
        setDataLoaded(true);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    // Verificar si hay productos y si se deben mostrar descontinuados
    if (products && showDiscontinued) {
      // Filtrar productos descontinuados
      const discontinued = products.filter(
        (prod) => prod.secondCategories && prod.secondCategories.includes(110)
      );
      setDiscontinuedProducts(discontinued);
      // Inicializar productos descontinuados para el Autocomplete
      setDiscontinuedProductsForAutocomplete(discontinued);
    }
  }, [products, showDiscontinued]);


  const handleCollectionChange = (collectionId) => {
    setSelectedCollections((prevSelectedCollections) => {
      if (prevSelectedCollections.includes(collectionId)) {
        // Si ya está seleccionada, quitarla
        return prevSelectedCollections.filter((id) => id !== collectionId);
      } else {
        // Si no está seleccionada, agregarla
        return [...prevSelectedCollections, collectionId];
      }
    });
    scrollToTop();
  };


  const handleApplyFilter = () => {
    setAppliedFilters(true);

    // Filtrar y almacenar los productos que cumplen con los criterios de colecciones y descontinuados
    const filteredProducts = finalProducts.filter((product) =>
      selectedCollections.includes(product.selectedCollection) &&
      (showDiscontinued || !product.secondCategories || !product.secondCategories.includes(110))
    );
    setFilteredProducts(filteredProducts);
  };

  let finalProducts = products;

  // Filtrar productos según las colecciones seleccionadas
  if (selectedCollections.length > 0) {
    finalProducts = finalProducts.filter((prod) =>
      prod && prod.collections && prod.collections.some((col) => selectedCollections.includes(col))
    );
  }


  function sortAlphabetically(data, prop) { // Accepts both arrays and objects
    return prop ? data.sort((a, b) => a[prop] >= b[[prop]] ? 1 : -1) : data.sort((a, b) => a >= b ? 1 : -1)
  }
  function removeDuplicates(arr) {
    return Array.from(new Set(arr))
  }
  function getPossibleSkus(products) {
    return products.map(p => p.sku)
  }
  function findProductsByMasterCategory(catId, products) {
    const categories = lvTwoCat.map(e => e.parent == catId && e.id) // Array [101, 102]
    // Return filtered products if any of its categories matches any of the present in the array above
    return products.filter(prod => prod.categories.some(prodCat => categories.some(cat => cat == prodCat)))
  }

  if (!selectedCategory) { // Si no tocaste nada, ves todos los productos
    finalProducts = products
  } else { // Si seleccionaste categoria...
    // Filtras productos por categoría
    finalProducts = findProductsByMasterCategory(selectedCategory, products)
    // Generas lista de características posibles
    const featureArray = features.filter(e => finalProducts.some(prod => prod.features.some(feat => feat.id == e.id && !e.hideInSearchPage)))
    finalFeatures = removeDuplicates(sortAlphabetically(featureArray, 'name'))
    if (selectedFeature) { // Si seleccionaste característica, generas lista de valores posibles
      const featValues = [] // Array temporal de valores posibles
      finalProducts.forEach(prod => { // Por cada producto...
        const match = prod.features.find(feat => feat.id == selectedFeature) // Busca la feature seleccionada
        if (match) featValues.push(match.value) // Si hay coincidencia, incluye su valor en el array temporal
      })
      finalValues = removeDuplicates(sortAlphabetically(featValues)) // Genera los valores posibles sin repetir
      if (selectedValue) {
        finalProducts = finalProducts.filter(prod => prod.features.some(feat => feat.id == selectedFeature && feat.value == selectedValue)) // Filtra por valor seleccionado
      }
    }
  }

  if (!showDiscontinued) {
    finalProducts = finalProducts.filter(prod => {
      const categories = Array.isArray(prod.categories) ? prod.categories : [prod.categories];
      return !categories.includes(110);
    });
  }
  if (skuInput) {
    finalProducts = finalProducts.filter(prod => prod.sku.includes(skuInput))
  }
  // Filtrar productos según las colecciones seleccionadas
  if (collections.length > 0) {
    finalProducts = finalProducts.filter((prod) =>
      prod.collections.some((col) => collections.includes(col))
    );
  }
  // Handlers
  function toggleShowDiscontinued() {
    setShowDiscontinued(e => !e)
    scrollToTop()
  }
  function openMobileMenu() {
    setMobileMenu(e => !e)
    scrollToTop()
  }
  function changeSku(e) {
    const input = e.target.value
    setSkuInput(input.toUpperCase())
  }

  // Scroll to top
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }
  useEffect(() => {
    window.addEventListener("scroll", () => {
      if (window.pageYOffset > 300) {
        setShowBackToTop(true)
      } else {
        setShowBackToTop(false)
      }
    })
  }, [])
  return (
    <main className="search">
      <aside className="filters">
        <button className={`mobile-open ${mobileMenu && 'open'}`} onClick={openMobileMenu}><ArrowUpwardIcon /></button>
        <div className={`wrapper ${mobileMenu && 'open'}`}>
          <h1>Búsqueda de productos</h1>
          <FormGroup>
            {allCollections.map((collection) => (
              <FormControlLabel
                key={collection.id}
                control={
                  <Checkbox
                    checked={selectedCollections.includes(collection.id)}
                    onChange={() => handleCollectionChange(collection.id)}
                  />
                }
                label={collection.name}
              />
            ))}
          </FormGroup>
          <Autocomplete
            disablePortal
            id="sku-input"
            options={getPossibleSkus(finalProducts)}
            fullWidth
            disableClearable
            onSelect={changeSku}
            value={skuInput}
            isOptionEqualToValue={(a, b) => true}
            renderInput={(params) => <TextField {...params} onChange={changeSku} label="Modelo" />}
            // Filtrar las opciones basadas en la colección seleccionada y secondCategories no igual a '110'
            filterOptions={(options, { inputValue }) => {
              return options.filter((option) => {
                const product = finalProducts.find((prod) => prod.sku === option);
                return (
                  product &&
                  product.selectedCollection &&
                  selectedCollections.includes(product.selectedCollection) &&
                  (!product.secondCategories || !product.secondCategories.includes(110))
                );
              });
            }}
          />

          <FormGroup>
            <FormControlLabel
              control={<Checkbox checked={showDiscontinued} onChange={toggleShowDiscontinued} />}
              label="Mostrar descontinuados"
            />
          </FormGroup>

          {/* Nuevo Autocomplete para productos descontinuados */}
          {showDiscontinued && discontinuedProductsForAutocomplete.length > 0 && (
            <Autocomplete
              disablePortal
              id="discontinued-sku-input"
              options={getPossibleSkus(discontinuedProductsForAutocomplete)}
              fullWidth
              disableClearable
              onSelect={changeSku}
              value={skuInput}
              isOptionEqualToValue={(a, b) => true}
              renderInput={(params) => <TextField {...params} onChange={changeSku} label="Modelo" />}
              // Filtrar las opciones basadas en la colección seleccionada y secondCategories igual a '110'
              filterOptions={(options, { inputValue }) => {
                return options.filter((option) => {
                  const product = discontinuedProductsForAutocomplete.find((prod) => prod.sku === option);
                  return (
                    product &&
                    product.secondCategories &&
                    product.secondCategories.includes(110) &&
                    selectedCollections.includes(product.selectedCollection)
                  );
                });
              }}
            />
          )}
          <button className={`back-to-top ${showBackToTop && 'visible'}`} onClick={scrollToTop} value=''>
            <ArrowUpwardIcon fontSize='small' />
            Volver arriba
          </button>
        </div>

        <Button variant="contained" onClick={handleApplyFilter}>
          Aplicar
        </Button>
      </aside>
      <div className="products">
        <p className='results'>Resultados: {appliedFilters ? filteredProducts.length : finalProducts.length}</p>
        {appliedFilters && filteredProducts.length === 0 && <p>No hay resultados con los filtros seleccionados.</p>}
        {(appliedFilters ? filteredProducts : finalProducts).map((product, i) => {
          // Agrega la condición para verificar si el producto está publicado
          return product.published ? (
            <ProductCard
              key={i}
              product={product}
              showName
              showSku
              showTags
              showDesc
              showGen
              showDownload
              showMenu
              showButton
            />
          ) : null;
        })}
      </div>
    </main>
  )
}