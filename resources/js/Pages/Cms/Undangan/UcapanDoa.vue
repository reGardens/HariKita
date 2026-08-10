<script setup>
import { Head } from "@inertiajs/vue3";
import CmsLayout from "@/Layouts/CmsLayout.vue";
import UcapanDoaContent from "@/Pages/Cms/views/undangan/UcapanDoa.vue";

defineOptions({ layout: CmsLayout });

defineProps({ wedding: Object, wishes: Array, slug: String });
</script>

<template>
    <Head title="Ucapan & Doa" />
    <UcapanDoaContent />
</template>
