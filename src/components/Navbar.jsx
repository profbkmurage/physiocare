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
      <Container>
        <Navbar.Brand as={Link} to='/' className='text-white fw-bold'>
          <FaHeartbeat className='me-2' /> PhysioCare — Dr. Jasmine Gatiba
        </Navbar.Brand>
        <Navbar.Toggle aria-controls='basic-navbar-nav' />
        <Navbar.Collapse id='basic-navbar-nav'>
          <Nav className='me-auto'>
            <Nav.Link as={Link} to='/' className='text-white'>
              <FaHome className='me-1' /> Home
            </Nav.Link>
            <Nav.Link as={Link} to='/services' className='text-white'>
              <FaBookMedical className='me-1' /> Services
            </Nav.Link>
            <Nav.Link as={Link} to='/blog' className='text-white'>
              <FaBlog className='me-1' /> Blog
            </Nav.Link>
            {user && (
              <Nav.Link as={Link} to='/appointments' className='text-white'>
                <FaCalendarAlt className='me-1' /> My Appointments
              </Nav.Link>
            )}
          </Nav>

          <Nav>
            {user ? (
              <Button
                variant='outline-light'
                onClick={handleLogout}
                className='fw-bold d-flex align-items-center'
              >
                <FaSignOutAlt className='me-1' /> Logout
              </Button>
            ) : (
              <>
                <Button
                  variant='outline-light'
                  as={Link}
                  to='/login'
                  className='me-2 fw-bold d-flex align-items-center'
                >
                  <FaSignInAlt className='me-1' /> Login
                </Button>
                <Button
                  variant='light'
                  as={Link}
                  to='/register'
                  className='fw-bold d-flex align-items-center'
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
