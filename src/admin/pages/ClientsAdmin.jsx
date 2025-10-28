import { useState, useEffect } from 'react'
import {
  Container,
  Table,
  Button,
  Spinner,
  Alert,
  Form,
  Row,
  Col,
  Card,
  Stack
} from 'react-bootstrap'
import { db, auth } from '../../utilities/firebase'
import { collection, getDocs, doc, deleteDoc, setDoc } from 'firebase/firestore'
import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail
} from 'firebase/auth'
import {
  FaUserPlus,
  FaTrash,
  FaEnvelope,
  FaPhone,
  FaSearch
} from 'react-icons/fa'

export default function ClientsAdmin () {
  const [clients, setClients] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Fetch clients and users
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const clientsSnapshot = await getDocs(collection(db, 'clients'))
        setClients(clientsSnapshot.docs.map(d => ({ id: d.id, ...d.data() })))

        const usersSnapshot = await getDocs(collection(db, 'users'))
        setUsers(usersSnapshot.docs.map(d => ({ id: d.id, ...d.data() })))
      } catch (err) {
        console.error(err)
        setError('Failed to load data.')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // Create account for a pending client
  const handleCreateAccount = async client => {
    setError('')
    setSuccess('')
    if (!window.confirm(`Create account for ${client.name}?`)) return

    try {
      // Create Firebase Auth user (this will sign in the current user if not careful in some setups;
      // If creating auth users from admin flow, consider using Firebase Admin SDK on server.)
      await createUserWithEmailAndPassword(
        auth,
        client.email,
        client.password || 'TempPassword123!'
      )
      // send reset link so user can set real password
      await sendPasswordResetEmail(auth, client.email)

      // Save to users collection (using email as doc id keeps it unique; you can change to uid if preferred)
      const userRef = doc(db, 'users', client.email)
      await setDoc(userRef, {
        name: client.name,
        email: client.email,
        phone: client.phone,
        role: 'client',
        createdAt: client.createdAt || new Date()
      })

      // remove from clients collection
      await deleteDoc(doc(db, 'clients', client.id))
      setClients(prev => prev.filter(c => c.id !== client.id))

      // update local users state
      setUsers(prev => [
        ...prev,
        {
          id: client.email,
          name: client.name,
          email: client.email,
          phone: client.phone,
          role: 'client'
        }
      ])

      setSuccess(`Account created and email sent to ${client.email}`)
    } catch (err) {
      console.error(err)
      setError(`Failed to create account: ${err.message || err}`)
    }
  }

  // Delete user
  const handleDeleteUser = async userToDelete => {
    if (
      !window.confirm(`Delete user ${userToDelete.name || userToDelete.email}?`)
    )
      return
    try {
      await deleteDoc(doc(db, 'users', userToDelete.id))
      setUsers(prev => prev.filter(u => u.id !== userToDelete.id))
      setSuccess(`User ${userToDelete.name || userToDelete.email} deleted`)
    } catch (err) {
      console.error(err)
      setError(`Failed to delete user: ${err.message || err}`)
    }
  }

  // Filter helpers
  const matchesSearch = item => {
    const q = searchTerm.trim().toLowerCase()
    if (!q) return true
    return (
      (item.name || '').toLowerCase().includes(q) ||
      (item.email || '').toLowerCase().includes(q) ||
      (item.phone || '').toLowerCase().includes(q)
    )
  }

  const filteredClients = clients.filter(matchesSearch)
  const filteredUsers = users.filter(matchesSearch)

  return (
    <Container className='my-5'>
      <h2 className='text-center mb-4'>Client Management</h2>

      {/* Search & alerts */}
      <Row className='align-items-center mb-3 g-2'>
        <Col xs={12} md={6}>
          <Form>
            <div className='d-flex'>
              <Form.Control
                placeholder='Search by name, email, or phone'
                aria-label='Search clients/users'
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
              <Button
                variant='secondary'
                className='ms-2 d-none d-md-inline-flex'
              >
                <FaSearch />
              </Button>
            </div>
          </Form>
        </Col>
        <Col xs={12} md={6} className='text-md-end'>
          <small className='text-muted'>
            Showing pending clients and registered users
          </small>
        </Col>
      </Row>

      {loading ? (
        <div className='text-center py-5'>
          <Spinner animation='border' />
        </div>
      ) : (
        <>
          {error && (
            <Alert variant='danger' onClose={() => setError('')} dismissible>
              {error}
            </Alert>
          )}
          {success && (
            <Alert variant='success' onClose={() => setSuccess('')} dismissible>
              {success}
            </Alert>
          )}

          {/* Desktop / Tablet Table (md and up) */}
          <div className='d-none d-md-block'>
            <h4 className='mt-3'>Pending Clients</h4>
            <Table striped bordered hover responsive className='table-sm'>
              <thead className='table-light'>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Age</th>
                  <th>Location</th>
                  <th style={{ width: 150 }} className='text-center'>
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredClients.length === 0 ? (
                  <tr>
                    <td colSpan={6} className='text-center text-muted'>
                      No pending clients.
                    </td>
                  </tr>
                ) : (
                  filteredClients.map(client => (
                    <tr key={client.id}>
                      <td
                        style={{
                          maxWidth: 200,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                      >
                        {client.name}
                      </td>
                      <td
                        style={{
                          maxWidth: 220,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                      >
                        {client.email}
                      </td>
                      <td>
                        <FaPhone className='me-1' />
                        {client.phone}
                      </td>
                      <td>{client.age || '-'}</td>
                      <td style={{ maxWidth: 200 }}>
                        {client.location || '-'}
                      </td>
                      <td className='text-center'>
                        <Stack
                          direction='horizontal'
                          gap={2}
                          className='justify-content-center'
                        >
                          <Button
                            variant='success'
                            size='sm'
                            onClick={() => handleCreateAccount(client)}
                          >
                            <FaUserPlus className='me-1' /> Create
                          </Button>
                        </Stack>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>

            <h4 className='mt-5'>Registered Users</h4>
            <Table striped bordered hover responsive className='table-sm'>
              <thead className='table-light'>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Role</th>
                  <th style={{ width: 140 }} className='text-center'>
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className='text-center text-muted'>
                      No users found.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map(u => (
                    <tr key={u.id}>
                      <td
                        style={{
                          maxWidth: 220,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                      >
                        {u.name}
                      </td>
                      <td style={{ maxWidth: 240 }}>{u.email}</td>
                      <td>
                        <FaPhone className='me-1' />
                        {u.phone}
                      </td>
                      <td>{u.role || 'client'}</td>
                      <td className='text-center'>
                        <Button
                          variant='danger'
                          size='sm'
                          onClick={() => handleDeleteUser(u)}
                        >
                          <FaTrash className='me-1' /> Delete
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>

          {/* Mobile: card list (xs / sm) */}
          <div className='d-block d-md-none'>
            <h5 className='mt-3 mb-2'>Pending Clients</h5>
            {filteredClients.length === 0 ? (
              <p className='text-muted'>No pending clients.</p>
            ) : (
              filteredClients.map(client => (
                <Card key={client.id} className='mb-3 shadow-sm'>
                  <Card.Body>
                    <Row className='align-items-center'>
                      <Col xs={8}>
                        <div className='fw-bold'>{client.name}</div>
                        <div
                          className='text-truncate'
                          style={{ maxWidth: '100%' }}
                        >
                          <FaEnvelope className='me-1' /> {client.email}
                        </div>
                        <div>
                          <FaPhone className='me-1' /> {client.phone}
                        </div>
                      </Col>
                      <Col xs={4} className='text-end'>
                        <Stack gap={2} className='align-items-end'>
                          <Button
                            size='sm'
                            variant='success'
                            onClick={() => handleCreateAccount(client)}
                          >
                            <FaUserPlus className='me-1' /> Create
                          </Button>
                        </Stack>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              ))
            )}

            <h5 className='mt-4 mb-2'>Registered Users</h5>
            {filteredUsers.length === 0 ? (
              <p className='text-muted'>No users found.</p>
            ) : (
              filteredUsers.map(u => (
                <Card key={u.id} className='mb-3 shadow-sm'>
                  <Card.Body>
                    <Row className='align-items-center'>
                      <Col xs={8}>
                        <div className='fw-bold'>{u.name}</div>
                        <div
                          className='text-truncate'
                          style={{ maxWidth: '100%' }}
                        >
                          <FaEnvelope className='me-1' /> {u.email}
                        </div>
                        <div>
                          <FaPhone className='me-1' /> {u.phone}
                        </div>
                        <div className='small text-muted'>
                          Role: {u.role || 'client'}
                        </div>
                      </Col>
                      <Col xs={4} className='text-end'>
                        <Stack gap={2} className='align-items-end'>
                          <Button
                            size='sm'
                            variant='danger'
                            onClick={() => handleDeleteUser(u)}
                          >
                            <FaTrash className='me-1' /> Delete
                          </Button>
                        </Stack>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              ))
            )}
          </div>
        </>
      )}
    </Container>
  )
}
