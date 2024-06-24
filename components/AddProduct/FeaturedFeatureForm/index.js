// components/FeaturedFeaturesForm.js
import React from 'react';
import { Form, Button } from 'react-bootstrap';
import CloseIcon from '@mui/icons-material/Close'; // Ajusta la importación según tu estructura

const FeaturedFeaturesForm = ({
    newFeaturedFeatureId,
    newFeaturedFeatureName,
    newFeaturedFeatureDesc,
    newFeaturedFeatureImage,
    dbFeaturedFeatures,
    handleAddNewFeaturedFeature,
    handleFeaturedFeatureChange,
    selectedFeaturedFeatures,
    handleRemoveFeaturedFeature,
    setNewFeaturedFeatureId,
    setNewFeaturedFeatureName,
    setNewFeaturedFeatureDesc,
    setNewFeaturedFeatureImage,
}) => {
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
