import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../utils/AuthContext';
import { auth } from '../../firebase';
import UserAuth from './UserAuth';
import app from '../../firebase';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import Alert from '../Alert';
import { useRouter } from 'next/router';
import { Button, Form } from 'react-bootstrap';
import Autocomplete from '@mui/material/Autocomplete';

const db = getFirestore(app)

const Home = () => {
  const router = useRouter();
  const { currentUser } = useAuth();
  const [logout, setLogout] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCategories, setSelectedCategories] = useState(new Set());
  const [searchText, setSearchText] = useState('');


  const handleAddProductClick = () => {
    // Navega a la página AddProduct
    router.push('/newProducts');
  };

  const handleEditProductClick = () => {
    // Navega a la página AddProduct
    router.push('/editProduct');
  };

  const handleLogout = () => {
    auth.signOut().then(() => {
      setLogout(true);
    });
  };

  const toggleCategory = (category) => {
    const updatedCategories = new Set(selectedCategories);

    if (updatedCategories.has(category)) {
      updatedCategories.delete(category);
    } else {
      updatedCategories.add(category);
    }

    setSelectedCategories(updatedCategories);
  };


  useEffect(() => {
    const fetchData = async () => {
      const db = getFirestore(app);

      // Nombres de las colecciones que deseas consultar
      const collectionNames = ['audio', 'headsets', 'notebooks', 'tablets', 'cooks'];

      // Array para almacenar todos los productos de las colecciones
      const allProducts = [];

      for (const collectionName of collectionNames) {
        const productsRef = collection(db, collectionName);

        try {
          const querySnapshot = await getDocs(productsRef);
          const productsData = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          // Agrega los productos de esta colección al array
          allProducts.push(...productsData);
        } catch (error) {
          console.error(`Error fetching products from ${collectionName}: `, error);
        }
      }

      // Establece el estado con todos los productos de las colecciones
      setProducts(allProducts);
    };

    fetchData();
  }, []);

  function mapCategoryToName(category) {
    switch (category) {
      case '1':
        return 'Audio';
      case '2':
        return 'Informática';
      case '3':
        return 'Hogar';
      case '4':
        return 'Discontinuos';
      case '5':
        return 'Headsets';
      case '6':
        return 'Cooks';
      case '101':
        return 'Parlantes';
      case '102':
        return 'Torres de sonido';
      case '103':
        return 'Auriculares In‑ear';
      case '104':
        return 'Auriculares On‑ear';
      case '105':
        return 'Portable';
      case '106':
        return 'Tablets';
      case '107':
        return 'Notebooks';
      case '108':
        return 'TV';
      case '110':
        return 'Discontinuos';
      case '111':
        return 'Barras de Sonido';
      default:
        return 'All'; // Cambia 'category' a 'All' para mostrar todos los productos
    }
  }



  if (logout) {
    return <UserAuth />;
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
            <li className="sidebar-list-item active">
              <a href="#">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="feather feather-shopping-bag"
                >
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
                <span>Productos</span>
              </a>
            </li>
            <li>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Control
                    className='form-title'
                    style={{ color: 'black' }}
                    type="text"
                    placeholder="Buscar por Nombre o SKU"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                  />
                </Form.Group>
              </Form>
            </li>
            <li>
              <label>
                <Form.Check
                  className='form-title'
                  type="checkbox"
                  label="Headsets"
                  name="Headsets"
                  checked={selectedCategories.has('Headsets')}
                  onChange={() => toggleCategory('Headsets')}
                />
              </label>
            </li>
            <li>
              <label>
                <Form.Check
                  className='form-title'
                  type="checkbox"
                  label="Audio"
                  name="Audio"
                  checked={selectedCategories.has('Audio')}
                  onChange={() => toggleCategory('Audio')}
                />
              </label>
            </li>
            <li>
              <label>
                <Form.Check
                  className='form-title'
                  type="checkbox"
                  label="Informática"
                  name="Informática"
                  checked={selectedCategories.has('Informática')}
                  onChange={() => toggleCategory('Informática')}
                />
              </label>
            </li>
            <li>
              <label>
                <Form.Check
                  className='form-title'
                  type="checkbox"
                  label="Cooks"
                  name="Cooks"
                  checked={selectedCategories.has('Cooks')}
                  onChange={() => toggleCategory('Cooks')}
                />
              </label>
            </li>
            <li>
              <label>
                <Form.Check
                  className='form-title'
                  type="checkbox"
                  label="Discontinuos"
                  name="Discontinuos"
                  checked={selectedCategories.has('Discontinuos')}
                  onChange={() => toggleCategory('Discontinuos')}
                />
              </label>
            </li>

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
        <div className="app-content">
          <div className="app-content-header">
            <h1 className="app-content-headerText">Productos</h1>

            <button className="app-content-headerButton" onClick={handleEditProductClick}>Editar Productos</button>
            <button className="app-content-headerButton" onClick={handleAddProductClick}>Añadir Producto</button>
            <button onClick={handleLogout} variant="danger" className="app-content-headerButton">
              Logout
            </button>
          </div>
          <div className="app-content-actions">

          </div>
          <div className="products-area-wrapper tableView">
            <div className="products-header">
              <div className="product-cell image">
                Productos
              </div>
              <div className="product-cell category">Categoria</div>
              <div className="product-cell status-cell">Sku</div>
            </div>
            {products
              .filter((product) => {
                const productCategory = mapCategoryToName(product.categories);
                const productName = (product.name || '').toLowerCase();
                const sku = (product.sku || '').toLowerCase();
                const search = searchText.toLowerCase();

                // Verifica si la categoría está seleccionada y si el texto de búsqueda está presente en el nombre del producto o en el SKU
                return (
                  (selectedCategories.size === 0 || selectedCategories.has(productCategory)) &&
                  (productName.includes(search) || sku.includes(search))
                );
              })
              .map((product) => (
                <div className="products-row" key={product.id}>
                  <div className="product-cell name">
                    {product.imgs && product.imgs.length > 0 ? (
                      <img src={product.imgs[0]} alt="Product" />
                    ) : null}

                    {product.name}
                  </div>
                  <div className="product-cell category">
                    <span className="cell-label">Categoria:</span>
                    {mapCategoryToName(product.categories)}
                  </div>
                  <div className="product-cell status-cell">
                    <span className="cell-label">Sku:</span>
                    <span className={`status ${product.status ? product.status.toLowerCase() : ''}`}>
                      {product.sku}
                    </span>
                  </div>

                </div>
              ))}
          </div>
        </div>
      </div>

    </div>
  );
};

export default Home;



