<template>
    <div class="section-layout">
        <div class="section-form">
            <div class="section-header">
                <span class="section-icon">👥</span>
                <div>
                    <h2 class="section-title">Manajemen Tamu</h2>
                    <p class="section-desc">
                        Kelola daftar tamu dan tracking kehadiran
                    </p>
                </div>
            </div>

            <!-- Quick add guest -->
            <div class="field-group">
                <Label>Tambah Tamu Cepat</Label>
                <div
                    style="
                        display: grid;
                        grid-template-columns: 1fr auto;
                        gap: 0.5rem;
                    "
                >
                    <Input
                        v-model="newGuest.name"
                        placeholder="Nama tamu"
                        @keydown.enter="addGuest"
                    />
                    <Button
                        @click="addGuest"
                        style="padding: 0.5rem 1rem; white-space: nowrap"
                    >
                        + Tambah
                    </Button>
                </div>
                <div
                    style="
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: 0.5rem;
                        margin-top: 0.5rem;
                    "
                >
                    <Input
                        v-model="newGuest.phone"
                        placeholder="No HP (opsional)"
                    />
                    <div>
                        <Select
                            :model-value="newGuest.category"
                            @update:model-value="(v) => (newGuest.category = v)"
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Prioritas Tamu" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="umum">Umum</SelectItem>
                                <SelectItem value="vip">VIP</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            <!-- Import Excel -->
            <div class="field-group">
                <Label>Import dari Excel</Label>
                <div class="upload-area">
                    <input
                        ref="xlsInput"
                        type="file"
                        accept=".xlsx"
                        class="hidden-input"
                        @change="handleImport"
                    />
                    <Button variant="outline" @click="$refs.xlsInput.click()">
                        📊 Upload Excel / CSV
                    </Button>
                    <p
                        class="text-xs text-muted-foreground"
                        style="margin-top: 0.5rem"
                    >
                        Format: Kolom Nama, No HP, Prioritas (Umum/VIP).
                        <a href="#" style="color: #10b981" @click.prevent="downloadTemplate">Download template</a>
                    </p>
                </div>
            </div>

            <!-- Guest list -->
            <div v-if="form.guests.length" class="field-group">
                <Label>Daftar Tamu ({{ form.guests.length }})</Label>
                <div class="guest-list">
                    <div
                        v-for="(g, i) in form.guests"
                        :key="i"
                        class="guest-item"
                    >
                        <span
                            class="guest-cat-dot"
                            :style="{ background: catColor(g.category) }"
                        ></span>
                        <div class="guest-info">
                            <span class="guest-name">{{ g.name }}</span>
                            <span class="guest-cat">{{
                                catLabel(g.category)
                            }}</span>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            class="text-destructive hover:text-destructive/80"
                            @click="removeGuest(i)"
                        >
                            ✕
                        </Button>
                    </div>
                </div>
            </div>

        </div>

        <!-- Preview -->
        <div class="section-preview">
            <div class="preview-header">
                <span class="preview-badge">Live Preview</span>
                <span class="preview-tmpl-name">Manajemen Tamu</span>
            </div>
            <div
                class="preview-body"
                style="background: linear-gradient(135deg, #f0f9ff, #e0f2fe)"
            >
                <div
                    class="preview-content"
                    style="font-family: &quot;Playfair Display&quot;, serif"
                >
                    <div class="preview-couple" style="color: #0c4a6e">
                        👥 Tamu Undangan
                    </div>
                    <div
                        class="preview-divider"
                        style="background: #0284c7"
                    ></div>
                    <!-- Stats -->
                    <div
                        style="
                            display: grid;
                            grid-template-columns: repeat(3, 1fr);
                            gap: 0.5rem;
                            width: 100%;
                        "
                    >
                        <div
                            style="
                                background: rgba(255, 255, 255, 0.7);
                                border-radius: 0.5rem;
                                padding: 0.5rem;
                                text-align: center;
                            "
                        >
                            <div
                                style="
                                    font-size: 1.25rem;
                                    font-weight: 700;
                                    color: #0c4a6e;
                                "
                            >
                                {{ form.guests.length }}
                            </div>
                            <div style="font-size: 0.65rem; color: #64748b">
                                Total
                            </div>
                        </div>
                        <div
                            style="
                                background: rgba(34, 197, 94, 0.15);
                                border-radius: 0.5rem;
                                padding: 0.5rem;
                                text-align: center;
                            "
                        >
                            <div
                                style="
                                    font-size: 1.25rem;
                                    font-weight: 700;
                                    color: #166534;
                                "
                            >
                                {{ openedCount }}
                            </div>
                            <div style="font-size: 0.65rem; color: #166534">
                                Dibuka
                            </div>
                        </div>
                        <div
                            style="
                                background: rgba(234, 179, 8, 0.15);
                                border-radius: 0.5rem;
                                padding: 0.5rem;
                                text-align: center;
                            "
                        >
                            <div
                                style="
                                    font-size: 1.25rem;
                                    font-weight: 700;
                                    color: #713f12;
                                "
                            >
                                {{ form.guests.length - openedCount }}
                            </div>
                            <div style="font-size: 0.65rem; color: #713f12">
                                Belum Buka
                            </div>
                        </div>
                    </div>
                    <!-- Sample guests -->
                    <div
                        v-for="(g, i) in form.guests.slice(0, 4)"
                        :key="i"
                        class="preview-wishlist-item"
                    >
                        <span style="font-size: 1rem">{{
                            catEmoji(g.category)
                        }}</span>
                        <span
                            class="preview-wishlist-text"
                            style="color: #0c4a6e"
                            >{{ g.name || "Nama Tamu" }}</span
                        >
                        <span class="preview-wishlist-price">{{
                            catLabel(g.category)
                        }}</span>
                    </div>
                    <div
                        v-if="form.guests.length === 0"
                        style="font-size: 0.8125rem; color: #9ca3af"
                    >
                        Belum ada tamu ditambahkan
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Import Preview Modal -->
    <div v-if="showImportModal" class="import-modal-overlay" @click.self="showImportModal = false">
        <div class="import-modal">
            <div class="import-modal-header">
                <h3>📋 Review Data Import ({{ importPreview.length }} tamu)</h3>
                <button class="import-modal-close" @click="showImportModal = false">✕</button>
            </div>
            <div class="import-modal-body">
                <table class="import-table">
                    <thead>
                        <tr>
                            <th style="width: 40%">Nama</th>
                            <th style="width: 30%">No HP</th>
                            <th style="width: 20%">Prioritas</th>
                            <th style="width: 10%"></th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(row, idx) in importPreview" :key="idx">
                            <td><input v-model="row.name" class="import-input" placeholder="Nama tamu" /></td>
                            <td><input v-model="row.phone" class="import-input" placeholder="No HP" /></td>
                            <td>
                                <select v-model="row.category" class="import-input">
                                    <option value="umum">Umum</option>
                                    <option value="vip">VIP</option>
                                </select>
                            </td>
                            <td><button class="btn-remove-row" @click="importPreview.splice(idx, 1)">✕</button></td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div class="import-modal-footer">
                <Button variant="outline" @click="showImportModal = false">Batal</Button>
                <Button @click="confirmImport">✅ Simpan {{ importPreview.length }} Tamu</Button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useStore } from "vuex";
