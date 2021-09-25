<template>
  <div id="editor">
    <header>
      <h1>Editor</h1>
      <a :href="'/' + wardSlug + '/' + programUrlDate">Preview</a>
    </header>
    <main>
      <section id="program">
        <h1>{{this.wardName}}</h1>
        <h2>{{this.programDate|datePrettyFormat}}</h2>
      </section>
      <aside>
        <h2>Templates</h2>
      </aside>
    </main>
  </div>
</template>

<script>
  // Get the date of the next Sunday
  // See https://stackoverflow.com/questions/1579010/get-next-date-from-weekday-in-javascript
  function nextSunday() {
    var today = new Date();
    today.setDate(today.getDate() + (6 - today.getDay()) % 7 + 1);
    return today;
  }

  export default {
    data() {
      return {
        siteTitle: 'MyProgram.cc',
        wardName: 'Anywhere 3rd Ward',
        wardSlug: 'anywhere-3rd-ward',
        programStylesheet: '/program-styles/traditional.css',
        programDate: nextSunday(),
        programUrlDate: nextSunday().toISOString().substr(0, 10),
      }
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
  #editor header {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    padding: 0.5em 1em;
    background-color: slategrey;
    color: white;
    height: 3.5em;
  }
  #editor header a {
    color: white;
  }
  #editor main {
    display: flex;
    min-height: calc(100vh - 3.5em);
  }
  #editor #program {
    flex: 2 1 auto;
  }
  #editor aside {
    flex: 1 2 auto;
    border-left: 1px solid slategrey;
    padding: 0.5em;
  }
</style>

