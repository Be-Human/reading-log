import { useState } from 'react';
import type { Book } from '../types/book';
import { generateId } from '../utils/localStorage';

interface BookFormProps {
  onAddBook: (book: Book) => void;
}

function BookForm({ onAddBook }: BookFormProps) {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [description, setDescription] = useState('');
  const [titleError, setTitleError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      setTitleError(true);
      return;
    }
    
    const newBook: Book = {
      id: generateId(),
      title: title.trim(),
      author: author.trim() || undefined,
      description: description.trim() || undefined,
      createdAt: Date.now()
    };
    
    onAddBook(newBook);
    
    setTitle('');
    setAuthor('');
    setDescription('');
    setTitleError(false);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    if (e.target.value.trim()) {
      setTitleError(false);
    }
  };

  return (
    <div className="book-form-container">
      <h2>添加新书</h2>
      <form onSubmit={handleSubmit} className="book-form">
        <div className="form-group">
          <label htmlFor="title">书名 <span className="required">*</span></label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={handleTitleChange}
            className={titleError ? 'error' : ''}
            placeholder="请输入书名"
          />
          {titleError && <span className="error-message">书名为必填项</span>}
        </div>
        
        <div className="form-group">
          <label htmlFor="author">作者</label>
          <input
            type="text"
            id="author"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="请输入作者（可选）"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="description">简介</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="请输入简介（可选）"
            rows={3}
          />
        </div>
        
        <button type="submit" className="add-button">
          添加书籍
        </button>
      </form>
    </div>
  );
}

export default BookForm;
