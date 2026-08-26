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

            <div class="save-bar">
                <Button :disabled="saving" @click="handleSave">
                    <span v-if="saving">Menyimpan…</span>
                    <span v-else>💾 Simpan Daftar Tamu</span>
                </Button>
                <span v-if="saved" class="save-ok">✅ Tersimpan!</span>
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
</template>

<script setup>
import { ref, computed } from "vue";
import { useStore } from "vuex";
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

async function handleImport(event) {
    const file = event.target.files[0];
    if (!file) return;

    try {
        const XLSX = await import("xlsx");
        const buffer = await file.arrayBuffer();
        const wb = XLSX.read(buffer, { type: "array" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(ws, { header: 1 });

        // Skip header row
        let imported = 0;
        for (let i = 1; i < rows.length; i++) {
            const row = rows[i];
            if (!row || !row[0]) continue;
            const name = String(row[0]).trim();
            const phone = row[1] ? String(row[1]).trim() : "";
            const prioritas = row[2] ? String(row[2]).trim().toLowerCase() : "umum";
            const category = prioritas === "vip" ? "vip" : "umum";

            form.value.guests.push({ name, phone, category, opened: false });
            imported++;
        }

        // Reset input
        event.target.value = "";

        if (imported > 0) {
            const Swal = (await import("sweetalert2")).default;
            Swal.fire({
                icon: "success",
                title: `${imported} tamu berhasil diimport!`,
                timer: 2500,
                showConfirmButton: false,
            });
        }
    } catch (err) {
        const Swal = (await import("sweetalert2")).default;
        Swal.fire({ icon: "error", title: "Gagal import", text: err.message });
    }
}

function addGuest() {
    if (!newGuest.value.name.trim()) return;
    form.value.guests.push({ ...newGuest.value, opened: false });
    newGuest.value = { name: "", phone: "", category: "umum" };
}

function removeGuest(i) {
    form.value.guests.splice(i, 1);
}

async function handleSave() {
    saving.value = true;
    await new Promise((r) => setTimeout(r, 800));
    saving.value = false;
    saved.value = true;
    store.commit("wedding/BUMP_PREVIEW");
    setTimeout(() => {
        saved.value = false;
    }, 2500);
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
</style>
