<script setup>
import { ref } from 'vue';
import DataTable from 'primevue/datatable';
import { FileUpload } from "primevue";
import Column from 'primevue/column';
import Papa from 'papaparse';
import ExperimentList from "./ExperimentList.vue";
import ExperimentChart from "./ExperimentChart.vue";

const data = ref([]);
const loading = ref(false);
const selectedRows = ref([]);
const currentFileName = ref('');
const uniqueExperiments = ref([]);
const selectedChartExperiments = ref([]);

const handleFileUpload = (event) => {
    const file = event.files[0];
    if (!file) return;

    currentFileName.value = file.name;
    loading.value = true;

    Papa.parse(file, {
        header: true,
        complete: (results) => {
            data.value = results.data.map((row, index) => ({
                ...row,
                id: index
            }));
            uniqueExperiments.value = [...new Set(results.data.map(item => item.experiment_id))];
            loading.value = false;
        },
        error: () => {
            loading.value = false;
        }
    });
};

const handleExperimentSelection = (selected) => {
    selectedChartExperiments.value = selected;
};
</script>

<template>
    <div class="container">
        <h1>ML Experiment Tracker</h1>

        <div class="file-upload-container">
            <FileUpload
                mode="basic"
                name="demo"
                accept=".csv"
                chooseLabel="Choose File"
                @select="handleFileUpload"
                :auto="true"
                :customUpload="true"
                class="file-upload-button"
            />

            <div v-if="currentFileName" class="file-info">
                File name: {{ currentFileName }}
            </div>
        </div>

        <div v-if="loading">Loading data...</div>

        <div v-if="data.length > 0">
            <div class="tables-container">
                <ExperimentList
                    :experiments="uniqueExperiments"
                    :data="data"
                    @selection-change="handleExperimentSelection"
                />

                <div class="main-table-wrapper">
                    <DataTable
                        :value="data"
                        v-model:selection="selectedRows"
                        dataKey="id"
                        selectionMode="multiple"
                        :paginator="true"
                        :rows="10"
                        :rowsPerPageOptions="[10, 20, 50]"
                        scrollable
                        scrollHeight="flex"
                        class="data-table"
                    >
                        <Column selectionMode="multiple" headerStyle="width: 3rem"></Column>
                        <Column field="experiment_id" header="Experiment ID"></Column>
                        <Column field="metric_name" header="Metric"></Column>
                        <Column field="step" header="Step"></Column>
                        <Column field="value" header="Value"></Column>
                    </DataTable>
                </div>
            </div>

            <ExperimentChart
                :data="data"
                :selectedExperiments="selectedChartExperiments"
            />
        </div>
    </div>
</template>

<style lang="scss" scoped>
.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
}
.file-upload-container {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin: 1rem 0;
}
.file-upload-button {
    margin: 0 !important;
}
.file-info {
    color: #1a1a1a;
    font-size: 2rem;
    margin: 0;
}
.tables-container {
    display: flex;
    gap: 1rem;
    height: 597px;
    margin-top: 1rem;
}
.main-table-wrapper {
    flex: 1;
    display: flex;
    flex-direction: column;
}
.data-table {
    flex-grow: 1;
    overflow: hidden;
    :deep(.p-paginator) {
        padding-top: 13px;
        border-radius: 0;
    }
}
</style>