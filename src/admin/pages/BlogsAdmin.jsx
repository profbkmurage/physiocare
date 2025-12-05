import { useEffect, useState } from 'react'
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  query,
  where
} from 'firebase/firestore'
import { db } from '../../utilities/firebase.js'
import { Button, Card, Spinner, Modal, ListGroup } from 'react-bootstrap'
import {
  FaPlus,
  FaTrash,
  FaEdit,
  FaHeart,
  FaShareAlt,
  FaComments
} from 'react-icons/fa'
import BlogForm from './BlogForm'
import dayjs from 'dayjs'

const BlogsAdmin = () => {
  const [blogs, setBlogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editBlog, setEditBlog] = useState(null)

  const [showCommentsModal, setShowCommentsModal] = useState(false)
  const [selectedBlogId, setSelectedBlogId] = useState(null)
  const [comments, setComments] = useState([])
  const [commentsLoading, setCommentsLoading] = useState(false)

  // Fetch all blogs
  const fetchBlogs = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'blogs'))
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setBlogs(data)
    } catch (error) {
      console.error('Error fetching blogs:', error)
    } finally {
      setLoading(false)
    }
  }

  // Fetch comments linked to one blog
  const fetchComments = async blogId => {
    setCommentsLoading(true)
    try {
      const commentsRef = collection(db, 'blogComments')
      const q = query(commentsRef, where('blogId', '==', blogId))
      const querySnapshot = await getDocs(q)

      const data = querySnapshot.docs.map(d => ({
        id: d.id,
        ...d.data()
      }))

      setComments(data)
    } catch (error) {
      console.error('Error loading comments:', error)
    } finally {
      setCommentsLoading(false)
    }
  }

  const handleDeleteBlog = async id => {
    if (window.confirm('Are you sure you want to delete this blog?')) {
      await deleteDoc(doc(db, 'blogs', id))
      fetchBlogs()
    }
  }

  const handleEdit = blog => {
    setEditBlog(blog)
    setShowForm(true)
  }

  const handleOpenComments = blogId => {
    setSelectedBlogId(blogId)
    setShowCommentsModal(true)
    fetchComments(blogId)
  }

  // Approve comment
  const handleApprove = async id => {
    await updateDoc(doc(db, 'blogComments', id), { status: 'approved' })
    fetchComments(selectedBlogId)
  }

  // Revoke comment
  const handleRevoke = async id => {
    await updateDoc(doc(db, 'blogComments', id), { status: 'pending' })
    fetchComments(selectedBlogId)
  }

  // Delete comment
  const handleDeleteComment = async id => {
    if (window.confirm('Delete this comment?')) {
      await deleteDoc(doc(db, 'blogComments', id))
      fetchComments(selectedBlogId)
    }
  }

  useEffect(() => {
    fetchBlogs()
  }, [])

  return (
    <div className='blogs-admin p-4'>
      <div className='d-flex justify-content-between align-items-center mb-4'>
        <h3 className='fw-bold'>📰 Blog Management</h3>
        <Button variant='primary' onClick={() => setShowForm(!showForm)}>
          <FaPlus /> {showForm ? 'Close' : 'Add Blog'}
        </Button>
      </div>

      {showForm && (
        <BlogForm
          fetchBlogs={fetchBlogs}
          setShowForm={setShowForm}
          editBlog={editBlog}
          setEditBlog={setEditBlog}
        />
      )}

      {loading ? (
        <div className='text-center mt-5'>
          <Spinner animation='border' />
        </div>
      ) : blogs.length === 0 ? (
        <p className='text-muted'>No blogs yet.</p>
      ) : (
        <div className='row'>
          {blogs.map(blog => (
            <div key={blog.id} className='col-md-6 col-lg-4 mb-4'>
              <Card className='blog-card shadow-sm border-0 h-100 d-flex flex-column'>
                {blog.mainImage && (
                  <img
                    src={blog.mainImage}
                    alt={blog.title}
                    style={{
                      maxHeight: '180px',
                      width: '100%',
                      objectFit: 'cover',
                      borderTopLeftRadius: '0.25rem',
                      borderTopRightRadius: '0.25rem'
                    }}
                    onError={e => (e.target.style.display = 'none')}
                  />
                )}

                <Card.Body className='d-flex flex-column justify-content-between p-3'>
                  <div className='mb-2'>
                    <Card.Title className='fw-bold mb-1'>
                      {blog.title}
                    </Card.Title>
                    <Card.Subtitle className='text-muted small mb-2'>
                      {dayjs(blog.createdAt?.toDate()).format('MMM D, YYYY')}
                    </Card.Subtitle>
                  </div>

                  <div className='d-flex justify-content-between align-items-center mt-auto'>
                    <div className='text-muted small'>
                      <FaHeart className='me-1 text-danger' /> {blog.likes || 0}
                      <FaShareAlt className='ms-3 me-1 text-primary' />{' '}
                      {blog.shares || 0}
                    </div>

                    <div>
                      <Button
                        variant='outline-info'
                        size='sm'
                        className='me-1'
                        onClick={() => handleOpenComments(blog.id)}
                      >
                        <FaComments />
                      </Button>

                      <Button
                        variant='outline-secondary'
                        size='sm'
                        className='me-1'
                        onClick={() => handleEdit(blog)}
                      >
                        <FaEdit />
                      </Button>

                      <Button
                        variant='outline-danger'
                        size='sm'
                        onClick={() => handleDeleteBlog(blog.id)}
                      >
                        <FaTrash />
                      </Button>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </div>
          ))}
        </div>
      )}

      {/* Comments Modal */}
      <Modal
        show={showCommentsModal}
        onHide={() => setShowCommentsModal(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>💬 Comments</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {commentsLoading ? (
            <div className='text-center p-3'>
              <Spinner animation='border' />
            </div>
          ) : comments.length === 0 ? (
            <p className='text-muted'>No comments yet for this blog.</p>
          ) : (
            <ListGroup>
              {comments.map(c => (
                <ListGroup.Item
                  key={c.id}
                  className='d-flex justify-content-between align-items-start'
                >
                  <div>
                    <strong>{c.name}</strong> <br />
                    <span className='text-muted small'>{c.email}</span>
                    <p className='mb-1 mt-2'>{c.comment}</p>
                    <span
                      className={`badge bg-${
                        c.status === 'approved' ? 'success' : 'warning'
                      } text-dark`}
                    >
                      {c.status}
                    </span>
                  </div>

                  <div className='d-flex flex-column ms-3'>
                    {c.status === 'pending' ? (
                      <Button
                        size='sm'
                        variant='success'
                        className='mb-2'
                        onClick={() => handleApprove(c.id)}
                      >
                        Approve
                      </Button>
                    ) : (
                      <Button
                        size='sm'
                        variant='warning'
                        className='mb-2'
                        onClick={() => handleRevoke(c.id)}
                      >
                        Revoke
                      </Button>
                    )}

                    <Button
                      size='sm'
                      variant='danger'
                      onClick={() => handleDeleteComment(c.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </Modal.Body>
      </Modal>
    </div>
  )
}

export default BlogsAdmin
