const token = localStorage.getItem("token");


// CHECK LOGIN

if (!token) {

    window.location.href = "login.html";

}


// GET CURRENT USER

const payload = JSON.parse(
    atob(token.split(".")[1])
);

const currentUserId = payload.id;



// LOAD USERS

async function loadUsers() {

    try {

        const res = await fetch(
            "https://social-media-backend-6ogp.onrender.com/api/users"
        );

        const users = await res.json();

        const usersDiv =
            document.getElementById("users");

        usersDiv.innerHTML = "";


        users.forEach(user => {

            if (user._id === currentUserId) return;


            const isFollowing =
                user.followers.includes(currentUserId);


            usersDiv.innerHTML += `

            <div class="modern-user-card">

                <div class="modern-user-top">

                    <img
                        src="https://i.pravatar.cc/150?u=${user.username}"
                        class="modern-user-avatar"
                    >

                    <div class="modern-user-info">

                        <h2>
                            ${user.username}
                        </h2>

                        <p>
                            SocialApp User
                        </p>

                    </div>

                </div>


                <div class="modern-user-stats">

                    <div>

                        <h3>
                            ${user.followers.length}
                        </h3>

                        <span>
                            Followers
                        </span>

                    </div>

                    <div>

                        <h3>
                            ${user.following.length}
                        </h3>

                        <span>
                            Following
                        </span>

                    </div>

                </div>


                <button
                    class="follow-btn"
                    onclick="followUser('${user._id}')"
                >

                    ${isFollowing
                        ? "Following"
                        : "Follow"
                    }

                </button>

            </div>

            `;
        });

    } catch (err) {

        console.log(err);

        alert("Error loading users ❌");

    }

}



// FOLLOW USER

async function followUser(userId) {

    try {

        const res = await fetch(

            `https://social-media-backend-6ogp.onrender.com/api/auth/follow/${userId}`,

            {

                method: "PUT",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({
                    currentUserId
                })

            }

        );

        const data = await res.json();

        loadUsers();

    } catch (err) {

        console.log(err);

        alert("Error following user ❌");

    }

}



// LOAD MOST LIKED POSTS

async function loadLikedPosts() {

    try {

        const res = await fetch(
            "https://social-media-backend-6ogp.onrender.com/api/posts"
        );

        const data = await res.json();

        const likedDiv =
            document.getElementById("likedPosts");

        likedDiv.innerHTML = "";


        // SORT BY LIKES

        const sortedPosts =
            data.posts.sort(
                (a, b) =>
                    b.likes.length -
                    a.likes.length
            );


        sortedPosts.slice(0, 5).forEach(post => {

            likedDiv.innerHTML += `

            <div class="liked-post-card">

                <div class="liked-post-top">

                    <img
                        src="https://i.pravatar.cc/150?u=${post.username}"
                        class="liked-post-avatar"
                    >

                    <div>

                        <h3>
                            ${post.username}
                        </h3>

                        <p>
                            ${post.likes.length} likes
                        </p>

                    </div>

                </div>


                <div class="liked-post-text">

                    ${post.text || ""}
                </div>


                ${
                    post.image
                    ? `
                    <img
                        src="https://social-media-backend-6ogp.onrender.com/uploads/${post.image}"
                        class="liked-post-image"
                    >
                    `
                    : ""
                }

            </div>

            `;
        });

    } catch (err) {

        console.log(err);

    }

}



// INITIAL LOAD

loadUsers();

loadLikedPosts();