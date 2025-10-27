import { useState } from 'react'
import { Container, Row, Col, Form, Button, Alert } from 'react-bootstrap'
import { db } from '../utilities/firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'

export default function Footer () {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    try {
      await addDoc(collection(db, 'contacts'), {
        name,
        email,
        message,
        createdAt: serverTimestamp()
      })
      setSubmitted(true)
      setName('')
      setEmail('')
      setMessage('')
    } catch (err) {
      console.error(err)
      setError('Failed to send message. Please try again later.')
    }
  }

  return (
    <footer
      style={{
        background: '#212529',
        color: '#fff',
        padding: '40px 0'
      }}
    >
      <Container>
        {/* Two main columns: Info + Contact Form */}
        <Row className='d-flex flex-column flex-md-row justify-content-between align-items-start'>
          {/* Left Side */}
          <Col md={4} className='mb-4 mb-md-0'>
            <h4>PhysioCare — Dr. Jasmine Gatiba</h4>
            <p>
              Your health is our priority. Reach out with any questions or
              bookings.
            </p>
          </Col>

          {/* Right Side (Contact Form) */}
          <Col md={8}>
            <h5>Contact Us</h5>
            {submitted && (
              <Alert variant='success'>Message sent successfully!</Alert>
            )}
            {error && <Alert variant='danger'>{error}</Alert>}

            <Form onSubmit={handleSubmit}>
              <Row className='gy-2 gx-2'>
                <Col xs={12} md={6}>
                  <Form.Control
                    type='text'
                    placeholder='Your name'
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                  />
                </Col>
                <Col xs={12} md={6}>
                  <Form.Control
                    type='email'
                    placeholder='Your email'
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
                </Col>
                <Col xs={12}>
                  <Form.Control
                    as='textarea'
                    rows={2}
                    placeholder='Your message'
                    required
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                  />
                </Col>
                <Col xs={12} md={12}>
                  <Button type='submit' variant='primary' className='w-100'>
                    Send
                  </Button>
                </Col>
              </Row>
            </Form>
          </Col>
        </Row>

        <hr style={{ borderColor: '#495057' }} />
        <p className='text-center mb-0'>
          &copy; {new Date().getFullYear()} PhysioCare. All rights reserved.
        </p>
      </Container>
    </footer>
  )
}
