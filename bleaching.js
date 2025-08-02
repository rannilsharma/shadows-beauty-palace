// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAkIKPlKBQWeTnD3nK-EAdU33FSMiEwj0s",
  authDomain: "shadows-beauty-palace.firebaseapp.com",
  projectId: "shadows-beauty-palace",
  storageBucket: "shadows-beauty-palace.firebasestorage.app",
  messagingSenderId: "287115141439",
  appId: "1:287115141439:web:02485cfad3bf1e7568b38a"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Load Bleaching services
document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("services-container");
  container.innerHTML = "<p>Loading...</p>";

  try {
    const snapshot = await db.collection("services")
      .where("category", "==", "Bleaching")
      .get();

    if (snapshot.empty) {
      container.innerHTML = "<p>No bleaching services found.</p>";
      return;
    }

    let html = "";
    snapshot.forEach(doc => {
      const service = doc.data();
      html += `
        <div class="service-card">
          <h3>${service.name}</h3>
          <p>${service.description}</p>
          <p><strong>Price:</strong> ${service.price}</p>
          ${service.bonus ? `<p class="bonus">✨ ${service.bonus}</p>` : ""}
        </div>
      `;
    });

    container.innerHTML = html;
  } catch (err) {
    console.error("Error loading bleaching services:", err);
    container.innerHTML = "<p>Error loading bleaching services. Please try again later.</p>";
  }
});
