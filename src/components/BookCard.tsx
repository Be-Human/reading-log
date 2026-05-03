import { useState, useRef, useEffect } from 'react';
import type { Book, ReadingStatus } from '../types/book';
import { READING_STATUS_LABELS } from '../types/book';

interface BookCardProps {
  book: Book;
  onDelete: (book: Book) => void;
  onUpdateStatus: (bookId: string, newStatus: ReadingStatus) => void;
  onUpdateCurrentPage: (bookId: string, currentPage: number) => void;
  onEdit: (book: Book) => void;
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

function BookCard({ book, onDelete, onUpdateStatus, onUpdateCurrentPage, onEdit }: BookCardProps) {
  const [showStatusSelector, setShowStatusSelector] = useState(false);
  const [isEditingPage, setIsEditingPage] = useState(false);
  const [tempCurrentPage, setTempCurrentPage] = useState('');
  const statusContainerRef = useRef<HTMLDivElement>(null);
  const pageInputRef = useRef<HTMLInputElement>(null);

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

  const handleStartEditPage = () => {
    setTempCurrentPage(book.currentPage?.toString() || '0');
    setIsEditingPage(true);
  };

  const handleSavePage = () => {
    const page = parseInt(tempCurrentPage, 10);
    if (!isNaN(page) && page >= 0) {
      const finalPage = book.totalPages ? Math.min(page, book.totalPages) : page;
      onUpdateCurrentPage(book.id, finalPage);
    }
    setIsEditingPage(false);
  };

  const handlePageKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSavePage();
    } else if (e.key === 'Escape') {
      setIsEditingPage(false);
    }
  };

  useEffect(() => {
    if (isEditingPage && pageInputRef.current) {
      pageInputRef.current.focus();
      pageInputRef.current.select();
    }
  }, [isEditingPage]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        statusContainerRef.current && 
        !statusContainerRef.current.contains(event.target as Node)
      ) {
        setShowStatusSelector(false);
      }
      if (
        isEditingPage &&
        pageInputRef.current && 
        !pageInputRef.current.contains(event.target as Node)
      ) {
        handleSavePage();
      }
    };

    if (showStatusSelector || isEditingPage) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showStatusSelector, isEditingPage, tempCurrentPage]);

  const progressPercentage = book.totalPages && book.totalPages > 0 
    ? Math.min(100, Math.max(0, ((book.currentPage || 0) / book.totalPages) * 100))
    : 0;

  return (
    <div className="book-card">
      <div className="book-card-header">
        <h3 className="book-title" title={book.title}>{book.title}</h3>
        <div className="card-actions">
          <button 
            className="edit-button"
            onClick={() => onEdit(book)}
            aria-label="编辑书籍"
          >
            ✎
          </button>
          <button 
            className="delete-button"
            onClick={() => onDelete(book)}
            aria-label="删除书籍"
          >
            ×
          </button>
        </div>
      </div>
      
      {book.author && (
        <p className="book-author">作者：{book.author}</p>
      )}
      
      {book.description && (
        <p className="book-description">{book.description}</p>
      )}
      
      {book.totalPages && book.totalPages > 0 && (
        <div className="progress-section">
          <div className="progress-bar-container">
            <div 
              className="progress-bar" 
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <div className="page-info">
            {isEditingPage ? (
              <span className="page-edit">
                <input
                  ref={pageInputRef}
                  type="number"
                  className="page-input"
                  value={tempCurrentPage}
                  onChange={(e) => setTempCurrentPage(e.target.value)}
                  onBlur={handleSavePage}
                  onKeyDown={handlePageKeyDown}
                  min="0"
                  max={book.totalPages}
                />
                <span className="page-separator">/</span>
                <span className="total-pages">{book.totalPages}</span>
              </span>
            ) : (
              <span className="page-display" onClick={handleStartEditPage}>
                <span className="current-page">{book.currentPage || 0}</span>
                <span className="page-separator">/</span>
                <span className="total-pages">{book.totalPages}</span>
                <span className="page-edit-hint">点击修改</span>
              </span>
            )}
          </div>
        </div>
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
