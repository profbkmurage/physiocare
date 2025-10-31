import { useState, useEffect } from 'react'
import {
  Container,
  Row,
  Col,
  Button,
  Card,
  Carousel,
  Spinner
} from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { db } from '../utilities/firebase'
import {
  collection,
  onSnapshot,
  query,
  where,
  orderBy
} from 'firebase/firestore'
import { FaHeartPulse } from 'react-icons/fa6'
import dayjs from 'dayjs'
import Footer from '../components/Footer'

// Example images — replace with real physiotherapy photos
import image1 from '../assets/bk.jpeg'
import image2 from '../assets/bk2.jpeg'
import image3 from '../assets/bk.jpeg'
import image4 from '../assets/bk2.jpeg'

export default function LandingPage () {
  const [testimonials, setTestimonials] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)

  // Fetch approved testimonials live
  useEffect(() => {
    const q = query(
      collection(db, 'testimonials'),
      where('status', '==', 'approved'),
      orderBy('createdAt', 'desc')
    )
    const unsub = onSnapshot(q, snapshot => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setTestimonials(data)
      setLoading(false)
    })
    return () => unsub()
  }, [])

  const trimText = (text, maxWords = 40) => {
    const words = text.split(' ')
    if (words.length > maxWords) {
      return {
        short: words.slice(0, maxWords).join(' ') + '...',
        trimmed: true
      }
    }
    return { short: text, trimmed: false }
  }

  return (
    <div>
      {/* Hero Carousel */}
      <Carousel fade interval={3000}>
        <Carousel.Item>
          <img
            className='d-block w-100'
            src={image1}
            alt='Patient care 1'
            style={{ maxHeight: '500px', objectFit: 'cover' }}
          />
          <Carousel.Caption>
            <h2>Expert Care for Every Patient</h2>
            <p>Personalized physiotherapy for better recovery and health.</p>
            <Button as={Link} to='/book' variant='light'>
              Book Now
            </Button>
          </Carousel.Caption>
        </Carousel.Item>

        <Carousel.Item>
          <img
            className='d-block w-100'
            src={image2}
            alt='Patient care 2'
            style={{ maxHeight: '500px', objectFit: 'cover' }}
          />
          <Carousel.Caption>
            <h2>Rehabilitation Programs</h2>
            <p>Recover faster with customized rehabilitation plans.</p>
            <Button as={Link} to='/book' variant='light'>
              Book Now
            </Button>
          </Carousel.Caption>
        </Carousel.Item>

        <Carousel.Item>
          <img
            className='d-block w-100'
            src={image3}
            alt='Patient care 3'
            style={{ maxHeight: '500px', objectFit: 'cover' }}
          />
          <Carousel.Caption>
            <h2>Preventive Physiotherapy</h2>
            <p>Stay active and healthy with our preventive programs.</p>
            <Button as={Link} to='/book' variant='light'>
              Book Now
            </Button>
          </Carousel.Caption>
        </Carousel.Item>

        <Carousel.Item>
          <img
            className='d-block w-100'
            src={image4}
            alt='Patient care 4'
            style={{ maxHeight: '500px', objectFit: 'cover' }}
          />
          <Carousel.Caption>
            <h2>Holistic Patient Care</h2>
            <p>Focused on improving your mobility and overall wellbeing.</p>
            <Button as={Link} to='/book' variant='light'>
              Book Now
            </Button>
          </Carousel.Caption>
        </Carousel.Item>
      </Carousel>

      {/* Services Section */}
      <Container className='my-5'>
        <h2 className='text-center mb-4'>Explore Our Services</h2>
        <Row className='g-4'>
          <Col md={3} xs={12}>
            <Card className='text-center h-100 shadow-sm'>
              <Card.Body>
                <Card.Title>Services</Card.Title>
                <Card.Text>Discover our physiotherapy programs.</Card.Text>
                <Button as={Link} to='/services' variant='primary'>
                  Learn More
                </Button>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} xs={12}>
            <Card className='text-center h-100 shadow-sm'>
              <Card.Body>
                <Card.Title>Blog</Card.Title>
                <Card.Text>Read expert tips and exercises.</Card.Text>
                <Button as={Link} to='/blog' variant='primary'>
                  Read Blog
                </Button>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} xs={12}>
            <Card className='text-center h-100 shadow-sm'>
              <Card.Body>
                <Card.Title>Appointments</Card.Title>
                <Card.Text>Schedule your sessions online.</Card.Text>
                <Button as={Link} to='/book' variant='primary'>
                  Book Now
                </Button>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} xs={12}>
            <Card className='text-center h-100 shadow-sm'>
              <Card.Body>
                <Card.Title>Contact</Card.Title>
                <Card.Text>Have questions? Reach out to us.</Card.Text>
                <Button as={Link} to='/contact' variant='primary'>
                  Contact Us
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Testimonials Section */}
      <Container className='my-5'>
        <h2 className='text-center mb-4'>What Our Patients Say</h2>

        {loading ? (
          <div className='text-center py-4'>
            <Spinner animation='border' />
          </div>
        ) : testimonials.length === 0 ? (
          <p className='text-center text-muted'>No testimonials yet.</p>
        ) : (
          <Carousel interval={4000} indicators={false} fade className='p-3'>
            {testimonials.map(t => {
              const { short, trimmed } = trimText(t.message)
              const isExpanded = expanded === t.id
              const displayText = isExpanded ? t.message : short
              const formattedDate = t.createdAt
                ? dayjs(t.createdAt.toDate()).format('DD MMM YYYY')
                : 'Unknown date'

              return (
                <Carousel.Item key={t.id}>
                  <div className='d-flex justify-content-center'>
                    <Card
                      className='shadow-lg border-0'
                      style={{
                        width: '80%',
                        minHeight: '300px',
                        background: '#f9fbff',
                        borderRadius: '18px'
                      }}
                    >
                      <div className='text-center mt-3'>
                        <FaHeartPulse
                          size={40}
                          color='#007bff'
                          className='mb-2'
                        />
                      </div>
                      <Card.Body>
                        <Card.Title className='text-center'>
                          {t.name} —{' '}
                          <span className='text-muted'>{t.type}</span>
                        </Card.Title>
                        <Card.Text style={{ textAlign: 'justify' }}>
                          {displayText}
                        </Card.Text>
                        {trimmed && (
                          <div className='text-center'>
                            <Button
                              variant='link'
                              className='p-0'
                              onClick={() =>
                                setExpanded(isExpanded ? null : t.id)
                              }
                            >
                              {isExpanded ? 'Show Less' : 'Read More'}
                            </Button>
                          </div>
                        )}
                        <div
                          className='text-end text-muted mt-3'
                          style={{ fontSize: '0.9rem' }}
                        >
                          {formattedDate}
                        </div>
                      </Card.Body>
                    </Card>
                  </div>
                </Carousel.Item>
              )
            })}
          </Carousel>
        )}
      </Container>

      {/* Call to Action */}
      <div
        style={{
          background: '#0d6efd',
          color: '#fff',
          padding: '50px 0',
          textAlign: 'center'
        }}
      >
        <h2>Start Your Journey to Better Health Today!</h2>
        <Button as={Link} to='/services' variant='light' size='lg'>
          View Our Services
        </Button>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  )
}
