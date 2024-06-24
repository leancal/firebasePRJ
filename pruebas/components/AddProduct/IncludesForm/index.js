import React from 'react';
import { Form, Button, Image } from 'react-bootstrap';
import CloseIcon from '@mui/icons-material/Close';

const IncludesForm = ({
    newIncludeId,
    setNewIncludeId,
    newIncludeName,
    setNewIncludeName,
    allIncludes,
    handleImageChange,
    handleAddNewInclude,
    handleIncludesChange,
    selectedIncludes,
    handleRemoveIncludes,
}) => {
    return (
        <Form.Group controlId="includes">
            <Form.Group className="nice-form-group" controlId="newIncludeId">
                <Form.Label>ID del nuevo -Incluye-</Form.Label>
                <Form.Control
                    type="text"
                    name="newIncludeId"
                    value={newIncludeId}
                    onChange={(e) => setNewIncludeId(e.target.value.replace(/[^0-9]/g, ''))}
                />

                <Form.Label>Nombre del nuevo -Incluye-</Form.Label>
                <Form.Control
                    type="text"
                    name="newIncludeName"
                    value={newIncludeName}
                    onChange={(e) => setNewIncludeName(e.target.value)}
                />

                <Form.Group className="nice-form-group" controlId="newIncludeImg">
                    <Form.Label>Imagen del nuevo -Incluye-</Form.Label>
                    <Form.Control type="file" accept="image/*" onChange={handleImageChange} style={{ color: 'white' }} />
                </Form.Group>

                <Form.Label>
                    <Button style={{ marginTop: '10px' }} variant="primary" className="app-content-headerButton" onClick={handleAddNewInclude}>
                        Agregar nuevo -Incluye-
                    </Button>
                </Form.Label>
            </Form.Group>
            <Form.Group className="checkFormIncludes" controlId="includes">
                <Form.Label></Form.Label>
                {allIncludes
                    .sort((a, b) => Number(a.id) - Number(b.id)) // Ordenar por ID numérico ascendente
                    .map((includes) => (
                        <Form.Check
                            style={{ display: 'flex', alignItems: 'center' }}
                            key={`${includes.id} - ${includes.name} - ${includes.img}`}
                            type="checkbox"
                            label={
                                <div>
                                    <Image
                                        className="imgIncludes"
                                        src={includes.img}
                                        alt={`Image of ${includes.name}`}
                                        width={55}
                                        height={55}
                                    />
                                    {`${includes.id} - ${includes.name}`}
                                </div>
                            }
                            name="includes"
                            value={includes.id}
                            onChange={handleIncludesChange}
                            checked={selectedIncludes.includes(includes.id)}
                        />
                    ))}
            </Form.Group>
            {selectedIncludes.map((selectedInclude) => {
                const selectedIncludeObj = allIncludes.find((includes) => includes.id === selectedInclude);

                return (
                    <div key={selectedInclude} className="featuresSelected">
                        <button
                            type="button"
                            variant="danger"
                            className="app-content-headerButton"
                            onClick={() => handleRemoveIncludes(selectedInclude)}
                        >
                            <CloseIcon fontSize="" />
                        </button>
                        <li>{selectedIncludeObj ? selectedIncludeObj.name : selectedInclude}</li>
                    </div>
                );
            })}
        </Form.Group>
    );
};

export default IncludesForm;
