import { useState, useEffect } from 'react'
import {
  Container,
  Form,
  Button,
  Row,
  Col,
  Alert,
  Card,
  Badge,
  Spinner
} from 'react-bootstrap'
import { db } from '../utilities/firebase'
import {
  collection,
  addDoc,
  query,
  where,
  updateDoc,
  doc,
  serverTimestamp,
  onSnapshot
} from 'firebase/firestore'
import { useAuth } from '../context/AuthContext'
import Footer from '../components/Footer'
import {
  FaCalendarAlt,
  FaClock,
  FaNotesMedical,
  FaTrash,
  FaComments
} from 'react-icons/fa'
import { BsCalendarCheck } from 'react-icons/bs'

export default function Appointments () {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    service: 'Preventive',
    notes: ''
  })
  const [appointments, setAppointments] = useState([])
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  // 🔥 Real-time listener for user's appointments
  useEffect(() => {
    if (!user) return

    const q = query(
      collection(db, 'appointments'),
      where('userId', '==', user.uid)
    )

    const unsubscribe = onSnapshot(
      q,
      snapshot => {
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        setAppointments(data)
        setLoading(false)
      },
      err => {
        console.error('Error fetching appointments:', err)
        setError('Failed to load appointments.')
        setLoading(false)
      }
    )

    // Cleanup listener when user logs out
    return () => unsubscribe()
  }, [user])

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  // Book a new appointment
  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    setSubmitted(false)

    const { date, time, service } = formData
    if (!date || !time || !service) {
      setError('Please fill all required fields.')
      return
    }

    try {
      await addDoc(collection(db, 'appointments'), {
        ...formData,
        userId: user.uid,
        userEmail: user.email,
        status: 'Pending Approval',
        createdAt: serverTimestamp()
      })

      setSubmitted(true)
      setFormData({ date: '', time: '', service: 'Preventive', notes: '' })
    } catch (err) {
      console.error(err)
      setError('Failed to book appointment. Please try again later.')
    }
  }

  // Revoke (cancel) an appointment
  const handleRevoke = async id => {
    if (!window.confirm('Are you sure you want to revoke this appointment?'))
      return

    try {
      const ref = doc(db, 'appointments', id)
      await updateDoc(ref, { status: 'Revoked' })
    } catch (err) {
      console.error('Error revoking appointment:', err)
      setError('Failed to revoke appointment.')
    }
  }

  if (!user) {
    return (
      <Container className='my-5 text-center'>
        <h4>You must be logged in to view and book appointments.</h4>
        <Button href='/login' variant='primary'>
          Login
        </Button>
      </Container>
    )
  }

  return (
    <>
      <Container className='my-5'>
        <h2 className='text-center mb-4'>
          <BsCalendarCheck className='me-2' />
          My Appointments
        </h2>

        {submitted && (
          <Alert variant='success'>Appointment booked successfully!</Alert>
        )}
        {error && <Alert variant='danger'>{error}</Alert>}

        {/* Show appointments */}
        {loading ? (
          <div className='text-center'>
            <Spinner animation='border' />
          </div>
        ) : appointments.length === 0 ? (
          <p className='text-center text-muted'>No appointments yet.</p>
        ) : (
          appointments
            .sort(
              (a, b) =>
                (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)
            )
            .map(appt => (
              <Card key={appt.id} className='mb-3 shadow-sm'>
                <Card.Body>
                  <Row>
                    <Col md={8}>
                      <Card.Title>
                        <FaNotesMedical className='me-2 text-primary' />
                        {appt.service} Session
                      </Card.Title>
                      <Card.Text>
                        <FaCalendarAlt className='me-2 text-muted' />
                        {appt.date} <FaClock className='ms-3 me-2 text-muted' />
                        {appt.time}
                        <br />
                        <strong>Notes:</strong>{' '}
                        <span className='text-muted'>
                          {appt.notes || 'None'}
                        </span>
                        <br />
                        <strong>Status:</strong>{' '}
                        <Badge
                          bg={
                            appt.status === 'Approved'
                              ? 'success'
                              : appt.status === 'Pending Approval'
                              ? 'warning'
                              : appt.status === 'Rescheduled'
                              ? 'info'
                              : appt.status === 'Revoked'
                              ? 'danger'
                              : 'secondary'
                          }
                        >
                          {appt.status}
                        </Badge>
                      </Card.Text>

                      {/* Show proposed date/time if admin rescheduled */}
                      {appt.suggestedDate && (
                        <Card.Text className='mt-2'>
                          <strong>Proposed New Date:</strong>{' '}
                          {appt.suggestedDate}{' '}
                          <FaClock className='ms-2 me-2 text-muted' />
                          {appt.suggestedTime}
                        </Card.Text>
                      )}

                      {/* Show admin comment */}
                      {appt.adminComment && (
                        <Card.Text className='mt-2 text-info'>
                          <FaComments className='me-2' />
                          <em>{appt.adminComment}</em>
                        </Card.Text>
                      )}
                    </Col>

                    <Col
                      md={4}
                      className='d-flex align-items-center justify-content-end'
                    >
                      {appt.status !== 'Revoked' && (
                        <Button
                          variant='outline-danger'
                          size='sm'
                          onClick={() => handleRevoke(appt.id)}
                        >
                          <FaTrash className='me-1' /> Revoke
                        </Button>
                      )}
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            ))
        )}

        {/* Booking Form */}
        <h3 className='mt-5 mb-3 text-center'>Book a New Appointment</h3>
        <Form onSubmit={handleSubmit}>
          <Row className='mb-3'>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Preferred Date</Form.Label>
                <Form.Control
                  type='date'
                  name='date'
                  value={formData.date}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Preferred Time</Form.Label>
                <Form.Control
                  type='time'
                  name='time'
                  value={formData.time}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className='mb-3'>
            <Form.Label>Service Type</Form.Label>
            <Form.Select
              name='service'
              value={formData.service}
              onChange={handleChange}
              required
            >
              <option>Preventive</option>
              <option>Curative</option>
              <option>Therapeutic</option>
              <option>Rehabilitation</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className='mb-3'>
            <Form.Label>Additional Notes</Form.Label>
            <Form.Control
              as='textarea'
              rows={3}
              name='notes'
              value={formData.notes}
              onChange={handleChange}
              placeholder='Any specific needs or comments'
            />
          </Form.Group>

          <div className='text-center'>
            <Button variant='primary' type='submit'>
              <BsCalendarCheck className='me-2' />
              Book Appointment
            </Button>
          </div>
        </Form>
      </Container>
      <Footer />
    </>
  )
}
