import { useState, useEffect } from 'react'
import {
  Container,
  Table,
  Button,
  Spinner,
  Alert,
  Form,
  Row,
  Col
} from 'react-bootstrap'
import { db, auth } from '../../utilities/firebase'
import { collection, getDocs, doc, deleteDoc, setDoc } from 'firebase/firestore'
import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail
} from 'firebase/auth'

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
        setClients(
          clientsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        )

        const usersSnapshot = await getDocs(collection(db, 'users'))
        setUsers(usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
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
      // Create Firebase Auth user
      await createUserWithEmailAndPassword(
        auth,
        client.email,
        client.password || 'TempPassword123!'
      )
      await sendPasswordResetEmail(auth, client.email)

      // Add to Firestore users collection
      const userRef = doc(db, 'users', client.email) // Using email as ID
      await setDoc(userRef, {
        name: client.name,
        email: client.email,
        phone: client.phone,
        role: 'client',
        createdAt: client.createdAt || new Date()
      })

      // Remove from clients collection
      await deleteDoc(doc(db, 'clients', client.id))
      setClients(prev => prev.filter(c => c.id !== client.id))

      // Refresh users state
      setUsers(prev => [
        ...prev,
        {
          name: client.name,
          email: client.email,
          phone: client.phone,
          role: 'client'
        }
      ])
      setSuccess(`Account created and email sent to ${client.email}`)
    } catch (err) {
      console.error(err)
      setError(`Failed to create account: ${err.message}`)
    }
  }

  // Delete user
  const handleDeleteUser = async user => {
    if (!window.confirm(`Delete user ${user.name}?`)) return
    try {
      await deleteDoc(doc(db, 'users', user.id))
      setUsers(prev => prev.filter(u => u.id !== user.id))
      setSuccess(`User ${user.name} deleted`)
    } catch (err) {
      console.error(err)
      setError(`Failed to delete user: ${err.message}`)
    }
  }

  // Filter clients and users safely
  const filteredClients = clients.filter(
    client =>
      (client.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (client.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (client.phone || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredUsers = users.filter(
    user =>
      (user.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.phone || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <Container className='my-5'>
      <h2 className='text-center mb-4'>Pending Clients</h2>

      <Form className='mb-3'>
        <Row>
          <Col md={6}>
            <Form.Control
              placeholder='Search by name, email, or phone'
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </Col>
        </Row>
      </Form>

      {loading ? (
        <div className='text-center'>
          <Spinner animation='border' />
        </div>
      ) : (
        <>
          {error && <Alert variant='danger'>{error}</Alert>}
          {success && <Alert variant='success'>{success}</Alert>}

          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Age</th>
                <th>Location</th>
                <th>Action</th>
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
                    <td>{client.name}</td>
                    <td>{client.email}</td>
                    <td>{client.phone}</td>
                    <td>{client.age}</td>
                    <td>{client.location}</td>
                    <td>
                      <Button
                        variant='primary'
                        size='sm'
                        onClick={() => handleCreateAccount(client)}
                      >
                        Create Account
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>

          <h2 className='text-center mt-5 mb-4'>Registered Users</h2>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Action</th>
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
                filteredUsers.map(user => (
                  <tr key={user.id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.phone}</td>
                    <td>{user.role || 'client'}</td>
                    <td>
                      <Button
                        variant='danger'
                        size='sm'
                        onClick={() => handleDeleteUser(user)}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </>
      )}
    </Container>
  )
}
