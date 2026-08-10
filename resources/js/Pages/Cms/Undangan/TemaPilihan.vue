<script setup>
import { Head } from "@inertiajs/vue3";
import CmsLayout from "@/Layouts/CmsLayout.vue";
import TemaPilihanContent from "@/Pages/Cms/views/undangan/TemaPilihan.vue";

defineOptions({ layout: CmsLayout });

defineProps({
    wedding: Object,
    templates: Array,
    slug: String,
});
</script>

<template>
    <Head title="Tema & Template" />
    <TemaPilihanContent />
</template>
