// Create a list item for the program
function titleDetailsLi(title, details1, details2) {
  let li = document.createElement('li');

  if (title) {
    let span = document.createElement('span');
    span.className = "title";
    span.innerText = title;
    li.appendChild(span);

    if (details1 || details2) {
      let div = document.createElement('div');
      div.className = "details";
      li.appendChild(div);
      if (details1) {
        let span = document.createElement('span');
        span.className = "details1";
        span.innerText = details1;
        div.appendChild(span);
      }
      if (details2) {
        let span = document.createElement('span');
        span.className = "details2";
        span.innerText = details2;
        div.appendChild(span);
      }
    } else {
      li.className = 'title-only';
    }

    return new XMLSerializer().serializeToString(li);
  } else {
    return '<li class="blank-line" aria-hidden="true"></li>';
  }
}

// Convert JSON program to HTML
function programAsHtml(programData, locale) {
  console.log(programData);
  let html = '';

  let dateTime = (programData.general.date && programData.general.startTime) ? new Date(`${programData.general.date}T${programData.general.startTime}`) : nextSunday();
  let formattedDate = datePrettyFormat(dateTime, locale);
  let sacramentMeetingTimeRange = datePrettyTimeRange(dateTime, addMinutes(dateTime, 60), locale);

  html += `
    <section id="sacrament-meeting">
      <h2>
        Sacrament Meeting, ${formattedDate}<br>
        <small>${sacramentMeetingTimeRange}</small>
      </h2>
      <div id="header-people">
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
  html += titleDetailsLi();
  html += titleDetailsLi('Welcome', programData.header.conducting);
  html += titleDetailsLi();
  html += titleDetailsLi('Opening Hymn', programData.proceedings.openingHymn);
  html += titleDetailsLi('Opening Prayer', programData.proceedings.openingPrayer);
  html += titleDetailsLi();

  // Ward business
  for (item of programData.proceedings.wardBusiness) {
    html += titleDetailsLi(item.title, item.details || programData.header.conducting);
  }
  html += titleDetailsLi();

  // Sacrament
  let sacramentInfo = '';
  sacramentInfo += titleDetailsLi('Sacrament Hymn', programData.proceedings.sacramentHymn);
  sacramentInfo += titleDetailsLi();
  sacramentInfo += titleDetailsLi('Blessing and Passing of the Sacrament');
  sacramentInfo += titleDetailsLi();
  if (!programData.proceedings.sacramentAtEnd) {
    html += sacramentInfo;
  }

  // Talks, music, special programs, etc.
  for (item of programData.proceedings.orderedItems) {
    html += titleDetailsLi(item.title, item.details1, item.details2);
    html += titleDetailsLi();
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
          Second-Hour Meetings<br>
          <small>${secondHourTimeRange}</small>
        </h2>
        <ul class="proceedings">
      `;
    for (item of programData.secondHour) {
      html += titleDetailsLi(item.meeting, item.location);
    }

  }

  return html;
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
  return date.toISOString().substr(0, 10);
}

// Add minutes to a date object
// See https://stackoverflow.com/a/1214753/1349044
function addMinutes(dateTime, minutes) {
  return new Date(dateTime.getTime() + (minutes * 60000));
}
