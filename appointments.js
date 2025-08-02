// ✅ Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyAkIKPlKBQWeTnD3nK-EAdU33FSMiEwj0s",
  authDomain: "shadows-beauty-palace.firebaseapp.com",
  projectId: "shadows-beauty-palace",
  storageBucket: "shadows-beauty-palace.firebasestorage.app",
  messagingSenderId: "287115141439",
  appId: "1:287115141439:web:02485cfad3bf1e7568b38a"
};

// ✅ Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
console.log("Firebase for appointments connected ✅");

// Load services dynamically into dropdown
async function populateServicesDropdown() {
  const select = document.getElementById("service");
  try {
    const snapshot = await db.collection("services").get();
    const options = [];

    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.name) {
        options.push(`<option value="${data.name}">${data.name}</option>`);
      }
    });

    if (options.length > 0) {
      select.innerHTML = `<option value="">-- Select a Service --</option>` + options.join('');
    } else {
      select.innerHTML = `<option value="">No services available</option>`;
    }
  } catch (error) {
    console.error("Error loading services:", error);
    select.innerHTML = `<option value="">Failed to load services</option>`;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  populateServicesDropdown(); // 🔁 Load services on page load

  // The rest of your form logic goes here...
});



// ✅ Helper function to update status message
function showStatus(message, color) {
  const status = document.getElementById("status");
  status.textContent = message;
  status.style.color = color;
}

// ✅ Set min date for date picker
document.addEventListener("DOMContentLoaded", () => {
  const dateInput = document.getElementById("date");
  const todayStr = new Date().toISOString().split("T")[0];
  dateInput.min = todayStr;

  const form = document.getElementById("appointmentForm");
  const status = document.getElementById("status");

  // ✅ Clear status on input/change to avoid confusion
  document.querySelectorAll("#appointmentForm input, #appointmentForm select").forEach(input => {
    input.addEventListener("input", () => showStatus("", ""));
    input.addEventListener("change", () => showStatus("", ""));
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // ✅ Clear any previous message
    showStatus("", "");

    // ✅ Collect form data
    const name = document.getElementById("name").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const service = document.getElementById("service").value;
    const date = document.getElementById("date").value;
    const time = document.getElementById("time").value;

    // ✅ Basic validation
    if (!name || !phone || !service || !date || !time) {
      showStatus("⚠️ Please fill in all fields.", "orange");
      return;
    }

    // ✅ Name validation
    if (!/^[A-Za-z\s]+$/.test(name)) {
      showStatus("❌ Name should contain only letters and spaces.", "red");
      return;
    }

    // ✅ Phone validation
    if (!/^\d{10,15}$/.test(phone)) {
      showStatus("❌ Please enter a valid phone number (digits only, 10 to 15 digits, e.g. 0123456789).", "red");
      return;
    }

    // ✅ No past dates
    const today = new Date().toISOString().split("T")[0];
    if (date < today) {
      showStatus("❌ You cannot book a past date.", "red");
      return;
    }

    // ✅ No past times for today
    const selectedDateTime = new Date(`${date}T${time}`);
    const now = new Date();
    if (selectedDateTime < now) {
      showStatus("❌ You cannot book for a time that has already passed.", "red");
      return;
    }

    // ✅ Limit time between 9 AM – 8 PM
    const hour = parseInt(time.split(":")[0]);
    if (hour < 9 || hour >= 20) {
      showStatus("❌ Booking time must be between 9 AM and 8 PM.", "red");
      return;
    }

    // ✅ Confirm checkbox must be checked
    const confirmCheckbox = document.getElementById("confirm");
    if (!confirmCheckbox.checked) {
      showStatus("❌ Please confirm that all details are correct before submitting.", "red");
      return;
    }


    try {
      // ✅ No more than 2 bookings per phone number
      const existing = await db.collection("appointments")
        .where("phone", "==", phone)
        .get();

      if (existing.size >= 2) {
        showStatus("❌ You cannot book more than 2 appointments with the same phone number.", "red");
        return;
      }

      // ✅ Save to Firestore
      await db.collection("appointments").add({
        createdBy : "customer",
        name,
        phone,
        service,
        date,
        time,
        created_at: firebase.firestore.FieldValue.serverTimestamp()
      });

      showStatus("✅ Appointment booked successfully!", "lime");
      form.reset();
    } catch (error) {
      console.error("❌ Error booking appointment:", error);
      showStatus("❌ Something went wrong. Please try again.", "red");
    }
  });
});