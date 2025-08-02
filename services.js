document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("categoryGrid");
  container.innerHTML = "<p>Loading...</p>";

  try {
    const snapshot = await db.collection("services").get();
    const categoriesSet = new Set();

    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.category) {
        categoriesSet.add(data.category);
      }
    });

    const categories = Array.from(categoriesSet);
    container.innerHTML = "";

    categories.forEach(category => {
      const categoryLink = category.toLowerCase().replace(/\s+/g, "-") + ".html"; // e.g., facial.html
      container.innerHTML += `
        <div class="category-card" onclick="window.location.href='${categoryLink}'">
          <img src="images/${category.toLowerCase().replace(/\s+/g, "-")}.png" alt="${category}" />
          <h3>${category}</h3>
        </div>
      `;
    });

  } catch (error) {
    console.error("Error loading categories:", error);
    container.innerHTML = "<p>❌ Failed to load categories. Please try again later.</p>";
  }
});
