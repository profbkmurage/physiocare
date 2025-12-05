import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation
} from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'

// Components
import CustomNavbar from './components/Navbar'

// User Pages
import LandingPage from './pages/LandingPage'
import Services from './components/Services'
import Blog from './components/Blog'
import SingleBlog from './pages/SingleBlog.jsx'
import Login from './pages/Login'
import Register from './pages/Register'
import Appointments from './components/Appointments'

// Admin Pages
import AdminDashboard from './admin/AdminDashboard'
import BlogsAdmin from './admin/pages/BlogsAdmin'
import AppointmentsAdmin from './admin/pages/AppointmentsAdmin'
import ContactsAdmin from './admin/pages/ContactsAdmin'
import ClientsAdmin from './admin/pages/ClientsAdmin'

// Admin Layout
import AdminTopbar from './admin/components/Topbar'
import AdminRoute from './admin/utils/AdminRoutes'

// Private route for normal users
import PrivateRoute from './context/PrivateRoute'

// ---------------- Admin Layout wrapper ----------------
// eslint-disable-next-line react/prop-types
const AdminLayout = ({ children }) => (
  <div className='d-flex' style={{ minHeight: '100vh' }}>
    <div className='flex-grow-1 bg-light'>
      <AdminTopbar />
      <div className='p-4'>{children}</div>
    </div>
  </div>
)

// ---------------- App Content: switches layout ----------------
function AppContent () {
  const location = useLocation()
  const isAdminRoute = location.pathname.startsWith('/admin')

  return (
    <>
      {!isAdminRoute && <CustomNavbar />}

      <Routes>
        {/* Public routes */}
        <Route path='/' element={<LandingPage />} />
        <Route path='/services' element={<Services />} />
        <Route path='/blog' element={<Blog />} />
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />
        <Route path='/blog' element={<Blog />} />
        <Route path='/blog/:id' element={<SingleBlog />} />
        {/* Protected user route */}
        <Route
          path='/appointments'
          element={
            <PrivateRoute>
              <Appointments />
            </PrivateRoute>
          }
        />
        {/* Admin routes */}
        <Route
          path='/admin/dashboard'
          element={
            <AdminRoute>
              <AdminLayout>
                <AdminDashboard />
              </AdminLayout>
            </AdminRoute>
          }
        />
        <Route
          path='/admin/blogs'
          element={
            <AdminRoute>
              <AdminLayout>
                <BlogsAdmin />
              </AdminLayout>
            </AdminRoute>
          }
        />
        <Route
          path='/admin/appointments'
          element={
            <AdminRoute>
              <AdminLayout>
                <AppointmentsAdmin />
              </AdminLayout>
            </AdminRoute>
          }
        />
        ;
        <Route
          path='/admin/contacts'
          element={
            <AdminRoute>
              <AdminLayout>
                <ContactsAdmin />
              </AdminLayout>
            </AdminRoute>
          }
        />
        ;
        <Route
          path='/admin/clients'
          element={
            <AdminRoute>
              <AdminLayout>
                <ClientsAdmin />
              </AdminLayout>
            </AdminRoute>
          }
        />
      </Routes>
    </>
  )
}

// ---------------- Root Wrapper ----------------
function App () {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  )
}

export default App
