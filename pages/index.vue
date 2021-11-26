<template>
  <div id="sign-in">
    <main>
      <h1>MyProgram.cc</h1>
      <p>Sign in to manage sacrament meeting programs.</p>
      <form id="sign-in-form" @submit="submitForm">
        <p>
          <label for="ward-picker">Ward or branch:</label>
          <select name="ward-picker" id="ward-picker" v-model="ward">
            <option value="">(none)</option>
          </select>
        </p>
        <p>
          <label for="ward-passphrase-input">Passphrase:</label>
          <input name="ward-passphrase-input" id="ward-passphrase-input" v-model="passphrase">
        </p>
        <p>
          <button type="submit">Sign In</button>
        </p>
        <div class="errors" v-if="errors.length">
          <p v-for="error in errors" v-bind:key="error">{{error}}</p>
        </div>
      </form>
      <br>
      <p>To see this week’s program, contact your ward leaders.</p>
      <p>To create a ward account, contact the <a href="mailto:admin@myprogram.cc?subject=MyProgram.cc">admin</a>.</p>
      <p>Click <a href="/program/?ward=anywhere-3rd-ward">here</a> to see sample programs.</p>
    </main>
  </div>
</template>

<script>
  // Reference: https://www.toptal.com/vue-js/server-side-rendered-vue-js-using-nuxt-js

  function signIn(ward, passphrase, context) {

    // TODO: Use correct URL
    fetch('http://localhost:5000/api/v1/signin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', },
      body: JSON.stringify({
        unitSlug: ward,
        unitPassphrase: passphrase,
      }),
    })
    .then(response => {
      let status = response.status;
      if (status == 200) {
        context.$router.push({ path: '/program', query: {ward: ward}});
      } else if (status == 401) {
        context.errors.push('Ward and passphrase combination is invalid.');
      } else {
        context.errors.push('Sign-in error.');
      }
    })
    .catch(error => {
      console.log(error);
    });

  }

  export default {
    data() {
      return {
        errors: [],
        ward: '',
        passphrase: null,
      }
    },
    mounted() {
      // TODO: Use correct URL
      fetch('http://localhost:5000/api/v1/units')
      .then(response => response.json())
      .then(units => {
        const wardPicker = document.getElementById('ward-picker');
        for (const unit of units) {
          wardPicker.insertAdjacentHTML('beforeend', `
            <option value="${unit.unitSlug}">${unit.unitName}</option>
          `);
        }
      })
      .catch(error => {
        console.log(error);
      });
    },
    head() {
      return {
        title: 'MyProgram.cc',
        meta: [
          {
            hid: 'description',
            name: 'description',
            content: 'Create a sacrament meeting program for your ward!'
          }
        ]
      }
    },
    methods: {
      submitForm: function (e) {
        this.errors = [];
        signIn(this.ward, this.passphrase, this);
        e.preventDefault();
      },
    }
  }
</script>

<style>
  #sign-in {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  #sign-in main {
    text-align: center;
    padding: 20vh 24px 20vh 24px;
  }
  #sign-in h1, #sign-in p {
    margin: 10px;
  }
  #sign-in .errors {
    color: red;
  }
</style>

