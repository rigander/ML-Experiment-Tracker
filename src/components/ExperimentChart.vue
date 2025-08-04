<script setup>
import { ref, watch, computed } from 'vue';
import Chart from 'primevue/chart';

const props = defineProps({
    data: Array,
    selectedExperiments: Array
});

const lineColors = [
    '#42A5F5', '#66BB6A', '#FFA726', '#AB47BC',
    '#FF7043', '#26C6DA', '#D4E157', '#5C6BC0',
    '#EC407A', '#8D6E63'
];

const chartOptions = ref({
    responsive: true,
    maintainAspectRatio: false,
    scales: {
        y: {
            title: { display: true, text: 'Metric Value' }
        },
        x: {
            title: { display: true, text: 'Step' }
        }
    },
    plugins: {
        legend: {
            display: true,
            position: 'top',
            labels: {
                color: '#ffffff'
            }
        },
        tooltip: {
            mode: 'index',
            intersect: false
        }
    },
    interaction: {
        mode: 'nearest',
        axis: 'x',
        intersect: false
    }
});

const metricCharts = ref([]);

const prepareChartData = () => {
    if (!props.selectedExperiments || props.selectedExperiments.length === 0) {
        metricCharts.value = [];
        return;
    }

    // Группируем данные сначала по метрикам, затем по экспериментам
    const metricsData = {};

    props.data.forEach(item => {
        if (!props.selectedExperiments.includes(item.experiment_id)) return;
        if (!item.metric_name || item.step === '' || item.value === '') return;

        const metric = item.metric_name;
        const expId = item.experiment_id;

        if (!metricsData[metric]) {
            metricsData[metric] = {};
        }

        if (!metricsData[metric][expId]) {
            metricsData[metric][expId] = [];
        }

        metricsData[metric][expId].push({
            x: Number(item.step),
            y: Number(item.value)
        });
    });

    // Формируем данные для каждого графика метрики
    metricCharts.value = Object.entries(metricsData).map(([metric, expData], metricIndex) => {
        const datasets = Object.entries(expData).map(([expId, points], expIndex) => ({
            label: `Exp ${expId}`,
            borderColor: lineColors[expIndex % lineColors.length],
            backgroundColor: lineColors[expIndex % lineColors.length],
            fill: false,
            tension: 0.1,
            pointRadius: 3,
            pointHoverRadius: 5,
            data: points.sort((a, b) => a.x - b.x)
        }));

        return {
            metric,
            chartData: {
                datasets
            }
        };
    });
};

watch(
    () => [props.data, props.selectedExperiments],
    prepareChartData,
    { deep: true, immediate: true }
);
</script>

<template>
    <div class="charts-container">
        <div v-if="metricCharts.length === 0" class="empty-state">
            Select experiments to display metrics
        </div>

        <div v-for="chart in metricCharts" :key="chart.metric" class="metric-chart">
            <h3>{{ chart.metric }}</h3>
            <div class="chart-wrapper">
                <Chart
                    type="line"
                    :data="chart.chartData"
                    :options="chartOptions"
                />
            </div>
        </div>
    </div>
</template>

<style scoped>
.charts-container {
    margin-top: 2rem;
    display: flex;
    flex-direction: column;
    gap: 2rem;
}

.metric-chart {
    background: #1e1e1e;
    border-radius: 8px;
    padding: 1rem;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.4);
}

.chart-wrapper {
    height: 400px;
    position: relative;
}

h3 {
    color: white;
    margin: 0 0 1rem 0;
    font-size: 1.2rem;
}

.empty-state {
    padding: 2rem;
    text-align: center;
    color: #888;
    font-style: italic;
}
</style>