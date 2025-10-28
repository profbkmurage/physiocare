import { useState, useEffect } from 'react'
import {
  Container,
  Button,
  Modal,
  Form,
  Row,
  Col,
  Badge,
  Spinner,
  Alert,
  Accordion
} from 'react-bootstrap'
import { db } from '../../utilities/firebase'
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  serverTimestamp
} from 'firebase/firestore'
import {
  FaCheckCircle,
  FaSyncAlt,
  FaComments,
  FaCalendarAlt,
  FaClock,
  FaTimesCircle
} from 'react-icons/fa'
import { BsClipboardData } from 'react-icons/bs'

export default function AppointmentsAdmin () {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showReschedule, setShowReschedule] = useState(false)
  const [showComment, setShowComment] = useState(false)
  const [selectedAppt, setSelectedAppt] = useState(null)
  const [newDate, setNewDate] = useState('')
  const [newTime, setNewTime] = useState('')
  const [comment, setComment] = useState('')

  // Fetch appointments
  useEffect(() => {
    const fetchAppointments = async () => {
      setLoading(true)
      try {
        const snapshot = await getDocs(collection(db, 'appointments'))
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        setAppointments(data)
      } catch (err) {
        console.error(err)
        setError('Failed to load appointments.')
      } finally {
        setLoading(false)
      }
    }
    fetchAppointments()
  }, [])

  // Update Firestore and local state
  const updateAppointment = async (id, updates) => {
    try {
      const ref = doc(db, 'appointments', id)
      await updateDoc(ref, { ...updates, updatedAt: serverTimestamp() })
      setAppointments(prev =>
        prev.map(appt => (appt.id === id ? { ...appt, ...updates } : appt))
      )
    } catch (err) {
      console.error(err)
      setError('Action failed. Try again.')
    }
  }

  const handleApprove = id => {
    updateAppointment(id, { status: 'Approved', adminComment: 'Approved ✅' })
  }

  const handleRevoke = id => {
    if (!window.confirm('Are you sure you want to revoke this appointment?'))
      return
    updateAppointment(id, {
      status: 'Revoked',
      adminComment: 'Revoked by admin'
    })
  }

  const handleReschedule = appt => {
    setSelectedAppt(appt)
    setShowReschedule(true)
  }

  const submitReschedule = async () => {
    if (!newDate || !newTime) return alert('Please select date and time.')
    await updateAppointment(selectedAppt.id, {
      status: 'Pending Reschedule',
      suggestedDate: newDate,
      suggestedTime: newTime,
      adminComment: 'Suggested new date/time, awaiting client confirmation'
    })
    setShowReschedule(false)
    setNewDate('')
    setNewTime('')
  }

  const handleComment = appt => {
    setSelectedAppt(appt)
    setShowComment(true)
  }

  const submitComment = async () => {
    if (!comment.trim()) return alert('Please write a comment.')
    await updateAppointment(selectedAppt.id, { adminComment: comment })
    setShowComment(false)
    setComment('')
  }

  return (
    <Container className='my-5'>
      <h2 className='text-center mb-4'>
        <BsClipboardData className='me-2' />
        Appointments Management
      </h2>

      {error && <Alert variant='danger'>{error}</Alert>}
      {loading ? (
        <div className='text-center'>
          <Spinner animation='border' />
        </div>
      ) : appointments.length === 0 ? (
        <p className='text-center text-muted'>No appointments found.</p>
      ) : (
        <Accordion defaultActiveKey='0'>
          {appointments
            .sort(
              (a, b) =>
                (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)
            )
            .map((appt, idx) => (
              <Accordion.Item eventKey={idx.toString()} key={appt.id}>
                <Accordion.Header>
                  <div className='d-flex flex-column flex-md-row w-100 justify-content-between'>
                    <div>
                      <strong>{appt.patientName}</strong> —{' '}
                      <span className='text-muted'>{appt.whatsapp}</span>
                      <br />
                      <strong>Service:</strong> {appt.service}
                    </div>
                    <Badge
                      bg={
                        appt.status === 'Approved'
                          ? 'success'
                          : appt.status === 'Pending Approval'
                          ? 'warning'
                          : appt.status === 'Pending Reschedule'
                          ? 'info'
                          : appt.status === 'Revoked'
                          ? 'danger'
                          : 'secondary'
                      }
                      className='ms-2 mt-1 mt-md-0'
                    >
                      {appt.status}
                    </Badge>
                  </div>
                </Accordion.Header>
                <Accordion.Body>
                  <Row>
                    <Col md={8}>
                      <p>
                        <FaCalendarAlt className='me-2 text-muted' />
                        {appt.date} <FaClock className='ms-3 me-2 text-muted' />
                        {appt.time}
                      </p>
                      {appt.previousDate && (
                        <p>
                          <strong>Previous:</strong> {appt.previousDate} at{' '}
                          {appt.previousTime}
                        </p>
                      )}
                      {appt.suggestedDate && (
                        <p>
                          <strong>Suggested:</strong> {appt.suggestedDate} at{' '}
                          {appt.suggestedTime}
                        </p>
                      )}
                      {appt.adminComment && (
                        <p className='text-muted'>
                          <FaComments className='me-1' />
                          {appt.adminComment}
                        </p>
                      )}
                    </Col>
                    <Col
                      md={4}
                      className='d-flex flex-wrap gap-2 justify-content-md-end mt-3 mt-md-0'
                    >
                      {appt.status !== 'Approved' && appt.status !== 'Revoked' && (
                        <Button
                          variant='success'
                          size='sm'
                          onClick={() => handleApprove(appt.id)}
                        >
                          <FaCheckCircle className='me-1' /> Approve
                        </Button>
                      )}
                      {appt.status !== 'Revoked' && (
                        <Button
                          variant='warning'
                          size='sm'
                          onClick={() => handleReschedule(appt)}
                        >
                          <FaSyncAlt className='me-1' /> Reschedule
                        </Button>
                      )}
                      <Button
                        variant='info'
                        size='sm'
                        onClick={() => handleComment(appt)}
                      >
                        <FaComments className='me-1' /> Comment
                      </Button>
                      <Button
                        variant='danger'
                        size='sm'
                        onClick={() => handleRevoke(appt.id)}
                      >
                        <FaTimesCircle className='me-1' /> Revoke
                      </Button>
                    </Col>
                  </Row>
                </Accordion.Body>
              </Accordion.Item>
            ))}
        </Accordion>
      )}

      {/* Modal: Reschedule */}
      <Modal
        show={showReschedule}
        onHide={() => setShowReschedule(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Reschedule Appointment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className='mb-3'>
              <Form.Label>New Date</Form.Label>
              <Form.Control
                type='date'
                value={newDate}
                onChange={e => setNewDate(e.target.value)}
              />
            </Form.Group>
            <Form.Group className='mb-3'>
              <Form.Label>New Time</Form.Label>
              <Form.Control
                type='time'
                value={newTime}
                onChange={e => setNewTime(e.target.value)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant='secondary' onClick={() => setShowReschedule(false)}>
            Close
          </Button>
          <Button variant='primary' onClick={submitReschedule}>
            Suggest New Time
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal: Add Comment */}
      <Modal show={showComment} onHide={() => setShowComment(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Add Comment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Control
            as='textarea'
            rows={3}
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder='Write your comment here...'
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant='secondary' onClick={() => setShowComment(false)}>
            Cancel
          </Button>
          <Button variant='primary' onClick={submitComment}>
            Submit Comment
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  )
}
