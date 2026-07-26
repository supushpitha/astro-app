/* ===================================================
   1. BOKEH & NIGHT SKY CANVAS PARTICLES
   =================================================== */
const canvas = document.getElementById('bokeh-canvas');
const ctx = canvas.getContext('2d');

let particles = [];

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

class Particle {
  constructor() {
    this.reset();
  }

  reset() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.radius = Math.random() * 18 + 4; // Glowing bokeh sizes
    this.alpha = Math.random() * 0.4 + 0.1;
    this.speedY = (Math.random() - 0.5) * 0.3;
    this.speedX = (Math.random() - 0.5) * 0.3;
    // Alternate between gold, cosmic blue, and soft purple
    const colors = ['212, 175, 55', '138, 43, 226', '70, 130, 180'];
    this.color = colors[Math.floor(Math.random() * colors.length)];
  }

  update() {
    this.x += this.speedX;
    this.y += this.speedY;

    if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) {
      this.reset();
    }
  }

  draw() {
    ctx.beginPath();
    let gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius);
    gradient.addColorStop(0, `rgba(${this.color}, ${this.alpha})`);
    gradient.addColorStop(1, `rgba(${this.color}, 0)`);
    ctx.fillStyle = gradient;
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

// Create particle pool
for (let i = 0; i < 45; i++) {
  particles.push(new Particle());
}

function animateParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach(p => {
    p.update();
    p.draw();
  });
  requestAnimationFrame(animateParticles);
}
animateParticles();


/* ===================================================
   2. DYNAMIC MODAL & FORM BUILDER
   =================================================== */
let currentService = 'porondum';

function openServiceModal(serviceKey) {
  currentService = serviceKey;
  const modal = document.getElementById('app-modal');
  const title = document.getElementById('modal-title');
  const desc = document.getElementById('modal-desc');
  const fieldsContainer = document.getElementById('dynamic-fields');

  resetForm();

  if (serviceKey === 'porondum') {
    title.innerText = "Porondum Compatibility Check";
    desc.innerText = "Provide birth details for both individuals to calculate planetary compatibility.";
    fieldsContainer.innerHTML = `
      <div class="form-group-title">Person 1 Details</div>
      <div class="form-row">
        <input type="text" placeholder="Full Name" class="input-field" required />
        <input type="date" class="input-field" required />
      </div>
      <div class="form-row">
        <input type="time" class="input-field" required />
        <input type="text" placeholder="Birth City" class="input-field" required />
      </div>

      <div class="form-group-title">Person 2 Details</div>
      <div class="form-row">
        <input type="text" placeholder="Full Name" class="input-field" required />
        <input type="date" class="input-field" required />
      </div>
      <div class="form-row">
        <input type="time" class="input-field" required />
        <input type="text" placeholder="Birth City" class="input-field" required />
      </div>
    `;
  } else if (serviceKey === 'kendara') {
    title.innerText = "Kendara Birth Chart";
    desc.innerText = "Enter your birth specifics to map planetary coordinates and houses.";
    fieldsContainer.innerHTML = `
      <div class="form-group-title">Personal Information</div>
      <div class="form-row">
        <input type="text" placeholder="Full Name" class="input-field" required />
        <input type="date" class="input-field" required />
      </div>
      <div class="form-row">
        <input type="time" class="input-field" required />
        <input type="text" placeholder="Birth City/Location" class="input-field" required />
      </div>
    `;
  } else {
    title.innerText = "Auspicious Timing (Nakath)";
    desc.innerText = "Select event type and timeframe to find favorable planetary hours.";
    fieldsContainer.innerHTML = `
      <div class="form-group-title">Event & Location</div>
      <div class="form-row">
        <input type="text" placeholder="Event Type (e.g. Wedding, Business)" class="input-field" required />
        <input type="date" class="input-field" required />
      </div>
    `;
  }

  modal.classList.add('active');
}

function closeModal() {
  document.getElementById('app-modal').classList.remove('active');
}

function resetForm() {
  document.getElementById('modal-form-view').classList.remove('hidden');
  document.getElementById('modal-loading-view').classList.add('hidden');
  document.getElementById('modal-result-view').classList.add('hidden');
}

/* ===================================================
   3. API SUBMISSION & REPORT GENERATION
   =================================================== */
async function handleFormSubmit(event) {
  event.preventDefault();

  // 1. Show Loading Spinner
  document.getElementById('modal-form-view').classList.add('hidden');
  document.getElementById('modal-loading-view').classList.remove('hidden');

  // 2. Gather Data from the form fields
  // This grabs all input values and puts them in an array
  const inputs = document.querySelectorAll('#astro-form .input-field');
  const formData = Array.from(inputs).map(input => input.value);

  // 3. Prepare the JSON payload
  const payload = {
    service: currentService, // Will be 'porondum', 'kendara', or 'nakath'
    data: formData
  };

  try {
    // 4. Make the actual API call
    // REPLACE this URL with your actual Python server's URL (e.g., a Render or Heroku link)
    const response = await fetch('https://astro-app-2-e1gf.onrender.com', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Server responded with status: ${response.status}`);
    }

    // 5. Parse the JSON returned by your Python backend
    const result = await response.json();

    // 6. Hide loading, show results
    document.getElementById('modal-loading-view').classList.add('hidden');
    document.getElementById('modal-result-view').classList.remove('hidden');

    // 7. Inject the AI response into the UI
    // This assumes your Python code returns JSON like: {"report": "Your cosmic alignment is..."}
    const outputContainer = document.getElementById('report-output-content');
    outputContainer.innerHTML = `<p>${result.report}</p>`;

  } catch (error) {
    // 8. Handle any errors (like server being offline)
    console.error("API Connection Error:", error);
    document.getElementById('modal-loading-view').classList.add('hidden');
    document.getElementById('modal-result-view').classList.remove('hidden');
    
    document.getElementById('report-output-content').innerHTML = `
      <p style="color: #e06c75; font-weight: 600;">The cosmic connection was interrupted.</p>
      <p style="font-size: 0.9rem; color: var(--text-muted); margin-top: 8px;">Please ensure the backend server is running. Error details: ${error.message}</p>
    `;
  }
}
