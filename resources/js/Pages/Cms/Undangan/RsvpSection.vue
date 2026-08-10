<script setup>
import { Head } from "@inertiajs/vue3";
import CmsLayout from "@/Layouts/CmsLayout.vue";
import RsvpSectionContent from "@/Pages/Cms/views/undangan/RsvpSection.vue";

defineOptions({ layout: CmsLayout });

defineProps({
    wedding: Object,
    rsvps: Array,
    slug: String,
});
</script>

<template>
    <Head title="RSVP Online" />
    <RsvpSectionContent />
</template>
