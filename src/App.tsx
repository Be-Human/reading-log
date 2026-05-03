import { useState, useEffect, useMemo } from 'react';
import BookForm from './components/BookForm';
import BookCard from './components/BookCard';
import ConfirmDialog from './components/ConfirmDialog';
import EditBookDialog from './components/EditBookDialog';
import type { Book, ReadingStatus } from './types/book';
import { READING_STATUS_LABELS } from './types/book';
import { saveBooks, loadBooks } from './utils/localStorage';
import './App.css';

type FilterStatus = 'all' | ReadingStatus;
type SortBy = 'createdAt' | 'title' | 'progress';
type SortOrder = 'asc' | 'desc';

function App() {
  const [books, setBooks] = useState<Book[]>(() => {
    const savedBooks = loadBooks();
    return savedBooks.map(book => ({
      ...book,
      status: (book as any).status || 'want',
      currentPage: (book as any).currentPage || 0,
      rating: (book as any).rating,
      review: (book as any).review
    }));
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [bookToDelete, setBookToDelete] = useState<Book | null>(null);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [bookToEdit, setBookToEdit] = useState<Book | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortBy>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const handleEditClick = (book: Book) => {
    setBookToEdit(book);
    setEditDialogOpen(true);
  };

  const handleCancelEdit = () => {
    setEditDialogOpen(false);
    setBookToEdit(null);
  };

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

  const statistics = useMemo(() => {
    const totalBooks = books.length;
    
    let completedPages = 0;
    books.forEach(book => {
      if (book.status === 'read' && book.totalPages) {
        completedPages += book.totalPages;
      }
    });
    
    return {
      totalBooks,
      statusCounts,
      completedPages
    };
  }, [books, statusCounts]);

  const filteredBooks = useMemo(() => {
    let result = books;
    
    // 按状态筛选
    if (filterStatus !== 'all') {
      result = result.filter(book => book.status === filterStatus);
    }
    
    // 按搜索关键词筛选（书名或作者）
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(book => 
        book.title.toLowerCase().includes(query) || 
        (book.author && book.author.toLowerCase().includes(query))
      );
    }
    
    return result;
  }, [books, filterStatus, searchQuery]);

  const sortedBooks = useMemo(() => {
    const sorted = [...filteredBooks];
    
    const getProgress = (book: Book): number => {
      if (!book.totalPages || book.totalPages === 0) return 0;
      return ((book.currentPage || 0) / book.totalPages) * 100;
    };
    
    sorted.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'createdAt':
          comparison = a.createdAt - b.createdAt;
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title, 'zh-CN');
          break;
        case 'progress':
          comparison = getProgress(a) - getProgress(b);
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    
    return sorted;
  }, [filteredBooks, sortBy, sortOrder]);

  const handleAddBook = (newBook: Book) => {
    setBooks((prevBooks) => [newBook, ...prevBooks]);
  };

  const handleUpdateStatus = (bookId: string, newStatus: ReadingStatus) => {
    setBooks((prevBooks) => 
      prevBooks.map(book => {
        if (book.id === bookId) {
          const updatedBook: Book = { ...book, status: newStatus };
          // 当状态切换为「已读」时，自动将当前页同步为总页数
          if (newStatus === 'read' && book.totalPages) {
            updatedBook.currentPage = book.totalPages;
          }
          return updatedBook;
        }
        return book;
      })
    );
  };

  const handleUpdateCurrentPage = (bookId: string, currentPage: number) => {
    setBooks((prevBooks) => 
      prevBooks.map(book => 
        book.id === bookId 
          ? { ...book, currentPage }
          : book
      )
    );
  };

  const handleEditBook = (updatedBook: Book) => {
    setBooks((prevBooks) => 
      prevBooks.map(book => 
        book.id === updatedBook.id 
          ? updatedBook
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
        <div className="statistics-section">
          <div className="stat-card">
            <div className="stat-value">{statistics.totalBooks}</div>
            <div className="stat-label">总书数</div>
          </div>
          <div className="stat-card">
            <div className="stat-value want">{statistics.statusCounts.want}</div>
            <div className="stat-label">想读</div>
          </div>
          <div className="stat-card">
            <div className="stat-value reading">{statistics.statusCounts.reading}</div>
            <div className="stat-label">在读</div>
          </div>
          <div className="stat-card">
            <div className="stat-value read">{statistics.statusCounts.read}</div>
            <div className="stat-label">已读</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{statistics.completedPages}</div>
            <div className="stat-label">已完成页数</div>
          </div>
        </div>

        <div className="content-grid">
          <aside className="form-section">
            <BookForm onAddBook={handleAddBook} />
          </aside>

          <section className="books-section">
            <div className="section-header">
              <h2>我的书单</h2>
              <span className="book-count">{filteredBooks.length} 本书</span>
            </div>
            
            <div className="search-sort-container">
              <div className="search-input-wrapper">
                <input
                  type="text"
                  className="search-input"
                  placeholder="搜索书名或作者..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button 
                    className="clear-search"
                    onClick={() => setSearchQuery('')}
                    aria-label="清除搜索"
                  >
                    ×
                  </button>
                )}
              </div>
              
              <div className="sort-controls">
                <select
                  className="sort-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortBy)}
                >
                  <option value="createdAt">按添加时间</option>
                  <option value="title">按书名字母</option>
                  <option value="progress">按阅读进度</option>
                </select>
                <button
                  className="sort-order-button"
                  onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                  aria-label={sortOrder === 'asc' ? '升序' : '降序'}
                >
                  {sortOrder === 'asc' ? '↑' : '↓'}
                </button>
              </div>
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
                ) : searchQuery.trim() ? (
                  <>
                    <p>搜索无结果</p>
                    <p className="empty-hint">没有找到包含「{searchQuery.trim()}」的书籍，请尝试其他关键词</p>
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
                    onUpdateCurrentPage={handleUpdateCurrentPage}
                    onEdit={handleEditClick}
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

      <EditBookDialog
        isOpen={editDialogOpen}
        book={bookToEdit}
        onSave={handleEditBook}
        onCancel={handleCancelEdit}
      />
    </div>
  );
}

export default App;
