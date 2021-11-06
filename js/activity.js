var state = {
  selected_tags: new Array(),
  supply: undefined,
  time: 0,
  searchValue: '',
  activities: null,
  searchType: 'name'
};

var green = '#a8d370';
var yellow = '#fcd027';
var orange = '#FFA500';
var brown = '#cdb366';

var onMouseFirstTime = true;

function compareObjects(object1, object2, asc, key) {
  let obj1 = object1[key]
  let obj2 = object2[key]
  if (key === 'name') {
    obj1 = obj1.toUpperCase()
    obj2 = obj2.toUpperCase()
  }
  if (obj1 < obj2)
    return asc ? -1 : 1
  if (obj1 > obj2)
    return asc ? 1 : -1
  return 0
}

async function sortData(arr, asc, key) {
  let a = await arr.sort((a, b) => {
    return compareObjects(a, b, asc, key)
  });
  return a
}

// Defining async function
async function getapi() {
  deleteEntries();
  // Storing response
  const response = await fetch('https://api-wellness.azurewebsites.net/activities');
  // Storing data in form of JSON
  var data = await response.json();
  state.activities = await sortData(data, true, 'name');
  sortElements();
}

function displayAltOption() {
  if (onMouseFirstTime) {
    if (document.getElementById('search-type').innerHTML === 'Description')
      document.getElementById('search-type').innerHTML = 'Name'
    else
      document.getElementById('search-type').innerHTML = 'Description'
  }
}

function hideAltOption() {
  if (onMouseFirstTime) {
    if (document.getElementById('search-type').innerHTML === 'Description')
      document.getElementById('search-type').innerHTML = 'Name'
    else
      document.getElementById('search-type').innerHTML = 'Description'
  }
  onMouseFirstTime = true;
}

function changeSearchType() {
  onMouseFirstTime = false;
  if (state.searchType === 'name') {
    document.getElementById('search-type').innerHTML = 'Description'
    state.searchType = 'description'
  } else {
    document.getElementById('search-type').innerHTML = 'Name'
    state.searchType = 'name'
  }
  clickSearch();
}

async function sortElements() {
  var val = document.getElementById("sortSelect").value;
  deleteEntries();
  if (val === 'az') {
    state.activities = await sortData(state.activities, true, 'name');
  } else if (val === 'za') {
    state.activities = await sortData(state.activities, false, 'name');
  } else if (val === 'time-asc') {
    state.activities = await sortData(state.activities, true, 'time');
  } else if (val === 'time-desc') {
    state.activities = await sortData(state.activities, false, 'time');
  }
  await show(state.activities)
    .then(
      document.getElementById('loading').style.display = 'none');
}

async function show(data) {
  let tab = '';
  document.getElementById('activitiesCount').innerHTML = `Found ${data.length} activities`
  if (data.length === 0)
    tab = `<div class="card" style="background-color: white;"><br/><p style='text-align: center;'>No results</p><br/></div>`
  else {
    tab = `<div id='results-list'>`;
    // Loop to access all rows 
    for (let row in data) {
      let tags = '';
      let supply = '-';
      let teams = '';
      if (data[row].supply !== '')
        supply = data[row].supply;
      for (let i = 0; i < data[row].tags.length; i++) {
        if (state.selected_tags.includes(data[row].tags[i]))
          tags += `<button class='btnTag' style="font-weight:bold; font-size: 0.85em; background-color:${orange}" >${data[row].tags[i].toUpperCase()}</button>`
        else
          tags += `<button style="font-weight:bold; font-size: 0.85em; background-color:${yellow}" class='btnTag'>${data[row].tags[i].toUpperCase()}</button>`
        if (data[row].tags[i] === 'Virtual') {
          teams = `<a style='text-decoration:none;' target="_blank" href="https://teams.live.com/_#/conversations/newchat?ctx=chat">
                    <div class='parent' style='justify-content: unset;'>
                      <img style="width:30px;" src="https://img.icons8.com/color/48/000000/microsoft-teams.png"/>
                      <p style='margin: auto 0.3em;font-size:0.8em;'>Start a meeting</p>
                    </div>
                    </a>`
        }
      }
      tab += `
      <div class="card" style="background-color: white; border: 2px solid black;">
        <div class="card-body">
          <h5 style="font-weight:bold; text-align:centre; border-bottom: 1px solid #ced4da; padding: 2%;" class="card-title">${data[row].name}</h5>
          <div class='parent' id='parent_card'>
            <div class='children' style="text-align: left; flex: 2;">
              <div class="card-footer text-muted">
                <p>
                  <span style='font-weight:bolder; color:black;'>Estimated time: </span>${data[row].time} min
                </p>
                <p>
                  <span style='font-weight:bolder; color:black;'>Supply: </span>${supply}
                </p>
                ` + teams + `
              </div>
              <div id='tags_desktop'></br>` + tags + `</div>
            </div>
            <div class='children' style="flex: 3;">
              <p style="font-weight: 500; padding: 2%; text-align: left;" class="card-text">${data[row].description}</p>
            </div>
          </div>
        </div>
        <div style='text-align:center;' id='tags_mobile'>` + tags + `
        </div>
      </div>
    </br>`;
    }
  }
  tab += `</div>`
  // Setting innerHTML as tab variable
  document.getElementById("results").innerHTML = tab;
}

