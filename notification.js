// ================= NOTIFICATION SYSTEM =================

function getLoginUserNotif() {
  return JSON.parse(sessionStorage.getItem("loginUser") || localStorage.getItem("loginUser")) || {};
}

function getNotifications() {
  return JSON.parse(localStorage.getItem("notifications")) || [];
}

function saveNotifications(notifications) {
  (window.friSetItem || localStorage.setItem.bind(localStorage))("notifications", JSON.stringify(notifications));

  // Sinkronisasi cepat untuk tab yang sedang terbuka.
  window.dispatchEvent(new Event("notifications-updated"));

  // BroadcastChannel membuat notifikasi lebih cepat antar tab browser modern.
  try {
    const channel = new BroadcastChannel("fri-dashboard-notifications");
    channel.postMessage({ type: "notifications-updated" });
    channel.close();
  } catch (error) {
    // Abaikan jika browser tidak mendukung BroadcastChannel.
  }
}

function addNotification(
  targetRole,
  title,
  message,
  link = "",
  targetUsername = "",
) {
  const notifications = getNotifications();

  notifications.push({
    id: Date.now() + Math.floor(Math.random() * 1000),
    targetRole,
    targetUsername,
    title,
    message,
    link,
    isRead: false,
    createdAt: new Date().toISOString(),
  });

  saveNotifications(notifications);
  renderNotificationBadge();
  renderNotificationList();
}

function getRoleNotifications() {
  const loginUser = getLoginUserNotif();
  const role = loginUser.role;
  const username = loginUser.username;

  return getNotifications()
    .filter((notif) => {
      const roleMatch = notif.targetRole === role;

      const userMatch = notif.targetUsername
        ? notif.targetUsername === username
        : true;

      return roleMatch && userMatch;
    })
    .reverse();
}

// ================= BADGE =================

function renderNotificationBadge() {
  const notifBadge = document.getElementById("notifBadge");
  if (!notifBadge) return;

  const unreadCount = getRoleNotifications().filter(
    (notif) => !notif.isRead,
  ).length;

  notifBadge.innerText = unreadCount;
  notifBadge.style.display = unreadCount > 0 ? "inline-flex" : "none";
}

// ================= LIST =================

function renderNotificationList() {
  const list = document.getElementById("notificationList");
  if (!list) return;

  const notifications = getRoleNotifications();

  list.innerHTML = "";

  if (notifications.length === 0) {
    list.innerHTML = `
      <p style="color:#777; padding:12px;">
        Belum ada notifikasi.
      </p>
    `;
    return;
  }

  notifications.forEach((notif) => {
    list.innerHTML += `
      <div class="notif-item ${notif.isRead ? "" : "unread"}"
        onclick="readNotification(${notif.id}, '${notif.link || ""}')">
        <h4>${notif.title}</h4>
        <p>${notif.message}</p>
        <small>${formatNotifTime(notif.createdAt)}</small>
      </div>
    `;
  });
}

// ================= PANEL =================

function openNotificationPanel() {
  const panel = document.getElementById("notificationPanel");
  if (!panel) return;

  renderNotificationList();
  panel.classList.toggle("hidden");
}

function closeNotificationPanel() {
  const panel = document.getElementById("notificationPanel");
  if (!panel) return;

  panel.classList.add("hidden");
}

// ================= READ =================

function readNotification(id, link) {
  const updated = getNotifications().map((notif) =>
    notif.id === id ? { ...notif, isRead: true } : notif,
  );

  saveNotifications(updated);

  renderNotificationBadge();
  renderNotificationList();

  if (link) {
    window.location.href = link;
  } else {
    closeNotificationPanel();
  }
}

function markAllNotificationsRead() {
  const loginUser = getLoginUserNotif();
  const role = loginUser.role;
  const username = loginUser.username;

  const updated = getNotifications().map((notif) => {
    const roleMatch = notif.targetRole === role;

    const userMatch = notif.targetUsername
      ? notif.targetUsername === username
      : true;

    return roleMatch && userMatch ? { ...notif, isRead: true } : notif;
  });

  saveNotifications(updated);

  renderNotificationBadge();
  renderNotificationList();
}

// ================= FORMAT TIME =================

function formatNotifTime(dateString) {
  const date = new Date(dateString);

  return date.toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ================= REAL TIME UPDATE =================

window.addEventListener("notifications-updated", function () {
  renderNotificationBadge();

  const panel = document.getElementById("notificationPanel");
  if (panel && !panel.classList.contains("hidden")) {
    renderNotificationList();
  }
});

try {
  const notificationChannel = new BroadcastChannel("fri-dashboard-notifications");
  notificationChannel.onmessage = function (event) {
    if (event.data && event.data.type === "notifications-updated") {
      renderNotificationBadge();

      const panel = document.getElementById("notificationPanel");
      if (panel && !panel.classList.contains("hidden")) {
        renderNotificationList();
      }
    }
  };
} catch (error) {
  // Abaikan jika browser tidak mendukung BroadcastChannel.
}


window.addEventListener("storage", function (event) {
  if (event.key === "notifications") {
    renderNotificationBadge();

    const panel = document.getElementById("notificationPanel");

    if (panel && !panel.classList.contains("hidden")) {
      renderNotificationList();
    }
  }
});

setInterval(() => {
  renderNotificationBadge();

  const panel = document.getElementById("notificationPanel");

  if (panel && !panel.classList.contains("hidden")) {
    renderNotificationList();
  }
}, 1000);

// ================= INIT =================

document.addEventListener("DOMContentLoaded", () => {
  renderNotificationBadge();
  renderNotificationList();
});
