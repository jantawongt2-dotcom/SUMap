// =====================================================
//  ส่วนที่ 1: ระบบสมาชิก (ใช้ได้ทุกหน้า)
// =====================================================
const USERS_KEY = "sumap_users";
const CURRENT_KEY = "sumap_current";
 
function getUsers() {
  return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
}
 
function getCurrentUser() {
  return JSON.parse(localStorage.getItem(CURRENT_KEY));
}
 
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
 
function showError(msg) {
  const box = document.getElementById("errorMsg");
  if (box) box.textContent = msg;
}
 
// ทำให้ช่องที่ระบุเป็นสีแดง (ส่ง id ได้หลายตัว)
function markError(...ids) {
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.add("input-error");
  });
}
 
// ล้างสีแดงและข้อความ error ทั้งหมด
function clearErrors() {
  document.querySelectorAll(".auth-input").forEach(el => el.classList.remove("input-error"));
  showError("");
}
 
// พิมพ์ในช่องไหน ช่องนั้นหายแดงทันที
document.querySelectorAll(".auth-input").forEach(el => {
  el.addEventListener("input", () => el.classList.remove("input-error"));
});
 
// ---------- ปุ่มรูปตา แสดง/ซ่อนรหัสผ่าน ----------
const EYE_ON = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`;
const EYE_OFF = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`;
 
document.querySelectorAll('.auth-input[type="password"]').forEach(pw => {
  // ห่อช่องรหัสผ่านด้วย div แล้วเพิ่มปุ่มตาเข้าไป
  const wrap = document.createElement("div");
  wrap.className = "password-wrap";
  pw.parentNode.insertBefore(wrap, pw);
  wrap.appendChild(pw);
 
  const btn = document.createElement("button");
  btn.type = "button";               // กันไม่ให้กดแล้วส่งฟอร์ม
  btn.className = "toggle-password";
  btn.setAttribute("aria-label", "แสดงรหัสผ่าน");
  btn.innerHTML = EYE_ON;
  wrap.appendChild(btn);
 
  btn.addEventListener("click", () => {
    const show = pw.type === "password";
    pw.type = show ? "text" : "password";
    btn.innerHTML = show ? EYE_OFF : EYE_ON;
    btn.setAttribute("aria-label", show ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน");
  });
});
 
// ---------- ช่องวันเกิด ----------
function todayISO() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());   // ใช้เวลาท้องถิ่น ไม่ใช่ UTC
  return d.toISOString().split("T")[0];                   // รูปแบบ YYYY-MM-DD
}
 
const birthdayInput = document.getElementById("birthday");
const dateWrap = document.getElementById("dateWrap");
 
if (birthdayInput && dateWrap) {
  birthdayInput.setAttribute("max", todayISO());          // เลือกวันในอนาคตไม่ได้
  birthdayInput.setAttribute("min", "1900-01-01");
 
  const syncDate = () => dateWrap.classList.toggle("has-value", birthdayInput.value !== "");
  birthdayInput.addEventListener("input", syncDate);
  birthdayInput.addEventListener("change", syncDate);
 
  // Firefox ไม่มีปุ่มปฏิทินให้กด จึงสั่งเปิดเองตอนคลิก
  birthdayInput.addEventListener("click", () => {
    try { birthdayInput.showPicker(); } catch (e) {}
  });
}
 
// ---------- สร้างบัญชี ----------
function handleSignup(e) {
  e.preventDefault();
  clearErrors();
 
  const email = document.getElementById("email").value.trim().toLowerCase();
  const username = document.getElementById("username").value.trim();
  const birthday = document.getElementById("birthday").value;   // รูปแบบ YYYY-MM-DD
  const password = document.getElementById("password").value;
 
  // 1) เช็คว่ากรอกครบไหม (ช่องไหนว่างจะแดงพร้อมกันทุกช่อง)
  const missing = [];
  if (username === "") missing.push("username");
  if (birthday === "") missing.push("birthday");
  if (email === "") missing.push("email");
  if (password === "") missing.push("password");
  if (missing.length > 0) {
    markError(...missing);
    return showError("กรุณากรอกข้อมูลให้ครบทุกช่อง");
  }
 
  // 2) เช็ครูปแบบข้อมูล
  if (username.length < 3) { markError("username"); return showError("ชื่อผู้ใช้ต้องมีอย่างน้อย 3 ตัวอักษร"); }
  if (/\s/.test(username)) { markError("username"); return showError("ชื่อผู้ใช้ห้ามมีช่องว่าง"); }
  if (birthday > todayISO() || birthday < "1900-01-01") { markError("birthday"); return showError("วันเกิดไม่ถูกต้อง"); }
  if (!isValidEmail(email)) { markError("email"); return showError("รูปแบบอีเมลไม่ถูกต้อง"); }
  if (password.length < 6) { markError("password"); return showError("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร"); }
 
  // 3) เช็คว่าซ้ำกับคนอื่นไหม
  const users = getUsers();
  if (users.some(u => u.email === email)) {
    markError("email");
    return showError("อีเมลนี้ถูกใช้สมัครไปแล้ว");
  }
  if (users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
    markError("username");
    return showError("ชื่อผู้ใช้นี้ถูกใช้ไปแล้ว");
  }
 
  // เก็บวันที่สร้างบัญชี (createdAt) ไว้ใช้แสดงในหน้าโปรไฟล์
  users.push({ email, username, birthday, createdAt: new Date().toISOString(), password });
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
 
  // สมัครเสร็จให้ล็อกอินเลย (ไม่เก็บรหัสผ่านใน session)
  localStorage.setItem(CURRENT_KEY, JSON.stringify({ email, username, birthday }));
  window.location.href = "index.html";   // ใช้ปลายทางเดิมของคุณได้เลย ถ้าไม่ใช่ index.html
}
 
