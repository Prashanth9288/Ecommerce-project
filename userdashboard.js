 let products = {}, cart = {}, wishlist = {};
    const productList = document.getElementById("userProductList");
    const categoryFilter = document.getElementById("categoryFilter");
    const sortFilter = document.getElementById("sortFilter");

    function updateCounts() {
      document.getElementById("cartCount").textContent = `🛍️ Cart: ${Object.keys(cart).length}`;
      document.getElementById("wishlistCount").textContent = `❤️ Wishlist: ${Object.keys(wishlist).length}`;
    }

    function syncCart() {
      const uid = auth.currentUser?.uid;
      if (uid) {
        db.ref("carts/" + uid).set(cart);
        db.ref("wishlists/" + uid).set(wishlist);
      }
    }

    function renderProducts(category = "", sort = "") {
      productList.innerHTML = "";
      let items = Object.entries(products);

      if (category) items = items.filter(([_, p]) => p.category === category);
      if (sort === "priceLow") items.sort((a,b) => a[1].price - b[1].price);
      if (sort === "priceHigh") items.sort((a,b) => b[1].price - a[1].price);

      for (let [id, p] of items) {
        const card = document.createElement("div");
        card.className = "product-card";
        card.innerHTML = `
          <img src="${p.imageURL}" />
          <h3>${p.title}</h3>
          <p>${p.description}</p>
          <p><strong>₹${p.price}</strong> (${p.discount || 0}% OFF)</p>
          <p>Rating: ${p.rating || 'No rating'}</p>
          <div class="buttons">
            <button class="btn add-cart-btn" onclick="addToCart('${id}')">Add to Cart</button>
            <button class="btn remove-btn" onclick="removeFromCart('${id}')">Remove Cart</button>
            <button class="btn wishlist-btn" onclick="addToWishlist('${id}')">Add to Wishlist</button>
            <button class="btn remove-btn" onclick="removeFromWishlist('${id}')">Remove Wishlist</button>
          </div>
        `;
        productList.appendChild(card);
      }
    }

    function showCheckout() {
      const screen = document.getElementById("checkoutScreen");
      const items = document.getElementById("checkoutItems");
      let total = 0;
      items.innerHTML = "";

      for (let id in cart) {
        const p = products[id];
        const qty = cart[id];
        const price = parseFloat(p.price);
        total += price * qty;
        const div = document.createElement("div");
        div.innerHTML = `<p><strong>${p.title}</strong> × ${qty} = ₹${qty * price}</p>`;
        items.appendChild(div);
      }
      document.getElementById("checkoutTotal").textContent = total;
      screen.style.display = 'block';
    }

    function hideCheckout() {
      document.getElementById("checkoutScreen").style.display = 'none';
    }

    function showWishlist() {
      const screen = document.getElementById("wishlistScreen");
      const items = document.getElementById("wishlistItems");
      items.innerHTML = "";

      for (let id in wishlist) {
        const p = products[id];
        const div = document.createElement("div");
        div.innerHTML = `<p>❤️ ${p.title}</p>`;
        items.appendChild(div);
      }
      screen.style.display = 'block';
    }

    function hideWishlist() {
      document.getElementById("wishlistScreen").style.display = 'none';
    }
    function placeOrder() {
      const uid = auth.currentUser?.uid;

  const displayName = auth.currentUser?.displayName || "Anonymous";

      const timestamp = Date.now();

      for (let id in cart) {
        const p = products[id];
        const sellerId = p.sellerId || 'admin';
        db.ref("orders").push({
  userId: uid,
  sellerId: sellerId, // required for filtering in seller dashboard
  productId: id,
  title: p.title,
  price: p.price,
  quantity: cart[id],
  totalAmount: p.price * cart[id],
  status: "Pending",
  timestamp
});

      }

      cart = {};
      updateCounts();
      syncCart();
      hideCheckout();
      alert("✅ Order Placed!");
    }

    function addToCart(id) {
      cart[id] = (cart[id] || 0) + 1;
      updateCounts(); syncCart();
    }

    function removeFromCart(id) {
      delete cart[id];
      updateCounts(); syncCart();
    }

    function addToWishlist(id) {
      wishlist[id] = true;
      updateCounts(); syncCart();
    }

    function removeFromWishlist(id) {
      delete wishlist[id];
      updateCounts(); syncCart();
    }

    function logoutUser() {
      auth.signOut().then(() => window.location.href = "index.html");
    }

    function toggleDarkMode() {
      document.body.classList.toggle("dark");
    }

    db.ref("products").on("value", snapshot => {
      products = snapshot.val() || {};
      const categories = new Set(Object.values(products).map(p => p.category).filter(Boolean));
      categoryFilter.innerHTML = `<option value="">All Categories</option>` +
        [...categories].map(c => `<option value="${c}">${c}</option>`).join('');
      renderProducts();
    });

    categoryFilter.addEventListener("change", () => renderProducts(categoryFilter.value, sortFilter.value));
    sortFilter.addEventListener("change", () => renderProducts(categoryFilter.value, sortFilter.value));

    auth.onAuthStateChanged(user => {
      if (!user) {
        window.location.href = "index.html";
      } else {
        const uid = user.uid;
        db.ref("carts/" + uid).once("value", snap => cart = snap.val() || {});
        db.ref("wishlists/" + uid).once("value", snap => wishlist = snap.val() || {});
        updateCounts();
      }
    });