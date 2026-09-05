async function loadProfile() {
  const token = localStorage.getItem("token");

  // decode token (simple method)
  const payload = JSON.parse(atob(token.split(".")[1]));

  const userId = payload.id;

  // show user info
  document.getElementById("userInfo").innerHTML = `
    <p>👤 User ID: ${userId}</p>
  `;

  // fetch all posts
  const res = await fetch("https://social-media-backend-6ogp.onrender.com/api/posts");
  const data = await res.json();

  const myPosts = data.posts.filter(post => post.userId === userId);

  const myPostsDiv = document.getElementById("myPosts");
  myPostsDiv.innerHTML = "";

  myPosts.forEach(post => {
    myPostsDiv.innerHTML += `
      <div style="border:1px solid black; margin:10px; padding:10px;">
        <p>${post.text}</p>
        <p>❤️ Likes: ${post.likes.length}</p>
      </div>
    `;
  });
}

loadProfile();