<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'alerts',

  data() {
    return {
      show: true,
      showMsg: true,
      isValid: true,
      alerts: [
        {
          type: 'danger',
          message: 'This is a danger message',
          isRemovable: true,
          autoRemoveAfter: -1
        },
        {
          type: 'primary',
          message: 'This is a primary message',
          isRemovable: false,
          autoRemoveAfter: -1
        },
        {
          type: 'secondary',
          message: 'This is a secondary message',
          isRemovable: true,
          autoRemoveAfter: -1
        },
        {
          type: 'warning',
          message: 'This is a warning message',
          isRemovable: true,
          autoRemoveAfter: 500
        },
        {
          type: 'success',
          message: 'This is a warning message',
          isRemovable: true,
          autoRemoveAfter: -1
        }
      ]
    };
  },
  methods: {
    alertClass(type: string) {
      switch (type) {
        case 'primary':
          return 'alert__primary';
          break;
        case 'danger':
          return 'alert__danger';
          break;
        case 'warning':
          return 'alert__warning';
          break;
        case 'success':
          return 'alert__success';
          break;
        case 'secondary':
          return 'alert__secondary';
          break;
        default:
          return 'alert__primary';
      }
    },
    removeAlertFromList(index: number) {
      this.alerts.splice(index, 1);
    }
  },

  setup() {}
});
</script>

<template>
  <div
    v-for="(alert, index) in alerts"
    class="alert"
    :class="alertClass(alert.type)"
  >
    <span
      v-if="alert.isRemovable"
      class="closebtn"
      @click="removeAlertFromList(index)"
      >&times;</span
    >
    <strong>primary!</strong> Indicates a dangerous or potentially negative
    action.
  </div>
</template>

<style scoped lang="scss">
.alert {
  margin-top: 10px;
  padding: 20px;
  color: black;
  border-radius: 20px;
}
.alert {
  &__danger {
    background-color: #ffebee;
  }
  &__primary {
    background-color: #ccf2ff;
  }
  &__success {
    background-color: #d6f5d6;
  }
  &__secondary {
    background-color: #e2e3e3;
  }

  &__warning {
    background-color: #ffff9a;
  }
}
.alert .closebtn {
  margin-left: 15px;
  color: black;
  font-weight: bold;
  float: right;
  font-size: 22px;
  line-height: 20px;
  cursor: pointer;
  transition: 0.3s;
}

.closebtn:hover {
  color: white;
}
</style>
