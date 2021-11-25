<template>
  <div id="wrapper">
    <header>
      <h1><client-only><a :href="`/program?ward=${wardSlug}`">{{wardName}}</a></client-only></h1>
      <div v-if="allowEdit && programId">
        <label class="header-radio">
          <input type="radio" value="view" v-model="mode">
          View
        </label>
        <label class="header-radio">
          <input type="radio" value="edit" v-model="mode">
          Edit
        </label>
      </div>
    </header>
    <main>
      <client-only>
        <div id="full-program-picker" v-show="!programId"></div>
        <div class="sliding-sidebar-container" id="sidebar-container" v-show="programId" data-state="open">

          <div class="ssc-main">
            <div class="ssc-titlebar">
              <div class="ssc-titlebar-left">
                <select id="inline-program-picker" v-model="programId"></select>
              </div>
              <div class="ssc-titlebar-right">
                <button type="button" class="inline-button" onclick="try { document.execCommand('print', false, null); } catch { window.print(); }" title="Print" aria-label="Print">
                  <svg class="svg-icon" aria-hidden="true"><use xlink:href="/icons.svg#print"></use></svg>
                </button>
                <button type="button" class="inline-button" onclick="toggleSlidingSidebar('sidebar-container');" title="Edit program" aria-label="Edit program">
                  <svg class="svg-icon" aria-hidden="true"><use xlink:href="/icons.svg#settings"></use></svg>
                </button>
              </div>
            </div>

            <div class="program"></div>
          </div>


          <aside id="sidebar" class="ssc-sidebar">
            <header class="ssc-titlebar">
              <div class="ssc-titlebar-left">
                <button type="button" class="inline-button" onclick="toggleSlidingSidebar('sidebar-container', 'closed');" title="Close sidebar" aria-label="Close sidebar">
                  <svg class="svg-icon" aria-hidden="true"><use xlink:href="/icons.svg#close"></use></svg>
                </button>
                <h2>Edit Program</h2>
              </div>
            </header>

            <div>
              <h3>View options</h3>
              <label>
                Language:
                <select v-model="viewLang">
                  <option value="en-US">English</option>
                </select>
              </label>
              <label>
                Style:
                <select v-model="viewStyle">
                  <option value="traditional">Traditional</option>
                  <option value="modern">Modern</option>
                  <option value="none">None</option>
                </select>
              </label>
              <label>
                Theme:
                <select v-model="viewTheme">
                  <option value="default">System default</option>
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                </select>
              </label>
            </div>
            <div v-if="mode == 'edit'">
              <div v-if="programData">
                <h3>Header</h3>
                <label>
                  Presiding: <input v-model="programData.header.presiding">
                </label>
                <label>
                  Conducting: <input v-model="programData.header.conducting">
                </label>
                <label>
                  Music leader: <input v-model="programData.header.musicLeader">
                </label>
                <label>
                  Accompanist: <input v-model="programData.header.accompanist">
                </label>

                <h3>Opening</h3>
                <label>
                  <input type="checkbox" v-model="programData.proceedings.welcome"> Welcome
                </label>
                <label>
                  Opening hymn: <input v-model="programData.proceedings.openingHymn">
                </label>
                <label>
                  Opening prayer: <input v-model="programData.proceedings.openingPrayer">
                </label>

                <h3>Ward Business</h3>
                <div class="ward-business-item" v-for="(item, index) of programData.proceedings.wardBusiness" :key="`ward-business-${index}`">
                  <label>
                    Title: <input :value="programData.proceedings.wardBusiness[index].title" @input="updateWardBusinessItem(index)">
                  </label>
                  <label>
                    Details: <input :placeholder="programData.header.conducting" :value="programData.proceedings.wardBusiness[index].details" @input="updateWardBusinessItem(index)">
                  </label>
                  <button type="button" @click="removeWardBusinessItem(index)">Remove</button>
                </div>
                <button type="button" @click="addWardBusinessItem()">Add</button>

                <h3>Sacrament</h3>
                <label>
                  Sacrament hymn: <input v-model="programData.proceedings.sacramentHymn">
                </label>
                <label>
                  <input type="checkbox" v-model="programData.proceedings.sacramentAtEnd"> Sacrament at end
                </label>

                <h3>Proceedings</h3>
                <label>
                  <input type="checkbox" v-model="programData.proceedings.testimonyMeeting"> Testimony meeting
                </label>
                <div class="ordered-item" v-for="(item, index) of programData.proceedings.orderedItems" :key="`ordered-${index}`">
                  <label>
                    Title: <input :value="programData.proceedings.orderedItems[index].title" @input="updateOrderedItem(index)">
                  </label>
                  <label>
                    Details: <input :value="programData.proceedings.orderedItems[index].details" @input="updateOrderedItem(index)">
                  </label>
                  <label>
                    Subtitle: <input :value="programData.proceedings.orderedItems[index].subtitle" @input="updateOrderedItem(index)">
                  </label>
                  <button type="button" @click="removeOrderedItem(index)">Remove</button>
                </div>
                <button type="button" @click="addOrderedItem()">Add</button>

                <h3>Closing</h3>
                <label>
                  Closing hymn: <input v-model="programData.proceedings.closingHymn">
                </label>
                <label>
                  Closing prayer: <input v-model="programData.proceedings.closingPrayer">
                </label>

                <h3>Second-Hour Meetings</h3>
                <div class="second-hour-item" v-for="(item, index) of programData.secondHour" :key="`second-hour-${index}`">
                  <label>
                    Meeting: <input :value="programData.secondHour[index].meeting" @input="updateSecondHourItem(index)">
                  </label>
                  <label>
                    Location: <input :value="programData.secondHour[index].location" @input="updateSecondHourItem(index)">
                  </label>
                  <button type="button" @click="removeSecondHourItem(index)">Remove</button>
                </div>
                <button type="button" @click="addSecondHourItem()">Add</button>

                <h3>Print options</h3>
                <label>
                  Language:
                  <select v-model="programData.printOptions.lang">
                    <option value="en-US">English</option>
                  </select>
                </label>
                <label>
                  Style:
                  <select v-model="programData.printOptions.style">
                    <option value="traditional">Traditional</option>
                    <option value="modern">Modern</option>
                    <option value="none">None</option>
                  </select>
                </label>
              </div>
              <div id="jsonOutput"></div>
            </div>
          </aside>
        </div>

      </client-only>
    </main>
  </div>
