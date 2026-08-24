<template>
    <div class="section-form">
        <div class="section-header">
            <span class="section-icon">🎁</span>
            <div>
                <h2 class="section-title">Wishlist Hadiah</h2>
                <p class="section-desc">
                    Buat daftar hadiah yang bisa dibeli tamu
                </p>
            </div>
        </div>

        <div class="flex items-start justify-between gap-4">
            <div>
                <Label class="text-foreground font-semibold"
                    >Aktifkan Wishlist</Label
                >
                <p class="text-xs text-muted-foreground mt-0.5">
                    Tampilkan halaman wishlist di undangan
                </p>
            </div>
            <button
                type="button"
                class="toggle-btn"
                :class="{ 'toggle-btn--on': form.enabled }"
                @click="form.enabled = !form.enabled"
            >
                <span
                    class="toggle-thumb"
                    :class="{ 'toggle-thumb--on': form.enabled }"
                ></span>
            </button>
        </div>

        <div v-for="(item, i) in form.items" :key="i" class="wish-block">
            <div class="wish-block-header">
                <Label class="text-foreground font-semibold"
                    >Item {{ i + 1 }}</Label
                >
                <Button
                    v-if="form.items.length > 1"
                    variant="ghost"
                    size="sm"
                    class="text-destructive hover:text-destructive/80 h-7 px-2"
                    @click="removeItem(i)"
                >
                    ✕
                </Button>
            </div>

            <div class="flex gap-3 items-center">
                <Input
                    v-model="item.emoji"
                    maxlength="4"
                    placeholder="🎁"
                    class="w-14 text-center text-2xl"
                />
                <Input
                    v-model="item.name"
                    placeholder="Nama hadiah"
                    class="flex-1"
                />
            </div>

            <div class="grid grid-cols-2 gap-3">
                <div class="field-group">
                    <Label>Harga (opsional)</Label>
                    <Input v-model="item.price" placeholder="Rp 500.000" />
                </div>
                <div class="field-group">
                    <Label>Link Toko</Label>
                    <Input v-model="item.url" placeholder="https://..." />
                </div>
            </div>

            <div class="field-group">
                <Input
                    v-model="item.note"
                    placeholder="Catatan tambahan (opsional)"
                />
            </div>
        </div>

        <Button
            variant="outline"
            class="w-full border-dashed border-2 hover:border-orange-500 hover:text-orange-600"
            @click="addItem"
        >
            + Tambah Item Wishlist
        </Button>

        <div class="save-bar">
            <Button :disabled="saving" @click="handleSave">
                <span v-if="saving">Menyimpan…</span>
                <span v-else>💾 Simpan Wishlist</span>
            </Button>
            <span v-if="saved" class="save-ok">✅ Tersimpan!</span>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useStore } from "vuex";
import axios from "axios";
import { Input } from "@/Components/ui";
import { Label } from "@/Components/ui";
import { Button } from "@/Components/ui";
import { useAutoSavePreview } from "@/Composables/useAutoSavePreview";
import "./section.css";

const store = useStore();
const saving = ref(false);
const saved = ref(false);

const activeSlug = computed(() => store.getters["wedding/activeSlug"]);

const emptyItem = () => ({
    emoji: "🎁",
    name: "",
    price: "",
    url: "",
    note: "",
});

const form = ref({
    enabled: true,
    items: [
        { ...emptyItem(), emoji: "🍳" },
        { ...emptyItem(), emoji: "🛁" },
    ],
});

async function loadWishlist() {
    const slug = activeSlug.value;
    if (!slug) return;
    try {
        const { data } = await axios.get(`/api/wedding/${slug}/settings`);
        if (typeof data.wishlistEnabled === "boolean") {
            form.value.enabled = data.wishlistEnabled;
        }
        if (
            Array.isArray(data.wishlistItems) &&
            data.wishlistItems.length > 0
        ) {
            form.value.items = data.wishlistItems.map((w) => ({
                emoji: w.emoji || "🎁",
                name: w.name || "",
                price: w.price || "",
                url: w.url || "",
                note: w.note || "",
            }));
        }
        skipNextWatch();
    } catch (err) {
        console.error("Failed to load wishlist", err);
    }
}

onMounted(loadWishlist);

function addItem() {
    form.value.items.push(emptyItem());
}

function removeItem(i) {
    form.value.items.splice(i, 1);
}

async function handleSave() {
    const slug = activeSlug.value;
    if (!slug) return;
    saving.value = true;
    try {
        await axios.post(`/api/wedding/${slug}/settings`, {
            wishlistEnabled: form.value.enabled,
            wishlistItems: form.value.items,
        });
        saved.value = true;
        store.commit("wedding/BUMP_PREVIEW");
        setTimeout(() => {
            saved.value = false;
        }, 2500);
    } catch (err) {
        console.error("Failed to save wishlist", err);
        alert("Gagal menyimpan wishlist. Silakan coba lagi.");
    } finally {
        saving.value = false;
    }
}

const { skipNextWatch } = useAutoSavePreview(form, handleSave);
</script>

<style scoped>
.wish-block {
    @apply border border-border rounded-xl p-4 flex flex-col gap-3 bg-card;
}
.wish-block-header {
    @apply flex items-center justify-between;
}
.toggle-btn {
    @apply w-11 h-6 rounded-full bg-muted border-none cursor-pointer relative flex-shrink-0 transition-colors;
}
.toggle-btn--on {
    @apply bg-emerald-500;
}
.toggle-thumb {
    @apply absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform;
}
.toggle-thumb--on {
    @apply translate-x-5;
}
</style>
