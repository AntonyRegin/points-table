let teams = {};
let dbRef = firebase.database().ref("tournament");

// Convert 19.3 overs → 19 + 3/6 = 19.5
function parseOvers(overs) {
  const parts = overs.toString().split(".");
  const fullOvers = parseInt(parts[0]);
  const balls = parseInt(parts[1] || 0);
  return fullOvers + balls / 6;
}

function startNew() {
  if (confirm("This will erase previous data. Continue?")) {
    dbRef.remove().then(() => {
      document.getElementById("startup").classList.add("hidden");
      document.getElementById("teamForm").classList.remove("hidden");
    });
  }
}

function loadPrevious() {
  dbRef.child("teams").once("value", snapshot => {
    teams = snapshot.val() || {};
    renderPointsTable();
    populateTeamDropdowns();
    document.getElementById("startup").classList.add("hidden");
    document.getElementById("matchForm").classList.remove("hidden");
    document.getElementById("pointsTable").classList.remove("hidden");
  });
}

function generateTeamInputs() {
  const count = parseInt(document.getElementById("teamCount").value);
  const container = document.getElementById("teamInputs");
  container.innerHTML = "";
  for (let i = 0; i < count; i++) {
    container.innerHTML += `<input class="border p-2 w-full rounded" type="text" placeholder="Team ${i + 1} Name" id="team${i}"/>`;
  }
  container.innerHTML += `<button onclick="saveTeams(${count})" class="bg-blue-500 text-white mt-4 px-4 py-2 rounded-xl">Save Teams</button>`;
}

function saveTeams(count) {
  for (let i = 0; i < count; i++) {
    const name = document.getElementById(`team${i}`).value.trim();
    if (name) {
      teams[name] = {
        name,
        played: 0,
        won: 0,
        lost: 0,
        draw: 0,
        points: 0,
        runsScored: 0,
        oversFaced: 0,
        runsConceded: 0,
        oversBowled: 0,
        nrr: 0
      };
    }
  }
  dbRef.child("teams").set(teams);
  document.getElementById("teamForm").classList.add("hidden");
  document.getElementById("matchForm").classList.remove("hidden");
  document.getElementById("pointsTable").classList.remove("hidden");
  populateTeamDropdowns();
  renderPointsTable();
}

function populateTeamDropdowns() {
  const teamA = document.getElementById("teamA");
  const teamB = document.getElementById("teamB");
  teamA.innerHTML = "";
  teamB.innerHTML = "";
  for (let key in teams) {
    teamA.innerHTML += `<option value="${key}">${teams[key].name}</option>`;
    teamB.innerHTML += `<option value="${key}">${teams[key].name}</option>`;
  }
}

document.getElementById("matchInputForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const aName = document.getElementById("teamA").value;
  const bName = document.getElementById("teamB").value;
  const aRuns = parseInt(document.getElementById("aRuns").value);
  const aOvers = parseOvers(document.getElementById("aOvers").value);
  const bRuns = parseInt(document.getElementById("bRuns").value);
  const bOvers = parseOvers(document.getElementById("bOvers").value);
  const result = document.getElementById("result").value;

  let teamA = teams[aName];
  let teamB = teams[bName];

  // Update match counts
  teamA.played += 1;
  teamB.played += 1;

  if (result === "A") {
    teamA.won += 1;
    teamB.lost += 1;
    teamA.points += 3;
  } else if (result === "B") {
    teamB.won += 1;
    teamA.lost += 1;
    teamB.points += 3;
  } else {
    teamA.draw += 1;
    teamB.draw += 1;
    teamA.points += 1;
    teamB.points += 1;
  }

  // Update run stats
  teamA.runsScored += aRuns;
  teamA.oversFaced += aOvers;
  teamA.runsConceded += bRuns;
  teamA.oversBowled += bOvers;

  teamB.runsScored += bRuns;
  teamB.oversFaced += bOvers;
  teamB.runsConceded += aRuns;
  teamB.oversBowled += aOvers;

  // Calculate NRR
  teamA.nrr = ((teamA.runsScored / teamA.oversFaced) - (teamA.runsConceded / teamA.oversBowled)).toFixed(2);
  teamB.nrr = ((teamB.runsScored / teamB.oversFaced) - (teamB.runsConceded / teamB.oversBowled)).toFixed(2);

  // Save back
  teams[aName] = teamA;
  teams[bName] = teamB;

  dbRef.child("teams").set(teams);
  renderPointsTable();
  document.getElementById("matchInputForm").reset();
});

function renderPointsTable() {
  const body = document.getElementById("pointsBody");
  const sorted = Object.values(teams).sort((a, b) => b.points - a.points || b.nrr - a.nrr);
  body.innerHTML = "";
  for (let t of sorted) {
    body.innerHTML += `
      <tr class="border-b border-purple-200">
        <td class="p-2">${t.name}</td>
        <td class="p-2">${t.played}</td>
        <td class="p-2">${t.won}</td>
        <td class="p-2">${t.lost}</td>
        <td class="p-2">${t.draw}</td>
        <td class="p-2">${t.points}</td>
        <td class="p-2">${t.nrr}</td>
      </tr>`;
  }
}
