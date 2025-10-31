import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  Row,
  Col,
  Card,
  Button,
  Spinner,
  Form,
  InputGroup,
  Container
} from 'react-bootstrap'
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  query,
  orderBy
} from 'firebase/firestore'
import { db } from '../utilities/firebase'
import dayjs from 'dayjs'
import { FaWhatsapp, FaPhone, FaHeart } from 'react-icons/fa'

export default function AdminDashboard () {
  const { user } = useAuth()
  const [userName, setUserName] = useState('Admin')
  const [appointments, setAppointments] = useState([])
  const [filtered, setFiltered] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [testimonials, setTestimonials] = useState([])
  const [loadingTestimonials, setLoadingTestimonials] = useState(true)

  // ✅ Fetch admin name
  useEffect(() => {
    const fetchUserName = async () => {
      if (!user) return
      try {
        const snapshot = await getDocs(collection(db, 'users'))
        const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        const currentAdmin = list.find(
          u => u.email === user.email || u.userId === user.uid
        )
        if (currentAdmin) {
          setUserName(currentAdmin.userName || currentAdmin.name || 'Admin')
        }
      } catch (err) {
        console.error('Error fetching admin name:', err)
      }
    }
    fetchUserName()
  }, [user])

  // ✅ Fetch appointments
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'appointments'))
        const list = snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(appt =>
            ['approved', 'rescheduled'].includes(appt.status?.toLowerCase())
          )
          .sort(
            (a, b) =>
              dayjs(a.dateTime || `${a.date} ${a.time}`).unix() -
              dayjs(b.dateTime || `${b.date} ${b.time}`).unix()
          )
        setAppointments(list)
        setFiltered(list)
      } catch (err) {
        console.error('Error fetching appointments:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchAppointments()
  }, [])

  // ✅ Filter + Search
  useEffect(() => {
    let temp = [...appointments]
    if (statusFilter !== 'all') {
      temp = temp.filter(
        appt => appt.status?.toLowerCase() === statusFilter.toLowerCase()
      )
    }
    if (search.trim() !== '') {
      const lower = search.toLowerCase()
      temp = temp.filter(
        appt =>
          appt.patientName?.toLowerCase().includes(lower) ||
          appt.service?.toLowerCase().includes(lower) ||
          appt.whatsapp?.toLowerCase().includes(lower)
      )
    }
    setFiltered(temp)
  }, [search, statusFilter, appointments])

  // ✅ Format phone number for WhatsApp / call
  const formatPhoneNumber = phone => {
    if (!phone) return ''
    let cleaned = phone.replace(/\D/g, '')
    if (cleaned.startsWith('0')) cleaned = '254' + cleaned.substring(1)
    if (!cleaned.startsWith('254')) cleaned = '254' + cleaned
    return cleaned
  }

  const handleEngage = appt => {
    if (!appt.whatsapp)
      return alert('No WhatsApp number found for this client.')
    const cleaned = formatPhoneNumber(appt.whatsapp)
    const message = encodeURIComponent(
      `Hello ${
        appt.patientName
      }, this is ${userName} from PhysioCare. We are reaching out for your appointment for ${
        appt.service
      } set on ${dayjs(appt.date).format('DD MMM YYYY')} at ${appt.time}.`
    )
    window.open(
      `https://wa.me/${cleaned}?text=${message}`,
      '_blank',
      'noopener,noreferrer'
    )
  }

  const handleCall = appt => {
    if (!appt.whatsapp) return alert('No phone number available.')
    const cleaned = formatPhoneNumber(appt.whatsapp)
    window.location.href = `tel:+${cleaned}`
  }

  // ✅ Fetch Testimonials
  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const q = query(
          collection(db, 'testimonials'),
          orderBy('createdAt', 'desc')
        )
        const snapshot = await getDocs(q)
        const list = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        setTestimonials(list)
      } catch (err) {
        console.error('Error fetching testimonials:', err)
      } finally {
        setLoadingTestimonials(false)
      }
    }
    fetchTestimonials()
  }, [])

  // ✅ Toggle status
  const toggleStatus = async (id, currentStatus) => {
    try {
      const newStatus =
        currentStatus?.toLowerCase() === 'approved' ? 'pending' : 'approved'
      await updateDoc(doc(db, 'testimonials', id), { status: newStatus })
      setTestimonials(prev =>
        prev.map(t => (t.id === id ? { ...t, status: newStatus } : t))
      )
    } catch (err) {
      console.error('Error updating status:', err)
    }
  }

  return (
    <div
      className='d-flex flex-column flex-lg-row'
      style={{ minHeight: '100vh' }}
    >
      <div
        style={{
          flex: 1,
          padding: '20px',
          backgroundColor: '#f8f9fa',
          overflowX: 'hidden'
        }}
      >
        <div className='p-4'>
          {/* Welcome Section */}
          <Row className='align-items-center mb-5'>
            <Col md={7} className='text-md-start text-center mb-3 mb-md-0'>
              <h1 className='fw-bold'>Welcome, {userName}!</h1>
              <p className='lead'>
                Here’s your dashboard to manage appointments and testimonials.
              </p>
            </Col>
            <Col md={5} className='text-center'>
              <img
                src='https://media.istockphoto.com/id/1437187317/photo/portrait-of-happy-woman-doctor-working-on-a-digital-tablet-and-smile-while-working-at-a.jpg?s=612x612&w=0&k=20&c=v6uNIj04M1hHoZi7Doxt5GmtyJyab5PyD68ELj7Xu-w='
                alt='Doctor treating patient'
                className='img-fluid rounded-3 shadow'
                style={{
                  maxHeight: '450px',
                  width: '100%',
                  objectFit: 'cover'
                }}
              />
            </Col>
          </Row>

          {/* Search & Filter */}
          <div className='d-flex flex-column flex-md-row justify-content-between align-items-center mb-4 gap-3'>
            <InputGroup className='w-100 w-md-50'>
              <Form.Control
                type='text'
                placeholder='Search by name, phone, or service...'
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </InputGroup>
            <Form.Select
              style={{ maxWidth: '250px' }}
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              <option value='all'>All Status</option>
              <option value='approved'>Approved</option>
              <option value='rescheduled'>Rescheduled</option>
            </Form.Select>
          </div>

          {/* Appointments Section */}
          <h3 className='mb-4 text-center'>Upcoming Appointments</h3>
          {loading ? (
            <div className='text-center py-5'>
              <Spinner animation='border' variant='primary' />
            </div>
          ) : filtered.length === 0 ? (
            <p className='text-center text-muted'>
              No appointments match your criteria.
            </p>
          ) : (
            <Row className='g-4'>
              {filtered.map(appt => (
                <Col md={6} lg={4} key={appt.id}>
                  <Card className='shadow-sm h-100'>
                    <Card.Body>
                      <Card.Title className='fw-bold'>
                        {appt.patientName}
                      </Card.Title>
                      <Card.Text>
                        <strong>Phone:</strong>{' '}
                        {appt.whatsapp ? (
                          <a href={`tel:${appt.whatsapp}`}>{appt.whatsapp}</a>
                        ) : (
                          'N/A'
                        )}
                        <br />
                        <strong>Service:</strong> {appt.service || 'N/A'}
                        <br />
                        <strong>Date:</strong>{' '}
                        {dayjs(appt.date).format('DD MMM YYYY')}
                        <br />
                        <strong>Time:</strong> {appt.time || 'N/A'}
                        <br />
                        <strong>Status:</strong>{' '}
                        <span
                          className={
                            appt.status?.toLowerCase() === 'approved'
                              ? 'text-success'
                              : 'text-warning'
                          }
                        >
                          {appt.status}
                        </span>
                      </Card.Text>
                      <div className='d-flex gap-2'>
                        <Button
                          variant='success'
                          size='sm'
                          onClick={() => handleEngage(appt)}
                        >
                          <FaWhatsapp className='me-1' /> Engage
                        </Button>
                        <Button
                          variant='outline-primary'
                          size='sm'
                          onClick={() => handleCall(appt)}
                        >
                          <FaPhone className='me-1' /> Call
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          )}

          {/* Testimonials Section */}
          <Container className='my-5'>
            <h3 className='text-center mb-4'>Client Testimonials</h3>
            {loadingTestimonials ? (
              <div className='text-center py-4'>
                <Spinner animation='border' variant='primary' />
              </div>
            ) : testimonials.length === 0 ? (
              <p className='text-center text-muted'>No testimonials found.</p>
            ) : (
              <Row className='g-4'>
                {testimonials.map(t => (
                  <Col key={t.id} md={6} lg={4}>
                    <Card className='shadow-sm h-100 position-relative'>
                      <div className='text-center mt-3'>
                        <FaHeart size={28} color='#d63384' className='mb-2' />
                      </div>
                      <Card.Body>
                        <Card.Title className='fw-bold text-primary'>
                          {t.name}
                        </Card.Title>
                        <Card.Subtitle className='mb-2 text-muted'>
                          {t.type}
                        </Card.Subtitle>
                        <Card.Text style={{ minHeight: '90px' }}>
                          {t.message}
                        </Card.Text>
                        <small className='text-muted d-block text-end'>
                          {t.createdAt
                            ? dayjs(t.createdAt.toDate()).format(
                                'DD MMM YYYY, hh:mm A'
                              )
                            : '—'}
                        </small>
                      </Card.Body>
                      <Card.Footer className='bg-light text-center'>
                        <Button
                          variant={
                            t.status?.toLowerCase() === 'approved'
                              ? 'outline-danger'
                              : 'outline-success'
                          }
                          size='sm'
                          onClick={() => toggleStatus(t.id, t.status)}
                        >
                          {t.status?.toLowerCase() === 'approved'
                            ? 'Revoke'
                            : 'Approve'}
                        </Button>
                      </Card.Footer>
                    </Card>
                  </Col>
                ))}
              </Row>
            )}
          </Container>

          <Outlet />
        </div>
      </div>
    </div>
  )
}
