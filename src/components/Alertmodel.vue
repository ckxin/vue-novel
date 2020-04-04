<template>
    <div id="alert-model">
      <div class="alert-main">
        <div id="alert-msg" class="row mx-0">
          {{ alert_msg }}
        </div>
        <slot></slot>
      </div>
    </div>    
</template>

<script>
export default {
    name: "Alertmodel",
    props: {
        alert_msg: String
    },
}
</script>

<style scoped>
#alert-model {
  width: 100%;
  height: 100%;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 300;
  background: rgba(125, 125, 125, 0.5);
}
.alert-main {
  width: 350px;
  padding: 50px 20px;
  margin: auto;
  margin-top: 200px;
  background: white;
  opacity: 1;
  border-radius: 5px;
  font-size: 18px;
}
</style>