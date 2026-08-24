<template>
    <div class="section-form">
        <div class="section-header">
            <span class="section-icon">💰</span>
            <div>
                <h2 class="section-title">Amplop Digital</h2>
                <p class="section-desc">
                    Terima hadiah digital via transfer bank & e-wallet
                </p>
            </div>
        </div>

        <div v-for="(acc, i) in form.accounts" :key="i" class="account-block">
            <div class="account-block-header">
                <Label class="text-foreground font-semibold"
                    >Rekening / Dompet {{ i + 1 }}</Label
                >
                <Button
                    v-if="form.accounts.length > 1"
                    variant="ghost"
                    size="sm"
                    class="text-destructive hover:text-destructive/80 h-7 px-2"
                    @click="removeAcc(i)"
                >
                    ✕ Hapus
                </Button>
            </div>

            <div class="field-group">
                <Label>Jenis</Label>
                <Select
                    v-model="acc.type"
                    @update:model-value="(v) => (acc.type = v)"
                >
                    <SelectTrigger>
                        <SelectValue
                            :placeholder="
                                acc.type === 'bank' ? '🏦 Bank' : acc.type
                            "
                        />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="bank">🏦 Bank</SelectItem>
                        <SelectItem value="dana">💙 DANA</SelectItem>
                        <SelectItem value="ovo">💜 OVO</SelectItem>
                        <SelectItem value="gopay">🟢 GoPay</SelectItem>
                        <SelectItem value="shopeepay">🟠 ShopeePay</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div class="field-group">
                <Label>{{
                    acc.type === "bank" ? "Nama Bank" : "Platform"
                }}</Label>
                <Input
                    v-model="acc.bankName"
                    :placeholder="
                        acc.type === 'bank'
                            ? 'Contoh: BCA, BNI, Mandiri...'
                            : 'Diisi otomatis'
                    "
                />
            </div>

            <div class="field-group">
                <Label>{{
                    acc.type === "bank" ? "Nomor Rekening" : "Nomor HP"
                }}</Label>
                <Input v-model="acc.number" placeholder="Masukkan nomor..." />
            </div>

            <div class="field-group">
                <Label>Atas Nama</Label>
                <Input v-model="acc.name" placeholder="Nama pemilik rekening" />
            </div>
        </div>

        <Button
            variant="outline"
            class="w-full border-dashed border-2 hover:border-amber-500 hover:text-amber-600"
            @click="addAcc"
        >
            + Tambah Rekening / E-Wallet
        </Button>

        <!-- Alamat Pengiriman Hadiah -->
        <div class="pt-4 border-t border-border">
            <div class="section-header mb-4">
                <span class="section-icon text-xl">🏠</span>
                <div>
                    <Label class="text-base text-foreground font-semibold"
                        >Alamat Pengiriman Hadiah</Label
                    >
                    <p class="section-desc">
                        Alamat untuk tamu yang ingin mengirim hadiah fisik
                    </p>
                </div>
            </div>

            <!-- Groom Address -->
            <details class="account-block mb-4">
                <summary
                    class="cursor-pointer font-semibold text-sm text-foreground"
                >
                    📍 Alamat Mempelai Pria
                </summary>
                <div class="mt-3 flex flex-col gap-3">
                    <div class="field-group">
                        <Label>Nama Penerima</Label>
                        <Input
                            v-model="form.addresses.groom.recipientName"
                            placeholder="Nama lengkap penerima"
                        />
                    </div>
                    <div class="field-group">
                        <Label>Alamat Lengkap</Label>
                        <Textarea
                            v-model="form.addresses.groom.fullAddress"
                            rows="2"
                            placeholder="Jl. Contoh No. 1, RT/RW, Kelurahan, Kecamatan"
                        />
                    </div>
                    <div class="grid grid-cols-2 gap-3">
                        <div class="field-group">
                            <Label>Kota</Label>
                            <Input
                                v-model="form.addresses.groom.city"
                                placeholder="Kota"
                            />
                        </div>
                        <div class="field-group">
                            <Label>Kode Pos</Label>
                            <Input
                                v-model="form.addresses.groom.postalCode"
                                placeholder="12345"
                            />
                        </div>
                    </div>
                    <div class="field-group">
                        <Label>Nomor HP</Label>
                        <Input
                            v-model="form.addresses.groom.phone"
                            placeholder="08xxxxxxxxxx"
                        />
                    </div>
                </div>
            </details>

            <!-- Bride Address -->
            <details class="account-block">
                <summary
                    class="cursor-pointer font-semibold text-sm text-foreground"
                >
                    📍 Alamat Mempelai Wanita
                </summary>
                <div class="mt-3 flex flex-col gap-3">
                    <div class="field-group">
                        <Label>Nama Penerima</Label>
                        <Input
                            v-model="form.addresses.bride.recipientName"
                            placeholder="Nama lengkap penerima"
                        />
                    </div>
                    <div class="field-group">
                        <Label>Alamat Lengkap</Label>
                        <Textarea
                            v-model="form.addresses.bride.fullAddress"
                            rows="2"
                            placeholder="Jl. Contoh No. 1, RT/RW, Kelurahan, Kecamatan"
                        />
                    </div>
                    <div class="grid grid-cols-2 gap-3">
                        <div class="field-group">
                            <Label>Kota</Label>
                            <Input
                                v-model="form.addresses.bride.city"
                                placeholder="Kota"
                            />
                        </div>
                        <div class="field-group">
                            <Label>Kode Pos</Label>
                            <Input
                                v-model="form.addresses.bride.postalCode"
                                placeholder="12345"
                            />
                        </div>
                    </div>
                    <div class="field-group">
                        <Label>Nomor HP</Label>
                        <Input
                            v-model="form.addresses.bride.phone"
                            placeholder="08xxxxxxxxxx"
                        />
                    </div>
                </div>
            </details>
        </div>

        <div class="field-group">
            <Label>Pesan Ucapan Terima Kasih</Label>
            <Textarea
                v-model="form.thankYouMsg"
                rows="2"
                placeholder="Terima kasih atas doa dan hadiah yang telah diberikan..."
            />
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
import {
    Select,
    SelectTrigger,
    SelectContent,
    SelectItem,
    SelectValue,
} from "@/Components/ui";
import { useAutoSavePreview } from "@/Composables/useAutoSavePreview";
import "./section.css";

