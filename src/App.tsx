import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import Reviews from './components/Reviews';
import About from './components/About';
import Contact from './components/Contact';
import Footer from './components/Footer';
import Privacy from './components/Privacy';
import Orders from './components/orders';
import { Products } from './pages/Products';
import { AuthProvider } from './hooks/useAuth';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Profile } from './pages/Profile';
import { CartProvider } from './components/CartContext'
import { ResetPasswordForm } from './components/ResetPassword';
import { UpdatePasswordForm } from './components/UpdatePassword';
import { ResetPasswordRoute } from './components/ResetPasswordRoute';


function HomePage() {
  return (
    <>
      <Hero />
      <Features />
      <Reviews />
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router basename="">
          <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
            <Navbar />
            <main className="flex-1">
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route 
                  path="/products" 
                  element={
                    <ProtectedRoute>
                      <Products />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/profile" 
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/orders" 
                  element={
                    <ProtectedRoute>
                      <Orders />
                    </ProtectedRoute>
                  } 
                />
                <Route path="/reset-password" element={<ResetPasswordForm />} />
                <Route 
                  path="/update-password" 
                  element={
                  <ResetPasswordRoute>
                    <UpdatePasswordForm />
                  </ResetPasswordRoute>
                  } 
                />
                <Route path="/" element={<HomePage />} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;