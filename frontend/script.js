const API = "http://localhost:3000/api";

// Store dashboard blogs
let dashboardBlogsData = [];


// ===============================
// REGISTER
// ===============================

const registerForm = document.getElementById("registerForm");

if (registerForm) {
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("registerName").value;
    const email = document.getElementById("registerEmail").value;
    const password = document.getElementById("registerPassword").value;

    try {
      const response = await fetch(`${API}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ name, email, password })
      });

      const data = await response.json();

      alert(data.message);

      if (response.ok) {
        window.location.href = "login.html";
      }

    } catch (error) {
      alert("Cannot connect to backend server");
    }
  });
}


// ===============================
// LOGIN
// ===============================

const loginForm = document.getElementById("loginForm");

if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    try {
      const response = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        sessionStorage.setItem("token", data.token);
        window.location.href = "dashboard.html";
      } else {
        alert(data.message);
      }

    } catch (error) {
      alert("Cannot connect to backend server");
    }
  });
}


// ===============================
// CREATE BLOG
// ===============================

const blogForm = document.getElementById("blogForm");

if (blogForm) {
  blogForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const title = document.getElementById("blogTitle").value.trim();
    const content = document.getElementById("blogContent").value.trim();

    const categoryElement = document.getElementById("blogCategory");
    const category = categoryElement ? categoryElement.value : "Others";

    const token = sessionStorage.getItem("token");

    if (!token) {
      window.location.href = "login.html";
      return;
    }

    try {
      const response = await fetch(`${API}/blogs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ title, content, category })
      });

      const data = await response.json();

      alert(data.message);

      if (response.ok) {
        window.location.href = "dashboard.html";
      }

    } catch (error) {
      alert("Cannot connect to backend server");
    }
  });
}


// ===============================
// RENDER BLOGS
// ===============================

