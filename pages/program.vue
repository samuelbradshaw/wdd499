<template>
  <div id="wrapper">
    <header>
      <h1><client-only><a :href="`/program?ward=${wardSlug}`">{{wardName}}</a></client-only></h1>
      <div v-if="isAuthenticated && programId">
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

            <div id="program"></div>
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
              View options
            </div>
            <div v-if="mode == 'edit'">
              <h2>Data</h2>
              <div v-if="programData">
                <label>
                  Presiding: <input v-model="programData.header.presiding">
                </label>
                <label>
                  Conducting: <input v-model="programData.header.conducting">
                </label>
                <label>
                  <input type="checkbox" v-model="programData.proceedings.sacramentAtEnd"> Sacrament at end
                </label>
                <label>
                  Sample template:
                  <select v-model="programTemplate">
                    <option value="blank">Blank</option>
                    <option value="sample-regular">Regular</option>
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
        document.getElementById('program').innerHTML = programAsHtml(this.programData, this.programLang);

        if (this.isAuthenticated && this.mode == 'edit') {
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
          if (this.isAuthenticated) {
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
            this.isAuthenticated = data.isAuthenticated;
            if (this.isAuthenticated) {
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
            this.programData = data.data;
            this.programId = data.data.general.date;
            this.programLang = data.settings.lang;
            this.programStyle = data.settings.style;
            this.programStylesheet = `/program-styles/${data.settings.style}.css`;
            this.updateProgram();
          })
          .catch(error => {
            console.log(error);
          });
      }
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
      programTemplate: {
        handler: function(programTemplate) {
          this.fetchProgram(this.wardSlug, programTemplate);
        }
      }
    },
    data() {
      return {
        siteTitle: 'MyProgram.cc',
        wardName: '',
        wardSlug: this.$route.query.ward,
        wardData: null,
        programTemplate: 'sample-regular',
        programData: null,
        programId: this.$route.query.date,
        programLang: 'en-US',
        programStyle: 'traditional',
        programStylesheet: '/program-styles/traditional.css',
        isAuthenticated: false,
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
          { rel: 'stylesheet', href: this.programStylesheet }
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

  #program {
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

