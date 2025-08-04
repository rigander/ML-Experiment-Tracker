<script setup>
import { ref, watch, computed } from 'vue';
import Chart from 'primevue/chart';

const props = defineProps({
    data: Array,
    selectedExperiments: Array
});

// Конфигурация для оптимизации
const MAX_POINTS_PER_LINE = 500; // Максимум точек на линию
const DOWN_SAMPLE_FACTOR = 5; // Прореживание данных

const lineColors = [
    '#42A5F5', '#66BB6A', '#FFA726', '#AB47BC',
    '#FF7043', '#26C6DA', '#D4E157', '#5C6BC0',
    '#EC407A', '#8D6E63'
];

const chartOptions = ref({
    responsive: true,
    maintainAspectRatio: false,
    animation: {
        duration: 0 // Отключаем анимацию для производительности
    },
    scales: {
        y: {
            title: { display: true, text: 'Metric Value' }
        },
        x: {
            title: { display: true, text: 'Step' },
            type: 'linear'
        }
    },
    plugins: {
        legend: {
            display: true,
            position: 'top'
        },
        decimation: { // Встроенное прореживание данных в Chart.js
            enabled: true,
            algorithm: 'min-max'
        }
    }
});

const metricCharts = ref([]);

// Функция для прореживания точек данных
const downsampleData = (points, maxPoints) => {
    if (points.length <= maxPoints) return points;

    const step = Math.ceil(points.length / maxPoints);
    const result = [];

    // Берем каждую step-точку + сохраняем важные точки (минимумы/максимумы)
    for (let i = 0; i < points.length; i += step) {
        result.push(points[i]);
    }

    return result;
};

const prepareChartData = () => {
    if (!props.selectedExperiments || props.selectedExperiments.length === 0) {
        metricCharts.value = [];
        return;
    }

    const metricsData = {};

    props.data.forEach(item => {
        if (!props.selectedExperiments.includes(item.experiment_id)) return;
        if (!item.metric_name || item.step === '' || item.value === '') return;

        const step = Number(item.step);
        if (isNaN(step)) return;

        const metric = item.metric_name;
        const expId = item.experiment_id;
        const value = Number(item.value);

        metricsData[metric] ??= {};
        metricsData[metric][expId] ??= [];
        metricsData[metric][expId].push({ x: step, y: value });
    });

    metricCharts.value = Object.entries(metricsData).map(([metric, expData]) => {
        const datasets = Object.entries(expData).map(([expId, points], expIndex) => {
            const sortedPoints = [...points].sort((a, b) => a.x - b.x);
            const downsampled = downsampleData(sortedPoints, MAX_POINTS_PER_LINE);

            return {
                label: `Exp ${expId}`,
                borderColor: lineColors[expIndex % lineColors.length],
                backgroundColor: 'transparent',
                borderWidth: 1,
                pointRadius: 0, // Не показываем точки для производительности
                pointHoverRadius: 3,
                data: downsampled
            };
        });

        return { metric, chartData: { datasets } };
    });
};

// Используем debounce для обработки изменений
let prepareTimeout = null;
watch(
    () => [props.data, props.selectedExperiments],
    () => {
        clearTimeout(prepareTimeout);
        prepareTimeout = setTimeout(prepareChartData, 200);
    },
    { deep: true }
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