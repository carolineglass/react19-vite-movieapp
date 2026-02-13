import { useState } from 'react'

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const [inputValue, setInputValue] = useState(currentPage.toString());

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  // Navigate to the typed page on blur, or revert to current page if invalid
  const handleInputBlur = () => {
    const page = parseInt(inputValue, 10);
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
    } else {
      setInputValue(currentPage.toString());
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleInputBlur();
    }
  };

  // Sync input value when currentPage changes externally (e.g. from the other pagination),
  // but skip if the user is currently typing in a number input to avoid overwriting their input
  if (parseInt(inputValue, 10) !== currentPage && document.activeElement?.type !== 'number') {
    setInputValue(currentPage.toString());
  }

  const buttonClass = "min-h-9.5 py-2 px-2.5 inline-flex justify-center items-center gap-x-1.5 text-sm rounded-lg text-white hover:bg-white/10 focus:outline-hidden focus:bg-white/10 disabled:opacity-50 disabled:pointer-events-none";

  return (
    <nav className="flex justify-center items-center gap-x-1" aria-label="Pagination">
      {/* First page */}
      <button
        type="button"
        className={buttonClass}
        aria-label="First page"
        disabled={currentPage === 1}
        onClick={() => onPageChange(1)}
      >
        <svg className="shrink-0 size-3.5" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m11 17-5-5 5-5"></path>
          <path d="m18 17-5-5 5-5"></path>
        </svg>
      </button>

      {/* Previous */}
      <button
        type="button"
        className={buttonClass}
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        <svg className="shrink-0 size-3.5" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m15 18-6-6 6-6"></path>
        </svg>
        <span>Previous</span>
      </button>

      {/* Page input */}
      <div className="flex items-center gap-x-2 px-2">
        <input
          type="number"
          min={1}
          max={totalPages}
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          onKeyDown={handleKeyDown}
          className="min-h-9.5 py-2 px-2 block w-14 rounded-lg text-sm text-center text-white bg-neutral-800 border border-neutral-700 focus:border-blue-500 focus:ring-blue-500 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
        <span className="text-sm text-white whitespace-nowrap">of {totalPages}</span>
      </div>

      {/* Next */}
      <button
        type="button"
        className={buttonClass}
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        <span>Next</span>
        <svg className="shrink-0 size-3.5" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m9 18 6-6-6-6"></path>
        </svg>
      </button>

      {/* Last page */}
      <button
        type="button"
        className={buttonClass}
        aria-label="Last page"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(totalPages)}
      >
        <svg className="shrink-0 size-3.5" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m6 17 5-5-5-5"></path>
          <path d="m13 17 5-5-5-5"></path>
        </svg>
      </button>
    </nav>
  )
}

export default Pagination