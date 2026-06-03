async function register() {

  const username = document.getElementById("username").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const res = await fetch(
    "http://localhost:5000/api/auth/register",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        username,
        email,
        password
      })
    }
  );

  const data = await res.json();

  document.getElementById("msg").innerText = data.message;

  if (data.message.includes("success")) {

    alert("Registration successful ✅");

    window.location.href = "login.html";
  }
}