import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
// import Sidebar from './components/Sidebar'
import {
  Row,
  Col,
  Card,
  Button,
  Spinner,
  Form,
  InputGroup
} from 'react-bootstrap'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../utilities/firebase'
import dayjs from 'dayjs'

export default function AdminDashboard () {
  const { user } = useAuth()
  const [appointments, setAppointments] = useState([])
  const [users, setUsers] = useState([])
  const [filtered, setFiltered] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [userName, setUserName] = useState('Admin')

  // ✅ Fetch all users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'users'))
        const list = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        setUsers(list)

        const admin = list.find(
          u => u.email === user?.email || u.userId === user?.uid
        )
        if (admin) setUserName(admin.userName || admin.name || 'Admin')
      } catch (err) {
        console.error('Error fetching users:', err)
      }
    }
    if (user) fetchUsers()
  }, [user])

  // ✅ Fetch appointments
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'appointments'))
        const list = snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(
            appt =>
              appt.status?.toLowerCase() === 'approved' ||
              appt.status?.toLowerCase() === 'rescheduled'
          )
          .map(appt => {
            const matchedUser = users.find(
              u =>
                u.phone === appt.phone ||
                u.phoneNumber === appt.phone ||
                u.phone === appt.phoneNumber ||
                u.userId === appt.userId
            )
            return {
              ...appt,
              clientName:
                appt.clientName ||
                matchedUser?.userName ||
                matchedUser?.name ||
                'Unnamed Client',
              phone:
                appt.phone ||
                appt.phoneNumber ||
                matchedUser?.phone ||
                matchedUser?.phoneNumber ||
                ''
            }
          })
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
    if (users.length > 0) fetchAppointments()
  }, [users])

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
          appt.clientName?.toLowerCase().includes(lower) ||
          appt.service?.toLowerCase().includes(lower) ||
          appt.phone?.toLowerCase().includes(lower)
      )
    }
    setFiltered(temp)
  }, [search, statusFilter, appointments])

  // ✅ Format phone number
  const formatPhoneNumber = phone => {
    if (!phone) return ''
    let cleaned = phone.replace(/\D/g, '')
    if (cleaned.startsWith('0')) cleaned = '254' + cleaned.substring(1)
    if (!cleaned.startsWith('254')) cleaned = '254' + cleaned
    return cleaned
  }

  // ✅ WhatsApp engage
  const handleEngage = appt => {
    if (!appt.phone) return alert('No phone number found for this client.')
    const cleaned = formatPhoneNumber(appt.phone)
    const message = encodeURIComponent(
      `Hello ${
        appt.clientName
      }, this is ${userName} from our clinic. Your appointment for ${
        appt.service
      } on ${dayjs(appt.date).format('DD MMM YYYY')} at ${appt.time}.`
    )
    window.open(
      `https://wa.me/${cleaned}?text=${message}`,
      '_blank',
      'noopener,noreferrer'
    )
  }

  // ✅ Call client
  const handleCall = appt => {
    if (!appt.phone) return alert('No phone number available for this client.')
    const cleaned = formatPhoneNumber(appt.phone)
    window.location.href = `tel:+${cleaned}`
  }

  return (
    <div className='d-flex' style={{ minHeight: '100vh' }}>
      
      {/* Main Content */}
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
                Here’s your dashboard where you can manage clients,
                appointments, blogs, and more.
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

          {/* Appointments */}
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
                        {appt.clientName}
                      </Card.Title>
                      <Card.Text>
                        <strong>Phone:</strong>{' '}
                        {appt.phone ? (
                          <a href={`tel:${appt.phone}`}>{appt.phone}</a>
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
                          Engage (WhatsApp)
                        </Button>
                        <Button
                          variant='outline-primary'
                          size='sm'
                          onClick={() => handleCall(appt)}
                        >
                          Call
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
          <Outlet />
        </div>
      </div>
    </div>
  )
}