function selectDefaultEvents() {
  getSpecialEvent();
  document.getElementById('all').click();
}

function selectDefaultEventsIndex() {
  getSpecialEvent();
}

async function getSpecialEvent() {
  const response = await fetch('https://api-wellness.azurewebsites.net/activities/calendar');
  // Storing data in form of JSON
  var data = await response.json();
  var currentYear = new Date().getFullYear();
  var dates = data.map(object => {
    return {
      ...object,
      dateFormat: new Date(`${object.date}/${currentYear}`)
    }
  });
  var today = new Date()
  var sorted = dates.sort(function (a, b) {
    var distancea = Math.abs(today - a.dateFormat);
    var distanceb = Math.abs(today - b.dateFormat);
    return distancea - distanceb; // sort a before b when the distance is smaller
  });
  let str = `Celebrate ${sorted[0].name} on ${sorted[0].dateFormat.getDate()} ${sorted[0].dateFormat.toLocaleString('default', { month: 'long' })}`
  document.getElementById('specialDay').innerHTML = str
}

function changeColor(value, color) {
  document.getElementById(value).style = `background-color: ${color} !important;`
}

async function showOccasion(e) {
  let event = e || window.event;
  let value = event.target.value;
  deleteEntries();
  //if previously clicked
  if (document.getElementById(value).style.backgroundColor == 'rgb(255, 165, 0)') {
    document.getElementById('all').click();
    if (value === 'Christmas')
      changeColor(value, green);
    else
      changeColor(value, brown);
  } else {
    resetTags()
    let respone;
    if (value === 'Christmas') {
      changeColor('Thanksgiving', brown);
      response = await fetch('https://api-wellness.azurewebsites.net/activities/christmas');
    } else if (value === 'Thanksgiving') {
      changeColor('Christmas', green);
      response = await fetch('https://api-wellness.azurewebsites.net/activities/thanksgiving');
    }
    // Storing data in form of JSON
    var data = await response.json();
    state.activities = await sortData(data, true, 'name');
    changeColor('all', yellow);
    changeColor(value, orange);
  }
  sortElements();
  document.getElementById("results-page").scrollIntoView();
}

function changeTag(e) {
  let event = e || window.event;
  let value = event.target.value;

  //remove occasion events
  changeColor('Christmas', green);
  changeColor('Thanksgiving', brown);

  //change color
  if (value === 'all') {
    resetTags();
    document.getElementById('searchInput').value = '';
    getapi();
    return;
  } else {
    if (document.getElementById(value).style.backgroundColor == 'rgb(255, 165, 0)') {
      const index = state.selected_tags.indexOf(value);
      if (index > -1) {
        state.selected_tags.splice(index, 1);
      }
      changeColor(value, yellow);
    } else {
      state.selected_tags.push(value);
      changeColor(value, orange);
    }
    if (value !== 'all')
      changeColor('all', yellow);
  }
  if (state.selected_tags.length == 0)
    changeColor('all', orange);
  updateResults();
}

