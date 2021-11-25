// Create a list item for the program
function titleDetailsLi(title, details, subtitle) {
  let li = document.createElement('li');

  if (title) {
    let span = document.createElement('span');
    span.className = "title";
    span.innerText = title;
    li.appendChild(span);

    if (details) {
      let span = document.createElement('span');
      span.className = "details";
      span.innerText = details;
      li.appendChild(span);
    } else {
      li.className = 'no-details';
    }
    if (subtitle) {
      let span = document.createElement('span');
      span.className = "subtitle";
      span.innerText = subtitle;
      li.appendChild(span);
    }

    return new XMLSerializer().serializeToString(li);
  } else {
    return '<li class="blank-line" aria-hidden="true"></li>';
  }
}

// Convert JSON program to HTML
function programPageAsHtml(programData, locale) {
  console.log(programData);
  let html = '';

  let dateTime = (programData.general.date && programData.general.startTime) ? new Date(`${programData.general.date}T${programData.general.startTime}`) : nextSunday();
  let formattedDate = datePrettyFormat(dateTime, locale);
  let sacramentMeetingTimeRange = datePrettyTimeRange(dateTime, addMinutes(dateTime, 60), locale);

  html += `
    <section id="sacrament-meeting">
      <h2>
        Sacrament Meeting
        <span class="date">${formattedDate}</span>
        <span class="time">${sacramentMeetingTimeRange}</span>
      </h2>
      <div class="header-people">
        <ul>
          ${titleDetailsLi('Presiding', programData.header.presiding)}
          ${titleDetailsLi('Conducting', programData.header.conducting)}
        </ul>
        <ul>
          ${titleDetailsLi('Music Leader', programData.header.musicLeader)}
          ${titleDetailsLi('Accompanist', programData.header.accompanist)}
        </ul>
      </div>
      <ul class="proceedings">
    `;

  // Beginning of meeting
  if (programData.proceedings.welcome) {
    html += titleDetailsLi('Welcome', programData.header.conducting);
    html += titleDetailsLi();
  }
  html += titleDetailsLi('Opening Hymn', programData.proceedings.openingHymn);
  html += titleDetailsLi('Opening Prayer', programData.proceedings.openingPrayer);
  html += titleDetailsLi();

  // Ward business
  if (programData.proceedings.wardBusiness.length > 0) {
    for (item of programData.proceedings.wardBusiness) {
      html += titleDetailsLi(item.title, item.details || programData.header.conducting);
    }
    html += titleDetailsLi();
  }

  // Sacrament
  let sacramentInfo = '';
  sacramentInfo += titleDetailsLi('Sacrament Hymn', programData.proceedings.sacramentHymn);
  sacramentInfo += titleDetailsLi('Blessing and Passing of the Sacrament');
  if (!programData.proceedings.sacramentAtEnd) {
    html += sacramentInfo;
  }

  // Talks, music, special programs, etc.
  if (programData.proceedings.testimonyMeeting) {
    html += titleDetailsLi('Testimony Meeting');
  }
  if (programData.proceedings.orderedItems.length > 0) {
    for (item of programData.proceedings.orderedItems) {
      html += titleDetailsLi(item.title, item.details, item.subtitle);
      html += titleDetailsLi();
    }
  }

  // End of meeting
  html += titleDetailsLi('Closing Hymn', programData.proceedings.closingHymn);
  html += titleDetailsLi('Closing Prayer', programData.proceedings.closingPrayer);
  html += titleDetailsLi();

  // Sacrament (at end of meeting)
  if (programData.proceedings.sacramentAtEnd) {
    html += sacramentInfo;
  }

  html += `
      </ul>
    </section>
    `;

  // Second-hour meetings
  if (programData.secondHour.length > 0) {
    let secondHourTimeRange = datePrettyTimeRange(addMinutes(dateTime, 70), addMinutes(dateTime, 120), locale);
    html += `
      <section id="second-hour-meetings">
        <h2>
          Second-Hour Meetings
          <span class="time">${secondHourTimeRange}</span>
        </h2>
        <ul class="proceedings">
      `;
    for (item of programData.secondHour) {
      html += titleDetailsLi(item.meeting, item.location);
    }

  }

  return `<div class="program-page">${html}</div>`;
}

// Get the date of the next Sunday
// See https://stackoverflow.com/questions/1579010/get-next-date-from-weekday-in-javascript
function nextSunday() {
  var date = new Date();
  date.setDate(date.getDate() + (6 - date.getDay()) % 7 + 1);
  date.setHours(9, 0, 0)
  return date;
}

// Format date: January 1, 2021
function datePrettyFormat(date, locale) {
  return new Intl.DateTimeFormat(locale, { dateStyle: 'long' }).format(date);
}

// Format date/time range: 9:00 AM – 10:00 AM
function datePrettyTimeRange(startDate, endDate, locale) {
  return new Intl.DateTimeFormat(locale, { hour: 'numeric', minute: 'numeric' }).formatRange(startDate, endDate);
}

// Format date: 2021-01-01
function dateIsoString(date) {
  if (!date) date = nextSunday();
  return date.toISOString().substr(0, 10);
}

// Add minutes to a date object
// See https://stackoverflow.com/a/1214753/1349044
function addMinutes(dateTime, minutes) {
  return new Date(dateTime.getTime() + (minutes * 60000));
}


// Print page content
window.addEventListener('beforeprint', function(e) {
  let program = document.querySelector('.program');
  program.dataset.theme = 'light';
  program.classList.add('print-area');
  if (window.safari !== undefined) {
    program.classList.add('safari');
  }

  // Create a duplicate page (for printing two programs per page)
  let page2 = program.querySelector('.program-page').cloneNode(true);
  page2.id = 'page2';
  page2.classList.add('print-only');
  program.appendChild(page2);
});
window.addEventListener('afterprint', function(e) {
  document.getElementById('page2').remove();
  let program = document.querySelector('.program');
  program.dataset.theme = '';
  program.classList.remove('print-area', 'safari');
});
