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
console.log("Manage Appointments: Firebase connected ✅");

// ✅ Handle lookup form
document.getElementById("lookupForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const phone = document.getElementById("lookupPhone").value.trim();
  const container = document.getElementById("appointmentsContainer");
  container.innerHTML = "";

  if (!/^\d{10,15}$/.test(phone)) {
    container.innerHTML = `<p style="color:red;">❌ Invalid phone number format.</p>`;
    return;
  }

  try {
    const snapshot = await db.collection("appointments")
      .where("phone", "==", phone)
      .get();

    if (snapshot.empty) {
      container.innerHTML = `<p>No appointments found for this number.</p>`;
      return;
    }

    snapshot.forEach(doc => {
      const data = doc.data();
      const docId = doc.id;

      const div = document.createElement("div");
      div.classList.add("appointment-card");

      div.className = "promo-card";

      div.innerHTML = `
        <h3>${data.service}</h3>
        <p><strong>Name:</strong> ${data.name}</p>
        <p><strong>Date:</strong> <span class="date-${docId}">${data.date}</span></p>
        <p><strong>Time:</strong> <span class="time-${docId}">${data.time}</span></p>
        
        

        <div class="btn-group">
          <button class="btn" onclick="deleteAppointment('${docId}', this)">Cancel</button>
          <button class="btn" onclick="showModifyForm('${docId}')">Modify</button>
        </div>

        <div id="modify-${docId}" style="display:none; margin-top:10px;">
          <label>New Date: <input type="date" id="newDate-${docId}"></label>
          <label>New Time: <input type="time" id="newTime-${docId}"></label>
          <button class="btn" onclick="saveChanges('${docId}')">Save</button>
        </div>
      `;

      

      container.appendChild(div);
    });
  } catch (err) {
    console.error("Error fetching appointments:", err);
    container.innerHTML = `<p style="color:red;">❌ Something went wrong.</p>`;
  }
});

// ✅ Delete appointment from Firestore
async function deleteAppointment(docId, button) {
  const confirmDelete = confirm("Are you sure you want to cancel (delete) this appointment?");
  if (!confirmDelete) return;

  button.disabled = true;
  button.textContent = "Cancelling...";

  const phone = document.getElementById("lookupPhone").value.trim();

  try {
    const docRef = db.collection("appointments").doc(docId);
    const doc = await docRef.get();

    if (!doc.exists) {
      alert("❌ Appointment not found.");
      return;
    }

    if (doc.data().phone !== phone) {
      alert("❌ You are not authorized to delete this appointment.");
      return;
    }

    await docRef.delete();
    const card = button.closest(".promo-card");
    card.remove();
    alert("✅ Appointment cancelled and deleted.");
  } catch (error) {
    console.error("Error deleting appointment:", error);
    alert("❌ Failed to cancel appointment.");
    button.disabled = false;
    button.textContent = "Cancel";
  }
}


// ✅ Show modify form
function showModifyForm(docId) {
  const section = document.getElementById(`modify-${docId}`);
  section.style.display = section.style.display === "none" ? "block" : "none";
}

// ✅ Save changes to Firestore
async function saveChanges(docId) {
  const newDate = document.getElementById(`newDate-${docId}`).value;
  const newTime = document.getElementById(`newTime-${docId}`).value;

  if (!newDate || !newTime) {
    alert("⚠️ Please enter both date and time.");
    return;
  }

  const selectedDateTime = new Date(`${newDate}T${newTime}`);
  const now = new Date();
  if (selectedDateTime < now) {
    alert("❌ Cannot choose a past date/time.");
    return;
  }

  const hour = parseInt(newTime.split(":")[0]);
  if (hour < 9 || hour >= 20) {
    alert("❌ Booking time must be between 9 AM and 8 PM.");
    return;
  }

  try {
    await db.collection("appointments").doc(docId).update({
      date: newDate,
      time: newTime,
      phone: document.getElementById("lookupPhone").value.trim()
  } );


    document.querySelector(`.date-${docId}`).textContent = newDate;
    document.querySelector(`.time-${docId}`).textContent = newTime;
    alert("✅ Appointment updated successfully!");
    document.getElementById(`modify-${docId}`).style.display = "none";
  } catch (error) {
    console.error("Error updating appointment:", error);
    alert("❌ Failed to update appointment.");
  }
}