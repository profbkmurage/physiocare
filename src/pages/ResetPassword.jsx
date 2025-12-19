import { useState } from 'react'
import { Container, Card, Form, Button, Alert } from 'react-bootstrap'
import { sendPasswordResetEmail } from 'firebase/auth'
import { auth } from '../utilities/firebase'
import { Link } from 'react-router-dom'

export default function ResetPassword () {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleReset = async e => {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)

    try {
      await sendPasswordResetEmail(auth, email)
      setMessage(
        'Password reset email sent. Please check your inbox (and spam folder).'
      )
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container
      className='d-flex align-items-center justify-content-center'
      style={{ minHeight: '100vh' }}
    >
      <Card className='p-4 shadow' style={{ maxWidth: '400px', width: '100%' }}>
        <h3 className='text-center mb-3'>Reset Password</h3>

        {error && <Alert variant='danger'>{error}</Alert>}
        {message && <Alert variant='success'>{message}</Alert>}

        <Form onSubmit={handleReset}>
          <Form.Group className='mb-3'>
            <Form.Label>Email address</Form.Label>
            <Form.Control
              type='email'
              required
              placeholder='Enter your registered email'
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </Form.Group>

          <Button type='submit' className='w-100' disabled={loading}>
            {loading ? 'Sending...' : 'Send Reset Link'}
          </Button>
        </Form>

        <div className='text-center mt-3'>
          <Link to='/login'>Back to Login</Link>
        </div>
      </Card>
    </Container>
  )
}
