<script setup>
import { ref, computed } from 'vue';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';

const props = defineProps({
    experiments: {
        type: Array,
        required: true
    }
});

const selectedExperiments = ref([]);

const emit = defineEmits(['selection-change']);

const onSelectionChange = (e) => {
    selectedExperiments.value = e.value;
    emit('selection-change', e.value);
};
</script>

<template>
    <div class="experiments-list">
        <h3>Experiments List</h3>
        <DataTable
                :value="props.experiments.map(id => ({ experiment_id: id }))"
                v-model:selection="selectedExperiments"
                selectionMode="multiple"
                dataKey="experiment_id"
                class="small-table"
        >
            <Column selectionMode="multiple" headerStyle="width: 3rem"></Column>
            <Column field="experiment_id" header="Experiment ID"></Column>
        </DataTable>
    </div>
</template>

<style scoped>
.experiments-list {
    flex: 0 0 300px;
    padding: 1rem;
    border-radius: 4px;
    margin-right: 1rem;
    height: 100%;
    display: flex;
    flex-direction: column;
}
.small-table {
    flex-grow: 1;
    overflow: hidden;

    :deep(.p-datatable-wrapper) {
        height: 100%;
        overflow: auto;
    }
}
h3 {
    margin-top: 0;
    margin-bottom: 1rem;
    color: #333;
}
</style>