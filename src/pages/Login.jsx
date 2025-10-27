import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Form, Button, Container, Alert, Card, Row, Col } from 'react-bootstrap'
import { FaUserCircle, FaEnvelope, FaLock } from 'react-icons/fa'
import { auth, db } from '../utilities/firebase'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'

export default function Login () {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      // Sign in with Firebase Auth
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      )
      const user = userCredential.user

      // Fetch user role from Firestore
      const userRef = doc(db, 'users', user.uid)
      const userSnap = await getDoc(userRef)

      if (userSnap.exists()) {
        const userData = userSnap.data()
        const role = userData.role

        if (role === 'admin' || role === 'superadmin') {
          navigate('/admin/dashboard')
        } else {
          navigate('/appointments')
        }
      } else {
        // No role found — treat as normal user
        navigate('/appointments')
      }
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
        <Col md={6} lg={4}>
          <Card className='shadow p-4' style={{ borderRadius: '15px' }}>
            <Card.Body>
              <div className='text-center mb-4'>
                <FaUserCircle size={60} color='#0d6efd' />
                <h2 className='mt-2'>Admin / User Login</h2>
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

              <div className='text-center'>
                <p className='mb-0 text-muted'>
                  Don’t have an account? <Link to='/signup'>Sign Up</Link>
                </p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}
