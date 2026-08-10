<template>
    <div class="section-layout">
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

            <div
                v-for="(acc, i) in form.accounts"
                :key="i"
                class="account-block"
            >
                <div class="account-block-header">
                    <span class="field-label"
                        >Rekening / Dompet {{ i + 1 }}</span
                    >
                    <button
                        v-if="form.accounts.length > 1"
                        type="button"
                        class="btn-remove"
                        @click="removeAcc(i)"
                    >
                        ✕ Hapus
                    </button>
                </div>
                <div class="field-group">
                    <label class="field-label" style="font-size: 0.75rem"
                        >Jenis</label
                    >
                    <select v-model="acc.type" class="field-input">
                        <option value="bank">🏦 Bank</option>
                        <option value="dana">💙 DANA</option>
                        <option value="ovo">💜 OVO</option>
                        <option value="gopay">🟢 GoPay</option>
                        <option value="shopeepay">🟠 ShopeePay</option>
                    </select>
                </div>
                <div class="field-group">
                    <label class="field-label" style="font-size: 0.75rem">
                        {{ acc.type === "bank" ? "Nama Bank" : "Platform" }}
                    </label>
                    <input
                        v-model="acc.bankName"
                        type="text"
                        class="field-input"
                        :placeholder="
                            acc.type === 'bank'
                                ? 'Contoh: BCA, BNI, Mandiri...'
                                : 'Diisi otomatis'
                        "
                    />
                </div>
                <div class="field-group">
                    <label class="field-label" style="font-size: 0.75rem">
                        {{
                            acc.type === "bank" ? "Nomor Rekening" : "Nomor HP"
                        }}
                    </label>
                    <input
                        v-model="acc.number"
                        type="text"
                        class="field-input"
                        placeholder="Masukkan nomor..."
                    />
                </div>
                <div class="field-group">
                    <label class="field-label" style="font-size: 0.75rem"
                        >Atas Nama</label
                    >
                    <input
                        v-model="acc.name"
                        type="text"
                        class="field-input"
                        placeholder="Nama pemilik rekening"
                    />
                </div>
            </div>

            <button type="button" class="btn-add" @click="addAcc">
                + Tambah Rekening / E-Wallet
            </button>

            <!-- Alamat Pengiriman Hadiah -->
            <div
                style="
                    margin-top: 1.5rem;
                    border-top: 1px solid #e5e7eb;
                    padding-top: 1.5rem;
                "
            >
                <div class="section-header" style="margin-bottom: 1rem">
                    <span class="section-icon">🏠</span>
                    <div>
                        <h3 class="field-label" style="font-size: 1rem">
                            Alamat Pengiriman Hadiah
                        </h3>
                        <p class="section-desc">
                            Alamat untuk tamu yang ingin mengirim hadiah fisik
                        </p>
                    </div>
                </div>

                <!-- Groom Address -->
                <details class="account-block" style="margin-bottom: 1rem">
                    <summary
                        style="
                            cursor: pointer;
                            font-weight: 600;
                            font-size: 0.875rem;
                            color: #374151;
                        "
                    >
                        📍 Alamat Mempelai Pria
                    </summary>
                    <div
                        style="
                            margin-top: 0.75rem;
                            display: flex;
                            flex-direction: column;
                            gap: 0.75rem;
                        "
                    >
                        <div class="field-group">
                            <label
                                class="field-label"
                                style="font-size: 0.75rem"
                                >Nama Penerima</label
                            >
                            <input
                                v-model="form.addresses.groom.recipientName"
                                type="text"
                                class="field-input"
                                placeholder="Nama lengkap penerima"
                            />
                        </div>
                        <div class="field-group">
                            <label
                                class="field-label"
                                style="font-size: 0.75rem"
                                >Alamat Lengkap</label
                            >
                            <textarea
                                v-model="form.addresses.groom.fullAddress"
                                rows="2"
                                class="field-input field-textarea"
                                placeholder="Jl. Contoh No. 1, RT/RW, Kelurahan, Kecamatan"
                            />
                        </div>
                        <div
                            style="
                                display: grid;
                                grid-template-columns: 1fr 1fr;
                                gap: 0.75rem;
                            "
                        >
                            <div class="field-group">
                                <label
                                    class="field-label"
                                    style="font-size: 0.75rem"
                                    >Kota</label
                                >
                                <input
                                    v-model="form.addresses.groom.city"
                                    type="text"
                                    class="field-input"
                                    placeholder="Kota"
                                />
                            </div>
                            <div class="field-group">
                                <label
                                    class="field-label"
                                    style="font-size: 0.75rem"
                                    >Kode Pos</label
                                >
                                <input
                                    v-model="form.addresses.groom.postalCode"
                                    type="text"
                                    class="field-input"
                                    placeholder="12345"
                                />
                            </div>
                        </div>
                        <div class="field-group">
                            <label
                                class="field-label"
                                style="font-size: 0.75rem"
                                >Nomor HP</label
                            >
                            <input
                                v-model="form.addresses.groom.phone"
                                type="text"
                                class="field-input"
                                placeholder="08xxxxxxxxxx"
                            />
                        </div>
                    </div>
                </details>

                <!-- Bride Address -->
                <details class="account-block">
                    <summary
                        style="
                            cursor: pointer;
                            font-weight: 600;
                            font-size: 0.875rem;
                            color: #374151;
                        "
                    >
                        📍 Alamat Mempelai Wanita
                    </summary>
                    <div
                        style="
                            margin-top: 0.75rem;
                            display: flex;
                            flex-direction: column;
                            gap: 0.75rem;
                        "
                    >
                        <div class="field-group">
                            <label
                                class="field-label"
                                style="font-size: 0.75rem"
                                >Nama Penerima</label
                            >
                            <input
                                v-model="form.addresses.bride.recipientName"
                                type="text"
                                class="field-input"
                                placeholder="Nama lengkap penerima"
                            />
                        </div>
                        <div class="field-group">
                            <label
                                class="field-label"
                                style="font-size: 0.75rem"
                                >Alamat Lengkap</label
                            >
                            <textarea
                                v-model="form.addresses.bride.fullAddress"
                                rows="2"
                                class="field-input field-textarea"
                                placeholder="Jl. Contoh No. 1, RT/RW, Kelurahan, Kecamatan"
                            />
                        </div>
                        <div
                            style="
                                display: grid;
                                grid-template-columns: 1fr 1fr;
                                gap: 0.75rem;
                            "
                        >
                            <div class="field-group">
                                <label
                                    class="field-label"
                                    style="font-size: 0.75rem"
                                    >Kota</label
                                >
                                <input
                                    v-model="form.addresses.bride.city"
                                    type="text"
                                    class="field-input"
                                    placeholder="Kota"
                                />
                            </div>
                            <div class="field-group">
                                <label
                                    class="field-label"
                                    style="font-size: 0.75rem"
                                    >Kode Pos</label
                                >
                                <input
                                    v-model="form.addresses.bride.postalCode"
                                    type="text"
                                    class="field-input"
                                    placeholder="12345"
                                />
                            </div>
                        </div>
                        <div class="field-group">
                            <label
                                class="field-label"
                                style="font-size: 0.75rem"
                                >Nomor HP</label
                            >
                            <input
                                v-model="form.addresses.bride.phone"
                                type="text"
                                class="field-input"
                                placeholder="08xxxxxxxxxx"
                            />
                        </div>
                    </div>
                </details>
            </div>

            <div class="field-group">
                <label class="field-label">Pesan Ucapan Terima Kasih</label>
                <textarea
                    v-model="form.thankYouMsg"
                    rows="2"
                    class="field-input field-textarea"
                    placeholder="Terima kasih atas doa dan hadiah yang telah diberikan..."
                />
            </div>

            <div class="save-bar">
                <button
                    type="button"
                    class="btn-save"
                    :disabled="saving"
                    @click="handleSave"
                >
                    <span v-if="saving">Menyimpan…</span>
                    <span v-else>💾 Simpan Amplop Digital</span>
                </button>
                <span v-if="saved" class="save-ok">✅ Tersimpan!</span>
            </div>
        </div>

        <!-- Preview -->
        <div class="section-preview">
            <div class="preview-header">
                <span class="preview-badge">Live Preview</span>
                <span class="preview-tmpl-name">Amplop Digital</span>
            </div>
            <div
                class="preview-body"
                style="background: linear-gradient(135deg, #fefce8, #fef9c3)"
            >
                <div
                    class="preview-content"
                    style="font-family: &quot;Playfair Display&quot;, serif"
                >
                    <div class="preview-couple" style="color: #713f12">
                        💝 Amplop Digital
                    </div>
                    <div
                        class="preview-divider"
                        style="background: #ca8a04"
                    ></div>
                    <div
                        v-for="(acc, i) in form.accounts"
                        :key="i"
                        class="preview-bank-card"
                    >
                        <div class="preview-bank-logo">
                            {{ typeIcon(acc.type) }}
                        </div>
                        <div class="preview-bank-info">
                            <div
                                class="preview-bank-name"
                                style="color: #713f12"
                            >
                                {{ acc.bankName || typeName(acc.type) }}
                            </div>
                            <div class="preview-bank-number">
                                {{ acc.number || "0000 0000 0000" }}
                            </div>
                            <div style="font-size: 0.7rem; color: #9ca3af">
                                {{ acc.name || "Nama Pemilik" }}
                            </div>
                        </div>
                        <button
                            style="
                                font-size: 0.7rem;
                                background: #ca8a04;
                                color: white;
                                border: none;
                                border-radius: 0.375rem;
                                padding: 0.25rem 0.5rem;
                                cursor: default;
                            "
                        >
                            Salin
                        </button>
                    </div>
                    <div
                        v-if="form.thankYouMsg"
                        style="
                            font-size: 0.75rem;
                            color: #713f12;
                            font-style: italic;
                            text-align: center;
                        "
                    >
                        "{{ form.thankYouMsg }}"
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from "vue";
import { useStore } from "vuex";
import "./section.css";

