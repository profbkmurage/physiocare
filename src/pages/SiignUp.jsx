import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Form, Button, Container, Alert } from 'react-bootstrap'
import { auth, db } from '../utilities/firebase'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'

export default function Signup () {
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

    setLoading(true)

    try {
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      )
      const user = userCredential.user

      // Add user to Firestore 'users' collection with role
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        role: 'normal', // default role
        createdAt: serverTimestamp()
      })

      navigate('/appointments') // redirect after signup
    } catch (err) {
      console.error(err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container style={{ maxWidth: '400px', marginTop: '50px' }}>
      <h2 className='mb-4'>Signup</h2>
      {error && <Alert variant='danger'>{error}</Alert>}
      <Form onSubmit={handleSubmit}>
        <Form.Group className='mb-3'>
          <Form.Label>Email</Form.Label>
          <Form.Control
            type='email'
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder='Enter email'
          />
        </Form.Group>

        <Form.Group className='mb-3'>
          <Form.Label>Password</Form.Label>
          <Form.Control
            type='password'
            required
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder='Enter password'
          />
        </Form.Group>

        <Form.Group className='mb-3'>
          <Form.Label>Confirm Password</Form.Label>
          <Form.Control
            type='password'
            required
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            placeholder='Confirm password'
          />
        </Form.Group>

        <Button type='submit' disabled={loading} className='w-100'>
          {loading ? 'Creating account...' : 'Sign Up'}
        </Button>
      </Form>

      <p className='mt-3'>
        Already have an account? <Link to='/login'>Login</Link>
      </p>
    </Container>
  )
}
