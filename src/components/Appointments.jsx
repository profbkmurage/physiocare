import { useEffect, useState } from 'react'
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Spinner,
  Alert,
  Form,
  Modal
} from 'react-bootstrap'
import {
  FaCalendarAlt,
  FaTrashAlt,
  FaPlusCircle,
  FaEdit,
  FaBan,
  FaSave,
  FaQuoteLeft
} from 'react-icons/fa'
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  serverTimestamp,
  query,
  where
} from 'firebase/firestore'
import { db } from '../utilities/firebase'
import { useAuth } from '../context/AuthContext'
import Footer from '../components/Footer'

export default function Appointments () {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [appointments, setAppointments] = useState([])
  const [testimonials, setTestimonials] = useState([])
  const [error, setError] = useState(null)

  // Booking form
  const [booking, setBooking] = useState({
    patientName: '',
    whatsapp: '',
    date: '',
    time: '',
    service: ''
  })
  const [bookingSubmitting, setBookingSubmitting] = useState(false)

  // Testimonial form
  const [testimonialForm, setTestimonialForm] = useState({
    name: '',
    type: 'Patient',
    message: ''
  })
  const [testimonialSubmitting, setTestimonialSubmitting] = useState(false)

  // Reschedule modal (manual by client)
  const [showReschedule, setShowReschedule] = useState(false)
  const [rescheduleData, setRescheduleData] = useState({
    id: '',
    oldDate: '',
    oldTime: '',
    date: '',
    time: ''
  })
  const [rescheduleSubmitting, setRescheduleSubmitting] = useState(false)

  // Edit testimonial modal
  const [showEditTestimonial, setShowEditTestimonial] = useState(false)
  const [editTestimonialData, setEditTestimonialData] = useState({
    id: '',
    name: '',
    type: '',
    message: ''
  })
  const [editTestimonialSubmitting, setEditTestimonialSubmitting] =
    useState(false)

  // Admin suggested reschedule modal
  const [showSuggestedReschedule, setShowSuggestedReschedule] = useState(false)
  const [suggestedAppt, setSuggestedAppt] = useState(null)
  const [rescheduleDecisionSubmitting, setRescheduleDecisionSubmitting] =
    useState(false)

  // Validate WhatsApp (Kenya 2547XXXXXXXX)
  const validWhatsApp = str => /^2547\d{8}$/.test(str)

  // Fetch appointments & testimonials
  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }

    const fetchData = async () => {
      setLoading(true)
      try {
        const apptQ = query(
          collection(db, 'appointments'),
          where('userId', '==', user.uid)
        )
        const apptSnap = await getDocs(apptQ)
        const appts = apptSnap.docs.map(d => ({ id: d.id, ...d.data() }))

        const testQ = query(
          collection(db, 'testimonials'),
          where('userId', '==', user.uid)
        )
        const testSnap = await getDocs(testQ)
        const tests = testSnap.docs.map(d => ({ id: d.id, ...d.data() }))

        setAppointments(
          appts.sort((a, b) => (a.date || '').localeCompare(b.date || ''))
        )
        setTestimonials(
          tests.sort(
            (a, b) => (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0)
          )
        )

        // Check for any pending reschedule
        const pendingReschedule = appts.find(
          a => a.status === 'pending reschedule'
        )
        if (pendingReschedule) {
          setSuggestedAppt(pendingReschedule)
          setShowSuggestedReschedule(true)
        }
      } catch (err) {
        console.error('Fetch error:', err)
        setError('Failed to load data from server.')
        alert(error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [error, user])

  /* -------------------------
     Booking (add appointment)
     ------------------------- */
  const handleBookingChange = e => {
    const { name, value } = e.target
    setBooking(prev => ({ ...prev, [name]: value }))
  }

  const handleBookingSubmit = async e => {
    e.preventDefault()
    if (!user) return alert('Please login first.')

    const { patientName, whatsapp, date, time, service } = booking
    if (!patientName || !whatsapp || !date || !time || !service)
      return alert('Please fill all appointment fields.')
    if (!validWhatsApp(whatsapp))
      return alert('WhatsApp must be in format 2547XXXXXXXX')

    setBookingSubmitting(true)
    try {
      const docRef = await addDoc(collection(db, 'appointments'), {
        userId: user.uid,
        patientName,
        whatsapp,
        date,
        time,
        service,
        doctorName: 'Dr. Jasmine Gatiba',
        status: 'approved',
        createdAt: serverTimestamp()
      })

      setAppointments(prev => [
        {
          id: docRef.id,
          patientName,
          whatsapp,
          date,
          time,
          service,
          doctorName: 'Dr. Jasmine Gatiba',
          status: 'approved',
          createdAt: new Date()
        },
        ...prev
      ])
      setBooking({
        patientName: '',
        whatsapp: '',
        date: '',
        time: '',
        service: ''
      })
      alert('Appointment booked successfully.')
    } catch (err) {
      console.error('Booking error:', err)
      alert('Failed to book appointment.')
    } finally {
      setBookingSubmitting(false)
    }
  }

  /* -------------------------
     Reschedule (client manual)
     ------------------------- */
  const openReschedule = appt => {
    setRescheduleData({
      id: appt.id,
      oldDate: appt.date || '',
      oldTime: appt.time || '',
      date: appt.date || '',
      time: appt.time || ''
    })
    setShowReschedule(true)
  }

  const handleRescheduleChange = e => {
    const { name, value } = e.target
    setRescheduleData(prev => ({ ...prev, [name]: value }))
  }

  const handleRescheduleSubmit = async e => {
    e.preventDefault()
    const { id, oldDate, oldTime, date, time } = rescheduleData
    if (!id) return alert('Missing appointment id.')
    if (!date || !time) return alert('Please provide new date and time.')

    setRescheduleSubmitting(true)
    try {
      const apptRef = doc(db, 'appointments', id)
      await updateDoc(apptRef, {
        date,
        time,
        status: 'rescheduled',
        previousDate: oldDate,
        previousTime: oldTime,
        updatedAt: serverTimestamp()
      })

      setAppointments(prev =>
        prev.map(a =>
          a.id === id
            ? {
                ...a,
                date,
                time,
                status: 'rescheduled',
                previousDate: oldDate,
                previousTime: oldTime
              }
            : a
        )
      )
      setShowReschedule(false)
      alert('Appointment rescheduled successfully.')
    } catch (err) {
      console.error(err)
      alert('Failed to reschedule appointment.')
    } finally {
      setRescheduleSubmitting(false)
    }
  }

  /* -------------------------
     Revoke appointment
     ------------------------- */
  const handleRevoke = async id => {
    if (!id) return
    if (!confirm('Are you sure you want to revoke this appointment?')) return
    try {
      const apptRef = doc(db, 'appointments', id)
      await updateDoc(apptRef, {
        status: 'revoked',
        revokedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })
      setAppointments(prev =>
        prev.map(a => (a.id === id ? { ...a, status: 'revoked' } : a))
      )
      alert('Appointment revoked.')
    } catch (err) {
      console.error(err)
      alert('Failed to revoke appointment.')
    }
  }

  /* -------------------------
     Delete appointment
     ------------------------- */
  const handleDeleteAppointment = async id => {
    if (!id) return
    if (!confirm('Delete this appointment permanently?')) return
    try {
      await deleteDoc(doc(db, 'appointments', id))
      setAppointments(prev => prev.filter(a => a.id !== id))
      alert('Appointment deleted.')
    } catch (err) {
      console.error(err)
      alert('Failed to delete appointment.')
    }
  }

  /* -------------------------
     Suggested Reschedule from Admin
     ------------------------- */
  const handleAcceptSuggested = async appt => {
    if (!appt) return
    setRescheduleDecisionSubmitting(true)
    try {
      const apptRef = doc(db, 'appointments', appt.id)
      await updateDoc(apptRef, {
        status: 'approved',
        updatedAt: serverTimestamp()
      })
      setAppointments(prev =>
        prev.map(a => (a.id === appt.id ? { ...a, status: 'approved' } : a))
      )
      alert('Appointment confirmed! Status is now Approved.')
      setShowSuggestedReschedule(false)
    } catch (err) {
      console.error(err)
      alert('Failed to accept suggested time.')
    } finally {
      setRescheduleDecisionSubmitting(false)
    }
  }

  const handleDeclineSuggested = async appt => {
    if (!appt) return
    if (!confirm('Decline this suggested time and create a new appointment?'))
      return
    setRescheduleDecisionSubmitting(true)
    try {
      await deleteDoc(doc(db, 'appointments', appt.id))
      setAppointments(prev => prev.filter(a => a.id !== appt.id))
      alert('Appointment deleted. Please make a new appointment.')
      setShowSuggestedReschedule(false)
    } catch (err) {
      console.error(err)
      alert('Failed to decline suggested time.')
    } finally {
      setRescheduleDecisionSubmitting(false)
    }
  }

  /* -------------------------
     Testimonials: create/edit/delete
     ------------------------- */
  const handleTestimonialChange = e => {
    const { name, value } = e.target
    setTestimonialForm(prev => ({ ...prev, [name]: value }))
  }

  const handleTestimonialSubmit = async e => {
    e.preventDefault()
    if (!user) return alert('Please login to submit testimonial.')
    const { name, type, message } = testimonialForm
    if (!name || !type || !message) return alert('Fill all testimonial fields.')

    setTestimonialSubmitting(true)
    try {
      const docRef = await addDoc(collection(db, 'testimonials'), {
        name,
        type,
        message,
        userId: user.uid,
        status: 'pending',
        createdAt: serverTimestamp()
      })
      setTestimonials(prev => [
        {
          id: docRef.id,
          name,
          type,
          message,
          status: 'pending',
          createdAt: new Date(),
          userId: user.uid
        },
        ...prev
      ])
      setTestimonialForm({ name: '', type: 'Patient', message: '' })
      alert('Testimonial submitted — pending approval.')
    } catch (err) {
      console.error(err)
      alert('Failed to submit testimonial.')
    } finally {
      setTestimonialSubmitting(false)
    }
  }

  const openEditTestimonial = t => {
    setEditTestimonialData({
      id: t.id,
      name: t.name || '',
      type: t.type || 'Patient',
      message: t.message || ''
    })
    setShowEditTestimonial(true)
  }

  const handleEditTestimonialChange = e => {
    const { name, value } = e.target
    setEditTestimonialData(prev => ({ ...prev, [name]: value }))
  }

  const handleEditTestimonialSubmit = async e => {
    e.preventDefault()
    const { id, name, type, message } = editTestimonialData
    if (!id) return
    if (!name || !type || !message) return alert('Fill all fields.')

    setEditTestimonialSubmitting(true)
    try {
      const tRef = doc(db, 'testimonials', id)
      await updateDoc(tRef, {
        name,
        type,
        message,
        status: 'pending',
        updatedAt: serverTimestamp()
      })
      setTestimonials(prev =>
        prev.map(t =>
          t.id === id ? { ...t, name, type, message, status: 'pending' } : t
        )
      )
      setShowEditTestimonial(false)
      alert('Testimonial updated and marked pending.')
    } catch (err) {
      console.error(err)
      alert('Failed to update testimonial.')
    } finally {
      setEditTestimonialSubmitting(false)
    }
  }

  const handleDeleteTestimonial = async id => {
    if (!id) return
    if (!confirm('Delete this testimonial permanently?')) return
    try {
      await deleteDoc(doc(db, 'testimonials', id))
      setTestimonials(prev => prev.filter(t => t.id !== id))
      alert('Testimonial deleted.')
    } catch (err) {
      console.error(err)
      alert('Failed to delete testimonial.')
    }
  }

  if (loading) {
    return (
      <div
        className='d-flex justify-content-center align-items-center'
        style={{ height: '60vh' }}
      >
        <Spinner animation='border' variant='primary' />
      </div>
    )
  }

  return (
    <>
      <Container className='my-4'>
        <h2 className='text-center mb-4 fw-bold text-primary d-flex align-items-center justify-content-center'>
          <FaCalendarAlt className='me-2' /> My Appointments & Testimonials
        </h2>

        <Row className='g-4'>
          <Col xs={12} lg={6}>
            {/* Booking Form */}
            <Card className='p-3 shadow-sm border-0'>
              <h5 className='mb-3 fw-bold'>
                <FaPlusCircle className='me-2 text-success' /> Book Appointment
              </h5>
              <Form onSubmit={handleBookingSubmit}>
                <Form.Group className='mb-2'>
                  <Form.Label>Patient Name</Form.Label>
                  <Form.Control
                    name='patientName'
                    value={booking.patientName}
                    onChange={handleBookingChange}
                    required
                  />
                </Form.Group>
                <Form.Group className='mb-2'>
                  <Form.Label>WhatsApp (2547...)</Form.Label>
                  <Form.Control
                    name='whatsapp'
                    value={booking.whatsapp}
                    onChange={handleBookingChange}
                    placeholder='2547XXXXXXXX'
                    required
                  />
                </Form.Group>
                <Form.Group className='mb-2'>
                  <Form.Label>Date</Form.Label>
                  <Form.Control
                    type='date'
                    name='date'
                    value={booking.date}
                    onChange={handleBookingChange}
                    required
                  />
                </Form.Group>
                <Form.Group className='mb-2'>
                  <Form.Label>Time</Form.Label>
                  <Form.Control
                    type='time'
                    name='time'
                    value={booking.time}
                    onChange={handleBookingChange}
                    required
                  />
                </Form.Group>
                <Form.Group className='mb-3'>
                  <Form.Label>Service</Form.Label>
                  <Form.Control
                    name='service'
                    value={booking.service}
                    onChange={handleBookingChange}
                    required
                  />
                </Form.Group>
                <div className='d-grid'>
                  <Button
                    type='submit'
                    disabled={bookingSubmitting}
                    variant='primary'
                  >
                    {bookingSubmitting ? 'Booking...' : 'Book Appointment'}
                  </Button>
                </div>
              </Form>
            </Card>
          </Col>

          <Col xs={12} lg={6}>
            {/* Testimonial Form */}
            <Card className='p-3 shadow-sm border-0'>
              <h5 className='mb-3 fw-bold'>
                <FaQuoteLeft className='me-2 text-success' /> Submit Testimonial
              </h5>
              <Form onSubmit={handleTestimonialSubmit}>
                <Form.Group className='mb-2'>
                  <Form.Label>Name</Form.Label>
                  <Form.Control
                    name='name'
                    value={testimonialForm.name}
                    onChange={handleTestimonialChange}
                    required
                  />
                </Form.Group>
                <Form.Group className='mb-2'>
                  <Form.Label>Type</Form.Label>
                  <Form.Select
                    name='type'
                    value={testimonialForm.type}
                    onChange={handleTestimonialChange}
                    required
                  >
                    <option>Patient</option>
                    <option>Witness</option>
                    <option>General</option>
                  </Form.Select>
                </Form.Group>
                <Form.Group className='mb-3'>
                  <Form.Label>Message</Form.Label>
                  <Form.Control
                    as='textarea'
                    rows={4}
                    name='message'
                    value={testimonialForm.message}
                    onChange={handleTestimonialChange}
                    required
                  />
                </Form.Group>
                <div className='d-grid'>
                  <Button
                    type='submit'
                    disabled={testimonialSubmitting}
                    variant='success'
                  >
                    {testimonialSubmitting
                      ? 'Submitting...'
                      : 'Submit Testimonial'}
                  </Button>
                </div>
              </Form>
            </Card>
          </Col>
        </Row>

        {/* Appointments List */}
        <h4 className='mt-4 mb-3'>Your Appointments</h4>
        {appointments.length === 0 ? (
          <Alert variant='info'>No appointments found.</Alert>
        ) : (
          <Row xs={1} md={2} lg={3} className='g-3'>
            {appointments.map(a => (
              <Col key={a.id}>
                <Card className='h-100 shadow-sm'>
                  <Card.Body className='d-flex flex-column'>
                    <div className='mb-2'>
                      <strong>{a.patientName}</strong> <br />
                      <small className='text-muted'>{a.whatsapp}</small>
                    </div>
                    <div className='mb-2'>
                      <div>
                        <strong>Date:</strong> {a.date}
                      </div>
                      <div>
                        <strong>Time:</strong> {a.time}
                      </div>
                      <div>
                        <strong>Service:</strong> {a.service}
                      </div>
                      <div>
                        <strong>Status:</strong>{' '}
                        <span className='text-capitalize'>
                          {a.status || 'N/A'}
                        </span>
                      </div>
                    </div>
                    <div className='mt-auto d-flex gap-2 justify-content-end'>
                      <Button
                        size='sm'
                        variant='outline-primary'
                        onClick={() => openReschedule(a)}
                      >
                        <FaEdit className='me-1' /> Reschedule
                      </Button>
                      <Button
                        size='sm'
                        variant='outline-warning'
                        onClick={() => handleRevoke(a.id)}
                      >
                        <FaBan className='me-1' /> Revoke
                      </Button>
                      <Button
                        size='sm'
                        variant='outline-danger'
                        onClick={() => handleDeleteAppointment(a.id)}
                      >
                        <FaTrashAlt className='me-1' /> Delete
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        )}

        {/* Testimonials List */}
        <h4 className='mt-4 mb-3'>Your Testimonials</h4>
        {testimonials.length === 0 ? (
          <Alert variant='info'>No testimonials submitted.</Alert>
        ) : (
          <Row xs={1} md={2} className='g-3'>
            {testimonials.map(t => (
              <Col key={t.id}>
                <Card className='h-100 shadow-sm'>
                  <Card.Body className='d-flex flex-column'>
                    <div className='mb-2'>
                      <strong>{t.name}</strong> <br />
                      <small className='text-muted'>
                        {t.type} •{' '}
                        <span className='text-capitalize'>
                          {t.status || 'pending'}
                        </span>
                      </small>
                    </div>
                    <div className='mb-3'>{t.message}</div>
                    <div className='mt-auto d-flex gap-2 justify-content-end'>
                      <Button
                        size='sm'
                        variant='outline-primary'
                        onClick={() => openEditTestimonial(t)}
                      >
                        <FaEdit className='me-1' /> Edit
                      </Button>
                      <Button
                        size='sm'
                        variant='outline-danger'
                        onClick={() => handleDeleteTestimonial(t.id)}
                      >
                        <FaTrashAlt className='me-1' /> Delete
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Container>

      {/* Manual Reschedule Modal */}
      <Modal
        show={showReschedule}
        onHide={() => setShowReschedule(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Reschedule Appointment</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleRescheduleSubmit}>
          <Modal.Body>
            <Form.Group className='mb-2'>
              <Form.Label>New Date</Form.Label>
              <Form.Control
                type='date'
                name='date'
                value={rescheduleData.date}
                onChange={handleRescheduleChange}
                required
              />
            </Form.Group>
            <Form.Group className='mb-2'>
              <Form.Label>New Time</Form.Label>
              <Form.Control
                type='time'
                name='time'
                value={rescheduleData.time}
                onChange={handleRescheduleChange}
                required
              />
            </Form.Group>
            <small className='text-muted'>
              Previous: {rescheduleData.oldDate} {rescheduleData.oldTime}
            </small>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant='secondary'
              onClick={() => setShowReschedule(false)}
            >
              Cancel
            </Button>
            <Button
              type='submit'
              variant='primary'
              disabled={rescheduleSubmitting}
            >
              {rescheduleSubmitting ? (
                'Saving...'
              ) : (
                <>
                  <FaSave className='me-1' /> Save
                </>
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Edit Testimonial Modal */}
      <Modal
        show={showEditTestimonial}
        onHide={() => setShowEditTestimonial(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Edit Testimonial</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleEditTestimonialSubmit}>
          <Modal.Body>
            <Form.Group className='mb-2'>
              <Form.Label>Name</Form.Label>
              <Form.Control
                name='name'
                value={editTestimonialData.name}
                onChange={handleEditTestimonialChange}
                required
              />
            </Form.Group>
            <Form.Group className='mb-2'>
              <Form.Label>Type</Form.Label>
              <Form.Select
                name='type'
                value={editTestimonialData.type}
                onChange={handleEditTestimonialChange}
                required
              >
                <option>Patient</option>
                <option>Witness</option>
                <option>General</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className='mb-2'>
              <Form.Label>Message</Form.Label>
              <Form.Control
                as='textarea'
                rows={4}
                name='message'
                value={editTestimonialData.message}
                onChange={handleEditTestimonialChange}
                required
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant='secondary'
              onClick={() => setShowEditTestimonial(false)}
            >
              Cancel
            </Button>
            <Button
              type='submit'
              variant='primary'
              disabled={editTestimonialSubmitting}
            >
              {editTestimonialSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Admin Suggested Reschedule Modal */}
      <Modal
        show={showSuggestedReschedule}
        onHide={() => setShowSuggestedReschedule(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Reschedule Suggested by Admin</Modal.Title>
        </Modal.Header>
        {suggestedAppt && (
          <Modal.Body>
            <p>
              Admin suggested a new appointment time:
              <br />
              <strong>
                {suggestedAppt.suggestedDate} at {suggestedAppt.suggestedTime}
              </strong>
            </p>
            <p>Do you accept this new time or decline to reschedule?</p>
          </Modal.Body>
        )}
        <Modal.Footer className='d-flex justify-content-between'>
          <Button
            variant='danger'
            disabled={rescheduleDecisionSubmitting}
            onClick={() => handleDeclineSuggested(suggestedAppt)}
          >
            Decline
          </Button>
          <Button
            variant='success'
            disabled={rescheduleDecisionSubmitting}
            onClick={() => handleAcceptSuggested(suggestedAppt)}
          >
            Accept
          </Button>
        </Modal.Footer>
      </Modal>

      <Footer />
    </>
  )
}
