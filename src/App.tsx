import { useState, useEffect } from 'react';
import BookForm from './components/BookForm';
import BookCard from './components/BookCard';
import ConfirmDialog from './components/ConfirmDialog';
import type { Book } from './types/book';
import { saveBooks, loadBooks } from './utils/localStorage';
import './App.css';

function App() {
  const [books, setBooks] = useState<Book[]>(() => loadBooks());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [bookToDelete, setBookToDelete] = useState<Book | null>(null);

  useEffect(() => {
    saveBooks(books);
  }, [books]);

  const handleAddBook = (newBook: Book) => {
    setBooks((prevBooks) => [newBook, ...prevBooks]);
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

  const sortedBooks = [...books].sort((a, b) => b.createdAt - a.createdAt);

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
              <span className="book-count">{books.length} 本书</span>
            </div>

            {sortedBooks.length === 0 ? (
              <div className="empty-state">
                <p>还没有添加任何书籍</p>
                <p className="empty-hint">在左侧表单中添加你的第一本书吧！</p>
              </div>
            ) : (
              <div className="books-grid">
                {sortedBooks.map((book) => (
                  <BookCard key={book.id} book={book} onDelete={handleDeleteClick} />
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
