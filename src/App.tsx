import { useState, useEffect, useMemo } from 'react';
import BookForm from './components/BookForm';
import BookCard from './components/BookCard';
import ConfirmDialog from './components/ConfirmDialog';
import type { Book, ReadingStatus } from './types/book';
import { READING_STATUS_LABELS } from './types/book';
import { saveBooks, loadBooks } from './utils/localStorage';
import './App.css';

type FilterStatus = 'all' | ReadingStatus;

function App() {
  const [books, setBooks] = useState<Book[]>(() => {
    const savedBooks = loadBooks();
    return savedBooks.map(book => ({
      ...book,
      status: (book as any).status || 'want'
    }));
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [bookToDelete, setBookToDelete] = useState<Book | null>(null);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');

  useEffect(() => {
    saveBooks(books);
  }, [books]);

  const statusCounts = useMemo(() => {
    const counts: Record<ReadingStatus, number> = {
      want: 0,
      reading: 0,
      read: 0
    };
    
    books.forEach(book => {
      counts[book.status]++;
    });
    
    return counts;
  }, [books]);

  const filteredBooks = useMemo(() => {
    if (filterStatus === 'all') {
      return books;
    }
    return books.filter(book => book.status === filterStatus);
  }, [books, filterStatus]);

  const handleAddBook = (newBook: Book) => {
    setBooks((prevBooks) => [newBook, ...prevBooks]);
  };

  const handleUpdateStatus = (bookId: string, newStatus: ReadingStatus) => {
    setBooks((prevBooks) => 
      prevBooks.map(book => 
        book.id === bookId 
          ? { ...book, status: newStatus }
          : book
      )
    );
  };

  const handleDeleteClick = (book: Book) => {
    setBookToDelete(book);
    setDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (bookToDelete) {
      setBooks((prevBooks) => prevBooks.filter((book) => book.id !== bookToDelete.id));
      setDialogOpen(false);
      setBookToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setDialogOpen(false);
    setBookToDelete(null);
  };

  const sortedBooks = [...filteredBooks].sort((a, b) => b.createdAt - a.createdAt);

  const getFilterButtonClass = (status: FilterStatus) => {
    let baseClass = 'filter-button';
    if (filterStatus === status) {
      baseClass += ' active';
    }
    if (status !== 'all') {
      baseClass += ` filter-${status}`;
    }
    return baseClass;
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>阅读记录</h1>
        <p className="header-subtitle">记录你读过的每一本书</p>
      </header>

      <main className="main-content">
        <div className="content-grid">
          <aside className="form-section">
            <BookForm onAddBook={handleAddBook} />
          </aside>

          <section className="books-section">
            <div className="section-header">
              <h2>我的书单</h2>
              <span className="book-count">{filteredBooks.length} 本书</span>
            </div>
            
            <div className="filter-container">
              <button
                className={getFilterButtonClass('all')}
                onClick={() => setFilterStatus('all')}
              >
                全部 ({books.length})
              </button>
              <button
                className={getFilterButtonClass('want')}
                onClick={() => setFilterStatus('want')}
              >
                {READING_STATUS_LABELS.want} ({statusCounts.want})
              </button>
              <button
                className={getFilterButtonClass('reading')}
                onClick={() => setFilterStatus('reading')}
              >
                {READING_STATUS_LABELS.reading} ({statusCounts.reading})
              </button>
              <button
                className={getFilterButtonClass('read')}
                onClick={() => setFilterStatus('read')}
              >
                {READING_STATUS_LABELS.read} ({statusCounts.read})
              </button>
            </div>

            {sortedBooks.length === 0 ? (
              <div className="empty-state">
                {books.length === 0 ? (
                  <>
                    <p>还没有添加任何书籍</p>
                    <p className="empty-hint">在左侧表单中添加你的第一本书吧！</p>
                  </>
                ) : (
                  <>
                    <p>该状态下暂无书籍</p>
                    <p className="empty-hint">当前筛选的「{filterStatus !== 'all' ? READING_STATUS_LABELS[filterStatus] : '全部'}」状态下没有书籍</p>
                  </>
                )}
              </div>
            ) : (
              <div className="books-grid">
                {sortedBooks.map((book) => (
                  <BookCard 
                    key={book.id} 
                    book={book} 
                    onDelete={handleDeleteClick}
                    onUpdateStatus={handleUpdateStatus}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      <ConfirmDialog
        isOpen={dialogOpen}
        title="确认删除"
        message={
          bookToDelete
            ? `确定要删除《${bookToDelete.title}》吗？此操作无法撤销。`
            : '确定要删除这本书吗？此操作无法撤销。'
        }
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </div>
  );
}

export default App;