function changeSupply(e) {
  changeColor('Christmas', green);
  changeColor('Thanksgiving', brown);
  let event = e || window.event;
  let value = event.target.value;
  if (value === 'supply' && state.supply !== true) {
    changeColor(value, orange);
    changeColor('no-supply', yellow);
    state.supply = true;
  } else if (value === 'supply' && state.supply === true) {
    changeColor(value, yellow);
    state.supply = undefined;
  } else if (value === 'no-supply' && state.supply === true || state.supply == undefined) {
    state.supply = false;
    changeColor('supply', yellow);
    changeColor('no-supply', orange);
  } else if (value === 'no-supply' && state.supply === false) {
    changeColor('no-supply', yellow);
    state.supply = undefined;
  }
  updateResults();
}

function changeTime(e) {
  changeColor('Christmas', green);
  changeColor('Thanksgiving', brown);
  let event = e || window.event;
  let value = event.target.value;
  for (let i = 0; i < 5; i++) {
    document.getElementsByClassName('btn time')[i].style = `background-color:${yellow}!important;`;
  }

  if (state.time === parseInt(value, 10)) {
    changeColor(value, yellow);
    state.time = 0;
  } else {
    changeColor(value, orange);
    state.time = parseInt(value, 10);
  }
  updateResults();
}

function deleteEntries() {
  // Setting innerHTML as tab variable
  document.getElementById('loading').style.display = 'block';
  if (document.getElementById("results-list"))
    document.getElementById("results-list").innerHTML = "";
}

async function updateResults() {
  let response;
  deleteEntries();
  if (state.supply)
    supply = 'supply';
  else if (state.supply == undefined)
    supply = 'undefined';
  else if (state.supply === false)
    supply = 'none';

  if (state.selected_tags.length === 0)
    response = await fetch(`https://api-wellness.azurewebsites.net/activities/${supply}/${state.time}`);
  else {
    let arrStr = encodeURIComponent(JSON.stringify(state.selected_tags));
    response = await fetch(`https://api-wellness.azurewebsites.net/activities/${supply}/${state.time}/${arrStr}`);
  }
  // Storing data in form of JSON
  var data = await response.json();
  state.activities = await data;
  sortElements();
}

function resetTags() {
  changeColor('all', orange);
  for (let i = 0; i < state.selected_tags.length; i++)
    changeColor(state.selected_tags[i], yellow);
  for (let i = 0; i < 5; i++) {
    document.getElementsByClassName('btn time')[i].style = `background-color:${yellow}!important;`;
  }
  changeColor('supply', yellow);
  changeColor('no-supply', yellow);
  state.selected_tags = [];
  state.supply = undefined;
  state.time = 0;
  state.activities = null;
}

function scrollToSearch() {
  document.getElementById("search_child").scrollIntoView();
}

async function clickSearch(e) {
  changeColor('Christmas', green);
  changeColor('Thanksgiving', brown);
  resetTags();
  let value = document.getElementById('searchInput').value.trim();
  state.searchValue = value;
  if (e && e.keyCode == 13) {
    document.getElementById("results-page").scrollIntoView();
  }
  if (state.searchValue === '') {
    deleteEntries();
    await getapi();
  } else {
    deleteEntries();
    // Storing response
    let response = await fetch(`https://api-wellness.azurewebsites.net/activities/${state.searchType}/${state.searchValue}`);
    // Storing data in form of JSON
    var data = await response.json();
    state.activities = await data;
    await sortElements();
    //highlight the activities
    if (state.searchValue !== "" && state.activities.length !== 0) {
      //convert to Upper Case
      const arr = state.searchValue.split(" ");
      for (var i = 0; i < arr.length; i++) {
        arr[i] = arr[i].charAt(0).toUpperCase() + arr[i].slice(1);
      }
      const nameToUpper = arr.join(" ");
      let divText;
      if (state.searchType === 'name')
        divText = document.getElementsByClassName("card-title");
      else
        divText = document.getElementsByClassName("card-text");
      for (let index in divText) {
        let text = divText[index].innerHTML
        let re = new RegExp(state.searchValue, "g"); // search for all instances
        let re2 = new RegExp(nameToUpper, "g");
        let newText = text.replace(re, `<mark>${state.searchValue}</mark>`);
        newText = newText.replace(re2, `<mark>${nameToUpper}</mark>`);
        divText[index].innerHTML = newText;
      }
    }
  }
}