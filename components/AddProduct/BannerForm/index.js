// components/BannerForm.js
import React from 'react';
import { Form, Button } from 'react-bootstrap';

const BannerForm = ({
    bannerFields,
    handleBannerImageUpload,
    handleAddBanner,
    showBannerAddedAlert,
    setBannerFields,
}) => {
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