import axios from "axios";
import {
    Select,
    SelectTrigger,
    SelectContent,
    SelectItem,
    SelectValue,
} from "@/Components/ui";
import { Button, Input, Label } from "@/Components/ui";
import "./section.css";

const store = useStore();

const saving = ref(false);
const saved = ref(false);
const xlsInput = ref(null);

const activeSlug = computed(() => store.getters["wedding/activeSlug"]);

const newGuest = ref({ name: "", phone: "", category: "umum" });

const form = ref({
    guests: [],
});

const openedCount = computed(
    () => form.value.guests.filter((g) => g.opened).length,
);

const catColors = {
    umum: "#3b82f6",
    vip: "#f59e0b",
};
const catLabels = {
    umum: "Umum",
    vip: "VIP",
};
const catEmojis = { umum: "👤", vip: "⭐" };

function catColor(c) {
    return catColors[c] || "#9ca3af";
}
function catLabel(c) {
    return catLabels[c] || c;
}
function catEmoji(c) {
    return catEmojis[c] || "👤";
}

// Load guests from API
onMounted(async () => {
    const slug = activeSlug.value;
    if (!slug) return;
    try {
        const { data } = await axios.get(`/api/wedding/${slug}/guests`);
        if (Array.isArray(data)) {
            form.value.guests = data.map((g) => ({
                id: g.id,
                name: g.name || "",
                phone: g.phone || "",
                category: g.is_vip ? "vip" : "umum",
                opened: !!g.checked_in_at,
            }));
        }
    } catch (err) {
        console.error("Failed to load guests", err);
    }
});

