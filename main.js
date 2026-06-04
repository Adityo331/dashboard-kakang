function logout() {
  window.location.href = "../index.html";
}


// ================= RESPONSIVE SIDEBAR =================

function toggleSidebar() {
  const sidebar = document.querySelector(".sidebar");
  const overlay = document.querySelector(".mobile-sidebar-overlay");

  if (sidebar) sidebar.classList.toggle("active");
  if (overlay) overlay.classList.toggle("active");
}

document.addEventListener("click", function (event) {
  const sidebar = document.querySelector(".sidebar");
  const overlay = document.querySelector(".mobile-sidebar-overlay");
  const menuButton = document.querySelector(".mobile-menu-btn");

  if (!sidebar || !sidebar.classList.contains("active")) return;

  const clickedInsideSidebar = sidebar.contains(event.target);
  const clickedMenuButton = menuButton && menuButton.contains(event.target);

  if (!clickedInsideSidebar && !clickedMenuButton) {
    sidebar.classList.remove("active");
    if (overlay) overlay.classList.remove("active");
  }
});

window.addEventListener("resize", function () {
  if (window.innerWidth > 768) {
    const sidebar = document.querySelector(".sidebar");
    const overlay = document.querySelector(".mobile-sidebar-overlay");

    if (sidebar) sidebar.classList.remove("active");
    if (overlay) overlay.classList.remove("active");
  }
});
