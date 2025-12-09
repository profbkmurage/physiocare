import { useState } from 'react'
import { Container, Row, Col, Form, Button, Alert } from 'react-bootstrap'
import { db } from '../utilities/firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import {
  FaFacebookF,
  FaInstagram,
  FaWhatsapp,
  FaMapMarkerAlt,
  FaEnvelope,
  FaPhoneAlt
} from 'react-icons/fa'

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
    <footer id = 'footer-section'

      style={{
        background: '#212529',
        color: '#fff',
        padding: '50px 0 20px 0',
        fontSize: '0.95rem'
      }}
    >
      <Container>
        <Row className='gy-4 gx-5'>
          {/* Left Column: Info + Contact */}
          <Col xs={12} md={4}>
            <h4 className='fw-bold mb-3 text-primary'>
              PhysioCare — Dr. Jasmine Gatiba
            </h4>
            <p>
              Helping you regain strength, balance, and confidence. We believe
              every step toward healing counts.
            </p>

            <div className='mt-3' style={
              { color: 'white' }}>
              <p className='mb-1'>
                <FaMapMarkerAlt className='me-2 text-primary' /> Gigiri,
                Nairobi, Kenya
              </p>
              <p className='mb-1'>
                <FaEnvelope className='me-2 text-primary' /> info@physiocare.com
              </p>
              <p className='mb-1'>
                <FaPhoneAlt className='me-2 text-primary' /> +254 758 991 395
              </p>
            </div>

            <div className='d-flex gap-3 mt-3'style={{color:'#0d6efd'}}>
              <a
                href='https://facebook.com'
                target='_blank'
                rel='noopener noreferrer'
                className='text-light fs-5'
              >
                <FaFacebookF />
              </a>
              <a
                href='https://instagram.com'
                target='_blank'
                rel='noopener noreferrer'
                className='text-light fs-5'
              >
                <FaInstagram />
              </a>
              <a
                href='https://wa.me/254758991395'
                target='_blank'
                rel='noopener noreferrer'
                className='text-light fs-5'
              >
                <FaWhatsapp />
              </a>
            </div>
          </Col>

          {/* Right Column: Contact Form */}
          <Col xs={12} md={8}>
            <h5 className='fw-bold mb-3 text-primary'>Contact Us</h5>
            {submitted && (
              <Alert variant='success'>Message sent successfully!</Alert>
            )}
            {error && <Alert variant='danger'>{error}</Alert>}

            <Form onSubmit={handleSubmit}>
              <Row className='gy-3'>
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
                    rows={3}
                    placeholder='Your message'
                    required
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                  />
                </Col>
                <Col xs={12}>
                  <Button
                    type='submit'
                    variant='primary'
                    className='w-100 fw-semibold'
                    style={{ borderRadius: '6px' }}
                  >
                    Send Message
                  </Button>
                </Col>
              </Row>
            </Form>
          </Col>
        </Row>

        <hr style={{ borderColor: '#495057', marginTop: '40px' }} />
        <p className='text-center mb-0 small'>
          &copy; {new Date().getFullYear()} PhysioCare. All rights reserved.
        </p>
      </Container>
    </footer>
  )
}
