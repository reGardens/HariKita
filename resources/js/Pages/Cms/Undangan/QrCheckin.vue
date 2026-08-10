<script setup>
import { Head } from "@inertiajs/vue3";
import CmsLayout from "@/Layouts/CmsLayout.vue";
import QrCheckinContent from "@/Pages/Cms/views/undangan/QrCheckin.vue";

defineOptions({ layout: CmsLayout });

defineProps({ wedding: Object, slug: String });
</script>

<template>
    <Head title="QR Check-in" />
    <QrCheckinContent />
</template>
