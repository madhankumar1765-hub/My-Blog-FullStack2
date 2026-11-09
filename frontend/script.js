const API = "http://localhost:3000/api";

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

    const title = document.getElementById("blogTitle").value;
    const content = document.getElementById("blogContent").value;

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
        body: JSON.stringify({ title, content })
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

    container.replaceChildren();

    if (blogs.length === 0) {
      container.textContent = "No blogs available";
      return;
    }

    blogs.forEach((blog) => {

      const card = document.createElement("div");
      card.className = "blog-card";

      // Blog Title
      const heading = document.createElement("h3");
      heading.textContent = blog.title;

      // Blog Content
      const paragraph = document.createElement("p");

      paragraph.textContent =
        blog.content.length > 150
          ? blog.content.substring(0, 150) + "..."
          : blog.content;

      card.append(heading, paragraph);


      // READ MORE BUTTON
      const readMore = document.createElement("a");

      readMore.textContent = "Read More";

      readMore.href = `blog-details.html?id=${encodeURIComponent(blog._id)}`;

      readMore.className = "btn";

      card.appendChild(readMore);


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
              `${API}/blogs/${blog._id}`,
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

              displayBlogs("dashboardBlogs", "/blogs/my", true);

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

  } catch (error) {

    container.textContent = "Failed to load blogs";

    console.error(error);

  }

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

    // Blog Title
    const title = document.createElement("h2");

    title.textContent = blog.title;


    // Blog Content
    const content = document.createElement("p");

    content.textContent = blog.content;


    // Author
    const author = document.createElement("p");

    author.textContent =
      "Author: " + (blog.author?.name || "Unknown");


    // Published Date
    const date = document.createElement("p");

    date.textContent =
      "Published: " +
      new Date(blog.createdAt).toLocaleDateString();


    container.append(title, content, author, date);

  } catch (error) {

    container.textContent = error.message;

    console.error(error);

  }

}

loadBlogDetails();


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