async function downloadTemplate() {
    const ExcelJS = await import("exceljs");
    const workbook = new ExcelJS.Workbook();
    const ws = workbook.addWorksheet("Daftar Tamu");

    // Header
    ws.columns = [
        { header: "Nama", key: "nama", width: 25 },
        { header: "No HP", key: "hp", width: 18 },
        { header: "Prioritas", key: "prioritas", width: 12 },
    ];

    // Sample rows
    ws.addRow({ nama: "Budi Santoso", hp: "08123456789", prioritas: "Umum" });
    ws.addRow({ nama: "Ibu Rahayu", hp: "08198765432", prioritas: "VIP" });

    // Style header
    ws.getRow(1).font = { bold: true };

    // Add dropdown validation for Prioritas column (C2:C100)
    for (let i = 2; i <= 100; i++) {
        ws.getCell(`C${i}`).dataValidation = {
            type: "list",
            allowBlank: true,
            formulae: ['"Umum,VIP"'],
        };
    }

    // Generate and download
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "template-daftar-tamu.xlsx";
    a.click();
    URL.revokeObjectURL(url);
}

const showImportModal = ref(false);
const importPreview = ref([]);

async function handleImport(event) {
    const file = event.target.files[0];
    if (!file) return;

    try {
        const XLSX = await import("xlsx");
        const buffer = await file.arrayBuffer();
        const wb = XLSX.read(buffer, { type: "array" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(ws, { header: 1 });

        const preview = [];
        for (let i = 1; i < rows.length; i++) {
            const row = rows[i];
            if (!row || !row[0]) continue;
            const name = String(row[0]).trim();
            const phone = row[1] ? String(row[1]).trim() : "";
            const prioritas = row[2] ? String(row[2]).trim().toLowerCase() : "umum";
            const category = prioritas === "vip" ? "vip" : "umum";
            preview.push({ name, phone, category });
        }

        // Reset input
        event.target.value = "";

        if (preview.length > 0) {
            importPreview.value = preview;
            showImportModal.value = true;
        } else {
            const Swal = (await import("sweetalert2")).default;
            Swal.fire({ icon: "warning", title: "File kosong", text: "Tidak ada data tamu ditemukan di file" });
        }
    } catch (err) {
        const Swal = (await import("sweetalert2")).default;
        Swal.fire({ icon: "error", title: "Gagal import", text: err.message });
    }
}

async function confirmImport() {
    const slug = activeSlug.value;
    if (!slug) return;
    const valid = importPreview.value.filter(r => r.name.trim());
    if (!valid.length) return;

    saving.value = true;
    try {
        const payload = valid.map(r => ({
            name: r.name.trim(),
            phone: r.phone || "",
            is_vip: r.category === "vip",
            group: r.category,
        }));
        const { data } = await axios.post(`/api/wedding/${slug}/guests/batch`, { guests: payload });

        // Add returned guests with IDs to local list
        if (Array.isArray(data)) {
            for (const g of data) {
                form.value.guests.push({ id: g.id, name: g.name, phone: g.phone || "", category: g.is_vip ? "vip" : "umum", opened: false });
            }
        } else {
            // Fallback: add locally without IDs
            for (const r of valid) {
                form.value.guests.push({ name: r.name.trim(), phone: r.phone, category: r.category, opened: false });
            }
        }

        showImportModal.value = false;
        importPreview.value = [];
        store.commit("wedding/BUMP_PREVIEW");

        const Swal = (await import("sweetalert2")).default;
        Swal.fire({ icon: "success", title: `${valid.length} tamu tersimpan!`, timer: 2500, showConfirmButton: false });
    } catch (err) {
        const Swal = (await import("sweetalert2")).default;
        Swal.fire({ icon: "error", title: "Gagal menyimpan", text: err.response?.data?.message || err.message });
    } finally {
        saving.value = false;
    }
}

async function addGuest() {
    if (!newGuest.value.name.trim()) return;
    const slug = activeSlug.value;
    if (!slug) return;
    try {
        const { data } = await axios.post(`/api/wedding/${slug}/guests`, {
            name: newGuest.value.name.trim(),
            phone: newGuest.value.phone || "",
            is_vip: newGuest.value.category === "vip",
            group: newGuest.value.category,
        });
        form.value.guests.push({ id: data.id, name: data.name, phone: data.phone || "", category: data.is_vip ? "vip" : "umum", opened: false });
        newGuest.value = { name: "", phone: "", category: "umum" };
        store.commit("wedding/BUMP_PREVIEW");
    } catch (err) {
        const Swal = (await import("sweetalert2")).default;
        Swal.fire({ icon: "error", title: "Gagal tambah tamu", text: err.response?.data?.message || err.message });
    }
}

async function removeGuest(i) {
    const guest = form.value.guests[i];
    const slug = activeSlug.value;
    if (guest.id && slug) {
        try {
            await axios.delete(`/api/wedding/${slug}/guests/${guest.id}`);
        } catch { /* ignore */ }
    }
    form.value.guests.splice(i, 1);
}

</script>

<style scoped>
.upload-area {
    border: 2px dashed var(--border, #d1d5db);
    border-radius: 0.75rem;
    padding: 1.25rem;
    text-align: center;
    background: var(--card, #f9fafb);
}
.dark .upload-area {
    background: hsl(240 10% 12%);
    border-color: hsl(240 5% 25%);
}
.upload-btn {
    background: #0284c7;
    color: white;
    border: none;
    border-radius: 0.5rem;
    padding: 0.5rem 1.25rem;
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
}
.upload-btn:hover {
    background: #0369a1;
}
.hidden-input {
    display: none;
}
.guest-list {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
    max-height: 280px;
    overflow-y: auto;
}
.guest-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.625rem;
    background: var(--card, #f9fafb);
    border-radius: 0.5rem;
    border: 1px solid var(--border, #e5e7eb);
}
.dark .guest-item {
    background: hsl(240 10% 12%);
    border-color: hsl(240 5% 20%);
}
.guest-cat-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
}
.guest-info {
    flex: 1;
    min-width: 0;
}
.guest-name {
    font-size: 0.8125rem;
    font-weight: 500;
    color: var(--foreground, #111827);
    display: block;
    truncate: ellipsis;
}
.dark .guest-name {
    color: #f9fafb;
}
.guest-cat {
    font-size: 0.7rem;
    color: var(--muted-foreground, #9ca3af);
}
.guest-status {
    flex-shrink: 0;
}
.status-badge {
    font-size: 0.65rem;
    padding: 0.125rem 0.375rem;
    border-radius: 9999px;
    background: #f3f4f6;
    color: var(--muted-foreground, #6b7280);
}
.dark .status-badge {
    background: hsl(240 10% 15%);
    color: #9ca3af;
}
.status-badge--open {
    background: #d1fae5;
    color: #059669;
}
.dark .status-badge--open {
    background: hsl(160 40% 15%);
    color: #34d399;
}
.btn-remove {
    font-size: 0.75rem;
    color: #ef4444;
    background: none;
    border: none;
    cursor: pointer;
    flex-shrink: 0;
}
/* ─── Import Modal ─── */
.import-modal-overlay {
    position: fixed;
    inset: 0;
    z-index: 9999;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
}
.import-modal {
    background: var(--card, #fff);
    border-radius: 1rem;
    width: 100%;
    max-width: 700px;
    max-height: 80vh;
    display: flex;
    flex-direction: column;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}
.dark .import-modal {
    background: hsl(240 10% 10%);
}
.import-modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 1.25rem;
    border-bottom: 1px solid var(--border, #e5e7eb);
}
.import-modal-header h3 {
    font-size: 0.95rem;
    font-weight: 600;
    color: var(--foreground, #111);
}
.dark .import-modal-header h3 {
    color: #f9fafb;
}
.import-modal-close {
    background: none;
    border: none;
    font-size: 1.25rem;
    cursor: pointer;
    color: var(--muted-foreground, #6b7280);
}
.import-modal-body {
    flex: 1;
    overflow-y: auto;
    padding: 1rem 1.25rem;
}
.import-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.8125rem;
}
.import-table th {
    text-align: left;
    padding: 0.5rem 0.375rem;
    font-weight: 600;
    color: var(--muted-foreground, #6b7280);
    border-bottom: 1px solid var(--border, #e5e7eb);
}
.import-table td {
    padding: 0.375rem;
}
.import-input {
    width: 100%;
    padding: 0.375rem 0.5rem;
    border: 1px solid var(--border, #d1d5db);
    border-radius: 0.375rem;
    font-size: 0.8125rem;
    background: var(--card, #fff);
    color: var(--foreground, #111);
}
.dark .import-input {
    background: hsl(240 10% 14%);
    border-color: hsl(240 5% 25%);
    color: #f9fafb;
}
.import-input:focus {
    outline: none;
    border-color: #10b981;
    box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.15);
}
.btn-remove-row {
    background: none;
    border: none;
    color: #ef4444;
    cursor: pointer;
    font-size: 0.875rem;
    padding: 0.25rem;
}
.import-modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
    padding: 1rem 1.25rem;
    border-top: 1px solid var(--border, #e5e7eb);
}
</style>
