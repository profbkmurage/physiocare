import { useState, useEffect } from 'react'
import {
  Container,
  Card,
  Row,
  Col,
  Spinner,
  Alert,
  Button,
  Modal
} from 'react-bootstrap'
import { db } from '../../utilities/firebase'
import {
  collection,
  getDocs,
  query,
  orderBy,
  deleteDoc,
  doc
} from 'firebase/firestore'
import dayjs from 'dayjs'

export default function ContactsAdmin () {
  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedContact, setSelectedContact] = useState(null)
  const [modalShow, setModalShow] = useState(false)

  useEffect(() => {
    const fetchContacts = async () => {
      setLoading(true)
      try {
        const q = query(
          collection(db, 'contacts'),
          orderBy('createdAt', 'desc')
        )
        const snapshot = await getDocs(q)
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        setContacts(data)
      } catch (err) {
        console.error('Error fetching contacts:', err)
        setError('Failed to load contacts. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    fetchContacts()
  }, [])

  const truncateText = (text, wordLimit = 15) => {
    const words = text.split(' ')
    if (words.length <= wordLimit) return text
    return words.slice(0, wordLimit).join(' ') + '...'
  }

  const handleReadMore = contact => {
    setSelectedContact(contact)
    setModalShow(true)
  }

  const handleDelete = async id => {
    if (!window.confirm('Are you sure you want to delete this message?')) return
    try {
      await deleteDoc(doc(db, 'contacts', id))
      setContacts(prev => prev.filter(contact => contact.id !== id))
      if (selectedContact?.id === id) setModalShow(false)
    } catch (err) {
      console.error('Error deleting contact:', err)
      setError('Failed to delete contact.')
    }
  }

  return (
    <Container className='my-5'>
      <h2 className='text-center mb-4'>Contact Messages</h2>

      {loading && (
        <div className='text-center'>
          <Spinner animation='border' />
        </div>
      )}

      {error && <Alert variant='danger'>{error}</Alert>}

      {!loading && contacts.length === 0 && (
        <p className='text-center text-muted'>No contact messages yet.</p>
      )}

      <Row className='g-4'>
        {contacts.map(contact => (
          <Col md={6} lg={4} key={contact.id}>
            <Card className='shadow-sm h-100'>
              <Card.Body>
                <Card.Title>{contact.name}</Card.Title>
                <Card.Subtitle className='mb-2 text-muted'>
                  {contact.email}
                </Card.Subtitle>
                <Card.Text>
                  {contact.message.split(' ').length > 15 ? (
                    <>
                      {truncateText(contact.message)}
                      <Button
                        variant='link'
                        size='sm'
                        onClick={() => handleReadMore(contact)}
                      >
                        Read More
                      </Button>
                    </>
                  ) : (
                    contact.message
                  )}
                </Card.Text>
                <div className='d-flex justify-content-between align-items-center mt-3'>
                  <small className='text-muted'>
                    {contact.createdAt
                      ? dayjs(contact.createdAt.toDate()).format(
                          'DD MMM YYYY, h:mm A'
                        )
                      : 'Date not available'}
                  </small>
                  <Button
                    variant='danger'
                    size='sm'
                    onClick={() => handleDelete(contact.id)}
                  >
                    Delete
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Modal for full message */}
      <Modal show={modalShow} onHide={() => setModalShow(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{selectedContact?.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            <strong>Email:</strong> {selectedContact?.email}
          </p>
          <p>{selectedContact?.message}</p>
          <p className='text-end text-muted'>
            {selectedContact?.createdAt
              ? dayjs(selectedContact.createdAt.toDate()).format(
                  'DD MMM YYYY, h:mm A'
                )
              : 'Date not available'}
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant='danger'
            onClick={() => handleDelete(selectedContact.id)}
          >
            Delete
          </Button>
          <Button variant='secondary' onClick={() => setModalShow(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  )
}
