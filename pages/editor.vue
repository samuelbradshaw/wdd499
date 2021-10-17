<template>
  <div id="editor">
    <header>
      <h1>Editor</h1>
      <a :href="'/' + wardSlug + '/' + programId">Preview</a>
    </header>
    <main>
      <section id="program">
      </section>
      <aside id="sidebar">
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
      </aside>
    </main>
  </div>
</template>

<script src="../scripts/utilities.js"></script>
<script>
  export default {
    methods: {
      updateProgram() {
        // Update the program preview
        document.getElementById('program').innerHTML = programAsHtml(this.programData, this.programLang);

        // Create updated JSON
        let jsonOutput = JSON.stringify(this.programData, null, 2);
        document.getElementById('jsonOutput').innerText = jsonOutput;
      },
      fetchProgram(wardSlug, programId) {
        fetch(`http://localhost:3000/program-templates/${programId}.json`)
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
      programData: {
        handler: function(val) {
          this.updateProgram();
        },
        deep: true
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
        wardName: 'Anywhere 3rd Ward',
        wardSlug: 'anywhere-3rd-ward',
        programTemplate: 'sample-regular',
        programData: null,
        programId: '1830-04-06',
        programLang: 'en-US',
        programStyle: 'traditional',
        programStylesheet: '/program-styles/traditional.css',
      }
    },
    mounted() {
      this.fetchProgram(this.wardSlug, this.programTemplate);
    },
    head() {
      return {
        title: 'Editor – ' + this.siteTitle,
        meta: [
          {
            hid: 'description', name: 'description',
            content: 'Create a sacrament meeting program for your ward!'
          }
        ],
        link: [
          { rel: 'stylesheet', href: this.programStylesheet }
        ],
        script: [
          { src: '../scripts/utilities.js', body: true }
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
  #editor { min-height: 100vh; }
  #editor > header {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    padding: 0.5em 1em;
    background-color: slategrey;
    color: white;
    height: 3.5em;
  }
  #editor > header a {
    color: white;
  }
  #editor > main {
    display: flex;
    min-height: calc(100vh - 3.5em);
  }
  #program {
    flex: 2 1 auto;
  }
  #sidebar {
    flex: 1 2 auto;
    border-left: 1px solid slategrey;
    padding: 0.5em;
    max-width: 40%;
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