// ---------- เข้าสู่ระบบ (ใช้ชื่อผู้ใช้หรืออีเมลก็ได้) ----------
function handleLogin(e) {
  e.preventDefault();
  clearErrors();
 
  const id = document.getElementById("identifier").value.trim().toLowerCase();
  const password = document.getElementById("password").value;
 
  if (id === "" && password === "") {
    markError("identifier", "password");
    return showError("กรุณากรอกชื่อผู้ใช้/อีเมล และรหัสผ่าน");
  }
  if (id === "") {
    markError("identifier");
    return showError("กรุณากรอกชื่อผู้ใช้หรืออีเมล");
  }
  if (password === "") {
    markError("password");
    return showError("กรุณากรอกรหัสผ่าน");
  }
 
  const user = getUsers().find(u =>
    (u.email === id || u.username.toLowerCase() === id) && u.password === password
  );
  if (!user) {
    markError("identifier", "password");
    return showError("ชื่อผู้ใช้/อีเมล หรือรหัสผ่านไม่ถูกต้อง");
  }
 
  localStorage.setItem(CURRENT_KEY, JSON.stringify({ email: user.email, username: user.username, birthday: user.birthday || "" }));
  window.location.href = "index.html";
}
 
function logout() {
  localStorage.removeItem(CURRENT_KEY);
  window.location.href = "login.html";
}
 
// ปุ่ม Google / Apple (ต้องมี backend หรือ Firebase ถึงจะใช้งานได้จริง)
function socialLogin(provider) {
  showError("การเข้าสู่ระบบด้วย " + provider + " ยังไม่เปิดให้ใช้งาน");
}
 
// ---------- ผูกฟอร์มกับฟังก์ชัน (ไม่ต้องพึ่ง script ในไฟล์ HTML) ----------
const authForm = document.querySelector(".auth-form");
if (authForm) {
  if (document.getElementById("identifier")) {
    authForm.addEventListener("submit", handleLogin);    // หน้า login
  } else if (document.getElementById("username")) {
    authForm.addEventListener("submit", handleSignup);   // หน้า signup
  }
}
 
// ไอคอนรูปคนที่หน้าแรก: ล็อกอินแล้วไป profile, ยังไม่ล็อกอินไป login
const userLink = document.getElementById("userLink");
if (userLink) {
  userLink.href = getCurrentUser() ? "profile.html" : "login.html";
}
 
 
// =====================================================
//  ส่วนที่ 2: ค้นหาสถานที่ (ทำงานเฉพาะหน้าที่มีช่องค้นหา)
// =====================================================
const icons = {
  building: "img/building.svg",
  toilet:   "img/toiletwhite.svg",
  bank:     "img/bankwhite.svg",
  gym:      "img/Dumbbellwhite.svg",
  food:     "img/fork-knifewhite.svg",
  common:   "img/laptopwhite.svg"
};
 
const buildings = [
{ name: "อาคารศูนย์เรียนรวมเฉลิมพระเกียรติ 15 ชั้น", link: "detailbuilding/1.html", type: "building", keywords: ["15 ชั้น"] },
{ name: "อาคารหอสมุดพระราชวังสนามจันทร์", link: "detailbuilding/2.html", type: "building", keywords: ["ห้องสมุด", "library"] },
{ name: "อาคารศูนย์ศิลปวัฒนธรรมเฉลิมพระเกียรติ 6", link: "detailbuilding/3.html", type: "building" },
{ name: "อาคารคณะศึกษาศาสตร์", link: "detailbuilding/4.html", type: "building" },
{ name: "อาคารคณะวิทยาศาสตร์", link: "detailbuilding/5.html", type: "building" },
{ name: "อาคารวชิรมงกุฎ (คณะอักษรศาสตร์)", link: "detailbuilding/6.html", type: "building" },
{ name: "โคเวิร์คกิ้ง", link: "su-map-pages/common/common.html", type: "common", keywords: ["coworking", "ส่วนกลาง"] },
{ name: "ตู้ธนาคาร", link: "su-map-pages/atm/atm.html", type: "bank", keywords: ["atm", "เอทีเอ็ม", "ธนาคาร","ตู้เอทีเอ็ม"] },
{ name: "ยิม", link: "su-map-pages/gym/gym.html", type: "gym", keywords: ["gym", "ฟิตเนส", "ออกกำลังกาย"] },
{ name: "โรงอาหาร", link: "su-map-pages/canteen/canteen.html", type: "food", keywords: ["canteen", "อาหาร", "ข้าว"] },
{ name: "ห้องน้ำ", link: "su-map-pages/toilet/toilet.html", type: "toilet", keywords: ["toilet", "ขี้", "ห้องน้ำ"] },
];
 
const input = document.getElementById("searchInput");
const resultsBox = document.getElementById("searchResults");
 
