<template>
    <div class="charts-container">
        <div v-if="!metricCharts.length" class="empty-state">
            Select experiments to display metrics
        </div>

        <div v-for="chart in metricCharts" :key="chart.metric" class="metric-chart">
            <h3>{{ chart.metric }}</h3>
            <Chart
                type="line"
                :data="chart.chartData"
                :options="chart.options"
                :height="300"
            />
        </div>
    </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import Chart from 'primevue/chart';

const props = defineProps({
    data: Array,
    selectedExperiments: Array
});

const lineColors = ['#42A5F5', '#66BB6A', '#FFA726', '#AB47BC', '#FF7043'];
const metricCharts = ref([]);
const DOWNSAMPLE_FACTOR = 10; // Берем каждую 10-ю точку

// Функция для интеллектуального даунсэмплинга
const downsampleData = (points, factor) => {
    if (points.length <= 1000) return points; // Не даунсэмплим если точек мало

    const result = [];
    const step = Math.max(1, Math.floor(points.length / (points.length / factor)));
    result.push(points[0]);

    for (let i = step; i < points.length; i += step) {
        const segment = points.slice(i - step, i);
        const max = segment.reduce((a, b) => a.y > b.y ? a : b);
        const min = segment.reduce((a, b) => a.y < b.y ? a : b);

        if (max.x !== min.x) {
            result.push(max, min);
        } else {
            result.push(max);
        }
    }

    result.push(points[points.length - 1]);
    return result;
};

const prepareChartData = () => {
    if (!props.selectedExperiments?.length) {
        metricCharts.value = [];
        return;
    }

    const metricsData = {};

    props.data.forEach(item => {
        if (!props.selectedExperiments.includes(item.experiment_id)) return;
        if (!item.metric_name || item.step == null || item.value == null) return;

        const step = typeof item.step === 'string' ? parseFloat(item.step) : Number(item.step);
        const value = typeof item.value === 'string' ? parseFloat(item.value) : Number(item.value);

        if (isNaN(step) || isNaN(value)) return;

        const metric = item.metric_name;
        const expId = item.experiment_id;

        metricsData[metric] ??= {};
        metricsData[metric][expId] ??= [];
        metricsData[metric][expId].push({ x: step, y: value });
    });

    metricCharts.value = Object.entries(metricsData).map(([metric, expData]) => {
        const datasets = Object.entries(expData).map(([expId, points], index) => {
            const sortedPoints = points.sort((a, b) => a.x - b.x);
            const downsampled = downsampleData(sortedPoints, DOWNSAMPLE_FACTOR);

            return {
                label: `Exp ${expId}`,
                borderColor: lineColors[index % lineColors.length],
                backgroundColor: 'transparent',
                borderWidth: 2,
                pointRadius: 0,
                data: downsampled
            };
        });

        return {
            metric,
            chartData: { datasets },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        title: { display: true, text: 'Metric Value' },
                        beginAtZero: false
                    },
                    x: {
                        title: { display: true, text: 'Step' },
                        type: 'linear'
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                return `${context.dataset.label}: ${context.parsed.y.toFixed(4)} at step ${context.parsed.x}`;
                            }
                        }
                    },
                    decimation: {
                        enabled: true,
                        algorithm: 'min-max'
                    }
                }
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

<style scoped>
.charts-container {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.metric-chart {
    background: #1e1e1e;
    border-radius: 8px;
    padding: 1rem;
}

.empty-state {
    padding: 1rem;
    text-align: center;
    color: #888;
}
</style>