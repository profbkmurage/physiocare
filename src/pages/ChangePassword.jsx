import { useState } from 'react'
import { Container, Card, Form, Button, Alert } from 'react-bootstrap'
import { updatePassword } from 'firebase/auth'
import { auth } from '../utilities/firebase'

export default function ChangePassword () {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = async e => {
    e.preventDefault()
    setError('')
    setMessage('')

    if (password !== confirm) {
      return setError('Passwords do not match')
    }

    try {
      setLoading(true)
      await updatePassword(auth.currentUser, password)
      setMessage('Password updated successfully')
      setPassword('')
      setConfirm('')
    } catch (err) {
      setError(
        err.message.includes('recent login')
          ? 'Please log out and log in again to change password.'
          : err.message
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container className='d-flex justify-content-center'>
      <Card className='p-4 shadow' style={{ maxWidth: 400, width: '100%' }}>
        <h4 className='text-center mb-3'>Change Password</h4>

        {error && <Alert variant='danger'>{error}</Alert>}
        {message && <Alert variant='success'>{message}</Alert>}

        <Form onSubmit={handleChange}>
          <Form.Group className='mb-3'>
            <Form.Label>New Password</Form.Label>
            <Form.Control
              type='password'
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </Form.Group>

          <Form.Group className='mb-3'>
            <Form.Label>Confirm Password</Form.Label>
            <Form.Control
              type='password'
              required
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
            />
          </Form.Group>

          <Button type='submit' className='w-100' disabled={loading}>
            {loading ? 'Updating...' : 'Update Password'}
          </Button>
        </Form>
      </Card>
    </Container>
  )
}
