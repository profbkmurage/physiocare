import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  increment,
  query,
  where,
  orderBy,
  serverTimestamp
} from 'firebase/firestore'
import { db } from '../utilities/firebase'
import { Container, Card, Badge, Button, Form, Alert } from 'react-bootstrap'
import DOMPurify from 'dompurify'
import dayjs from 'dayjs'
import Footer from '../components/Footer'
import { FaHeart, FaShareAlt } from 'react-icons/fa'
import '../components/blogs.css'

export default function SingleBlog () {
  const { id } = useParams()
  const navigate = useNavigate()

  const [blog, setBlog] = useState(null)
  const [comments, setComments] = useState([])
  const [commentForm, setCommentForm] = useState({
    name: '',
    email: '',
    comment: ''
  })
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)

  // Fetch the blog
  useEffect(() => {
    const loadBlog = async () => {
      const blogRef = doc(db, 'blogs', id)
      const snap = await getDoc(blogRef)
      if (snap.exists()) {
        setBlog({ id: snap.id, ...snap.data() })
      }
    }
    loadBlog()
  }, [id])

  // Fetch approved comments
  useEffect(() => {
    const loadComments = async () => {
      const q = query(
        collection(db, 'blogComments'),
        where('blogId', '==', id),
        where('status', '==', 'approved'),
        orderBy('createdAt', 'desc')
      )
      const snaps = await getDocs(q)
      const list = snaps.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setComments(list)
    }
    loadComments()
  }, [id])

  const handleCommentChange = e => {
    setCommentForm({ ...commentForm, [e.target.name]: e.target.value })
  }

  // Submit comment (status = pending)
  const handleSubmitComment = async e => {
    e.preventDefault()
    setError('')
    setSubmitted(false)

    const { name, email, comment } = commentForm
    if (!name || !email || !comment) {
      setError('Please fill all fields')
      return
    }

    try {
      await addDoc(collection(db, 'blogComments'), {
        blogId: id,
        name,
        email,
        comment,
        status: 'pending',
        createdAt: serverTimestamp()
      })
      setSubmitted(true)
      setCommentForm({ name: '', email: '', comment: '' })
    } catch (err) {
      console.error(err)
      setError('Failed to submit comment')
    }
  }

  // Handle like
  const handleLike = async () => {
    const ref = doc(db, 'blogs', id)
    await updateDoc(ref, { likes: increment(1) })
    setBlog(prev => ({ ...prev, likes: (prev.likes || 0) + 1 }))
  }

  // Handle share
  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/blog/${id}`

    if (navigator.share) {
      await navigator.share({
        title: blog.title,
        text: blog.description || '',
        url: shareUrl
      })
    } else {
      await navigator.clipboard.writeText(shareUrl)
      alert('Link copied!')
    }

    // Update share count in DB
    const ref = doc(db, 'blogs', id)
    await updateDoc(ref, { shares: increment(1) })

    // Update UI
    setBlog(prev => ({ ...prev, shares: (prev.shares || 0) + 1 }))
  }

  if (!blog) return <p className='text-center mt-5'>Loading...</p>

  return (
    <>
      <Container className='my-5'>
        <Button variant='secondary' onClick={() => navigate('/blog')}>
          Back
        </Button>

        <Card className='shadow-sm border-0 mt-4 p-3'>
          {blog.mainImage && (
            <img src={blog.mainImage} className='img-fluid mb-3 rounded' />
          )}

          <h2 className='fw-bold'>{blog.title}</h2>

          {blog.createdAt && (
            <div className='d-flex justify-content-end'>
              <Badge bg='primary' pill className='mt-2 d-inline-block'>
                {dayjs(blog.createdAt.toDate()).format('DD MMM YYYY')}
              </Badge>
            </div>
          )}

          <div
            className='mt-3'
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(blog.content)
            }}
          />

          <div className='d-flex gap-3 mt-4'>
            <Button variant='danger' onClick={handleLike}>
              <FaHeart /> {blog.likes || 0}
            </Button>

            <Button variant='primary' onClick={handleShare}>
              <FaShareAlt /> {blog.shares || 0} Share
            </Button>
          </div>
        </Card>

        {/* Comments Section */}
        <Card className='shadow-sm border-0 mt-4 p-4'>
          <h4 className='fw-bold'>Comments</h4>

          {comments.length === 0 ? (
            <p>No comments yet.</p>
          ) : (
            comments.map(c => (
              <div key={c.id} className='p-2 border-bottom'>
                <strong>{c.name}</strong>
                <p>{c.comment}</p>
              </div>
            ))
          )}

          <hr />

          <h5 className='fw-bold mt-3'>Leave a comment</h5>

          {submitted && <Alert variant='success'>Comment submitted!</Alert>}
          {error && <Alert variant='danger'>{error}</Alert>}

          <Form onSubmit={handleSubmitComment}>
            <Form.Group className='mb-2'>
              <Form.Label>Name</Form.Label>
              <Form.Control
                type='text'
                name='name'
                value={commentForm.name}
                onChange={handleCommentChange}
                required
              />
            </Form.Group>

            <Form.Group className='mb-2'>
              <Form.Label>Email</Form.Label>
              <Form.Control
                type='email'
                name='email'
                value={commentForm.email}
                onChange={handleCommentChange}
                required
              />
            </Form.Group>

            <Form.Group className='mb-2'>
              <Form.Label>Comment</Form.Label>
              <Form.Control
                as='textarea'
                rows={3}
                name='comment'
                value={commentForm.comment}
                onChange={handleCommentChange}
                required
              />
            </Form.Group>

            <Button type='submit' variant='primary' className='mt-2'>
              Submit Comment
            </Button>
          </Form>
        </Card>
      </Container>

      <Footer />
    </>
  )
}
