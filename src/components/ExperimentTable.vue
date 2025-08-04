<template>
    <div class="container">
        <h1>ML Experiment Tracker</h1>

        <div class="file-upload-container">
            <FileUpload
                mode="basic"
                accept=".csv"
                chooseLabel="Choose File"
                @select="handleFileUpload"
                :auto="true"
                :customUpload="true"
            />

            <div v-if="currentFileName" class="file-info">
                Loaded: {{ currentFileName }}
            </div>
        </div>

        <div v-if="loading">Loading data...</div>

        <div v-if="data.length > 0">
            <div class="tables-container">
                <ExperimentList
                    :experiments="uniqueExperiments"
                    @selection-change="selectedChartExperiments = $event"
                />

                <DataTable
                    :value="data"
                    :paginator="true"
                    :rows="10"
                    :rowsPerPageOptions="[10, 20, 50]"
                    scrollable
                    scrollHeight="flex"
                    class="data-table"
                >
                    <Column field="experiment_id" header="Experiment ID" />
                    <Column field="metric_name" header="Metric" />
                    <Column field="step" header="Step" />
                    <Column field="value" header="Value" />
                </DataTable>
            </div>

            <ExperimentChart
                :data="data"
                :selectedExperiments="selectedChartExperiments"
            />
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { FileUpload } from "primevue";
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Papa from 'papaparse';
import ExperimentList from "./ExperimentList.vue";
import ExperimentChart from "./ExperimentChart.vue";

const data = ref([]);
const loading = ref(false);
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
            data.value = results.data;
            uniqueExperiments.value = [...new Set(results.data.map(item => item.experiment_id))];
            loading.value = false;
        },
        error: () => {
            loading.value = false;
        }
    });
};
</script>

<style scoped>
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

.tables-container {
    display: flex;
    gap: 1rem;
    margin: 1rem 0;
}

.data-table {
    flex: 1;
}
</style>