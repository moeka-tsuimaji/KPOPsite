let idols = []; 
const yearInput = document.getElementById("yearInput"); 
const searchBtn = document.getElementById("searchBtn"); 
const resultDiv = document.getElementById("result"); 
const tabs = document.getElementById("tabs"); 
const tabButtons = tabs.querySelectorAll(".tab"); 
const loading = document.getElementById("loading"); 

let filtered = []; 

/* ------------------------- 
JSON読み込み 
------------------------- */
fetch("idolData.json")
  .then(res => res.json())
  .then(data => {
      const map = {};
       data.forEach(groupData => {
          groupData.members.forEach(m => {
              const key = `${m.name}_${m.birth}`;
              if (!map[key]) {
                  map[key] = {
                      name: m.name,
                      birth: m.birth,
                      groups: [],
                      debutYears: []
                  };
              }
              map[key].groups.push(groupData.group);
              map[key].debutYears.push(groupData.debutYear);
          });
      });
      idols = Object.values(map);
  });

  // idolData は idolData.js から読み込まれている
//const map = {};
//idolData.forEach(groupData => {
//  groupData.members.forEach(m => {
//    const key = `${m.name}_${m.birth}`;
//    if (!map[key]) {
//     map[key] = {
//        name: m.name,
//        birth: m.birth,
//        groups: [],
//        debutYears: []
//      };
//   }
//    map[key].groups.push(groupData.group);
//    map[key].debutYears.push(groupData.debutYear);
//  });
//});
//const idols = Object.values(map);

/* -------------------------
   検索
------------------------- */
searchBtn.addEventListener("click", () => {
  searchBtn.classList.add("shine");
  setTimeout(() => searchBtn.classList.remove("shine"), 800);

  const year = yearInput.value.trim();
  resultDiv.innerHTML = "";
  resultDiv.classList.remove("show");
  loading.style.display = "block";

  if (year === "") {
    resultDiv.textContent = "年を入力してください。";
    loading.style.display = "none";
    return;
  }

  setTimeout(() => {
    filtered = idols.filter(idol => idol.birth.startsWith(year));
    loading.style.display = "none";

    if (filtered.length === 0) {
      resultDiv.textContent = `${year}年生まれのアイドルは見つかりません。`;
      tabs.style.display = "none";
      resultDiv.classList.add("show");
      return;
    }

    tabs.style.display = "flex";
    tabButtons.forEach(t => t.classList.remove("active"));
    tabButtons[0].classList.add("active");

    showAllView();
  }, 400);
});

/* -------------------------
   タブ切り替え
------------------------- */
tabButtons.forEach(tab => {
  tab.addEventListener("click", () => {
    tabButtons.forEach(t => t.classList.remove("active"));
    tab.classList.add("active");

    const mode = tab.dataset.tab;

    resultDiv.classList.remove("show");

    setTimeout(() => {
      resultDiv.innerHTML = "";
      if (mode === "all") showAllView();
      else if (mode === "group") showGroupView();
      else if (mode === "month") showMonthView();
    }, 250);
  });
});

/* -------------------------
   表示アニメ
------------------------- */
function animateResult() {
  requestAnimationFrame(() => {
    resultDiv.classList.add("show");
  });
}

/* -------------------------
   全員表示（カード）
------------------------- */
function showAllView() {
  const sorted = filtered.sort((a,b) => new Date(a.birth) - new Date(b.birth));
  const container = document.createElement("div");
  container.className = "card-container";

  sorted.forEach((idol, i) => {
    const card = document.createElement("div");
    card.className = "card";
    card.style.opacity = "0";
    card.style.transform = "translateY(20px)";
    card.innerHTML = `
      <strong>${idol.name}</strong><br>
      ${idol.birth}<br>
      <small>${idol.groups.join(", ")}</small>
    `;
    container.appendChild(card);

    setTimeout(() => {
      card.style.opacity = "1";
      card.style.transform = "translateY(0)";
    }, 80 * i);
  });

  resultDiv.appendChild(container);
  animateResult();
}

/* -------------------------
   グループ別
------------------------- */
function showGroupView() {
  const grouped = {};
  filtered.forEach(idol => {
    idol.groups.forEach(g => {
      if (!grouped[g]) grouped[g] = [];
      grouped[g].push(idol);
    });
  });

  resultDiv.className = "list-group";

  const sortedGroups = Object.keys(grouped).sort(); // ⭐アルファベット順

  sortedGroups.forEach(group => {
    const h2 = document.createElement("h2");
    h2.textContent = group;
    h2.classList.add("fade-item");
    resultDiv.appendChild(h2);

    setTimeout(() => h2.classList.add("show"), 50);

    grouped[group]
      .sort((a,b)=> new Date(a.birth) - new Date(b.birth))
      .forEach((idol, i) => {
        const p = document.createElement("p");
        p.textContent = `${idol.name} (${idol.birth})`;
        p.classList.add("fade-item");
        resultDiv.appendChild(p);

        setTimeout(() => p.classList.add("show"), 100 * (i + 1));
      });
  });

  animateResult();
}

/* -------------------------
   誕生月別
------------------------- */
function showMonthView() {
  const months = {};
  for (let i = 1; i <= 12; i++) {
    months[i.toString().padStart(2,"0")] = [];
  }

  filtered.forEach(idol => {
    const m = idol.birth.slice(5,7);
    months[m].push(idol);
  });

  resultDiv.className = "list-month";

  for (let i = 1; i <= 12; i++) {
    const key = i.toString().padStart(2,"0");
    const list = months[key];

    const section = document.createElement("div");

    const h2 = document.createElement("h2");
    h2.textContent = `${i}月`;
    h2.classList.add("fade-item");
    section.appendChild(h2);

    setTimeout(() => h2.classList.add("show"), 50);

    list
      .sort((a,b)=> new Date(a.birth) - new Date(b.birth))
      .forEach((idol, idx) => {
        const p = document.createElement("p");
        p.textContent = `${idol.name} (${idol.birth}) - ${idol.groups.join(", ")}`;
        p.classList.add("fade-item");
        section.appendChild(p);

        setTimeout(() => p.classList.add("show"), 100 * (idx + 1));
      });

    resultDiv.appendChild(section);
  }

  animateResult();
}
