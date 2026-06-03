// ================= CHECK LOGIN =================

const token = localStorage.getItem("token");
const currentUser = localStorage.getItem("username") || "User";
let allPosts = [];

if (!token) {
  window.location.href = "login.html";
}


// ================= HELPERS =================

// Prevent XSS (Cross-Site Scripting) Attacks
function escapeHtml(text) {
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(text));
  return div.innerHTML;
}

// Generate Initials for Avatars (e.g., "John Doe" -> "JD")
function getInitials(name) {
  if (!name) return "";
  const parts = name.split(' ');
  if (parts.length > 1) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

// Enable/Disable Post buttons based on input length
function checkBtnState(input, btnId) {
  const btn = document.getElementById(btnId);
  if (input.value.trim().length > 0) {
    btn.classList.add('active');
  } else {
    btn.classList.remove('active');
  }
}


// ================= TOGGLE COMMENTS =================

function toggleComments(postId) {

  const section =
    document.getElementById(
      `comments-section-${postId}`
    );

  if(section){

    section.classList.toggle("active");

    if(section.classList.contains("active")){

      localStorage.setItem(
        "openComments",
        postId
      );

    }else{

      localStorage.removeItem(
        "openComments"
      );
    }
  }
}


// ================= TOGGLE REPLY BOX =================

function toggleReplyBox(postId, commentId) {

  const box =
    document.getElementById(
      `reply-box-${postId}-${commentId}`
    );

  if(!box) return;

  if(box.style.display === "flex"){

    box.style.display = "none";

  }else{

    document
      .querySelectorAll(".ig-reply-input")
      .forEach(el => el.style.display="none");

    box.style.display = "flex";

    box.querySelector("input").focus();
  }
}


// ================= LOAD POSTS =================

async function loadPosts() {

  try {

    const res = await fetch("http://localhost:5000/api/posts");
    const data = await res.json();
    allPosts = data.posts;
    const postsDiv = document.getElementById("posts");

    postsDiv.innerHTML = "";

    data.posts.forEach(post => {

      const postInitials = getInitials(post.username);
      
      // Map through comments
      const commentsHtml = post.comments && post.comments.length > 0 
        ? post.comments.map(c => {
            
            const commentInitials = getInitials(c.username);
            
            // Map through replies
            const repliesHtml = c.replies && c.replies.length > 0 
              ? c.replies.map(r => {
                  const replyInitials = getInitials(r.username);
                  return `
                    <div class="ig-reply ig-comment">
                      <div class="ig-comment-avatar">${replyInitials}</div>
                      <div class="ig-comment-content">
                        <div class="ig-comment-text">
                          <span class="ig-comment-username">${escapeHtml(r.username)}</span> ${escapeHtml(r.text)}
                        </div>
                      </div>
                    </div>
                  `;
                }).join("")
              : "";

            return `
              <div class="ig-comment">
                <div class="ig-comment-avatar">${commentInitials}</div>
                <div class="ig-comment-content">
                  <div class="ig-comment-text">
                    <span class="ig-comment-username">${escapeHtml(c.username)}</span> ${escapeHtml(c.text)}
                  </div>
                  <div class="ig-comment-actions">
                    <span class="ig-comment-time">Just now</span>
                    <button class="ig-action-btn" onclick="toggleReplyBox('${post._id}', '${c._id}')">Reply</button>
                  </div>
                </div>
              </div>

              ${repliesHtml ? `<div class="ig-reply-thread">${repliesHtml}</div>` : ''}

              <div class="ig-reply-input" id="reply-box-${post._id}-${c._id}" style="display:none;">
                <input 
                  type="text" 
                  id="reply-${post._id}-${c._id}" 
                  placeholder="Reply to ${escapeHtml(c.username)}..."
                  oninput="checkBtnState(this, 'reply-btn-${post._id}-${c._id}')"
                  onkeydown="if(event.key === 'Enter'){event.preventDefault(); replyComment('${post._id}', '${c._id}')}"
                >
                <button 
                  id="reply-btn-${post._id}-${c._id}" 
                  class="ig-reply-post-btn" 
                  onclick="replyComment('${post._id}', '${c._id}')"
                >Post</button>
              </div>
            `;
          }).join("")
        : `<div class="no-comments">No comments yet.</div>`;

      // Build Post Card
      postsDiv.innerHTML += `
        <div class="card">

          <!-- USER -->
          <div class="post-header">
            <div class="ig-comment-avatar main-avatar">${postInitials}</div>
            <div>
              <div class="post-user">${escapeHtml(post.username)}</div>
            </div>
          </div>

          <!-- TEXT -->
          ${post.text ? `<div class="post-text">${escapeHtml(post.text)}</div>` : ""}

          <!-- IMAGE -->
          ${post.image ? `<img src="http://localhost:5000/uploads/${post.image}" class="post-image">` : ""}

          <!-- LIKES -->
          <div class="post-likes">
            ❤️ ${post.likes.length} Likes
          </div>

          <!-- ACTIONS -->
          <div class="post-actions">
            <button onclick="likePost('${post._id}')">❤️ Like</button>
            <button onclick="toggleComments('${post._id}')">💬 Comments</button>
          </div>

          <!-- COMMENTS SECTION -->
          <div class="ig-comments-section" id="comments-section-${post._id}">
            
            <!-- LIST -->
            <div class="ig-comments-list">
              ${commentsHtml}
            </div>

            <!-- MAIN COMMENT INPUT -->
            <div class="ig-comment-input-container">
              <div class="ig-comment-avatar ig-input-avatar">${getInitials(currentUser)}</div>
              <input 
                type="text" 
                class="ig-comment-input" 
                id="comment-${post._id}" 
                placeholder="Add a comment..."
                oninput="checkBtnState(this, 'main-post-btn-${post._id}')"
                onkeydown="if(event.key === 'Enter'){event.preventDefault(); commentPost('${post._id}')}"
              >
              <button 
                id="main-post-btn-${post._id}" 
                class="ig-main-post-btn" 
                onclick="commentPost('${post._id}')"
              >Post</button>
            </div>

          </div>

        </div>
      `;
    });
    // Keep previously opened comment section open
const openPostId =
  localStorage.getItem("openComments");

if (openPostId) {

  const section =
    document.getElementById(
      `comments-section-${openPostId}`
    );

  if (section) {

    section.classList.add("active");

  }
}

  } catch (err) {
    console.log(err);
    alert("Error loading posts ❌");
  }

}


// ================= CREATE POST =================

async function createPost() {

  try {

    const text = document.getElementById("postText").value;
    const image = document.getElementById("image").files[0];

    if (!text && !image) {
      alert("Add text or image to create post ❌");
      return;
    }

    const formData = new FormData();
    formData.append("text", text);

    if (image) {
      formData.append("image", image);
    }

    const res = await fetch("http://localhost:5000/api/posts", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + token
      },
      body: formData
    });

    const data = await res.json();

    // Removed success alert for smoother UX
    document.getElementById("postText").value = "";
    document.getElementById("image").value = "";

    loadPosts();

  } catch (err) {
    console.log(err);
    alert("Error creating post ❌");
  }

}


