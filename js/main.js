/* ============================================================
   ROME SKETCH ART – MAIN JAVASCRIPT (Complete Dynamic)
   ============================================================ */

// ---------- GLOBAL IMAGE INDEX FOR CAROUSEL ----------
window.currentImageIndex = 0;
window.currentAllImages = [];

// ---------- AUTH HELPERS ----------
function checkAuth() {
  if (localStorage.getItem('loggedIn') !== 'true') {
    window.location.href = 'login.html';
    return false;
  }
  return true;
}

function checkAuthRedirect() {
  if (localStorage.getItem('loggedIn') === 'true') {
    const role = localStorage.getItem('userRole');
    if (role === 'admin') {
      window.location.href = 'admin.html';
    } else {
      window.location.href = 'dashboard.html';
    }
  }
}

function doLogout() {
  localStorage.removeItem('loggedIn');
  localStorage.removeItem('userEmail');
  localStorage.removeItem('userRole');
  localStorage.removeItem('userId');
  localStorage.removeItem('userName');
  window.location.href = 'login.html';
}

// ---------- ADMIN SECTION SCROLL ----------
function scrollToSection(sectionId) {
  const section = document.getElementById(sectionId);
  if (section) {
    section.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

// ---------- HOMEPAGE ----------
function initHomepage() {
  fetch('php/sketches.php')
    .then(r => r.json())
    .then(sketches => {
      const grid = document.getElementById('featuredGrid');
      if (!grid) return;
      const featured = sketches.slice(0, 6);
      grid.innerHTML = featured.map(s => `
        <a href="pages/detail.html?id=${s.id}" style="text-decoration:none; color:inherit;">
          <div class="sketch-card">
            <div class="sketch-img">
              <img src="${s.image ? 'images/sketches/' + s.image : 'images/Photography/amin-safaripour-RSP3qZrGIBM-unsplash.jpg'}" alt="${s.title}"/>
            </div>
            <div class="sketch-info">
              <h3>${s.title}</h3>
              <p class="artist">by ${s.artist}</p>
              <p class="price">PKR ${s.price}</p>
              <span class="btn-small">Buy</span>
            </div>
          </div>
        </a>
      `).join('');
    });
}

// ---------- GALLERY PAGE ----------
function initGallery() {
  fetch('../php/sketches.php')
    .then(r => r.json())
    .then(sketches => {
      const grid = document.getElementById('galleryGrid');
      if (!grid) return;
      window.allSketches = sketches;
      renderGallery(sketches);
    });

  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const category = this.dataset.category;
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      filterGallery(category);
    });
  });
}

function renderGallery(sketches) {
  const grid = document.getElementById('galleryGrid');
  if (!grid) return;
  grid.innerHTML = sketches.map(s => `
    <a href="detail.html?id=${s.id}" style="text-decoration:none; color:inherit;">
      <div class="sketch-card" data-category="${s.category}">
        <div class="sketch-img">
          <img src="${s.image ? '../images/sketches/' + s.image : '../images/Photography/amin-safaripour-RSP3qZrGIBM-unsplash.jpg'}" alt="${s.title}"/>
        </div>
        <div class="sketch-info">
          <h3>${s.title}</h3>
          <p class="artist">by ${s.artist}</p>
          <p class="price">PKR ${s.price}</p>
          <span class="btn-small">Buy</span>
        </div>
      </div>
    </a>
  `).join('');
}

function filterGallery(category) {
  const all = window.allSketches || [];
  const filtered = category === 'all' ? all : all.filter(s => s.category === category);
  renderGallery(filtered);
}

