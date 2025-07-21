// ✅ Fixed sellerdashboard.js with real-time updates and accurate analytics

// 🔁 NAVIGATION
function navigate(section) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.getElementById(section + 'Section').classList.add('active');
}

// ☁️ CLOUDINARY UPLOAD
function uploadToCloudinary() {
  const file = document.getElementById("productImageInput").files[0];
  if (!file) return alert("Choose an image first.");
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "product_images");
  const cloudName = "dwlahv9mv";
  fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body: formData
  })
    .then(res => res.json())
    .then(data => {
      imageURL.value = data.secure_url;
      imgPreview.src = data.secure_url;
      alert("✅ Image uploaded!");
    })
    .catch(() => alert("❌ Upload failed!"));
}

// 📥 ADD OR UPDATE PRODUCT
productForm.addEventListener("submit", async e => {
  e.preventDefault();
  const id = editId.value;
  const product = {
    title: title.value,
    description: description.value,
    price: parseFloat(price.value),
    category: category.value,
    discount: parseFloat(discount.value) || 0,
    stock: parseInt(stock.value),
    imageURL: imageURL.value,
    rating: 0
  };
  if (id) {
    await db.ref(`products/${id}`).update(product);
    submitBtn.textContent = "Add Product";
    formTitle.textContent = "Add Product";
  } else {
    await db.ref("products").push(product);
  }
  productForm.reset();
  imgPreview.src = "";
  imageURL.value = "";
  editId.value = "";
});

// 🔄 LOAD PRODUCTS
db.ref("products").on("value", snapshot => {
  productList.innerHTML = "";
  const data = snapshot.val();
  for (let id in data) {
    const p = data[id];
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <img src="${p.imageURL}" />
      <h3>${p.title}</h3>
      <p>${p.description}</p>
      <p>₹${p.price} | ${p.category}</p>
      <p>Discount: ${p.discount}%</p>
      <p><strong>Stock:</strong> ${p.stock || 0}</p>
      <button class="edit-btn" onclick="editProduct('${id}')">Edit</button>
      <button class="delete-btn" onclick="deleteProduct('${id}')">Delete</button>
    `;
    productList.appendChild(card);
  }
});

function editProduct(id) {
  db.ref(`products/${id}`).once("value", snap => {
    const p = snap.val();
    title.value = p.title;
    description.value = p.description;
    price.value = p.price;
    category.value = p.category;
    discount.value = p.discount;
    stock.value = p.stock;
    imageURL.value = p.imageURL;
    imgPreview.src = p.imageURL;
    editId.value = id;
    submitBtn.textContent = "Update Product";
    formTitle.textContent = "Edit Product";
  });
}

function deleteProduct(id) {
  if (confirm("Delete this product?")) {
    db.ref(`products/${id}`).remove();
  }
}

// 📦 REALTIME ORDER LOADER
function loadOrdersRealtime() {
  const currentSellerId = "admin"; // Replace with auth UID if available
  db.ref("orders").on("child_added", (snapshot) => {
    const o = snapshot.val();
    if (o.sellerId !== currentSellerId) return;

    const card = document.createElement("div");
    card.className = "order-card";
    card.innerHTML = `
      <p><strong>Customer ID:</strong> ${o.userId}</p>
      <p><strong>Product:</strong> ${o.title}</p>
      <p><strong>Quantity:</strong> ${o.quantity || 1}</p>
      <p><strong>Total:</strong> ₹${o.totalAmount}</p>
      <p>
        <strong>Status:</strong>
        <select class="status-select" onchange="updateStatus('${snapshot.key}', this.value)">
          <option value="Pending" ${o.status === "Pending" ? "selected" : ""}>Pending</option>
          <option value="Shipped" ${o.status === "Shipped" ? "selected" : ""}>Shipped</option>
          <option value="Delivered" ${o.status === "Delivered" ? "selected" : ""}>Delivered</option>
        </select>
      </p>
    `;
    orderList.prepend(card);
  });
}

function updateStatus(id, status) {
  db.ref(`orders/${id}/status`).set(status);
}

function loadSettings() {
  db.ref("settings").once("value", snap => {
    const s = snap.val() || {};
    sellerName.value = s.sellerName || "";
    email.value = s.email || "";
    shopDesc.value = s.shopDesc || "";
  });
}

settingsForm.addEventListener("submit", e => {
  e.preventDefault();
  const settings = {
    sellerName: sellerName.value,
    email: email.value,
    shopDesc: shopDesc.value
  };
  db.ref("settings").set(settings);
  alert("✅ Settings saved!");
});

function loadAnalytics() {
  const currentSellerId = "admin"; // match seller ID
  db.ref("orders").on("value", snapshot => {
    const orders = snapshot.val() || {};
    let total = 0;
    let count = 0;
    for (let id in orders) {
      const order = orders[id];
      if (order.sellerId === currentSellerId && order.totalAmount) {
        total += parseFloat(order.totalAmount);
        count++;
      }
    }
    document.getElementById("totalOrders").textContent = count;
    document.getElementById("totalRevenue").textContent = `₹${total.toFixed(2)}`;
    document.getElementById("avgOrder").textContent = count ? `₹${(total / count).toFixed(2)}` : "₹0";
  });
}

function loadStockAlerts() {
  db.ref("products").once("value", snapshot => {
    const products = snapshot.val() || {};
    const alertContainer = document.getElementById("stockAlerts");
    alertContainer.innerHTML = "";

    for (let id in products) {
      const p = products[id];
      if (p.stock <= 5) {
        const alert = document.createElement("div");
        alert.className = "stock-alert";
        alert.innerHTML = `
          <div class="details">
            <strong>${p.title}</strong>
            <div>Only ${p.stock} left in stock</div>
          </div>
          <img src="${p.imageURL}" />
        `;
        alertContainer.appendChild(alert);
      }
    }

    if (!alertContainer.innerHTML) {
      alertContainer.innerHTML = "<p>No stock alerts 📦</p>";
    }
  });
}

function loadRecentOrders() {
  const currentSellerId = "admin";
  db.ref("orders").once("value", snap => {
    const orders = snap.val() || {};
    const recentOrdersDiv = document.getElementById("recentOrders");
    const entries = Object.entries(orders).filter(([_, o]) => o.sellerId === currentSellerId).slice(-5).reverse();

    recentOrdersDiv.innerHTML = "";
    for (let [id, order] of entries) {
      const item = document.createElement("div");
      item.className = "order-entry";
      item.innerHTML = `
        <div class="info">
          <strong>${order.title}</strong>
          <small>Qty: ${order.quantity || 1}</small>
        </div>
        <span class="${order.status.toLowerCase()}">${order.status}</span>
      `;
      recentOrdersDiv.appendChild(item);
    }

    if (entries.length === 0) {
      recentOrdersDiv.innerHTML = "<p>No recent orders 📭</p>";
    }
  });
}

function logout() {
  if (confirm("Logout?")) {
    window.location.href = "/index.html";
  }
}

// ✅ INITIALIZE

document.addEventListener("DOMContentLoaded", () => {
  loadOrdersRealtime();
  loadSettings();
  loadAnalytics();
  loadStockAlerts();
  loadRecentOrders();
});
