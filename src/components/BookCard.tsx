import { useState, useRef, useEffect } from 'react';
import type { Book, ReadingStatus } from '../types/book';
import { READING_STATUS_LABELS } from '../types/book';

interface BookCardProps {
  book: Book;
  onDelete: (book: Book) => void;
  onUpdateStatus: (bookId: string, newStatus: ReadingStatus) => void;
}

const getStatusColor = (status: ReadingStatus): string => {
  switch (status) {
    case 'want':
      return 'status-want';
    case 'reading':
      return 'status-reading';
    case 'read':
      return 'status-read';
    default:
      return '';
  }
};

function BookCard({ book, onDelete, onUpdateStatus }: BookCardProps) {
  const [showStatusSelector, setShowStatusSelector] = useState(false);
  const statusContainerRef = useRef<HTMLDivElement>(null);

  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleStatusChange = (newStatus: ReadingStatus) => {
    onUpdateStatus(book.id, newStatus);
    setShowStatusSelector(false);
  };

  const handleStatusBadgeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowStatusSelector(!showStatusSelector);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        statusContainerRef.current && 
        !statusContainerRef.current.contains(event.target as Node)
      ) {
        setShowStatusSelector(false);
      }
    };

    if (showStatusSelector) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showStatusSelector]);

  return (
    <div className="book-card">
      <div className="book-card-header">
        <h3 className="book-title" title={book.title}>{book.title}</h3>
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
        <div className="status-container" ref={statusContainerRef}>
          <button
            className={`status-badge ${getStatusColor(book.status)}`}
            onClick={handleStatusBadgeClick}
            aria-label="切换阅读状态"
          >
            {READING_STATUS_LABELS[book.status]}
          </button>
          {showStatusSelector && (
            <div className="status-selector">
              {(['want', 'reading', 'read'] as ReadingStatus[]).map((status) => (
                <button
                  key={status}
                  className={`status-option ${book.status === status ? 'active' : ''}`}
                  onClick={() => handleStatusChange(status)}
                >
                  {READING_STATUS_LABELS[status]}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default BookCard;
