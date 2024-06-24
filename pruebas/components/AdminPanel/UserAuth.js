import React, { useState, useEffect } from 'react';
import { auth } from '../..//firebase';
import { Button } from 'react-bootstrap';
import { Redirect } from 'react-router-dom'; // Importa Redirect
import Home from './Home';

const UserAuth = () => {
    const [data, setData] = useState({
        email: "",
        password: ""
    });
    const { email, password } = data;
    const [loggedIn, setLoggedIn] = useState(false);

    useEffect(() => {
        // Verifica si el usuario está autenticado al cargar la página
        const user = auth.currentUser;
        if (user) {
            setLoggedIn(true);
        }

        // Establece un temporizador para realizar un cierre de sesión después de 10 minutos
        const logoutTimer = setTimeout(() => {
            auth.signOut();
            localStorage.removeItem('authState'); // Limpia el estado de autenticación del almacenamiento local
            setLoggedIn(false);
        }, 10 * 60 * 1000); // 10 minutos en milisegundos

        return () => {
            // Limpia el temporizador al desmontar el componente
            clearTimeout(logoutTimer);
        };
    }, []);

    const changeHandler = (e) => {
        setData({ ...data, [e.target.name]: e.target.value });
    };

    const signin = (e) => {
        e.preventDefault();
        auth.signInWithEmailAndPassword(email, password)
            .then(() => {
                setLoggedIn(true);
                // Almacena el estado de autenticación en el almacenamiento local
                localStorage.setItem('authState', 'authenticated');
            })
            .catch((err) => alert("Credenciales inválidas"));
    };

    // Si loggedIn es true, redirige al usuario a la página de inicio
    if (loggedIn) {
        return <Home />;
    }

    return (
        <div className="container">
            <div className="screen">
                <div className="screen__content">
                    <form className="login" autoComplete="off">
                        <div className="login__field">
                            <i className="login__icon fas fa-user"></i>
                            <input
                                type="text"
                                className="login__input"
                                placeholder="User name / Email"
                                name="email"
                                value={email}
                                onChange={changeHandler}
                            />
                        </div>
                        <div className="login__field">
                            <i className="login__icon fas fa-lock"></i>
                            <input
                                type="password"
                                className="login__input"
                                placeholder="Password"
                                name="password"
                                value={password}
                                onChange={changeHandler}
                            />
                        </div>
                        <button className="button login__submit" onClick={signin}>
                            <span className="button__text">Log In Now</span>
                            <i className="button__icon fas fa-chevron-right"></i>
                        </button>
                    </form>

                </div>
                <div className="screen__background">
                    <span className="screen__background__shape screen__background__shape4"></span>
                    <span className="screen__background__shape screen__background__shape3"></span>
                    <span className="screen__background__shape screen__background__shape2"></span>
                    <span className="screen__background__shape screen__background__shape1"></span>
                </div>
            </div>
        </div>
    );
};

export default UserAuth;
