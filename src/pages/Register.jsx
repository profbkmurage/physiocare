import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Form, Button, Container, Alert, Row, Col } from 'react-bootstrap'
import { FaEnvelope, FaLock, FaGoogle, FaUserCircle } from 'react-icons/fa'
import { auth, db } from '../utilities/firebase'
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth'
import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore'

export default function Register () {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      )
      const user = userCredential.user

      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        role: 'normal',
        createdAt: serverTimestamp()
      })

      navigate('/appointments')
    } catch (err) {
      console.error(err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Google Sign-Up
  const handleGoogleSignUp = async () => {
    setError('')
    setLoading(true)
    try {
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(auth, provider)
      const user = result.user

      // Check if user exists in Firestore
      const userRef = doc(db, 'users', user.uid)
      const userSnap = await getDoc(userRef)
      if (!userSnap.exists()) {
        await setDoc(userRef, {
          uid: user.uid,
          email: user.email,
          name: user.displayName || '',
          role: 'normal',
          createdAt: serverTimestamp()
        })
      }

      navigate('/appointments')
    } catch (err) {
      console.error(err)
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
          <div className='text-center mb-4'>
            <FaUserCircle size={60} color='#0d6efd' />
            <h2 className='mt-2'>Sign Up</h2>
            <p className='text-muted'>Create your account securely</p>
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
                placeholder='Enter your email'
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

            <Form.Group className='mb-3'>
              <Form.Label>
                <FaLock className='me-2' /> Confirm Password
              </Form.Label>
              <Form.Control
                type='password'
                required
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder='Confirm password'
              />
            </Form.Group>

            <Button type='submit' disabled={loading} className='w-100 mb-3'>
              {loading ? 'Creating account...' : 'Sign Up'}
            </Button>
          </Form>

          <div className='d-grid gap-2 mb-3'>
            <Button
              variant='danger'
              size='lg'
              onClick={handleGoogleSignUp}
              disabled={loading}
              className='d-flex align-items-center justify-content-center'
            >
              <FaGoogle className='me-2' /> Sign up with Google
            </Button>
          </div>

          <p className='text-center text-muted'>
            Already have an account? <Link to='/login'>Login</Link>
          </p>
        </Col>
      </Row>
    </Container>
  )
}
