
 

  // ✅ Use the compat Firebase object — NOT initializeApp()

const firebaseConfig = {
  apiKey: "AIzaSyAkIKPlKBQWeTnD3nK-EAdU33FSMiEwj0s",
  authDomain: "shadows-beauty-palace.firebaseapp.com",
  projectId: "shadows-beauty-palace",
  storageBucket: "shadows-beauty-palace.firebasestorage.app",
  messagingSenderId: "287115141439",
  appId: "1:287115141439:web:02485cfad3bf1e7568b38a"
};

// ✅ Initialize Firebase using the compat style
firebase.initializeApp(firebaseConfig);
console.log("Firebase initialized ✅");

const db = firebase.firestore();
console.log("Connected to Firestore ✅");

// ✅ Fetch and display promotions
document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('promo-container');
  container.innerHTML = '<p>Loading promotions...</p>';

  try {
    const snapshot = await db.collection("promotions").get();
    console.log("Documents fetched:", snapshot.size);

    const today = new Date();
    let html = '';

    snapshot.forEach(doc => {
      const data = doc.data();
      const endDate = data.end_date.toDate();
      console.log("Promo data:", data);

      if (endDate >= today) {
  const startDate = data.start_date?.toDate(); // optional chaining in case it doesn't exist
  let validityText = '';

  if (startDate && endDate) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    const startStr = startDate.toLocaleDateString(undefined, options);
    const endStr = endDate.toLocaleDateString(undefined, options);
    validityText = `<p><strong>Valid:</strong> ${startStr} – ${endStr}</p>`;
  }

  html += `
    <div class="promo-card">
      <h2>${data.title}</h2>
      <p>${data.description}</p>
      ${validityText}
      <a href="${data.whatsapp_link}" target="_blank" class="btn">Book via WhatsApp</a>
    </div>
  `;
}

    });

    container.innerHTML = html || '<p>No ongoing promotions at the moment.</p>';
  } catch (error) {
    console.error('Error fetching promotions:', error);
    container.innerHTML = '<p>Error loading promotions. Please try again later.</p>';
  }
});
