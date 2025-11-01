import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Form, Button, Container, Alert, Card, Row, Col } from 'react-bootstrap'
import { FaUserCircle, FaEnvelope, FaLock, FaGoogle } from 'react-icons/fa'
import { auth, db } from '../utilities/firebase'
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'

export default function Login () {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  // Email/Password login
  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      )
      const user = userCredential.user

      const userRef = doc(db, 'users', user.uid)
      const userSnap = await getDoc(userRef)

      if (userSnap.exists()) {
        const role = userSnap.data().role
        role === 'admin' || role === 'superadmin'
          ? navigate('/admin/dashboard')
          : navigate('/appointments')
      } else {
        navigate('/appointments')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Google Login
  const handleGoogleLogin = async () => {
    setError('')
    setLoading(true)
    try {
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(auth, provider)
      const user = result.user

      // Check Firestore user data
      const userRef = doc(db, 'users', user.uid)
      const userSnap = await getDoc(userRef)

      if (!userSnap.exists()) {
        // Create new user with default role "user"
        await setDoc(userRef, {
          name: user.displayName || '',
          email: user.email,
          role: 'user',
          createdAt: new Date()
        })
      }

      const role = userSnap?.data()?.role || 'user'
      role === 'admin' || role === 'superadmin'
        ? navigate('/admin/dashboard')
        : navigate('/appointments')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container
      fluid
      className='d-flex align-items-center justify-content-center'
      style={{ minHeight: '100vh', background: '#e3f2fd' }}
    >
      <Row className='w-100 justify-content-center'>
        <Col xs={12} sm={10} md={6} lg={4}>
          <Card className='shadow p-4' style={{ borderRadius: '15px' }}>
            <Card.Body>
              <div className='text-center mb-4'>
                <FaUserCircle size={60} color='#0d6efd' />
                <h2 className='mt-2'>Login</h2>
                <p className='text-muted'>Access your account securely</p>
              </div>

              {error && <Alert variant='danger'>{error}</Alert>}

              <Form onSubmit={handleSubmit}>
                <Form.Group className='mb-3'>
                  <Form.Label>
                    <FaEnvelope className='me-2' /> Email
                  </Form.Label>
                  <Form.Control
                    type='email'
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder='Enter email'
                  />
                </Form.Group>

                <Form.Group className='mb-3'>
                  <Form.Label>
                    <FaLock className='me-2' /> Password
                  </Form.Label>
                  <Form.Control
                    type='password'
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder='Enter password'
                  />
                </Form.Group>

                <Button
                  type='submit'
                  className='w-100 mb-3'
                  variant='primary'
                  size='lg'
                  disabled={loading}
                >
                  {loading ? 'Logging in...' : 'Login'}
                </Button>
              </Form>

              <div className='d-grid gap-2 mb-3'>
                <Button
                  variant='danger'
                  size='lg'
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  className='d-flex align-items-center justify-content-center'
                >
                  <FaGoogle className='me-2' /> Sign in with Google
                </Button>
              </div>

              <div className='text-center'>
                <p className='mb-0 text-muted'>
                  Don’t have an account? <Link to='/services'>Register in our services page</Link>
                </p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}
