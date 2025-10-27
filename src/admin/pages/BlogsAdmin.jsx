import { useEffect, useState } from 'react'
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore'
import { db } from '../../utilities/firebase.js'
import { Button, Card, Spinner } from 'react-bootstrap'
import { FaPlus, FaTrash, FaEdit, FaHeart, FaShareAlt } from 'react-icons/fa'
import BlogForm from './BlogForm'
import dayjs from 'dayjs'

const BlogsAdmin = () => {
  const [blogs, setBlogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editBlog, setEditBlog] = useState(null)

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

  const handleDelete = async id => {
    if (window.confirm('Are you sure you want to delete this blog?')) {
      await deleteDoc(doc(db, 'blogs', id))
      fetchBlogs()
    }
  }

  const handleEdit = blog => {
    setEditBlog(blog)
    setShowForm(true)
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
                  <div className='text-center'>
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
                  </div>
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
                        variant='outline-secondary'
                        size='sm'
                        onClick={() => handleEdit(blog)}
                        className='me-1'
                      >
                        <FaEdit />
                      </Button>
                      <Button
                        variant='outline-danger'
                        size='sm'
                        onClick={() => handleDelete(blog.id)}
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
    </div>
  )
}

export default BlogsAdmin
