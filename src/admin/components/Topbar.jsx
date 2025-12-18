import { useState } from 'react'
import PropTypes from 'prop-types'
import { Nav, Button } from 'react-bootstrap'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { auth } from '../../utilities/firebase'
import {
  FaHome,
  FaUsers,
  FaBook,
  FaCalendarAlt,
  FaEnvelope,
  FaBars,
  FaTimes,
  FaUserTie
} from 'react-icons/fa'

export default function Topbar () {
  const location = useLocation()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  // 🔹 Admin navigation links
  const links = [
    { path: '/admin/dashboard', name: 'Overview', icon: <FaHome /> },
    { path: '/admin/clients', name: 'Clients', icon: <FaUsers /> },
    { path: '/admin/team', name: 'Team', icon: <FaUserTie /> }, // ✅ TEAM ADDED
    { path: '/admin/blogs', name: 'Blogs', icon: <FaBook /> },
    {
      path: '/admin/appointments',
      name: 'Appointments',
      icon: <FaCalendarAlt />
    },
    { path: '/admin/contacts', name: 'Contacts', icon: <FaEnvelope /> }
  ]

  const handleLogout = async () => {
    await signOut(auth)
    navigate('/')
  }

  const toggleMobile = () => setMobileOpen(prev => !prev)

  return (
    <>
      {/* ================= TOP BAR ================= */}
      <div
        className='topbar d-flex align-items-center justify-content-between px-3 shadow-sm'
        style={{
          backgroundColor: '#0d6efd',
          color: '#fff',
          position: 'sticky',
          top: 0,
          zIndex: 1050
        }}
      >
        {/* Left: Hamburger + Branding */}
        <div className='d-flex align-items-center'>
          <button
            className='btn btn-link text-white fs-4 d-md-none me-2'
            onClick={toggleMobile}
            style={{ textDecoration: 'none' }}
          >
            {mobileOpen ? <FaTimes /> : <FaBars />}
          </button>
          <h5 className='m-0 fw-bold d-none d-md-block'>Admin Panel</h5>
        </div>

        {/* Desktop Navigation */}
        <Nav className='d-none d-md-flex gap-3 align-items-center'>
          {links.map(link => (
            <Nav.Link
              as={Link}
              to={link.path}
              key={link.path}
              className={`text-white d-flex align-items-center px-2 py-1 ${
                location.pathname === link.path
                  ? 'bg-light bg-opacity-25 rounded'
                  : ''
              }`}
              style={{
                transition: 'all 0.2s',
                whiteSpace: 'nowrap'
              }}
            >
              <span className='me-1'>{link.icon}</span>
              <span>{link.name}</span>
            </Nav.Link>
          ))}
        </Nav>

        {/* Right: Logout */}
        <div className='d-flex align-items-center'>
          <Button variant='outline-light' size='sm' onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </div>

      {/* ================= MOBILE MENU ================= */}
      {mobileOpen && (
        <>
          {/* Overlay */}
          <div
            className='position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-md-none'
            onClick={toggleMobile}
            style={{ zIndex: 1048 }}
          />

          {/* Drawer */}
          <div
            className='position-fixed top-0 start-0 w-75 bg-primary text-white d-flex flex-column p-3 d-md-none'
            style={{ height: '100vh', zIndex: 1049 }}
          >
            {links.map(link => (
              <Nav.Link
                as={Link}
                to={link.path}
                key={link.path}
                onClick={toggleMobile}
                className={`text-white d-flex align-items-center px-2 py-2 mb-2 ${
                  location.pathname === link.path
                    ? 'bg-light bg-opacity-25 rounded'
                    : ''
                }`}
                style={{ transition: 'all 0.2s' }}
              >
                <span className='me-2'>{link.icon}</span>
                <span>{link.name}</span>
              </Nav.Link>
            ))}
          </div>
        </>
      )}
    </>
  )
}

// PropTypes (future-proofing)
Topbar.propTypes = {
  onToggleMobile: PropTypes.func
}
