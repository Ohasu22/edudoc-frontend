import React from 'react';

function SearchAndFilter({ onSearch, onFilter, filters = [], activeFilters = [], searchTerm = '' }) {
  return (
    <div className="search-container">
      <div className="row align-items-center g-3">
        <div className="col-md-8">
          <div className="position-relative">
            <i className="fas fa-search position-absolute start-0 top-50 translate-middle-y ms-3 text-muted"></i>
            <input
              type="text"
              className="search-input ps-5"
              placeholder="Search files and folders..."
              value={searchTerm}
              onChange={(e) => onSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="col-md-4">
          <div className="d-flex flex-wrap gap-1">
            {filters.map((filter) => (
              <button
                key={filter.key}
                onClick={() => onFilter(filter.key)}
                className={`filter-chip ${activeFilters.includes(filter.key) ? 'active' : ''}`}
              >
                <i className={`${filter.icon} me-1`}></i>
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SearchAndFilter;
