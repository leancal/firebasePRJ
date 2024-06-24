import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { lvTwoCat, lvThreeCat } from '../../content/categories';
import ProductCard from '../ProductCard';
import FormGroup from '@mui/material/FormGroup';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import Button from '@mui/material/Button';

const getCategoryIdByName = (categoryName, categories) => {
    const category = categories.find((cat) => cat.name === categoryName);
    return category ? category.id : null;
};

const MultipleProdContainer = () => {
    const [products, setProducts] = useState([]);
    const [showBackToTop, setShowBackToTop] = useState(false);
    const [mobileMenu, setMobileMenu] = useState(true);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [appliedFilters, setAppliedFilters] = useState(false);
    const [selectedCategoriesLvThreeIds, setSelectedCategoriesLvThreeIds] = useState([]);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [selectedCategoryLvTwo, setSelectedCategoryLvTwo] = useState('');
    const [selectedCategoryId, setSelectedCategoryId] = useState(null);
    const [selectedSubCategoryId, setSelectedSubCategoryId] = useState(null);


    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const collection = 'cooks';
                const collectionRef = db.collection(collection);
                const snapshot = await collectionRef.get();

                const productsData = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));

                setProducts(productsData);
                setFilteredProducts(productsData); // Agrega esta línea para inicializar filteredProducts
            } catch (error) {
                console.error('Error fetching products:', error);
            }
        };

        fetchProducts();
    }, []);


    const handleCategoryLvTwoChange = (categoryName) => {
        const categoryId = getCategoryIdByName(categoryName, lvTwoCat);
        setSelectedCategoryId(categoryId);
        setSelectedCategoryLvTwo(categoryName);
        setSelectedCategoriesLvThreeIds([]);
        setSelectedSubCategoryId(null);
        setShowBackToTop(true);
        applyFilter(categoryId, null);
    };

    const handleCategoryLvThreeChange = (selectedValues) => {
        const subCategoryId = selectedValues[0];
        setSelectedCategoriesLvThreeIds([subCategoryId]);
        setSelectedSubCategoryId(subCategoryId);
        setShowBackToTop(true);
        applyFilter(selectedCategoryId, subCategoryId);
    };

    const applyFilter = (categoryId, subCategoryId) => {
        setAppliedFilters(true);

        if (categoryId === null && subCategoryId === null) {
            // No filters applied, show all products
            setFilteredProducts(products);
            return;
        }

        const filteredProducts = products.filter((product) => {
            const matchesCategories =
                selectedCategories.length === 0 ||
                selectedCategories.every((categoryName) =>
                    product.secondCategories &&
                    product.secondCategories.includes(
                        getCategoryIdByName(categoryName)
                    )
                );

            const matchesCategory = categoryId === null || product.secondCategories.includes(categoryId);
            const matchesSubCategory = subCategoryId === null || product.thirdsCategories.includes(subCategoryId);

            return (
                (!product.secondCategories || !product.secondCategories.includes(110)) &&
                matchesCategories &&
                matchesCategory &&
                matchesSubCategory
            );
        });

        setFilteredProducts(filteredProducts);
    };



    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    };

    const openMobileMenu = () => {
        setMobileMenu((prev) => !prev);
        setShowBackToTop(true);
    };

    return (
        <main className="search">
            <aside style={{ width: "0%", minWidth: "250px" }} className={`filters ${mobileMenu && 'open'}`}>
                <button
                    className={`mobile-open ${mobileMenu && 'open'}`}
                    onClick={openMobileMenu}
                >
                    <ArrowUpwardIcon />
                </button>
                <div className="wrapper">

                    <FormControl fullWidth>
                        <InputLabel>Categoría</InputLabel>
                        <Select
                            value={selectedCategoryLvTwo}
                            onChange={(e) => handleCategoryLvTwoChange(e.target.value)}
                        >
                            <MenuItem value="">
                                <em>Ver todos</em>
                            </MenuItem>
                            {lvTwoCat
                                .filter((category) => category.parent === 6)
                                .map((category) => (
                                    <MenuItem key={category.name} value={category.name}>
                                        {category.name}
                                    </MenuItem>
                                ))}
                        </Select>
                    </FormControl>

                    {selectedCategoryLvTwo && (
                        <FormControl fullWidth>
                            <InputLabel>Subcategoría</InputLabel>
                            <Select
                                value={selectedCategoriesLvThreeIds[0] || ''}
                                onChange={(e) => handleCategoryLvThreeChange([e.target.value])}
                            >
                                {lvThreeCat
                                    .filter((category) => category.parent === getCategoryIdByName(selectedCategoryLvTwo, lvTwoCat))
                                    .map((category) => (
                                        <MenuItem key={category.id} value={category.id}>
                                            {category.name}
                                        </MenuItem>
                                    ))}
                            </Select>
                        </FormControl>
                    )}

                    <button
                        className={`back-to-top ${showBackToTop && 'visible'}`}
                        onClick={scrollToTop}
                    >
                        <ArrowUpwardIcon fontSize="small" />
                        Volver arriba
                    </button>
                </div>

            </aside>
            <div className="products">
                <p className="results">
                    Resultados:{' '}
                    {appliedFilters
                        ? filteredProducts.length
                        : products.length}
                </p>
                {appliedFilters && filteredProducts.length === 0 && (
                    <p>No hay resultados con los filtros seleccionados.</p>
                )}
                {filteredProducts.map((product, i) => (
                    product.published && (
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
                    )
                ))}
            </div>

        </main>
    );
};

export default MultipleProdContainer;
