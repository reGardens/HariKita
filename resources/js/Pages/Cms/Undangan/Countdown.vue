<script setup>
import { Head } from "@inertiajs/vue3";
import CmsLayout from "@/Layouts/CmsLayout.vue";
import CountdownContent from "@/Pages/Cms/views/undangan/Countdown.vue";

defineOptions({ layout: CmsLayout });

defineProps({ wedding: Object, slug: String });
</script>

<template>
    <Head title="Countdown" />
    <CountdownContent />
</template>
