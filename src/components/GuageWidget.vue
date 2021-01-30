<template>
  <div class="container">
    <RadialGauge v-bind="{options, value, logo, gray}" />
    <div title="Refresh" id="refresh" @click="updateGauge(1)"></div>
    <div id="error-icon" :style="{visibility: err.visible ? 'visible' : ''}">!</div>
    <div ><!-- SHOW ACTIVE BUTTON --></div>
    <div id="error-message" v-html="err.message"></div>
    <div class="toggle-container clickable"  :class="isReady && 'ready'">
      <div title="Switch to SOLIDWORKS" v-if="license != 'solidworks'" @click="setLicense('solidworks', 'solidworks')">
        <img src="../assets/swlicmgr.png" />
      </div>
      <div title="Switch to PDM" v-if="license != 'swepdm_cadeditorandweb'" @click="setLicense('swepdm_cadeditorandweb', 'pdm')">
        <img src="../assets/epdm_logo.png" />
      </div>
    </div>
  </div>
</template>

<script>
// @ is an alias to /src
import getLicenseUsage from '@/license'
import RadialGauge from '@/components/RadialGauge.vue'
import { notify } from '@/notifications'
import os from 'os'

export const listeners = { onUpdate: [] }

const inactiveNeedleColor = {
  colorNeedle: 'rgba(0,0,0,1)',
  colorNeedleStart: 'rgba(128, 128, 128, 1)',
  colorNeedleEnd: 'rgba(0, 0, 0, .9)'
}
const activeNeedleColor = {
  colorNeedle: 'rgba(128,128,255,0.8)',
  colorNeedleStart: 'rgba(128, 128, 255, 1)',
  colorNeedleEnd: 'rgba(0, 0, 200, .9)'
}

export default {
  name: 'Guage-Widget',
  components: { RadialGauge },
  data () {
    return {
      username: os.userInfo().username.toLowerCase(),
      license: 'solidworks',
      logo: 'solidworks',
      value: 0,
      err: {},
      gray: false,
      isReady: true,
      options: {
        maxValue: 10,
        highlights: {},
        majorTicks: [],
        ...inactiveNeedleColor,
        colorNeedleShadowDown: 'rgba(0,0,0,0.3)'
      }
    }
  },
  methods: {
    setLicense (license, newLogo) {
      this.license = license
      this.logo = newLogo
      this.gray = true
      this.setOptions({ majorTicks: [] })
      this.value = 0
      this.isReady = false
      this.updateGauge(1).then(() => {
        this.gray = false
        this.isReady = true
      })
    },
    setOptions (opts) {
      this.options = { ...this.options, ...opts }
    },
    notifyIfNeeded (licenses) {
      // only try to notify if used by current user (activeUser is true) and about to run out
      const notifyNeeded = licenses.filter(lic => lic.users.includes(this.username) && (lic.total - lic.inUse <= 1))
      if (notifyNeeded.length > 0) {
        const licName = notifyNeeded[0].licenseName
        switch (licName) {
          case 'solidworks':
            notify('SOLIDWORKS Licenses Low ⚠', 'Please consider closing SOLIDWORKS at this time to free up licenses for others.')
            break
          case 'swepdm_cadeditorandweb':
            notify('PDM Licenses Low ⚠', 'Please consider logging out of PDM at this time to free up licenses for others.')
            break
          default:
            notify(licName.toUpperCase() + ' Licenses Low ⚠', 'Please consider closing the software to free up licenses for others.')
        }
      }
    },
    getRanges (max, inc = 1) {
      const r1 = Math.min(max - inc, Math.round((max * 0.9) / inc) * inc)
      const r2 = Math.max(0, Math.min(r1 - inc, Math.round((max * 0.8) / inc) * inc))
      const r3 = Math.max(0, Math.min(r2 - inc, Math.round((max * 0.6) / inc) * inc))
      return [r3, r2, r1]
    },
    getIncrement (max) {
      let inc = 1
      if (max > 15) {
        inc = 5
      }
      if (max > 75) {
        inc = 10
      }
      if (max > 150) {
        inc = 20
      }
      return inc
    },
    updateGauge (twitch) {
      this.updateValue(0)
      return getLicenseUsage(this.license)
        .then(({ licenses }) => {
          this.notifyIfNeeded(licenses)
          const result = licenses.filter(
            lic => lic.licenseName === this.license
          )
          if (result.length < 1) {
            throw new Error(
              `information for license (${this.license}) not available`
            )
          }
          const { inUse, total, users } = result[0]
          const activeUser = users.includes(this.username)
          if (inUse && inUse > 0) {
            if (twitch) {
              var self = this
              return new Promise((resolve, reject) => {
                setTimeout(function () {
                  self.updateValue(inUse, total, activeUser)
                  resolve()
                }, 100)
              })
            } else {
              this.updateValue(inUse, total, activeUser)
            }
          }
        })
        .catch(err => {
          console.log(err.message)
          // alert(err)
          this.err = { message: err.message, visible: true }
        })
    },
    updateValue (val, max, activeUser) {
      this.err.visible = false
      this.value = val
      if (activeUser === true) {
        this.setOptions(activeNeedleColor)
      } else {
        this.setOptions(inactiveNeedleColor)
      }

      if (max !== undefined) {
        const [range1, range2, range3] = this.getRanges(max)
        var highlights = [
          { from: 0, to: range1, color: 'rgba(255,255,255,1)' }, // white
          { from: range1, to: range2, color: 'rgba(255,255,128,1)' }, // yellow
          { from: range2, to: range3, color: 'rgba(255,208,128,1)' }, // orange
          { from: range3, to: max, color: 'rgba(255,128,128,1)' } // red
        ]

        var majorTicks = [0]
        const inc = this.getIncrement(max)
        for (var i = inc * 1; i < max; i += inc) {
          majorTicks.push(i)
        }
        majorTicks.push(max)
        this.setOptions({ maxValue: max, highlights, majorTicks })
        if (val !== 0) {
          listeners.onUpdate.forEach(listener =>
            listener(val, max, activeUser)
          )
        }
      }
    }
  },
  watch: {
    'err.visible': function (val) {
      this.gray = val
    }
  },
  mounted () {
    const interval = 1000 * 60 * 1 // 1 minute
    setInterval(this.updateGauge, interval, 1)
    this.updateGauge()
  }
}
</script>

<style scoped>
.clickable {
  -webkit-app-region: no-drag;
}

.toggle-container {
  position: absolute;
  left: 5px;
  bottom: 5px;
  width: 30px;
  height: 30px;
  border-radius: 30px;
  border: 2px solid #aaa;
  overflow: hidden;
  background-color: white;
  opacity: 0;
  transition: opacity 0s;
}

.toggle-container > div > img {
  height: 25px;
  margin: 3px auto;
}

.toggle-container:hover.ready {
  opacity: 1;
  transition: opacity 0.1s;
}

.toggle-container:active {
  transform: translate(1px, 2px);
  filter: brightness(80%);
}

.toggle-container.ready {
  opacity: 0.2;
  transition: opacity 0.5s;
}
</style>
