<script setup>
import { Head } from "@inertiajs/vue3";
import CmsLayout from "@/Layouts/CmsLayout.vue";
import ManajemenTamuContent from "@/Pages/Cms/views/undangan/ManajemenTamu.vue";

defineOptions({ layout: CmsLayout });

defineProps({ wedding: Object, guests: Array, slug: String });
</script>

<template>
    <Head title="Manajemen Tamu" />
    <ManajemenTamuContent />
</template>
