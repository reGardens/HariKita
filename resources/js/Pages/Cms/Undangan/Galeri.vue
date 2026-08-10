<script setup>
import { Head } from "@inertiajs/vue3";
import CmsLayout from "@/Layouts/CmsLayout.vue";
import { useWeddingSlug } from "@/Composables/useWeddingSlug";
import GaleriContent from "@/Pages/Cms/views/undangan/Galeri.vue";

defineOptions({ layout: CmsLayout });

const props = defineProps({ wedding: Object, slug: String, media: Array });

useWeddingSlug(props.slug);
</script>

<template>
    <Head title="Galeri Foto" />
    <GaleriContent />
</template>
