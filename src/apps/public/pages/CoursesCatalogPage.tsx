import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { coursesApi, Course } from '@/src/api/courses';
import Pagination from '@/components/ui/Pagination';

const levelGradients: Record<string, string> = {
  Beginner: 'from-blue-600 to-indigo-900',
  Intermediate: 'from-purple-600 to-violet-900',
  Advanced: 'from-rose-600 to-red-900',
};

const CoursesCatalogPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedLevel, setSelectedLevel] = useState<string>('');
  const [selectedSort, setSelectedSort] = useState('-created_at');
  const [maxPrice, setMaxPrice] = useState<number>(1000000);
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const pageSize = 9;
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, selectedLevel, selectedSort, maxPrice]);

  const fetchCourses = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await coursesApi.getCourses(
        currentPage,
        pageSize,
        selectedCategory || undefined,
        selectedLevel || undefined,
        searchQuery || undefined,
        selectedSort || undefined,
        undefined,
        true
      );
      setCourses(response.items);
      setTotalItems(response.count || 0);
      setTotalPages(Math.ceil((response.count || 0) / pageSize));

      const uniqueCategories = [...new Set(response.items.map(c => c.category).filter(Boolean))] as string[];
      if (uniqueCategories.length > 0) {
        setCategories(prev => {
          const merged = new Set([...prev, ...uniqueCategories]);
          return Array.from(merged).sort();
        });
      }
    } catch (error) {
      console.error('Failed to fetch courses:', error);
      setCourses([]);
      setTotalItems(0);
      setTotalPages(0);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, pageSize, selectedCategory, selectedLevel, searchQuery, selectedSort]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const toggleFilters = () => {
    setIsFilterOpen(prev => !prev);
    if (!isFilterOpen) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
  };

  useEffect(() => {
    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, []);

  const clearFilters = () => {
    setSelectedCategory('');
    setSelectedLevel('');
    setSelectedSort('-created_at');
    setMaxPrice(1000000);
    setSearchQuery('');
  };

  const formatCurrency = (amount: string | number) => {
    const value = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const levels = ['Beginner', 'Intermediate', 'Advanced'];
  const pricePercent = Math.min((maxPrice / 500000) * 100, 100);

  return (
    <div className="min-h-full flex flex-col antialiased" style={{ backgroundColor: '#f8fafc', color: '#475569' }}>
      <section className="bg-white border-b border-slate-200 pt-24 pb-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Platform Course Catalog</h1>
          <p className="mt-2 text-sm text-slate-500 max-w-2xl">
            Explore our curated catalog of blockchain-powered courses. Build real-world skills with project-based learning paths led by industry experts.
          </p>
          <div className="mt-6 max-w-lg">
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-300 focus-within:border-purple-500 focus-within:ring-1 focus-within:ring-purple-500 transition-all">
              <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search courses..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full text-sm text-slate-900 bg-transparent outline-none"
              />
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto w-full max-w-7xl flex-1 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row gap-8 relative">

          <div
            id="filter-overlay"
            className={`${isFilterOpen ? '' : 'hidden'} fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm md:hidden transition-opacity`}
            onClick={toggleFilters}
          />

          <aside
            id="filter-sidebar"
            className={`${isFilterOpen ? '' : 'hidden'} md:block fixed md:static inset-y-0 left-0 z-50 w-[280px] shrink-0 bg-white md:bg-transparent border-r border-slate-200 md:border-r-0 p-6 md:p-0 md:py-6 md:pr-6 overflow-y-auto max-md:shadow-xl transition-transform`}
            role="region"
            aria-labelledby="filter-heading"
          >
            <div className="flex items-center border-b border-slate-200 pb-3 mb-6">
              <h2 id="filter-heading" className="text-slate-900 text-base font-semibold uppercase tracking-wider">Filters</h2>
              <button
                type="button"
                onClick={clearFilters}
                className="text-xs text-red-500 font-semibold ml-auto cursor-pointer hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 rounded mr-2"
                aria-label="Clear all filters"
              >
                Clear all
              </button>
              <button
                type="button"
                className="md:hidden text-slate-400 hover:text-slate-600 focus:outline-none"
                onClick={toggleFilters}
                aria-label="Close Filter Menu"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <fieldset>
              <legend className="text-slate-900 text-sm font-semibold">Category</legend>
              <ul className="mt-4 space-y-2">
                <li>
                  <label className="inline-flex items-center gap-2.5 group cursor-pointer">
                    <input
                      type="radio"
                      name="category"
                      className="sr-only"
                      checked={selectedCategory === ''}
                      onChange={() => setSelectedCategory('')}
                    />
                    <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-slate-300 bg-white group-has-[input:checked]:border-purple-700 group-has-[input:checked]:border-[5px] transition-all" />
                    <span className="text-sm text-slate-700 font-medium group-hover:text-slate-900">All Categories</span>
                  </label>
                </li>
                {categories.length === 0 ? (
                  <p className="text-xs text-slate-400 pl-2">Loading categories...</p>
                ) : (
                  categories.map(cat => (
                    <li key={cat}>
                      <label className="inline-flex items-center gap-2.5 group cursor-pointer">
                        <input
                          type="radio"
                          name="category"
                          className="sr-only"
                          checked={selectedCategory === cat}
                          onChange={() => setSelectedCategory(cat)}
                        />
                        <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-slate-300 bg-white group-has-[input:checked]:border-purple-700 group-has-[input:checked]:border-[5px] transition-all" />
                        <span className="text-sm text-slate-700 font-medium group-hover:text-slate-900">{cat}</span>
                      </label>
                    </li>
                  ))
                )}
              </ul>
            </fieldset>

            <hr className="my-6 border-slate-200" />

            <fieldset>
              <legend className="text-slate-900 text-sm font-semibold">Level</legend>
              <div className="flex flex-wrap gap-2 mt-3">
                <button
                  type="button"
                  aria-pressed={selectedLevel === ''}
                  onClick={() => setSelectedLevel('')}
                  className={`rounded-md text-xs font-semibold py-1.5 px-3 border ${
                    selectedLevel === ''
                      ? 'border-purple-700 bg-purple-50 text-purple-800'
                      : 'border-slate-300 bg-white text-slate-700'
                  }`}
                >
                  All Levels
                </button>
                {levels.map(level => (
                  <button
                    key={level}
                    type="button"
                    aria-pressed={selectedLevel === level}
                    onClick={() => setSelectedLevel(level)}
                    className={`rounded-md text-xs font-semibold py-1.5 px-3 border ${
                      selectedLevel === level
                        ? 'border-purple-700 bg-purple-50 text-purple-800'
                        : 'border-slate-300 bg-white text-slate-700'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </fieldset>

            <hr className="my-6 border-slate-200" />

            <fieldset>
              <legend className="text-slate-900 text-sm font-semibold">Max Tuition</legend>
              <div className="relative mt-4">
                <div className="h-1.5 bg-slate-200 rounded relative">
                  <div className="absolute h-1.5 bg-purple-700 rounded-full left-0" style={{ width: `${pricePercent}%` }} />
                </div>
                <input
                  type="range"
                  min="0"
                  max="500000"
                  step="5000"
                  value={maxPrice}
                  onChange={e => setMaxPrice(parseInt(e.target.value))}
                  className="absolute top-[-4px] w-full h-1.5 bg-transparent appearance-none cursor-pointer focus:outline-none"
                />
                <div className="flex justify-between text-slate-600 font-semibold text-xs mt-4">
                  <span>Free</span>
                  <span className="text-purple-700 font-bold">{maxPrice >= 500000 ? 'Any Price' : formatCurrency(maxPrice)}</span>
                </div>
              </div>
            </fieldset>
          </aside>

          <main className="w-full py-6 flex-1" role="main" aria-label="Course results">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-6">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="md:hidden inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none"
                  onClick={toggleFilters}
                >
                  <svg className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  Filters
                </button>
                <p className="text-sm font-medium text-slate-500 max-sm:hidden">
                  Showing <span className="font-bold text-slate-900">{totalItems}</span> courses
                </p>
              </div>
              <div className="flex items-center gap-2">
                <label htmlFor="sort-dropdown" className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Sort</label>
                <select
                  id="sort-dropdown"
                  className="bg-transparent text-sm font-medium text-slate-700 outline-none cursor-pointer"
                  value={selectedSort}
                  onChange={e => setSelectedSort(e.target.value)}
                >
                  <option value="-created_at">Newest</option>
                  <option value="created_at">Oldest</option>
                  <option value="-total_amount">Price: High to Low</option>
                  <option value="total_amount">Price: Low to High</option>
                  <option value="-average_rating">Highest Rated</option>
                </select>
              </div>
            </div>

            {isLoading ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="animate-pulse rounded-xl border border-slate-200 bg-white">
                    <div className="aspect-video w-full rounded-t-xl bg-slate-100" />
                    <div className="p-4 space-y-3">
                      <div className="h-4 w-2/3 bg-slate-100 rounded" />
                      <div className="h-3 w-full bg-slate-100 rounded" />
                      <div className="flex justify-between pt-3 border-t border-slate-100">
                        <div className="h-3 w-20 bg-slate-100 rounded" />
                        <div className="h-4 w-12 bg-slate-100 rounded" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : courses.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">No courses found</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-xs">Adjust your filters or search to find the right course.</p>
                <button
                  onClick={clearFilters}
                  className="mt-6 text-xs font-bold text-purple-700 uppercase tracking-widest hover:underline"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {courses.map(course => (
                    <article
                      key={course.id}
                      className="group relative flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
                    >
                      <div className="aspect-video w-full overflow-hidden">
                        {course.thumbnail_url ? (
                          <img
                            src={course.thumbnail_url}
                            alt={course.title}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className={`h-full w-full bg-gradient-to-br ${levelGradients[course.level] || 'from-purple-600 to-indigo-900'} p-4 flex flex-col justify-between text-white`}>
                            <span className="self-start rounded bg-white/20 backdrop-blur px-2 py-0.5 text-xs font-semibold uppercase tracking-wider">
                              {course.level || 'General'}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-1 flex-col p-4">
                        <h3 className="text-base font-bold text-slate-900 group-hover:text-purple-700 transition">
                          <Link to={`/courses/${course.id}`}>
                            <span className="absolute inset-0" />
                            {course.title}
                          </Link>
                        </h3>
                        <p className="mt-1 text-xs text-slate-500 line-clamp-2">{course.description}</p>
                        {course.category && (
                          <span className="mt-2 self-start rounded-full bg-purple-50 px-2.5 py-0.5 text-[10px] font-semibold text-purple-700 uppercase tracking-wider">
                            {course.category}
                          </span>
                        )}
                        <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
                          <span className="text-xs font-medium text-slate-400">
                            {course.tutor?.full_name || 'Instructor'}
                          </span>
                          <span className="text-base font-bold text-slate-900">
                            {parseFloat(course.total_amount || '0') === 0 ? 'FREE' : formatCurrency(course.total_amount || '0')}
                          </span>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
                <div className="mt-12 py-8 border-t border-slate-100">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={totalItems}
                    pageSize={pageSize}
                    onPageChange={setCurrentPage}
                  />
                </div>
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default CoursesCatalogPage;
