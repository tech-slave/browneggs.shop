import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/common/Navbar';
import Hero from './components/layout/Hero';
import Features from './components/layout/Features';
import Reviews from './components/layout/Reviews';
import About from './components/pages/About';
import Contact from './components/pages/Contact';
import Footer from './components/common/Footer';
import Privacy from './components/pages/Privacy';
import Orders from './components/pages/orders';
import { Products } from './components/pages/Products';
import { AuthProvider } from './hooks/useAuth';
import { Login } from './components/auth/Login';
import { Signup } from './components/auth/Signup';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { Profile } from './components/pages/Profile';
import { CartProvider } from './components/context/CartContext'
import { ResetPasswordForm } from './components/auth/ResetPassword';
import { UpdatePasswordForm } from './components/auth/UpdatePassword';
import { ResetPasswordRoute } from './components/auth/ResetPasswordRoute';
import { LoadingProvider } from './components/context/LoadingContext';
import { OMS } from './components/pages/OMS';
import { AdminRoute } from './components/common/AdminRoute';


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
      <LoadingProvider>
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
                  <Route 
                    path="/oms" 
                    element={
                      <AdminRoute>
                        <OMS />
                      </AdminRoute>
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
      </LoadingProvider>
    </AuthProvider>
  );
}

export default App;