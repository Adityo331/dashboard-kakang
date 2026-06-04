// ================= ACTIVITY LOG SYSTEM =================

function getActivities() {
  return JSON.parse(localStorage.getItem("activities")) || [];
}

function saveActivities(activities) {
  (window.friSetItem || localStorage.setItem.bind(localStorage))("activities", JSON.stringify(activities));
}

function addActivity(role, action, detail, module = "BHP") {
  const activities = getActivities();

  activities.push({
    id: Date.now() + Math.floor(Math.random() * 1000),
    role,
    action,
    detail,
    module,
    createdAt: new Date().toISOString(),
  });

  saveActivities(activities);
}

function formatActivityTime(dateString) {
  const date = new Date(dateString);
  return date.toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