// ถ้าหน้านี้ไม่มีช่องค้นหา (เช่น login, signup, profile) ก็ข้ามส่วนนี้ไป
if (input && resultsBox) {
 
  function renderResults(list) {
    if (list.length === 0) {
      resultsBox.innerHTML = '<div class="no-result">ไม่พบสถานที่ที่ค้นหา</div>';
      return;
    }
 
    resultsBox.innerHTML = list.map(b => `
      <a href="${b.link}" class="result-item">
        <div class="result-icon">
          <img src="${icons[b.type] || icons.building}" alt="">
        </div>
        <span>${b.name}</span>
      </a>
    `).join("");
  }
 
  input.addEventListener("input", () => {
    const keyword = input.value.trim().toLowerCase();
 
    if (keyword === "") {
      resultsBox.classList.remove("show");
      resultsBox.innerHTML = "";
      return;
    }
 
    const found = buildings.filter(b =>
      b.name.toLowerCase().includes(keyword) ||
      (b.keywords || []).some(k => k.toLowerCase().includes(keyword))
    );
 
    renderResults(found);
    resultsBox.classList.add("show");
  });   // <-- ปิด handler ตรงนี้
 
  const searchBtn = document.querySelector(".search-btn");
 
  function goFirstResult() {
    const first = resultsBox.querySelector(".result-item");
    if (first) window.location.href = first.getAttribute("href");
    else input.dispatchEvent(new Event("input"));
  }
 
  if (searchBtn) searchBtn.addEventListener("click", goFirstResult);
 
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") goFirstResult();
  });
 
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".search-container")) {
      resultsBox.classList.remove("show");
    }
  });
}   // <-- ปิด if
 
 
// =====================================================
//  ส่วนที่ 3: หน้าโปรไฟล์ (ทำงานเฉพาะหน้าที่มี #profileName)
// =====================================================
 
// ดึงข้อมูลเต็มของคนที่ล็อกอินอยู่ (จากรายชื่อผู้ใช้ ไม่ใช่จาก session)
function getFullUser() {
  const cur = getCurrentUser();
  if (!cur) return null;
  return getUsers().find(u => u.email === cur.email) || null;
}
 
// แก้ข้อมูลของผู้ใช้คนหนึ่ง (เช่น เพิ่มรูปโปรไฟล์) คืนค่า false ถ้าบันทึกไม่ได้
function updateUser(email, changes) {
  const users = getUsers();
  const i = users.findIndex(u => u.email === email);
  if (i === -1) return false;
  users[i] = { ...users[i], ...changes };
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    return true;
  } catch (e) {
    return false;   // พื้นที่เก็บข้อมูลของเบราว์เซอร์เต็ม
  }
}
 
// แปลงวันที่เป็นรูปแบบ วว/ดด/ปปปป ตามดีไซน์
function formatDMY(value) {
  if (!value) return "-";
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {       // วันเกิด (YYYY-MM-DD) แปลงตรงๆ ไม่ผ่าน Date กันวันเพี้ยน
    const [y, m, d] = value.split("-");
    return `${d}/${m}/${y}`;
  }
  const dt = new Date(value);                     // วันที่สร้างบัญชี (เวลาเต็ม)
  if (isNaN(dt)) return "-";
  const dd = String(dt.getDate()).padStart(2, "0");
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  return `${dd}/${mm}/${dt.getFullYear()}`;
}
 
// ย่อรูปให้เป็นสี่เหลี่ยมจัตุรัส (ตัดจากกลางรูป) แล้วแปลงเป็น data URL
// ต้องย่อก่อนเก็บ เพราะ localStorage จุได้ประมาณ 5 MB รูปจากกล้องมือถือใหญ่เกินไป
function resizeImage(file, size, callback) {
  const reader = new FileReader();
  reader.onload = () => {
    const img = new Image();
    img.onload = () => {
      const side = Math.min(img.width, img.height);
      const sx = (img.width - side) / 2;
      const sy = (img.height - side) / 2;
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      canvas.getContext("2d").drawImage(img, sx, sy, side, side, 0, 0, size, size);
      callback(canvas.toDataURL("image/jpeg", 0.85));
    };
    img.onerror = () => callback(null);
    img.src = reader.result;
  };
  reader.onerror = () => callback(null);
  reader.readAsDataURL(file);
}
 
const profileNameEl = document.getElementById("profileName");
 
