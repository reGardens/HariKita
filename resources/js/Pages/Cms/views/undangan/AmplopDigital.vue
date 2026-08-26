<template>
    <div class="section-form">
        <div class="section-header">
            <span class="section-icon">💰</span>
            <div>
                <h2 class="section-title">Amplop Digital</h2>
                <p class="section-desc">
                    Terima hadiah digital via transfer bank
                </p>
            </div>
        </div>

        <!-- Rekening Mempelai Pria -->
        <div class="account-block">
            <Label class="text-foreground font-semibold">Rekening Mempelai Pria</Label>
            <div class="field-group">
                <Label>Nama Bank</Label>
                <Input v-model="form.accounts[0].bankName" placeholder="Contoh: BCA, BNI, Mandiri..." />
            </div>
            <div class="field-group">
                <Label>Nomor Rekening</Label>
                <Input v-model="form.accounts[0].number" placeholder="Masukkan nomor rekening" />
            </div>
            <div class="field-group">
                <Label>Atas Nama</Label>
                <Input v-model="form.accounts[0].name" placeholder="Nama pemilik rekening" />
            </div>
        </div>

        <!-- Rekening Mempelai Wanita -->
        <div class="account-block">
            <Label class="text-foreground font-semibold">Rekening Mempelai Wanita</Label>
            <div class="field-group">
                <Label>Nama Bank</Label>
                <Input v-model="form.accounts[1].bankName" placeholder="Contoh: BCA, BNI, Mandiri..." />
            </div>
            <div class="field-group">
                <Label>Nomor Rekening</Label>
                <Input v-model="form.accounts[1].number" placeholder="Masukkan nomor rekening" />
            </div>
            <div class="field-group">
                <Label>Atas Nama</Label>
                <Input v-model="form.accounts[1].name" placeholder="Nama pemilik rekening" />
            </div>
        </div>

        <!-- Alamat Pengiriman Hadiah -->
        <div class="pt-4 border-t border-border">
            <div class="section-header mb-4">
                <span class="section-icon text-xl">🏠</span>
                <div>
                    <Label class="text-base text-foreground font-semibold">Alamat Pengiriman Hadiah</Label>
                    <p class="section-desc">Alamat untuk tamu yang ingin mengirim hadiah fisik</p>
                </div>
            </div>

            <div class="field-group">
                <Label>Alamat Mempelai Pria</Label>
                <Textarea v-model="form.addresses.groom" rows="2" placeholder="Alamat lengkap mempelai pria..." />
            </div>

            <div class="field-group">
                <Label>Alamat Mempelai Wanita</Label>
                <Textarea v-model="form.addresses.bride" rows="2" placeholder="Alamat lengkap mempelai wanita..." />
            </div>
        </div>

        <div class="save-bar">
            <Button :disabled="saving" @click="handleSave">
                <span v-if="saving">Menyimpan…</span>
                <span v-else>💾 Simpan Amplop Digital</span>
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
import { Textarea } from "@/Components/ui";
import { useAutoSavePreview } from "@/Composables/useAutoSavePreview";
import "./section.css";

const store = useStore();
const saving = ref(false);
const saved = ref(false);

const activeSlug = computed(() => store.getters["wedding/activeSlug"]);

const form = ref({
    accounts: [
        { type: "bank", bankName: "", number: "", name: "" },
        { type: "bank", bankName: "", number: "", name: "" },
    ],
    addresses: {
        groom: "",
        bride: "",
    },
});

function hydrateForm(s) {
    if (!s) return;
    if (Array.isArray(s.amplopAccounts) && s.amplopAccounts.length > 0) {
        form.value.accounts[0] = {
            type: "bank",
            bankName: s.amplopAccounts[0]?.bankName || "",
            number: s.amplopAccounts[0]?.number || "",
            name: s.amplopAccounts[0]?.name || "",
        };
        if (s.amplopAccounts[1]) {
            form.value.accounts[1] = {
                type: "bank",
                bankName: s.amplopAccounts[1]?.bankName || "",
                number: s.amplopAccounts[1]?.number || "",
                name: s.amplopAccounts[1]?.name || "",
            };
        }
    }
    if (s.amplopAddresses && typeof s.amplopAddresses === "object") {
        form.value.addresses.groom = s.amplopAddresses.groom?.fullAddress || s.amplopAddresses.groom || "";
        form.value.addresses.bride = s.amplopAddresses.bride?.fullAddress || s.amplopAddresses.bride || "";
    }
}

async function loadData() {
    const slug = activeSlug.value;
    if (!slug) return;
    try {
        const { data } = await axios.get(`/api/wedding/${slug}/settings`);
        hydrateForm(data);
        skipNextWatch();
    } catch (err) {
        console.error("Failed to load amplop settings", err);
    }
}

onMounted(loadData);

async function handleSave() {
    const slug = activeSlug.value;
    if (!slug) return;
    saving.value = true;
    try {
        await axios.post(`/api/wedding/${slug}/settings`, {
            amplopAccounts: form.value.accounts,
            amplopAddresses: {
                groom: { fullAddress: form.value.addresses.groom },
                bride: { fullAddress: form.value.addresses.bride },
            },
        });
        saved.value = true;
        store.commit("wedding/BUMP_PREVIEW");
        setTimeout(() => { saved.value = false; }, 2500);
    } catch (err) {
        console.error("Failed to save amplop", err);
        alert("Gagal menyimpan. Silakan coba lagi.");
    } finally {
        saving.value = false;
    }
}

const { skipNextWatch } = useAutoSavePreview(form, handleSave);
</script>

<style scoped>
.account-block {
    @apply border border-border rounded-xl p-4 flex flex-col gap-3 bg-card;
}
</style>
