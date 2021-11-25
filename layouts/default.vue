<template>
  <div>
    <script src="../scripts/utilities.js"></script>
    <nuxt/>
    <script src="../scripts/sliding_sidebar.js"></script>
  </div>
</template>

<style>

  /* VUE DEFAULTS */

  html {
    font-family: Helvetica, sans-serif;
    font-size: 11pt;
    -ms-text-size-adjust: 100%;
    -webkit-text-size-adjust: 100%;
  }

  *, *:before, *:after {
    box-sizing: border-box;
    margin: 0;
  }


  /* CUSTOM PROPERTIES */

  :root {
    /* Colors for light and dark */
    --info-blue-bg: steelblue;
    --progress-orange-bg: darkorange;
    --success-green-bg: mediumseagreen;
    --failure-red-bg: tomato;
    --translucent-white-bg: hsla(0, 0%, 100%, 0.7);
    --translucent-black-bg: hsla(0, 0%, 15%, 0.7);

    /* Light colors */
    --gray-95: hsl(0, 0%, 95%);
    --gray-90: hsl(0, 0%, 90%);
    --gray-67: hsl(0, 0%, 67%);
    --gray-50: hsl(0, 0%, 50%);
    --gray-20: hsl(0, 0%, 20%);
    --header-bg: hsl(270, 75%, 50%);
    --header-text-color: hsl(0, 0%, 100%);
    --page-bg: hsl(0, 0%, 100%);
    --text-color: hsl(0, 0%, 0%);
    --link-normal: hsl(270, 75%, 65%);
    --accent-color: hsl(270, 75%, 50%);
    --accent-color-secondary: hsl(270, 75%, 70%);
    --accent-color-light-bg: hsl(270, 75%, 98%);
  }
  @media (prefers-color-scheme: dark) { :root {
    /* Dark colors */
    --gray-95: hsl(0, 0%, 25%);
    --gray-90: hsl(0, 0%, 30%);
    --gray-67: hsl(0, 0%, 53%);
    --gray-50: hsl(0, 0%, 60%);
    --gray-20: hsl(0, 0%, 90%);
    --header-bg: var(--gray-90);
    --header-text-color: var(--gray-20);
    --page-bg: hsl(0, 0%, 17%);
    --text-color: var(--gray-20);
    --link-normal: hsl(270, 75%, 80%);
    --accent-color: hsl(270, 75%, 50%);
    --accent-color-secondary: hsl(270, 75%, 70%);
    --accent-color-light-bg: hsl(0, 0%, 23%);
  }}
  [data-theme="light"] {
    /* Light colors */
    --gray-95: hsl(0, 0%, 95%);
    --gray-90: hsl(0, 0%, 90%);
    --gray-67: hsl(0, 0%, 67%);
    --gray-50: hsl(0, 0%, 50%);
    --gray-20: hsl(0, 0%, 20%);
    --header-bg: hsl(270, 75%, 50%);
    --header-text-color: hsl(0, 0%, 100%);
    --page-bg: hsl(0, 0%, 100%);
    --text-color: hsl(0, 0%, 0%);
    --link-normal: hsl(270, 75%, 65%);
    --accent-color: hsl(270, 75%, 50%);
    --accent-color-secondary: hsl(270, 75%, 70%);
    --accent-color-light-bg: hsl(270, 75%, 98%);
  }
  [data-theme="dark"] {
    /* Dark colors */
    --gray-95: hsl(0, 0%, 25%);
    --gray-90: hsl(0, 0%, 30%);
    --gray-67: hsl(0, 0%, 53%);
    --gray-50: hsl(0, 0%, 60%);
    --gray-20: hsl(0, 0%, 90%);
    --header-bg: var(--gray-90);
    --header-text-color: var(--gray-20);
    --page-bg: hsl(0, 0%, 17%);
    --text-color: var(--gray-20);
    --link-normal: hsl(270, 75%, 80%);
    --accent-color: hsl(270, 75%, 50%);
    --accent-color-secondary: hsl(270, 75%, 70%);
    --accent-color-light-bg: hsl(0, 0%, 23%);
  }

  :root {
    accent-color: var(--accent-color-secondary);
    --wrapper-padding: 2.2rem;
  }
  @media screen and (max-width: 700px) { :root {
    --wrapper-padding: 1.2rem;
  }}

  #wrapper {
    background-color: var(--page-bg);
    color: var(--text-color);
  }


  /* GENERAL */

  a { color: var(--link-normal); }

  .inline-button {
    color: var(--text-color);
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    font-size: inherit;
    font-family: inherit;
    text-decoration: inherit;
    background: none;
    margin: 0; padding: 0;
    border: 0;
    cursor: pointer;
  }
  .inline-button:active {
    color: var(--gray-67);
  }
  .svg-icon {
    fill: currentColor;
    width: 1em; height: 1em;
    vertical-align: text-top;
    flex-shrink: 0;
  }


  /* PRINT */

  .print-only { display: none; }
  @media print {
    body { background-color: white; }
    body * { visibility: hidden; }
    main, #sidebar-container, .ssc-main { width: 0; height: 0; position: static; }
    .sidebar { display: none; }
    .print-area, .print-area * {
      visibility: visible;
    }
    .print-area .print-only { display: block; }
    .print-area {
      font-size: 11pt !important;
      position: absolute;
      top: 0.5in;
      left: 0.5in;
      right: 0.5in;
      display: grid;
      grid-template-columns: 1fr 1fr;
      grid-template-rows: 1fr;
      grid-column-gap: 1in;
      margin: 0 !important;
      z-index: 2;
    }
    .print-area.safari {
      top: 0.25in;
      left: 0.25in;
      right: 0.25in;
    }
    .print-area::after {
      content: "";
      position: absolute;
      left: 50%;
      border: 1px solid var(--gray-95);
      height: 100%;
    }
  }


  /* SLIDING SIDEBAR AREA */

  .sliding-sidebar-container {
    display: flex;
    background-color: var(--page-bg);
    margin: 0 calc(var(--wrapper-padding) * -1);
    position: relative;
    overflow: hidden;
  }
  .sliding-sidebar-container .ssc-main {
    min-width: 0;
    flex-grow: 1;
    padding: 1rem var(--wrapper-padding) 2rem var(--wrapper-padding);
    overflow-y: scroll;
    z-index: 0;
  }
  .sliding-sidebar-container .ssc-sidebar {
    flex-grow: 0;
    background-color: var(--page-bg);
    box-sizing: border-box;
    width: 33%;
    min-width: 300px;
    padding: 1rem var(--wrapper-padding) 2rem var(--wrapper-padding);
    border-left: 1px solid var(--gray-90);
    overflow-y: scroll;
    z-index: 2;
  }
  .sliding-sidebar-container[data-state="closed"] .ssc-sidebar {
    display: none;
  }
  .ssc-overlay-background {
    display: none;
    position: absolute;
    background-color: var(--translucent-white-bg);
    top: 0; right: 0; bottom: 0; left: 0;
    z-index: 1;
  }
  @media screen and (max-width: 800px) {
    .sliding-sidebar-container .ssc-sidebar {
      position: absolute;
      right: 0; top: 0; bottom: 0;
      box-shadow: 0px 0px 15px 2px var(--translucent-black-bg);
    }
    .sliding-sidebar-container[data-state="open"] .ssc-overlay-background {
      display: block;
    }
  }
  @media screen and (max-width: 350px) {
    .sliding-sidebar-container .ssc-sidebar {
      min-width: 0;
      width: 90%;
    }
  }
  .sliding-sidebar-container .ssc-titlebar {
    background-color: var(--page-bg);
    box-sizing: border-box;
    border-bottom: 1px solid var(--gray-90);
    margin: -1rem calc(var(--wrapper-padding) * -1) 0 calc(var(--wrapper-padding) * -1);
    padding: 0 calc(var(--wrapper-padding) * 0.5);
    display: flex;
    height: 4rem;
    align-items: center;
  }
  .sliding-sidebar-container .ssc-titlebar h2 {
    font-weight: normal;
    font-size: 1em;
    line-height: 1em;
  }
  .sliding-sidebar-container .ssc-titlebar button {
    font-size: 1.5em;
  }
  .sliding-sidebar-container .ssc-titlebar-left {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    flex-grow: 1;
  }
  .sliding-sidebar-container .ssc-titlebar-left > * {
    margin: 0 0.8rem 0 0;
  }
  .sliding-sidebar-container .ssc-titlebar-right {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    flex-grow: 1;
  }
  .sliding-sidebar-container .ssc-titlebar-right > * {
    margin: 0 0 0 0.8rem;
  }

</style>