if (profileNameEl) {
  const me = getFullUser();
 
  if (!me) {
    // ยังไม่ล็อกอิน (หรือบัญชีถูกลบไปแล้ว) → ไปหน้า login
    localStorage.removeItem(CURRENT_KEY);
    window.location.href = "login.html";
  } else {
    const avatarEl = document.getElementById("profileAvatar");
    const cameraBtn = document.getElementById("avatarCameraBtn");
    const avatarInput = document.getElementById("avatarInput");
    const msgEl = document.getElementById("profileMsg");
 
    const showProfileMsg = (text) => { msgEl.textContent = text; };
 
    // แสดงรูป ถ้ายังไม่มีรูปให้โชว์ตัวอักษรแรกของชื่อ
    const renderAvatar = () => {
      avatarEl.textContent = "";
      if (me.avatar) {
        const img = document.createElement("img");
        img.src = me.avatar;
        img.alt = "รูปโปรไฟล์";
        avatarEl.appendChild(img);
      } else {
        avatarEl.textContent = me.username.charAt(0).toUpperCase();
      }
    };
 
    // ใส่ข้อมูลลงหน้า
    profileNameEl.textContent = me.username;
    document.getElementById("profileEmail").textContent = me.email;
    document.getElementById("profileBirthday").textContent = formatDMY(me.birthday);
    document.getElementById("profileCreated").textContent = formatDMY(me.createdAt);
    renderAvatar();
 
    // กดปุ่มกล้อง → เปิดหน้าต่างเลือกรูปในเครื่อง
    cameraBtn.addEventListener("click", () => avatarInput.click());
 
    // เลือกรูปเสร็จ → ย่อรูป → บันทึก → แสดงทันที
    avatarInput.addEventListener("change", () => {
      const file = avatarInput.files[0];
      avatarInput.value = "";                 // ให้เลือกรูปเดิมซ้ำได้
      if (!file) return;
 
      if (!file.type.startsWith("image/")) return showProfileMsg("กรุณาเลือกไฟล์รูปภาพ");
      if (file.size > 10 * 1024 * 1024) return showProfileMsg("ไฟล์ใหญ่เกินไป (ไม่เกิน 10 MB)");
 
      resizeImage(file, 400, (dataUrl) => {
        if (!dataUrl) return showProfileMsg("เปิดรูปนี้ไม่ได้ ลองเลือกรูปอื่น");
        if (!updateUser(me.email, { avatar: dataUrl })) {
          return showProfileMsg("บันทึกรูปไม่ได้ พื้นที่เก็บข้อมูลของเบราว์เซอร์เต็ม");
        }
        me.avatar = dataUrl;
        renderAvatar();
        showProfileMsg("");
      });
    });

    // ---------- เปลี่ยนรหัสผ่าน ----------
    const pwModal = document.getElementById("pwModal");
    const pwForm = document.getElementById("pwForm");
    const pwMsg = document.getElementById("pwMsg");
    const pwCurrent = document.getElementById("pwCurrent");
    const pwNew = document.getElementById("pwNew");
    const pwConfirm = document.getElementById("pwConfirm");

    const openPwModal = () => {
      pwForm.reset();
      pwMsg.textContent = "";
      pwMsg.classList.remove("pw-ok");
      pwModal.hidden = false;
      pwCurrent.focus();
    };
    const closePwModal = () => { pwModal.hidden = true; };

    document.getElementById("changePwBtn").addEventListener("click", openPwModal);
    document.getElementById("pwCancel").addEventListener("click", closePwModal);
    pwModal.addEventListener("click", (e) => { if (e.target === pwModal) closePwModal(); });   // กดพื้นหลังเพื่อปิด
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !pwModal.hidden) closePwModal(); });

    pwForm.addEventListener("submit", (e) => {
      e.preventDefault();
      pwMsg.classList.remove("pw-ok");

      const current = pwCurrent.value;
      const next = pwNew.value;
      const confirm = pwConfirm.value;

      if (current === "" || next === "" || confirm === "") { pwMsg.textContent = "กรุณากรอกข้อมูลให้ครบ"; return; }
      if (current !== me.password) { pwMsg.textContent = "รหัสผ่านปัจจุบันไม่ถูกต้อง"; return; }
      if (next.length < 6) { pwMsg.textContent = "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร"; return; }   // กฎเดียวกับตอนสมัคร
      if (next === current) { pwMsg.textContent = "รหัสผ่านใหม่ต้องไม่ซ้ำกับรหัสผ่านเดิม"; return; }
      if (next !== confirm) { pwMsg.textContent = "รหัสผ่านใหม่และการยืนยันไม่ตรงกัน"; return; }

      if (!updateUser(me.email, { password: next })) {
        pwMsg.textContent = "บันทึกไม่ได้ พื้นที่เก็บข้อมูลของเบราว์เซอร์เต็ม";
        return;
      }
      me.password = next;
      pwForm.reset();
      pwMsg.classList.add("pw-ok");
      pwMsg.textContent = "เปลี่ยนรหัสผ่านสำเร็จ";
      setTimeout(closePwModal, 1200);
    });
  }
}
 
 
// =====================================================
//  ส่วนที่ 4: หน้าหมวดหมู่ + หน้ารายละเอียดอาคาร
//  (ห้องน้ำ / ยิม / ตู้ธนาคาร / ส่วนกลาง / โรงอาหาร)
//  ทำงานเฉพาะหน้าที่มี #category-page-section หรือ #location-page-section
// =====================================================
 
// โฟลเดอร์รูปหลัก แก้ที่นี่ที่เดียว ถ้า path ผิดให้ปรับตรงนี้
// (หน้าหมวดอยู่ที่ su-map-pages/<หมวด>/ จึงต้องถอยขึ้น ../../ ไปที่โฟลเดอร์ img ที่ราก)
const IMG_BASE = '../../img/';
 
