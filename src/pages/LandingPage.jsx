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

// Example images — replace with your real physiotherapy photos
import image1 from '../assets/bk.jpeg'
import image2 from '../assets/bk2.jpeg'
import image3 from '../assets/bk.jpeg'
import image4 from '../assets/bk2.jpeg'

export default function LandingPage () {
  const [testimonials, setTestimonials] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)
  // ✅ Fetch approved testimonials live from Firestore
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

  // ✅ Function to trim long text for testimonial previews
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

  // ✅ Smooth scroll to footer section
  const scrollToFooter = () => {
    const footer = document.getElementById('footer-section')
    if (footer) footer.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div>
      {/* ================= HERO CAROUSEL ================= */}
      <Carousel fade interval={3000}>
        {[image1, image2, image3, image4].map((img, index) => {
          const captions = [
            {
              title: 'Expert Care for Every Patient',
              text: 'Personalized physiotherapy for better recovery and health.'
            },
            {
              title: 'Rehabilitation Programs',
              text: 'Recover faster with customized rehabilitation plans.'
            },
            {
              title: 'Preventive Physiotherapy',
              text: 'Stay active and healthy with our preventive programs.'
            },
            {
              title: 'Holistic Patient Care',
              text: 'Focused on improving your mobility and overall wellbeing.'
            }
          ]
          return (
            <Carousel.Item key={index}>
              <img
                className='d-block w-100'
                src={img}
                alt={`slide-${index}`}
                style={{
                  maxHeight: '500px',
                  objectFit: 'cover',
                  filter: 'brightness(85%)'
                }}
              />
              <Carousel.Caption className='bg-dark bg-opacity-50 rounded p-3'>
                <h2>{captions[index].title}</h2>
                <p>{captions[index].text}</p>
                <Button as={Link} to='/appointments' variant='light'>
                  Book Now
                </Button>
              </Carousel.Caption>
            </Carousel.Item>
          )
        })}
      </Carousel>

      {/* ================= SERVICES SECTION ================= */}
      <Container className='my-5'>
        <h2 className='text-center mb-4 fw-bold'>Explore Our Services</h2>
        <Row className='g-4 justify-content-center'>
          <Col lg={3} md={6} sm={12}>
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

          <Col lg={3} md={6} sm={12}>
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

          <Col lg={3} md={6} sm={12}>
            <Card className='text-center h-100 shadow-sm'>
              <Card.Body>
                <Card.Title>Appointments</Card.Title>
                <Card.Text>Schedule your sessions online.</Card.Text>
                <Button as={Link} to='/appointments' variant='primary'>
                  Book Now
                </Button>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={3} md={6} sm={12}>
            <Card className='text-center h-100 shadow-sm'>
              <Card.Body>
                <Card.Title>Contact</Card.Title>
                <Card.Text>Have questions? Reach out to us.</Card.Text>
                <Button variant='primary' onClick={scrollToFooter}>
                  Contact Us
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* ================= TESTIMONIALS SECTION ================= */}
      <Container className='my-5'>
        <h2 className='text-center mb-4 fw-bold'>What Our Patients Say</h2>

        {loading ? (
          <div className='text-center py-4'>
            <Spinner animation='border' />
          </div>
        ) : testimonials.length === 0 ? (
          <p className='text-center text-muted'>No testimonials yet.</p>
        ) : (
          <Carousel interval={5000} indicators={false} fade>
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
                      className='shadow-lg border-0 w-100'
                      style={{
                        maxWidth: '800px',
                        minHeight: '320px',
                        background: '#f9fbff',
                        borderRadius: '18px'
                      }}
                    >
                      <div className='text-center mt-3'>
                        <FaHeartPulse
                          size={40}
                          color='#0d6efd'
                          className='mb-2'
                        />
                      </div>
                      <Card.Body>
                        <Card.Title className='text-center mb-3'>
                          {t.name}{' '}
                          <span className='text-muted'>— {t.type}</span>
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

      {/* ================= CALL TO ACTION ================= */}
      <div
        className='text-center py-5'
        style={{ background: '#0d6efd', color: '#fff' }}
      >
        <h2 className='mb-4 fw-bold'>
          Start Your Journey to Better Health Today!
        </h2>
        <Button as={Link} to='/services' variant='light' size='lg'>
          View Our Services
        </Button>
      </div>

      {/* ================= FOOTER ================= */}
      <Footer />
    </div>
  )
}