function renderBlogs(container, blogs, showDelete = false, token = null) {

  if (!container) return;

  container.replaceChildren();

  if (blogs.length === 0) {
    container.textContent = "No blogs found";
    return;
  }

  blogs.forEach((blog) => {

    const card = document.createElement("div");
    card.className = "blog-card";

    // Blog Title
    const heading = document.createElement("h3");
    heading.textContent = blog.title;

    // Blog Category
    const category = document.createElement("p");
    category.className = "blog-category";
    category.textContent = "Category: " + (blog.category || "Others");

    // Blog Content
    const paragraph = document.createElement("p");

    paragraph.textContent =
      blog.content.length > 150
        ? blog.content.substring(0, 150) + "..."
        : blog.content;

    card.append(heading, category, paragraph);


    // READ MORE BUTTON

    const readMore = document.createElement("a");

    readMore.textContent = "Read More";
    readMore.href = `blog-details.html?id=${encodeURIComponent(blog._id)}`;
    readMore.className = "btn";

    card.appendChild(readMore);


    // EDIT BUTTON

    if (showDelete) {

      const editButton = document.createElement("button");

      editButton.textContent = "Edit";
      editButton.className = "edit-btn";

      editButton.addEventListener("click", () => {

        window.location.href =
          `edit-blog.html?id=${encodeURIComponent(blog._id)}`;

      });

      card.appendChild(editButton);
    }


    // DELETE BUTTON

    if (showDelete) {

      const button = document.createElement("button");

      button.textContent = "Delete";
      button.className = "delete-btn";

      button.addEventListener("click", async () => {

        const confirmDelete = confirm(
          "Are you sure you want to delete this blog?"
        );

        if (!confirmDelete) return;

        try {

          const deleteResponse = await fetch(
            `${API}/blogs/${encodeURIComponent(blog._id)}`,
            {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${token}`
              }
            }
          );

          const data = await deleteResponse.json();

          if (deleteResponse.ok) {

            alert(data.message);

            await displayBlogs("dashboardBlogs", "/blogs/my", true);

          } else {

            alert(data.message || "Unable to delete blog");

          }

        } catch (error) {

          alert("Cannot connect to backend server");

        }

      });

      card.appendChild(button);
    }

    container.appendChild(card);

  });

}


// ===============================
// DISPLAY BLOGS
// ===============================

async function displayBlogs(elementId, endpoint, showDelete = false) {

  const container = document.getElementById(elementId);

  if (!container) return;

  const token = sessionStorage.getItem("token");

  if (showDelete && !token) {
    window.location.href = "login.html";
    return;
  }

  try {

    const response = await fetch(`${API}${endpoint}`, {
      headers: token
        ? { Authorization: `Bearer ${token}` }
        : {}
    });

    if (!response.ok) {

      if (response.status === 401 && showDelete) {
        sessionStorage.removeItem("token");
        window.location.href = "login.html";
        return;
      }

      throw new Error("Unable to load blogs");
    }

    const blogs = await response.json();

    if (elementId === "dashboardBlogs") {
      dashboardBlogsData = blogs;
    }

    renderBlogs(container, blogs, showDelete, token);

  } catch (error) {

    container.textContent = "Failed to load blogs";

    console.error(error);

  }

}


// ===============================
// SEARCH + CATEGORY FILTER
// ===============================

const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");

function filterBlogs() {

  const searchTerm = searchInput
    ? searchInput.value.toLowerCase().trim()
    : "";

  const selectedCategory = categoryFilter
    ? categoryFilter.value
    : "All";

  const filteredBlogs = dashboardBlogsData.filter((blog) => {

    const matchesSearch = (blog.title || "")
      .toLowerCase()
      .includes(searchTerm);

    const matchesCategory =
      selectedCategory === "All" ||
      (blog.category || "Others") === selectedCategory;

    return matchesSearch && matchesCategory;

  });

  const container = document.getElementById("dashboardBlogs");

  renderBlogs(
    container,
    filteredBlogs,
    true,
    sessionStorage.getItem("token")
  );

}


// Search Event

if (searchInput) {
  searchInput.addEventListener("input", filterBlogs);
}


// Category Filter Event

if (categoryFilter) {
  categoryFilter.addEventListener("change", filterBlogs);
}


// ===============================
// HOME PAGE
// ===============================

displayBlogs("blogList", "/blogs");


// ===============================
// DASHBOARD
// ===============================

displayBlogs("dashboardBlogs", "/blogs/my", true);


// ===============================
// INDIVIDUAL BLOG DETAILS
// ===============================

async function loadBlogDetails() {

  const container = document.getElementById("blogDetails");

  if (!container) return;

  const params = new URLSearchParams(window.location.search);

  const blogId = params.get("id");

  if (!blogId) {
    container.textContent = "Blog ID not found";
    return;
  }

  try {

    const response = await fetch(
      `${API}/blogs/${encodeURIComponent(blogId)}`
    );

    const blog = await response.json();

    if (!response.ok) {
      throw new Error(blog.message || "Blog not found");
    }

    container.replaceChildren();

    const title = document.createElement("h2");
    title.textContent = blog.title;

    const category = document.createElement("p");
    category.textContent = "Category: " + (blog.category || "Others");

    const content = document.createElement("p");
    content.textContent = blog.content;

    const author = document.createElement("p");
    author.textContent =
      "Author: " + (blog.author?.name || "Unknown");

    const date = document.createElement("p");
    date.textContent =
      "Published: " +
      new Date(blog.createdAt).toLocaleDateString();

    container.append(title, category, content, author, date);

  } catch (error) {

    container.textContent = error.message;

    console.error(error);

  }

}

loadBlogDetails();


// ===============================
// EDIT BLOG - LOAD EXISTING DATA
// ===============================

const editBlogForm = document.getElementById("editBlogForm");

if (editBlogForm) {

  const token = sessionStorage.getItem("token");

  const params = new URLSearchParams(window.location.search);
  const blogId = params.get("id");

  const editTitle = document.getElementById("editTitle");
  const editContent = document.getElementById("editContent");
  const editCategory = document.getElementById("editCategory");

  if (!token) {

    alert("Please login first");
    window.location.href = "login.html";

  } else if (!blogId) {

    alert("Blog ID not found");
    window.location.href = "dashboard.html";

  } else {

    // LOAD EXISTING BLOG

    async function loadBlog() {

      try {

        const response = await fetch(
          `${API}/blogs/${encodeURIComponent(blogId)}`
        );

        const data = await response.json();

        if (!response.ok) {
          alert(data.message || "Unable to load blog");
          window.location.href = "dashboard.html";
          return;
        }

        const blog = data.blog || data;

        editTitle.value = blog.title || "";
        editContent.value = blog.content || "";

        if (editCategory) {
          editCategory.value = blog.category || "Others";
        }

      } catch (error) {

        console.error("Load Blog Error:", error);
        alert("Cannot connect to backend server");

      }

    }

    loadBlog();


    // UPDATE BLOG

    editBlogForm.addEventListener("submit", async (e) => {

      e.preventDefault();

      const title = editTitle.value.trim();
      const content = editContent.value.trim();

      const category = editCategory
        ? editCategory.value
        : "Others";

      if (!title || !content) {
        alert("Please enter title and content");
        return;
      }

      try {

        const response = await fetch(
          `${API}/blogs/${encodeURIComponent(blogId)}`,
          {
            method: "PUT",

            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`
            },

            body: JSON.stringify({
              title,
              content,
              category
            })
          }
        );

        const data = await response.json();

        if (response.ok) {

          alert(data.message || "Blog updated successfully!");

          window.location.href = "dashboard.html";

        } else {

          alert(data.message || "Blog update failed");

        }

      } catch (error) {

        console.error("Update Blog Error:", error);
        alert("Cannot connect to backend server");

      }

    });

  }

}


// ===============================
// LOGOUT
// ===============================

const logoutButton = document.getElementById("logoutButton");

if (logoutButton) {

  logoutButton.addEventListener("click", (e) => {

    e.preventDefault();

    sessionStorage.removeItem("token");

    window.location.href = "login.html";

  });

}
