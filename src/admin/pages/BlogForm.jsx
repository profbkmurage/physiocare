import { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { Button, Form, Card, Alert, ButtonGroup } from 'react-bootstrap'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { TextStyle } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import { Underline } from '@tiptap/extension-underline'
import { TextAlign } from '@tiptap/extension-text-align'
import { Highlight } from '@tiptap/extension-highlight'
import { Link } from '@tiptap/extension-link'
import { Placeholder } from '@tiptap/extension-placeholder'
import Image from '@tiptap/extension-image'
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp
} from 'firebase/firestore'
import { db } from '../../utilities/firebase.js'

const colors = [
  '#000000',
  '#FF0000',
  '#008000',
  '#0000FF',
  '#FFA500',
  '#800080'
]

const BlogForm = ({ fetchBlogs, setShowForm, editBlog, setEditBlog }) => {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [mainImage, setMainImage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: { keepMarks: true, keepAttributes: false },
        orderedList: { keepMarks: true, keepAttributes: false }
      }),
      TextStyle,
      Color,
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Highlight,
      Link.configure({ openOnClick: true }),
      Placeholder.configure({ placeholder: 'Write your blog content here...' }),
      Image
    ],
    content: editBlog?.content || ''
  })

  useEffect(() => {
    if (editBlog) {
      setTitle(editBlog.title)
      setDescription(editBlog.description)
      setMainImage(editBlog.mainImage || '')
      editor?.commands.setContent(editBlog.content)
    }
  }, [editBlog, editor])

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    if (!title || !editor?.getHTML()) {
      setError('Title and content are required.')
      return
    }

    setLoading(true)
    try {
      const blogData = {
        title,
        description,
        mainImage,
        content: editor.getHTML(),
        createdAt: serverTimestamp(),
        likes: editBlog?.likes || 0,
        shares: editBlog?.shares || 0
      }

      if (editBlog) {
        await updateDoc(doc(db, 'blogs', editBlog.id), blogData)
      } else {
        await addDoc(collection(db, 'blogs'), blogData)
      }

      fetchBlogs()
      setShowForm(false)
      setEditBlog(null)
      setTitle('')
      setDescription('')
      setMainImage('')
      editor?.commands.clearContent()
    } catch (err) {
      console.error(err)
      setError('Failed to save blog. Try again.')
    } finally {
      setLoading(false)
    }
  }

  // Insert image into editor
  const insertImage = url => {
    if (!url) return
    editor.chain().focus().setImage({ src: url }).run()
  }

  return (
    <Card className='mb-4 shadow-sm'>
      <Card.Body>
        <h5>{editBlog ? 'Edit Blog' : 'Create New Blog'}</h5>
        {error && <Alert variant='danger'>{error}</Alert>}
        <Form onSubmit={handleSubmit}>
          <Form.Group className='mb-3'>
            <Form.Label>Title</Form.Label>
            <Form.Control
              type='text'
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder='Enter blog title'
              required
            />
          </Form.Group>
          <Form.Group className='mb-3'>
            <Form.Label>Short Description</Form.Label>
            <Form.Control
              type='text'
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder='Optional short description'
            />
          </Form.Group>
          <Form.Group className='mb-3'>
            <Form.Label>Main Image URL</Form.Label>
            <Form.Control
              type='text'
              value={mainImage}
              onChange={e => setMainImage(e.target.value)}
              placeholder='Enter main image URL'
            />
            {mainImage && (
              <div className='text-center my-2'>
                <img
                  src={mainImage}
                  alt='Main'
                  style={{ maxHeight: '200px' }}
                />
              </div>
            )}
          </Form.Group>
          {/* Toolbar */}
          <ButtonGroup className='mb-2 flex-wrap'>
            <Button
              type='button'
              variant='outline-secondary'
              size='sm'
              onClick={() => editor.chain().focus().toggleBold().run()}
              active={editor?.isActive('bold')}
            >
              B
            </Button>
            <Button
              type='button'
              variant='outline-secondary'
              size='sm'
              onClick={() => editor.chain().focus().toggleItalic().run()}
              active={editor?.isActive('italic')}
            >
              I
            </Button>
            <Button
              type='button'
              variant='outline-secondary'
              size='sm'
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              active={editor?.isActive('underline')}
            >
              U
            </Button>
            <Button
              type='button'
              variant='outline-secondary'
              size='sm'
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              active={editor?.isActive('bulletList')}
            >
              • List
            </Button>
            <Button
              type='button'
              variant='outline-secondary'
              size='sm'
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              active={editor?.isActive('orderedList')}
            >
              1. List
            </Button>
            <Button
              type='button'
              variant='outline-secondary'
              size='sm'
              onClick={() => editor.chain().focus().setTextAlign('left').run()}
            >
              Left
            </Button>
            <Button
              type='button'
              variant='outline-secondary'
              size='sm'
              onClick={() =>
                editor.chain().focus().setTextAlign('center').run()
              }
            >
              Center
            </Button>
            <Button
              type='button'
              variant='outline-secondary'
              size='sm'
              onClick={() => editor.chain().focus().setTextAlign('right').run()}
            >
              Right
            </Button>
            <Button
              type='button'
              variant='outline-secondary'
              size='sm'
              onClick={() =>
                editor.chain().focus().setTextAlign('justify').run()
              }
            >
              Justify
            </Button>

            {colors.map(color => (
              <Button
                key={color}
                type='button'
                size='sm'
                style={{ backgroundColor: color, color: '#fff' }}
                onClick={() => editor.chain().focus().setColor(color).run()}
              />
            ))}
          </ButtonGroup>
          {/* Add Image to Editor */}
          <Form.Group className='mb-3'>
            <Form.Label>Insert Supporting Image URL</Form.Label>
            <Form.Control
              type='text'
              placeholder='Enter supporting image URL'
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  insertImage(e.target.value)
                  e.target.value = ''
                }
              }}
            />
            <Form.Text>Press Enter to insert image into editor.</Form.Text>
          </Form.Group>
          <Form.Group className='mb-3'>
            <Form.Label>Content</Form.Label>
            <div className='border p-2 rounded' style={{ minHeight: '250px' }}>
              <EditorContent editor={editor} />
            </div>
          </Form.Group>
          <Button type='submit' disabled={loading}>
            {loading ? 'Saving...' : editBlog ? 'Update Blog' : 'Create Blog'}
          </Button>{' '}
          <Button variant='secondary' onClick={() => setShowForm(false)}>
            Cancel
          </Button>
        </Form>
      </Card.Body>
    </Card>
  )
}

BlogForm.propTypes = {
  fetchBlogs: PropTypes.func.isRequired,
  setShowForm: PropTypes.func.isRequired,
  editBlog: PropTypes.object,
  setEditBlog: PropTypes.func.isRequired
}

export default BlogForm
