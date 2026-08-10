<script setup>
import { Head } from "@inertiajs/vue3";
import CmsLayout from "@/Layouts/CmsLayout.vue";
import GaleriContent from "@/Pages/Cms/views/undangan/Galeri.vue";

defineOptions({ layout: CmsLayout });

defineProps({ wedding: Object, media: Array, slug: String });
</script>

<template>
    <Head title="Galeri Foto" />
    <GaleriContent />
</template>
