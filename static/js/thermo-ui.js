


function drawLine(ctx, x1, y1, x2, y2, color)
{
	ctx.fillStyle = color;
	ctx.strokeStyle = color;

	ctx.beginPath();

	ctx.moveTo(x1, y1);
	ctx.lineTo(x2, y2);
	ctx.stroke();	
}

function drawThermo(id, color, temperature)
{
	var canvas = document.getElementById(id);
	var width = canvas.width;
	var height = canvas.height;
	var ctx = canvas.getContext('2d');

	var x_interval = width / 4;
	var tiret10 = x_interval - 2;
	var tiret5 = tiret10 * 0.5;
	var tiret1 = tiret10 / 3;

	var y_interval = height / 10;
	var value = 50;

	ctx.clearRect(0, 0, width, height); 
	ctx.font = '14px sans-serif';
	ctx.textBaseline = 'middle';

	// Les graduations
	for (var i=1;i<10;i++) {
		var coul;

		if (i==6) coul = "rgb(0,0,0)"
		else if (i<6) coul = "rgb(255,0,0)"
		else coul = "rgb(0,0,255)";

		drawLine(ctx, x_interval * 1.5, i * y_interval, x_interval * 1.50 + tiret10, i * y_interval, coul);		
		if (value != -30 )
			drawLine(ctx, x_interval * 1.5, i * y_interval + y_interval / 2, x_interval * 1.50 + tiret5, i * y_interval + y_interval / 2 , coul);		

		if (value == 0) {
			ctx.save();
			ctx.font = '16px sans-serif';
			ctx.fillText(value, x_interval * 2.5, i * y_interval);
			ctx.restore();
		} else {
			ctx.fillText(value, x_interval * 2.5, i * y_interval);
		}
		value -= 10;
	}

	// Le verre
	ctx.strokeRect(x_interval * 0.5, y_interval * 0.5, x_interval, 9 * y_interval);
	
	// Le mercure
	ctx.fillStyle = "rgb(255,0,0)";
	ctx.fillRect(x_interval * 0.8, y_interval + y_interval * ( 50 - temperature) / 10, x_interval / 3, 8.5 * y_interval - y_interval * ( 50 - temperature) / 10);

	// La temperature en bas
	ctx.fillStyle = "rgb(0,0,0)";
	ctx.font = 'bold 14px sans-serif';
	ctx.textAlign = 'left';
	ctx.textBaseline = 'bottom';
	ctx.fillText(temperature + "°C", x_interval * 0.5, height);
}


function drawHisto(id, csv)
{
	var chart = new Highcharts.Chart({
	    title: {
	    	text: null
	    },
	    chart: {
	        renderTo: id
	    },
	    data : {
	    	csv: csv
	    },
		yAxis: {
            title: {
                text: 'Temperature (°C)'
            }
     	},
     
        yAxis: {
            title: {
                text: 'Temperature (°C)'
            },
            plotLines: [{
                value: 0,
                width: 1,
                color: '#808080'
            }]
        },
        tooltip: {
            valueSuffix: '°C'
        },	    
	});
}