// ---------- DETAIL PAGE ----------
function initDetailPage() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id') || 1;

  fetch('../php/get-sketch.php?id=' + id)
    .then(r => r.json())
    .then(sketch => {
      if (sketch.error) {
        document.getElementById('sketchTitle').innerText = 'Not found';
        return;
      }
      document.getElementById('sketchTitle').innerText = sketch.title;
      document.getElementById('sketchArtist').innerText = 'by ' + sketch.artist;
      document.getElementById('sketchPrice').innerText = 'PKR ' + sketch.price;
      document.getElementById('btnPrice').innerText = 'PKR ' + sketch.price;
      document.getElementById('finalPrice').value = sketch.price;
      document.getElementById('sketchId').value = sketch.id;

      const allImages = sketch.images ? sketch.images.split(',').filter(img => img.trim() !== '') : [];
      window.currentAllImages = allImages;
      window.currentImageIndex = 0;
      
      const galleryContainer = document.getElementById('sketchGallery');

      if (allImages.length === 0) {
        galleryContainer.innerHTML = '<img src="../images/Photography/amin-safaripour-RSP3qZrGIBM-unsplash.jpg" alt="No image" style="width:100%; border-radius:12px;"/>';
        return;
      }

      if (allImages.length === 1) {
        galleryContainer.innerHTML = `<img src="../images/sketches/${allImages[0]}" alt="Sketch" class="gallery-single"/>`;
      } else if (allImages.length === 2) {
        galleryContainer.innerHTML = `
          <div class="gallery-side">
            <div class="img-wrap">
              <img src="../images/sketches/${allImages[0]}" alt="Pencil Sketch" onclick="openFullImage('../images/sketches/${allImages[0]}')"/>
              <span class="gallery-label">Pencil Sketch</span>
            </div>
            <div class="img-wrap">
              <img src="../images/sketches/${allImages[1]}" alt="Reference Photo" onclick="openFullImage('../images/sketches/${allImages[1]}')"/>
              <span class="gallery-label">Reference Photo</span>
            </div>
          </div>
        `;
      } else {
        renderCarousel(galleryContainer, allImages, 0);
      }
    });
}

function renderCarousel(container, images, index) {
  const labels = [];
  labels.push('Pencil Sketch');
  for (let i = 1; i < images.length; i++) {
    labels.push('Step ' + i);
  }

  container.innerHTML = `
    <div class="gallery-carousel">
      <button class="gallery-arrow left" onclick="prevImage()">◀</button>
      <img src="../images/sketches/${images[index]}" alt="${labels[index]}" id="carouselImage" onclick="openFullImage('../images/sketches/${images[index]}')"/>
      <button class="gallery-arrow right" onclick="nextImage()">▶</button>
      <span class="gallery-label">${labels[index]}</span>
    </div>
    <div class="gallery-dots">
      ${images.map((img, i) => `
        <div class="gallery-dot ${i === index ? 'active' : ''}" onclick="goToImage(${i})"></div>
      `).join('')}
    </div>
  `;
}

function goToImage(index) {
  window.currentImageIndex = index;
  const container = document.getElementById('sketchGallery');
  renderCarousel(container, window.currentAllImages, index);
}

function nextImage() {
  const newIndex = (window.currentImageIndex + 1) % window.currentAllImages.length;
  goToImage(newIndex);
}

function prevImage() {
  const newIndex = (window.currentImageIndex - 1 + window.currentAllImages.length) % window.currentAllImages.length;
  goToImage(newIndex);
}

function openFullImage(src) {
  window.open(src, '_blank');
}

function placeOrder() {
  if (localStorage.getItem('loggedIn') !== 'true') {
    window.location.href = 'login.html';
    return;
  }

  const name = document.getElementById('buyerName').value;
  const phone = document.getElementById('buyerPhone').value;
  const address = document.getElementById('buyerAddress').value;
  const price = document.getElementById('finalPrice').value;
  const method = document.getElementById('payMethod').value;
  const sketchId = document.getElementById('sketchId').value;
  const resultDiv = document.getElementById('orderResult');

  if (!name || !phone || !address) {
    resultDiv.innerHTML = '<p style="color:#ff4444;">Please fill all fields.</p>';
    return;
  }

  const formData = new FormData();
  formData.append('user_id', localStorage.getItem('userId') || 0);
  formData.append('sketch_id', sketchId);
  formData.append('name', name);
  formData.append('phone', phone);
  formData.append('address', address);
  formData.append('amount', price);
  formData.append('payment', method);

  fetch('../php/order.php', { method: 'POST', body: formData })
    .then(r => r.json())
    .then(data => {
      if (data.success) {
        resultDiv.innerHTML = `<div class="success-box">✅ Order placed! Order ID: ${data.order_id}</div>`;
      } else {
        resultDiv.innerHTML = `<p style="color:#ff4444;">❌ ${data.error}</p>`;
      }
    });
}

