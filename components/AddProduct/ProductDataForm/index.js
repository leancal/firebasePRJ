import React from 'react';
import { Form, Button } from 'react-bootstrap';

const ProductDataForm = ({ product, handleChange, handleFileUpload, handleImageUpload, selectedImagePreviews, selected360ImagePreviews, handleAddColor, colorInput, handleRemoveColor, showFileUploadButto, handleColorInputChange }) => {

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