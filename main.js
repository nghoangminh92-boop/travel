// ===============================
// MAIN INIT
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  initMenu();
  initScrollReveal();
  initFilters();
  initModal();
  initForm();
  setFormDate();
  sortPosts();
  renderDates();
  limitImages();

  initImageExpand(); // ✅ THÊM DÒNG NÀY
});

// ===============================
// 1. MOBILE MENU
// ===============================
function initMenu() {
  const menuBtn = document.getElementById("menu-btn");
  const navLinks = document.getElementById("nav-links");

  if (!menuBtn || !navLinks) return;

  const icon = menuBtn.querySelector("i");

  menuBtn.onclick = () => {
    navLinks.classList.toggle("open");
    icon.className = navLinks.classList.contains("open")
      ? "ri-close-line"
      : "ri-menu-line";
  };

  document.querySelectorAll("#nav-links a").forEach((link) => {
    link.onclick = () => {
      navLinks.classList.remove("open");
      icon.className = "ri-menu-line";
    };
  });
}

// ===============================
// 2. SCROLL REVEAL
// ===============================
function initScrollReveal() {
  if (typeof ScrollReveal === "undefined") return;

  const sr = ScrollReveal({
    distance: "50px",
    duration: 1000,
  });

  sr.reveal(".header__container h1", { delay: 200 });
  sr.reveal(".feature__card", { interval: 200 });
  sr.reveal(".destination__card", { interval: 200 });
}

// ===============================
// 3. FILTER + SEARCH (FIX FULL)
// ===============================
function initFilters() {
  const locationFilter = document.getElementById("locationFilter");
  const countryFilter = document.getElementById("countryFilter");
  const typeFilter = document.getElementById("typeFilter");
  const searchInput = document.getElementById("searchInput");

  function applyAllFilters() {
    const location = locationFilter?.value.toLowerCase() || "all";
    const country = countryFilter?.value.toLowerCase() || "all";
    const type = typeFilter?.value.toLowerCase() || "all";
    const keyword = searchInput?.value.toLowerCase() || "";

    document.querySelectorAll(".feed__card").forEach((card) => {
      const loc = (card.dataset.location || "").toLowerCase();
      const ctry = (card.dataset.country || "").toLowerCase();
      const typ = (card.dataset.type || "").toLowerCase();

      // 🔥 FIX Git (innerText lỗi → dùng textContent)
      const text = (card.textContent + loc + ctry + typ).toLowerCase();

      const show =
        (location === "all" || loc === location) &&
        (country === "all" || ctry === country) &&
        (type === "all" || typ === type) &&
        text.includes(keyword);

      card.style.display = show ? "block" : "none";
    });
  }

  // ===============================
  // EVENT
  // ===============================
  locationFilter?.addEventListener("change", applyAllFilters);

  countryFilter?.addEventListener("change", () => {
    filterCitiesByCountry();
    applyAllFilters();
  });

  typeFilter?.addEventListener("change", applyAllFilters);
  searchInput?.addEventListener("input", applyAllFilters);

  // chạy lần đầu
  filterCitiesByCountry();
  applyAllFilters();
}

// ===============================
// 4. FILTER CITY THEO COUNTRY
// ===============================
function filterCitiesByCountry() {
  const country = document.getElementById("countryFilter")?.value.toLowerCase();

  const citySelect = document.getElementById("locationFilter");

  if (!citySelect) return;

  citySelect.querySelectorAll("option").forEach((opt) => {
    const c = opt.dataset.country;

    // nếu ALL → hiện hết
    if (!c || country === "all") {
      opt.style.display = "block";
    } else {
      opt.style.display = c.toLowerCase() === country ? "block" : "none";
    }
  });

  // reset city
  citySelect.value = "all";
}

// ===============================
// 5. MODAL
// ===============================
function initModal() {
  const modal = document.getElementById("postModal");
  const modalBody = document.getElementById("modalBody");
  const closeBtn = document.querySelector(".close");

  if (!modal || !modalBody) return;

  // dùng event delegation (fix luôn lỗi sau này thêm post mới)
  document.addEventListener("click", (e) => {
    if (!e.target.classList.contains("open-post")) return;

    const card = e.target.closest(".feed__card");
    if (!card) return;

    // lấy title
    const title = card.querySelector(".feed__header p")?.innerText || "";

    // lấy content
    const content = card.querySelector(".feed__content")?.innerHTML || "";

    // 🔥 LẤY ẢNH CHUẨN (fix lỗi của bạn)
    const images = card.querySelectorAll("img");

    let imgHTML = "";
    images.forEach((img) => {
      imgHTML += `<img src="${img.src}" style="width:100%;margin-bottom:10px;border-radius:10px;">`;
    });

    modalBody.innerHTML = `
      <div class="modal-post">
        <h2>${title}</h2>
        ${imgHTML}
        <div class="modal-text">${content}</div>
      </div>
    `;

    modal.style.display = "block";
  });

  // đóng modal
  closeBtn.onclick = () => (modal.style.display = "none");

  window.onclick = (e) => {
    if (e.target === modal) modal.style.display = "none";
  };
}
// ===============================
// 6. FORM
// ===============================
function initForm() {
  const form = document.getElementById("shareForm");
  const msg = document.getElementById("successMessage");

  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(form.action || "#", {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" },
      });

      msg.textContent = res.ok ? "送信成功 🎉" : "送信失敗 ❌";

      if (res.ok) form.reset();
    } catch {
      msg.textContent = "エラー ❌";
    }
  });
}

// ===============================
// 7. DATE
// ===============================
function formatTimeAgo(dateString) {
  const postDate = new Date(dateString);
  const now = new Date();
  const diff = Math.floor((now - postDate) / (1000 * 60 * 60 * 24));

  if (diff === 0) return "今日";
  if (diff === 1) return "昨日";
  if (diff < 7) return diff + "日前";

  return postDate.toLocaleDateString("ja-JP");
}

function renderDates() {
  document.querySelectorAll(".feed__card").forEach((card) => {
    const date = card.dataset.date;
    const el = card.querySelector(".post-date");
    if (date && el) el.textContent = formatTimeAgo(date);
  });
}

// ===============================
// 8. SORT
// ===============================
function sortPosts() {
  const grid = document.querySelector(".feed__grid");
  if (!grid) return;

  const cards = Array.from(grid.children);

  cards.sort((a, b) => new Date(b.dataset.date) - new Date(a.dataset.date));

  cards.forEach((card) => grid.appendChild(card));
}

// ===============================
// 9. DATE FORM
// ===============================
function setFormDate() {
  const input = document.getElementById("postDate");
  if (input) input.value = new Date().toISOString();
}

// ===============================
// 10. LIMIT IMAGE
// ===============================
function limitImages() {
  document.querySelectorAll(".feed__images").forEach((container) => {
    const imgs = container.querySelectorAll("img");

    if (imgs.length > 4) {
      container.classList.add("has-more");
      container.setAttribute("data-more", `+${imgs.length - 4}`);
    }
  });
}

// ===============================
// 11. CLICK IMAGE EXPAND
// ===============================

function initImageExpand() {
  document.querySelectorAll(".feed__images").forEach((el) => {
    el.addEventListener("click", () => {
      el.classList.toggle("expanded");
    });
  });
}
