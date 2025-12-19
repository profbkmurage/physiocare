import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation
} from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ResetPassword from './pages/ResetPassword'
import ChangePassword from'./pages/ChangePassword'

// ================= COMPONENTS =================
import CustomNavbar from './components/Navbar'

// ================= USER PAGES =================
import LandingPage from './pages/LandingPage'
import Services from './components/Services'
import Blog from './components/Blog'
import SingleBlog from './pages/SingleBlog'
import Login from './pages/Login'
import Register from './pages/Register'
import Appointments from './components/Appointments'

// ================= ADMIN PAGES =================
import AdminDashboard from './admin/AdminDashboard'
import BlogsAdmin from './admin/pages/BlogsAdmin'
import AppointmentsAdmin from './admin/pages/AppointmentsAdmin'
import ContactsAdmin from './admin/pages/ContactsAdmin'
import ClientsAdmin from './admin/pages/ClientsAdmin'
import AdminTeam from './admin/pages/AdminTeam' // ✅ TEAM PAGE

// ================= ADMIN LAYOUT =================
import AdminTopbar from './admin/components/Topbar'
import AdminRoute from './admin/utils/AdminRoutes'

// ================= AUTH =================
import PrivateRoute from './context/PrivateRoute'

// ================= ADMIN LAYOUT WRAPPER =================
// eslint-disable-next-line react/prop-types
const AdminLayout = ({ children }) => (
  <div className='d-flex' style={{ minHeight: '100vh' }}>
    <div className='flex-grow-1 bg-light'>
      <AdminTopbar />
      <div className='p-4'>{children}</div>
    </div>
  </div>
)

// ================= APP CONTENT =================
function AppContent () {
  const location = useLocation()
  const isAdminRoute = location.pathname.startsWith('/admin')

  return (
    <>
      {/* Show public navbar only on non-admin routes */}
      {!isAdminRoute && <CustomNavbar />}

      <Routes>
        {/* ======== PUBLIC ROUTES ======== */}
        <Route path='/' element={<LandingPage />} />
        <Route path='/services' element={<Services />} />
        <Route path='/blog' element={<Blog />} />
        <Route path='/blog/:id' element={<SingleBlog />} />
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />
        <Route path='/reset-password' element={<ResetPassword />} />
;<Route path='/change-password' element={<ChangePassword />} />

        {/* ======== PROTECTED USER ROUTE ======== */}
        <Route
          path='/appointments'
          element={
            <PrivateRoute>
              <Appointments />
            </PrivateRoute>
          }
        />

        {/* ======== ADMIN ROUTES (ADMIN ONLY) ======== */}
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

        {/* ✅ ADMIN TEAM ROUTE (ADMIN ONLY) */}
        <Route
          path='/admin/team'
          element={
            <AdminRoute>
              <AdminLayout>
                <AdminTeam />
              </AdminLayout>
            </AdminRoute>
          }
        />
      </Routes>
    </>
  )
}

// ================= ROOT =================
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
