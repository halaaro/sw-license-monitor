<template>
  <div id="app">
    <GuageWidget/>
  </div>
</template>

<script>
import GuageWidget from './components/GuageWidget.vue'
export default {
  components: { GuageWidget }
}
</script>

<style>
html, body {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  background: rgba(0, 0, 0, 0);
  overflow: hidden;
}

body {
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: sans-serif;
  color: #525252;
  }

.container {
  text-align: center;
  -webkit-user-select: none;
  -webkit-app-region: drag;

  width: 200px; height: 200px;
  overflow: hidden;
  position: relative;
}

#gauge {
    background-color: white;
  background-image: url('assets/swlicmgr.png');
  background-size: 80px 80px;
  background-repeat: no-repeat;
  background-position: center center;
  border-radius: 120px;
}

#refresh {
  opacity: 0.2;
  background-color: white;
  position: absolute;
  bottom: 5px;
  -webkit-app-region: no-drag;
      right: 5px;
    text-align: center;
    vertical-align: middle;
    line-height: 30px;
    border: 2px solid #AAA;
    border-radius: 30px;
    width: 30px;
    height: 30px;
    font-size: 20px;
    font-weight: bold;
    color: #AAA;
      transition: 0.5s opacity;
}

#refresh:hover {
  opacity: 1;
  transition: 0.25s opacity;
}

#refresh:before {
  content: '↻';
}

#refresh:active {
  transform: translate(1px, 2px);
  background-color: rgba(220,220,225,1)
}

a {
  text-decoration: none;
  -webkit-app-region: no-drag;
}

#error-icon {
  position: fixed;
  top: 1px;
  right: 1px;
  width: 20px;
  height: 20px;
  border-radius: 10px;
  background: red;
  color: white;
  font-size: 12px;
  line-height: 20px;
  font-weight: bold;
  opacity: 0.5;
  -webkit-app-region: no-drag;
  user-select: none;
  cursor: default;
  transition: 0.25s opacity;
  visibility: hidden;
}

#error-message {
  position: absolute;
  top:25px;
  right:0;
  width: 100%;
  box-sizing: border-box;
  border: 1px solid red;
  background: black;
  visibility: hidden;
  font-family: 'Courier New', Courier, monospace;
  color: white;
  font-size: 10px;
  text-align: left;
  word-wrap: break-word;
}

#error-icon:hover {
  opacity: 1;
}

#error-icon:hover ~ #error-message {
  visibility: visible;
}
</style>
