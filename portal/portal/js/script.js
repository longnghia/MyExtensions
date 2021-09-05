const row = Array.from(document.querySelectorAll("#tbDiemThiGK > tbody>tr"));
let scoreArray = [];
let subjectArray = [];
let timeArray = [];
row.forEach((sub, index) => {
  if (sub.children[5].innerText) {
    scoreArray.push(parseFloat(sub.children[5].innerText));
    subjectArray.push(sub.children[1].innerText.split("-")[1].trim());
    timeArray.push(sub.children[0].innerText);
  }
});

Highcharts.chart("container", {
  chart: {
    type: "line",
  },
  title: {
    text: "Điểm thi",
  },
  subtitle: {
    text: "Source: Portal",
  },

  xAxis: {
    categories: timeArray,
  },
  yAxis: {
    title: {
      text: "Scores",
    },
  },
  tooltip: {
    formatter: function () {
      return (
        '<div class="product">Sản phẩm: ' +
        this.series.name +
        "</div><br/> \
              Môn học: " +
        subjectArray[this.point.index] +
        '<br/> \
              <div class="seller">Học kỳ: ' +
        timeArray[this.point.index] +
        "</div><br/> \
              Điểm: <b>" +
        this.y.toLocaleString("vi") +
        "₫" +
        "</b>"
      );
    },
  },

  series: [
    {
      name: "Scores",
      data: scoreArray,
    },
  ],
});
