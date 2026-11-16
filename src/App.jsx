import { Navigate, Route, Routes } from 'react-router';
import { useAuth } from './auth.jsx';
import Layout from './components/Layout.jsx';
import { Splash } from './components/States.jsx';
import AdminPage from './pages/AdminPage.jsx';
import AuthPage from './pages/AuthPage.jsx';
import HomePage from './pages/HomePage.jsx';
import MeetupPage from './pages/MeetupPage.jsx';
import NewPasswordPage from './pages/NewPasswordPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import SecretSantaPage from './pages/SecretSantaPage.jsx';

export default function App() {
  const { user, checking } = useAuth();

  if (checking) return <Splash />;
  if (!user) return <AuthPage />;
  if (user.mustChangePassword) return <NewPasswordPage />;

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="quedada" element={<MeetupPage />} />
        <Route path="amigo-invisible" element={<SecretSantaPage />} />
        <Route path="perfil" element={<ProfilePage />} />
        {user.isAdmin && <Route path="admin" element={<AdminPage />} />}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