// ================= LIKE POST =================

async function likePost(postId) {

  try {

    await fetch(`http://localhost:5000/api/posts/${postId}/like`, {
      method: "PUT",
      headers: {
        "Authorization": "Bearer " + token
      }
    });

    // Removed success alert for smoother UX
    loadPosts();

  } catch (err) {
    console.log(err);
    alert("Error liking post ❌");
  }

}


// ================= COMMENT POST =================

async function commentPost(postId) {

  try {

    const input = document.getElementById(`comment-${postId}`);
    const text = input.value.trim();

    if (!text) {
      return; // Don't do anything if empty (button should be disabled anyway)
    }

    const res = await fetch(
  `http://localhost:5000/api/posts/${postId}/comment`,
{
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token
      },
      body: JSON.stringify({ text })
    });

    input.value = "";

checkBtnState(
  input,
  `main-post-btn-${postId}`
);

localStorage.setItem(
  "openComments",
  postId
);

loadPosts();

  } catch (err) {
    console.log(err);
    alert("Error adding comment ❌");
  }

}


// ================= REPLY COMMENT =================

async function replyComment(postId, commentId) {

  try {

    const input = document.getElementById(`reply-${postId}-${commentId}`);
    const text = input.value.trim();

    if (!text) {
      return; 
    }

    await fetch(`http://localhost:5000/api/posts/${postId}/reply/${commentId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token
      },
      body: JSON.stringify({ text })
    });

    input.value = "";

checkBtnState(
  input,
  `reply-btn-${postId}-${commentId}`
);

localStorage.setItem(
  "openComments",
  postId
);

loadPosts();

  } catch (err) {
    console.log(err);
    alert("Error replying ❌");
  }

}
// ================= SEARCH =================

document.addEventListener(
  "DOMContentLoaded",
  () => {

    const search =
      document.getElementById(
        "searchInput"
      );

    if (!search) return;

    search.addEventListener(
      "keyup",
      function () {

        const value =
          this.value.toLowerCase();

        const cards =
          document.querySelectorAll(
            ".card"
          );

        cards.forEach(card => {

          const text =
            card.innerText.toLowerCase();

          if (
            text.includes(value)
          ) {

            card.style.display =
              "block";

          } else {

            card.style.display =
              "none";
          }
        });

      }
    );

  }
);

// ================= LOGOUT =================

function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("username");
  window.location.href = "login.html";
}


// ================= INITIAL LOAD =================

loadPosts();