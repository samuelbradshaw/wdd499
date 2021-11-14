<template>
  <div id="sign-in">
    <main>
      <h1>MyProgram.cc</h1>
      <p>Sign in to update your sacrament meeting program.</p>
      <form id="sign-in-form" @submit="submitForm">
        <p>
          <label for="ward-picker">Ward or branch:</label>
          <select name="ward-picker" id="ward-picker" v-model="ward">
            <option value="">(none)</option>
            <option value="anywhere-3rd-ward">Anywhere 3rd Ward</option>
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
      <p>
        To create an account, contact the <a href="mailto:admin@myprogram.cc?subject=MyProgram.cc">admin</a>.
      </p>
    </main>
  </div>
</template>

<script>
  // Reference: https://www.toptal.com/vue-js/server-side-rendered-vue-js-using-nuxt-js

  function signIn(ward, passphrase, context) {
    // TODO: Implement sign-in with a server-side call, and make sure user can't get to editor page without being signed in

    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
      if (this.readyState == 4) {
        if (this.status == 200) {
          context.$router.push('/program?ward=' + ward);
        } else if (this.status == 401) {
          context.errors.push('Ward and passphrase combination is invalid.');
        } else {
          context.errors.push('Sign-in error.');
        }
      }
    };
    xhttp.open('POST', '/api/v1/signin');
    xhttp.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
    xhttp.send(JSON.stringify({
      unitSlug: ward,
      unitPassphrase: passphrase,
    }));
  }

  export default {
    data() {
      return {
        siteTitle: 'MyProgram.cc',
        errors: [],
        ward: '',
        passphrase: null,
      }
    },
    head() {
      return {
        title: this.siteTitle,
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

