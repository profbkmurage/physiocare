import { Navbar, Nav, Container, Button } from 'react-bootstrap'
import { Link, useNavigate } from 'react-router-dom'
import { auth } from '../utilities/firebase'
import { signOut } from 'firebase/auth'
import { useAuth } from '../context/AuthContext'
import {
  FaHome,
  FaBlog,
  FaCalendarAlt,
  FaUserPlus,
  FaSignInAlt,
  FaSignOutAlt,
  FaHeartbeat,
  FaBookMedical
} from 'react-icons/fa'

export default function CustomNavbar () {
  const { user } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await signOut(auth)
    navigate('/')
  }

  return (
    <Navbar
      expand='lg'
      variant='light'
      style={{ backgroundColor: '#0d6efd' }}
      className='shadow-sm mb-4'
    >
      <Container fluid>
        {/* Brand */}
        <Navbar.Brand
          as={Link}
          to='/'
          className='text-white fw-bold d-flex align-items-center'
          style={{
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}
        >
          <FaHeartbeat className='me-2' /> PhysioCare — Dr. Jasmine Gatiba
        </Navbar.Brand>

        {/* Hamburger toggle for mobile */}
        <Navbar.Toggle aria-controls='basic-navbar-nav' className='border-0' />

        <Navbar.Collapse id='basic-navbar-nav'>
          <Nav className='me-auto flex-column flex-lg-row'>
            <Nav.Link
              as={Link}
              to='/'
              className='text-white d-flex align-items-center mb-2 mb-lg-0'
            >
              <FaHome className='me-1' /> Home
            </Nav.Link>
            <Nav.Link
              as={Link}
              to='/services'
              className='text-white d-flex align-items-center mb-2 mb-lg-0'
            >
              <FaBookMedical className='me-1' /> Services
            </Nav.Link>
            <Nav.Link
              as={Link}
              to='/blog'
              className='text-white d-flex align-items-center mb-2 mb-lg-0'
            >
              <FaBlog className='me-1' /> Blog
            </Nav.Link>
            {user && (
              <Nav.Link
                as={Link}
                to='/appointments'
                className='text-white d-flex align-items-center mb-2 mb-lg-0'
              >
                <FaCalendarAlt className='me-1' /> My Appointments
              </Nav.Link>
            )}
          </Nav>

          <Nav className='flex-column flex-lg-row mt-2 mt-lg-0'>
            {user ? (
              <Button
                variant='outline-light'
                onClick={handleLogout}
                className='fw-bold d-flex align-items-center mb-2 mb-lg-0'
                style={{ whiteSpace: 'nowrap' }}
              >
                <FaSignOutAlt className='me-1' /> Logout
              </Button>
            ) : (
              <>
                <Button
                  variant='outline-light'
                  as={Link}
                  to='/login'
                  className='me-2 fw-bold d-flex align-items-center mb-2 mb-lg-0'
                  style={{ whiteSpace: 'nowrap' }}
                >
                  <FaSignInAlt className='me-1' /> Login
                </Button>
                <Button
                  variant='light'
                  as={Link}
                  to='/services'
                  className='fw-bold d-flex align-items-center mb-2 mb-lg-0'
                  style={{ whiteSpace: 'nowrap' }}
                >
                  <FaUserPlus className='me-1' /> Signup
                </Button>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}
