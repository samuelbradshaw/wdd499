<template>
  <div id="wrapper">
    <header>
      <h1><client-only><a :href="`/program?ward=${wardSlug}`">{{wardName}}</a></client-only></h1>
      <div v-if="allowEdit && programId">
        <label>
          <input type="radio" value="view" v-model="mode">
          View
        </label>
        <label>
          <input type="radio" value="edit" v-model="mode">
          Edit
        </label>
      </div>
      <div v-show="!programId">
        <button type="button" @click="signOut()" v-if="allowEdit">Sign Out</button>
        <button type="button" @click="signIn()" v-else>Sign In</button>
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

            <details open>
              <summary>View options</summary>
              <p>
                <label for="select-lang">Language:</label>
                <select id="select-lang" v-model="viewLang">
                  <option value="en-US">English</option>
                </select>
              </p>
              <p>
                <label for="select-style">Style:</label>
                <select id="select-style" v-model="viewStyle">
                  <option value="traditional">Traditional</option>
                  <option value="modern">Modern</option>
                  <option value="none">None</option>
                </select>
              </p>
              <p>
                <label for="select-theme">Theme:</label>
                <select id="select-theme" v-model="viewTheme">
                  <option value="default">System default</option>
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                </select>
              </p>
            </details>

            <div v-if="mode == 'edit' && programData">

              <details>
                <summary>Header</summary>
                <p>
                  <label for="presiding">Presiding:</label>
                  <input id="presiding" type="text" v-model="programData.header.presiding">
                </p>
                <p>
                  <label for="conducting">Conducting:</label>
                  <input id="conducting" type="text" v-model="programData.header.conducting">
                </p>
                <p>
                  <label for="music-leader">Music leader:</label>
                  <input id="music-leader" type="text" v-model="programData.header.musicLeader">
                </p>
                <p>
                  <label for="accompanist">Accompanist:</label>
                  <input id="accompanist" type="text" v-model="programData.header.accompanist">
                </p>
              </details>

              <details>
                <summary>Opening</summary>
                <p>
                  <input id="welcome" type="checkbox" v-model="programData.proceedings.welcome">
                  <label for="welcome">Welcome</label>
                </p>
                <p>
                  <label for="opening-hymn">Hymn:</label>
                  <input id="opening-hymn" type="text" v-model="programData.proceedings.openingHymn">
                </p>
                <p>
                  <label for="opening-prayer">Prayer:</label>
                  <input id="opening-prayer" type="text" v-model="programData.proceedings.openingPrayer">
                </p>
              </details>

              <details>
                <summary>Ward Business</summary>
                <div class="ward-business-item" v-for="(item, index) of programData.proceedings.wardBusiness" :key="`ward-business-${index}`">
                  <p>
                    <label :for="`ward-business-${index}-title`">Title:</label>
                    <input :id="`ward-business-${index}-title`" type="text" :value="programData.proceedings.wardBusiness[index].title" @input="updateWardBusinessItem(index)">
                  </p>
                  <p>
                    <label :for="`ward-business-${index}-details`">Details:</label>
                    <input :id="`ward-business-${index}-details`" type="text" :placeholder="programData.header.conducting" :value="programData.proceedings.wardBusiness[index].details" @input="updateWardBusinessItem(index)">
                  </p>
                  <p>
                    <button type="button" @click="removeWardBusinessItem(index)">Remove</button>
                  </p>
                </div>
                <button class="add-button" type="button" @click="addWardBusinessItem()">+ Add</button>
              </details>

              <details>
                <summary>Sacrament</summary>
                <p>
                  <label for="sacrament-hymn">Hymn:</label>
                  <input id="sacrament-hymn" type="text" v-model="programData.proceedings.sacramentHymn">
                </p>
                <p>
                  <input id="sacrament-at-end" type="checkbox" v-model="programData.proceedings.sacramentAtEnd">
                  <label for="sacrament-at-end">Sacrament at end</label>
                </p>
              </details>

              <details>
                <summary>Proceedings</summary>
                <p>
                  <input id="testimony-meeting" type="checkbox" v-model="programData.proceedings.testimonyMeeting">
                  <label for="testimony-meeting">Testimony meeting</label>
                </p>
                <div class="ordered-item" v-for="(item, index) of programData.proceedings.orderedItems" :key="`ordered-${index}`">
                  <p>
                    <label :for="`ordered-${index}-title`">Title:</label>
                    <input :id="`ordered-${index}-title`" type="text" :value="programData.proceedings.orderedItems[index].title" @input="updateOrderedItem(index)">
                  </p>
                  <p>
                    <label :for="`ordered-${index}-details`">Details:</label>
                    <input :id="`ordered-${index}-details`" type="text" :value="programData.proceedings.orderedItems[index].details" @input="updateOrderedItem(index)">
                  </p>
                  <p>
                    <label :for="`ordered-${index}-subtitle`">Subtitle:</label>
                    <input :id="`ordered-${index}-subtitle`" type="text" :value="programData.proceedings.orderedItems[index].subtitle" @input="updateOrderedItem(index)">
                  </p>
                  <p>
                    <button type="button" @click="removeOrderedItem(index)">Remove</button>
                  </p>
                </div>
                <button class="add-button" type="button" @click="addOrderedItem()">+ Add</button>
              </details>

              <details>
                <summary>Closing</summary>
                <p>
                  <label for="closing-hymn">Hymn:</label>
                  <input id="closing-hymn" type="text" v-model="programData.proceedings.closingHymn">
                </p>
                <p>
                  <label for="closing-prayer">Prayer:</label>
                  <input id="closing-prayer" type="text" v-model="programData.proceedings.closingPrayer">
                </p>
              </details>

              <details>
                <summary>Second-Hour Meetings</summary>
                <div class="second-hour-item" v-for="(item, index) of programData.secondHour" :key="`second-hour-${index}`">
                  <p>
                    <label :for="`second-hour-${index}-meeting`">Meeting:</label>
                    <input :id="`second-hour-${index}-meeting`" type="text" :value="programData.secondHour[index].meeting" @input="updateSecondHourItem(index)">
                  </p>
                  <p>
                    <label :for="`second-hour-${index}-location`">Location:</label>
                    <input :id="`second-hour-${index}-location`" type="text" :value="programData.secondHour[index].location" @input="updateSecondHourItem(index)">
                  </p>
                  <p>
                    <button type="button" @click="removeSecondHourItem(index)">Remove</button>
                  </p>
                </div>
                <button class="add-button" type="button" @click="addSecondHourItem()">+ Add</button>
              </details>

              <details>
                <summary>Print options</summary>
                <p>
                  <label for="select-print-lang">Language:</label>
                  <select id="select-print-lang" v-model="programData.printOptions.lang">
                    <option value="en-US">English</option>
                  </select>
                </p>
                <p>
                  <label for="select-print-style">Style:</label>
                  <select id="select-print-style" v-model="programData.printOptions.style">
                    <option value="traditional">Traditional</option>
                    <option value="modern">Modern</option>
                    <option value="none">None</option>
                  </select>
                </p>
              </details>

            </div>
            <p class="sign-in-message" v-else>
              If you’re an admin, <a href="/">sign in</a> to edit.
            </p>
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

        // Create updated JSON and save to database
        if (this.allowEdit && this.mode == 'edit') {

          fetch(`https://myprogram.cc/api/v1/units/${this.wardSlug}/${this.programId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', },
            body: JSON.stringify(this.programData, null, 2),
          })
          .catch(error => {
            console.log(error);
          });
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
        fetch(`https://myprogram.cc/api/v1/units/${this.wardSlug}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', },
          body: JSON.stringify({
            programDate: date,
            basedOnDate: basedOnId,
          }),
        })
        .then(response => {
          const status = response.status;
          if (status == 200 || status == 201) {
            return this.$router.push({ path: '/program', query: {ward: wardSlug, date: date}});
          } else if (status == 401) {
            return this.$router.push('/');
          } else {
            return this.$router.push('/program?ward=' + wardSlug);
          }
        })
        .catch(error => {
          console.log(error);
        });

      },
      fetchData(wardSlug, programId) {
        if (!wardSlug) {
          return this.$router.push(`/`);
        }

        // const wardJsonUrl = `${window.location.protocol}//${window.location.host}/api/v1/units/${wardSlug}`;
        const wardJsonUrl = `https://myprogram.cc/api/v1/units/${wardSlug}`;
        fetch(wardJsonUrl)
          .then(response => response.json())
          .then(data => {
            this.allowEdit = data.allowEdit;
            if (this.allowEdit) {
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
        const programJsonUrl = `https://myprogram.cc/api/v1/units/${wardSlug}/${programId}`;
        fetch(programJsonUrl)
          .then(response => response.json())
          .then(data => {
            this.programData = data;
            this.programId = data.general.date;
            if (process.client) {
              this.viewLang = localStorage.getItem('viewLang') || data.printOptions.lang;
              this.viewStyle = localStorage.getItem('viewStyle') || data.printOptions.style;
              this.viewTheme = localStorage.getItem('viewTheme') || 'default';
            }
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
      signOut() {
        fetch('https://myprogram.cc/api/v1/signout')
        .then(() => {
          this.$router.push('/');
        })
        .catch(error => {
          console.log(error);
        });
      },
      signIn() {
        this.$router.push('/');
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
      viewLang: {
        handler: function(viewLang) {
          localStorage.setItem('viewLang', viewLang);
        }
      },
      viewStyle: {
        handler: function(viewStyle) {
          localStorage.setItem('viewStyle', viewStyle);
        }
      },
      viewTheme: {
        handler: function(viewTheme) {
          document.body.dataset.theme = viewTheme;
          localStorage.setItem('viewTheme', viewTheme);
        }
      },
    },
    data() {
      return {
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
      this.fetchData(this.wardSlug, this.programId);
    },
    head() {
      return {
        title: (this.programId ? this.programId + ' – ' : '') + this.wardName + ' – MyProgram.cc',
        meta: [
          {
            hid: 'description', name: 'description',
            content: 'Sacrament meeting program for ' + this.wardName
          }
        ],
        link: [
          { rel: 'stylesheet', href: `/program-styles/${this.viewStyle}.css`, id: 'program-stylesheet' }
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
  main { margin: 0 var(--wrapper-padding); }

  #full-program-picker { padding: 20px 0; }
  #full-program-picker a {
    display: inline-flex;
    width: 150px; height: 100px;
    background-color: var(--accent-color-light-bg);
    border: 1px solid currentColor;
    align-items: center;
    justify-content: center;
    text-align: center;
    margin: 0.5em;
  }

  #wrapper { min-height: 100vh; }
  #wrapper > header {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    justify-content: space-between;
    padding: 0.8em;
    min-height: 4em;
    background-color: var(--header-bg);
    color: var(--header-text-color);
  }
  #wrapper > header a {
    color: var(--header-text-color);
    text-decoration: none;
  }
  #wrapper > header label {
    display: inline-block;
    padding: 0.5em 0 0 0.5em;
  }

  .program { margin: var(--wrapper-padding) 0; }


  /* SIDEBAR */

  #sidebar-container { min-height: calc(100vh - 4em); }
  #sidebar .sign-in-message {
    font-size: 0.8em;
    margin: 1em 0;
  }
  #sidebar details {
    border-bottom: 1px solid var(--gray-90);
    margin: 0; padding: 0 0 16px 0;
  }
  #sidebar summary {
    font-weight: bold;
    margin: 16px 0;
  }
  #sidebar details p {
    display: flex;
    padding: 0.4em 0;
    align-items: center;
    font-size: 0.8em;
  }
  #sidebar details p :not(label):first-child { margin: 0 0.5em 0 4.8em; }
  #sidebar label:first-child {
    min-width: 4.8em;
    margin-right: 0.5em;
  }
  #sidebar .add-button { margin: 0.6em 0.5em; }
  #sidebar input[type="text"] {
    border: 1px solid var(--gray-67);
    background-color: var(--page-bg);
    color: var(--text-color);
    font: inherit;
    padding: 3px 4px;
    flex-grow: 1;
  }

</style>