// ---------- CUSTOM ORDER PAGE ----------
function selectPlan(name, price, cardElement) {
  document.getElementById('oPlan').value = name;
  document.getElementById('oPrice').value = price;
  document.querySelectorAll('.price-card').forEach(card => card.classList.remove('active-plan'));
  if (cardElement) cardElement.classList.add('active-plan');
}

function selectPlanWithScroll(name, price, cardElement) {
  event.stopPropagation();
  selectPlan(name, price, cardElement);
  const formBox = document.querySelector('.order-form-box');
  if (formBox) formBox.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function submitOrder() {
  if (localStorage.getItem('loggedIn') !== 'true') {
    window.location.href = 'login.html';
    return;
  }

  const name = document.getElementById('oName').value;
  const phone = document.getElementById('oPhone').value;
  const email = document.getElementById('oEmail').value;
  const price = document.getElementById('oPrice').value;
  const plan = document.getElementById('oPlan').value;
  const notes = document.getElementById('oNotes').value;
  const payment = document.getElementById('oPayment').value;
  const address = document.getElementById('oAddress').value;
  const photoInput = document.getElementById('oPhoto');
  const msgDiv = document.getElementById('orderMsg');

  if (!name || !phone) {
    msgDiv.innerHTML = '<p style="color:#ff4444;">Please fill required fields.</p>';
    return;
  }
  if (plan === 'None selected') {
    msgDiv.innerHTML = '<p style="color:#ff4444;">Please select a plan first.</p>';
    return;
  }

  const formData = new FormData();
  formData.append('user_id', localStorage.getItem('userId') || 0);
  formData.append('name', name);
  formData.append('phone', phone);
  formData.append('address', address);
  formData.append('amount', price);
  formData.append('plan', plan);
  formData.append('notes', notes);
  formData.append('payment', payment);
  if (photoInput.files[0]) {
    formData.append('photo', photoInput.files[0]);
  }

  fetch('../php/order.php', { method: 'POST', body: formData })
    .then(r => r.json())
    .then(data => {
      if (data.success) {
        msgDiv.innerHTML = `<div class="success-box">✅ Order submitted! Order ID: ${data.order_id}</div>`;
      } else {
        msgDiv.innerHTML = `<p style="color:#ff4444;">❌ ${data.error}</p>`;
      }
    });
}

function initCustomOrderPage() {
  document.getElementById('oPlan').value = 'None selected';
  document.getElementById('oPrice').value = '0';
  document.querySelectorAll('.price-card').forEach(card => card.classList.remove('active-plan'));
}

// ---------- LOGIN PAGE ----------
function doLogin() {
  const email = document.getElementById('lEmail').value.trim();
  const pass = document.getElementById('lPass').value;
  const msg = document.getElementById('loginMsg');

  if (!email || !pass) {
    msg.innerHTML = '<p style="color:#ff4444;">Fill all fields.</p>';
    return;
  }

  const formData = new FormData();
  formData.append('email', email);
  formData.append('pass', pass);

  fetch('../php/login.php', { method: 'POST', body: formData })
    .then(r => r.json())
    .then(data => {
      if (data.success) {
        localStorage.setItem('loggedIn', 'true');
        localStorage.setItem('userEmail', data.email);
        localStorage.setItem('userRole', data.role);
        localStorage.setItem('userId', data.id);
        localStorage.setItem('userName', data.name);

        msg.innerHTML = '<p style="color:#88cc88;">✅ Login successful! Redirecting...</p>';
        setTimeout(() => {
          if (data.role === 'admin') {
            window.location.href = 'admin.html';
          } else {
            window.location.href = 'dashboard.html';
          }
        }, 1000);
      } else {
        msg.innerHTML = `<p style="color:#ff4444;">❌ ${data.error}</p>`;
      }
    });
}

// ---------- REGISTER PAGE ----------
function doRegister() {
  const name  = document.getElementById('rName').value.trim();
  const email = document.getElementById('rEmail').value.trim();
  const phone = document.getElementById('rPhone').value.trim();
  const pass  = document.getElementById('rPass').value;
  const pass2 = document.getElementById('rPass2').value;
  const role  = document.getElementById('rRole').value;
  const msg   = document.getElementById('regMsg');

  if (!name || !email || !phone || !pass || !pass2) {
    msg.innerHTML = '<p style="color:#ff4444;">❌ Please fill all fields.</p>';
    return;
  }
  if (name.length < 2) {
    msg.innerHTML = '<p style="color:#ff4444;">❌ Name must be at least 2 characters.</p>';
    return;
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    msg.innerHTML = '<p style="color:#ff4444;">❌ Please enter a valid email address.</p>';
    return;
  }
  const phoneRegex = /^03[0-9]{2}-?[0-9]{7}$/;
  if (!phoneRegex.test(phone)) {
    msg.innerHTML = '<p style="color:#ff4444;">❌ Please enter a valid phone number (e.g., 0300-1234567).</p>';
    return;
  }
  if (pass.length < 4) {
    msg.innerHTML = '<p style="color:#ff4444;">❌ Password must be at least 4 characters.</p>';
    return;
  }
  if (pass !== pass2) {
    msg.innerHTML = '<p style="color:#ff4444;">❌ Passwords do not match.</p>';
    return;
  }

  const formData = new FormData();
  formData.append('name', name);
  formData.append('email', email);
  formData.append('phone', phone);
  formData.append('pass', pass);
  formData.append('role', role);

  fetch('../php/register.php', { method: 'POST', body: formData })
    .then(r => r.json())
    .then(data => {
      if (data.success) {
        msg.innerHTML = '<div class="success-box">✅ Account created!<br/><a href="login.html" style="color:#88cc88;">Login now →</a></div>';
        document.getElementById('rName').value = '';
        document.getElementById('rEmail').value = '';
        document.getElementById('rPhone').value = '';
        document.getElementById('rPass').value = '';
        document.getElementById('rPass2').value = '';
      } else {
        msg.innerHTML = `<p style="color:#ff4444;">❌ ${data.error}</p>`;
      }
    });
}

// ---------- CHANGE PASSWORD ----------
function changePassword() {
  const email = localStorage.getItem('userEmail');
  const currentPass = document.getElementById('currentPass').value;
  const newPass = document.getElementById('newPass').value;
  const confirmPass = document.getElementById('confirmPass').value;
  const msg = document.getElementById('changePassMsg');

  if (!currentPass || !newPass || !confirmPass) {
    msg.innerHTML = '<p style="color:#ff4444;">❌ Fill all fields.</p>';
    return;
  }
  if (newPass.length < 4) {
    msg.innerHTML = '<p style="color:#ff4444;">❌ New password must be at least 4 characters.</p>';
    return;
  }
  if (newPass !== confirmPass) {
    msg.innerHTML = '<p style="color:#ff4444;">❌ Passwords do not match.</p>';
    return;
  }

  const formData = new FormData();
  formData.append('email', email);
  formData.append('currentPass', currentPass);
  formData.append('newPass', newPass);

  fetch('../php/change-password.php', { method: 'POST', body: formData })
    .then(r => r.json())
    .then(data => {
      if (data.success) {
        msg.innerHTML = '<div class="success-box">✅ Password changed successfully!</div>';
      } else {
        msg.innerHTML = `<p style="color:#ff4444;">❌ ${data.error}</p>`;
      }
    });
}

// ---------- DASHBOARD PAGE (User Only) ----------
function initDashboard() {
  if (!checkAuth()) return;

  const email = localStorage.getItem('userEmail');
  const role = localStorage.getItem('userRole');
  const name = localStorage.getItem('userName');
  const userId = localStorage.getItem('userId');

  if (role === 'admin') {
    window.location.href = 'admin.html';
    return;
  }

  document.getElementById('welcomeMsg').innerText = `Welcome, ${name}`;
  document.getElementById('dashEmail').innerText = email;
  document.getElementById('dashRole').innerText = role;
  document.getElementById('dashToken').innerText = 'sess_' + Math.random().toString(36).substr(2,9);

  fetch(`../php/my-orders.php?user_id=${userId}`)
    .then(r => r.json())
    .then(orders => {
      const tbody = document.getElementById('ordersTableBody');
      if (!tbody) return;
      if (orders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="color:#aaa;">No orders yet.</td></tr>';
        return;
      }
      tbody.innerHTML = orders.map(order => `
        <tr>
          <td>#${order.id}</td>
          <td>${order.plan || 'Sketch #' + order.sketch_id}</td>
          <td>PKR ${order.amount}</td>
          <td><span class="badge ${order.status === 'completed' ? 'done' : 'pending'}">${order.status}</span></td>
          <td><a href="order-detail.html?order_id=${order.id}" style="color:#fff;">View</a></td>
        </tr>
      `).join('');
    });
}

// ---------- ORDER DETAIL PAGE ----------
function initOrderDetail() {
  const params = new URLSearchParams(window.location.search);
  const orderId = params.get('order_id');
  if (!orderId) {
    document.getElementById('orderDetailContainer').innerHTML = '<h2 style="color:#ff4444;">Order ID missing.</h2>';
    return;
  }
  document.getElementById('orderIdDisplay').innerText = `Order #${orderId}`;

  fetch(`../php/order-detail.php?order_id=${orderId}`)
    .then(r => r.json())
    .then(order => {
      if (order.error) {
        document.getElementById('orderInfo').innerHTML = `<p style="color:#ff4444;">${order.error}</p>`;
        return;
      }
      document.getElementById('detailBuyer').innerText = order.buyer_name;
      document.getElementById('detailPhone').innerText = order.phone;
      document.getElementById('detailAddress').innerText = order.address;
      document.getElementById('detailPlan').innerText = order.plan || `Sketch #${order.sketch_id}`;
      document.getElementById('detailAmount').innerText = 'PKR ' + order.amount;
      document.getElementById('detailPayment').innerText = order.payment;
      document.getElementById('detailStatus').innerText = order.status;
      document.getElementById('detailNotes').innerText = order.notes || 'None';
      document.getElementById('detailPhoto').innerHTML = order.photo ? `<a href="../images/uploads/${order.photo}" target="_blank">View Photo</a>` : 'No photo';
    });
}

// ---------- ADMIN PAGE ----------
function initAdminPage() {
  if (!checkAuth()) return;
  if (localStorage.getItem('userRole') !== 'admin') {
    window.location.href = 'dashboard.html';
    return;
  }

  const adminUserId = localStorage.getItem('userId');

  loadStats();

  fetch('../php/admin-users.php')
    .then(r => r.json())
    .then(users => {
      const tbody = document.getElementById('adminUsersBody');
      tbody.innerHTML = users.map(user => {
        const isSelf = (user.id == adminUserId);
        const deleteBtn = isSelf ? '' : `<button class="btn-small" onclick="deleteUser(${user.id})">Delete</button>`;
        return `
        <tr>
          <td>${user.id}</td>
          <td>${user.email}</td>
          <td style="color:#ff6666;">${user.password}</td>
          <td><span class="badge ${user.role === 'admin' ? 'admin' : 'user'}">${user.role}</span></td>
          <td>${deleteBtn}</td>
        </tr>`;
      }).join('');
    });

  fetch('../php/admin-orders.php')
    .then(r => r.json())
    .then(orders => {
      const tbody = document.getElementById('adminOrdersBody');
      tbody.innerHTML = orders.map(order => `
        <tr>
          <td>#${order.id}</td>
          <td>${order.buyer_name}</td>
          <td>${order.plan || 'Sketch #' + order.sketch_id}</td>
          <td>PKR ${order.amount}</td>
          <td><span class="badge ${order.status === 'completed' ? 'done' : 'pending'}">${order.status}</span></td>
          <td>
            <button class="btn-small" onclick="deleteOrder(${order.id})">Delete</button>
            <button class="btn-small" onclick="updateOrderStatus(${order.id}, 'completed')">Complete</button>
          </td>
        </tr>
      `).join('');
    });

  loadSketchesTable();
}

function loadSketchesTable() {
  fetch('../php/sketches.php')
    .then(r => r.json())
    .then(sketches => {
      const tbody = document.getElementById('adminSketchesBody');
      if (!tbody) return;
      tbody.innerHTML = sketches.map((s, index) => `
        <tr id="sketch-row-${s.id}">
          <td>${index + 1}</td>
          <td class="sketch-title">${s.title}</td>
          <td class="sketch-artist">${s.artist}</td>
          <td class="sketch-price">${s.price}</td>
          <td class="sketch-category">${s.category}</td>
          <td>
            ${s.image ? `<img src="../images/sketches/${s.image}" style="width:40px; height:40px; object-fit:cover; border-radius:4px;"/>` : 'No image'}
          </td>
          <td>
            <button class="btn-small" onclick="editSketch(${s.id})">Edit</button>
            <button class="btn-small" onclick="deleteSketch(${s.id})">Delete</button>
          </td>
        </tr>
      `).join('');
    });
}

function editSketch(id) {
  const row = document.getElementById('sketch-row-' + id);
  if (!row) return;
  const titleCell = row.querySelector('.sketch-title');
  const artistCell = row.querySelector('.sketch-artist');
  const priceCell = row.querySelector('.sketch-price');
  const categoryCell = row.querySelector('.sketch-category');

  const title = titleCell.innerText.trim();
  const artist = artistCell.innerText.trim();
  const price = priceCell.innerText.trim();
  const category = categoryCell.innerText.trim();

  titleCell.innerHTML = `<input type="text" id="edit-title-${id}" value="${title}" style="width:100px; background:#1e1e1e; border:1px solid #555; color:#fff; padding:4px;"/>`;
  artistCell.innerHTML = `<input type="text" id="edit-artist-${id}" value="${artist}" style="width:100px; background:#1e1e1e; border:1px solid #555; color:#fff; padding:4px;"/>`;
  priceCell.innerHTML = `<input type="number" id="edit-price-${id}" value="${price}" style="width:80px; background:#1e1e1e; border:1px solid #555; color:#fff; padding:4px;"/>`;
  categoryCell.innerHTML = `<select id="edit-category-${id}" style="background:#1e1e1e; border:1px solid #555; color:#fff; padding:4px;">
    <option value="portrait" ${category === 'portrait' ? 'selected' : ''}>Portrait</option>
    <option value="anime" ${category === 'anime' ? 'selected' : ''}>Anime Art</option>
    <option value="closeup" ${category === 'closeup' ? 'selected' : ''}>Close-Up Sketch</option>
  </select>`;

  const actionCell = row.querySelector('td:last-child');
  actionCell.innerHTML = `
    <div style="display:flex; flex-direction:column; gap:6px;">
      <input type="file" id="edit-image-${id}" style="color:#aaa; font-size:0.7rem; max-width:130px;"/>
      <div style="display:flex; gap:4px;">
        <button class="btn-small" onclick="saveEditSketch(${id})">Save</button>
        <button class="btn-small" onclick="cancelEdit(${id})">Cancel</button>
      </div>
    </div>
  `;
}

function saveEditSketch(id) {
  const title = document.getElementById('edit-title-' + id).value.trim();
  const artist = document.getElementById('edit-artist-' + id).value.trim();
  const price = document.getElementById('edit-price-' + id).value;
  const category = document.getElementById('edit-category-' + id).value;
  const imageInput = document.getElementById('edit-image-' + id);
  const imageFile = imageInput ? imageInput.files[0] : null;

  if (!title || !price) {
    alert('Title and price are required.');
    return;
  }

  const formData = new FormData();
  formData.append('id', id);
  formData.append('title', title);
  formData.append('artist', artist);
  formData.append('price', price);
  formData.append('category', category);
  if (imageFile) formData.append('image', imageFile);

  fetch('../php/update-sketch.php', { method: 'POST', body: formData })
    .then(r => r.json())
    .then(data => {
      if (data.success) {
        loadSketchesTable();
        loadStats();
      } else {
        alert('Error: ' + data.error);
      }
    });
}

function cancelEdit(id) {
  loadSketchesTable();
}

function deleteSketch(id) {
  if (!confirm('Delete this sketch?')) return;
  fetch(`../php/delete-sketch.php?id=${id}`)
    .then(r => r.json())
    .then(data => {
      if (data.success) {
        loadSketchesTable();
        loadStats();
      } else {
        alert(data.error);
      }
    });
}

function addSketch() {
  const title = document.getElementById('newSketchTitle').value;
  const price = document.getElementById('newSketchPrice').value;
  const artist = document.getElementById('newSketchArtist').value;
  const category = document.getElementById('newSketchCategory').value;
  const imageFile = document.getElementById('newSketchImage').files[0];
  const extra1 = document.getElementById('newSketchExtra1').files[0];
  const extra2 = document.getElementById('newSketchExtra2').files[0];
  const extra3El = document.getElementById('newSketchExtra3');
  const extra3 = extra3El ? extra3El.files[0] : null;
  const msgDiv = document.getElementById('addSketchMsg');

  if (!title || !price) {
    msgDiv.innerHTML = '<p style="color:#ff4444;">Title and price required.</p>';
    return;
  }

  const formData = new FormData();
  formData.append('title', title);
  formData.append('price', price);
  formData.append('artist', artist);
  formData.append('category', category);
  if (imageFile) formData.append('image', imageFile);
  if (extra1) formData.append('extra1', extra1);
  if (extra2) formData.append('extra2', extra2);
  if (extra3) formData.append('extra3', extra3);

  fetch('../php/add-sketch.php', { method: 'POST', body: formData })
    .then(r => r.json())
    .then(data => {
      if (data.success) {
        msgDiv.innerHTML = '<div class="success-box">✅ Sketch added! (' + data.count + ' images)</div>';
        loadSketchesTable();
        loadStats();
      } else {
        msgDiv.innerHTML = '<p style="color:#ff4444;">❌ ' + (data.error || 'Error') + '</p>';
      }
    });
}

function loadStats() {
  fetch('../php/stats.php')
    .then(r => r.json())
    .then(stats => {
      const totalOrders = document.getElementById('totalOrders');
      const totalRevenue = document.getElementById('totalRevenue');
      const totalUsers = document.getElementById('totalUsers');
      const totalSketches = document.getElementById('totalSketches');
      if (totalOrders) totalOrders.innerText = stats.orders;
      if (totalRevenue) totalRevenue.innerText = 'PKR ' + stats.revenue;
      if (totalUsers) totalUsers.innerText = stats.users;
      if (totalSketches) totalSketches.innerText = stats.sketches;
    });
}

function deleteUser(userId) {
  if (!confirm('Delete this user?')) return;
  fetch(`../php/delete-user.php?id=${userId}`)
    .then(r => r.json())
    .then(data => {
      if (data.success) location.reload();
      else alert(data.error);
    });
}

function deleteOrder(orderId) {
  if (!confirm('Delete this order?')) return;
  fetch(`../php/delete-order.php?id=${orderId}`)
    .then(r => r.json())
    .then(data => {
      if (data.success) location.reload();
      else alert(data.error);
    });
}

function updateOrderStatus(orderId, status) {
  const formData = new FormData();
  formData.append('id', orderId);
  formData.append('status', status);
  fetch('../php/update-order.php', { method: 'POST', body: formData })
    .then(r => r.json())
    .then(data => {
      if (data.success) location.reload();
      else alert(data.error);
    });
}

// ---------- PAGE INITIALIZATION ----------
(function() {
  if (document.getElementById('featuredGrid')) initHomepage();
  if (document.getElementById('galleryGrid') && !document.getElementById('featuredGrid')) initGallery();
  if (document.getElementById('sketchPrice') && !document.getElementById('featuredGrid') && !document.getElementById('galleryGrid')) initDetailPage();
  if (document.getElementById('oPlan')) initCustomOrderPage();
  if (document.getElementById('lEmail')) checkAuthRedirect();
  if (document.getElementById('rName')) checkAuthRedirect();
  if (document.getElementById('welcomeMsg')) initDashboard();
  if (document.getElementById('orderDetailContainer')) initOrderDetail();
  if (document.querySelector('.admin-container')) initAdminPage();
  if (document.getElementById('currentPass')) { if (!checkAuth()) return; }
})();