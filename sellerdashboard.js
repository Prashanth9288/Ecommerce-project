// 🔁 NAVIGATION BETWEEN SECTIONS
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

  // ✏️ EDIT PRODUCT
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

  // 🗑️ DELETE PRODUCT
  function deleteProduct(id) {
    if (confirm("Delete this product?")) {
      db.ref(`products/${id}`).remove();
    }
  }

  // 📦 LOAD ORDERS
  function loadOrders() {
    db.ref("orders").on("value", snap => {
      const orders = snap.val();
      orderList.innerHTML = "";
      for (let id in orders) {
        const o = orders[id];
        const card = document.createElement("div");
        card.className = "order-card";
        card.innerHTML = `
          <p><strong>Customer:</strong> ${o.customer}</p>
          <p><strong>Product:</strong> ${o.product}</p>
          <p><strong>Quantity:</strong> ${o.quantity || 1}</p>
          <p><strong>Total:</strong> ₹${o.totalAmount}</p>
          <p>
            <strong>Status:</strong>
            <select class="status-select" onchange="updateStatus('${id}', this.value)">
              <option value="Pending" ${o.status === "Pending" ? "selected" : ""}>Pending</option>
              <option value="Shipped" ${o.status === "Shipped" ? "selected" : ""}>Shipped</option>
              <option value="Delivered" ${o.status === "Delivered" ? "selected" : ""}>Delivered</option>
            </select>
          </p>
        `;
        orderList.appendChild(card);
      }
    });
  }

  // 📝 UPDATE ORDER STATUS
  function updateStatus(id, status) {
    db.ref(`orders/${id}/status`).set(status);
  }

  // ⚙️ LOAD SETTINGS
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

  // 📊 LOAD ANALYTICS
  function loadAnalytics() {
    db.ref("orders").on("value", snapshot => {
      const orders = snapshot.val() || {};
      let total = 0;
      let count = 0;
      for (let id in orders) {
        const order = orders[id];
        if (order.totalAmount) {
          total += parseFloat(order.totalAmount);
          count++;
        }
      }
      document.getElementById("totalOrders").textContent = count;
      document.getElementById("totalRevenue").textContent = `₹${total.toFixed(2)}`;
      document.getElementById("avgOrder").textContent = count ? `₹${(total / count).toFixed(2)}` : "₹0";
    });
  }

  // 🚨 LOAD STOCK ALERTS
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

  // 📜 RECENT ORDERS IN OVERVIEW
  function loadRecentOrders() {
    db.ref("orders").once("value", snap => {
      const orders = snap.val() || {};
      const recentOrdersDiv = document.getElementById("recentOrders");
      const entries = Object.entries(orders).slice(-5).reverse();

      recentOrdersDiv.innerHTML = "";
      for (let [id, order] of entries) {
        const item = document.createElement("div");
        item.className = "order-entry";
        item.innerHTML = `
          <div class="info">
            <strong>${order.product}</strong>
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

  // ✅ ON PAGE LOAD
  document.addEventListener("DOMContentLoaded", () => {
    loadOrders();
    loadSettings();
    loadAnalytics();
    loadStockAlerts();
    loadRecentOrders();
  });