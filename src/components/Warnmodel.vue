<template>
    <div class="row fixed-top bg-transparent h-100" style="font-size: 15px">
      <div class="m-auto bg-dark text-white warn-msg">{{ warn_msg }}</div>
    </div>    
</template>

<script>
export default {
    name: "Warnmodel",
    props: {
        warn_msg: String
    }
}
</script>

<style scoped>
.warn-msg {
  height: 40px;
  width: 300px;
  line-height: 40px;
  border-radius: 5px;
  text-align: center;
  opacity: 0.8;
}
</style>