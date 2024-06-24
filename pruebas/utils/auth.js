import { auth } from '../firebase';

export function isUserAuthenticated() {
  const user = auth.currentUser;
  return !!user;
}

export function redirectToLogin(res) {
  res.writeHead(302, {
    Location: '/login', // Reemplaza con la ruta de tu página de inicio de sesión
  });
  res.end();
}