</template>

<script>
  export default {
    methods: {
      updateProgram() {
        // Update the program preview
        document.querySelector('.program').innerHTML = programPageAsHtml(this.programData, this.viewLang);

        if (this.allowEdit && this.mode == 'edit') {
          // Create updated JSON
          let jsonOutput = JSON.stringify(this.programData, null, 2);
          document.getElementById('jsonOutput').innerText = jsonOutput;
        }
      },
      showAvailablePrograms() {
        // Full-page links
        let fullPicker = document.getElementById('full-program-picker');
        if (fullPicker) {
          let fullPickerHtml = '';
          if (this.allowEdit) {
            fullPickerHtml += `
              <a href="/program?ward=${this.wardSlug}&date=new">New program</a>
            `;
          }
          for (const programDate of this.wardData.programDates) {
            fullPickerHtml += `
              <a href="/program?ward=${this.wardSlug}&date=${programDate}">${programDate}</a>
            `;
          }
          fullPicker.innerHTML = fullPickerHtml;
        }

        // Select menu
        let inlinePicker = document.getElementById('inline-program-picker');
        if (inlinePicker) {
          let inlinePickerHtml = '';
          for (const programDate of this.wardData.programDates) {
            inlinePickerHtml += `
              <option value="${programDate}">${programDate}</option>
            `;
          }
          inlinePicker.innerHTML = inlinePickerHtml;
        }
      },
      createNewProgram(wardSlug, programId, basedOnId) {
        let date = window.prompt(`Please enter a date for the program (example: ${dateIsoString()}).`, dateIsoString());
        if (!date) {
          return this.$router.go(-1);
        }

        // Post request to create a new program
        var xhttp = new XMLHttpRequest();
        let context = this;
        xhttp.onreadystatechange = function() {
          if (this.readyState == 4) {
            if (this.status == 200 || this.status == 201) {
              return context.$router.push({ path: '/program', query: {ward: wardSlug, date: date}});
            } else if (this.status == 401) {
              return context.$router.push('/');
            } else {
              return context.$router.push('/program?ward=' + wardSlug);
            }
          }
        };
        // TODO: Use correct URL
        xhttp.open('POST', 'http://localhost:5000/api/v1/units/' + wardSlug);
        xhttp.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
        xhttp.send(JSON.stringify({
          programDate: date,
          basedOnDate: basedOnId,
        }));
      },
      fetchData(wardSlug, programId) {
        if (!wardSlug) {
          return this.$router.push(`/`);
        }

        // TODO: Use correct URL
        // const wardJsonUrl = `${window.location.protocol}//${window.location.host}/api/v1/units/${wardSlug}`;
        const wardJsonUrl = `http://localhost:5000/api/v1/units/${wardSlug}`;
        fetch(wardJsonUrl)
          .then(response => response.json())
          .then(data => {
            this.allowEdit = data.allowEdit;
            // TODO: In prod, remove !
            if (!this.allowEdit) {
              // This front-end authentication check is just for loading the correct UI. The server will prevent unauthorized edits from being saved.
              this.mode = 'edit';
            } else {
              this.mode = 'view';
            }
            this.wardData = data;
            this.wardName = data.unitName;
            this.showAvailablePrograms();

            if (programId == 'new') {
              let mostRecentProgramDate = this.wardData?.programDates?.[0] || null;
              this.createNewProgram(wardSlug, programId, mostRecentProgramDate);
            } else if (programId) {
              this.fetchProgram(wardSlug, programId);
            }
          })
          .catch(error => {
            console.log(error);
          });
      },
      fetchProgram(wardSlug, programId) {
        // TODO: Use correct URL
        // const programJsonUrl = `${window.location.protocol}//${window.location.host}/api/v1/units/${wardSlug}/${programId}`;
        const programJsonUrl = `http://localhost:5000/api/v1/units/${wardSlug}/${programId}`;
        fetch(programJsonUrl)
          .then(response => response.json())
          .then(data => {
            this.programData = data;
            this.programId = data.general.date;
            this.viewLang = data.printOptions.lang; // TODO: Use cookie / local storage if exists
            this.viewStyle = data.printOptions.style; // TODO: Use cookie / local storage if exists
            this.viewTheme = 'default'; // TODO: Use cookie / local storage if exists
            this.updateProgram();
          })
          .catch(error => {
            console.log(error);
          });
      },
      addWardBusinessItem() {
        this.programData.proceedings.wardBusiness.push({ title: '', details: '' });
      },
      removeWardBusinessItem(index) {
        this.programData.proceedings.wardBusiness.splice(index, 1);
      },
      updateWardBusinessItem(index) {
        let wardBusinessItemElement = document.getElementsByClassName('ward-business-item')[index];
        let title = wardBusinessItemElement.querySelectorAll('input')[0].value;
        let details = wardBusinessItemElement.querySelectorAll('input')[1].value;
        this.programData.proceedings.wardBusiness[index].title = title;
        this.programData.proceedings.wardBusiness[index].details = details;
      },
      addOrderedItem() {
        this.programData.proceedings.orderedItems.push({ title: '', details: '', subtitle: '' });
      },
      removeOrderedItem(index) {
        this.programData.proceedings.orderedItems.splice(index, 1);
      },
      updateOrderedItem(index) {
        let orderedItemElement = document.getElementsByClassName('ordered-item')[index];
        let title = orderedItemElement.querySelectorAll('input')[0].value;
        let details = orderedItemElement.querySelectorAll('input')[1].value;
        let subtitle = orderedItemElement.querySelectorAll('input')[2].value;
        this.programData.proceedings.orderedItems[index].title = title;
        this.programData.proceedings.orderedItems[index].details = details;
        this.programData.proceedings.orderedItems[index].subtitle = subtitle;
      },
      addSecondHourItem() {
        this.programData.secondHour.push({ meeting: '', location: '' });
      },
      removeSecondHourItem(index) {
        this.programData.secondHour.splice(index, 1);
      },
      updateSecondHourItem(index) {
        let secondHourItemElement = document.getElementsByClassName('second-hour-item')[index];
        let meeting = secondHourItemElement.querySelectorAll('input')[0].value;
        let location = secondHourItemElement.querySelectorAll('input')[1].value;
        this.programData.secondHour[index].meeting = meeting;
        this.programData.secondHour[index].location = location;
      },
    },
    watch: {
      '$route.query'() {
        this.wardSlug = this.$route.query.ward;
        this.programId = this.$route.query.date;
      },
      programData: {
        handler: function(val) {
          this.updateProgram();
        },
        deep: true
      },
      programId: {
        handler: function(programId) {
          this.$router.push(`/program?ward=${this.wardSlug}&date=${programId}`);
          this.fetchProgram(this.wardSlug, programId);
        }
      },
      viewTheme: {
        handler: function(viewTheme) {
          document.body.dataset.theme = viewTheme;
        }
      }
    },
    data() {
      return {
        siteTitle: 'MyProgram.cc',
        wardName: '',
        wardSlug: this.$route.query.ward,
        wardData: null,
        programData: null,
        programId: this.$route.query.date,
        viewLang: 'en-US',
        viewStyle: 'traditional',
        viewTheme: 'default',
        allowEdit: false,
        mode: 'view',
      }
    },
    mounted() {
      console.log('mounted', this.wardSlug, this.programId);
      this.fetchData(this.wardSlug, this.programId);
    },
    head() {
      return {
        title: this.wardName + ' – ' + this.siteTitle,
        meta: [
          {
            hid: 'description', name: 'description',
            content: 'Sacrament meeting program for ' + this.wardName
          }
        ],
        link: [
          { rel: 'stylesheet', href: `/program-styles/${this.viewStyle}.css` }
        ],
      }
    },
    filters: {
      datePrettyFormat: function (date) {
        return new Intl.DateTimeFormat('en-US', { dateStyle: 'long' }).format(date);
      },
    }
  }
</script>

<style>
  main {
    margin: 0 var(--wrapper-padding);
  }

  #full-program-picker {
    padding: 20px 0;
  }
  #full-program-picker a {
    display: inline-flex;
    width: 150px;
    height: 100px;
    background-color: var(--accent-color-light-bg);
    border: 1px solid currentColor;
    align-items: center;
    justify-content: center;
    text-align: center;
    margin: 0.5em;
  }

  .program {
    margin: var(--wrapper-padding) 0;
  }

  .header-radio {
    display: inline-block;
    padding: 0.5em 0 0 0.5em;
  }

  #wrapper { min-height: 100vh; }
  #wrapper > header {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    justify-content: space-between;
    padding: 0.8em;
    min-height: 4.2em;
    background-color: var(--header-bg);
    color: var(--header-text-color);
  }
  #wrapper > header a {
    color: var(--header-text-color);
    text-decoration: none;
  }
  #sidebar-container {
    min-height: calc(100vh - 3.5em);
  }
  #sidebar label {
    display: block;
    margin: 10px 0;
  }
  #jsonOutput {
    white-space: pre-wrap;
    padding: 0.5em;
    font-size: 0.8em;
    font-family: monospace;
    background-color: hsl(0, 0%, 95%);
  }


</style>

