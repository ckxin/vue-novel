<template>
    <div id="my-info">
        <div class="text-center">
            {{ title }}
        </div>
    </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex';

export default {
    name: "Myinfo",
    data() {
        return {
            title: "我的"
        }
    },
    computed: {
        ...mapState(['current_window_index'])
    },
    methods: {
        ...mapMutations(['set_current_window_index']),
    },
    activated() {
        this.set_current_window_index(2);
    },
}
</script>

<style scoped>

</style>