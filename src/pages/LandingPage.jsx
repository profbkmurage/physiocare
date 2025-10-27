import { useState } from 'react'
import { Container, Row, Col, Button, Card, Carousel } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import Footer from '../components/Footer'

// Example images — replace with real physiotherapy photos
import image1 from '../assets/bk.jpeg'
import image2 from '../assets/bk2.jpeg'
import image3 from '../assets/bk.jpeg'
import image4 from '../assets/bk2.jpeg'

export default function LandingPage () {
  // Testimonial data (placeholder)
  const testimonials = [
    {
      id: 1,
      name: 'Mary W.',
      image: image1,
      text: 'I had been struggling with chronic back pain for years. After a few sessions at PhysioCare, I began to notice significant improvement. Dr. Jasmine’s care, patience, and professionalism helped me regain my mobility and confidence. I can now go about my daily activities pain-free!'
    },
    {
      id: 2,
      name: 'James K.',
      image: image2,
      text: 'Dr. Jasmine and her team are incredible. Their approach to physiotherapy is holistic and encouraging. The personalized attention and rehabilitation program helped me recover after my knee surgery much faster than I expected.'
    },
    {
      id: 3,
      name: 'Susan T.',
      image: image3,
      text: 'PhysioCare is simply the best! From the moment you walk in, you feel cared for and respected. The clinic environment is clean and calming, and the exercises are tailored to your needs. Highly recommended!'
    },
    {
      id: 4,
      name: 'Kevin M.',
      image: image4,
      text: 'I had an ankle injury that wouldn’t heal properly until I visited PhysioCare. The physiotherapists here take time to explain every step and ensure you understand your progress. My ankle is now stronger than ever.'
    },
    {
      id: 5,
      name: 'Grace N.',
      image: image1,
      text: 'The professionalism and empathy at PhysioCare are unmatched. Dr. Jasmine genuinely cares about her patients’ recovery. I appreciate how she integrates physical therapy with lifestyle advice to ensure long-term health. Thank you for helping me get back to running!'
    }
  ]

  // Helper function to trim testimonials
  const trimText = (text, maxWords = 100) => {
    const words = text.split(' ')
    if (words.length > maxWords) {
      return {
        short: words.slice(0, maxWords).join(' ') + '...',
        trimmed: true
      }
    }
    return { short: text, trimmed: false }
  }

  // Track which testimonial is expanded
  const [expanded, setExpanded] = useState(null)

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

      {/* Services Quick Links */}
      <Container className='my-5'>
        <h2 className='text-center mb-4'>Explore Our Services</h2>
        <Row className='g-4'>
          <Col md={3}>
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
          <Col md={3}>
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
          <Col md={3}>
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
          <Col md={3}>
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

      {/* Testimonials Carousel */}
      <Container className='my-5'>
        <h2 className='text-center mb-4'>What Our Patients Say</h2>
        <Carousel interval={4000} indicators={false}>
          {testimonials.map(t => {
            const { short, trimmed } = trimText(t.text)
            const isExpanded = expanded === t.id
            const displayText = isExpanded ? t.text : short

            return (
              <Carousel.Item key={t.id}>
                <div className='d-flex justify-content-center'>
                  <Card
                    className='shadow-sm'
                    style={{ width: '70%', minHeight: '280px' }}
                  >
                    <Row className='g-0 align-items-center'>
                      <Col md={4}>
                        <img
                          src={t.image}
                          alt={t.name}
                          className='img-fluid rounded-start'
                          style={{ height: '100%', objectFit: 'cover' }}
                        />
                      </Col>
                      <Col md={8}>
                        <Card.Body>
                          <Card.Title>{t.name}</Card.Title>
                          <Card.Text style={{ textAlign: 'justify' }}>
                            {displayText}
                          </Card.Text>
                          {trimmed && (
                            <Button
                              variant='link'
                              className='p-0'
                              onClick={() =>
                                setExpanded(isExpanded ? null : t.id)
                              }
                            >
                              {isExpanded ? 'Show Less' : 'Read More'}
                            </Button>
                          )}
                        </Card.Body>
                      </Col>
                    </Row>
                  </Card>
                </div>
              </Carousel.Item>
            )
          })}
        </Carousel>
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
