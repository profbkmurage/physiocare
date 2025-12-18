import { useEffect, useState } from 'react'
import { Container, Row, Col, Card, Button, Form, Alert } from 'react-bootstrap'
import {
  collection,
  addDoc,
  serverTimestamp,
  onSnapshot
} from 'firebase/firestore'
import { db } from '../utilities/firebase'
import Footer from '../components/Footer'

// ✅ Import animation styles
import '../styles/team.css'

export default function Services () {
  // ================= CLIENT FORM =================
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

  // ================= TEAM DATA =================
  const [team, setTeam] = useState([])

  // ================= FETCH TEAM (REALTIME) =================
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'team'), snapshot => {
      const members = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setTeam(members)
    })

    return () => unsubscribe()
  }, [])

  // ================= FORM HANDLERS =================
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
        password, // 🔒 Future: move to Firebase Auth
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
      {/* ================= HERO ================= */}
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
            Professional care designed to restore movement, relieve pain, and
            improve quality of life.
          </p>
        </Container>
      </div>

      {/* ================= TEAM SECTION ================= */}
      {team.length > 0 && (
        <Container className='my-5'>
          <h2 className='text-center mb-4 fw-bold'>Meet Our Team</h2>
          <Row className='g-4 justify-content-center'>
            {team.map((member, index) => (
              <Col xs={12} md={6} lg={3} key={member.id}>
                <Card
                  className='text-center shadow-sm h-100 team-card fade-in'
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className='d-flex justify-content-center mt-4'>
                    <img
                      src={member.image}
                      alt={member.name}
                      className='team-img'
                    />
                  </div>

                  <Card.Body>
                    <Card.Title className='mt-3'>{member.name}</Card.Title>
                    <Card.Subtitle className='mb-2 text-muted'>
                      {member.role}
                    </Card.Subtitle>
                    <Card.Text>{member.bio}</Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      )}

      {/* ================= SERVICES ================= */}
      <Container className='my-5'>
        <h2 className='text-center mb-4 fw-bold'>What We Offer</h2>
        <Row className='g-4'>
          {[
            {
              title: 'Preventive Physiotherapy',
              desc: 'Posture correction, ergonomic training, and injury prevention.',
              icon: 'bi-heart-pulse'
            },
            {
              title: 'Therapeutic Care',
              desc: 'Back pain, joint conditions, and muscle rehabilitation.',
              icon: 'bi-capsule'
            },
            {
              title: 'Rehabilitation Programs',
              desc: 'Post-surgery and injury recovery plans.',
              icon: 'bi-person-walking'
            },
            {
              title: 'Pain Management',
              desc: 'Non-invasive solutions for chronic pain.',
              icon: 'bi-emoji-smile'
            },
            {
              title: 'Sports Physiotherapy',
              desc: 'Athlete-focused injury care and performance recovery.',
              icon: 'bi-trophy'
            }
          ].map((service, idx) => (
            <Col xs={12} md={6} lg={4} key={idx}>
              <Card className='h-100 shadow-sm text reminder-center'>
                <Card.Body className='text-center'>
                  <i
                    className={`${service.icon} display-5 text-primary mb-3`}
                  />
                  <Card.Title>{service.title}</Card.Title>
                  <Card.Text>{service.desc}</Card.Text>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>

      {/* ================= REGISTRATION ================= */}
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
                    {[
                      { name: 'name', type: 'text', placeholder: 'Full Name' },
                      { name: 'email', type: 'email', placeholder: 'Email' },
                      { name: 'age', type: 'number', placeholder: 'Age' },
                      {
                        name: 'phone',
                        type: 'tel',
                        placeholder: 'Phone (2547XXXXXXXX)'
                      },
                      {
                        name: 'location',
                        type: 'text',
                        placeholder: 'Location'
                      },
                      {
                        name: 'password',
                        type: 'password',
                        placeholder: 'Password'
                      },
                      {
                        name: 'confirmPassword',
                        type: 'password',
                        placeholder: 'Confirm Password'
                      }
                    ].map((field, i) => (
                      <Col xs={12} md={i >= 2 ? 6 : 12} key={i}>
                        <Form.Control
                          {...field}
                          value={formData[field.name]}
                          onChange={handleChange}
                          required
                        />
                      </Col>
                    ))}

                    <Col xs={12}>
                      <Button type='submit' className='w-100'>
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

      <Footer />
    </>
  )
}
