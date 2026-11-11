import React, { useState } from "react";

function Search({ blogs, setFilteredBlogs }) {
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    const filtered = blogs.filter((blog) =>
      blog.title.toLowerCase().includes(value.toLowerCase())
    );

    setFilteredBlogs(filtered);
  };

  return (
    <input
      type="text"
      placeholder="Search blogs..."
      value={searchTerm}
      onChange={handleSearch}
      className="search-input"
    />
  );
}

export default Search;