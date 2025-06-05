let barChart;
let chartData;

export function initChart(dataType = "Temperature (°C)") {
  document.getElementById('diagramm').style.display="block";
  if (barChart) {
    barChart.destroy();
  }

  chartData = {
    labels: [],
    datasets: [
      {
        label: dataType,
        data: [],
        backgroundColor: "rgba(255, 99, 132, 0.5)",
        borderColor: "rgba(255, 99, 132, 1)",
        borderWidth: 1,
      },
    ],
  };

  const ctx = document.getElementById("diagramm").getContext("2d");

  barChart = new Chart(ctx, {
    type: "bar",
    data: chartData,
    options: {
      responsive: true,
      maintainAspectRatio: true,
      scales: {
        y: {
          beginAtZero: true,
          suggestedMax: 40,
          ticks: {
            stepSize: 1,
          },
        },
      },
    },
  });
}

export function addDatasetToChart(datasetArray) {
  datasetArray.forEach((data) => {
    if (data.attributes.ts && typeof data.attributes.temp === "number") {
      chartData.labels.push(data.attributes.ts);
      chartData.datasets[0].data.push(data.attributes.temp);
    }
  });
  barChart.update();
}
