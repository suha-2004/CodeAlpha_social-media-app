const token = localStorage.getItem("token");


// CHECK LOGIN

if (!token) {

  window.location.href = "login.html";

}


// LOAD LIKED POSTS

async function loadLikedPosts() {

  try {

    const res = await fetch(
      "http://localhost:5000/api/posts"
    );

    const data = await res.json();

    const likedDiv =
      document.getElementById("likedPosts");

    likedDiv.innerHTML = "";


    // DECODE TOKEN

    const payload = JSON.parse(
      atob(token.split(".")[1])
    );

    const userId = payload.id;


    // FILTER LIKED POSTS

    const likedPosts =
      data.posts.filter(post =>
        post.likes.includes(userId)
      );


    // EMPTY STATE

    if (likedPosts.length === 0) {

      likedDiv.innerHTML = `

        <div class="empty-liked">

          <img
            src="https://cdn-icons-png.flaticon.com/512/833/833472.png"
            class="empty-liked-icon"
          >

          <h2>
            No Liked Posts Yet
          </h2>

          <p>
            Start liking posts to see them here ❤️
          </p>

        </div>

      `;

      return;
    }


    // SHOW POSTS

    likedPosts.forEach(post => {

      likedDiv.innerHTML += `

        <div class="liked-post-card">


          <!-- TOP -->

          <div class="liked-post-top">

            <img
              src="https://i.pravatar.cc/150?u=${post.username}"
              class="liked-post-avatar"
            >

            <div>

              <div class="liked-post-username">

                ${post.username}

              </div>

              <div class="liked-post-time">

                Just now

              </div>

            </div>

          </div>


          <!-- TEXT -->

          ${
            post.text
            ? `
              <div class="liked-post-text">

                ${post.text}

              </div>
            `
            : ""
          }


          <!-- IMAGE -->

          ${
            post.image
            ? `
              <img
                src="http://localhost:5000/uploads/${post.image}"
                class="liked-post-image"
              >
            `
            : ""
          }


          <!-- FOOTER -->

          <div class="liked-post-footer">

            <span>
              ❤️ ${post.likes.length} Likes
            </span>

            <span>
              💬 ${post.comments.length} Comments
            </span>

          </div>

        </div>

      `;
    });

  } catch (err) {

    console.log(err);

    alert("Error loading liked posts ❌");

  }

}


// LOAD

loadLikedPosts();