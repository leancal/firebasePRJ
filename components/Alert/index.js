import React from 'react';

const Alert = ({ message, onClose }) => {
    return (
        <div className="alert alert-danger">
            <button type="button" className="btn-close" onClick={onClose}></button>
            {message}
        </div>
    );
};

export default Alert;
