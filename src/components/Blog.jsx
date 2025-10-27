import { useEffect, useState } from 'react'
import { Container, Row, Col, Card, Button, Form, Alert } from 'react-bootstrap'
import {
  collection,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  serverTimestamp,
  increment
} from 'firebase/firestore'
import { db } from '../utilities/firebase'
import DOMPurify from 'dompurify'
import { FaHeart, FaShareAlt } from 'react-icons/fa'
import Footer from '../components/Footer'
import './blogs.css'

export default function Blog () {
  const [blogs, setBlogs] = useState([])
  const [expandedBlogId, setExpandedBlogId] = useState(null)
  const [commentForm, setCommentForm] = useState({
    name: '',
    email: '',
    comment: ''
  })
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  // Fetch blogs from Firestore
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const blogCollection = collection(db, 'blogs')
        const blogSnapshot = await getDocs(blogCollection)
        const blogList = blogSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        setBlogs(blogList)
      } catch (err) {
        console.error('Error fetching blogs:', err)
      }
    }
    fetchBlogs()
  }, [])

  // Handle comment input
  const handleCommentChange = e => {
    setCommentForm({ ...commentForm, [e.target.name]: e.target.value })
  }

  // Submit comment
  const handleCommentSubmit = async blogId => {
    setError('')
    setSubmitted(false)
    const { name, email, comment } = commentForm
    if (!name || !email || !comment) {
      setError('All fields are required.')
      return
    }

    try {
      await addDoc(collection(db, 'blogComments'), {
        blogId,
        name,
        email,
        comment,
        createdAt: serverTimestamp()
      })
      setSubmitted(true)
      setCommentForm({ name: '', email: '', comment: '' })
    } catch (err) {
      console.error('Comment submission error:', err)
      setError('Failed to submit comment. Please try again later.')
    }
  }

  // Handle likes
  const handleLike = async blogId => {
    const blogRef = doc(db, 'blogs', blogId)
    await updateDoc(blogRef, { likes: increment(1) })
    setBlogs(
      blogs.map(b =>
        b.id === blogId ? { ...b, likes: (b.likes || 0) + 1 } : b
      )
    )
  }

  // Handle share
  const handleShare = blog => {
    if (navigator.share) {
      navigator.share({
        title: blog.title,
        text: blog.description || '',
        url: window.location.href
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert('Link copied!')
    }
  }

  // Function to limit words for preview
  const getPreview = blog => {
    if (!blog.content) return ''
    const contentText = blog.content.replace(/<[^>]*>/g, '') // strip HTML
    const words = contentText.split(' ')
    const preview = words.slice(0, 50).join(' ')
    return words.length > 50 ? preview + '...' : preview
  }

  return (
    <>
      <Container className='my-5'>
        <h2 className='text-center mb-4'>Our Blog</h2>
        <Row className='g-4'>
          {blogs.map(blog =>
            expandedBlogId === null || expandedBlogId === blog.id ? (
              <Col
                key={blog.id}
                md={expandedBlogId ? 12 : 6}
                lg={expandedBlogId ? 12 : 4}
              >
                <Card
                  className={`shadow-sm blog-card ${
                    expandedBlogId === blog.id ? 'expanded' : ''
                  }`}
                >
                  {blog.mainImage && (
                    <div className='blog-img-wrapper'>
                      <img
                        src={blog.mainImage}
                        alt={blog.title || 'Blog image'}
                        className='blog-img'
                        onError={e => (e.target.style.display = 'none')}
                      />
                    </div>
                  )}
                  <Card.Body className='d-flex flex-column justify-content-between'>
                    <div>
                      <Card.Title className='fw-bold text-center'>
                        {blog.title}
                      </Card.Title>
                      <Card.Text
                        className='blog-preview-text'
                        dangerouslySetInnerHTML={{
                          __html: DOMPurify.sanitize(
                            expandedBlogId === blog.id
                              ? blog.content
                              : getPreview(blog)
                          )
                        }}
                      />
                    </div>

                    {expandedBlogId === blog.id ? (
                      <>
                        <div className='mt-3 d-flex gap-2'>
                          <Button
                            variant='danger'
                            onClick={() => handleLike(blog.id)}
                          >
                            <FaHeart /> {blog.likes || 0}
                          </Button>
                          <Button
                            variant='primary'
                            onClick={() => handleShare(blog)}
                          >
                            <FaShareAlt /> {blog.shares || 0}
                          </Button>
                        </div>

                        <hr />
                        <p className='fw-bold mt-3'>Drop your comments here:</p>
                        {submitted && (
                          <Alert variant='success'>Comment submitted!</Alert>
                        )}
                        {error && <Alert variant='danger'>{error}</Alert>}

                        <Form
                          onSubmit={e => {
                            e.preventDefault()
                            handleCommentSubmit(blog.id)
                          }}
                        >
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
                          <div className='d-flex gap-2'>
                            <Button type='submit' variant='primary'>
                              Submit Comment
                            </Button>
                            <Button
                              variant='secondary'
                              onClick={() => setExpandedBlogId(null)}
                            >
                              Back
                            </Button>
                          </div>
                        </Form>
                      </>
                    ) : (
                      <div className='mt-auto pt-3 text-center'>
                        <Button
                          variant='primary'
                          onClick={() => setExpandedBlogId(blog.id)}
                        >
                          Read More
                        </Button>
                      </div>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            ) : null
          )}
        </Row>
      </Container>
      <Footer />
    </>
  )
}
