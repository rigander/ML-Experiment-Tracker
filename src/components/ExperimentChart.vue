<script setup>
import { ref, onMounted, watch } from 'vue';
import * as echarts from 'echarts';

const props = defineProps({
    data: Array,
    selectedExperiments: Array
});

const chart = ref(null);
let chartInstance = null;

const initChart = () => {
    if (chartInstance) chartInstance.dispose();
    chartInstance = echarts.init(chart.value, null, { renderer: 'canvas' });
    updateChart();
};

const updateChart = () => {
    if (!chartInstance) return;

    const filteredData = props.data.filter(item =>
        props.selectedExperiments.includes(item.experiment_id)
    );

    const experimentsData = {};
    filteredData.forEach(item => {
        if (!experimentsData[item.experiment_id]) experimentsData[item.experiment_id] = [];
        experimentsData[item.experiment_id].push(item);
    });

    const series = [];
    const legendData = [];

    Object.entries(experimentsData).forEach(([expId, values]) => {
        values.sort((a, b) => a.step - b.step);
        series.push({
            name: `Experiment ${expId}`,
            type: 'line',
            data: values.map(v => [v.step, v.value]),
            symbol: 'none',
            lineStyle: {
                width: 2
            }
        });
        legendData.push(`Experiment ${expId}`);
    });

    chartInstance.setOption({
        backgroundColor: '#1e1e1e',
        tooltip: {
            trigger: 'axis',
            textStyle: { color: '#fff' },
            backgroundColor: '#333'
        },
        legend: {
            data: legendData,
            textStyle: { color: '#eee' },
            bottom: 10
        },
        grid: {
            left: '5%',
            right: '5%',
            bottom: '18%',
            top: '8%',
            containLabel: true
        },
        xAxis: {
            type: 'value',
            name: 'Step',
            nameLocation: 'middle',
            nameGap: 25,
            axisLine: { lineStyle: { color: '#888' } },
            axisLabel: { color: '#ccc' },
            nameTextStyle: { color: '#aaa' },
            splitLine: { lineStyle: { color: '#333' } }
        },
        yAxis: {
            type: 'value',
            name: 'Value',
            nameLocation: 'middle',
            nameGap: 35,
            axisLine: { lineStyle: { color: '#888' } },
            axisLabel: { color: '#ccc' },
            nameTextStyle: { color: '#aaa' },
            splitLine: { lineStyle: { color: '#333' } }
        },
        series
    });
    chartInstance.resize();
};

onMounted(initChart);

watch(() => props.selectedExperiments, updateChart, { deep: true });
watch(() => props.data, updateChart, { deep: true });
</script>

<template>
    <div class="chart-container">
        <div ref="chart" class="chart"></div>
    </div>
</template>

<style scoped>
.chart-container {
    width: 100%;
    margin-top: 2rem;
    padding: 1rem;
    background: #1e1e1e;
    border-radius: 8px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.4);
}

.chart {
    width: 100%;
    height: 400px;
}
</style>
