<script setup>
import { Head } from "@inertiajs/vue3";
import CmsLayout from "@/Layouts/CmsLayout.vue";
import { useWeddingSlug } from "@/Composables/useWeddingSlug";
import LoveStoryContent from "@/Pages/Cms/views/undangan/LoveStory.vue";

defineOptions({ layout: CmsLayout });

const props = defineProps({ wedding: Object, slug: String });

useWeddingSlug(props.slug);
</script>

<template>
    <Head title="Love Story" />
    <LoveStoryContent />
</template>
