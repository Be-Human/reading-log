import { useState, useEffect } from 'react';
import type { Book, Rating } from '../types/book';

interface EditBookDialogProps {
  isOpen: boolean;
  book: Book | null;
  onSave: (book: Book) => void;
  onCancel: () => void;
}

function EditBookDialog({ isOpen, book, onSave, onCancel }: EditBookDialogProps) {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [description, setDescription] = useState('');
  const [totalPages, setTotalPages] = useState('');
  const [rating, setRating] = useState<Rating | undefined>(undefined);
  const [review, setReview] = useState('');
  const [titleError, setTitleError] = useState(false);

  useEffect(() => {
    if (book) {
      setTitle(book.title);
      setAuthor(book.author || '');
      setDescription(book.description || '');
      setTotalPages(book.totalPages?.toString() || '');
      setRating(book.rating);
      setReview(book.review || '');
      setTitleError(false);
    }
  }, [book]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        onCancel();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      setTitleError(true);
      return;
    }
    
    if (book) {
      const parsedTotalPages = totalPages ? parseInt(totalPages, 10) : undefined;
      
      const updatedBook: Book = {
        ...book,
        title: title.trim(),
        author: author.trim() || undefined,
        description: description.trim() || undefined,
        totalPages: parsedTotalPages,
        currentPage: parsedTotalPages && book.status === 'read' ? parsedTotalPages : book.currentPage,
        rating: book.status === 'read' ? rating : undefined,
        review: book.status === 'read' ? (review.trim() || undefined) : undefined
      };
      
      onSave(updatedBook);
      onCancel();
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    if (e.target.value.trim()) {
      setTitleError(false);
    }
  };

  if (!isOpen || !book) return null;

  return (
    <div className="dialog-overlay" onClick={onCancel}>
      <div className="dialog-container" onClick={(e) => e.stopPropagation()}>
        <div className="dialog-header">
          <h3 className="dialog-title">编辑书籍</h3>
          <button className="dialog-close" onClick={onCancel}>
            ×
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="dialog-body">
            <div className="form-group">
              <label htmlFor="edit-title">书名 <span className="required">*</span></label>
              <input
                type="text"
                id="edit-title"
                value={title}
                onChange={handleTitleChange}
                className={titleError ? 'error' : ''}
                placeholder="请输入书名"
              />
              {titleError && <span className="error-message">书名为必填项</span>}
            </div>
            
            <div className="form-group">
              <label htmlFor="edit-author">作者</label>
              <input
                type="text"
                id="edit-author"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="请输入作者（可选）"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="edit-description">简介</label>
              <textarea
                id="edit-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="请输入简介（可选）"
                rows={3}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="edit-totalPages">总页数</label>
              <input
                type="number"
                id="edit-totalPages"
                value={totalPages}
                onChange={(e) => setTotalPages(e.target.value)}
                placeholder="请输入总页数（可选）"
                min="1"
              />
            </div>
            
            {book.status === 'read' && (
              <>
                <div className="form-group">
                  <label>评分（1-5星）</label>
                  <div className="rating-selector">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        className={`rating-star ${rating && rating >= star ? 'selected' : ''}`}
                        onClick={() => setRating(star as Rating)}
                        aria-label={`${star}星`}
                      >
                        ★
                      </button>
                    ))}
                    {rating && (
                      <button
                        type="button"
                        className="clear-rating"
                        onClick={() => setRating(undefined)}
                        aria-label="清除评分"
                      >
                        清除
                      </button>
                    )}
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="edit-review">读后感</label>
                  <textarea
                    id="edit-review"
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                    placeholder="请输入读后感（可选）"
                    rows={4}
                  />
                </div>
              </>
            )}
          </div>
          
          <div className="dialog-footer">
            <button type="button" className="dialog-button cancel" onClick={onCancel}>
              取消
            </button>
            <button type="submit" className="dialog-button confirm">
              保存
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditBookDialog;
