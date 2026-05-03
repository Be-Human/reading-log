import type { Book } from '../types/book';

interface BookCardProps {
  book: Book;
  onDelete: (book: Book) => void;
}

function BookCard({ book, onDelete }: BookCardProps) {
  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="book-card">
      <div className="book-card-header">
        <h3 className="book-title">{book.title}</h3>
        <button 
          className="delete-button"
          onClick={() => onDelete(book)}
          aria-label="删除书籍"
        >
          ×
        </button>
      </div>
      
      {book.author && (
        <p className="book-author">作者：{book.author}</p>
      )}
      
      {book.description && (
        <p className="book-description">{book.description}</p>
      )}
      
      <div className="book-card-footer">
        <span className="create-date">
          添加时间：{formatDate(book.createdAt)}
        </span>
      </div>
    </div>
  );
}

export default BookCard;
