async function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const res = await fetch("http://localhost:5000/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email, password })
  });

  const data = await res.json();

  if (data.token) {
    localStorage.setItem("token", data.token);
    document.getElementById("msg").innerText = "Login success 🚀";

    // go to feed page
    window.location.href = "feed.html";
  } else {
    document.getElementById("msg").innerText = data.message;
  }
}