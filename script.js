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

  // Set dynamic date boundaries
  const today = new Date().toISOString().split('T')[0];
  const dateInputs = document.querySelectorAll('#dynamic-fields input[type="date"]');
  
  dateInputs.forEach(input => {
    if (serviceKey === 'nakath') {
      // For Nakath (Auspicious Timing), the event must be today or in the future
      input.setAttribute('min', today); 
    } else {
      // For Porondum & Kendara (Births), the date must be today or in the past
      input.setAttribute('max', today); 
    }
  });

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

  // 1. Trigger the browser's native validation popups if fields are missing
  const form = document.getElementById('astro-form') || event.target;
  if (!form.checkValidity()) {
    form.reportValidity();
    return; // Stop the function if the form is incomplete
  }

  // 2. Show Loading Spinner
  document.getElementById('modal-form-view').classList.add('hidden');
  document.getElementById('modal-loading-view').classList.remove('hidden');

  // 3. Gather and properly format Data for the AI
  const inputs = document.querySelectorAll('#dynamic-fields .input-field');
  let formattedData = [];
  
  inputs.forEach(input => {
    // Grab the placeholder (e.g., "Full Name") or default to the input type (e.g., "date")
    let label = input.placeholder || input.type.toUpperCase();
    
    // Format times to be readable (e.g., "14:30" becomes "14:30 (24h format)")
    let value = input.value;
    if (input.type === 'time') value += " (24h format)";
    
    formattedData.push(`${label}: ${value}`);
  });

  // 4. Prepare the JSON payload
  const payload = {
    service: currentService, // Will be 'porondum', 'kendara', or 'nakath'
    data: formattedData.join(', ')
  };

  try {
    // 5. Make the actual API call
    const response = await fetch('https://astro-app-3.onrender.com/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Server responded with status: ${response.status}`);
    }

    // 6. Parse the JSON returned by your Python backend
    const result = await response.json();

    // 7. Hide loading, show results
    document.getElementById('modal-loading-view').classList.add('hidden');
    document.getElementById('modal-result-view').classList.remove('hidden');

    // 8. Inject the AI response into the UI
    const outputContainer = document.getElementById('report-output-content');
    outputContainer.innerHTML = `<div>${result.report}</div>`;

  } catch (error) {
    // 9. Handle any errors (like server being offline)
    console.error("API Connection Error:", error);
    document.getElementById('modal-loading-view').classList.add('hidden');
    document.getElementById('modal-result-view').classList.remove('hidden');
    
    document.getElementById('report-output-content').innerHTML = `
      <p style="color: #e06c75; font-weight: 600;">The cosmic connection was interrupted.</p>
      <p style="font-size: 0.9rem; color: var(--text-muted); margin-top: 8px;">Please ensure the backend server is running. Error details: ${error.message}</p>
    `;
  }
}

/* ===================================================
   4. PDF EXPORT LOGIC
   =================================================== */
function downloadPDF() {
  // Temporarily hide the scrollbar so the PDF prints the whole box
  const exportArea = document.getElementById('pdf-export-area');
  
  // Save original styles to revert later
  const originalMaxHeight = exportArea.style.maxHeight;
  const originalOverflow = exportArea.style.overflow;
  const originalOverflowY = exportArea.style.overflowY;

  exportArea.style.maxHeight = 'none';
  exportArea.style.overflow = 'visible';
  exportArea.style.overflowY = 'visible';

  const opt = {
    margin:       0.5,
    filename:     'Cosmic_Report.pdf',
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { scale: 2, backgroundColor: '#0f0a1e', useCORS: true },
    jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
  };

  // Generate the PDF, then restore the scrollable box
  html2pdf().set(opt).from(exportArea).save().then(() => {
    exportArea.style.maxHeight = originalMaxHeight || '65vh';
    exportArea.style.overflow = originalOverflow || '';
    exportArea.style.overflowY = originalOverflowY || 'auto';
  });
}