const store = useStore();
const saving = ref(false);
const saved = ref(false);

const activeSlug = computed(() => store.getters["wedding/activeSlug"]);

const emptyAddress = () => ({
    recipientName: "",
    fullAddress: "",
    city: "",
    postalCode: "",
    phone: "",
});

const form = ref({
    accounts: [{ type: "bank", bankName: "", number: "", name: "" }],
    thankYouMsg: "",
    addresses: {
        groom: emptyAddress(),
        bride: emptyAddress(),
    },
});

function hydrateForm(s) {
    if (!s) return;
    if (Array.isArray(s.amplopAccounts) && s.amplopAccounts.length > 0) {
        form.value.accounts = s.amplopAccounts.map((a) => ({
            type: a.type || "bank",
            bankName: a.bankName || "",
            number: a.number || "",
            name: a.name || "",
        }));
    }
    if (s.amplopThankYouMsg) {
        form.value.thankYouMsg = s.amplopThankYouMsg;
    }
    if (s.amplopAddresses && typeof s.amplopAddresses === "object") {
        const g = s.amplopAddresses.groom || {};
        const b = s.amplopAddresses.bride || {};
        form.value.addresses.groom = { ...emptyAddress(), ...g };
        form.value.addresses.bride = { ...emptyAddress(), ...b };
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

function addAcc() {
    form.value.accounts.push({
        type: "bank",
        bankName: "",
        number: "",
        name: "",
    });
}

function removeAcc(i) {
    form.value.accounts.splice(i, 1);
}

async function handleSave() {
    const slug = activeSlug.value;
    if (!slug) return;
    saving.value = true;
    try {
        await axios.post(`/api/wedding/${slug}/settings`, {
            amplopAccounts: form.value.accounts,
            amplopThankYouMsg: form.value.thankYouMsg,
            amplopAddresses: form.value.addresses,
        });
        saved.value = true;
        store.commit("wedding/BUMP_PREVIEW");
        setTimeout(() => {
            saved.value = false;
        }, 2500);
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
.account-block-header {
    @apply flex items-center justify-between;
}
</style>