const store = useStore();
const saving = ref(false);
const saved = ref(false);

const form = ref({
    accounts: [{ type: "bank", bankName: "", number: "", name: "" }],
    thankYouMsg: "",
    addresses: {
        groom: {
            recipientName: "",
            fullAddress: "",
            city: "",
            postalCode: "",
            phone: "",
        },
        bride: {
            recipientName: "",
            fullAddress: "",
            city: "",
            postalCode: "",
            phone: "",
        },
    },
});

const typeIconMap = {
    bank: "🏦",
    dana: "💙",
    ovo: "💜",
    gopay: "🟢",
    shopeepay: "🟠",
};
const typeNameMap = {
    bank: "Bank",
    dana: "DANA",
    ovo: "OVO",
    gopay: "GoPay",
    shopeepay: "ShopeePay",
};

function typeIcon(t) {
    return typeIconMap[t] || "💳";
}
function typeName(t) {
    return typeNameMap[t] || t;
}

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
    saving.value = true;
    try {
        await store.dispatch("settings/saveSettings", {
            amplopAccounts: form.value.accounts,
            amplopThankYouMsg: form.value.thankYouMsg,
            amplopAddresses: form.value.addresses,
        });
        saved.value = true;
        setTimeout(() => {
            saved.value = false;
        }, 2500);
    } catch {
        alert("Gagal menyimpan. Silakan coba lagi.");
    } finally {
        saving.value = false;
    }
}
</script>

<style scoped>
.account-block {
    border: 1px solid #fef3c7;
    border-radius: 0.75rem;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    background: #fffbf0;
}
.account-block-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
}
.btn-remove {
    font-size: 0.75rem;
    color: #ef4444;
    background: none;
    border: none;
    cursor: pointer;
    font-weight: 500;
}
.btn-add {
    border: 2px dashed #d1d5db;
    border-radius: 0.75rem;
    padding: 0.625rem 1rem;
    font-size: 0.875rem;
    color: #6b7280;
    background: white;
    cursor: pointer;
    text-align: center;
    width: 100%;
}
.btn-add:hover {
    border-color: #ca8a04;
    color: #ca8a04;
}
</style>
