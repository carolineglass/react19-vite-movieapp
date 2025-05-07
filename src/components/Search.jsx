import React from 'react'

const Search = ({searchTerm, setSearchTerm}) => {

    return (
        <div className='search'>
        <div>
            <img 
                src="search.svg" 
                alt="Search"
                className='cursor-pointer'
            />
            <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search through thousands of movies"
                className="p-2 pl-9 rounded-md border border-gray-300"/>
        </div>
        
        </div>  
    )
}

export default Search