<script setup>
import { Head } from "@inertiajs/vue3";
import CmsLayout from "@/Layouts/CmsLayout.vue";
import AmplopDigitalContent from "@/Pages/Cms/views/undangan/AmplopDigital.vue";

defineOptions({ layout: CmsLayout });

defineProps({ wedding: Object, slug: String });
</script>

<template>
    <Head title="Amplop Digital" />
    <AmplopDigitalContent />
</template>
