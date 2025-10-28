import { useState } from 'react'
import { Container, Row, Col, Card, Button, Form, Alert } from 'react-bootstrap'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../utilities/firebase'
import Footer from '../components/Footer'

export default function Services () {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    age: '',
    phone: '',
    location: '',
    password: '',
    confirmPassword: ''
  })
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const validatePhone = phone => /^254\d{9}$/.test(phone)
  const validateLength = str => str.trim().length >= 6

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    setSubmitted(false)

    const { name, email, age, phone, location, password, confirmPassword } =
      formData
    if (!validatePhone(phone)) {
      setError('Phone number must be in the format 2547XXXXXXXX.')
      return
    }

    if (!validateLength(password)) {
      setError('Password must be at least 6 characters.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match!')
      return
    }

    try {
      await addDoc(collection(db, 'clients'), {
        name,
        email,
        age,
        phone,
        location,
        password, // Future: hash or use Firebase Auth
        createdAt: serverTimestamp()
      })
      setSubmitted(true)
      setFormData({
        name: '',
        email: '',
        age: '',
        phone: '',
        location: '',
        password: '',
        confirmPassword: ''
      })
    } catch (err) {
      console.error(err)
      setError('Failed to register client. Please try again later.')
    }
  }

  return (
    <>
      {/* Hero Section */}
      <div
        style={{
          background: '#0d6efd',
          color: '#fff',
          padding: '80px 0',
          textAlign: 'center'
        }}
      >
        <Container>
          <h1 className='fw-bold'>Our Physiotherapy Services</h1>
          <p className='lead'>
            Explore the full range of preventive and therapeutic physiotherapy
            care designed to restore and maintain your health.
          </p>
        </Container>
      </div>

      {/* Services Section */}
      <Container className='my-5'>
        <h2 className='text-center mb-4 fw-bold'>What We Offer</h2>
        <Row className='g-4'>
          {[
            {
              title: 'Preventive Physiotherapy',
              desc: 'Stay healthy with posture correction, ergonomic advice, and early detection programs.',
              icon: 'bi-heart-pulse'
            },
            {
              title: 'Curative & Therapeutic Care',
              desc: 'Comprehensive recovery programs for back pain, muscle strain, and joint conditions.',
              icon: 'bi-capsule'
            },
            {
              title: 'Rehabilitation Programs',
              desc: 'Post-surgery and injury rehabilitation to help you regain full mobility.',
              icon: 'bi-person-walking'
            },
            {
              title: 'Pain Management',
              desc: 'Personalized plans to relieve chronic pain through non-invasive techniques.',
              icon: 'bi-emoji-smile'
            },
            {
              title: 'Sports Physiotherapy',
              desc: 'Specialized care for athletes to prevent injuries and enhance performance.',
              icon: 'bi-trophy'
            }
          ].map((service, idx) => (
            <Col xs={12} md={6} lg={4} key={idx}>
              <Card className='h-100 shadow-sm text-center'>
                <Card.Body className='d-flex flex-column align-items-center'>
                  <i
                    className={`${service.icon} display-5 text-primary mb-3`}
                  ></i>
                  <Card.Title>{service.title}</Card.Title>
                  <Card.Text>{service.desc}</Card.Text>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>

      {/* Registration Form */}
      <div style={{ background: '#f8f9fa', padding: '60px 0' }}>
        <Container>
          <h2 className='text-center mb-4 fw-bold'>Register as a New Client</h2>
          <Row className='justify-content-center'>
            <Col xs={12} md={8} lg={6}>
              {submitted && (
                <Alert variant='success'>Registration successful!</Alert>
              )}
              {error && <Alert variant='danger'>{error}</Alert>}
              <Card className='p-4 shadow-sm'>
                <Form onSubmit={handleSubmit}>
                  <Row className='gy-3'>
                    <Col xs={12}>
                      <Form.Control
                        type='text'
                        name='name'
                        placeholder='Full Name '
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                    </Col>
                    <Col xs={12}>
                      <Form.Control
                        type='email'
                        name='email'
                        placeholder='Email'
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </Col>
                    <Col xs={12} md={6}>
                      <Form.Control
                        type='number'
                        name='age'
                        placeholder='Age'
                        value={formData.age}
                        onChange={handleChange}
                        required
                      />
                    </Col>
                    <Col xs={12} md={6}>
                      <Form.Control
                        type='tel'
                        name='phone'
                        placeholder='Phone (2547XXXXXXXX)'
                        value={formData.phone}
                        onChange={handleChange}
                        required
                      />
                    </Col>
                    <Col xs={12}>
                      <Form.Control
                        type='text'
                        name='location'
                        placeholder='Location'
                        value={formData.location}
                        onChange={handleChange}
                        required
                      />
                    </Col>
                    <Col xs={12} md={6}>
                      <Form.Control
                        type='password'
                        name='password'
                        placeholder='Password (min 6 chars)'
                        value={formData.password}
                        onChange={handleChange}
                        required
                      />
                    </Col>
                    <Col xs={12} md={6}>
                      <Form.Control
                        type='password'
                        name='confirmPassword'
                        placeholder='Confirm Password'
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                      />
                    </Col>
                    <Col xs={12}>
                      <Button type='submit' variant='primary' className='w-100'>
                        Register
                      </Button>
                    </Col>
                  </Row>
                </Form>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Footer */}
      <Footer />
    </>
  )
}
