import { useEffect, useState } from 'react'
import { Form, Button, Card, Row, Col } from 'react-bootstrap'
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  serverTimestamp
} from 'firebase/firestore'
import { db } from '../../utilities/firebase'

export default function TeamAdmin () {
  const [team, setTeam] = useState([])
  const [name, setName] = useState('')
  const [role, setRole] = useState('')
  const [bio, setBio] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(false)

  // ================= FETCH TEAM =================
  const fetchTeam = async () => {
    const snapshot = await getDocs(collection(db, 'team'))
    const members = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    setTeam(members)
  }

  useEffect(() => {
    fetchTeam()
  }, [])

  // ================= IMAGE HANDLER =================
  const handleImageChange = e => {
    const file = e.target.files[0]
    if (!file) return
    setImageFile(file)
    setPreview(URL.createObjectURL(file))
  }

  // ================= CLOUDINARY UPLOAD =================
  const uploadToCloudinary = async () => {
    const formData = new FormData()
    formData.append('file', imageFile)
    formData.append(
      'upload_preset',
      import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
    )

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${
        import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
      }/image/upload`,
      { method: 'POST', body: formData }
    )

    const data = await res.json()
    return data.secure_url
  }

  // ================= SUBMIT =================
  const handleSubmit = async e => {
    e.preventDefault()

    try {
      setLoading(true)
      let imageUrl = null

      if (imageFile) {
        imageUrl = await uploadToCloudinary()
      }

      if (editingId) {
        await updateDoc(doc(db, 'team', editingId), {
          name,
          role,
          bio,
          ...(imageUrl && { image: imageUrl })
        })
      } else {
        if (!imageFile) return alert('Image is required')
        await addDoc(collection(db, 'team'), {
          name,
          role,
          bio,
          image: imageUrl,
          createdAt: serverTimestamp()
        })
      }

      resetForm()
      fetchTeam()
    } catch (err) {
      console.error(err)
      alert('Operation failed')
    } finally {
      setLoading(false)
    }
  }

  // ================= EDIT =================
  const handleEdit = member => {
    setEditingId(member.id)
    setName(member.name)
    setRole(member.role)
    setBio(member.bio)
    setPreview(member.image)
    setImageFile(null)
  }

  // ================= DELETE =================
  const handleDelete = async id => {
    if (!window.confirm('Delete this team member?')) return
    await deleteDoc(doc(db, 'team', id))
    fetchTeam()
  }

  // ================= RESET =================
  const resetForm = () => {
    setName('')
    setRole('')
    setBio('')
    setImageFile(null)
    setPreview(null)
    setEditingId(null)
  }

  return (
    <>
      {/* ================= FORM ROW ================= */}
      <Row className='mb-4'>
        <Col md={12}>
          <Card className='shadow-sm'>
            <Card.Body>
              <Card.Title>
                {editingId ? 'Edit Team Member' : 'Add Team Member'}
              </Card.Title>

              <Form onSubmit={handleSubmit}>
                <Form.Group className='mb-2'>
                  <Form.Label>Name</Form.Label>
                  <Form.Control
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                  />
                </Form.Group>

                <Form.Group className='mb-2'>
                  <Form.Label>Role</Form.Label>
                  <Form.Control
                    value={role}
                    onChange={e => setRole(e.target.value)}
                    required
                  />
                </Form.Group>

                <Form.Group className='mb-2'>
                  <Form.Label>Short Bio</Form.Label>
                  <Form.Control
                    as='textarea'
                    rows={3}
                    value={bio}
                    onChange={e => setBio(e.target.value)}
                    required
                  />
                </Form.Group>

                <Form.Group className='mb-3'>
                  <Form.Label>Photo</Form.Label>
                  <Form.Control
                    type='file'
                    accept='image/*'
                    capture='environment'
                    onChange={handleImageChange}
                  />
                </Form.Group>

                {preview && (
                  <div className='text-center mb-3'>
                    <img
                      src={preview}
                      alt='preview'
                      style={{
                        width: 120,
                        height: 120,
                        borderRadius: '50%',
                        objectFit: 'cover'
                      }}
                    />
                  </div>
                )}

                <Button type='submit' disabled={loading}>
                  {loading
                    ? 'Saving...'
                    : editingId
                    ? 'Update Member'
                    : 'Add Member'}
                </Button>

                {editingId && (
                  <Button
                    variant='secondary'
                    className='ms-2'
                    onClick={resetForm}
                  >
                    Cancel
                  </Button>
                )}
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* ================= TEAM LIST ROW ================= */}
      <Row>
        <Col md={12}>
          {team.map(member => (
            <Card key={member.id} className='mb-3 shadow-sm'>
              <Card.Body className='d-flex gap-3'>
                <img
                  src={member.image}
                  alt={member.name}
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    objectFit: 'cover'
                  }}
                />

                <div className='flex-grow-1'>
                  <h6 className='mb-0'>{member.name}</h6>
                  <small className='text-muted'>{member.role}</small>
                  <p className='mb-1 mt-2'>{member.bio}</p>

                  <Button
                    size='sm'
                    variant='outline-primary'
                    onClick={() => handleEdit(member)}
                  >
                    Edit
                  </Button>

                  <Button
                    size='sm'
                    variant='outline-danger'
                    className='ms-2'
                    onClick={() => handleDelete(member.id)}
                  >
                    Delete
                  </Button>
                </div>
              </Card.Body>
            </Card>
          ))}
        </Col>
      </Row>
    </>
  )
}
