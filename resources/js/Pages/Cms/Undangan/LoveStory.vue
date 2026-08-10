<script setup>
import { Head } from "@inertiajs/vue3";
import CmsLayout from "@/Layouts/CmsLayout.vue";
import LoveStoryContent from "@/Pages/Cms/views/undangan/LoveStory.vue";

defineOptions({ layout: CmsLayout });

defineProps({ wedding: Object, slug: String });
</script>

<template>
    <Head title="Love Story" />
    <LoveStoryContent />
</template>
