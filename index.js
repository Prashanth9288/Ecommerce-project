const features = [
  {
    title: "Truly Local",
    description: "Every business on our platform is locally owned and operated. We verify each listing to ensure authenticity and community connection.",
    icon: "fa-house",
    link: "truly-local.html"
  },
  {
    title: "Trusted Reviews",
    description: "Read genuine reviews from your neighbors. Our community-driven rating system helps you make informed decisions.",
    icon: "fa-star",
    link: "trusted-reviews.html"
  },
  {
    title: "Secure Payments",
    description: "Safe and secure payment processing with buyer protection. Support local businesses with confidence.",
    icon: "fa-lock",
    link: "secure-payments.html"
  },
  {
    title: "Easy Discovery",
    description: "Find exactly what you need with our smart search and location-based recommendations. Shopping local made simple.",
    icon: "fa-magnifying-glass",
    link: "easy-discovery.html"
  },
  {
    title: "Community First",
    description: "Every purchase strengthens your local economy. Connect with business owners and build lasting relationships.",
    icon: "fa-handshake",
    link: "community-first.html"
  },
  {
    title: "Business Growth",
    description: "Powerful tools for local businesses to reach customers, manage inventory, and grow their community presence.",
    icon: "fa-rocket",
    link: "business-growth.html"
  },
];

const container = document.getElementById("features-grid");

features.forEach((feature) => {
  const card = document.createElement("div");
  card.className = "feature-card";
  card.onclick = () => {
    window.location.href = feature.link;
  };

  card.innerHTML = `
    <div class="icon-wrapper">
      <i class="fa-solid ${feature.icon}"></i>
    </div>
    <div class="feature-title">${feature.title}</div>
    <div class="feature-description">${feature.description}</div>
  `;

  container.appendChild(card);
});