// รูปภาพ: ใส่แค่ "ชื่อไฟล์" หรือ "โฟลเดอร์/ชื่อไฟล์" เช่น "GYM-H.jpg"
//         (ถ้าเป็นลิงก์ https://... จะใช้ตามที่ใส่)
const ALL_CATEGORIES_DATA = {
    "toilet": {
        categoryTitle: "ห้องน้ำ",
        totalBuildingsText: "9 อาคารพร้อมใช้งาน",
        buildings: {
            "1": {
                name: "อาคารเรียนรวมเฉลิมพระเกียรติ 15 ชั้น",
                subName: "มหาวิทยาลัยศิลปากร วิทยาเขตพระราชวังสนามจันทร์",
                openTime: "เปิดให้บริการจันทร์-ศุกร์ เวลา 8.00–20.00",
                heroImage: "https://via.placeholder.com/455x470?text=Building+1",
                cardImage: "https://via.placeholder.com/370x220?text=Building+1",
                floors: [
                    { title: "ชั้น 1 เลี้ยวซ้าย ใกล้บันได", detail: "มีสายชำระ พัดลม กระดาษทิชชู่" },
                    { title: "ชั้น 2 เลี้ยวซ้าย ใกล้บันได", detail: "มีสายชำระ พัดลม กระดาษทิชชู่" },
                    { title: "ชั้น 3 เลี้ยวซ้าย ใกล้บันได", detail: "มีสายชำระ พัดลม กระดาษทิชชู่" }
                ],
                gallery: [
                    "https://via.placeholder.com/220x280?text=Toilet+1",
                    "https://via.placeholder.com/220x280?text=Toilet+2",
                    "https://via.placeholder.com/220x280?text=Toilet+3",
                    "https://via.placeholder.com/220x280?text=Toilet+4"
                ]
            },
            "2": {
                name: "อาคารหอสมุดพระราชวังสนามจันทร์",
                subName: "มหาวิทยาลัยศิลปากร วิทยาเขตพระราชวังสนามจันทร์",
                openTime: "เปิดให้บริการจันทร์-ศุกร์ เวลา 8.30–20.00",
                heroImage: "https://via.placeholder.com/455x470?text=Library",
                cardImage: "https://via.placeholder.com/370x220?text=Library",
                floors: [
                    { title: "ชั้น 1 โซน A ใกล้ประตูทางเข้า", detail: "มีสายชำระ พัดลม กระดาษทิชชู่" },
                    { title: "ชั้น 2 โซน B ข้างห้องอ่านหนังสือ", detail: "มีสายชำระ พัดลม กระดาษทิชชู่" }
                ],
                gallery: ["https://via.placeholder.com/220x280?text=Toilet+1"]
            },
            "3": {
                name: "อาคารศูนย์ศิลปวัฒนธรรมเฉลิมพระเกียรติ 6",
                subName: "มหาวิทยาลัยศิลปากร วิทยาเขตพระราชวังสนามจันทร์",
                openTime: "เปิดให้บริการจันทร์-ศุกร์ เวลา 8.00–18.00",
                heroImage: "https://via.placeholder.com/455x470?text=Art+Center",
                cardImage: "https://via.placeholder.com/370x220?text=Art+Center",
                floors: [{ title: "ชั้น 1 ใกล้นิทรรศการหลัก", detail: "มีสายชำระ พัดลม กระดาษทิชชู่" }],
                gallery: ["https://via.placeholder.com/220x280?text=Toilet+1"]
            },
            "4": {
                name: "อาคารคณะศึกษาศาสตร์",
                subName: "มหาวิทยาลัยศิลปากร วิทยาเขตพระราชวังสนามจันทร์",
                openTime: "เปิดให้บริการจันทร์-ศุกร์ เวลา 8.00–18.00",
                heroImage: "https://via.placeholder.com/455x470?text=Education",
                cardImage: "https://via.placeholder.com/370x220?text=Education",
                floors: [{ title: "ชั้น 1 ใกล้บันไดกลาง", detail: "มีสายชำระ พัดลม กระดาษทิชชู่" }],
                gallery: ["https://via.placeholder.com/220x280?text=Toilet+1"]
            },
            "5": {
                name: "อาคารคณะวิทยาศาสตร์",
                subName: "มหาวิทยาลัยศิลปากร วิทยาเขตพระราชวังสนามจันทร์",
                openTime: "เปิดให้บริการจันทร์-ศุกร์ เวลา 8.00–19.00",
                heroImage: "https://via.placeholder.com/455x470?text=Science",
                cardImage: "https://via.placeholder.com/370x220?text=Science",
                floors: [{ title: "ชั้น 1 โถงทางเดินหลัก", detail: "มีสายชำระ พัดลม กระดาษทิชชู่" }],
                gallery: ["https://via.placeholder.com/220x280?text=Toilet+1"]
            },
            "6": {
                name: "อาคารวชิรมงกุฎ (คณะอักษรศาสตร์)",
                subName: "มหาวิทยาลัยศิลปากร วิทยาเขตพระราชวังสนามจันทร์",
                openTime: "เปิดให้บริการจันทร์-ศุกร์ เวลา 8.00–18.00",
                heroImage: "https://via.placeholder.com/455x470?text=Arts",
                cardImage: "https://via.placeholder.com/370x220?text=Arts",
                floors: [{ title: "ชั้น 1 ข้างลิฟต์", detail: "มีสายชำระ พัดลม กระดาษทิชชู่" }],
                gallery: ["https://via.placeholder.com/220x280?text=Toilet+1"]
            },
            "7": {
                name: "อาคารคณะวิศวะกรรมศาสตร์",
                subName: "มหาวิทยาลัยศิลปากร วิทยาเขตพระราชวังสนามจันทร์",
                openTime: "เปิดให้บริการจันทร์-ศุกร์ เวลา 8.00–18.00",
                heroImage: "https://via.placeholder.com/455x470?text=Engineering",
                cardImage: "https://via.placeholder.com/370x220?text=Engineering",
                floors: [{ title: "ชั้น 1 ฝั่งโรงช่าง", detail: "มีสายชำระ พัดลม กระดาษทิชชู่" }],
                gallery: ["https://via.placeholder.com/220x280?text=Toilet+1"]
            },
            "8": {
                name: "อาคารคณะมัณฑนศิลป์",
                subName: "มหาวิทยาลัยศิลปากร วิทยาเขตพระราชวังสนามจันทร์",
                openTime: "เปิดให้บริการจันทร์-ศุกร์ เวลา 8.00–18.00",
                heroImage: "https://via.placeholder.com/455x470?text=Decorative+Arts",
                cardImage: "https://via.placeholder.com/370x220?text=Decorative+Arts",
                floors: [{ title: "ชั้น 1 ใกล้ห้องจัดแสดงผลงาน", detail: "มีสายชำระ พัดลม กระดาษทิชชู่" }],
                gallery: ["https://via.placeholder.com/220x280?text=Toilet+1"]
            },
            "9": {
                name: "อาคารคณะเทคโนโลยีสารสนเทศ",
                subName: "มหาวิทยาลัยศิลปากร วิทยาเขตพระราชวังสนามจันทร์",
                openTime: "เปิดให้บริการจันทร์-ศุกร์ เวลา 8.00–20.00",
                heroImage: "https://via.placeholder.com/455x470?text=ICT",
                cardImage: "https://via.placeholder.com/370x220?text=ICT",
                floors: [{ title: "ชั้น 1 ใกล้ห้องปฏิบัติการคอมพิวเตอร์", detail: "มีสายชำระ พัดลม กระดาษทิชชู่" }],
                gallery: ["https://via.placeholder.com/220x280?text=Toilet+1"]
            }
        }
    },
    "gym": {
        categoryTitle: "ยิม",
        totalBuildingsText: "2 อาคารพร้อมใช้งาน",
        buildings: {
            "1": {
                name: "อาคารเพชรรัตน-สุวัทนา",
                subName: "มหาวิทยาลัยศิลปากร วิทยาเขตพระราชวังสนามจันทร์",
                openTime: "เปิดให้บริการจันทร์-ศุกร์ เวลา 16.00–21.00",
                // ใส่แค่ชื่อไฟล์ ระบบต่อ IMG_BASE ให้เอง
                heroImage: "GYM-H.jpg",
                cardImage: "GYM-H.jpg",
                floors: [{ title: "ชั้น 1 สนามบาสเกตบอล / ฟิตเนส", detail: "มีเครื่องเล่นเวท ห้องอาบน้ำ" }],
                gallery: ["https://via.placeholder.com/220x280?text=Gym+1"]
            },
            "2": {
                name: " อาคารโสมสวลี คณะศึกษาศาสตร์",
                subName: "มหาวิทยาลัยศิลปากร วิทยาเขตพระราชวังสนามจันทร์",
                openTime: "เปิดให้บริการจันทร์-ศุกร์ เวลา 10.00–19.00",
                heroImage: "somevaree-H.jpg",
                cardImage: "somevaree-H.jpg",
                floors: [{ title: "ชั้น 2 ห้องโยคะและแอโรบิก", detail: "มีแอร์ เสื่อโยคะ" }],
                gallery: ["https://via.placeholder.com/220x280?text=Gym+2"]
            }
        }
    },
    "atm": {
        categoryTitle: "ตู้ธนาคาร",
        totalBuildingsText: "3 อาคารพร้อมใช้งาน",
        buildings: {
            "1": {
                name: "สำนักดิจิทัลเทคโนโลยี",
                subName: "มหาวิทยาลัยศิลปากร วิทยาเขตพระราชวังสนามจันทร์",
                openTime: "เปิดให้บริการ 24 ชั่วโมง",
                heroImage: "TGNO-H.jpg",
                cardImage: "TGNO-H.jpg",
                floors: [{ title: "บริเวณหน้าทางเข้าหอสมุด", detail: "ตู้ SCB, กสิกร, กรุงไทย" }],
                gallery: ["https://via.placeholder.com/220x280?text=ATM+1"]
            },
            "2": {
                name: "โรงอาหารเพชรรัตน์",
                subName: "มหาวิทยาลัยศิลปากร วิทยาเขตพระราชวังสนามจันทร์",
                openTime: "เปิดให้บริการ 24 ชั่วโมง",
                heroImage: "36P.jpg",
                cardImage: "36P.jpg",
                floors: [{ title: "ข้างโรงอาหารเพชรรัตน์", detail: "ตู้ กรุงเทพ, ออมสิน" }],
                gallery: ["https://via.placeholder.com/220x280?text=ATM+2"]
            },
            "3": {
                name: "อาคาร 36 ปี คณะอักษรศาสตร์",
                subName: "มหาวิทยาลัยศิลปากร วิทยาเขตพระราชวังสนามจันทร์",
                openTime: "เปิดให้บริการ 24 ชั่วโมง",
                heroImage: "https://via.placeholder.com/455x470?text=ATM+3",
                cardImage: "https://via.placeholder.com/370x220?text=ATM+3",
                floors: [{ title: "โถงชั้น 1 อาคารเรียนรวม 15 ชั้น", detail: "ตู้ SCB, กสิกร" }],
                gallery: ["https://via.placeholder.com/220x280?text=ATM+3"]
            }
        }
    },
    "common": {
        categoryTitle: "ส่วนกลาง",
        totalBuildingsText: "5 อาคารพร้อมใช้งาน",
        buildings: {
            "1": {
                name: "อาคารสำนักงานอธิการบดี",
                subName: "มหาวิทยาลัยศิลปากร วิทยาเขตพระราชวังสนามจันทร์",
                openTime: "เปิดให้บริการจันทร์-ศุกร์ เวลา 8.30–16.30",
                heroImage: "https://via.placeholder.com/455x470?text=Common+1",
                cardImage: "https://via.placeholder.com/370x220?text=Common+1",
                floors: [{ title: "ชั้น 1 งานทะเบียนและประมวลผล", detail: "ติดต่อเอกสารการศึกษา" }],
                gallery: ["https://via.placeholder.com/220x280?text=Common+1"]
            },
            "2": {
                name: "อาคารกองกิจการนักศึกษา",
                subName: "มหาวิทยาลัยศิลปากร วิทยาเขตพระราชวังสนามจันทร์",
                openTime: "เปิดให้บริการจันทร์-ศุกร์ เวลา 8.30–16.30",
                heroImage: "https://via.placeholder.com/455x470?text=Common+2",
                cardImage: "https://via.placeholder.com/370x220?text=Common+2",
                floors: [{ title: "ชั้น 1 ห้องทุนการศึกษา / กู้ยืม กยศ.", detail: "ติดต่อทุนการศึกษา" }],
                gallery: ["https://via.placeholder.com/220x280?text=Common+2"]
            },
            "3": {
                name: "โรงอาหารเพชรรัตน์ ",
                subName: "มหาวิทยาลัยศิลปากร วิทยาเขตพระราชวังสนามจันทร์",
                openTime: "เปิดตามเวลาจัดกิจกรรม",
                heroImage: "https://via.placeholder.com/455x470?text=Common+3",
                cardImage: "https://via.placeholder.com/370x220?text=Common+3",
                floors: [{ title: "โถงพิธีการ / ห้องประชุมหลัก", detail: "จัดกิจกรรมมหาวิทยาลัย" }],
                gallery: ["https://via.placeholder.com/220x280?text=Common+3"]
            },
            "4": {
                name: "อาคารคณะอักษรศาสตร์",
                subName: "มหาวิทยาลัยศิลปากร วิทยาเขตพระราชวังสนามจันทร์",
                openTime: "เปิดให้บริการ 24 ชั่วโมง",
                heroImage: "https://via.placeholder.com/455x470?text=Common+4",
                cardImage: "https://via.placeholder.com/370x220?text=Common+4",
                floors: [{ title: "สำนักงานดูแลหอพัก", detail: "ติดต่อเรื่องหอพักนักศึกษา" }],
                gallery: ["https://via.placeholder.com/220x280?text=Common+4"]
            },
            "5": {
                name: "อาคารคณะวิทยาศาสตร์",
                subName: "มหาวิทยาลัยศิลปากร วิทยาเขตพระราชวังสนามจันทร์",
                openTime: "เปิดให้บริการทุกวัน",
                heroImage: "https://via.placeholder.com/455x470?text=Common+5",
                cardImage: "https://via.placeholder.com/370x220?text=Common+5",
                floors: [{ title: "พื้นที่นั่งพักผ่อน / ทำงานกลุ่ม", detail: "มีปลั๊กไฟ พัดลม Wi-Fi" }],
                gallery: ["https://via.placeholder.com/220x280?text=Common+5"]
            }
        }
    },
    "canteen": {
        categoryTitle: "โรงอาหาร",
        totalBuildingsText: "3 อาคารพร้อมใช้งาน",
        buildings: {
            "1": {
                name: "โรงอาหารเพชรรัตน์",
                subName: "มหาวิทยาลัยศิลปากร วิทยาเขตพระราชวังสนามจันทร์",
                openTime: "เปิดให้บริการทุกวัน เวลา 6.00–19.00",
                heroImage: "https://via.placeholder.com/455x470?text=Canteen+1",
                cardImage: "https://via.placeholder.com/370x220?text=Canteen+1",
                floors: [{ title: "โซนร้านอาหารหลัก", detail: "มีร้านข้าวมันไก่ ก๋วยเตี๋ยว เครื่องดื่ม" }],
                gallery: ["https://via.placeholder.com/220x280?text=Canteen+1"]
            },
            "2": {
                name: "โรงอาหารยูเนี่ยน (Union)",
                subName: "มหาวิทยาลัยศิลปากร วิทยาเขตพระราชวังสนามจันทร์",
                openTime: "เปิดให้บริการจันทร์-ศุกร์ เวลา 7.00–18.00",
                heroImage: "https://via.placeholder.com/455x470?text=Canteen+2",
                cardImage: "https://via.placeholder.com/370x220?text=Canteen+2",
                floors: [{ title: "ชั้น 1 ศูนย์อาหารติดแอร์", detail: "มีอาหารตามสั่ง อาหารฮาลาล" }],
                gallery: ["https://via.placeholder.com/220x280?text=Canteen+2"]
            },
            "3": {
                name: "โรงอาหารคณะวิศวกรรมศาสตร์",
                subName: "มหาวิทยาลัยศิลปากร วิทยาเขตพระราชวังสนามจันทร์",
                openTime: "เปิดให้บริการจันทร์-ศุกร์ เวลา 7.00–16.00",
                heroImage: "https://via.placeholder.com/455x470?text=Canteen+3",
                cardImage: "https://via.placeholder.com/370x220?text=Canteen+3",
                floors: [{ title: "โถงใต้ตึกคณะศึกษาศาสตร์", detail: "มีร้านข้าวราดแกง เครื่องดื่ม ขนม" }],
                gallery: ["https://via.placeholder.com/220x280?text=Canteen+3"]
            }
        }
    }
};
 
