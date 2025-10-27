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

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    setSubmitted(false)

    const { name, email, age, phone, location, password, confirmPassword } =
      formData

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
        password, // in future we’ll hash this or use Firebase Auth
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
          <h1>Our Physiotherapy Services</h1>
          <p>
            Explore the full range of preventive and therapeutic physiotherapy
            care designed to restore and maintain your health.
          </p>
        </Container>
      </div>

      {/* Services Section */}
      <Container className='my-5'>
        <h2 className='text-center mb-4'>What We Offer</h2>
        <Row className='g-4'>
          {[
            {
              title: 'Preventive Physiotherapy',
              desc: 'Stay healthy with posture correction, ergonomic advice, and early detection programs.',
              icon: 'heart-pulse'
            },
            {
              title: 'Curative & Therapeutic Care',
              desc: 'Comprehensive recovery programs for back pain, muscle strain, and joint conditions.',
              icon: 'capsule'
            },
            {
              title: 'Rehabilitation Programs',
              desc: 'Post-surgery and injury rehabilitation to help you regain full mobility.',
              icon: 'person-walking'
            },
            {
              title: 'Pain Management',
              desc: 'Personalized plans to relieve chronic pain through non-invasive techniques.',
              icon: 'emoji-smile'
            },
            {
              title: 'Sports Physiotherapy',
              desc: 'Specialized care for athletes to prevent injuries and enhance performance.',
              icon: 'trophy'
            }
          ].map((service, idx) => (
            <Col md={4} key={idx}>
              <Card className='h-100 shadow-sm text-center'>
                <Card.Body>
                  <i
                    className={`bi bi-${service.icon} display-5 text-primary mb-3`}
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
          <h2 className='text-center mb-4'>Register as a New Client</h2>
          <Row className='justify-content-center'>
            <Col md={6}>
              {submitted && (
                <Alert variant='success'>Registration successful!</Alert>
              )}
              {error && <Alert variant='danger'>{error}</Alert>}
              <Card className='p-4 shadow-sm'>
                <Form onSubmit={handleSubmit}>
                  <Form.Group className='mb-3'>
                    <Form.Label>Full Name</Form.Label>
                    <Form.Control
                      type='text'
                      name='name'
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>

                  <Form.Group className='mb-3'>
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type='email'
                      name='email'
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>

                  <Form.Group className='mb-3'>
                    <Form.Label>Age</Form.Label>
                    <Form.Control
                      type='number'
                      name='age'
                      value={formData.age}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>

                  <Form.Group className='mb-3'>
                    <Form.Label>Phone Number</Form.Label>
                    <Form.Control
                      type='tel'
                      name='phone'
                      value={formData.phone}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>

                  <Form.Group className='mb-3'>
                    <Form.Label>Location</Form.Label>
                    <Form.Control
                      type='text'
                      name='location'
                      value={formData.location}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>

                  <Row>
                    <Col>
                      <Form.Group className='mb-3'>
                        <Form.Label>Password</Form.Label>
                        <Form.Control
                          type='password'
                          name='password'
                          value={formData.password}
                          onChange={handleChange}
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col>
                      <Form.Group className='mb-3'>
                        <Form.Label>Confirm Password</Form.Label>
                        <Form.Control
                          type='password'
                          name='confirmPassword'
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          required
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Button variant='primary' type='submit' className='w-100'>
                    Register
                  </Button>
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
