<script setup>
import { Head } from "@inertiajs/vue3";
import CmsLayout from "@/Layouts/CmsLayout.vue";
import InfoAcaraContent from "@/Pages/Cms/views/undangan/InfoAcara.vue";

defineOptions({ layout: CmsLayout });

defineProps({
    wedding: Object,
    events: Array,
    slug: String,
});
</script>

<template>
    <Head title="Informasi Acara" />
    <InfoAcaraContent />
</template>