// รันเฉพาะหน้าหมวดหมู่ (หน้าอื่น เช่น index, login, profile จะข้ามส่วนนี้ไป)
(function initCategoryPages() {
    const categorySection = document.getElementById('category-page-section');
    const locationSection = document.getElementById('location-page-section');
    if (!categorySection && !locationSection) return;
 
    // ปรับ path ไอคอนตรงนี้ที่เดียว
    const ICON_LOCATION = '../../img/location.svg';
 
    // ถ้าเป็น https://... ใช้ตามเดิม / ถ้าเป็นชื่อไฟล์ จะต่อ IMG_BASE ให้
    const imgPath = (p) => /^(https?:)?\/\//.test(p) ? p : IMG_BASE + p;
 
    // ---------- 1. หาหมวดและอาคารที่ต้องแสดง ----------
    const urlParams = new URLSearchParams(window.location.search);
    const categoryKey = document.body.dataset.category || urlParams.get('category') || 'toilet';
    const buildingId = urlParams.get('buildingId');
 
    const category = ALL_CATEGORIES_DATA[categoryKey];
    if (!category) {
        console.error('[SU MAP] ไม่พบหมวด "' + categoryKey + '" (เช็ก data-category ที่ <body>)');
        return;
    }
    const building = buildingId ? category.buildings[buildingId] : null;
 
    // ---------- 2. ฟังก์ชันช่วย ----------
    const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
 
    const setText = (name, text) => {
        document.querySelectorAll('[data-bind="' + name + '"]').forEach((el) => {
            el.textContent = text;
        });
    };
 
    const setImage = (name, src, alt) => {
        document.querySelectorAll('[data-bind="' + name + '"]').forEach((el) => {
            el.src = src;
            el.alt = alt;
        });
    };
 
    // ---------- 3. หัวเรื่องของหมวด ----------
    document.title = 'SU MAP - ' + category.categoryTitle;
    setText('category-title', category.categoryTitle);
    setText('category-count', category.totalBuildingsText);
 
    // ---------- 4. สร้างการ์ดอาคาร (หน้า Category) ----------
    const listEl = document.getElementById('category-list');
    if (!listEl) {
        console.error('[SU MAP] ไม่พบ <div id="category-list"> ใน HTML');
    } else {
        listEl.innerHTML = Object.entries(category.buildings).map(([id, b]) => `
            <div class="col-12 col-lg-4 category-card-col">
                <a href="?buildingId=${esc(id)}" class="building-card-link text-decoration-none">
                    <div class="category-card custom-radius-25 overflow-hidden">
                        <div class="card-img-wrapper">
                            <img src="${esc(imgPath(b.cardImage))}" alt="${esc(b.name)}" class="w-100 h-100 object-fit-cover">
                        </div>
                        <div class="card-info-banner d-flex justify-content-between p-3 text-white">
                            <div class="card-text-content d-flex flex-column justify-content-between">
                                <div class="d-flex align-items-start gap-2">
                                    <img src="${esc(ICON_LOCATION)}" alt="Location Icon" class="icon-location-svg pin-icon-white flex-shrink-0">
                                    <span class="card-building-title font-medium fw-bold text-white">${esc(b.name)}</span>
                                </div>
                                <div>
                                    <span class="badge bg-white text-dark custom-radius-25 px-3 py-1 font-medium fw-normal">มี ${b.floors.length} พื้นที่</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </a>
            </div>
        `).join('');
    }
 
    // ---------- 5. เติมข้อมูลหน้า Location ----------
    if (building) {
        document.title = 'SU MAP - ' + building.name;
        setText('building-name', building.name);
        setText('building-sub', building.subName);
        setText('building-time', building.openTime);
        setText('floor-heading', 'พื้นที่' + category.categoryTitle + ' ภายในอาคาร');
        setText('floor-count', 'มี ' + building.floors.length + ' พื้นที่');
 
        setImage('building-hero', imgPath(building.heroImage), building.name);
 
        const floorsEl = document.getElementById('location-floors');
        if (floorsEl) {
            floorsEl.innerHTML = building.floors.map((f) => `
                <div class="card-floor custom-radius-25 p-3 p-md-4 d-flex flex-column justify-content-center">
                    <div class="font-medium fw-bold mb-2">${esc(f.title)}</div>
                    <div class="badge-detail custom-radius-25 d-inline-flex align-items-center px-3 py-1 bg-white">
                        <i class="bi bi-check-circle me-2"></i><span>${esc(f.detail)}</span>
                    </div>
                </div>
            `).join('');
        }
 
        const galleryEl = document.getElementById('location-gallery');
        if (galleryEl) {
            galleryEl.innerHTML = building.gallery.map((src) => `
                <div class="col-3 gallery-col">
                    <div class="gallery-item custom-radius-25 overflow-hidden">
                        <img src="${esc(imgPath(src))}" alt="${esc(building.name)}" class="img-fluid w-100 h-100 object-fit-cover">
                    </div>
                </div>
            `).join('');
        }
    }
 
    // ---------- 6. สลับหน้า Category / Location ----------
    if (categorySection) categorySection.style.display = building ? 'none' : 'block';
    if (locationSection) locationSection.style.display = building ? 'block' : 'none';
 
    // ---------- 7. ปุ่มย้อนกลับ ----------
    document.querySelectorAll('.btn-back').forEach((btn) => {
        btn.addEventListener('click', function (e) {
            e.preventDefault();
 
            if (building) {
                // หน้ารายละเอียดอาคาร -> กลับหน้ารายการของหมวด (เหมือนลิงก์เดิม gym.html)
                window.location.href = window.location.pathname;
                return;
            }
 
            // หน้ารายการของหมวด -> กลับไปหน้าที่เข้ามา
            // ถ้าหน้าก่อนหน้าคือหน้านี้เอง (มาจากการกดย้อนกลับของหน้ารายละเอียด)
            // ห้ามใช้ history.back() เพราะจะวนกลับไปหน้ารายละเอียดอีก ให้ไปหน้าแรกแทน
            let cameFromSamePage = false;
            try {
                cameFromSamePage = !document.referrer ||
                    new URL(document.referrer).pathname === window.location.pathname;
            } catch (err) {
                cameFromSamePage = true;
            }
 
            if (!cameFromSamePage && window.history.length > 1) {
                window.history.back();
            } else {
                window.location.href = '../../index.html';
            }
        });
    });
})();