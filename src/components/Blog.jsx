import { useEffect, useState } from 'react'
import { Container, Row, Col, Card, Button, Badge } from 'react-bootstrap'
import { collection, getDocs, query, orderBy } from 'firebase/firestore'
import { db } from '../utilities/firebase'
import { useNavigate } from 'react-router-dom'
import Footer from '../components/Footer'
import DOMPurify from 'dompurify'
import dayjs from 'dayjs'
import './blogs.css'

export default function Blog () {
  const [blogs, setBlogs] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const q = query(collection(db, 'blogs'), orderBy('createdAt', 'desc'))
        const snaps = await getDocs(q)
        const list = snaps.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        setBlogs(list)
      } catch (err) {
        console.error('Error fetching blogs:', err)
      }
    }
    fetchBlogs()
  }, [])

  const getPreview = blog => {
    if (!blog.content) return ''
    const text = blog.content.replace(/<[^>]*>/g, '')
    const words = text.split(' ')
    const preview = words.slice(0, 40).join(' ')
    return words.length > 40 ? preview + '...' : preview
  }

  return (
    <>
      <Container className='my-5'>
        <h2 className='text-center mb-4 fw-bold'>Our Blog</h2>
        <Row className='g-4'>
          {blogs.map(blog => (
            <Col key={blog.id} xs={12} sm={6} lg={4}>
              <Card className='shadow-sm border-0 blog-card'>
                {blog.mainImage && (
                  <div className='blog-img-wrapper'>
                    <img
                      src={blog.mainImage}
                      alt={blog.title}
                      className='blog-img'
                      onError={e => (e.target.style.display = 'none')}
                    />
                  </div>
                )}

                <Card.Body>
                  <Card.Title className='fw-bold'>{blog.title}</Card.Title>

                  {blog.createdAt && (
                    <Badge bg='primary' pill className='mb-2'>
                      {dayjs(blog.createdAt.toDate()).format('DD MMM YYYY')}
                    </Badge>
                  )}

                  <Card.Text
                    dangerouslySetInnerHTML={{
                      __html: DOMPurify.sanitize(getPreview(blog))
                    }}
                  />

                  <div className='text-center mt-3'>
                    <Button
                      variant='primary'
                      onClick={() => navigate(`/blog/${blog.id}`)}
                    >
                      Read More
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>

      <Footer />
    </>
  )
}
