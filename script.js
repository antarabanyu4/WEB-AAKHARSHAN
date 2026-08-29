/* =========================================
   1. PENCARIAN SISWA
========================================= */
function searchSiswa() {
  const input = document.getElementById("searchInput")?.value.toLowerCase().trim();
  if (input === undefined) return;

  document.querySelectorAll("#Member .card-container:last-child .card").forEach(card => {
    const nama = card.querySelector("h3").innerText.toLowerCase();
    card.style.display = nama.includes(input) ? "" : "none";
  });
}

/* =========================================
   2. NAVBAR SLIDING INDICATOR
========================================= */
document.addEventListener("DOMContentLoaded", () => {
  const navbar = document.querySelector(".navbar");
  const navList = document.querySelector(".navbar ul");
  const navLinks = document.querySelectorAll(".navbar a");

  function moveIndicator(link) {
    if (!link || !navList) return;
    const linkBox = link.getBoundingClientRect();
    const listBox = navList.getBoundingClientRect();
    const left = linkBox.left - listBox.left;
    const width = linkBox.width;

    navList.style.setProperty("--nav-left", left + "px");
    navList.style.setProperty("--nav-width", width + "px");
  }

  function initializeNavbar() {
    const active = document.querySelector(".navbar a.active");
    moveIndicator(active);
  }

  window.addEventListener("load", initializeNavbar);

  navLinks.forEach(function (link) {
    link.addEventListener("click", function (event) {
      const currentPage = window.location.pathname;
      const target = new URL(this.href, window.location.href);

      if (target.pathname === currentPage) {
        event.preventDefault();
        moveIndicator(this);
        return;
      }

      event.preventDefault();
      navbar.classList.add("moving");

      navLinks.forEach(item => item.classList.remove("active"));
      this.classList.add("active");
      moveIndicator(this);

      setTimeout(() => document.body.classList.add("page-leaving"), 300);
      setTimeout(() => window.location.href = target.href, 450);
    });
  });

  window.addEventListener("resize", () => {
    const active = document.querySelector(".navbar a.active");
    moveIndicator(active);
  });
});

/* =====================================================
   3. BIRTHDAY NOTIFICATION & TOAST
====================================================== */
document.addEventListener("DOMContentLoaded", () => {
  const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
  const birthdayBox = document.getElementById("BirthdayNotification");
  const birthdayTitle = document.getElementById("birthdayTitle");
  const birthdayMessage = document.getElementById("birthdayMessage");
  const birthdayCards = document.getElementById("birthdayCards");

  if (!birthdayBox || !birthdayTitle || !birthdayMessage || !birthdayCards) return;

  const testDate = new URLSearchParams(window.location.search).get("birthdayTest");
  const now = new Date();
  let todayDay = now.getDate();
  let todayMonth = now.getMonth();

  if (testDate) {
    const [d, m] = testDate.split(/[-/]/).map(Number);
    if (Number.isInteger(d) && Number.isInteger(m) && d >= 1 && d <= 31 && m >= 1 && m <= 12) {
      todayDay = d;
      todayMonth = m - 1;
    }
  }

  const memberContainers = document.querySelectorAll("#Member .card-container");
  const studentContainer = memberContainers[1];
  if (!studentContainer) return;

  const cards = [...studentContainer.querySelectorAll(".card")];
  const birthdays = cards.map(card => {
    const name = card.querySelector("h3")?.textContent.trim();
    const dateText = card.querySelector("p")?.textContent.trim();
    if (!name || !dateText || dateText === "-") return null;

    const parts = dateText.replace(/\s+/g, " ").trim().split(" ");
    if (parts.length < 2) return null;

    const day = Number(parts[0].replace(/[^0-9]/g, ""));
    const month = monthNames.indexOf(parts[1].replace(/[^A-Za-zÀ-ÿ]/g, ""));
    
    if (!Number.isInteger(day) || month < 0) return null;
    return { card, name, day, month };
  }).filter(Boolean);

  const todaysBirthdays = birthdays.filter(person => person.day === todayDay && person.month === todayMonth);
  if (!todaysBirthdays.length) return;

  const names = todaysBirthdays.map(person => person.name);
  const nameText = names.length === 1 ? names[0] : names.slice(0, -1).join(", ") + " dan " + names[names.length - 1];

  birthdayTitle.textContent = names.length === 1 ? `🎉 Selamat Ulang Tahun, ${nameText}!` : `🎉 Selamat Ulang Tahun untuk ${nameText}!`;
  birthdayMessage.textContent = names.length === 1 
    ? "Semoga panjang umur, sehat selalu, semakin sukses, dan semua cita-citanya tercapai. 🎂✨" 
    : "Semoga semuanya selalu sehat, bahagia, semakin sukses, dan semua cita-citanya tercapai. 🎂✨";

  todaysBirthdays.forEach(person => {
    const birthdayCard = person.card.cloneNode(true);
    birthdayCard.classList.add("birthday-student-card");
    birthdayCards.appendChild(birthdayCard);
    person.card.classList.add("is-birthday");
  });

  birthdayBox.hidden = false;

  const toast = document.createElement("div");
  toast.className = "birthday-toast";
  toast.innerHTML = `
    <span class="birthday-toast-icon">🎂</span>
    <div>
      <strong>Birthday Alert!</strong>
      <span>${nameText} ulang tahun hari ini 🎉</span>
    </div>
    <button type="button" aria-label="Tutup notifikasi">×</button>
  `;
  document.body.appendChild(toast);

  toast.querySelector("button").addEventListener("click", () => {
    toast.classList.add("hide");
    setTimeout(() => toast.remove(), 250);
  });

  if ("Notification" in window && Notification.permission === "granted") {
    new Notification("🎂 Ulang Tahun XI RPL 1", { body: `${nameText} ulang tahun hari ini! Selamat ulang tahun 🎉` });
  }
});

/* =====================================================
   4. COUNTDOWN + BIRTHDAY POPUP
====================================================== */
document.addEventListener("DOMContentLoaded", () => {
  const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
  const memberContainers = document.querySelectorAll("#Member .card-container");
  const studentContainer = memberContainers[1];
  
  if (!studentContainer) return;
  const cards = [...studentContainer.querySelectorAll(".card")];

  const popup = document.getElementById("BirthdayPopup");
  const popupPhoto = document.getElementById("birthdayPopupPhoto");
  const popupTitle = document.getElementById("birthdayPopupTitle");
  const popupDate = document.getElementById("birthdayPopupDate");

  function parseBirthday(text) {
    if (!text) return null;
    const match = text.trim().match(/^(\d{1,2})\s+([A-Za-zÀ-ÿ]+)\s+(\d{4})$/i);
    if (!match) return null;
    
    const day = Number(match[1]);
    const month = monthNames.findIndex(m => m.toLowerCase() === match[2].toLowerCase());
    
    if (month < 0 || !Number.isInteger(day)) return null;
    return { day, month, year: Number(match[3]) };
  }

  const students = cards.map(card => {
    const name = card.querySelector("h3")?.textContent.trim();
    const dateText = card.querySelector("p")?.textContent.trim();
    const photo = card.querySelector("img")?.getAttribute("src");
    const birthday = dateText ? parseBirthday(dateText) : null;
    const countdown = card.querySelector(".birthday-countdown");

    if (!name || !birthday || !countdown) return null;
    return { card, name, photo, dateText, birthday, countdown };
  }).filter(Boolean);

  function getNextBirthday(birthday, now) {
    let nextBirthday = new Date(now.getFullYear(), birthday.month, birthday.day, 0, 0, 0, 0);
    if (nextBirthday.getTime() <= now.getTime()) {
      nextBirthday = new Date(now.getFullYear() + 1, birthday.month, birthday.day, 0, 0, 0, 0);
    }
    return nextBirthday;
  }

  function formatCountdown(milliseconds) {
    let totalSeconds = Math.floor(milliseconds / 1000);
    if (totalSeconds < 0) totalSeconds = 0;
    
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    return `${days} hari ${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  function updateCountdowns() {
    const now = new Date();
    students.forEach(student => {
      const isBirthdayToday = now.getDate() === student.birthday.day && now.getMonth() === student.birthday.month;
      
      if (isBirthdayToday) {
        student.countdown.textContent = "🎉 HARI INI!";
        student.countdown.classList.add("birthday-today");
        student.card.classList.add("birthday-today-card");
        return;
      }

      const nextBirthday = getNextBirthday(student.birthday, now);
      const difference = nextBirthday.getTime() - now.getTime();
      
      student.countdown.textContent = "🎂 " + formatCountdown(difference) + " lagi";
      student.countdown.classList.remove("birthday-today");
      student.card.classList.remove("birthday-today-card");
    });
  }

  updateCountdowns();
  setInterval(updateCountdowns, 1000);

  function showBirthdayPopup(student) {
    if (!popup) return;
    popupPhoto.src = student.photo || "";
    popupPhoto.alt = `Foto ${student.name}`;
    popupTitle.textContent = `🎉 Selamat Ulang Tahun, ${student.name}!`;
    popupDate.textContent = `Lahir: ${student.dateText}`;
    
    popup.hidden = false;
    popup.setAttribute("aria-hidden", "false");
    document.body.classList.add("birthday-popup-open");
    requestAnimationFrame(() => popup.classList.add("show"));
  }

  function closeBirthdayPopup() {
    if (!popup || popup.hidden) return;
    popup.classList.remove("show");
    popup.setAttribute("aria-hidden", "true");
    document.body.classList.remove("birthday-popup-open");
    setTimeout(() => { popup.hidden = true; }, 250);
  }

  if (popup) {
    popup.querySelectorAll("[data-birthday-close]").forEach(button => {
      button.addEventListener("click", closeBirthdayPopup);
    });
    document.addEventListener("keydown", event => {
      if (event.key === "Escape") closeBirthdayPopup();
    });
  }

  const now = new Date();
  const todayKey = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
  const shownKey = sessionStorage.getItem("birthdayPopupShown");
  const todaysBirthdays = students.filter(student => student.birthday.day === now.getDate() && student.birthday.month === now.getMonth());

  if (todaysBirthdays.length && shownKey !== todayKey) {
    let index = 0;
    const showNext = () => {
      if (index >= todaysBirthdays.length) return;
      showBirthdayPopup(todaysBirthdays[index]);
      index++;
      
      if (index < todaysBirthdays.length) {
        const closeButton = popup?.querySelector(".birthday-popup-close");
        const handler = () => {
          closeButton?.removeEventListener("click", handler);
          setTimeout(showNext, 300);
        };
        closeButton?.addEventListener("click", handler);
      }
    };
    
    sessionStorage.setItem("birthdayPopupShown", todayKey);
    setTimeout(showNext, 700);
  }
});

/* =========================================
   5. FITUR ACAK KELOMPOK (HALAMAN BARU)
========================================= */
// Silakan ganti atau tambah nama-nama siswa di bawah ini sesuai absen kelas Anda
const daftarSiswa = [
  "Adyta Rizki", "Afif Nur H", "Alena Baby S", "Ananda Nauval B", "Antara Banyu P",
  "Bagus Arrasyid R", "Calista Azra R", "Cristian Tisya A", "Deandra Bylva K", "Deka Fajar B.A",
  "Desta Nur E", "Difa Milkalia A", "Efraim Aditya", "Elhib Maouly Saputri Alk", "Erniesya Kurniasih",
  "Erwina Widya N", "Evan Putra P", "Fajar Hidayah", "Fajri Tahsin B", "Farah Nuralifa",
  "Fatih Badru Z", "Geisha Fauziyah", "Hafsa Lanika M", "Heri Setiawan", "Kevin Veda R",
  "Kiano Mahendra Gusti K", "Lusy Lukita S", "Medyna Aisya A", "Rakha Syakir W", "Saumi Racika Z",
  "Tatas Kesuma J", "Titis Alifia", "Valen Aulia S", "Yuanita Kusuma N", "Zidan Agil N"
];

function generateKelompok() {
  const tipeBagi = document.querySelector('input[name="tipeBagi"]:checked');
  const inputJumlah = parseInt(document.getElementById("inputJumlah").value);
  const hasilContainer = document.getElementById("hasilKelompok");

  // Validasi Input
  if (!tipeBagi || isNaN(inputJumlah) || inputJumlah <= 0) {
    alert("Silakan masukkan jumlah angka yang valid!");
    return;
  }

  // 1. Acak array siswa (menggunakan Algoritma Fisher-Yates supaya benar-benar acak)
  let acakSiswa = [...daftarSiswa];
  for (let i = acakSiswa.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [acakSiswa[i], acakSiswa[j]] = [acakSiswa[j], acakSiswa[i]];
  }

  let kelompok = [];

  // 2. Logika Pembagian
  if (tipeBagi.value === "jumlahKelompok") {
    // Mode 1: Dibagi menjadi X kelompok
    const numGroups = inputJumlah;
    if (numGroups > acakSiswa.length) {
      alert("Jumlah kelompok tidak boleh lebih dari jumlah siswa!");
      return;
    }
    
    for (let i = 0; i < numGroups; i++) {
      kelompok.push([]);
    }
    
    acakSiswa.forEach((siswa, index) => {
      kelompok[index % numGroups].push(siswa);
    });

  } else if (tipeBagi.value === "jumlahAnak") {
    // Mode 2: X anak per kelompok
    const perGroup = inputJumlah;
    if (perGroup > acakSiswa.length) {
      alert("Jumlah anak per kelompok tidak boleh lebih dari jumlah siswa!");
      return;
    }

    for (let i = 0; i < acakSiswa.length; i += perGroup) {
      kelompok.push(acakSiswa.slice(i, i + perGroup));
    }
  }

  // 3. Tampilkan Hasil ke HTML
  hasilContainer.innerHTML = ""; 
  
  kelompok.forEach((grup, index) => {
    const grupDiv = document.createElement("div");
    grupDiv.className = "kelompok-card";
    
    const judul = document.createElement("h3");
    judul.innerText = `Kelompok ${index + 1}`;
    grupDiv.appendChild(judul);

    const list = document.createElement("ul");
    grup.forEach(nama => {
      const li = document.createElement("li");
      li.innerText = nama;
      list.appendChild(li);
    });
    
    grupDiv.appendChild(list);
    hasilContainer.appendChild(grupDiv);
  });
}